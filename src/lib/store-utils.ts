export function getStoreSlug(storeName: string): string {
  if (!storeName) return "official-store";
  return storeName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface StoreMetadata {
  id: string;
  name: string;
  slug: string;
  badge: "OFFICIAL_STORE" | "STAR_SELLER" | "VERIFIED_PARTNER";
  city: string;
  joinYear: string;
  responseRate: string;
  responseTime: string;
  rating: number;
  totalReviews: number;
  followersCount: number;
  description: string;
  operationalHours: string;
  avatarUrl?: string;
  bannerUrl?: string;
  isAuthenticGuarantee: boolean;
}

const STORE_PRESETS: Record<string, Partial<StoreMetadata>> = {
  "moondrop-official-flagship-store": {
    badge: "OFFICIAL_STORE",
    city: "Jakarta Pusat",
    joinYear: "2023",
    rating: 4.9,
    totalReviews: 2480,
    followersCount: 14200,
    responseTime: "±5 menit",
    responseRate: "100%",
    description: "Official Flagship Store resmi MOONDROP Indonesia. Menyediakan in-ear monitors reference audiophile, DSP Type-C IEMs, dan aksesoris resmi bergaransi distributor 1 tahun.",
    operationalHours: "Senin – Sabtu (09.00 – 19.00 WIB)",
    bannerUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1600&q=80",
  },
  "tangzu-audio-official-store": {
    badge: "OFFICIAL_STORE",
    city: "Jakarta Barat",
    joinYear: "2023",
    rating: 4.9,
    totalReviews: 1890,
    followersCount: 9800,
    responseTime: "±10 menit",
    responseRate: "98%",
    description: "Distributor resmi TANGZU Audio. Menghadirkan lini Wan'er S.G, Xuanwu, Fudu, dan eartips Tang Sancai original dengan garansi tukar unit dan jaminan keaslian 100%.",
    operationalHours: "Senin – Minggu (08.30 – 20.00 WIB)",
    bannerUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&q=80",
  },
  "sennheiser-official-store": {
    badge: "OFFICIAL_STORE",
    city: "Jakarta Selatan",
    joinYear: "2022",
    rating: 4.9,
    totalReviews: 3100,
    followersCount: 22400,
    responseTime: "±15 menit",
    responseRate: "97%",
    description: "Official Store Sennheiser Indonesia. Lini audiophile legendaris IE 200, IE 600, IE 900 dengan 2 tahun garansi resmi Sennheiser Authorized Service Center.",
    operationalHours: "Senin – Jumat (09.00 – 17.00 WIB)",
    bannerUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1600&q=80",
  },
  "sony-official-store": {
    badge: "OFFICIAL_STORE",
    city: "Jakarta Pusat",
    joinYear: "2022",
    rating: 4.8,
    totalReviews: 4500,
    followersCount: 35000,
    responseTime: "±10 menit",
    responseRate: "99%",
    description: "Sony Audio Official Partner Indonesia. Monitor in-ear stage IER-M9, IER-Z1R, dan perlengkapan Hi-Res Audio bergaransi resmi PT Sony Indonesia.",
    operationalHours: "Senin – Sabtu (09.00 – 18.00 WIB)",
    bannerUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1600&q=80",
  },
  "bass-audio-official": {
    badge: "STAR_SELLER",
    city: "Jakarta Barat",
    joinYear: "2023",
    rating: 4.8,
    totalReviews: 1240,
    followersCount: 6500,
    responseTime: "±15 menit",
    responseRate: "96%",
    description: "Spesialis portable audio, IEMs, kabel upgrade, dan DAC/Amp. Kurasi audiophile gear terpercaya dengan pengiriman cepat dan packing aman bubble wrap 4 lapis.",
    operationalHours: "Senin – Sabtu (10.00 – 19.00 WIB)",
    bannerUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&q=80",
  },
  "csi-zone": {
    badge: "STAR_SELLER",
    city: "Surabaya",
    joinYear: "2024",
    rating: 4.8,
    totalReviews: 540,
    followersCount: 2800,
    responseTime: "±10 menit",
    responseRate: "98%",
    description: "CSI Zone Official Surabaya. Toko retail audiophile terpercaya penyedia earphone IEM, DAC/Amp, dan aksesoris audio hi-res terlengkap di Jawa Timur.",
    operationalHours: "Senin – Sabtu (09.30 – 18.30 WIB)",
    bannerUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&q=80",
  },
  "csi-zone-surabaya": {
    badge: "STAR_SELLER",
    city: "Kota Surabaya",
    joinYear: "2024",
    rating: 4.8,
    totalReviews: 540,
    followersCount: 2800,
    responseTime: "±10 menit",
    responseRate: "98%",
    description: "CSI Zone Official Surabaya. Toko retail audiophile terpercaya penyedia earphone IEM, DAC/Amp, dan aksesoris audio hi-res terlengkap di Jawa Timur.",
    operationalHours: "Senin – Sabtu (09.30 – 18.30 WIB)",
    bannerUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&q=80",
  },
  "tanchjim-official-store": {
    badge: "OFFICIAL_STORE",
    city: "Jakarta Utara",
    joinYear: "2023",
    rating: 4.9,
    totalReviews: 1280,
    followersCount: 8400,
    responseTime: "±8 menit",
    responseRate: "99%",
    description: "Tanchjim Official Store Indonesia. Menyediakan in-ear monitor DMT driver architecture terkemuka (Nora, Bunny, Tanya, Oxygen, Space) dengan garansi resmi 1 tahun.",
    operationalHours: "Senin – Sabtu (09.00 – 18.00 WIB)",
    bannerUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&q=80",
  },
};

export function getStoreMetadata(storeName: string, city?: string): StoreMetadata {
  const slug = getStoreSlug(storeName);
  const preset = STORE_PRESETS[slug] || {};

  const isOfficial =
    storeName.toLowerCase().includes("official") ||
    storeName.toLowerCase().includes("flagship") ||
    preset.badge === "OFFICIAL_STORE";

  return {
    id: `store-${slug}`,
    name: storeName,
    slug,
    badge: isOfficial ? "OFFICIAL_STORE" : (preset.badge || "STAR_SELLER"),
    city: city || preset.city || "Jakarta",
    joinYear: preset.joinYear || "2023",
    responseRate: preset.responseRate || "98%",
    responseTime: preset.responseTime || "±10 menit",
    rating: preset.rating || 4.8,
    totalReviews: preset.totalReviews || 480,
    followersCount: preset.followersCount || 1500,
    description:
      preset.description ||
      `Toko resmi ${storeName} di marketplace TonalZone. Menjual produk in-ear monitor 100% original bergaransi resmi dengan perlindungan rekening bersama TonalZone Escrow.`,
    operationalHours: preset.operationalHours || "Senin – Sabtu (09.00 – 18.00 WIB)",
    bannerUrl: preset.bannerUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&q=80",
    isAuthenticGuarantee: true,
  };
}

// -----------------------------------------------------------------------------
// SHARED MULTI-SELLER OFFER UTILITIES (Used by Product Detail & Storefront)
// -----------------------------------------------------------------------------
export interface RetailOffer {
  id: string;
  sellerName: string;
  sellerType: "OFFICIAL" | "AUTHORIZED" | "INDIVIDUAL";
  sellerCity?: string;
  badgeLabel?: "OFFICIAL STORE" | "VERIFIED RETAILER" | "AUTHORIZED DISTY";
  condition: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  highlightTag?: string;
}

export const RETAIL_SELLERS = [
  {
    name: "Bass Audio Official",
    type: "AUTHORIZED" as const,
    city: "Jakarta Barat",
    badgeLabel: "VERIFIED RETAILER" as const,
    highlightTag: "Sameday Ready",
    conditions: [
      { condition: "Brand New Sealed — Local Disty", multiplier: 1.0 },
      { condition: "Like New / Mint — 99% Complete Box", multiplier: 0.88 },
    ],
  },
  {
    name: "CSI Zone Surabaya",
    type: "AUTHORIZED" as const,
    city: "Kota Surabaya",
    badgeLabel: "VERIFIED RETAILER" as const,
    highlightTag: "Toko Terdekat (Jatim)",
    conditions: [
      { condition: "Brand New Sealed — Garansi Resmi Toko", multiplier: 0.98 },
      { condition: "Like New / Mint — Unit Demo Toko", multiplier: 0.85 },
    ],
  },
];

// Daftar katalog spesifik yang dijual oleh Bass Audio Official (Retailer Jakarta Barat)
// Bass Audio mengkhususkan diri pada lini Portable DAC/Amps, High-End Flagship, Sennheiser, FatFreq, Chord, FiiO, Meze, dan Moondrop pilihan
export const BASS_AUDIO_PRODUCT_IDS = new Set([
  "prod-maestro-mini",   // FatFreq Maestro Mini
  "prod-mojo2",          // Chord Mojo 2
  "prod-fiio-btr7",      // FiiO BTR7
  "prod-ifi-goblu",      // iFi Audio GO blu
  "prod-dx3-pro-plus",   // Topping DX3 Pro+
  "prod-ie900",          // Sennheiser IE 900
  "prod-ie600",          // Sennheiser IE 600
  "prod-hd600",          // Sennheiser HD 600
  "prod-eah-az80",       // Technics EAH-AZ80
  "prod-meze-109pro",    // Meze 109 PRO
  "prod-solaris",        // Campfire Audio Solaris
  "prod-u12t",           // 64 Audio U12t
  "prod-blessing3",      // Moondrop Blessing 3
  "prod-aria2",          // Moondrop Aria 2
  "prod-chu3",           // Moondrop CHU III
]);

// Daftar katalog spesifik yang dijual oleh CSI Zone Surabaya (Retailer Kuping Manja Surabaya)
// CSI Zone mengkhususkan diri pada Chi-Fi IEMs, budget beasts, Tangzu, Truthear, Simgot, Letshuoer, EPZ, Qudelix, Kiwi Ears
export const CSI_ZONE_PRODUCT_IDS = new Set([
  "prod-waner",          // Tangzu Nezha / Wan'er
  "prod-zetian-wu",      // Tangzu Zetian Wu
  "prod-shimin-li",      // Tangzu Shimin Li
  "prod-wukong",         // Tangzu WuKong
  "prod-zero-red",       // Truthear Crinacle ZERO:RED
  "prod-s12pro",         // Letshuoer S12 Pro
  "prod-ea1000",         // Simgot EA1000 Fermat
  "prod-epz-g30",        // EPZ G30
  "prod-mimisbrunnr",    // Mimisbrunnr Flagship
  "prod-nanna-2",        // Kinera Imperial Nanna
  "prod-7hz-zero",       // 7Hz Salnotes Zero
  "prod-kiwi-cadenza",   // Kiwi Ears Cadenza
  "prod-quintet",        // Kiwi Ears Quintet
  "prod-qudelix-5k",     // Qudelix-5K DAC
  "prod-m50x-bt2",       // Audio-Technica M50xBT2
  "prod-dawn-pro",       // Moondrop Dawn Pro
  "prod-space-travel",   // Moondrop Space Travel
  "prod-chu3",           // Moondrop CHU III
]);

/**
 * Memeriksa apakah toko ritel tertentu (Bass Audio atau CSI Zone) menjual produk bersangkutan.
 * Toko tidak menjual semua produk: masing-masing hanya menjual kurasi lini produk mereka sendiri.
 */
export function isProductSoldByRetailer(
  retailerName: string,
  product: { id?: string; name?: string; brand?: string; storeName?: string }
): boolean {
  if (!product) return false;
  const prodId = (product.id || "").toLowerCase();
  const prodBrand = (product.brand || "").toUpperCase();
  const primaryStore = (product.storeName || "").toLowerCase();

  const isBass = retailerName.toLowerCase().includes("bass audio");
  const isCSI = retailerName.toLowerCase().includes("csi zone");

  if (isBass) {
    if (primaryStore.includes("bass audio")) return true;
    if (BASS_AUDIO_PRODUCT_IDS.has(prodId)) return true;
    if (["FATFREQ", "CHORD AUDIO", "FIIO", "IFI AUDIO", "MEZE AUDIO"].includes(prodBrand)) {
      return true;
    }
    return false;
  }

  if (isCSI) {
    if (primaryStore.includes("csi zone")) return true;
    if (CSI_ZONE_PRODUCT_IDS.has(prodId)) return true;
    if (["TANGZU", "TRUTHEAR", "SIMGOT", "LETSHUOER", "EPZ", "MIMISBRUNNR", "QUDELIX"].includes(prodBrand)) {
      return true;
    }
    return false;
  }

  return false;
}

export function getProductRetailOffers(product: {
  id: string;
  name: string;
  price: number;
  storeName?: string;
  brand?: string;
}): RetailOffer[] {
  if (!product) return [];

  const isPrimaryOfficial = (product.storeName || "").toLowerCase().includes("official");
  const primarySellerName = product.storeName || "TonalZone Partner";
  const primaryOriginalPrice = Math.round(product.price * 1.15);
  const primaryDiscount = Math.round(((primaryOriginalPrice - product.price) / primaryOriginalPrice) * 100);

  const isCsiPrimary = (product.storeName || "").toLowerCase().includes("csi zone");
  const defaultCity = isPrimaryOfficial
    ? "Jakarta Pusat"
    : isCsiPrimary
    ? "Kota Surabaya"
    : "Jakarta Barat";

  const baseOffers: RetailOffer[] = [
    {
      id: "off-1",
      sellerName: primarySellerName,
      sellerType: isPrimaryOfficial ? "OFFICIAL" : "AUTHORIZED",
      sellerCity: defaultCity,
      badgeLabel: isPrimaryOfficial ? "OFFICIAL STORE" : "VERIFIED RETAILER",
      condition: isPrimaryOfficial
        ? "Brand New — 1 Year Official Disty Warranty"
        : "Brand New Sealed — Garansi Resmi Toko",
      price: product.price,
      originalPrice: primaryOriginalPrice,
      discountPercent: primaryDiscount > 0 ? primaryDiscount : undefined,
      highlightTag: isPrimaryOfficial ? "Garansi Resmi Prinsipal" : "Toko Rekomendasi",
    },
  ];

  const str = product.id || product.name || "";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  // Filter toko retail: jangan masukkan jika sudah menjadi penjual utama,
  // dan HANYA masukkan jika toko retail ini memang menjual lini produk tersebut!
  const availableRetailers = RETAIL_SELLERS.filter((r) => {
    const rSlug = getStoreSlug(r.name);
    const pSlug = getStoreSlug(primarySellerName);
    if (r.name.toLowerCase() === primarySellerName.toLowerCase() || rSlug === pSlug) {
      return false;
    }
    return isProductSoldByRetailer(r.name, product);
  });

  availableRetailers.forEach((ret, idx) => {
    const condIdx = (seed + idx) % ret.conditions.length;
    const cond = ret.conditions[condIdx];
    const offerPrice = Math.round(product.price * cond.multiplier);
    const offerOrig = Math.round(product.price * 1.15);
    const offerDiscount = Math.round(((offerOrig - offerPrice) / offerOrig) * 100);

    baseOffers.push({
      id: `off-${idx + 2}`,
      sellerName: ret.name,
      sellerType: ret.type,
      sellerCity: ret.city,
      badgeLabel: ret.badgeLabel,
      condition: cond.condition,
      price: offerPrice,
      originalPrice: offerOrig > offerPrice ? offerOrig : undefined,
      discountPercent: offerDiscount > 0 ? offerDiscount : undefined,
      highlightTag: ret.highlightTag,
    });
  });

  return baseOffers;
}
