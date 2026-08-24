import { NextResponse } from "next/server";
import { userRepo, storeRepo, brandRepo } from "@/lib/supabase-db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      storeName,
      storeSlug,
      storeCity,
      authorizedBrands,
      newBrandRequest,
      bankInfo,
    } = body;

    if (!email || !storeName) {
      return NextResponse.json(
        { success: false, error: "Email dan nama toko wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Ensure user exists
    const user = await userRepo.upsert({
      email: cleanEmail,
      name: cleanEmail.split("@")[0],
      role: "BUYER",
    });

    // 2. Create or update store with PENDING status
    let store = await storeRepo.findByUserId(user.id);
    if (!store) {
      store = await storeRepo.create({
        userId: user.id,
        storeName,
        description: `${storeCity} | Bank: ${bankInfo?.bank || "BCA"} - ${bankInfo?.accountNumber || ""} (${bankInfo?.holderName || ""})`,
        address: storeCity,
        status: "PENDING",
        bankName: bankInfo?.bank || "BCA",
        bankAccount: bankInfo?.accountNumber || "",
      });
    }

    const storeId = store?.id || "store-" + Date.now();

    // 3. If there is a new brand request, add to Brand queue
    if (newBrandRequest && newBrandRequest.name) {
      await brandRepo.upsert(newBrandRequest.name, storeId);
    }

    // Return success response conforming to PRD (PENDING_APPROVAL)
    return NextResponse.json({
      success: true,
      message: "Pendaftaran toko berhasil dikirim untuk tinjauan Admin.",
      store: {
        id: storeId,
        storeName,
        storeSlug: storeSlug || storeName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        storeCity,
        authorizedBrands: authorizedBrands || [],
        newBrandRequest: newBrandRequest || null,
        bankInfo: bankInfo || null,
        status: "PENDING_APPROVAL",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan internal." },
      { status: 500 }
    );
  }
}
