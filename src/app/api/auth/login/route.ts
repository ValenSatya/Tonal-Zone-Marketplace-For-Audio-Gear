import { NextResponse } from "next/server";
import { userRepo, extractBrandFromStoreName } from "@/lib/supabase-db";
import { sanitizeAvatarForCookie } from "@/lib/auth/roles";
import { verifyPassword, hashPassword, signSession } from "@/lib/auth/security";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const dbUser = await userRepo.findByEmail(cleanEmail);

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "Akun dengan email ini tidak ditemukan." },
        { status: 404 }
      );
    }

    // --- SECURE PASSWORD VERIFICATION ---
    if (dbUser.passwordHash) {
      const isPasswordValid = verifyPassword(password, dbUser.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: "Kata sandi salah. Silakan periksa kembali kata sandi Anda." },
          { status: 401 }
        );
      }
    } else {
      // Legacy seed user auto-upgrade: hash and store password for future logins
      const newHash = hashPassword(password);
      await userRepo.updatePassword(cleanEmail, newHash);
    }

    let storeStatus = "NONE";
    let isSeller = false;

    if (dbUser.store) {
      storeStatus = dbUser.store.status;
      isSeller = dbUser.store.status === "APPROVED" || dbUser.role === "SELLER";
    } else if (dbUser.role === "SELLER") {
      isSeller = true;
      storeStatus = "APPROVED";
    }

    const detectedBrand = extractBrandFromStoreName(dbUser?.store?.storeName, cleanEmail);
    const isSpecialOfficial =
      cleanEmail === "valenandrasatya@gmail.com" ||
      (cleanEmail.endsWith("@tonalzone.id") && Boolean(detectedBrand)) ||
      cleanEmail === "seller@soundstage.id";

    const isOfficialBrand =
      dbUser?.store?.storeType === "OFFICIAL_BRAND" ||
      isSpecialOfficial;

    if (isSpecialOfficial) {
      isSeller = true;
      storeStatus = "APPROVED";
    }

    const resolvedStoreType = isOfficialBrand
      ? "OFFICIAL_BRAND"
      : dbUser?.store
      ? "RETAIL_MERCHANT"
      : null;

    const resolvedBrandName = isOfficialBrand
      ? detectedBrand || dbUser?.store?.brandName || "MOONDROP"
      : null;

    const finalRole = isSeller
      ? (dbUser?.role === "ADMIN" ? "ADMIN" : "SELLER")
      : (dbUser?.role || (cleanEmail.includes("admin") ? "ADMIN" : "BUYER"));

    const userSession = {
      id: dbUser.id,
      email: cleanEmail,
      name: dbUser.name || cleanEmail.split("@")[0],
      avatar: sanitizeAvatarForCookie(dbUser.avatar),
      role: finalRole,
      isSeller,
      sellerStatus: storeStatus,
      storeId: dbUser?.store?.id || (isOfficialBrand ? (detectedBrand ? `store-${detectedBrand.toLowerCase()}-official` : "store-moondrop-official") : null),
      storeName: dbUser?.store?.storeName || (isOfficialBrand ? `${resolvedBrandName || "MOONDROP"} Official Flagship Store` : null),
      storeType: resolvedStoreType,
      brandName: resolvedBrandName,
      tuning: dbUser?.tuningPreference || "Reference / Neutral",
      experience: "Intermediate / Audiophile",
      createdAt: dbUser?.createdAt || new Date().toISOString(),
    };

    const signedToken = signSession(userSession);

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil!",
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
