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
  "headphone-zone-id": {
    badge: "STAR_SELLER",
    city: "Tangerang",
    joinYear: "2023",
    rating: 4.9,
    totalReviews: 890,
    followersCount: 4200,
    responseTime: "±8 menit",
    responseRate: "99%",
    description: "Toko spesialis audiophile gear import dan aksesoris IEM. Setiap unit diuji sebelum dikirim dan dilindungi sistem TonalZone Escrow.",
    operationalHours: "Setiap Hari (09.00 – 21.00 WIB)",
    bannerUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&q=80",
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
  condition: string;
  price: number;
}

export const RETAIL_SELLERS = [
  {
    name: "Bass Audio Official",
    type: "AUTHORIZED" as const,
    conditions: [
      { condition: "Brand New Sealed — Local Disty", multiplier: 1.03 },
      { condition: "Like New / Mint — 99% Complete Box", multiplier: 0.91 },
    ],
  },
  {
    name: "CSI Zone",
    type: "AUTHORIZED" as const,
    conditions: [
      { condition: "Brand New Sealed — Garansi Resmi CSI", multiplier: 1.0 },
      { condition: "Like New / Mint — 99% Complete Box", multiplier: 0.88 },
    ],
  },
  {
    name: "Linsoul Audio",
    type: "AUTHORIZED" as const,
    conditions: [
      { condition: "Brand New — Factory Sealed Import", multiplier: 0.98 },
      { condition: "Open Box Grade A — Tested Mulus", multiplier: 0.89 },
    ],
  },
  {
    name: "Headphone Zone ID",
    type: "AUTHORIZED" as const,
    conditions: [
      { condition: "Brand New Sealed — Local Disty Stock", multiplier: 1.02 },
      { condition: "Ex-Audition Demo Unit — Like New", multiplier: 0.86 },
    ],
  },
  {
    name: "ShenzhenAudio Official",
    type: "AUTHORIZED" as const,
    conditions: [
      { condition: "Brand New — Global Stock Sealed", multiplier: 0.99 },
      { condition: "Like New — Open Box Mint", multiplier: 0.92 },
    ],
  },
];

export function getProductRetailOffers(product: {
  id: string;
  name: string;
  price: number;
  storeName?: string;
}): RetailOffer[] {
  if (!product) return [];

  const isPrimaryOfficial = (product.storeName || "").toLowerCase().includes("official");
  const primarySellerName = product.storeName || "TonalZone Partner";

  const baseOffers: RetailOffer[] = [
    {
      id: "off-1",
      sellerName: primarySellerName,
      sellerType: isPrimaryOfficial ? "OFFICIAL" : "AUTHORIZED",
      condition: isPrimaryOfficial
        ? "Brand New — 1 Year Official Disty Warranty"
        : "Brand New Sealed — Garansi Resmi Toko",
      price: product.price,
    },
  ];

  const str = product.id || product.name || "";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  const availableRetailers = RETAIL_SELLERS.filter(
    (r) => r.name.toLowerCase() !== primarySellerName.toLowerCase()
  );

  const dice = seed % 10;
  let extraCount = 0;
  if (dice >= 3 && dice <= 6) extraCount = 1;
  else if (dice > 6) extraCount = 2;

  if (extraCount > 0 && availableRetailers.length > 0) {
    const firstIdx = seed % availableRetailers.length;
    const firstRetailer = availableRetailers[firstIdx];
    const condIdx1 = (seed >> 2) % firstRetailer.conditions.length;
    const selectedCond1 = firstRetailer.conditions[condIdx1];

    baseOffers.push({
      id: "off-2",
      sellerName: firstRetailer.name,
      sellerType: firstRetailer.type,
      condition: selectedCond1.condition,
      price: Math.round(product.price * selectedCond1.multiplier),
    });

    if (extraCount === 2 && availableRetailers.length > 1) {
      const remainingRetailers = availableRetailers.filter((_, idx) => idx !== firstIdx);
      const secondIdx = (seed + 3) % remainingRetailers.length;
      const secondRetailer = remainingRetailers[secondIdx];
      const condIdx2 = (seed >> 4) % secondRetailer.conditions.length;
      const selectedCond2 = secondRetailer.conditions[condIdx2];

      baseOffers.push({
        id: "off-3",
        sellerName: secondRetailer.name,
        sellerType: secondRetailer.type,
        condition: selectedCond2.condition,
        price: Math.round(product.price * selectedCond2.multiplier),
      });
    }
  }

  return baseOffers;
}
