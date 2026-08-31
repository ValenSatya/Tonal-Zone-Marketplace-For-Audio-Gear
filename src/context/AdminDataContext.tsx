"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Buyer" | "Seller" | "Admin" | "Super Admin";
  status: "Active" | "Suspended" | "Pending";
  joined: string;
  location?: string;
  tuningPreference?: string;
}

export interface AdminStore {
  id: string;
  userId: string;
  storeName: string;
  ownerName: string;
  email: string;
  brandFocus: string;
  nik: string;
  bankName: string;
  bankAccount: string;
  address: string;
  ktpUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  rejectionReason?: string;
  revisionCount: number;
  submittedAt: string;
}

export interface AdminBrand {
  id: string;
  name: string;
  country: string;
  tier: "Flagship" | "Premium" | "Chi-Fi" | "Custom IEM";
  status: "APPROVED" | "PENDING" | "REJECTED";
  submittedBy?: string;
  productCount: number;
  createdAt: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  brand: string;
  category: "In-Ear Monitors" | "DAC / Amp" | "Upgrade Cables" | "Accessories";
  price: number;
  stock: number;
  soundSignature: "Neutral" | "Warm" | "V-Shape" | "Bright" | "Basshead";
  storeName: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  badge?: string;
  createdAt: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  sellerName: string;
  itemSummary: string;
  totalAmount: number;
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "COMPLETED" | "CANCELLED";
  courier: string;
  trackingNumber?: string;
  createdAt: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  itemCount: number;
  description: string;
}

export interface AdminBanner {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  placement: "HERO_HOME" | "PROMO_STRIP" | "POPUP_EVENT" | "CATEGORY_SPOTLIGHT";
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  active: boolean;
  order: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface AdminCourier {
  id: string;
  name: string;
  code: string;
  type: "Domestic Standard" | "Domestic Express" | "Same Day / Instant" | "International Express" | "Cargo Heavy";
  baseRateUSD: number;
  estimatedDays: string;
  insuranceRequired: boolean;
  trackingApiAvailable: boolean;
  active: boolean;
  notes?: string;
}

export interface TrackingMilestone {
  stage: "ORDER_PLACED" | "SELLER_PACKED" | "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED";
  location: string;
  timestamp: string;
  description: string;
}

export interface AdminShipmentTracking {
  id: string;
  orderId: string;
  orderNumber: string;
  trackingNumber: string;
  courierName: string;
  courierCode: string;
  sellerStore: string;
  buyerName: string;
  destinationCity: string;
  itemSummary: string;
  currentStatus: "PICKED_UP" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "FAILED_DELIVERY";
  inspectionExpiry?: string;
  escrowStatus: "HOLDING" | "RELEASE_ELIGIBLE" | "RELEASED" | "DISPUTED";
  disputeReason?: string;
  lastUpdated: string;
  milestones: TrackingMilestone[];
}

export interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  target: string;
  timestamp: string;
}

