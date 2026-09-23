import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { returnRepo, storeRepo, userRepo } from "@/lib/supabase-db";
import { verifySession } from "@/lib/auth/security";

async function resolveSellerStore(request: Request) {
  const { searchParams } = new URL(request.url);
  const explicitStoreId = searchParams.get("storeId");
  const explicitEmail = searchParams.get("email") || searchParams.get("sellerEmail");

  if (explicitStoreId) {
    let store = await storeRepo.findById(explicitStoreId);
    if (!store) store = await storeRepo.findByUserId(explicitStoreId);
    if (!store) store = await storeRepo.findByName(explicitStoreId);
    if (store) return store;
  }

  if (explicitEmail) {
    const user = await userRepo.findByEmail(explicitEmail);
    if (user?.store) return user.store;
    if (user?.id) {
      const store = await storeRepo.findByUserId(user.id);
      if (store) return store;
    }
  }

  let hasActiveSession = false;
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("tonalzone_session");
    if (sessionCookie?.value) {
      const session = verifySession<{ id?: string; email?: string; storeId?: string }>(sessionCookie.value);
      if (session) {
        hasActiveSession = true;
        if (session.storeId) {
          const store = await storeRepo.findById(session.storeId);
          if (store) return store;
        }
        if (session.email) {
          const user = await userRepo.findByEmail(session.email);
          if (user?.store) return user.store;
          if (user?.id) {
            const store = await storeRepo.findByUserId(user.id);
            if (store) return store;
          }
        }
      }
    }
  } catch (e) {
    console.error("Error reading session in seller/returns:", e);
  }

  if (hasActiveSession) {
    return null;
  }

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
