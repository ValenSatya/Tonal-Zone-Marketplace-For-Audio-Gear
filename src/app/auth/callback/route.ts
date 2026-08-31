import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { userRepo } from "@/lib/supabase-db";
import { cookies } from "next/headers";

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

      // Upsert into Supabase database
      const dbUser = await userRepo.upsert({
        id: user.id,
        email,
        name: fullName,
        avatar,
        location: meta.location || "Indonesia",
        language: meta.language || "id",
        tuningPreference: meta.tuning_preference || "Reference / Neutral",
        role: email.includes("admin") ? "ADMIN" : email.includes("seller") ? "SELLER" : "BUYER",
      });

      const sessionPayload = {
        id: dbUser.id,
        name: dbUser.name || fullName,
        email,
        avatar: dbUser.avatar || avatar,
        role: (dbUser.role || "BUYER") as any,
        isSeller: dbUser.role === "SELLER" || dbUser.store?.status === "APPROVED",
        sellerStatus: dbUser.store?.status || "NONE",
        tuning: dbUser.tuningPreference || "Reference / Neutral",
        experienceLevel: meta.experience_level || "Intermediate",
        location: dbUser.location || "Indonesia",
        language: dbUser.language || "id",
      };

      const cookieStore = await cookies();
      cookieStore.set("tonalzone_session", encodeURIComponent(JSON.stringify(sessionPayload)), {
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