export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values: string[] = [];
    let insideQuote = false;
    let currentVal = "";

    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      if (char === '"' || char === "'") {
        insideQuote = !insideQuote;
      } else if (char === "," && !insideQuote) {
        values.push(currentVal.trim().replace(/^["']|["']$/g, ""));
        currentVal = "";
      } else {
        currentVal += char;
      }
    }
    values.push(currentVal.trim().replace(/^["']|["']$/g, ""));

    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || "";
    });
    results.push(row);
  }
  return results;
}

interface AdminDataContextType {
  // Users
  users: AdminUser[];
  addUser: (user: Omit<AdminUser, "id" | "joined">) => void;
  updateUser: (id: string, updates: Partial<AdminUser>) => void;
  deleteUser: (id: string) => void;
  bulkDeleteUsers: (ids: string[]) => void;
  bulkUpdateUserStatus: (ids: string[], status: AdminUser["status"]) => void;
  importUsers: (importedUsers: Omit<AdminUser, "id" | "joined">[]) => void;

  // Stores
  stores: AdminStore[];
  updateStoreStatus: (id: string, status: AdminStore["status"], reason?: string) => void;
  deleteStore: (id: string) => void;
  bulkUpdateStoreStatus: (ids: string[], status: AdminStore["status"]) => void;

  // Brands
  brands: AdminBrand[];
  addBrand: (brand: Omit<AdminBrand, "id" | "createdAt" | "productCount">) => void;
  updateBrand: (id: string, updates: Partial<AdminBrand>) => void;
  deleteBrand: (id: string) => void;
  bulkUpdateBrandStatus: (ids: string[], status: AdminBrand["status"]) => void;
  importBrands: (importedBrands: Omit<AdminBrand, "id" | "createdAt" | "productCount">[]) => void;

  // Products
  products: AdminProduct[];
  addProduct: (product: Omit<AdminProduct, "id" | "createdAt">) => void;
  updateProduct: (id: string, updates: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;
  bulkUpdateProductStatus: (ids: string[], status: AdminProduct["status"]) => void;
  importProducts: (importedProducts: Omit<AdminProduct, "id" | "createdAt">[]) => void;

  // Orders & Escrow
  orders: AdminOrder[];
  updateOrderStatus: (id: string, status: AdminOrder["status"], trackingNumber?: string) => void;
  deleteOrder: (id: string) => void;
  bulkUpdateOrderStatus: (ids: string[], status: AdminOrder["status"]) => void;
  importOrders: (importedOrders: Omit<AdminOrder, "id" | "createdAt">[]) => void;
  releaseEscrowPayout: (orderId: string) => void;
  refundEscrowOrder: (orderId: string, reason: string) => void;
  resolveOrderDispute: (orderId: string, resolution: "RELEASE_TO_SELLER" | "REFUND_TO_BUYER", notes: string) => void;

  // Categories
  categories: AdminCategory[];
  addCategory: (category: Omit<AdminCategory, "id" | "itemCount">) => void;
  updateCategory: (id: string, updates: Partial<AdminCategory>) => void;
  deleteCategory: (id: string) => void;

  // Banners & CMS
  banners: AdminBanner[];
  addBanner: (banner: Omit<AdminBanner, "id" | "createdAt">) => void;
  updateBanner: (id: string, updates: Partial<AdminBanner>) => void;
  deleteBanner: (id: string) => void;
  toggleBannerStatus: (id: string) => void;
  bulkUpdateBannerStatus: (ids: string[], active: boolean) => void;

  // Couriers & Logistics
  couriers: AdminCourier[];
  addCourier: (courier: Omit<AdminCourier, "id">) => void;
  updateCourier: (id: string, updates: Partial<AdminCourier>) => void;
  deleteCourier: (id: string) => void;
  toggleCourierStatus: (id: string) => void;

  // Live Shipment Tracking
  shipments: AdminShipmentTracking[];
  updateShipmentStatus: (id: string, status: AdminShipmentTracking["currentStatus"], newMilestone?: TrackingMilestone) => void;
  forceCompleteEscrow: (shipmentId: string) => void;

  // Audit Logs & Export
  auditLogs: AuditLog[];
  exportToCSV: (filename: string, rows: Record<string, any>[]) => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

// Initial Seed Data
const SEED_USERS: AdminUser[] = [
  { id: "USR-001", name: "Valen Satya", email: "valen@tonalzone.id", role: "Super Admin", status: "Active", joined: "2024-01-01", location: "Jakarta, ID", tuningPreference: "Reference / Neutral" },
  { id: "USR-002", name: "Alex Rivera", email: "alex.rivera@audiophile.io", role: "Buyer", status: "Active", joined: "2024-02-14", location: "Surabaya, ID", tuningPreference: "Warm & Musical" },
  { id: "USR-003", name: "CSI-ZONE Official", email: "store@csizone.id", role: "Seller", status: "Active", joined: "2024-02-18", location: "Bandung, ID", tuningPreference: "Harman Target" },
  { id: "USR-004", name: "Soundstage Store", email: "sales@soundstage.id", role: "Seller", status: "Active", joined: "2024-03-01", location: "Medan, ID", tuningPreference: "V-Shape Fun" },
  { id: "USR-005", name: "Budi Santoso", email: "budi.audio@gmail.com", role: "Buyer", status: "Active", joined: "2024-03-10", location: "Yogyakarta, ID", tuningPreference: "Basshead" },
  { id: "USR-006", name: "Suspected Bot", email: "spammer99@fake.ru", role: "Buyer", status: "Suspended", joined: "2024-03-12", location: "Unknown", tuningPreference: "Neutral" },
];

const SEED_STORES: AdminStore[] = [
  {
    id: "STR-101",
    userId: "USR-003",
    storeName: "CSI-ZONE Official Store",
    ownerName: "Chandra S.",
    email: "store@csizone.id",
    brandFocus: "Moondrop, Tangzu, Sennheiser",
    nik: "3273190809920001",
    bankName: "BCA",
    bankAccount: "8820192831",
    address: "Ruko Paskal Hyper Square B-12, Bandung",
    status: "APPROVED",
    revisionCount: 0,
    submittedAt: "2024-02-18",
  },
  {
    id: "STR-102",
    userId: "USR-004",
    storeName: "Soundstage ID Authorized",
    ownerName: "Hendra Wijaya",
    email: "sales@soundstage.id",
    brandFocus: "64 Audio, Chord, FatFreq",
    nik: "3171021405880003",
    bankName: "Mandiri",
    bankAccount: "1310098273612",
    address: "Plaza Glodok Lt. 2 Blok C-10, Jakarta",
    status: "APPROVED",
    revisionCount: 0,
    submittedAt: "2024-03-01",
  },
  {
    id: "STR-103",
    userId: "USR-007",
    storeName: "Audiophile Surabaya Garage",
    ownerName: "Kevin Lie",
    email: "kevin.surabaya@gmail.com",
    brandFocus: "Sennheiser, Effect Audio",
    nik: "3578012803950002",
    bankName: "BCA",
    bankAccount: "5120491823",
    address: "Jl. Mayjen Sungkono No. 88, Surabaya",
    status: "PENDING",
    revisionCount: 0,
    submittedAt: "2024-03-14",
  },
  {
    id: "STR-104",
    userId: "USR-008",
    storeName: "Direct China Audio Importer",
    ownerName: "Wang Shen",
    email: "wang.import@china.com",
    brandFocus: "Unverified IEMs",
    nik: "0000000000000000",
    bankName: "BCA",
    bankAccount: "1111111111",
    address: "Alamat tidak lengkap",
    status: "REJECTED",
    rejectionReason: "NIK palsu dan dokumen legalitas tidak terbaca.",
    revisionCount: 2,
    submittedAt: "2024-03-11",
  },
];

const SEED_BRANDS: AdminBrand[] = [
  { id: "BRD-01", name: "SENNHEISER", country: "Germany", tier: "Flagship", status: "APPROVED", productCount: 14, createdAt: "2024-01-01" },
  { id: "BRD-02", name: "MOONDROP", country: "China", tier: "Chi-Fi", status: "APPROVED", productCount: 28, createdAt: "2024-01-01" },
  { id: "BRD-03", name: "64 AUDIO", country: "USA", tier: "Flagship", status: "APPROVED", productCount: 9, createdAt: "2024-01-05" },
  { id: "BRD-04", name: "CHORD AUDIO", country: "UK", tier: "Flagship", status: "APPROVED", productCount: 6, createdAt: "2024-01-10" },
  { id: "BRD-05", name: "EFFECT AUDIO", country: "Singapore", tier: "Premium", status: "APPROVED", productCount: 12, createdAt: "2024-01-15" },
  { id: "BRD-06", name: "FATFREQ", country: "Singapore", tier: "Custom IEM", status: "APPROVED", productCount: 7, createdAt: "2024-01-20" },
  { id: "BRD-07", name: "TANGZU AUDIO", country: "China", tier: "Chi-Fi", status: "APPROVED", productCount: 18, createdAt: "2024-02-01" },
  { id: "BRD-08", name: "Custom IEM Craft ID", country: "Indonesia", tier: "Custom IEM", status: "PENDING", submittedBy: "Audiophile Surabaya Garage", productCount: 0, createdAt: "2024-03-14" },
];

const SEED_PRODUCTS: AdminProduct[] = [
  { id: "prod-1", name: "SENNHEISER IE 900", brand: "SENNHEISER", category: "In-Ear Monitors", price: 1299, stock: 8, soundSignature: "V-Shape", storeName: "CSI-ZONE Official Store", status: "APPROVED", badge: "BEST SELLER", createdAt: "2024-01-10" },
  { id: "prod-2", name: "MOONDROP BLESSING 3", brand: "MOONDROP", category: "In-Ear Monitors", price: 319, stock: 24, soundSignature: "Neutral", storeName: "CSI-ZONE Official Store", status: "APPROVED", badge: "NEW ARRIVAL", createdAt: "2024-01-12" },
  { id: "prod-3", name: "CHORD MOJO 2 DAC", brand: "CHORD AUDIO", category: "DAC / Amp", price: 899, stock: 5, soundSignature: "Neutral", storeName: "Soundstage ID Authorized", status: "APPROVED", badge: "REFERENCE", createdAt: "2024-01-15" },
  { id: "prod-4", name: "EFFECT AUDIO ARES S", brand: "EFFECT AUDIO", category: "Upgrade Cables", price: 249, stock: 15, soundSignature: "Warm", storeName: "Soundstage ID Authorized", status: "APPROVED", createdAt: "2024-01-20" },
  { id: "prod-5", name: "64 AUDIO U12T REFERENCE", brand: "64 AUDIO", category: "In-Ear Monitors", price: 2499, stock: 3, soundSignature: "Neutral", storeName: "Soundstage ID Authorized", status: "APPROVED", badge: "GRAIL", createdAt: "2024-02-01" },
  { id: "prod-6", name: "TANGZU WAN'ER SG 2", brand: "TANGZU AUDIO", category: "In-Ear Monitors", price: 19, stock: 120, soundSignature: "Warm", storeName: "CSI-ZONE Official Store", status: "APPROVED", badge: "BEST SELLER", createdAt: "2024-02-10" },
  { id: "prod-7", name: "FATFREQ MAESTRO MINI", brand: "FATFREQ", category: "In-Ear Monitors", price: 450, stock: 7, soundSignature: "Basshead", storeName: "Soundstage ID Authorized", status: "APPROVED", createdAt: "2024-02-15" },
  { id: "prod-8", name: "DIY Silver OCC Cable 8-Core", brand: "Custom IEM Craft ID", category: "Upgrade Cables", price: 85, stock: 10, soundSignature: "Bright", storeName: "Audiophile Surabaya Garage", status: "PENDING", createdAt: "2024-03-14" },
];

const SEED_ORDERS: AdminOrder[] = [
  { id: "ord-1", orderNumber: "TZ-9921", buyerName: "Alex Rivera", buyerEmail: "alex.rivera@audiophile.io", sellerName: "CSI-ZONE Official Store", itemSummary: "Sennheiser IE 900 (3.5mm)", totalAmount: 1299, status: "PAID", courier: "Express Shipping", createdAt: "2024-03-14 10:23" },
  { id: "ord-2", orderNumber: "TZ-9922", buyerName: "Budi Santoso", buyerEmail: "budi.audio@gmail.com", sellerName: "Soundstage ID Authorized", itemSummary: "Chord Mojo 2 DAC + Ares S", totalAmount: 1148, status: "SHIPPED", courier: "Instant Courier", trackingNumber: "JNE-88291039841", createdAt: "2024-03-13 14:15" },
  { id: "ord-3", orderNumber: "TZ-9923", buyerName: "Valen Satya", buyerEmail: "valen@tonalzone.id", sellerName: "CSI-ZONE Official Store", itemSummary: "Tangzu Wan'er SG 2", totalAmount: 19, status: "COMPLETED", courier: "Standard Delivery", trackingNumber: "SICEPAT-991203", createdAt: "2024-03-11 09:00" },
  { id: "ord-4", orderNumber: "TZ-9924", buyerName: "Guest Checkout", buyerEmail: "guest.buyer@yahoo.com", sellerName: "Soundstage ID Authorized", itemSummary: "64 Audio U12t Reference", totalAmount: 2499, status: "PENDING", courier: "Express Shipping", createdAt: "2024-03-14 15:40" },
];

const SEED_CATEGORIES: AdminCategory[] = [
  { id: "cat-1", name: "In-Ear Monitors", slug: "in-ear-monitors", itemCount: 86, description: "Precision multi-driver, planar, and single dynamic driver in-ear monitors." },
  { id: "cat-2", name: "DAC / Headphone Amplifiers", slug: "dac-amplifiers", itemCount: 34, description: "Portable and desktop digital-to-analog converters." },
  { id: "cat-3", name: "Audiophile Upgrade Cables", slug: "upgrade-cables", itemCount: 42, description: "Pure silver, OCC copper, and gold-plated shielding cables." },
  { id: "cat-4", name: "Eartips & Accessories", slug: "accessories", itemCount: 58, description: "Medical-grade silicone, memory foam tips, and pelican protective cases." },
];

const SEED_BANNERS: AdminBanner[] = [
  {
    id: "BAN-001",
    title: "DISCOVER THE PINNACLE OF AUDIOPHILE SOUND",
    subtitle: "Precision engineered In-Ear Monitors & Reference DAC/Amps with verified authenticity guarantee.",
    badge: "FLAGSHIP COLLECTION",
    placement: "HERO_HOME",
    imageUrl: "/model-iem-untuk-hero.webp",
    ctaText: "Explore Collection",
    ctaLink: "/collection",
    active: true,
    order: 1,
    createdAt: "2026-08-01",
  },
  {
    id: "BAN-002",
    title: "HANDCRAFTED UPGRADE CABLES & ARTISAN GEAR",
    subtitle: "8-Core Monocrystalline Copper, Silver Shielding & 4.4mm Balanced terminations.",
    badge: "ARTISAN AUDIO",
    placement: "HERO_HOME",
    imageUrl: "/placeholder.svg",
    ctaText: "Shop Accessories",
    ctaLink: "/search?q=ACCESSORIES",
    active: true,
    order: 2,
    createdAt: "2026-08-05",
  },
  {
    id: "BAN-003",
    title: "100% ESCROW PROTECTED TRANSACTIONS",
    subtitle: "Your funds are held securely until you inspect, test, and verify your audiophile gear upon delivery.",
    badge: "ZERO RISK ESCROW",
    placement: "PROMO_STRIP",
    imageUrl: "/placeholder.svg",
    ctaText: "How Escrow Works",
    ctaLink: "/support#escrow",
    active: true,
    order: 1,
    createdAt: "2026-08-10",
  },
  {
    id: "BAN-004",
    title: "MID-YEAR AUDIOPHILE FESTIVAL 2026",
    subtitle: "Exclusive deals up to 35% OFF on select Flagship IEMs and Portable DACs from Authorized Dealers.",
    badge: "LIMITED EVENT",
    placement: "POPUP_EVENT",
    imageUrl: "/placeholder.svg",
    ctaText: "Claim Deals",
    ctaLink: "/collection?filter=sale",
    active: false,
    order: 1,
    createdAt: "2026-08-12",
  },
];

const SEED_COURIERS: AdminCourier[] = [
  {
    id: "courier-1",
    name: "JNE Express (Reguler & YES)",
    code: "JNE",
    type: "Domestic Express",
    baseRateUSD: 3,
    estimatedDays: "1 - 2 Days",
    insuranceRequired: true,
    trackingApiAvailable: true,
    active: true,
    notes: "Default partner for nationwide domestic audiophile parcel delivery.",
  },
  {
    id: "courier-2",
    name: "SiCepat Express (BEST)",
    code: "SICEPAT",
    type: "Domestic Express",
    baseRateUSD: 3,
    estimatedDays: "1 - 2 Days",
    insuranceRequired: true,
    trackingApiAvailable: true,
    active: true,
    notes: "High reliability for premium packaging and doorstep delivery.",
  },
  {
    id: "courier-3",
    name: "J&T Cargo (Heavy Tube Amps & DACs)",
    code: "JNT_CARGO",
    type: "Cargo Heavy",
    baseRateUSD: 6,
    estimatedDays: "2 - 4 Days",
    insuranceRequired: true,
    trackingApiAvailable: true,
    active: true,
    notes: "Wooden palleting and heavy equipment handling.",
  },
  {
    id: "courier-4",
    name: "GoSend / GrabExpress Instant",
    code: "GOSEND",
    type: "Same Day / Instant",
    baseRateUSD: 4,
    estimatedDays: "1 - 3 Hours",
    insuranceRequired: true,
    trackingApiAvailable: true,
    active: true,
    notes: "Instant city delivery within Jakarta, Bandung, and Surabaya.",
  },
  {
    id: "courier-5",
    name: "DHL Express International",
    code: "DHL",
    type: "International Express",
    baseRateUSD: 25,
    estimatedDays: "2 - 4 Days",
    insuranceRequired: true,
    trackingApiAvailable: true,
    active: true,
    notes: "Direct express worldwide shipping for bespoke custom IEMs.",
  },
  {
    id: "courier-6",
    name: "FedEx International Priority",
    code: "FEDEX",
    type: "International Express",
    baseRateUSD: 28,
    estimatedDays: "2 - 3 Days",
    insuranceRequired: true,
    trackingApiAvailable: true,
    active: false,
    notes: "Backup international express courier partner.",
  },
];

const SEED_SHIPMENTS: AdminShipmentTracking[] = [
  {
    id: "SHP-8801",
    orderId: "ord-2",
    orderNumber: "TZ-9922",
    trackingNumber: "JNE-88291039841",
    courierName: "JNE Express (YES)",
    courierCode: "JNE",
    sellerStore: "Soundstage ID Authorized",
    buyerName: "Budi Santoso",
    destinationCity: "Yogyakarta, ID",
    itemSummary: "Chord Mojo 2 DAC + Ares S",
    currentStatus: "IN_TRANSIT",
    escrowStatus: "HOLDING",
    lastUpdated: "2026-08-16 07:30",
    milestones: [
      { stage: "ORDER_PLACED", location: "Online Marketplace", timestamp: "2026-08-13 14:15", description: "Pembayaran telah diamankan oleh Tonal Zone Escrow." },
      { stage: "SELLER_PACKED", location: "Soundstage Store Hub, Medan", timestamp: "2026-08-13 17:00", description: "Pesanan telah dikemas dengan bubble wrap tebal dan segel keaslian." },
      { stage: "PICKED_UP", location: "JNE Drop Point Medan", timestamp: "2026-08-13 19:30", description: "Paket telah di-pickup oleh kurir JNE." },
      { stage: "IN_TRANSIT", location: "Sortation Gateway Hub Jakarta", timestamp: "2026-08-14 08:20", description: "Paket dalam perjalanan via jalur udara menuju Yogyakarta Transit Hub." },
    ],
  },
  {
    id: "SHP-8802",
    orderId: "ord-3",
    orderNumber: "TZ-9923",
    trackingNumber: "SICEPAT-991203",
    courierName: "SiCepat Express",
    courierCode: "SICEPAT",
    sellerStore: "CSI-ZONE Official Store",
    buyerName: "Valen Satya",
    destinationCity: "Jakarta Selatan, ID",
    itemSummary: "Tangzu Wan'er SG 2",
    currentStatus: "DELIVERED",
    escrowStatus: "RELEASED",
    lastUpdated: "2026-08-12 16:45",
    milestones: [
      { stage: "ORDER_PLACED", location: "Online Marketplace", timestamp: "2026-08-11 09:00", description: "Pembayaran diverifikasi ke Escrow." },
      { stage: "SELLER_PACKED", location: "CSI Bandung Warehouse", timestamp: "2026-08-11 11:30", description: "Paket siap dikirim." },
      { stage: "PICKED_UP", location: "SiCepat Bandung", timestamp: "2026-08-11 14:00", description: "Diambil oleh kurir SiCepat." },
      { stage: "OUT_FOR_DELIVERY", location: "SiCepat Kebayoran Baru", timestamp: "2026-08-12 09:15", description: "Kurir mengantar ke alamat tujuan." },
      { stage: "DELIVERED", location: "Jakarta Selatan", timestamp: "2026-08-12 13:40", description: "Paket diterima oleh Valen Satya. Inspeksi selesai & Escrow dilepas." },
    ],
  },
  {
    id: "SHP-8803",
    orderId: "ord-1",
    orderNumber: "TZ-9921",
    trackingNumber: "DHL-550192384",
    courierName: "DHL Express",
    courierCode: "DHL",
    sellerStore: "CSI-ZONE Official Store",
    buyerName: "Alex Rivera",
    destinationCity: "Surabaya, ID",
    itemSummary: "Sennheiser IE 900 (3.5mm)",
    currentStatus: "OUT_FOR_DELIVERY",
    escrowStatus: "HOLDING",
    lastUpdated: "2026-08-16 08:45",
    milestones: [
      { stage: "ORDER_PLACED", location: "Online Marketplace", timestamp: "2026-08-14 10:23", description: "Dana diamankan di Escrow Tonal Zone." },
      { stage: "SELLER_PACKED", location: "CSI Bandung Warehouse", timestamp: "2026-08-14 13:00", description: "Pengepakan paket high-end IEM dengan asuransi penuh." },
      { stage: "PICKED_UP", location: "DHL Express Service Point Bandung", timestamp: "2026-08-14 16:30", description: "Paket diproses di sistem logistik DHL." },
      { stage: "IN_TRANSIT", location: "Juanda International Gateway", timestamp: "2026-08-15 21:00", description: "Tiba di pusat distribusi Surabaya." },
      { stage: "OUT_FOR_DELIVERY", location: "Surabaya Hub", timestamp: "2026-08-16 08:30", description: "Kurir DHL sedang menuju lokasi penerima." },
    ],
  },
  {
    id: "SHP-8804",
    orderId: "ord-4",
    orderNumber: "TZ-9924",
    trackingNumber: "JNT-440219",
    courierName: "J&T Cargo",
    courierCode: "JNT_CARGO",
    sellerStore: "Soundstage ID Authorized",
    buyerName: "Guest Checkout",
    destinationCity: "Denpasar, Bali",
    itemSummary: "64 Audio U12t Reference",
    currentStatus: "DELIVERED",
    inspectionExpiry: "2026-08-17 15:40",
    escrowStatus: "RELEASE_ELIGIBLE",
    lastUpdated: "2026-08-16 08:15",
    milestones: [
      { stage: "ORDER_PLACED", location: "Online Marketplace", timestamp: "2026-08-14 15:40", description: "Dana diamankan di Escrow." },
      { stage: "SELLER_PACKED", location: "Soundstage Store Hub, Medan", timestamp: "2026-08-14 18:00", description: "Disiapkan dengan box pelican & segel hologram." },
      { stage: "PICKED_UP", location: "J&T Cargo Medan", timestamp: "2026-08-14 20:00", description: "Diproses kurir kargo." },
      { stage: "IN_TRANSIT", location: "Denpasar Gateway Hub", timestamp: "2026-08-15 22:30", description: "Tiba di Bali." },
      { stage: "DELIVERED", location: "Denpasar, Bali", timestamp: "2026-08-16 08:15", description: "Paket diterima di pos sekuriti. Masa inspeksi 2x24 jam dimulai." },
    ],
  },
];

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<AdminUser[]>(SEED_USERS);
  const [stores, setStores] = useState<AdminStore[]>(SEED_STORES);
  const [brands, setBrands] = useState<AdminBrand[]>(SEED_BRANDS);
  const [products, setProducts] = useState<AdminProduct[]>(SEED_PRODUCTS);
  const [orders, setOrders] = useState<AdminOrder[]>(SEED_ORDERS);
  const [categories, setCategories] = useState<AdminCategory[]>(SEED_CATEGORIES);
  const [banners, setBanners] = useState<AdminBanner[]>(SEED_BANNERS);
  const [couriers, setCouriers] = useState<AdminCourier[]>(SEED_COURIERS);
  const [shipments, setShipments] = useState<AdminShipmentTracking[]>(SEED_SHIPMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Safely load saved state from localStorage after initial client mount
  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem("tonalzone_admin_users");
      if (savedUsers) setUsers(JSON.parse(savedUsers));

      const savedStores = localStorage.getItem("tonalzone_admin_stores");
      if (savedStores) setStores(JSON.parse(savedStores));

      const savedBrands = localStorage.getItem("tonalzone_admin_brands");
      if (savedBrands) setBrands(JSON.parse(savedBrands));

      const savedProducts = localStorage.getItem("tonalzone_admin_products");
      if (savedProducts) setProducts(JSON.parse(savedProducts));

      const savedOrders = localStorage.getItem("tonalzone_admin_orders");
      if (savedOrders) setOrders(JSON.parse(savedOrders));

      const savedCategories = localStorage.getItem("tonalzone_admin_categories");
      if (savedCategories) setCategories(JSON.parse(savedCategories));

      const savedBanners = localStorage.getItem("tonalzone_admin_banners");
      if (savedBanners) setBanners(JSON.parse(savedBanners));

      const savedCouriers = localStorage.getItem("tonalzone_admin_couriers");
      if (savedCouriers) setCouriers(JSON.parse(savedCouriers));

      const savedShipments = localStorage.getItem("tonalzone_admin_shipments");
      if (savedShipments) setShipments(JSON.parse(savedShipments));
    } catch (e) {
      console.error("Error loading admin data from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync state to localStorage only AFTER initial load has completed
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("tonalzone_admin_users", JSON.stringify(users));
      localStorage.setItem("tonalzone_admin_stores", JSON.stringify(stores));
      localStorage.setItem("tonalzone_admin_brands", JSON.stringify(brands));
      localStorage.setItem("tonalzone_admin_products", JSON.stringify(products));
      localStorage.setItem("tonalzone_admin_orders", JSON.stringify(orders));
      localStorage.setItem("tonalzone_admin_categories", JSON.stringify(categories));
      localStorage.setItem("tonalzone_admin_banners", JSON.stringify(banners));
      localStorage.setItem("tonalzone_admin_couriers", JSON.stringify(couriers));
      localStorage.setItem("tonalzone_admin_shipments", JSON.stringify(shipments));
    } catch (e) {}
  }, [users, stores, brands, products, orders, categories, banners, couriers, shipments, isLoaded]);

  const logAction = (action: string, target: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      adminName: "Super Admin",
      action,
      target,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 50)]);
  };

  // User Actions
  const addUser = useCallback((user: Omit<AdminUser, "id" | "joined">) => {
    const newUser: AdminUser = {
      ...user,
      id: `USR-${Date.now().toString().slice(-4)}`,
      joined: new Date().toISOString().split("T")[0],
    };
    setUsers((prev) => [newUser, ...prev]);
    logAction("Created User", `${newUser.name} (${newUser.role})`);
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<AdminUser>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    logAction("Updated User", `User ID ${id}`);
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    logAction("Deleted User", `User ID ${id}`);
  }, []);

  const bulkDeleteUsers = useCallback((ids: string[]) => {
    setUsers((prev) => prev.filter((u) => !ids.includes(u.id)));
    logAction("Bulk Delete Users", `${ids.length} users removed`);
  }, []);

  const bulkUpdateUserStatus = useCallback((ids: string[], status: AdminUser["status"]) => {
    setUsers((prev) => prev.map((u) => (ids.includes(u.id) ? { ...u, status } : u)));
    logAction("Bulk User Status", `${ids.length} users set to ${status}`);
  }, []);

  // Live fetch orders from API on load
  useEffect(() => {
    const fetchLiveOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) return;
        const text = await res.text();
        let data: any = null;
        try {
          data = JSON.parse(text);
        } catch {
          return;
        }
        if (data && data.success && Array.isArray(data.orders) && data.orders.length > 0) {
          const liveOrders: AdminOrder[] = data.orders.map((o: any) => ({
            id: o.id,
            orderNumber: o.id.startsWith("TZ-") ? o.id : `TZ-${o.id.slice(-4)}`,
            buyerName: o.buyerName || o.destinationCity || "Audiophile Buyer",
            buyerEmail: o.buyerEmail || "buyer@tonalzone.id",
            sellerName: "Soundstage ID Authorized",
            itemSummary: o.items?.[0]?.productName || "Audiophile Gear",
            totalAmount: o.totalAmount || 0,
            status: (o.escrowStatus === "COMPLETED"
              ? "COMPLETED"
              : o.escrowStatus === "IN_TRANSIT" || o.escrowStatus === "SHIPPED"
              ? "SHIPPED"
              : o.escrowStatus === "HELD_IN_ESCROW" || o.escrowStatus === "PAID"
              ? "PAID"
              : "PENDING") as AdminOrder["status"],
            courier: o.courierCode || "JNE Express",
            trackingNumber: o.waybillNumber || undefined,
            createdAt: new Date(o.createdAt).toISOString().replace("T", " ").substring(0, 16),
          }));

          setOrders((prev) => {
            const combined = [...liveOrders];
            prev.forEach((p) => {
              if (!combined.some((c) => c.id === p.id)) {
                combined.push(p);
              }
            });
            return combined;
          });
        }
      } catch (err) {
        console.warn("Could not fetch live orders for admin:", err);
      }
    };

    fetchLiveOrders();
  }, []);

  // Store Actions
  const updateStoreStatus = useCallback(async (id: string, status: AdminStore["status"], reason?: string) => {
    setStores((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status,
              rejectionReason: reason || s.rejectionReason,
              revisionCount: status === "REJECTED" ? s.revisionCount + 1 : s.revisionCount,
            }
          : s
      )
    );
    logAction(`Store ${status}`, `Store ID ${id} - ${reason || ""}`);

    // Sync to Supabase Backend
    try {
      await fetch("/api/admin/approve-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: id,
          action: status === "APPROVED" ? "APPROVE" : "REJECT",
          reason,
        }),
      });
    } catch (err) {
      console.warn("Could not sync store approval to backend:", err);
    }
  }, []);

  const deleteStore = useCallback((id: string) => {
    setStores((prev) => prev.filter((s) => s.id !== id));
    logAction("Deleted Store", `Store ID ${id}`);
  }, []);

  const bulkUpdateStoreStatus = useCallback((ids: string[], status: AdminStore["status"]) => {
    setStores((prev) => prev.map((s) => (ids.includes(s.id) ? { ...s, status } : s)));
    logAction("Bulk Store Approval", `${ids.length} stores set to ${status}`);
  }, []);

  // Brand Actions
  const addBrand = useCallback((brand: Omit<AdminBrand, "id" | "createdAt" | "productCount">) => {
    const newBrand: AdminBrand = {
      ...brand,
      id: `BRD-${Date.now().toString().slice(-3)}`,
      productCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setBrands((prev) => [newBrand, ...prev]);
    logAction("Added Brand", newBrand.name);
  }, []);

  const updateBrand = useCallback((id: string, updates: Partial<AdminBrand>) => {
    setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    logAction("Updated Brand", `Brand ID ${id}`);
  }, []);

  const deleteBrand = useCallback((id: string) => {
    setBrands((prev) => prev.filter((b) => b.id !== id));
    logAction("Deleted Brand", `Brand ID ${id}`);
  }, []);

  const bulkUpdateBrandStatus = useCallback((ids: string[], status: AdminBrand["status"]) => {
    setBrands((prev) => prev.map((b) => (ids.includes(b.id) ? { ...b, status } : b)));
    logAction("Bulk Brand Status", `${ids.length} brands set to ${status}`);
  }, []);

  // Product Actions
  const addProduct = useCallback((product: Omit<AdminProduct, "id" | "createdAt">) => {
    const newProduct: AdminProduct = {
      ...product,
      id: `prod-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setProducts((prev) => [newProduct, ...prev]);
    logAction("Added Product", newProduct.name);
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<AdminProduct>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    logAction("Updated Product", `Product ID ${id}`);
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    logAction("Deleted Product", `Product ID ${id}`);
  }, []);

  const bulkUpdateProductStatus = useCallback((ids: string[], status: AdminProduct["status"]) => {
    setProducts((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, status } : p)));
    logAction("Bulk Product Status", `${ids.length} products set to ${status}`);
  }, []);

  // Order Actions
  const updateOrderStatus = useCallback((id: string, status: AdminOrder["status"], trackingNumber?: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status,
              trackingNumber: trackingNumber !== undefined ? trackingNumber : o.trackingNumber,
            }
          : o
      )
    );
    logAction("Order Status Updated", `Order ${id} -> ${status}`);
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    logAction("Deleted Order", `Order ID ${id}`);
  }, []);

  const bulkUpdateOrderStatus = useCallback((ids: string[], status: AdminOrder["status"]) => {
    setOrders((prev) => prev.map((o) => (ids.includes(o.id) ? { ...o, status } : o)));
    logAction("Bulk Order Status", `${ids.length} orders set to ${status}`);
  }, []);

  // Category Actions
  const addCategory = useCallback((category: Omit<AdminCategory, "id" | "itemCount">) => {
    const newCat: AdminCategory = {
      ...category,
      id: `cat-${Date.now().toString().slice(-3)}`,
      itemCount: 0,
    };
    setCategories((prev) => [...prev, newCat]);
    logAction("Created Category", newCat.name);
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<AdminCategory>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    logAction("Updated Category", `Category ID ${id}`);
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    logAction("Deleted Category", `Category ID ${id}`);
  }, []);

  // Universal CSV Exporter
  const exportToCSV = useCallback((filename: string, rows: Record<string, any>[]) => {
    if (!rows || !rows.length) return;
    const separator = ",";
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      "\n" +
      rows
        .map((row) =>
          keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? "" : row[k];
              cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
              return cell;
            })
            .join(separator)
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAction("Exported CSV", filename);
  }, []);

  // Import Actions
  const importUsers = useCallback((importedUsers: Omit<AdminUser, "id" | "joined">[]) => {
    const newItems: AdminUser[] = importedUsers.map((u, idx) => ({
      ...u,
      id: `USR-${(Date.now() + idx).toString().slice(-4)}`,
      joined: new Date().toISOString().split("T")[0],
    }));
    setUsers((prev) => [...newItems, ...prev]);
    logAction("Imported Users", `${newItems.length} users imported from CSV`);
  }, []);

  const importBrands = useCallback((importedBrands: Omit<AdminBrand, "id" | "createdAt" | "productCount">[]) => {
    const newItems: AdminBrand[] = importedBrands.map((b, idx) => ({
      ...b,
      id: `BRD-${(Date.now() + idx).toString().slice(-3)}`,
      productCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }));
    setBrands((prev) => [...newItems, ...prev]);
    logAction("Imported Brands", `${newItems.length} brands imported from CSV`);
  }, []);

  const importProducts = useCallback((importedProducts: Omit<AdminProduct, "id" | "createdAt">[]) => {
    const newItems: AdminProduct[] = importedProducts.map((p, idx) => ({
      ...p,
      id: `PRD-${(Date.now() + idx).toString().slice(-4)}`,
      createdAt: new Date().toISOString().split("T")[0],
    }));
    setProducts((prev) => [...newItems, ...prev]);
    logAction("Imported Products", `${newItems.length} products imported from CSV`);
  }, []);

  const importOrders = useCallback((importedOrders: Omit<AdminOrder, "id" | "createdAt">[]) => {
    const newItems: AdminOrder[] = importedOrders.map((o, idx) => ({
      ...o,
      id: `ORD-${(Date.now() + idx).toString().slice(-4)}`,
      createdAt: new Date().toISOString().split("T")[0],
    }));
    setOrders((prev) => [...newItems, ...prev]);
    logAction("Imported Orders", `${newItems.length} orders imported from CSV`);
  }, []);

  // Banner Actions
  const addBanner = useCallback((banner: Omit<AdminBanner, "id" | "createdAt">) => {
    const newBanner: AdminBanner = {
      ...banner,
      id: `BAN-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setBanners((prev) => [...prev, newBanner]);
    logAction("Created Banner", newBanner.title);
  }, []);

  const updateBanner = useCallback((id: string, updates: Partial<AdminBanner>) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    logAction("Updated Banner", `Banner ID ${id}`);
  }, []);

  const deleteBanner = useCallback((id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    logAction("Deleted Banner", `Banner ID ${id}`);
  }, []);

  const toggleBannerStatus = useCallback((id: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    );
    logAction("Toggled Banner Status", `Banner ID ${id}`);
  }, []);

  const bulkUpdateBannerStatus = useCallback((ids: string[], active: boolean) => {
    setBanners((prev) => prev.map((b) => (ids.includes(b.id) ? { ...b, active } : b)));
    logAction("Bulk Banner Status Update", `${ids.length} banners set to ${active ? "Active" : "Inactive"}`);
  }, []);

  // Escrow & Settlement Actions
  const releaseEscrowPayout = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "COMPLETED" as const } : o))
    );
    setShipments((prev) =>
      prev.map((s) =>
        s.orderId === orderId || s.id === orderId
          ? {
              ...s,
              currentStatus: "DELIVERED" as const,
              escrowStatus: "RELEASED" as const,
              lastUpdated: new Date().toISOString().replace("T", " ").slice(0, 16),
            }
          : s
      )
    );
    logAction("Escrow Payout Released", `Funds released to seller for Order ${orderId}`);
  }, []);

  const refundEscrowOrder = useCallback((orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "CANCELLED" as const } : o))
    );
    setShipments((prev) =>
      prev.map((s) =>
        s.orderId === orderId || s.id === orderId
          ? {
              ...s,
              escrowStatus: "DISPUTED" as const,
              disputeReason: reason,
              lastUpdated: new Date().toISOString().replace("T", " ").slice(0, 16),
            }
          : s
      )
    );
    logAction("Escrow Refunded", `100% refund issued to buyer for Order ${orderId} (${reason})`);
  }, []);

  const resolveOrderDispute = useCallback((
    orderId: string,
    resolution: "RELEASE_TO_SELLER" | "REFUND_TO_BUYER",
    notes: string
  ) => {
    if (resolution === "RELEASE_TO_SELLER") {
      releaseEscrowPayout(orderId);
    } else {
      refundEscrowOrder(orderId, notes);
    }
    logAction("Dispute Resolved", `Order ${orderId} resolved: ${resolution} - ${notes}`);
  }, [releaseEscrowPayout, refundEscrowOrder]);

  // Courier Partner Actions
  const addCourier = useCallback((courier: Omit<AdminCourier, "id">) => {
    const newCourier: AdminCourier = {
      ...courier,
      id: `courier-${Date.now().toString().slice(-4)}`,
    };
    setCouriers((prev) => [...prev, newCourier]);
    logAction("Added Courier Partner", newCourier.name);
  }, []);

  const updateCourier = useCallback((id: string, updates: Partial<AdminCourier>) => {
    setCouriers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    logAction("Updated Courier", `Courier ID ${id}`);
  }, []);

  const deleteCourier = useCallback((id: string) => {
    setCouriers((prev) => prev.filter((c) => c.id !== id));
    logAction("Deleted Courier", `Courier ID ${id}`);
  }, []);

  const toggleCourierStatus = useCallback((id: string) => {
    setCouriers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
    logAction("Toggled Courier Partner Status", `Courier ID ${id}`);
  }, []);

  // Live Shipment Tracking Actions
  const updateShipmentStatus = useCallback((
    id: string,
    status: AdminShipmentTracking["currentStatus"],
    newMilestone?: TrackingMilestone
  ) => {
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updatedMilestones = newMilestone ? [...s.milestones, newMilestone] : s.milestones;
          const isDelivered = status === "DELIVERED";
          return {
            ...s,
            currentStatus: status,
            escrowStatus: isDelivered ? ("RELEASE_ELIGIBLE" as const) : s.escrowStatus,
            inspectionExpiry: isDelivered ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().replace("T", " ").slice(0, 16) : s.inspectionExpiry,
            lastUpdated: new Date().toISOString().replace("T", " ").slice(0, 16),
            milestones: updatedMilestones,
          };
        }
        return s;
      })
    );
    logAction("Shipment Status Updated", `Shipment ${id} -> ${status}`);
  }, []);

  const forceCompleteEscrow = useCallback((shipmentId: string) => {
    const shipment = shipments.find((s) => s.id === shipmentId);
    if (shipment) {
      releaseEscrowPayout(shipment.orderId);
    }
  }, [shipments, releaseEscrowPayout]);

  // Memoize entire context value to eliminate cascading re-renders
  const contextValue = useMemo<AdminDataContextType>(
    () => ({
      users,
      addUser,
      updateUser,
      deleteUser,
      bulkDeleteUsers,
      bulkUpdateUserStatus,
      importUsers,
      stores,
      updateStoreStatus,
      deleteStore,
      bulkUpdateStoreStatus,
      brands,
      addBrand,
      updateBrand,
      deleteBrand,
      bulkUpdateBrandStatus,
      importBrands,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      bulkUpdateProductStatus,
      importProducts,
      orders,
      updateOrderStatus,
      deleteOrder,
      bulkUpdateOrderStatus,
      importOrders,
      releaseEscrowPayout,
      refundEscrowOrder,
      resolveOrderDispute,
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      banners,
      addBanner,
      updateBanner,
      deleteBanner,
      toggleBannerStatus,
      bulkUpdateBannerStatus,
      couriers,
      addCourier,
      updateCourier,
      deleteCourier,
      toggleCourierStatus,
      shipments,
      updateShipmentStatus,
      forceCompleteEscrow,
      auditLogs,
      exportToCSV,
    }),
    [
      users,
      addUser,
      updateUser,
      deleteUser,
      bulkDeleteUsers,
      bulkUpdateUserStatus,
      importUsers,
      stores,
      updateStoreStatus,
      deleteStore,
      bulkUpdateStoreStatus,
      brands,
      addBrand,
      updateBrand,
      deleteBrand,
      bulkUpdateBrandStatus,
      importBrands,
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      bulkUpdateProductStatus,
      importProducts,
      orders,
      updateOrderStatus,
      deleteOrder,
      bulkUpdateOrderStatus,
      importOrders,
      releaseEscrowPayout,
      refundEscrowOrder,
      resolveOrderDispute,
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      banners,
      addBanner,
      updateBanner,
      deleteBanner,
      toggleBannerStatus,
      bulkUpdateBannerStatus,
      couriers,
      addCourier,
      updateCourier,
      deleteCourier,
      toggleCourierStatus,
      shipments,
      updateShipmentStatus,
      forceCompleteEscrow,
      auditLogs,
      exportToCSV,
    ]
  );

  return (
    <AdminDataContext.Provider value={contextValue}>
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error("useAdminData must be used within an AdminDataProvider");
  }
  return context;
}
