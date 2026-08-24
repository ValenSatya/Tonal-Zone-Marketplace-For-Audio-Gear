import { NextResponse } from "next/server";
import { userRepo } from "@/lib/supabase-db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const dbUser = await userRepo.findByEmail(cleanEmail);

    let storeStatus = "NONE";
    let isSeller = false;

    if (dbUser) {
      if (dbUser.store) {
        storeStatus = dbUser.store.status;
        isSeller = dbUser.store.status === "APPROVED" || dbUser.role === "SELLER";
      } else if (dbUser.role === "SELLER") {
        isSeller = true;
        storeStatus = "APPROVED";
      }
    }

    const userSession = {
      id: dbUser?.id || "user-" + Date.now(),
      email: cleanEmail,
      name: dbUser?.name || cleanEmail.split("@")[0],
      avatar: dbUser?.avatar || "/placeholder.svg",
      role: dbUser?.role || (isSeller ? "SELLER" : "BUYER"),
      isSeller,
      sellerStatus: storeStatus,
      tuning: dbUser?.tuningPreference || "Reference / Neutral",
      experience: "Intermediate / Audiophile",
      createdAt: dbUser?.createdAt || new Date().toISOString(),
    };

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil!",
      user: userSession,
    });

    response.cookies.set("tonalzone_session", encodeURIComponent(JSON.stringify(userSession)), {
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
