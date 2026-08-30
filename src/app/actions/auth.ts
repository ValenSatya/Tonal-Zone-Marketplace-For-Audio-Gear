"use server";

import { userRepo } from "@/lib/supabase-db";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export interface AuthSessionResponse {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: "BUYER" | "SELLER" | "ADMIN" | "BRAND";
    isSeller: boolean;
    sellerStatus: string;
    avatar?: string;
    tuning?: string;
    location?: string;
    language?: string;
  };
}

export async function signUpUser(data: {
  fullName: string;
  email: string;
  passwordRaw: string;
  location: string;
  language: string;
  tuningPreference: string;
  experienceLevel?: string;
}): Promise<AuthSessionResponse> {
  try {
    const email = data.email.trim().toLowerCase();
    const password = data.passwordRaw;

    if (!email || !password) {
      return { success: false, error: "Email dan kata sandi wajib diisi." };
    }

    if (password.length < 6) {
      return { success: false, error: "Kata sandi minimal 6 karakter." };
    }

    const supabase = await createClient();

    // 1. Sign up user using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: data.fullName.trim() || email.split("@")[0],
          location: data.location,
          language: data.language,
          tuning_preference: data.tuningPreference,
          experience_level: data.experienceLevel,
        },
      },
    });

    let userId = authData?.user?.id;

    // If Supabase user already exists, try logging in
    if (authError) {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError || !loginData.user) {
        return { success: false, error: authError.message || "Gagal membuat akun Supabase." };
      }
      userId = loginData.user.id;
    }

    if (!userId) {
      userId = "usr-" + Date.now();
    }

    // 2. Safe upsert into Supabase database
    const dbUser = await userRepo.upsert({
      id: userId,
      email,
      name: data.fullName.trim() || email.split("@")[0],
      location: data.location || "Indonesia",
      language: data.language || "id",
      tuningPreference: data.tuningPreference || "Reference / Neutral",
      role: email.includes("admin") ? "ADMIN" : email.includes("seller") ? "SELLER" : "BUYER",
    });

    const sessionPayload = {
      id: dbUser.id,
      name: dbUser.name || data.fullName.trim() || email.split("@")[0],
      email,
      avatar: dbUser.avatar || "/placeholder.svg",
      role: (dbUser.role || "BUYER") as any,
      isSeller: dbUser.role === "SELLER" || dbUser.store?.status === "APPROVED",
      sellerStatus: dbUser.store?.status || "NONE",
      tuning: dbUser.tuningPreference || data.tuningPreference,
      experienceLevel: data.experienceLevel || "Intermediate",
      location: dbUser.location || data.location,
      language: dbUser.language || data.language,
    };

    const cookieStore = await cookies();
    cookieStore.set("tonalzone_session", encodeURIComponent(JSON.stringify(sessionPayload)), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return {
      success: true,
      user: sessionPayload,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Terjadi kesalahan saat mendaftar.";
    console.error("Sign up error:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

export async function signInUser(data: { email: string; passwordRaw: string }): Promise<AuthSessionResponse> {
  try {
    const email = data.email.trim().toLowerCase();
    const password = data.passwordRaw;

    if (!email || !password) {
      return { success: false, error: "Email dan kata sandi wajib diisi." };
    }

    const supabase = await createClient();

    // 1. Supabase Auth attempt
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    let userId = authData?.user?.id;
    let authUserMeta = authData?.user?.user_metadata || {};

    if (authError || !authData.user) {
      // Check database fallback
      const dbFallback = await userRepo.findByEmail(email);
      if (dbFallback) {
        userId = dbFallback.id;
      } else {
        return { success: false, error: authError?.message || "Email atau kata sandi tidak cocok." };
      }
    }

    // 2. Fetch or Auto-Heal Profile in Supabase Database
    let dbUser = await userRepo.findByEmail(email);
    if (!dbUser && userId) {
      dbUser = await userRepo.upsert({
        id: userId,
        email,
        name: authUserMeta.full_name || authUserMeta.name || email.split("@")[0],
        role: email.includes("admin") ? "ADMIN" : email.includes("tangzu") || email.includes("seller") ? "SELLER" : "BUYER",
        location: authUserMeta.location || "Indonesia",
        language: authUserMeta.language || "id",
        tuningPreference: authUserMeta.tuning_preference || "Reference / Neutral",
      });
    }

    const role = (dbUser?.role || (email.includes("admin") ? "ADMIN" : email.includes("seller") ? "SELLER" : "BUYER")) as any;
    const isSeller = role === "SELLER" || dbUser?.store?.status === "APPROVED";

    const sessionPayload = {
      id: dbUser?.id || userId || "usr-" + Date.now(),
      name: dbUser?.name || authUserMeta.full_name || email.split("@")[0],
      email,
      avatar: dbUser?.avatar || "/placeholder.svg",
      role,
      isSeller,
      sellerStatus: dbUser?.store?.status || (isSeller ? "APPROVED" : "NONE"),
      tuning: dbUser?.tuningPreference || "Reference / Neutral",
      location: dbUser?.location || "Indonesia",
      language: dbUser?.language || "id",
    };

    const cookieStore = await cookies();
    cookieStore.set("tonalzone_session", encodeURIComponent(JSON.stringify(sessionPayload)), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return {
      success: true,
      user: sessionPayload,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Terjadi kesalahan saat login.";
    console.error("Sign in error:", errorMsg);
    return { success: false, error: errorMsg };
  }
}
