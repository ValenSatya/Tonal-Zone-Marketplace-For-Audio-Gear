import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { returnRepo, storeRepo, userRepo } from "@/lib/supabase-db";

async function resolveSellerStore(request: Request) {
  const { searchParams } = new URL(request.url);
  const explicitStoreId = searchParams.get("storeId");
  const explicitEmail = searchParams.get("email") || searchParams.get("sellerEmail");

  if (explicitStoreId) {
    const store = await storeRepo.findById(explicitStoreId);
    if (store) return store;
  }

  if (explicitEmail) {
    const user = await userRepo.findByEmail(explicitEmail);
    if (user?.store) return user.store;
  }

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("tonalzone_session");
    if (sessionCookie) {
      const session = JSON.parse(decodeURIComponent(sessionCookie.value));
      if (session.storeId) {
        const store = await storeRepo.findById(session.storeId);
        if (store) return store;
      }
      if (session.email) {
        const user = await userRepo.findByEmail(session.email);
        if (user?.store) return user.store;
      }
    }
  } catch (e) {}

  const moondropStore = await storeRepo.findById("store-moondrop-official");
  if (moondropStore) return moondropStore;

  return null;
}

export async function GET(request: Request) {
  try {
    const store = await resolveSellerStore(request);
    const storeId = store?.id || "store-moondrop-official";

    const returns = await returnRepo.findByStoreId(storeId);
    return NextResponse.json({
      success: true,
      storeId,
      storeName: store?.storeName || "MOONDROP Official Flagship Store",
      returns,
    });
  } catch (error: any) {
    console.error("Error fetching seller returns:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil daftar retur toko." },
      { status: 500 }
    );
  }
}
