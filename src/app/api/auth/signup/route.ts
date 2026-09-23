import { NextResponse } from "next/server";
import { userRepo } from "@/lib/supabase-db";
import { hashPassword, signSession } from "@/lib/auth/security";
import { sanitizeAvatarForCookie } from "@/lib/auth/roles";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password, tuning, experience, isSeller } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Kata sandi minimal 6 karakter." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const userRole: "BUYER" | "SELLER" | "ADMIN" = isSeller ? "SELLER" : "BUYER";
    const hashedPassword = hashPassword(password);

    const dbUser = await userRepo.upsert({
      email: cleanEmail,
      name: name || cleanEmail.split("@")[0],
      role: userRole,
      tuningPreference: tuning || "Reference / Neutral",
      passwordHash: hashedPassword,
    });

    const userSession = {
      id: dbUser.id,
      email: cleanEmail,
      name: dbUser.name || name || cleanEmail.split("@")[0],
      avatar: sanitizeAvatarForCookie(dbUser.avatar),
      role: dbUser.role || userRole,
      isSeller: isSeller || false,
      sellerStatus: isSeller ? "PENDING_APPROVAL" : "NONE",
      tuning: tuning || "Reference / Neutral",
      experience: experience || "Intermediate / Audiophile",
      createdAt: dbUser.createdAt || new Date().toISOString(),
    };

    const signedToken = signSession(userSession);

    const response = NextResponse.json({
      success: true,
      message: "Registrasi berhasil!",
      user: userSession,
    });

    response.cookies.set("tonalzone_session", encodeURIComponent(signedToken), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan internal." },
      { status: 500 }
    );
  }
}
