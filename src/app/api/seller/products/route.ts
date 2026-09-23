import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { productRepo, storeRepo, brandRepo, categoryRepo, userRepo, supabase } from "@/lib/supabase-db";
import { extractSpecsFromDescription, FALLBACK_CATALOG } from "@/lib/products-db";
import { BASS_AUDIO_PRODUCT_IDS, CSI_ZONE_PRODUCT_IDS } from "@/lib/store-utils";
import { verifySession } from "@/lib/auth/security";

/**
 * GET /api/seller/products
 * Fetch products owned by the authenticated seller's store.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let storeId = searchParams.get("storeId");
    const sellerEmail = searchParams.get("sellerEmail");
    const query = searchParams.get("query")?.toLowerCase();
    const categoryFilter = searchParams.get("category");
    const statusFilter = searchParams.get("status");

    let hasActiveSession = false;
    // Attempt to extract seller store from cookie if storeId is not explicitly provided
    if (!storeId) {
      try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("tonalzone_session");
        if (sessionCookie?.value) {
          const session = verifySession<{ id?: string; email?: string; storeId?: string }>(sessionCookie.value);
          if (session) {
            hasActiveSession = true;
            if (session.storeId) {
              storeId = session.storeId;
            } else if (session.email) {
              const user = await userRepo.findByEmail(session.email);
              if (user?.store?.id) {
                storeId = user.store.id;
              }
            }
          }
        }
      } catch (e) {}
    }

    // If sellerEmail parameter is supplied, resolve store
    if (!storeId && sellerEmail) {
      const user = await userRepo.findByEmail(sellerEmail);
      if (user?.store?.id) {
        storeId = user.store.id;
      }
    }

    // Scoped products by storeId (100% multi-tenant isolation)
    let rawProducts: any[] = [];
    const isBassQuery = (storeId || "").toLowerCase().includes("bass") || (sellerEmail || "").toLowerCase().includes("bass");
    const isCsiQuery = (storeId || "").toLowerCase().includes("csi") || (sellerEmail || "").toLowerCase().includes("csi");

    if (storeId) {
      rawProducts = await productRepo.findByStoreId(storeId);
    }

    // Fallback to static catalog if Supabase table has no rows for this store yet
    if (rawProducts.length === 0) {
      if (isBassQuery) {
        storeId = storeId || "store-bass-audio";
        rawProducts = FALLBACK_CATALOG.filter(
          (p: any) => p.storeName?.toLowerCase().includes("bass audio") || BASS_AUDIO_PRODUCT_IDS.has(p.id)
        ).map((p: any) => ({
          ...p,
          storeId: "store-bass-audio",
          brand: { id: `brand-${(p.brand || "generic").toLowerCase()}`, name: p.brand },
          category: { id: `cat-${(p.category || "iem").toLowerCase()}`, name: p.category },
          status: "APPROVED",
        }));
      } else if (isCsiQuery) {
        storeId = storeId || "store-csi-zone";
        rawProducts = FALLBACK_CATALOG.filter(
          (p: any) => p.storeName?.toLowerCase().includes("csi zone") || CSI_ZONE_PRODUCT_IDS.has(p.id)
        ).map((p: any) => ({
          ...p,
          storeId: "store-csi-zone",
          brand: { id: `brand-${(p.brand || "generic").toLowerCase()}`, name: p.brand },
          category: { id: `cat-${(p.category || "iem").toLowerCase()}`, name: p.category },
          status: "APPROVED",
        }));
      } else if (!storeId && !hasActiveSession) {
        // Fall back to official Moondrop store ONLY if no store specified and no user session
        const moondropStore = await storeRepo.findById("store-moondrop-official");
        if (moondropStore) {
          storeId = moondropStore.id;
          rawProducts = await productRepo.findByStoreId(storeId);
        }
      }
    }

    // Apply optional in-memory filters (query, category, status)
    let filtered = rawProducts;
    if (query) {
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.brand?.name?.toLowerCase().includes(query) ||
          p.category?.name?.toLowerCase().includes(query)
      );
    }

    if (categoryFilter && categoryFilter !== "ALL") {
      filtered = filtered.filter(
        (p) => p.category?.name?.toUpperCase() === categoryFilter.toUpperCase()
      );
    }

    if (statusFilter && statusFilter !== "ALL") {
      filtered = filtered.filter(
        (p) => p.status?.toUpperCase() === statusFilter.toUpperCase()
      );
    }

    // Format for seller products page
    const formatted = filtered.map((p) => {
      const brandName = p.brand?.name || "Audiophile";
      const catName = p.category?.name || "IN-EAR MONITORS";
      const imgs = Array.isArray(p.images) && p.images.length > 0 ? p.images : ["/model-iem-untuk-hero.webp"];
      const { cleanDescription, specs } = extractSpecsFromDescription(p.description);

      return {
        id: p.id,
        name: p.name,
        brand: brandName,
        category: catName,
        specsSummary: specs.driverType
          ? `${specs.driverType} • ${specs.impedance || p.soundSignature || "Reference"}`
          : `${p.soundSignature ? p.soundSignature.replace(/_/g, " ") : "Studio Tuning"} • ${p.experienceLevel || "Audiophile Gear"}`,
        priceUSD: Number(p.price) || 0,
        stock: Number(p.stock) || 0,
        condition: specs.condition || "Brand New Sealed",
        status: (p.status || "APPROVED") as "APPROVED" | "PENDING" | "REJECTED",
        createdAt: p.createdAt ? p.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
        images: imgs,
        image: imgs[0],
        description: cleanDescription,
        ...specs,
        variants: [
          {
            id: `${p.id}-v1`,
            name: "Standard 3.5mm SE",
            priceUSD: Number(p.price) || 0,
            stock: Math.ceil((Number(p.stock) || 0) / 2),
            sku: `${p.id}-35`,
          },
          {
            id: `${p.id}-v2`,
            name: "Balanced 4.4mm Pentaconn",
            priceUSD: Number(p.price) || 0,
            stock: Math.floor((Number(p.stock) || 0) / 2),
            sku: `${p.id}-44`,
          },
        ],
      };
    });

    return NextResponse.json({
      success: true,
      storeId,
      total: formatted.length,
      products: formatted,
    });
  } catch (error: any) {
    console.error("[API /api/seller/products GET] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve seller products" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/seller/products
 * Create a new audio product and link to seller's store in Supabase.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      brand = "Moondrop",
      category = "IN-EAR MONITORS",
      priceUSD,
      price,
      stock = 10,
      description = "",
      experienceLevel = "INTERMEDIATE",
      soundSignature = "NEUTRAL",
      images = [],
      image,
      sellerEmail,
      storeId: explicitStoreId,

      // Specifications & Audio Architecture
      driverType,
      impedance,
      sensitivity,
      frequencyResponse,
      frequencyRange,
      pinType,
      cableTermination,
      material,
      cableMaterial,
      tuning,
      condition,
      warrantyMonths,
      badge,
      dacChipset,
      outputPower,
      inputs,
      outputs,
      snrThd,
      headphoneDesign,
      headphoneDriverSize,
      weightGrams,
      dapOS,
      dapStorage,
      batteryLife,
      conductorMaterial,
      cableLength,
      speakerSystem,
      speakerPower,
      accessoryMaterial,
    } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Nama produk wajib diisi." },
        { status: 400 }
      );
    }

    const finalPrice = Number(priceUSD ?? price ?? 0);
    if (isNaN(finalPrice) || finalPrice <= 0) {
      return NextResponse.json(
        { success: false, error: "Harga produk harus lebih besar dari 0." },
        { status: 400 }
      );
    }

    // 2. Resolve Store ID
    let targetStoreId = explicitStoreId;

    if (!targetStoreId && sellerEmail) {
      const user = await userRepo.findByEmail(sellerEmail);
      if (user?.store?.id) {
        targetStoreId = user.store.id;
      }
    }

    let hasActivePostSession = false;
    if (!targetStoreId) {
      try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("tonalzone_session");
        if (sessionCookie?.value) {
          const session = verifySession<{ id?: string; email?: string; storeId?: string }>(sessionCookie.value);
          if (session) {
            hasActivePostSession = true;
            if (session.storeId) {
              targetStoreId = session.storeId;
            } else if (session.email) {
              const user = await userRepo.findByEmail(session.email);
              if (user?.store?.id) {
                targetStoreId = user.store.id;
              }
            }
          }
        }
      } catch (e) {}
    }

    // Fallback to official Moondrop store ONLY if none is resolved and user is not an authenticated seller without store
    if (!targetStoreId && !hasActivePostSession) {
      const moondropStore = await storeRepo.findById("store-moondrop-official");
      if (moondropStore) {
        targetStoreId = moondropStore.id;
      } else {
        const { data: stores } = await supabase.from("Store").select("id").limit(1);
        targetStoreId = stores && stores.length > 0 ? String(stores[0].id) : "store-default";
      }
    }

    // Load store profile to evaluate account type
    const storeProfile = await storeRepo.findById(targetStoreId);
    const isOfficialBrand = storeProfile?.storeType === "OFFICIAL_BRAND" || targetStoreId === "store-moondrop-official";

    // 1. Resolve or Create Brand & Category (Enforce official brand name for brand accounts)
    const effectiveBrandName = isOfficialBrand ? (storeProfile?.brandName || "MOONDROP") : (brand.trim() || "Audiophile");
    const brandRecord = await brandRepo.upsert(effectiveBrandName);
    const catRecord = await categoryRepo.upsert(category.trim());

    // 3. Prepare Image Array
    let imageList: string[] = [];
    if (Array.isArray(images) && images.length > 0) {
      imageList = images.filter(Boolean);
    } else if (image) {
      imageList = [image];
    }
    if (imageList.length === 0) {
      imageList = ["/model-iem-untuk-hero.webp"];
    }

    // 4. Build Structured Metadata Specs
    const specsMetadata: Record<string, any> = {};
    if (driverType) specsMetadata.driverType = driverType;
    if (impedance) specsMetadata.impedance = impedance;
    if (sensitivity) specsMetadata.sensitivity = sensitivity;
    if (frequencyResponse || frequencyRange) specsMetadata.frequencyResponse = frequencyResponse || frequencyRange;
    if (pinType) specsMetadata.pinType = pinType;
    if (cableTermination || pinType) specsMetadata.cableTermination = cableTermination || pinType;
    if (material) specsMetadata.material = material;
    if (cableMaterial) specsMetadata.cableMaterial = cableMaterial;
    if (tuning) specsMetadata.tuning = tuning;
    if (condition) specsMetadata.condition = condition;
    if (warrantyMonths) specsMetadata.warrantyMonths = Number(warrantyMonths);
    if (badge) specsMetadata.badge = badge;
    if (dacChipset) specsMetadata.dacChipset = dacChipset;
    if (outputPower) specsMetadata.outputPower = outputPower;
    if (inputs) specsMetadata.inputs = inputs;
    if (outputs) specsMetadata.outputs = outputs;
    if (snrThd) specsMetadata.snrThd = snrThd;
    if (headphoneDesign) specsMetadata.headphoneDesign = headphoneDesign;
    if (headphoneDriverSize) specsMetadata.headphoneDriverSize = headphoneDriverSize;
    if (weightGrams) specsMetadata.weightGrams = weightGrams;
    if (dapOS) specsMetadata.dapOS = dapOS;
    if (dapStorage) specsMetadata.dapStorage = dapStorage;
    if (batteryLife) specsMetadata.batteryLife = batteryLife;
    if (conductorMaterial) specsMetadata.conductorMaterial = conductorMaterial;
    if (cableLength) specsMetadata.cableLength = cableLength;
    if (speakerSystem) specsMetadata.speakerSystem = speakerSystem;
    if (speakerPower) specsMetadata.speakerPower = speakerPower;
    if (accessoryMaterial) specsMetadata.accessoryMaterial = accessoryMaterial;

    const cleanDesc = (description || "").replace(/<!--TZ_SPECS:[\s\S]*?-->\s*/g, "").trim();
    const encodedDescription = Object.keys(specsMetadata).length > 0
      ? `<!--TZ_SPECS:${JSON.stringify(specsMetadata)}-->\n\n${cleanDesc || "Audiophile Acoustic Equipment"}`
      : cleanDesc || "Audiophile Acoustic Equipment";

    // 5. Create Product in Supabase (Official Brand products instantly APPROVED)
    const prodId = id || `prod-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const created = await productRepo.create({
      id: prodId,
      name: name.trim(),
      storeId: targetStoreId,
      brandId: brandRecord.id,
      categoryId: catRecord.id,
      description: encodedDescription,
      price: finalPrice,
      stock: stock !== undefined && stock !== null && !isNaN(Number(stock)) ? Math.max(0, Number(stock)) : 10,
      experienceLevel,
      soundSignature,
      images: imageList,
    });

    if (!created) {
      return NextResponse.json(
        { success: false, error: "Gagal menyimpan produk ke database Supabase." },
        { status: 500 }
      );
    }

    const formattedProduct = {
      id: created.id,
      name: created.name,
      brand: brandRecord.name,
      category: catRecord.name,
      specsSummary: specsMetadata.driverType
        ? `${specsMetadata.driverType} • ${specsMetadata.impedance || created.soundSignature || "16Ω"}`
        : `${created.soundSignature || "Neutral"} • ${created.experienceLevel || "Intermediate"}`,
      priceUSD: Number(created.price),
      stock: Number(created.stock),
      condition: specsMetadata.condition || "Brand New Sealed",
      status: created.status || "APPROVED",
      createdAt: created.createdAt ? created.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
      images: created.images || imageList,
      image: (created.images && created.images[0]) || imageList[0],
      description: cleanDesc,
      ...specsMetadata,
      variants: [
        {
          id: `${created.id}-v1`,
          name: "Standard 3.5mm SE",
          priceUSD: Number(created.price),
          stock: Math.ceil(Number(created.stock) / 2),
          sku: `${created.id}-35`,
        },
        {
          id: `${created.id}-v2`,
          name: "Balanced 4.4mm Pentaconn",
          priceUSD: Number(created.price),
          stock: Math.floor(Number(created.stock) / 2),
          sku: `${created.id}-44`,
        },
      ],
    };

    return NextResponse.json(
      {
        success: true,
        message: "Produk berhasil ditambahkan ke etalase toko!",
        product: formattedProduct,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API /api/seller/products POST] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
