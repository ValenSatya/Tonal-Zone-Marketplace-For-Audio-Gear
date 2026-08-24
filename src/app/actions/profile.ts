"use server";

import { userRepo } from "@/lib/supabase-db";
import { cookies } from "next/headers";

export interface UpdateProfileInput {
  email?: string;
  name?: string;
  avatar?: string;
  location?: string;
  language?: string;
  tuningPreference?: string;
  gear?: string;
}

export async function updateUserProfile(data: UpdateProfileInput) {
  try {
    const cookieStore = await cookies();
    let currentSession: any = null;

    const rawSession = cookieStore.get("tonalzone_session")?.value;
    if (rawSession) {
      try {
        currentSession = JSON.parse(decodeURIComponent(rawSession));
      } catch {
        currentSession = null;
      }
    }

    const email = (data.email || currentSession?.email || "").trim().toLowerCase();

    if (!email) {
      return { success: false, error: "Email pengguna tidak teridentifikasi." };
    }

    // 1. Update in Supabase Database directly
    let dbUser = await userRepo.findByEmail(email);

    if (dbUser) {
      dbUser = await userRepo.update(email, {
        name: data.name !== undefined ? data.name : dbUser.name || undefined,
        avatar: data.avatar !== undefined ? data.avatar : dbUser.avatar || undefined,
        location: data.location !== undefined ? data.location : dbUser.location || undefined,
        language: data.language !== undefined ? data.language : dbUser.language || undefined,
        tuningPreference: data.tuningPreference !== undefined ? data.tuningPreference : dbUser.tuningPreference || undefined,
      });
    } else {
      dbUser = await userRepo.upsert({
        email,
        name: data.name || email.split("@")[0],
        avatar: data.avatar || "/placeholder.svg",
        location: data.location || "Indonesia",
        language: data.language || "id",
        tuningPreference: data.tuningPreference || "Reference / Neutral",
        role: email.includes("admin") ? "ADMIN" : email.includes("seller") ? "SELLER" : "BUYER",
      });
    }

    // 2. Build updated session payload
    const updatedSession = {
      id: dbUser?.id || currentSession?.id || "usr-" + Date.now(),
      name: data.name ?? dbUser?.name ?? currentSession?.name ?? email.split("@")[0],
      email,
      avatar: data.avatar ?? dbUser?.avatar ?? currentSession?.avatar ?? "/placeholder.svg",
      role: dbUser?.role || currentSession?.role || "BUYER",
      isSeller: dbUser?.role === "SELLER" || dbUser?.store?.status === "APPROVED" || currentSession?.isSeller || false,
      sellerStatus: dbUser?.store?.status || currentSession?.sellerStatus || "NONE",
      tuning: data.tuningPreference ?? dbUser?.tuningPreference ?? currentSession?.tuning ?? "Reference / Neutral",
      gear: data.gear ?? currentSession?.gear ?? "Dedicated DAC/AMP",
      location: data.location ?? dbUser?.location ?? currentSession?.location ?? "Indonesia",
      language: data.language ?? dbUser?.language ?? currentSession?.language ?? "id",
    };

    // 3. Persist to server cookies for SSR and middleware
    cookieStore.set("tonalzone_session", encodeURIComponent(JSON.stringify(updatedSession)), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return {
      success: true,
      message: "Profil dan foto berhasil diperbarui!",
      user: updatedSession,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Gagal memperbarui profil pengguna.";
    console.error("updateUserProfile error:", error);
    return { success: false, error: errorMsg };
  }
}
