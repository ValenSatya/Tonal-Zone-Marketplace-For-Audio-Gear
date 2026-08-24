import { NextResponse } from "next/server";
import { userRepo } from "@/lib/supabase-db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password, tuning, experience, isSeller } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const userRole: "BUYER" | "SELLER" | "ADMIN" = isSeller ? "SELLER" : "BUYER";

    const dbUser = await userRepo.upsert({
      email: cleanEmail,
      name: name || cleanEmail.split("@")[0],
      role: userRole,
      tuningPreference: tuning || "Reference / Neutral",
    });

    const userSession = {
      id: dbUser.id,
      email: cleanEmail,
      name: dbUser.name || name || cleanEmail.split("@")[0],
      avatar: dbUser.avatar || "/placeholder.svg",
      role: dbUser.role || userRole,
      isSeller: isSeller || false,
      sellerStatus: isSeller ? "PENDING_APPROVAL" : "NONE",
      tuning: tuning || "Reference / Neutral",
      experience: experience || "Intermediate / Audiophile",
      createdAt: dbUser.createdAt || new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil!",
      user: userSession,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan internal." },
      { status: 500 }
    );
  }
}
