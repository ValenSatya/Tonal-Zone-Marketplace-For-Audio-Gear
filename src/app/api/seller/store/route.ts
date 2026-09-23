import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storeRepo, userRepo, supabase } from "@/lib/supabase-db";
import { verifySession } from "@/lib/auth/security";

/**
 * Helper to resolve store from cookies or explicit params
 */
async function resolveCurrentStore(request: Request) {
  const { searchParams } = new URL(request.url);
  const explicitStoreId = searchParams.get("storeId");
  const explicitEmail = searchParams.get("email");

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

  // Check session cookie
  let hasActiveSession = false;
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("tonalzone_session");
    if (sessionCookie?.value) {
      const session = verifySession<{ id?: string; email?: string; storeId?: string; storeName?: string }>(sessionCookie.value);
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
    console.error("Error reading session cookie in seller/store:", e);
  }

  // If user is authenticated but has no store, do not leak another merchant's store
  if (hasActiveSession) {
    return null;
  }

  // Fallback ONLY for unauthenticated public browsing: Check default Moondrop official store or first store
  const moondropStore = await storeRepo.findById("store-moondrop-official");
  if (moondropStore) return moondropStore;

  const { data: stores } = await supabase.from("Store").select("*").limit(1);
  if (stores && stores.length > 0) {
    return await storeRepo.findById(stores[0].id);
  }

  return null;
}

/**
 * GET /api/seller/store
 * Fetch profile for the current seller's store.
 */
export async function GET(request: Request) {
  try {
    const store = await resolveCurrentStore(request);

    if (!store) {
      return NextResponse.json(
        { success: false, error: "Store not found" },
        { status: 404 }
      );
    }

    const isOfficialBrand = store.storeType === "OFFICIAL_BRAND";

    return NextResponse.json({
      success: true,
      store: {
        id: store.id,
        userId: store.userId,
        storeName: store.storeName,
        description: store.description,
        status: store.status,
        address: store.address || "Jakarta",
        bankName: store.bankName || "BCA",
        bankAccount: store.bankAccount || "",
        logo: store.logo || store.avatarUrl || null,
        banner: store.banner || store.bannerUrl || null,
        avatarUrl: store.avatarUrl || store.logo || null,
        bannerUrl: store.bannerUrl || store.banner || null,
        createdAt: store.createdAt,
        storeType: store.storeType || "RETAIL_MERCHANT",
        brandName: store.brandName || null,
        isOfficialBrand,
        // Brand-specific acoustic profile & reseller assets
        ...(isOfficialBrand
          ? {
              brandAcousticPhilosophy:
                "Moondrop Acoustic Laboratory adheres to scientific electroacoustic design based on the VDSF (Virtual Diffuse Sound Field) Target Curve, combining high-resolution beryllium and planar driver topologies with reference tonal accuracy.",
              tuningTargetCurve: "Moondrop VDSF Target 2024 / Harman Neutral IE",
              squiglinkUrl: "https://crinacle.com/graphs/iems/graphtool/",
              authorizedResellers: [
                { name: "Bass Audio Official Store", city: "Jakarta Pusat", verified: true },
                { name: "Kuping Sensi", city: "Bandung", verified: true },
                { name: "Inti Pratama Audio", city: "Surabaya", verified: true },
              ],
            }
          : {}),
      },
    });
  } catch (error: any) {
    console.error("[API /api/seller/store GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve store profile" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/seller/store
 * Update store profile & settings.
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      storeId: explicitStoreId,
      userId: explicitUserId,
      email: explicitEmail,
      storeName,
      description,
      address,
      bankName,
      bankAccount,
      nik,
      ktpUrl,
      logo,
      banner,
      avatarUrl,
      bannerUrl,
      storeAvatar,
      storeBanner,
    } = body;

    let targetStore = explicitStoreId ? await storeRepo.findById(explicitStoreId) : null;
    if (!targetStore && (explicitStoreId || explicitUserId)) {
      targetStore = await storeRepo.findByUserId(explicitStoreId || explicitUserId);
    }
    if (!targetStore && explicitEmail) {
      const user = await userRepo.findByEmail(explicitEmail);
      if (user?.id) {
        targetStore = await storeRepo.findByUserId(user.id);
      }
    }
    if (!targetStore && storeName) {
      targetStore = await storeRepo.findByName(storeName);
    }
    if (!targetStore) {
      targetStore = await resolveCurrentStore(request);
    }

    const finalLogo = logo !== undefined ? logo : (avatarUrl !== undefined ? avatarUrl : storeAvatar);
    const finalBanner = banner !== undefined ? banner : (bannerUrl !== undefined ? bannerUrl : storeBanner);

    if (!targetStore) {
      // If store still not found but email or userId provided, create store
      const user = explicitEmail
        ? await userRepo.findByEmail(explicitEmail)
        : explicitUserId
        ? await userRepo.findById(explicitUserId)
        : null;

      if (user) {
        targetStore = await storeRepo.create({
          userId: user.id,
          storeName: (storeName || user.name || "Seller Store").trim(),
          description: description || "",
          address: address || "Jakarta",
          bankName: bankName || "BCA",
          bankAccount: bankAccount || "",
          status: "APPROVED",
          logo: finalLogo || null,
          banner: finalBanner || null,
          avatarUrl: finalLogo || null,
          bannerUrl: finalBanner || null,
        });
      }
    }

    if (!targetStore) {
      return NextResponse.json(
        { success: false, error: "Store not found for update." },
        { status: 404 }
      );
    }

    const updates: any = {};
    if (storeName) updates.storeName = storeName.trim();
    if (description !== undefined) updates.description = description;
    if (address !== undefined) updates.address = address;
    if (bankName !== undefined) updates.bankName = bankName;
    if (bankAccount !== undefined) updates.bankAccount = bankAccount;
    if (nik !== undefined) updates.nik = nik;
    if (ktpUrl !== undefined) updates.ktpUrl = ktpUrl;
    if (finalLogo !== undefined) {
      updates.logo = finalLogo;
      updates.avatarUrl = finalLogo;
    }
    if (finalBanner !== undefined) {
      updates.banner = finalBanner;
      updates.bannerUrl = finalBanner;
    }

    const updated = await storeRepo.update(targetStore.id, updates);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Gagal memperbarui profil toko di Supabase." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profil toko berhasil diperbarui!",
      store: updated,
    });
  } catch (error: any) {
    console.error("[API /api/seller/store PATCH] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
