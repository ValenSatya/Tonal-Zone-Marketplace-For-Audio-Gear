import { prisma } from "../src/lib/prisma";
import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";

async function seedSqlite() {
  console.log("================================================================================");
  console.log("          SEEDING TONALZONE LOCAL SQLITE DATABASE (PRISMA ORM)                  ");
  console.log("================================================================================\n");

  // 1. SEED DEFAULT USERS
  console.log("-> Seeding default users...");
  const adminUser = await prisma.user.upsert({
    where: { email: "valen@tonalzone.id" },
    update: {},
    create: {
      id: "usr-admin-valen",
      email: "valen@tonalzone.id",
      name: "Valen Satya",
      role: "ADMIN",
      location: "Jakarta, Indonesia",
      language: "id",
      tuningPreference: "NEUTRAL_REFERENCE",
    },
  });

  const sellerUser = await prisma.user.upsert({
    where: { email: "seller@tonalzone.id" },
    update: {},
    create: {
      id: "usr-seller-moondrop",
      email: "seller@tonalzone.id",
      name: "MOONDROP Official Merchant",
      role: "SELLER",
      location: "Jakarta Barat",
      language: "id",
    },
  });

  const buyerUser = await prisma.user.upsert({
    where: { email: "buyer@tonalzone.id" },
    update: {},
    create: {
      id: "usr-buyer-demo",
      email: "buyer@tonalzone.id",
      name: "Audiophile Buyer",
      role: "BUYER",
      location: "Surabaya, Jawa Timur",
      language: "id",
    },
  });

  // Seed default address for buyer
  await prisma.userAddress.upsert({
    where: { id: "addr-buyer-default" },
    update: {},
    create: {
      id: "addr-buyer-default",
      userId: buyerUser.id,
      label: "Rumah Utama",
      recipientName: "Audiophile Buyer",
      phone: "081234567890",
      street: "Jl. Pemuda No. 45, Embong Kaliasin",
      city: "Surabaya",
      province: "Jawa Timur",
      postalCode: "60271",
      country: "Indonesia",
      isDefault: true,
    },
  });

  // 2. SEED DEFAULT STORES
  console.log("-> Seeding official stores...");
  const valenUser = await prisma.user.upsert({
    where: { email: "valenandrasatya@gmail.com" },
    update: { role: "SELLER" },
    create: {
      id: "usr-valen-moondrop",
      email: "valenandrasatya@gmail.com",
      name: "Valen Satya (MOONDROP Flagship)",
      role: "SELLER",
      location: "Jakarta Barat",
      language: "id",
    },
  });

  const moondropStore = await prisma.store.upsert({
    where: { id: "store-moondrop-official" },
    update: { userId: valenUser.id },
    create: {
      id: "store-moondrop-official",
      userId: valenUser.id,
      storeName: "MOONDROP Official Flagship Store",
      description: "Distributor resmi IEM, TWS, dan Portable DAC dari Moondrop Technology Co. OFFICIAL_BRAND:MOONDROP",
      status: "APPROVED",
      address: "Jakarta Barat, DKI Jakarta",
      bankName: "BCA",
      bankAccount: "8820192831",
      rating: 4.95,
      totalSales: 1240,
    },
  });

  const bassAudioStore = await prisma.store.upsert({
    where: { id: "store-bass-audio" },
    update: {},
    create: {
      id: "store-bass-audio",
      userId: adminUser.id,
      storeName: "Bass Audio Indonesia",
      description: "Authorized Premium Audiophile Reseller sejak 2012.",
      status: "APPROVED",
      address: "Jakarta Pusat",
      bankName: "Mandiri",
      bankAccount: "1310098273612",
      rating: 4.9,
      totalSales: 890,
    },
  });

  const csiZoneUser = await prisma.user.upsert({
    where: { email: "seller.csi@tonalzone.id" },
    update: {},
    create: {
      id: "usr-seller-csi",
      email: "seller.csi@tonalzone.id",
      name: "CSI Zone Official Merchant",
      role: "SELLER",
      location: "Surabaya, Jawa Timur",
      language: "id",
    },
  });

  const csiZoneStore = await prisma.store.upsert({
    where: { id: "store-csi-zone" },
    update: {},
    create: {
      id: "store-csi-zone",
      userId: csiZoneUser.id,
      storeName: "CSI Zone",
      description: "Official Hi-Fi Audio Retailer & Authorized Warranty Partner.",
      status: "APPROVED",
      address: "Surabaya, Jawa Timur",
      bankName: "BCA",
      bankAccount: "5420199182",
      rating: 4.9,
      totalSales: 750,
    },
  });

  // 3. SEED CATEGORIES
  console.log("-> Seeding categories...");
  const categoriesMap: Record<string, string> = {};
  const catNames = [
    { id: "cat-iem", name: "IN-EAR MONITORS", slug: "in-ear-monitors" },
    { id: "cat-dac", name: "DAC / HEADPHONE AMPLIFIERS", slug: "dac-amplifiers" },
    { id: "cat-cables", name: "AUDIOPHILE UPGRADE CABLES", slug: "upgrade-cables" },
    { id: "cat-accessories", name: "EARTIPS & ACCESSORIES", slug: "accessories" },
  ];

  for (const c of catNames) {
    const createdCat = await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: `Audiophile ${c.name.toLowerCase()} catalog.`,
      },
    });
    categoriesMap[c.name] = createdCat.id;
  }

  // 4. SEED BRANDS
  console.log("-> Seeding audiophile brands...");
  const brandsMap: Record<string, string> = {};
  const brandList = [
    { name: "MOONDROP", country: "China", tier: "Chi-Fi" },
    { name: "TANGZU", country: "China", tier: "Chi-Fi" },
    { name: "TANCHJIM", country: "China", tier: "Chi-Fi" },
    { name: "SENNHEISER", country: "Germany", tier: "Flagship" },
    { name: "64 AUDIO", country: "USA", tier: "Flagship" },
    { name: "KIWI EARS", country: "China", tier: "Chi-Fi" },
    { name: "CHORD AUDIO", country: "UK", tier: "Flagship" },
    { name: "EFFECT AUDIO", country: "Singapore", tier: "Premium" },
    { name: "FATFREQ", country: "Singapore", tier: "Custom IEM" },
    { name: "7HZ", country: "China", tier: "Chi-Fi" },
    { name: "THIEAUDIO", country: "China", tier: "Chi-Fi" },
    { name: "FIIO", country: "China", tier: "Chi-Fi" },
    { name: "DUNU", country: "China", tier: "Chi-Fi" },
    { name: "SONY", country: "Japan", tier: "Flagship" },
    { name: "HIFIMAN", country: "China", tier: "Flagship" },
  ];

  for (const b of brandList) {
    const createdBrand = await prisma.brand.upsert({
      where: { name: b.name },
      update: {},
      create: {
        id: `brd-${b.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
        name: b.name,
        country: b.country,
        tier: b.tier,
        status: "APPROVED",
      },
    });
    brandsMap[b.name] = createdBrand.id;
  }

  // 5. SEED ALL PRODUCTS FROM FALLBACK_CATALOG
  console.log("-> Seeding products from FALLBACK_CATALOG...");
  const { FALLBACK_CATALOG } = await import("../src/lib/products-db");

  for (const p of FALLBACK_CATALOG) {
    const bName = (p.brand || "MOONDROP").toUpperCase().trim();
    let brandId = brandsMap[bName];
    if (!brandId) {
      let existingBrand = await prisma.brand.findUnique({ where: { name: bName } });
      if (!existingBrand) {
        existingBrand = await prisma.brand.create({
          data: {
            id: `brd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: bName,
            status: "APPROVED",
          },
        });
      }
      brandId = existingBrand.id;
      brandsMap[bName] = brandId;
    }

    const cName = (p.category || "IN-EAR MONITORS").toUpperCase().trim();
    let categoryId = categoriesMap[cName];
    if (!categoryId) {
      let existingCat = await prisma.category.findUnique({ where: { name: cName } });
      if (!existingCat) {
        existingCat = await prisma.category.create({
          data: {
            id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: cName,
            slug: cName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          },
        });
      }
      categoryId = existingCat.id;
      categoriesMap[cName] = categoryId;
    }

    const sName = (p.storeName || "").toLowerCase();
    let storeId = p.storeId;
    if (!storeId) {
      if (sName.includes("bass")) storeId = "store-bass-audio";
      else if (sName.includes("csi")) storeId = "store-csi-zone";
      else storeId = "store-moondrop-official";
    }

    const imagesList = Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image || "/model-iem-untuk-hero.webp"];

    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        price: Number(p.price) || 0,
        stock: Number(p.stock) || 0,
        name: p.name,
        images: JSON.stringify(imagesList),
      },
      create: {
        id: p.id,
        name: p.name,
        storeId,
        brandId,
        categoryId,
        price: Number(p.price) || 0,
        stock: Number(p.stock) || 0,
        description: p.description || "",
        experienceLevel: p.experienceLevel || "INTERMEDIATE",
        soundSignature: p.soundSignature || "NEUTRAL",
        status: "APPROVED",
        images: JSON.stringify(imagesList),
        variants: p.variants ? JSON.stringify(p.variants) : null,
        colors: p.colors ? JSON.stringify(p.colors) : null,
      },
    });
  }
  console.log(`[✓] ${FALLBACK_CATALOG.length} catalog products seeded successfully.`);

  // Also import additional products from tonalzone_master_products_template.xlsx if exists
  const xlsxPath = path.resolve(process.cwd(), "tonalzone_master_products_template.xlsx");
  if (fs.existsSync(xlsxPath)) {
    console.log("-> Importing extra products from tonalzone_master_products_template.xlsx...");
    try {
      const wb = XLSX.readFile(xlsxPath);
      const rows: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      for (const row of rows) {
        const pName = row["Product Name"] || row["name"] || row["productname"];
        if (!pName) continue;
        const bName = (row["Brand"] || row["brand"] || "MOONDROP").toString().toUpperCase().trim();
        const price = parseFloat(String(row["Price (USD)"] || row["priceusd"] || row["price"] || 99).replace(/[^0-9.]/g, "")) || 99;
        const stock = parseInt(String(row["Stock"] || row["stock"] || 15).replace(/[^0-9]/g, ""), 10) || 15;
        const pId = `prod-${pName.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30)}`;

        let brand = await prisma.brand.findUnique({ where: { name: bName } });
        if (!brand) {
          brand = await prisma.brand.create({
            data: {
              id: `brd-${bName.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
              name: bName,
              status: "APPROVED",
            },
          });
        }

        const catId = categoriesMap["IN-EAR MONITORS"];

        await prisma.product.upsert({
          where: { id: pId },
          update: {},
          create: {
            id: pId,
            name: pName,
            storeId: "store-moondrop-official",
            brandId: brand.id,
            categoryId: catId,
            price,
            stock,
            description: row["Description"] || "Audiophile High Fidelity Acoustic Equipment",
            experienceLevel: "INTERMEDIATE",
            soundSignature: "NEUTRAL",
            status: "APPROVED",
            images: JSON.stringify(["/images/Headphone-Zone-Moondrop-Chu-III-Homepage-Desktop-Banner-02.webp"]),
          },
        });
      }
      console.log(`[✓] Master template products imported.`);
    } catch (err: any) {
      console.warn("Notice: Optional Excel import skipped:", err.message);
    }
  }

  // 6. SEED VOUCHERS
  console.log("-> Seeding default vouchers...");
  const vouchers = [
    {
      code: "WELCOME2026",
      title: "Diskon Sambutan Audiophile",
      description: "Potongan 10% untuk pesanan pertama Anda di TonalZone",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minSpend: 20,
      maxDiscount: 10,
      quota: 500,
    },
    {
      code: "AUDIOPHILE15",
      title: "Voucher Komunitas IEM",
      description: "Diskon 15% untuk pembelian produk kelas Enthusiast & Flagship",
      discountType: "PERCENTAGE",
      discountValue: 15,
      minSpend: 50,
      maxDiscount: 25,
      quota: 200,
    },
  ];

  for (const v of vouchers) {
    await prisma.voucher.upsert({
      where: { code: v.code },
      update: {},
      create: {
        id: `vouch-${v.code.toLowerCase()}`,
        code: v.code,
        title: v.title,
        description: v.description,
        discountType: v.discountType,
        discountValue: v.discountValue,
        minSpend: v.minSpend,
        maxDiscount: v.maxDiscount,
        quota: v.quota,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 86400000 * 365), // 1 year
        isActive: true,
      },
    });
  }

  // 7. SEED MOONDROP ESCROW ORDERS & HISTORICAL WITHDRAWALS
  console.log("-> Seeding Moondrop store orders & withdrawals...");
  // Clear any temporary orders and payouts to ensure exact balance
  await prisma.orderItem.deleteMany({});
  await prisma.orderTrackingCheckpoint.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.sellerPayout.deleteMany({});

  const settledOrders = [
    { id: "ORD-MD-01", total: 3000, date: "2026-07-01T10:00:00.000Z" },
    { id: "ORD-MD-02", total: 2500, date: "2026-07-15T12:00:00.000Z" },
    { id: "ORD-MD-03", total: 2000, date: "2026-08-01T14:00:00.000Z" },
    { id: "ORD-MD-04", total: 1120, date: "2026-08-10T16:00:00.000Z" },
  ];
  for (const o of settledOrders) {
    await prisma.order.create({
      data: {
        id: o.id,
        buyerId: "usr-buyer-demo",
        buyerName: "Audiophile Buyer",
        buyerEmail: "buyer@tonalzone.id",
        destinationAddress: "Jl. Pemuda No. 45",
        destinationCity: "Surabaya",
        destinationPostalCode: "60271",
        storeId: "store-moondrop-official",
        storeName: "MOONDROP Official Flagship Store",
        itemsSubtotal: o.total,
        totalAmount: o.total,
        paymentStatus: "PAID",
        escrowStatus: "FUNDS_RELEASED_TO_SELLER",
        hasReviewed: true,
        createdAt: new Date(o.date),
      },
    });
  }

  // Seed 1 order HELD_IN_ESCROW
  await prisma.order.create({
    data: {
      id: "ORD-MD-ESCROW-01",
      buyerId: "usr-buyer-demo",
      buyerName: "Audiophile Buyer",
      buyerEmail: "buyer@tonalzone.id",
      destinationAddress: "Jl. Pemuda No. 45",
      destinationCity: "Surabaya",
      destinationPostalCode: "60271",
      storeId: "store-moondrop-official",
      storeName: "MOONDROP Official Flagship Store",
      itemsSubtotal: 319,
      totalAmount: 319,
      paymentStatus: "PAID",
      escrowStatus: "HELD_IN_ESCROW",
      createdAt: new Date(),
    },
  });

  // Seed 1 order IN_TRANSIT
  await prisma.order.create({
    data: {
      id: "ORD-MD-TRANSIT-01",
      buyerId: "usr-buyer-demo",
      buyerName: "Audiophile Buyer",
      buyerEmail: "buyer@tonalzone.id",
      destinationAddress: "Jl. Pemuda No. 45",
      destinationCity: "Surabaya",
      destinationPostalCode: "60271",
      storeId: "store-moondrop-official",
      storeName: "MOONDROP Official Flagship Store",
      itemsSubtotal: 89.99,
      totalAmount: 89.99,
      paymentStatus: "PAID",
      escrowStatus: "IN_TRANSIT",
      waybillNumber: "JNE-MD-TRANSIT-1",
      createdAt: new Date(),
    },
  });

  // Seed 2 Withdrawals: PO-4091 ($2500) and PO-4090 ($1800) -> Total $4,300
  await prisma.sellerPayout.create({
    data: {
      id: "PO-4091",
      storeId: "store-moondrop-official",
      amountUSD: 2500,
      bankName: "BCA",
      bankAccount: "0123456789",
      accountHolder: "Alexander Rivera",
      status: "COMPLETED",
      createdAt: new Date("2026-08-12T14:15:00.000Z"),
    },
  });

  await prisma.sellerPayout.create({
    data: {
      id: "PO-4090",
      storeId: "store-moondrop-official",
      amountUSD: 1800,
      bankName: "Bank Mandiri",
      bankAccount: "140001928371",
      accountHolder: "Alexander Rivera",
      status: "COMPLETED",
      createdAt: new Date("2026-08-01T10:00:00.000Z"),
    },
  });

  const totalProducts = await prisma.product.count();
  const totalStores = await prisma.store.count();
  const totalBrands = await prisma.brand.count();

  console.log("\n================================================================================");
  console.log("          LOCAL SQLITE DATABASE SUCCESSFULLY SEEDED!                            ");
  console.log("================================================================================");
  console.log(`Total Products in SQLite: ${totalProducts}`);
  console.log(`Total Stores: ${totalStores}`);
  console.log(`Total Brands: ${totalBrands}`);
  console.log(`Database Location: prisma/dev.db\n`);
}

seedSqlite()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
