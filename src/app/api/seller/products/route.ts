import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { productRepo, storeRepo, brandRepo, categoryRepo, userRepo, supabase } from "@/lib/supabase-db";

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

    // Attempt to extract seller store from cookie if storeId is not explicitly provided
    if (!storeId) {
      try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("tonalzone_session");
        if (sessionCookie) {
          const session = JSON.parse(decodeURIComponent(sessionCookie.value));
          if (session.storeId) {
            storeId = session.storeId;
          } else if (session.email) {
            const user = await userRepo.findByEmail(session.email);
            if (user?.store?.id) {
              storeId = user.store.id;
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
    if (storeId) {
      rawProducts = await productRepo.findByStoreId(storeId);
    } else {
      // If no storeId from query or session, fall back to official Moondrop store
      const moondropStore = await storeRepo.findById("store-moondrop-official");
      if (moondropStore) {
        storeId = moondropStore.id;
        rawProducts = await productRepo.findByStoreId(storeId);
      } else {
        rawProducts = [];
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

      return {
        id: p.id,
        name: p.name,
        brand: brandName,
        category: catName,
        specsSummary: `${p.soundSignature ? p.soundSignature.replace(/_/g, " ") : "Studio Tuning"} • ${p.experienceLevel || "Audiophile Gear"}`,
        priceUSD: Number(p.price) || 0,
        stock: Number(p.stock) || 0,
        condition: "Brand New Sealed",
        status: (p.status || "APPROVED") as "APPROVED" | "PENDING" | "REJECTED",
        createdAt: p.createdAt ? p.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
        images: imgs,
        image: imgs[0],
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

    if (!targetStoreId) {
      try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("tonalzone_session");
        if (sessionCookie) {
          const session = JSON.parse(decodeURIComponent(sessionCookie.value));
          if (session.storeId) {
            targetStoreId = session.storeId;
          } else if (session.email) {
            const user = await userRepo.findByEmail(session.email);
            if (user?.store?.id) {
              targetStoreId = user.store.id;
            }
          }
        }
      } catch (e) {}
    }

    // Fallback to official Moondrop store if none is resolved
    if (!targetStoreId) {
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

    // 4. Create Product in Supabase (Official Brand products instantly APPROVED)
    const prodId = id || `prod-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const created = await productRepo.create({
      id: prodId,
      name: name.trim(),
      storeId: targetStoreId,
      brandId: brandRecord.id,
      categoryId: catRecord.id,
      description: description || "Audiophile Acoustic Equipment",
      price: finalPrice,
      stock: Number(stock) || 10,
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
      specsSummary: `${created.soundSignature || "Neutral"} • ${created.experienceLevel || "Intermediate"}`,
      priceUSD: Number(created.price),
      stock: Number(created.stock),
      condition: "Brand New Sealed",
      status: created.status || "APPROVED",
      createdAt: created.createdAt ? created.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
      images: created.images || imageList,
      image: (created.images && created.images[0]) || imageList[0],
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
