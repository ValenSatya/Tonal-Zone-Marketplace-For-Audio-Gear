import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { userRepo } from "@/lib/supabase-db";
import { cookies } from "next/headers";
import { sanitizeAvatarForCookie } from "@/lib/auth/roles";
import { signSession } from "@/lib/auth/security";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const flow = searchParams.get("flow") || "login";
  const next = searchParams.get("next") || searchParams.get("redirect") || "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;
      const meta = user.user_metadata || {};
      const fullName = meta.full_name || meta.name || user.email?.split("@")[0] || "Audiophile Member";
      const avatar = meta.avatar_url || meta.picture || "/placeholder.svg";
      const email = user.email || "";

      // Check existing user in DB first so we don't overwrite custom avatar, custom name, or role
      const existingUser = (await userRepo.findById(user.id)) || (await userRepo.findByEmail(email));

      const googleAvatar = meta.avatar_url || meta.picture;
      const isExistingPlaceholder = !existingUser?.avatar || existingUser.avatar === "/placeholder.svg" || existingUser.avatar.includes("placeholder");
      const finalAvatar = isExistingPlaceholder && googleAvatar ? googleAvatar : (existingUser?.avatar || googleAvatar || "/placeholder.svg");

      const isDefaultName = !existingUser?.name || existingUser.name === email.split("@")[0] || existingUser.name === "Audiophile Member";
      const finalName = isDefaultName && fullName ? fullName : (existingUser?.name || fullName);
      const finalTuning = existingUser?.tuningPreference || meta.tuning_preference || "Reference / Neutral";
      const finalLocation = existingUser?.location || meta.location || "Indonesia";
      const finalLanguage = existingUser?.language || meta.language || "id";
      const finalRole = existingUser?.role || (email.includes("admin") || email.includes("valenandra") ? "ADMIN" : email.endsWith("@tonalzone.id") || email === "seller@soundstage.id" ? "SELLER" : "BUYER");

      // Upsert into Supabase database
      const dbUser = await userRepo.upsert({
        id: user.id,
        email,
        name: finalName,
        avatar: finalAvatar,
        location: finalLocation,
        language: finalLanguage,
        tuningPreference: finalTuning,
        role: finalRole,
      });

      const isSeller = dbUser.role === "SELLER" || dbUser.store?.status === "APPROVED" || email.endsWith("@tonalzone.id") || email === "valenandrasatya@gmail.com" || email === "seller@soundstage.id";

      const sessionPayload = {
        id: dbUser.id,
        name: dbUser.name || finalName,
        email,
        avatar: sanitizeAvatarForCookie(dbUser.avatar || finalAvatar),
        role: (dbUser.role || finalRole) as any,
        isSeller,
        sellerStatus: dbUser.store?.status || (isSeller ? "APPROVED" : "NONE"),
        tuning: dbUser.tuningPreference || finalTuning,
        experienceLevel: meta.experience_level || "Intermediate",
        location: dbUser.location || finalLocation,
        language: dbUser.language || finalLanguage,
      };

      const signedToken = signSession(sessionPayload);
      const cookieStore = await cookies();
      cookieStore.set("tonalzone_session", encodeURIComponent(signedToken), {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });

      // If user came from signup flow, route to Step 2 Profile Setup
      if (flow === "signup") {
        return NextResponse.redirect(`${origin}/signup?step=2&google=true&redirect=${encodeURIComponent(next)}`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to login with error indicator if auth failed
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
