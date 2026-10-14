import { prisma } from "./prisma";
import { serverBroadcastRealtime } from "./server-realtime";
import { supabase } from "./supabase";

export { prisma, supabase };

// -------------------------------------------------------------
// TYPES & INTERFACES (100% COMPATIBLE WITH TONALZONE APPLICATION)
// -------------------------------------------------------------
export interface DbUser {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
  role: "BUYER" | "SELLER" | "ADMIN";
  location?: string | null;
  language?: string | null;
  tuningPreference?: string | null;
  passwordHash?: string | null;
  createdAt?: string;
  updatedAt?: string;
  store?: DbStore | null;
  addresses?: DbUserAddress[];
}

export interface DbUserAddress {
  id: string;
  label?: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  province?: string;
  postalCode: string;
  country?: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface DbStore {
  id: string;
  userId: string;
  storeName: string;
  description?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  address?: string | null;
  bankName?: string | null;
  bankAccount?: string | null;
  nik?: string | null;
  ktpUrl?: string | null;
  logo?: string | null;
  banner?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  rating?: number;
  totalSales?: number;
  rejectionReason?: string | null;
  revisionCount?: number;
  createdAt?: string;
  updatedAt?: string;
  storeType?: "RETAIL_MERCHANT" | "OFFICIAL_BRAND";
  brandName?: string | null;
}

export interface DbBrand {
  id: string;
  name: string;
  logo?: string | null;
  country?: string | null;
  tier?: string | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DbCategory {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DbProduct {
  id: string;
  storeId: string;
  brandId: string;
  categoryId: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  experienceLevel?: "BEGINNER" | "INTERMEDIATE" | "ENTHUSIAST" | "FLAGSHIP" | null;
  soundSignature?: "NEUTRAL" | "WARM" | "V_SHAPE" | "BRIGHT" | "BASSHEAD" | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  images?: string[] | null;
  variants?: any;
  colors?: any;
  createdAt?: string;
  updatedAt?: string;
  brand?: DbBrand | { id: string; name: string } | null;
  store?: DbStore | { id: string; storeName: string; address?: string | null; logo?: string | null; avatarUrl?: string | null } | null;
  category?: DbCategory | { id: string; name: string } | null;
}

export interface DbOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  brand: string;
  category?: string | null;
  price: number;
  quantity: number;
  selectedVariant?: string | null;
  image?: string | null;
  itemTotal: number;
  product?: any;
}

export type TrackingStatusCode =
  | "ORDER_CREATED"
  | "PAYMENT_CONFIRMED"
  | "PACKING_ITEMS"
  | "READY_FOR_PICKUP"
  | "COURIER_PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

export interface DbTrackingCheckpoint {
  id: string;
  orderId: string;
  status: TrackingStatusCode | string;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  timeFormatted?: string;
  isCompleted: boolean;
}

export interface DbOrder {
  id: string;
  parentOrderId?: string | null;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string | null;
  destinationAddress: string;
  destinationCity: string;
  destinationPostalCode: string;
  storeId: string;
  storeName: string;
  items: DbOrderItem[];
  itemsSubtotal: number;
  shippingFee: number;
  insuranceFee: number;
  totalAmount: number;
  courierCode?: string | null;
  serviceTier?: string | null;
  waybillNumber?: string | null;
  checkpoints?: DbTrackingCheckpoint[];
  trackingHistory?: DbTrackingCheckpoint[];
  estimatedDeliveryDays?: number;
  returnId?: string | null;
  returnStatus?: ReturnStatusCode | string | null;
  paymentMethod?: string | null;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "EXPIRED";
  escrowStatus:
    | "PAYMENT_PENDING"
    | "HELD_IN_ESCROW"
    | "IN_TRANSIT"
    | "DELIVERED"
    | "FUNDS_RELEASED_TO_SELLER"
    | "DISPUTED"
    | "REFUNDED";
  paidAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  inspectionExpiresAt?: string | null;
  hasReviewed: boolean;
  cancelReason?: string | null;
  cancelledBy?: string;
  cancelledAt?: string;
  platformCommissionFee?: number;
  netSellerPayout?: number;
  platformFee?: number;
  platformCommissionRate?: number;
  isInsured?: boolean;
  autoSettled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ReturnStatusCode =
  | "REQUESTED"
  | "APPROVED_WAITING_SHIPMENT"
  | "IN_TRANSIT_TO_SELLER"
  | "RECEIVED_INSPECTING"
  | "REFUNDED"
  | "REPLACED"
  | "REJECTED"
  | "COMPLETED";

export interface DbReturnRequest {
  id: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string | null;
  storeId: string;
  storeName: string;
  productId: string;
  productName: string;
  productImage?: string | null;
  productPrice: number;
  quantity: number;
  selectedVariant?: string | null;
  reason: string;
  description: string;
  evidenceImages: string[];
  unboxingVideoUrl?: string | null;
  unboxingVideoType?: "upload" | "link" | null;
  refundAmount: number;
  requestedSolution?: "REFUND" | "REPLACEMENT" | string | null;
  shippingFeeBearer?: "SELLER" | "BUYER" | null;
  returnShippingCost?: number;
  qcStage?: "STAGE_1_INITIAL_REVIEW" | "STAGE_2_ACOUSTIC_PHYSICAL_QC" | "COMPLETED" | string | null;
  qcStatus?: "PENDING" | "PASSED" | "FAILED" | string | null;
  qcNotes?: string | null;
  qcAcousticReport?: any;
  status: ReturnStatusCode;
  sellerReturnAddress?: string | null;
  storeReturnAddress?: string | null;
  returnWaybillNumber?: string | null;
  returnCourier?: string | null;
  sellerRejectReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbSellerPayout {
  id: string;
  storeId: string;
  amountUSD: number;
  bankName: string;
  bankAccount: string;
  accountHolder: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED" | string;
  txHash?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbWithdrawal extends DbSellerPayout {}

export interface DbReview {
  id: string;
  orderId?: string | null;
  productId: string;
  productName: string;
  productImage?: string | null;
  variant?: string | null;
  rating: number;
  comment: string;
  tags?: string[] | null;
  buyerName: string;
  buyerEmail?: string | null;
  isAnonymous?: boolean;
  storeId?: string | null;
  storeName?: string | null;
  createdAt: string;
  replies?: any[];
}

export interface DbReviewReply {
  id: string;
  reviewId: string;
  storeId: string;
  storeName: string;
  comment: string;
  createdAt: string;
}

export type VoucherDiscountType = "PERCENTAGE" | "FIXED_AMOUNT" | "SPECIAL_RP1";

export interface DbVoucher {
  id: string;
  code: string;
  title: string;
  description?: string | null;
  discountType: VoucherDiscountType | string;
  discountValue: number;
  minSpend: number;
  maxDiscount?: number | null;
  quota: number;
  usedCount?: number;
  startDate: string;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbNotification {
  id: string;
  recipientEmail: string;
  type: "order" | "chat" | "system" | "promo" | string;
  title: string;
  message: string;
  unread: boolean;
  actionLink: string;
  meta?: any;
  createdAt: string;
}

export interface DbChatConversation {
  id: string;
  buyerEmail: string;
  buyerName: string;
  storeId: string;
  storeName: string;
  unreadBuyer: number;
  unreadSeller: number;
  lastMessage?: string | null;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  messages?: DbChatMessage[];
}

export interface DbChatMessage {
  id: string;
  conversationId: string;
  senderRole: "buyer" | "seller" | string;
  senderName: string;
  senderEmail: string;
  text: string;
  isRead: boolean;
  productCard?: any;
  orderCard?: any;
  createdAt: string;
}

export interface DbChatTemplate {
  id: string;
  title: string;
  text: string;
  category: "GREETING" | "SHIPPING" | "PRODUCT_INQUIRY" | "AFTER_SALES" | "CUSTOM";
}

export interface DbOperatingHoursSchedule {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface DbStoreChatSettings {
  storeId: string;
  templates: DbChatTemplate[];
  operatingHours: {
    enabled: boolean;
    timezone: string;
    schedule: DbOperatingHoursSchedule[];
  };
  autoReplyOutOfHours: boolean;
  outOfHoursMessage: string;
  welcomeMessageEnabled: boolean;
  welcomeMessage: string;
  updatedAt: string;
}

// -------------------------------------------------------------
// UTILITY FUNCTIONS
// -------------------------------------------------------------
export function extractBrandFromStoreName(name?: string | null, email?: string | null): string | null {
  const isOfficialDomain = email ? (email.toLowerCase().endsWith("@tonalzone.id") || email.toLowerCase().includes("valenandra")) : false;
  const text = `${name || ""} ${isOfficialDomain ? email : ""}`.toLowerCase().trim();

  if (
    text.includes("bass audio") ||
    text.includes("bassaudio") ||
    text.includes("csi zone") ||
    text.includes("csizone") ||
    text.includes("kuping sensi") ||
    text.includes("soundstage")
  ) {
    return null;
  }

  if (text.includes("epz")) return "EPZ";
  if (text.includes("tanchjim")) return "Tanchjim";
  if (text.includes("sennheiser")) return "Sennheiser";
  if (text.includes("truthear")) return "Truthear";
  if (text.includes("xinhs")) return "Xinhs";
  if (text.includes("moondrop") || text.includes("valenandra")) return "MOONDROP";
  if (text.includes("tangzu")) return "Tangzu";
  if (text.includes("7hz")) return "7Hz";
  if (text.includes("thieaudio")) return "THIEAUDIO";
  if (text.includes("kiwi ear")) return "Kiwi Ears";
  if (text.includes("kinera")) return "Kinera Audio";
  if (text.includes("earfun")) return "Earfun";
  if (text.includes("kbear")) return "KBEAR";
  if (text.includes("effect audio")) return "Effect Audio";
  if (text.includes("sony")) return "Sony";
  if (text.includes("tin hifi") || text.includes("tinhifi")) return "TinHiFi";
  if (text.includes("verus")) return "Verus Audio";
  if (text.includes("fiio")) return "FiiO";
  if (text.includes("topping")) return "Topping";
  if (text.includes("hifiman")) return "Hifiman";
  if (text.includes("64 audio")) return "64 Audio";
  if (text.includes("dunu")) return "Dunu";

  if (text.includes("official") && name) {
    const withoutOfficial = name.replace(/official.*$/i, "").trim();
    if (withoutOfficial.length > 0) return withoutOfficial;
  }
  return null;
}

export function parseStoreMetadata(store: any): DbStore {
  if (!store) return store;
  const desc = store.description || "";
  const name = store.storeName || "";
  const nameLower = name.toLowerCase();

  const isRetailer =
    nameLower.includes("bass audio") ||
    nameLower.includes("csi zone") ||
    nameLower.includes("kuping sensi") ||
    nameLower.includes("soundstage") ||
    store.id === "store-bass-audio" ||
    store.id === "store-csi-zone";

  const detectedBrand = isRetailer ? null : extractBrandFromStoreName(name);

  const isOfficial =
    !isRetailer &&
    (desc.includes("OFFICIAL_BRAND") ||
      nameLower.includes("moondrop") ||
      store.id === "store-moondrop-official" ||
      Boolean(detectedBrand));

  let brandName = detectedBrand;
  if (!brandName && isOfficial) {
    const match = desc.match(/OFFICIAL_BRAND:([A-Za-z0-9_\s-]+)/);
    brandName = match ? match[1].trim() : "MOONDROP";
  }

  const logo = store.logo || store.avatarUrl || null;
  const banner = store.banner || store.bannerUrl || null;

  return {
    ...store,
    logo,
    banner,
    avatarUrl: logo,
    bannerUrl: banner,
    storeType: isRetailer ? "RETAIL_MERCHANT" : isOfficial && brandName ? "OFFICIAL_BRAND" : (store.storeType || "RETAIL_MERCHANT"),
    brandName: isRetailer ? null : (brandName || store.brandName || null),
  };
}

export const globalUserAddressCache = new Map<string, DbUserAddress[]>();

export function parseUserAddresses(locationStr?: string | null): DbUserAddress[] {
  if (!locationStr) return [];
  try {
    const parsed = JSON.parse(locationStr);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.addresses)) return parsed.addresses;
  } catch {}
  return [];
}

// In-memory mutex for zero race conditions on inventory stock
declare global {
  var __tonalzone_stock_mutexes: Map<string, Promise<void>> | undefined;
}
const stockMutexMap: Map<string, Promise<void>> =
  globalThis.__tonalzone_stock_mutexes ||
  (globalThis.__tonalzone_stock_mutexes = new Map());

export async function acquireStockMutex(productId: string): Promise<() => void> {
  const key = productId.trim().toLowerCase();
  while (stockMutexMap.has(key)) {
    try {
      await stockMutexMap.get(key);
    } catch {}
  }
  let unlock: () => void = () => {};
  const lockPromise = new Promise<void>((resolve) => {
    unlock = resolve;
  });
  stockMutexMap.set(key, lockPromise);

  return () => {
    stockMutexMap.delete(key);
    unlock();
  };
}

export const globalProductStockCache: Map<string, number> = new Map();

// Helper to format Product from Prisma
function formatProductFromPrisma(p: any): DbProduct {
  if (!p) return p;
  let images: string[] = [];
  try {
    images = typeof p.images === "string" ? JSON.parse(p.images) : p.images || [];
  } catch {
    images = [p.images || "/model-iem-untuk-hero.webp"];
  }

  let variants = p.variants;
  if (typeof variants === "string") {
    try {
      variants = JSON.parse(variants);
    } catch {}
  }

  let colors = p.colors;
  if (typeof colors === "string") {
    try {
      colors = JSON.parse(colors);
    } catch {}
  }

  return {
    ...p,
    price: Number(p.price) || 0,
    stock: Number(p.stock) || 0,
    images,
    variants,
    colors,
    brand: p.brand ? { id: p.brand.id, name: p.brand.name } : null,
    store: p.store ? parseStoreMetadata(p.store) : null,
    category: p.category ? { id: p.category.id, name: p.category.name } : null,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
  };
}

// -------------------------------------------------------------
// 1. USER & ADDRESS REPOSITORY (SQLITE PRISMA)
// -------------------------------------------------------------
export const userRepo = {
  async findByEmail(email: string): Promise<DbUser | null> {
    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { store: true, addresses: true },
    });
    if (!user) return null;

    return {
      ...user,
      role: user.role as any,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      store: user.store ? parseStoreMetadata(user.store) : null,
      addresses: user.addresses.map((a) => ({
        ...a,
        province: a.province || undefined,
        country: a.country || undefined,
        label: a.label || undefined,
        createdAt: a.createdAt.toISOString(),
      })),
    };
  },

  async findById(id: string): Promise<DbUser | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { store: true, addresses: true },
    });
    if (!user) return null;

    return {
      ...user,
      role: user.role as any,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      store: user.store ? parseStoreMetadata(user.store) : null,
      addresses: user.addresses.map((a) => ({
        ...a,
        province: a.province || undefined,
        country: a.country || undefined,
        label: a.label || undefined,
        createdAt: a.createdAt.toISOString(),
      })),
    };
  },

  async upsert(user: {
    id?: string;
    email: string;
    name?: string;
    avatar?: string;
    role?: "BUYER" | "SELLER" | "ADMIN";
    location?: string;
    language?: string;
    tuningPreference?: string;
    passwordHash?: string;
  }): Promise<DbUser> {
    const cleanEmail = user.email.trim().toLowerCase();
    const existing = await this.findByEmail(cleanEmail);

    const userId = user.id || existing?.id || `usr-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const roleVal = user.role ?? existing?.role ?? (cleanEmail.includes("admin") ? "ADMIN" : "BUYER");

    const record = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        name: user.name ?? existing?.name ?? cleanEmail.split("@")[0],
        avatar: user.avatar ?? existing?.avatar ?? "/placeholder.svg",
        role: roleVal,
        location: user.location ?? existing?.location ?? "Indonesia",
        language: user.language ?? existing?.language ?? "id",
        tuningPreference: user.tuningPreference ?? existing?.tuningPreference ?? "Reference / Neutral",
        ...(user.passwordHash ? { passwordHash: user.passwordHash } : {}),
      },
      create: {
        id: userId,
        email: cleanEmail,
        name: user.name || cleanEmail.split("@")[0],
        avatar: user.avatar || "/placeholder.svg",
        role: roleVal,
        location: user.location || "Indonesia",
        language: user.language || "id",
        tuningPreference: user.tuningPreference || "Reference / Neutral",
        passwordHash: user.passwordHash || null,
      },
      include: { store: true, addresses: true },
    });

    return {
      ...record,
      role: record.role as any,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      store: record.store ? parseStoreMetadata(record.store) : null,
      addresses: record.addresses.map((a) => ({
        ...a,
        province: a.province || undefined,
        country: a.country || undefined,
        label: a.label || undefined,
        createdAt: a.createdAt.toISOString(),
      })),
    };
  },

  async updatePassword(email: string, passwordHash: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { email: email.trim().toLowerCase() },
        data: { passwordHash },
      });
      return true;
    } catch {
      return false;
    }
  },

  async update(email: string, updates: Partial<DbUser>): Promise<DbUser | null> {
    return this.updateProfile(email, updates);
  },

  async updateProfile(email: string, updates: Partial<DbUser>): Promise<DbUser | null> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const updated = await prisma.user.update({
        where: { email: cleanEmail },
        data: {
          name: updates.name,
          avatar: updates.avatar,
          location: updates.location,
          language: updates.language,
          tuningPreference: updates.tuningPreference,
        },
        include: { store: true, addresses: true },
      });

      return {
        ...updated,
        role: updated.role as any,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        store: updated.store ? parseStoreMetadata(updated.store) : null,
        addresses: updated.addresses.map((a) => ({
          ...a,
          province: a.province || undefined,
          country: a.country || undefined,
          label: a.label || undefined,
          createdAt: a.createdAt.toISOString(),
        })),
      };
    } catch {
      return null;
    }
  },

  async getAddresses(userIdOrEmail: string): Promise<DbUserAddress[]> {
    const key = userIdOrEmail.trim().toLowerCase();
    const user = key.includes("@") ? await this.findByEmail(key) : await this.findById(key);
    if (!user) {
      return globalUserAddressCache.get(key) || [];
    }

    const rows = await prisma.userAddress.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const addresses: DbUserAddress[] = rows.map((r) => ({
      id: r.id,
      label: r.label || undefined,
      recipientName: r.recipientName,
      phone: r.phone,
      street: r.street,
      city: r.city,
      province: r.province || undefined,
      postalCode: r.postalCode,
      country: r.country || "Indonesia",
      isDefault: r.isDefault,
      createdAt: r.createdAt.toISOString(),
    }));

    globalUserAddressCache.set(key, addresses);
    globalUserAddressCache.set(user.id, addresses);
    globalUserAddressCache.set(user.email.toLowerCase(), addresses);
    return addresses;
  },

  async getDefaultAddress(userIdOrEmail: string): Promise<DbUserAddress | null> {
    const addresses = await this.getAddresses(userIdOrEmail);
    if (addresses.length === 0) return null;
    return addresses.find((a) => a.isDefault) || addresses[0];
  },

  async saveAddress(
    userIdOrEmail: string,
    address: Omit<DbUserAddress, "id" | "isDefault"> & { id?: string; isDefault?: boolean }
  ): Promise<DbUserAddress> {
    const key = userIdOrEmail.trim().toLowerCase();
    let user = key.includes("@") ? await this.findByEmail(key) : await this.findById(key);
    if (!user) {
      user = await this.upsert({ email: key, name: address.recipientName });
    }

    const currentAddresses = await this.getAddresses(user.id);
    const isFirst = currentAddresses.length === 0;
    const shouldBeDefault = address.isDefault !== undefined ? address.isDefault : isFirst;
    const addressId = address.id || `addr-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    if (shouldBeDefault) {
      await prisma.userAddress.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const saved = await prisma.userAddress.upsert({
      where: { id: addressId },
      update: {
        label: address.label || "Alamat Utama",
        recipientName: address.recipientName,
        phone: address.phone,
        street: address.street,
        city: address.city,
        province: address.province || "DKI Jakarta",
        postalCode: address.postalCode,
        country: address.country || "Indonesia",
        isDefault: shouldBeDefault,
      },
      create: {
        id: addressId,
        userId: user.id,
        label: address.label || "Alamat Utama",
        recipientName: address.recipientName,
        phone: address.phone,
        street: address.street,
        city: address.city,
        province: address.province || "DKI Jakarta",
        postalCode: address.postalCode,
        country: address.country || "Indonesia",
        isDefault: shouldBeDefault,
      },
    });

    const result: DbUserAddress = {
      id: saved.id,
      label: saved.label || undefined,
      recipientName: saved.recipientName,
      phone: saved.phone,
      street: saved.street,
      city: saved.city,
      province: saved.province || undefined,
      postalCode: saved.postalCode,
      country: saved.country || "Indonesia",
      isDefault: saved.isDefault,
      createdAt: saved.createdAt.toISOString(),
    };

    // Refresh cache
    await this.getAddresses(user.id);
    return result;
  },

  async setDefaultAddress(userIdOrEmail: string, addressId: string): Promise<boolean> {
    const key = userIdOrEmail.trim().toLowerCase();
    const user = key.includes("@") ? await this.findByEmail(key) : await this.findById(key);
    if (!user) return false;

    await prisma.userAddress.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });

    await prisma.userAddress.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    await this.getAddresses(user.id);
    return true;
  },

  async deleteAddress(userIdOrEmail: string, addressId: string): Promise<boolean> {
    const key = userIdOrEmail.trim().toLowerCase();
    const user = key.includes("@") ? await this.findByEmail(key) : await this.findById(key);
    if (!user) return false;

    const existing = await prisma.userAddress.findUnique({ where: { id: addressId } });
    if (!existing) return false;

    await prisma.userAddress.delete({ where: { id: addressId } });

    // If deleted address was default, promote another
    if (existing.isDefault) {
      const remaining = await prisma.userAddress.findFirst({ where: { userId: user.id } });
      if (remaining) {
        await prisma.userAddress.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    await this.getAddresses(user.id);
    return true;
  },
};

// -------------------------------------------------------------
// 2. STORE REPOSITORY (SQLITE PRISMA)
// -------------------------------------------------------------
export const storeRepo = {
  async findById(id: string): Promise<DbStore | null> {
    const store = await prisma.store.findUnique({ where: { id } });
    return store ? parseStoreMetadata(store) : null;
  },

  async findByUserId(userId: string): Promise<DbStore | null> {
    const store = await prisma.store.findUnique({ where: { userId } });
    return store ? parseStoreMetadata(store) : null;
  },

  async findByName(storeName: string): Promise<DbStore | null> {
    const cleanName = (storeName || "").trim().toLowerCase();
    const stores = await prisma.store.findMany();
    const found = stores.find((s) => s.storeName.toLowerCase() === cleanName);
    return found ? parseStoreMetadata(found) : null;
  },

  async getAll(): Promise<DbStore[]> {
    const stores = await prisma.store.findMany();
    return stores.map(parseStoreMetadata);
  },

  async create(store: {
    id?: string;
    userId: string;
    storeName: string;
    description?: string;
    status?: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
    address?: string;
    bankName?: string;
    bankAccount?: string;
    nik?: string;
    ktpUrl?: string;
    logo?: string | null;
    banner?: string | null;
    avatarUrl?: string | null;
    bannerUrl?: string | null;
  }): Promise<DbStore> {
    const created = await prisma.store.create({
      data: {
        id: store.id || `store-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        userId: store.userId,
        storeName: store.storeName,
        description: store.description || "",
        status: store.status || "APPROVED",
        address: store.address || "",
        bankName: store.bankName || "",
        bankAccount: store.bankAccount || "",
        logo: store.logo || store.avatarUrl || "/placeholder.svg",
        banner: store.banner || store.bannerUrl || null,
        avatarUrl: store.avatarUrl || store.logo || "/placeholder.svg",
      },
    });
    return parseStoreMetadata(created);
  },

  async update(id: string, updates: Partial<DbStore>): Promise<DbStore | null> {
    try {
      const updated = await prisma.store.update({
        where: { id },
        data: {
          storeName: updates.storeName,
          description: updates.description,
          status: updates.status,
          address: updates.address,
          bankName: updates.bankName,
          bankAccount: updates.bankAccount,
          logo: updates.logo,
          banner: updates.banner,
          avatarUrl: updates.avatarUrl || updates.logo,
          rejectionReason: updates.rejectionReason,
        },
      });
      return parseStoreMetadata(updated);
    } catch {
      return null;
    }
  },

  async approveStore(id: string): Promise<DbStore | null> {
    return this.update(id, { status: "APPROVED" });
  },

  async rejectStore(id: string, reason?: string): Promise<DbStore | null> {
    return this.update(id, { status: "REJECTED", rejectionReason: reason || "Data pendaftaran tidak memenuhi kualifikasi." });
  },
};

// -------------------------------------------------------------
// 3. BRAND REPOSITORY (SQLITE PRISMA)
// -------------------------------------------------------------
export const brandRepo = {
  async upsert(name: string, logo?: string, country?: string): Promise<DbBrand> {
    const cleanName = name.trim().toUpperCase();
    const existing = await prisma.brand.findUnique({ where: { name: cleanName } });
    if (existing) return existing as any;

    const brand = await prisma.brand.create({
      data: {
        id: `brd-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "") || Date.now()}`,
        name: cleanName,
        logo: logo || null,
        country: country || "Global",
        tier: "Chi-Fi",
        status: "APPROVED",
      },
    });
    return brand as any;
  },

  async getAll(): Promise<DbBrand[]> {
    const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
    return brands as any;
  },

  async findById(id: string): Promise<DbBrand | null> {
    const brand = await prisma.brand.findUnique({ where: { id } });
    return brand as any;
  },
};

// -------------------------------------------------------------
// 4. CATEGORY REPOSITORY (SQLITE PRISMA)
// -------------------------------------------------------------
export const categoryRepo = {
  async upsert(name: string, slug?: string, description?: string): Promise<DbCategory> {
    const cleanName = name.trim().toUpperCase();
    const existing = await prisma.category.findUnique({ where: { name: cleanName } });
    if (existing) return existing as any;

    const cat = await prisma.category.create({
      data: {
        id: `cat-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-") || Date.now()}`,
        name: cleanName,
        slug: slug || cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        description: description || `Audiophile ${cleanName.toLowerCase()} equipment.`,
      },
    });
    return cat as any;
  },

  async getAll(): Promise<DbCategory[]> {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    return categories as any;
  },

  async findById(id: string): Promise<DbCategory | null> {
    const cat = await prisma.category.findUnique({ where: { id } });
    return cat as any;
  },
};

// -------------------------------------------------------------
// 5. PRODUCT REPOSITORY (SQLITE PRISMA + STOCK MUTEX + SSE)
// -------------------------------------------------------------
export const productRepo = {
  async create(product: {
    id?: string;
    name: string;
    storeId: string;
    brandId: string;
    categoryId: string;
    description?: string;
    price: number;
    stock: number;
    experienceLevel?: any;
    soundSignature?: any;
    images?: string[];
    variants?: any;
    colors?: any;
  }): Promise<DbProduct | null> {
    const pId = product.id || `prod-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const imagesList = product.images || ["/model-iem-untuk-hero.webp"];

    const created = await prisma.product.create({
      data: {
        id: pId,
        name: product.name,
        storeId: product.storeId,
        brandId: product.brandId,
        categoryId: product.categoryId,
        description: product.description || "",
        price: Number(product.price) || 0,
        stock: Number(product.stock) || 0,
        experienceLevel: product.experienceLevel || "INTERMEDIATE",
        soundSignature: product.soundSignature || "NEUTRAL",
        status: "APPROVED",
        images: JSON.stringify(imagesList),
        variants: product.variants ? JSON.stringify(product.variants) : null,
        colors: product.colors ? JSON.stringify(product.colors) : null,
      },
      include: { brand: true, store: true, category: true },
    });

    globalProductStockCache.set(pId.toLowerCase(), Number(created.stock));

    try {
      serverBroadcastRealtime("CATALOG", {
        type: "STOCK_UPDATED",
        productId: pId,
        stock: created.stock,
      });
    } catch {}

    return formatProductFromPrisma(created);
  },

  async upsert(product: {
    id: string;
    name: string;
    storeId: string;
    brandId: string;
    categoryId: string;
    description?: string;
    price: number;
    stock: number;
    experienceLevel?: any;
    soundSignature?: any;
    images?: string[];
  }): Promise<DbProduct | null> {
    const imagesList = product.images || ["/model-iem-untuk-hero.webp"];

    const updated = await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        storeId: product.storeId,
        brandId: product.brandId,
        categoryId: product.categoryId,
        description: product.description || "",
        price: Number(product.price) || 0,
        stock: Number(product.stock) || 0,
        experienceLevel: product.experienceLevel || "INTERMEDIATE",
        soundSignature: product.soundSignature || "NEUTRAL",
        images: JSON.stringify(imagesList),
      },
      create: {
        id: product.id,
        name: product.name,
        storeId: product.storeId,
        brandId: product.brandId,
        categoryId: product.categoryId,
        description: product.description || "",
        price: Number(product.price) || 0,
        stock: Number(product.stock) || 0,
        experienceLevel: product.experienceLevel || "INTERMEDIATE",
        soundSignature: product.soundSignature || "NEUTRAL",
        status: "APPROVED",
        images: JSON.stringify(imagesList),
      },
      include: { brand: true, store: true, category: true },
    });

    globalProductStockCache.set(product.id.toLowerCase(), Number(updated.stock));
    return formatProductFromPrisma(updated);
  },

  async findById(id: string): Promise<DbProduct | null> {
    const p = await prisma.product.findUnique({
      where: { id },
      include: { brand: true, store: true, category: true },
    });
    return p ? formatProductFromPrisma(p) : null;
  },

  async findByStoreId(storeId: string): Promise<DbProduct[]> {
    const list = await prisma.product.findMany({
      where: { storeId },
      include: { brand: true, store: true, category: true },
      orderBy: { createdAt: "desc" },
    });
    return list.map(formatProductFromPrisma);
  },

  async getAll(): Promise<DbProduct[]> {
    const list = await prisma.product.findMany({
      include: { brand: true, store: true, category: true },
      orderBy: { createdAt: "desc" },
    });
    return list.map(formatProductFromPrisma);
  },

  async update(id: string, updates: Partial<DbProduct>): Promise<DbProduct | null> {
    try {
      const dataToUpdate: any = {};
      if (updates.name !== undefined) dataToUpdate.name = updates.name;
      if (updates.description !== undefined) dataToUpdate.description = updates.description;
      if (updates.price !== undefined) dataToUpdate.price = Number(updates.price);
      if (updates.stock !== undefined) dataToUpdate.stock = Number(updates.stock);
      if (updates.experienceLevel !== undefined) dataToUpdate.experienceLevel = updates.experienceLevel;
      if (updates.soundSignature !== undefined) dataToUpdate.soundSignature = updates.soundSignature;
      if (updates.status !== undefined) dataToUpdate.status = updates.status;
      if (updates.images !== undefined) dataToUpdate.images = JSON.stringify(updates.images);
      if (updates.variants !== undefined) dataToUpdate.variants = JSON.stringify(updates.variants);
      if (updates.colors !== undefined) dataToUpdate.colors = JSON.stringify(updates.colors);

      const updated = await prisma.product.update({
        where: { id },
        data: dataToUpdate,
        include: { brand: true, store: true, category: true },
      });

      if (updates.stock !== undefined) {
        globalProductStockCache.set(id.toLowerCase(), Number(updated.stock));
        try {
          serverBroadcastRealtime("CATALOG", {
            type: "STOCK_UPDATED",
            productId: id,
            stock: updated.stock,
          });
        } catch {}
      }

      return formatProductFromPrisma(updated);
    } catch {
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      // Remove any order items or reviews referencing this product if needed
      await prisma.product.delete({ where: { id } });
      globalProductStockCache.delete(id.toLowerCase());
      return true;
    } catch {
      return false;
    }
  },

  async getStock(productId: string): Promise<number> {
    const cleanId = (productId || "").trim().toLowerCase();
    if (globalProductStockCache.has(cleanId)) {
      return globalProductStockCache.get(cleanId)!;
    }
    const p = await prisma.product.findUnique({
      where: { id: cleanId },
      select: { stock: true },
    });
    const val = p ? Number(p.stock) : 0;
    globalProductStockCache.set(cleanId, val);
    return val;
  },

  async deductStock(productId: string, quantity: number): Promise<{ success: boolean; remainingStock: number; error?: string }> {
    const cleanId = (productId || "").trim().toLowerCase();
    const releaseLock = await acquireStockMutex(cleanId);

    try {
      let current = await this.getStock(cleanId);

      if (current < quantity) {
        return {
          success: false,
          remainingStock: current,
          error: `Stok produk tidak mencukupi atau baru saja dibeli pembeli lain. Tersedia: ${current} unit, diminta: ${quantity} unit.`,
        };
      }

      const remaining = current - quantity;
      globalProductStockCache.set(cleanId, remaining);

      try {
        await prisma.product.update({
          where: { id: cleanId },
          data: { stock: remaining },
        });
      } catch {}

      try {
        serverBroadcastRealtime("CATALOG", {
          type: "STOCK_UPDATED",
          productId: cleanId,
          stock: remaining,
        });
      } catch {}

      return { success: true, remainingStock: remaining };
    } finally {
      releaseLock();
    }
  },

  async restoreStock(productId: string, quantity: number): Promise<{ success: boolean; remainingStock: number }> {
    const cleanId = (productId || "").trim().toLowerCase();
    const releaseLock = await acquireStockMutex(cleanId);

    try {
      const current = await this.getStock(cleanId);
      const newStock = current + quantity;
      globalProductStockCache.set(cleanId, newStock);

      try {
        await prisma.product.update({
          where: { id: cleanId },
          data: { stock: newStock },
        });
      } catch {}

      try {
        serverBroadcastRealtime("CATALOG", {
          type: "STOCK_UPDATED",
          productId: cleanId,
          stock: newStock,
        });
      } catch {}

      return { success: true, remainingStock: newStock };
    } finally {
      releaseLock();
    }
  },

  async updateStock(productId: string, newStock: number): Promise<boolean> {
    const cleanId = (productId || "").trim().toLowerCase();
    const stockVal = Math.max(0, newStock);
    globalProductStockCache.set(cleanId, stockVal);

    try {
      await prisma.product.update({
        where: { id: cleanId },
        data: { stock: stockVal },
      });
    } catch {}
    return true;
  },

  async deleteMany() {
    try {
      await prisma.orderItem.deleteMany({});
      await prisma.product.deleteMany({});
    } catch {}
  },
};

// -------------------------------------------------------------
// 6. ORDER REPOSITORY (SQLITE PRISMA + ESCROW LIFECYCLE)
// -------------------------------------------------------------
function formatOrderFromPrisma(o: any): DbOrder {
  if (!o) return o;
  const totalAmount = Number(o.totalAmount) || 0;
  const platformCommissionRate = o.platformCommissionRate || 0.05;
  const platformCommissionFee =
    o.platformCommissionFee !== undefined && o.platformCommissionFee !== null
      ? Number(o.platformCommissionFee)
      : Math.round(totalAmount * platformCommissionRate * 100) / 100;
  const netSellerPayout =
    o.netSellerPayout !== undefined && o.netSellerPayout !== null
      ? Number(o.netSellerPayout)
      : Math.round((totalAmount - platformCommissionFee) * 100) / 100;

  const checkpoints: DbTrackingCheckpoint[] = (o.checkpoints || []).map((cp: any) => ({
    ...cp,
    timestamp: cp.timestamp instanceof Date ? cp.timestamp.toISOString() : cp.timestamp,
  }));

  return {
    ...o,
    itemsSubtotal: Number(o.itemsSubtotal) || 0,
    shippingFee: Number(o.shippingFee) || 0,
    insuranceFee: Number(o.insuranceFee) || 0,
    totalAmount,
    platformCommissionRate,
    platformCommissionFee,
    platformFee: platformCommissionFee,
    netSellerPayout,
    isInsured: Boolean(o.isInsured),
    estimatedDeliveryDays: o.estimatedDeliveryDays || 3,
    returnId: o.returnId || undefined,
    returnStatus: o.returnStatus || undefined,
    autoSettled: Boolean(o.autoSettled),
    cancelledBy: o.cancelledBy || (o.cancelReason ? "BUYER" : undefined),
    cancelledAt: o.cancelledAt
      ? o.cancelledAt instanceof Date
        ? o.cancelledAt.toISOString()
        : o.cancelledAt
      : o.escrowStatus === "REFUNDED"
      ? o.updatedAt instanceof Date
        ? o.updatedAt.toISOString()
        : o.updatedAt
      : undefined,
    paidAt: o.paidAt ? (o.paidAt instanceof Date ? o.paidAt.toISOString() : o.paidAt) : null,
    shippedAt: o.shippedAt ? (o.shippedAt instanceof Date ? o.shippedAt.toISOString() : o.shippedAt) : null,
    deliveredAt: o.deliveredAt ? (o.deliveredAt instanceof Date ? o.deliveredAt.toISOString() : o.deliveredAt) : null,
    inspectionExpiresAt: o.inspectionExpiresAt
      ? o.inspectionExpiresAt instanceof Date
        ? o.inspectionExpiresAt.toISOString()
        : o.inspectionExpiresAt
      : null,
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt,
    updatedAt: o.updatedAt instanceof Date ? o.updatedAt.toISOString() : o.updatedAt,
    items: (o.items || []).map((it: any) => ({
      ...it,
      price: Number(it.price) || 0,
      quantity: Number(it.quantity) || 1,
      itemTotal: Number(it.itemTotal) || 0,
    })),
    checkpoints,
    trackingHistory: checkpoints,
  };
}

export const orderRepo = {
  async getAll(): Promise<DbOrder[]> {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        checkpoints: { orderBy: { timestamp: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    return orders.map(formatOrderFromPrisma);
  },

  async findById(id: string): Promise<DbOrder | null> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        checkpoints: { orderBy: { timestamp: "asc" } },
      },
    });
    return order ? formatOrderFromPrisma(order) : null;
  },

  async findByBuyerEmail(email: string): Promise<DbOrder[]> {
    const orders = await prisma.order.findMany({
      where: { buyerEmail: email.trim().toLowerCase() },
      include: {
        items: true,
        checkpoints: { orderBy: { timestamp: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    return orders.map(formatOrderFromPrisma);
  },

  async findByStoreId(storeId: string): Promise<DbOrder[]> {
    const orders = await prisma.order.findMany({
      where: { storeId },
      include: {
        items: true,
        checkpoints: { orderBy: { timestamp: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    return orders.map(formatOrderFromPrisma);
  },

  async create(order: {
    id?: string;
    parentOrderId?: string;
    buyerId: string;
    buyerName: string;
    buyerEmail: string;
    buyerPhone?: string;
    destinationAddress: string;
    destinationCity: string;
    destinationPostalCode: string;
    storeId: string;
    storeName: string;
    items: Array<{
      id?: string;
      orderId?: string;
      productId: string;
      productName: string;
      brand?: string;
      category?: string;
      price: number;
      quantity: number;
      selectedVariant?: string;
      image?: string;
      itemTotal: number;
    }>;
    itemsSubtotal: number;
    shippingFee?: number;
    insuranceFee?: number;
    totalAmount: number;
    courierCode?: string;
    serviceTier?: string;
    waybillNumber?: string;
    paymentMethod?: string;
    paymentStatus?: "PENDING" | "PAID" | "FAILED" | "EXPIRED";
    escrowStatus?: DbOrder["escrowStatus"];
    isInsured?: boolean;
    estimatedDeliveryDays?: number;
    returnStatus?: ReturnStatusCode | string;
    returnId?: string;
    trackingHistory?: DbTrackingCheckpoint[];
    hasReviewed?: boolean;
    paidAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    platformCommissionFee?: number;
    netSellerPayout?: number;
    platformFee?: number;
    platformCommissionRate?: number;
  }): Promise<DbOrder> {
    const orderId = order.id || `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const initialCheckpoints =
      order.trackingHistory && order.trackingHistory.length > 0
        ? order.trackingHistory.map((th, idx) => ({
            id: th.id || `chk-${orderId}-${idx}`,
            status: th.status,
            title: th.title || "Pesanan Dibuat",
            description: th.description || "",
            location: th.location || order.destinationCity || "Jakarta",
            timeFormatted:
              th.timeFormatted ||
              new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            isCompleted: th.isCompleted !== undefined ? th.isCompleted : true,
          }))
        : [
            {
              id: `chk-${orderId}-0`,
              status: "ORDER_CREATED",
              title: "Pesanan Dibuat",
              description: "Pesanan berhasil dibuat. Menunggu konfirmasi pembayaran pembeli.",
              location: order.destinationCity || "Jakarta",
              timeFormatted: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
              isCompleted: true,
            },
          ];

    const created = await prisma.order.create({
      data: {
        id: orderId,
        parentOrderId: order.parentOrderId || null,
        buyerId: order.buyerId,
        buyerName: order.buyerName,
        buyerEmail: order.buyerEmail.trim().toLowerCase(),
        buyerPhone: order.buyerPhone || null,
        destinationAddress: order.destinationAddress,
        destinationCity: order.destinationCity,
        destinationPostalCode: order.destinationPostalCode,
        storeId: order.storeId,
        storeName: order.storeName,
        itemsSubtotal: Number(order.itemsSubtotal) || 0,
        shippingFee: Number(order.shippingFee) || 0,
        insuranceFee: Number(order.insuranceFee) || 0,
        totalAmount: Number(order.totalAmount) || 0,
        courierCode: order.courierCode || null,
        serviceTier: order.serviceTier || null,
        waybillNumber: order.waybillNumber || null,
        paymentMethod: order.paymentMethod || "MIDTRANS_QRIS",
        paymentStatus: order.paymentStatus || "PENDING",
        escrowStatus: order.escrowStatus || "PAYMENT_PENDING",
        isInsured: Boolean(order.isInsured),
        estimatedDeliveryDays: order.estimatedDeliveryDays || 3,
        returnId: order.returnId || null,
        returnStatus: order.returnStatus || null,
        hasReviewed: Boolean(order.hasReviewed),
        paidAt: order.paidAt ? new Date(order.paidAt) : null,
        shippedAt: order.shippedAt ? new Date(order.shippedAt) : null,
        deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : null,
        platformCommissionFee: order.platformCommissionFee || null,
        netSellerPayout: order.netSellerPayout || null,
        platformFee: order.platformFee || null,
        platformCommissionRate: order.platformCommissionRate || null,
        items: {
          create: order.items.map((it, idx) => ({
            id: it.id ? `${it.id}-${orderId}` : `item-${orderId}-${idx}`,
            productId: it.productId,
            productName: it.productName,
            brand: it.brand || "MOONDROP",
            category: it.category || "IN-EAR MONITORS",
            price: Number(it.price) || 0,
            quantity: Number(it.quantity) || 1,
            selectedVariant: it.selectedVariant || null,
            image: it.image || "/model-iem-untuk-hero.webp",
            itemTotal: Number(it.itemTotal) || 0,
          })),
        },
        checkpoints: {
          create: initialCheckpoints,
        },
      },
      include: {
        items: true,
        checkpoints: true,
      },
    });

    try {
      serverBroadcastRealtime("ORDERS", {
        type: "ORDER_CREATED",
        orderId: created.id,
        buyerEmail: created.buyerEmail,
        storeId: created.storeId,
      });
    } catch {}

    try {
      await notificationRepo.create({
        recipientEmail: created.buyerEmail,
        recipientRole: "buyer",
        type: "order",
        title: "Pesanan Berhasil Dibuat",
        message: `Pesanan #${created.id} berhasil dibuat dan menunggu pembayaran.`,
        actionLink: "/orders",
        unread: true,
      });

      if (created.storeId) {
        await notificationRepo.create({
          recipientEmail: "seller@tonalzone.id",
          recipientRole: "seller",
          storeId: created.storeId,
          type: "order",
          title: "Pesanan Baru Masuk",
          message: `Pesanan baru #${created.id} telah masuk. Menunggu pembayaran pembeli.`,
          actionLink: "/seller/orders",
          unread: true,
        });
      }
    } catch {}

    return formatOrderFromPrisma(created);
  },

  async markAsPaid(id: string): Promise<DbOrder | null> {
    try {
      const order = await prisma.order.findUnique({ where: { id } });
      if (!order) return null;

      const now = new Date();
      await prisma.orderTrackingCheckpoint.create({
        data: {
          id: `chk-${id}-${Date.now()}`,
          orderId: id,
          status: "PAYMENT_CONFIRMED",
          title: "Pembayaran Dikonfirmasi",
          description: "Dana sebesar $" + order.totalAmount + " telah diamankan dalam Escrow TonalZone.",
          location: "Payment Gateway",
          timeFormatted: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          isCompleted: true,
        },
      });

      const updated = await prisma.order.update({
        where: { id },
        data: {
          paymentStatus: "PAID",
          escrowStatus: "HELD_IN_ESCROW",
          paidAt: now,
        },
        include: {
          items: true,
          checkpoints: { orderBy: { timestamp: "asc" } },
        },
      });

      try {
        serverBroadcastRealtime("ORDERS", {
          type: "ORDER_STATUS_UPDATED",
          orderId: id,
          escrowStatus: "HELD_IN_ESCROW",
        });
      } catch {}

      try {
        await notificationRepo.create({
          recipientEmail: order.buyerEmail,
          recipientRole: "buyer",
          type: "order",
          title: "Pembayaran Terverifikasi (Escrow Holding)",
          message: `Pembayaran untuk pesanan #${order.id} berhasil diamankan di TonalZone Escrow. Toko akan segera memproses barang.`,
          actionLink: "/orders",
          unread: true,
        });

        if (order.storeId) {
          await notificationRepo.create({
            recipientEmail: "seller@tonalzone.id",
            recipientRole: "seller",
            storeId: order.storeId,
            type: "order",
            title: "Pesanan Siap Dikirim",
            message: `Pembeli telah membayar pesanan #${order.id}. Silakan segera kemas dan kirimkan barang.`,
            actionLink: "/seller/orders",
            unread: true,
          });
        }
      } catch {}

      return formatOrderFromPrisma(updated);
    } catch {
      return null;
    }
  },

  async updateShipment(id: string, waybillNumber: string, courierName?: string): Promise<DbOrder | null> {
    try {
      const now = new Date();
      await prisma.orderTrackingCheckpoint.create({
        data: {
          id: `chk-${id}-${Date.now()}`,
          orderId: id,
          status: "IN_TRANSIT",
          title: "Pesanan Dikirim / Dalam Perjalanan",
          description: `Paket diserahkan ke ${courierName || "kurir"}. Nomor resi: ${waybillNumber}`,
          location: "Sortation Center",
          timeFormatted: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          isCompleted: true,
        },
      });

      const updated = await prisma.order.update({
        where: { id },
        data: {
          escrowStatus: "IN_TRANSIT",
          waybillNumber,
          shippedAt: now,
        },
        include: {
          items: true,
          checkpoints: { orderBy: { timestamp: "asc" } },
        },
      });

      try {
        serverBroadcastRealtime("ORDERS", {
          type: "ORDER_STATUS_UPDATED",
          orderId: id,
          escrowStatus: "IN_TRANSIT",
          waybillNumber,
        });
      } catch {}

      try {
        const order = await prisma.order.findUnique({ where: { id } });
        if (order) {
          await notificationRepo.create({
            recipientEmail: order.buyerEmail,
            recipientRole: "buyer",
            type: "order",
            title: "Pesanan Sedang Dikirim",
            message: `Pesanan #${order.id} telah dikirim via ${courierName || "kurir"} dengan nomor resi: ${waybillNumber}.`,
            actionLink: "/orders",
            unread: true,
          });
        }
      } catch {}

      return formatOrderFromPrisma(updated);
    } catch {
      return null;
    }
  },

  async confirmDeliveryAndReleaseFunds(id: string): Promise<DbOrder | null> {
    try {
      const now = new Date();
      await prisma.orderTrackingCheckpoint.create({
        data: {
          id: `chk-${id}-${Date.now()}`,
          orderId: id,
          status: "DELIVERED",
          title: "Pesanan Diterima & Dana Diteruskan",
          description: "Pesanan telah diterima pembeli. Dana escrow telah berhasil diteruskan ke saldo penjual.",
          location: "Tujuan Akhir Pembeli",
          timeFormatted: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          isCompleted: true,
        },
      });

      const updated = await prisma.order.update({
        where: { id },
        data: {
          escrowStatus: "FUNDS_RELEASED_TO_SELLER",
          deliveredAt: now,
        },
        include: {
          items: true,
          checkpoints: { orderBy: { timestamp: "asc" } },
        },
      });

      try {
        serverBroadcastRealtime("ORDERS", {
          type: "ORDER_STATUS_UPDATED",
          orderId: id,
          escrowStatus: "FUNDS_RELEASED_TO_SELLER",
        });
      } catch {}

      try {
        const order = await prisma.order.findUnique({ where: { id } });
        if (order && order.storeId) {
          await notificationRepo.create({
            recipientEmail: "seller@tonalzone.id",
            recipientRole: "seller",
            storeId: order.storeId,
            type: "order",
            title: "Dana Escrow Berhasil Dicairkan!",
            message: `Pembeli telah mengonfirmasi penerimaan pesanan #${order.id}. Dana sebesar $${order.totalAmount} telah dicairkan ke saldo toko Anda.`,
            actionLink: "/seller/payouts",
            unread: true,
          });
        }
      } catch {}

      return formatOrderFromPrisma(updated);
    } catch {
      return null;
    }
  },

  async cancelOrder(
    id: string,
    reason?: string,
    cancelledBy?: "BUYER" | "SELLER" | "SYSTEM"
  ): Promise<{ success: boolean; order?: DbOrder | null; error?: string }> {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!order) return { success: false, error: "Pesanan tidak ditemukan" };

      const updated = await prisma.order.update({
        where: { id },
        data: {
          escrowStatus: "REFUNDED",
          paymentStatus: "FAILED",
          cancelReason: reason || "Dibatalkan oleh pembeli",
        },
        include: {
          items: true,
          checkpoints: { orderBy: { timestamp: "asc" } },
        },
      });

      // Restore inventory stock
      for (const item of order.items) {
        if (item.productId) {
          await productRepo.restoreStock(item.productId, item.quantity);
        }
      }

      try {
        serverBroadcastRealtime("ORDERS", {
          type: "ORDER_CANCELLED",
          orderId: id,
          reason,
        });
      } catch {}

      return { success: true, order: formatOrderFromPrisma(updated) };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async simulateAutoSettle(orderId: string): Promise<DbOrder | null> {
    const res = await this.confirmDeliveryAndReleaseFunds(orderId);
    if (res) res.autoSettled = true;
    return res;
  },

  async disputeOrder(id: string, reason: string): Promise<DbOrder | null> {
    try {
      const updated = await prisma.order.update({
        where: { id },
        data: {
          escrowStatus: "DISPUTED",
          cancelReason: reason,
        },
        include: {
          items: true,
          checkpoints: { orderBy: { timestamp: "asc" } },
        },
      });
      return formatOrderFromPrisma(updated);
    } catch {
      return null;
    }
  },

  async advanceTracking(orderId: string, customStatus?: TrackingStatusCode): Promise<DbOrder | null> {
    const order = await this.findById(orderId);
    if (!order) return null;

    const existingCheckpoints = order.checkpoints || [];
    const existingStatuses = new Set(existingCheckpoints.map((c) => c.status));
    const now = new Date();

    let nextStatus: TrackingStatusCode = customStatus || "IN_TRANSIT";
    if (!customStatus) {
      if (!existingStatuses.has("PACKING_ITEMS")) nextStatus = "PACKING_ITEMS";
      else if (!existingStatuses.has("COURIER_PICKED_UP")) nextStatus = "COURIER_PICKED_UP";
      else if (!existingStatuses.has("IN_TRANSIT")) nextStatus = "IN_TRANSIT";
      else if (!existingStatuses.has("OUT_FOR_DELIVERY")) nextStatus = "OUT_FOR_DELIVERY";
      else if (!existingStatuses.has("DELIVERED")) nextStatus = "DELIVERED";
      else return order;
    }

    const titleMap: Record<string, { title: string; desc: string; loc: string }> = {
      ORDER_CREATED: { title: "Pesanan Dibuat", desc: "Pesanan menunggu verifikasi pembayaran.", loc: "TonalZone Hub" },
      PAYMENT_CONFIRMED: { title: "Pembayaran Dikonfirmasi", desc: "Dana escrow diamankan.", loc: "Escrow Vault" },
      PACKING_ITEMS: { title: "Paket Sedang Dikemas", desc: "Penjual sedang menyiapkan barang.", loc: order.storeName },
      COURIER_PICKED_UP: { title: "Paket Diambil Kurir", desc: "Kurir telah mengambil paket.", loc: "Origin Hub" },
      IN_TRANSIT: { title: "Dalam Perjalanan Express", desc: `Paket menuju ${order.destinationCity}.`, loc: "Linehaul Logistics" },
      OUT_FOR_DELIVERY: { title: "Kurir Menuju Alamat", desc: "Paket sedang diantar ke alamat tujuan.", loc: order.destinationCity },
      DELIVERED: { title: "Paket Berhasil Diterima", desc: `Paket diterima oleh ${order.buyerName}.`, loc: order.destinationAddress },
    };

    const details = titleMap[nextStatus] || {
      title: nextStatus,
      desc: "Status pengiriman diperbarui.",
      loc: order.destinationCity || "Jakarta",
    };

    await prisma.orderTrackingCheckpoint.create({
      data: {
        id: `chk-${orderId}-${Date.now()}`,
        orderId,
        status: nextStatus,
        title: details.title,
        description: details.desc,
        location: details.loc,
        timeFormatted: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        isCompleted: true,
      },
    });

    let newEscrowStatus = order.escrowStatus;
    if (nextStatus === "DELIVERED") {
      newEscrowStatus = "DELIVERED";
    } else if (nextStatus === "IN_TRANSIT" || nextStatus === "OUT_FOR_DELIVERY") {
      newEscrowStatus = "IN_TRANSIT";
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        escrowStatus: newEscrowStatus,
        ...(nextStatus === "DELIVERED" ? { deliveredAt: now } : {}),
      },
      include: {
        items: true,
        checkpoints: { orderBy: { timestamp: "asc" } },
      },
    });

    if (nextStatus === "DELIVERED") {
      try {
        await notificationRepo.create({
          recipientEmail: order.buyerEmail,
          recipientRole: "buyer",
          type: "order",
          title: "Paket Telah Tiba di Tujuan",
          message: `Pesanan #${order.id} telah tiba di alamat tujuan. Silakan lakukan inspeksi unboxing dan acoustic test sebelum 2x24 jam.`,
          actionLink: "/orders",
          unread: true,
        });
      } catch {}
    }

    return formatOrderFromPrisma(updated);
  },

  async getTracking(orderId: string) {
    const order = await this.findById(orderId);
    if (!order) return null;

    return {
      orderId: order.id,
      parentOrderId: order.parentOrderId,
      waybillNumber: order.waybillNumber || null,
      courierCode: order.courierCode || "JNE Express",
      serviceTier: order.serviceTier || "REGULAR",
      status: order.escrowStatus,
      originCity: "Jakarta Selatan",
      destinationCity: order.destinationCity,
      destinationAddress: order.destinationAddress,
      estimatedDeliveryDays: 3,
      checkpoints: order.checkpoints || [],
      currentCheckpoint:
        order.checkpoints && order.checkpoints.length > 0
          ? order.checkpoints[order.checkpoints.length - 1]
          : null,
    };
  },

  async markAsReviewed(id: string): Promise<DbOrder | null> {
    try {
      const existing = await prisma.order.findUnique({ where: { id } });
      if (!existing) {
        const created = await prisma.order.create({
          data: {
            id,
            buyerId: "usr-reza",
            buyerName: "Reza Pratama",
            buyerEmail: "reza.p@example.com",
            destinationAddress: "Jl. Sudirman No. 45",
            destinationCity: "Jakarta Selatan",
            destinationPostalCode: "12190",
            storeId: "store-moondrop-official",
            storeName: "MOONDROP Official Flagship Store",
            itemsSubtotal: 319,
            totalAmount: 319,
            paymentStatus: "PAID",
            escrowStatus: "DELIVERED",
            hasReviewed: true,
          },
          include: {
            items: true,
            checkpoints: true,
          },
        });
        return formatOrderFromPrisma(created);
      }

      const updated = await prisma.order.update({
        where: { id },
        data: { hasReviewed: true },
        include: {
          items: true,
          checkpoints: { orderBy: { timestamp: "asc" } },
        },
      });
      return formatOrderFromPrisma(updated);
    } catch {
      return null;
    }
  },
};

// -------------------------------------------------------------
// 7. RETURN & REFUND REPOSITORY (SQLITE PRISMA)
// -------------------------------------------------------------
function formatReturnFromPrisma(r: any): DbReturnRequest {
  if (!r) return r;
  let evidenceImages: string[] = [];
  try {
    evidenceImages = typeof r.evidenceImages === "string" ? JSON.parse(r.evidenceImages) : r.evidenceImages || [];
  } catch {}

  let qcAcousticReport = r.qcAcousticReport;
  if (typeof qcAcousticReport === "string") {
    try {
      qcAcousticReport = JSON.parse(qcAcousticReport);
    } catch {}
  }

  return {
    ...r,
    productPrice: Number(r.productPrice) || 0,
    refundAmount: Number(r.refundAmount) || 0,
    evidenceImages,
    qcAcousticReport,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
  };
}

export const returnRepo = {
  async create(data: {
    orderId: string;
    buyerId: string;
    buyerName: string;
    buyerEmail: string;
    buyerPhone?: string;
    storeId: string;
    storeName: string;
    productId: string;
    productName: string;
    productImage?: string;
    productPrice: number;
    quantity: number;
    selectedVariant?: string;
    reason: string;
    description: string;
    evidenceImages?: string[];
    unboxingVideoUrl?: string;
    unboxingVideoType?: "upload" | "link";
    refundAmount?: number;
    requestedSolution?: "REFUND" | "REPLACEMENT" | string;
    shippingFeeBearer?: "SELLER" | "BUYER";
    returnShippingCost?: number;
    qcStage?: string;
    qcStatus?: string;
  }): Promise<DbReturnRequest> {
    const returnId = `RET-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const created = await prisma.returnRequest.create({
      data: {
        id: returnId,
        orderId: data.orderId,
        buyerId: data.buyerId,
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail.trim().toLowerCase(),
        buyerPhone: data.buyerPhone || null,
        storeId: data.storeId,
        storeName: data.storeName,
        productId: data.productId,
        productName: data.productName,
        productImage: data.productImage || null,
        productPrice: Number(data.productPrice) || 0,
        quantity: Number(data.quantity) || 1,
        selectedVariant: data.selectedVariant || null,
        reason: data.reason,
        description: data.description,
        evidenceImages: JSON.stringify(data.evidenceImages || []),
        unboxingVideoUrl: data.unboxingVideoUrl || null,
        unboxingVideoType: data.unboxingVideoType || null,
        refundAmount: Number(data.refundAmount) || Number(data.productPrice) || 0,
        requestedSolution: data.requestedSolution || "REFUND",
        status: "REQUESTED",
        qcStage: data.qcStage || "STAGE_1_INITIAL_REVIEW",
        qcStatus: data.qcStatus || "PENDING",
      },
    });

    return formatReturnFromPrisma(created);
  },

  async findById(id: string): Promise<DbReturnRequest | null> {
    const r = await prisma.returnRequest.findUnique({ where: { id } });
    return r ? formatReturnFromPrisma(r) : null;
  },

  async findByStoreId(storeId: string): Promise<DbReturnRequest[]> {
    const list = await prisma.returnRequest.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });
    return list.map(formatReturnFromPrisma);
  },

  async findByBuyerEmail(email: string): Promise<DbReturnRequest[]> {
    const list = await prisma.returnRequest.findMany({
      where: { buyerEmail: email.trim().toLowerCase() },
      orderBy: { createdAt: "desc" },
    });
    return list.map(formatReturnFromPrisma);
  },

  async getAll(): Promise<DbReturnRequest[]> {
    const list = await prisma.returnRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return list.map(formatReturnFromPrisma);
  },

  async approveBySeller(id: string, sellerReturnAddress: string): Promise<DbReturnRequest | null> {
    const updated = await prisma.returnRequest.update({
      where: { id },
      data: {
        status: "APPROVED_WAITING_SHIPMENT",
        sellerReturnAddress,
      },
    });
    return formatReturnFromPrisma(updated);
  },

  async submitReturnShipment(id: string, waybillNumber: string, courier: string): Promise<DbReturnRequest | null> {
    const updated = await prisma.returnRequest.update({
      where: { id },
      data: {
        status: "IN_TRANSIT_TO_SELLER",
        returnWaybillNumber: waybillNumber,
        returnCourier: courier,
      },
    });
    return formatReturnFromPrisma(updated);
  },

  async confirmReceipt(id: string): Promise<DbReturnRequest | null> {
    const updated = await prisma.returnRequest.update({
      where: { id },
      data: {
        status: "RECEIVED_INSPECTING",
        qcStage: "STAGE_2_ACOUSTIC_PHYSICAL_QC",
        qcStatus: "PENDING",
      },
    });
    return formatReturnFromPrisma(updated);
  },

  async submitQcInspection(id: string, passed: boolean, notes?: string, acousticReport?: any): Promise<DbReturnRequest | null> {
    const updated = await prisma.returnRequest.update({
      where: { id },
      data: {
        qcStatus: passed ? "PASSED" : "FAILED",
        qcNotes: notes || null,
        qcAcousticReport: acousticReport ? JSON.stringify(acousticReport) : null,
      },
    });
    return formatReturnFromPrisma(updated);
  },

  async issueRefund(id: string): Promise<DbReturnRequest | null> {
    const updated = await prisma.returnRequest.update({
      where: { id },
      data: { status: "REFUNDED" },
    });

    try {
      if (updated.orderId) {
        await prisma.order.update({
          where: { id: updated.orderId },
          data: { escrowStatus: "REFUNDED" },
        });
      }
    } catch {}

    return formatReturnFromPrisma(updated);
  },

  async findByOrderId(orderId: string): Promise<DbReturnRequest | null> {
    const r = await prisma.returnRequest.findFirst({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });
    return r ? formatReturnFromPrisma(r) : null;
  },

  async rejectReturn(id: string, reason: string): Promise<DbReturnRequest | null> {
    const updated = await prisma.returnRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        qcNotes: reason,
      },
    });
    return formatReturnFromPrisma(updated);
  },

  async rejectBySeller(id: string, reason: string): Promise<DbReturnRequest | null> {
    const updated = await prisma.returnRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        sellerRejectReason: reason,
        qcNotes: reason,
      },
    });
    return formatReturnFromPrisma(updated);
  },

  async issueReplacement(id: string, trackingNumber?: string, courier?: string): Promise<DbReturnRequest | null> {
    const updated = await prisma.returnRequest.update({
      where: { id },
      data: {
        status: "REPLACED",
        replacementWaybillNumber: trackingNumber || null,
        replacementCourier: courier || null,
      },
    });
    return formatReturnFromPrisma(updated);
  },
};

// -------------------------------------------------------------
// 8. SELLER PAYOUT REPOSITORY (SQLITE PRISMA)
// -------------------------------------------------------------
export const payoutRepo = {
  async recordWithdrawal(data: {
    storeId: string;
    amountUSD: number;
    amountIDR?: number;
    bankName: string;
    bankAccount: string;
    accountHolder: string;
  }): Promise<DbSellerPayout> {
    const payoutId = `PO-${Math.floor(1000 + Math.random() * 9000)}`;

    const created = await prisma.sellerPayout.create({
      data: {
        id: payoutId,
        storeId: data.storeId,
        amountUSD: Number(data.amountUSD) || 0,
        bankName: data.bankName,
        bankAccount: data.bankAccount,
        accountHolder: data.accountHolder,
        status: "PROCESSING",
      },
    });

    return {
      ...created,
      amountUSD: Number(created.amountUSD),
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  },

  async getWithdrawals(storeId: string): Promise<DbSellerPayout[]> {
    const rows = await prisma.sellerPayout.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => ({
      ...r,
      amountUSD: Number(r.amountUSD),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  },

  async getAll(): Promise<DbSellerPayout[]> {
    const rows = await prisma.sellerPayout.findMany({
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => ({
      ...r,
      amountUSD: Number(r.amountUSD),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  },
};

// -------------------------------------------------------------
// 9. REVIEW & RATING REPOSITORY (SQLITE PRISMA)
// -------------------------------------------------------------
function formatReviewFromPrisma(r: any): DbReview {
  if (!r) return r;
  let tags: string[] = [];
  try {
    tags = typeof r.tags === "string" ? JSON.parse(r.tags) : r.tags || [];
  } catch {}

  return {
    ...r,
    rating: Number(r.rating) || 5,
    tags,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
  };
}

export const reviewRepo = {
  async create(review: {
    id?: string;
    orderId?: string;
    productId: string;
    productName: string;
    title?: string;
    productImage?: string;
    photos?: string[];
    variant?: string;
    rating: number;
    comment: string;
    tags?: string[];
    buyerName: string;
    buyerEmail?: string;
    buyerAvatar?: string;
    isAnonymous?: boolean;
    storeId?: string;
    storeName?: string;
  }): Promise<DbReview> {
    const revId = review.id || `rev-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const created = await prisma.review.create({
      data: {
        id: revId,
        orderId: review.orderId || null,
        productId: review.productId,
        productName: review.productName,
        title: review.title || null,
        productImage: review.productImage || null,
        photos: review.photos ? JSON.stringify(review.photos) : null,
        variant: review.variant || null,
        rating: Number(review.rating) || 5,
        comment: review.comment,
        tags: JSON.stringify(review.tags || []),
        buyerName: review.buyerName,
        buyerEmail: review.buyerEmail || null,
        isAnonymous: Boolean(review.isAnonymous),
        storeId: review.storeId || null,
        storeName: review.storeName || null,
      },
    });

    if (review.orderId) {
      await orderRepo.markAsReviewed(review.orderId);
    }

    return formatReviewFromPrisma(created);
  },

  async findByOrderId(orderId: string): Promise<DbReview[]> {
    const rows = await prisma.review.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(formatReviewFromPrisma);
  },

  async addReply(
    reviewId: string,
    reply: {
      authorName?: string;
      authorRole?: string;
      authorAvatar?: string;
      replyToUser?: string;
      storeId?: string;
      storeName?: string;
      comment: string;
    }
  ): Promise<any> {
    return {
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      reviewId,
      authorName: reply.authorName || reply.storeName || "Official Merchant",
      authorRole: reply.authorRole || "seller",
      authorAvatar: reply.authorAvatar,
      replyToUser: reply.replyToUser,
      storeId: reply.storeId || "store-official",
      storeName: reply.storeName || reply.authorName || "Official Store",
      comment: reply.comment,
      createdAt: new Date().toISOString(),
    };
  },

  async findByProductId(productId: string): Promise<DbReview[]> {
    const rows = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(formatReviewFromPrisma);
  },

  async findByStoreId(storeId: string): Promise<DbReview[]> {
    const rows = await prisma.review.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(formatReviewFromPrisma);
  },

  async getAll(): Promise<DbReview[]> {
    const rows = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
    });
    return rows.map(formatReviewFromPrisma);
  },
};

// -------------------------------------------------------------
// 10. VOUCHER REPOSITORY (SQLITE PRISMA)
// -------------------------------------------------------------
function formatVoucherFromPrisma(v: any): DbVoucher {
  if (!v) return v;
  return {
    ...v,
    discountValue: Number(v.discountValue) || 0,
    minSpend: Number(v.minSpend) || 0,
    maxDiscount: v.maxDiscount !== null ? Number(v.maxDiscount) : null,
    quota: Number(v.quota) || 0,
    usedCount: Number(v.usedCount) || 0,
    startDate: v.startDate instanceof Date ? v.startDate.toISOString() : v.startDate,
    expiryDate: v.expiryDate instanceof Date ? v.expiryDate.toISOString() : v.expiryDate,
    createdAt: v.createdAt instanceof Date ? v.createdAt.toISOString() : v.createdAt,
    updatedAt: v.updatedAt instanceof Date ? v.updatedAt.toISOString() : v.updatedAt,
  };
}

export const voucherRepo = {
  async create(voucher: {
    id?: string;
    code: string;
    title: string;
    description?: string;
    discountType?: VoucherDiscountType | string;
    discountValue: number;
    minSpend?: number;
    maxDiscount?: number;
    quota?: number;
    startDate?: string;
    expiryDate: string;
    isActive?: boolean;
  }): Promise<DbVoucher> {
    const vId = voucher.id || `vouch-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const created = await prisma.voucher.create({
      data: {
        id: vId,
        code: voucher.code.trim().toUpperCase(),
        title: voucher.title,
        description: voucher.description || null,
        discountType: voucher.discountType || "PERCENTAGE",
        discountValue: Number(voucher.discountValue) || 0,
        minSpend: Number(voucher.minSpend) || 0,
        maxDiscount: voucher.maxDiscount !== undefined ? Number(voucher.maxDiscount) : null,
        quota: Number(voucher.quota) || 100,
        startDate: voucher.startDate ? new Date(voucher.startDate) : new Date(),
        expiryDate: new Date(voucher.expiryDate),
        isActive: voucher.isActive !== undefined ? voucher.isActive : true,
      },
    });

    return formatVoucherFromPrisma(created);
  },

  async getById(id: string): Promise<DbVoucher | null> {
    const v = await prisma.voucher.findUnique({
      where: { id },
    });
    return v ? formatVoucherFromPrisma(v) : null;
  },

  async getByCode(code: string): Promise<DbVoucher | null> {
    const v = await prisma.voucher.findUnique({
      where: { code: code.trim().toUpperCase() },
    });
    return v ? formatVoucherFromPrisma(v) : null;
  },

  async incrementUsage(code: string): Promise<boolean> {
    try {
      const v = await this.getByCode(code);
      if (!v) return false;
      await prisma.voucher.update({
        where: { id: v.id },
        data: {
          quota: { decrement: 1 },
          usedCount: { increment: 1 },
        },
      });
      return true;
    } catch {
      return false;
    }
  },

  async validate(
    code: string,
    subtotal: number
  ): Promise<{ valid: boolean; discountUSD: number; message?: string; voucher?: DbVoucher }> {
    const voucher = await this.getByCode(code);
    if (!voucher) {
      return { valid: false, discountUSD: 0, message: "Kode voucher tidak ditemukan." };
    }

    if (!voucher.isActive) {
      return { valid: false, discountUSD: 0, message: "Voucher tidak aktif atau sudah dinonaktifkan." };
    }

    if (new Date(voucher.expiryDate).getTime() < Date.now()) {
      return { valid: false, discountUSD: 0, message: "Voucher telah kedaluwarsa." };
    }

    if (voucher.quota <= 0) {
      return { valid: false, discountUSD: 0, message: "Kuota voucher telah habis." };
    }

    if (subtotal < voucher.minSpend) {
      return {
        valid: false,
        discountUSD: 0,
        message: `Minimal belanja untuk menggunakan kode ini adalah $${voucher.minSpend}.`,
      };
    }

    let discount = 0;
    if (voucher.discountType === "PERCENTAGE") {
      discount = (subtotal * voucher.discountValue) / 100;
      if (voucher.maxDiscount && discount > voucher.maxDiscount) {
        discount = voucher.maxDiscount;
      }
    } else {
      discount = voucher.discountValue;
    }

    return {
      valid: true,
      discountUSD: Math.min(discount, subtotal),
      voucher,
    };
  },

  async update(id: string, updates: Partial<DbVoucher>): Promise<DbVoucher | null> {
    try {
      const dataToUpdate: any = {};
      if (updates.title !== undefined) dataToUpdate.title = updates.title;
      if (updates.description !== undefined) dataToUpdate.description = updates.description;
      if (updates.discountValue !== undefined) dataToUpdate.discountValue = Number(updates.discountValue);
      if (updates.minSpend !== undefined) dataToUpdate.minSpend = Number(updates.minSpend);
      if (updates.maxDiscount !== undefined) dataToUpdate.maxDiscount = Number(updates.maxDiscount);
      if (updates.quota !== undefined) dataToUpdate.quota = Number(updates.quota);
      if (updates.isActive !== undefined) dataToUpdate.isActive = updates.isActive;

      const updated = await prisma.voucher.update({
        where: { id },
        data: dataToUpdate,
      });
      return formatVoucherFromPrisma(updated);
    } catch {
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.voucher.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },

  async getAll(): Promise<DbVoucher[]> {
    const list = await prisma.voucher.findMany({ orderBy: { createdAt: "desc" } });
    return list.map(formatVoucherFromPrisma);
  },
};

// -------------------------------------------------------------
// 11. NOTIFICATION REPOSITORY (SQLITE PRISMA)
// -------------------------------------------------------------
export const notificationRepo = {
  async create(notif: {
    id?: string;
    recipientEmail: string;
    recipientRole?: string;
    storeId?: string;
    type?: string;
    title: string;
    message: string;
    actionLink?: string;
    unread?: boolean;
    meta?: any;
  }): Promise<DbNotification> {
    const nId = notif.id || `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const created = await prisma.notification.create({
      data: {
        id: nId,
        recipientEmail: notif.recipientEmail.trim().toLowerCase(),
        recipientRole: notif.recipientRole || "buyer",
        storeId: notif.storeId || null,
        type: notif.type || "order",
        title: notif.title,
        message: notif.message,
        actionLink: notif.actionLink || "/orders",
        unread: notif.unread !== undefined ? notif.unread : true,
      },
    });

    return {
      ...created,
      actionLink: created.actionLink || "/orders",
      createdAt: created.createdAt.toISOString(),
    };
  },

  async getByRecipient(email?: string, storeId?: string): Promise<DbNotification[]> {
    const where: any = {};
    if (email) where.recipientEmail = email.trim().toLowerCase();
    if (storeId) where.storeId = storeId;

    const rows = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r) => ({
      ...r,
      actionLink: r.actionLink || "/orders",
      createdAt: r.createdAt.toISOString(),
    }));
  },

  async markAsRead(id: string): Promise<boolean> {
    try {
      await prisma.notification.update({
        where: { id },
        data: { unread: false },
      });
      return true;
    } catch {
      return false;
    }
  },

  async markAllAsRead(email?: string, storeId?: string): Promise<number> {
    try {
      const where: any = { unread: true };
      if (email) where.recipientEmail = email.trim().toLowerCase();
      if (storeId) where.storeId = storeId;
      const res = await prisma.notification.updateMany({
        where,
        data: { unread: false },
      });
      return res.count;
    } catch {
      return 0;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.notification.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },

  async clearAll(email?: string, storeId?: string): Promise<number> {
    try {
      const where: any = {};
      if (email) where.recipientEmail = email.trim().toLowerCase();
      if (storeId) where.storeId = storeId;
      const res = await prisma.notification.deleteMany({ where });
      return res.count;
    } catch {
      return 0;
    }
  },
};

function formatChatMessageFromPrisma(m: any): DbChatMessage {
  if (!m) return m;
  let productCard = undefined;
  if (m.productCard) {
    try {
      productCard = typeof m.productCard === "string" ? JSON.parse(m.productCard) : m.productCard;
    } catch {}
  }
  let orderCard = undefined;
  if (m.orderCard) {
    try {
      orderCard = typeof m.orderCard === "string" ? JSON.parse(m.orderCard) : m.orderCard;
    } catch {}
  }
  return {
    ...m,
    productCard,
    orderCard,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
  };
}

export const chatRepo = {
  async getConversationById(id: string): Promise<DbChatConversation | null> {
    const conv = await prisma.conversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!conv) return null;
    return {
      ...conv,
      lastMessageAt: conv.lastMessageAt.toISOString(),
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      messages: (conv.messages || []).map(formatChatMessageFromPrisma),
    };
  },

  async findOrCreateConversation(data: {
    buyerEmail: string;
    buyerName: string;
    storeId: string;
    storeName: string;
    storeType?: string;
  }): Promise<DbChatConversation> {
    const buyerEmail = data.buyerEmail.trim().toLowerCase();
    let conv = await prisma.conversation.findFirst({
      where: {
        buyerEmail,
        storeId: data.storeId,
      },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!conv) {
      conv = await prisma.conversation.create({
        data: {
          id: `conv-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          buyerEmail,
          buyerName: data.buyerName,
          storeId: data.storeId,
          storeName: data.storeName,
          unreadBuyer: 0,
          unreadSeller: 0,
        },
        include: { messages: true },
      });
    }

    return {
      ...conv,
      lastMessageAt: conv.lastMessageAt.toISOString(),
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      messages: (conv.messages || []).map(formatChatMessageFromPrisma),
    };
  },

  async sendMessage(data: {
    conversationId: string;
    senderRole: "buyer" | "seller";
    senderName: string;
    senderEmail?: string;
    text: string;
    productCard?: any;
    orderCard?: any;
  }): Promise<DbChatMessage> {
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const senderEmail = data.senderEmail || (data.senderRole === "seller" ? "seller@tonalzone.id" : "buyer@tonalzone.id");

    const created = await prisma.chatMessage.create({
      data: {
        id: msgId,
        conversationId: data.conversationId,
        senderRole: data.senderRole,
        senderName: data.senderName,
        senderEmail,
        text: data.text,
        isRead: false,
        productCard: data.productCard ? JSON.stringify(data.productCard) : null,
        orderCard: data.orderCard ? JSON.stringify(data.orderCard) : null,
      },
    });

    const preview =
      data.text.trim() ||
      (data.productCard ? `Menanyakan: ${data.productCard.name}` : "") ||
      (data.orderCard ? `Pesanan #${data.orderCard.orderNumber}` : "Lampiran");

    await prisma.conversation.update({
      where: { id: data.conversationId },
      data: {
        lastMessage: preview,
        lastMessageAt: new Date(),
        ...(data.senderRole === "buyer" ? { unreadSeller: { increment: 1 } } : { unreadBuyer: { increment: 1 } }),
      },
    });

    return formatChatMessageFromPrisma(created);
  },

  async getMessages(conversationId: string): Promise<DbChatMessage[]> {
    const rows = await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(formatChatMessageFromPrisma);
  },

  async markAsRead(conversationId: string, role: "buyer" | "seller"): Promise<boolean> {
    try {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: role === "buyer" ? { unreadBuyer: 0 } : { unreadSeller: 0 },
      });

      await prisma.chatMessage.updateMany({
        where: { conversationId, isRead: false },
        data: { isRead: true },
      });
      return true;
    } catch {
      return false;
    }
  },

  async getConversations(buyerEmail?: string, storeId?: string, storeName?: string): Promise<DbChatConversation[]> {
    const where: any = {};
    if (buyerEmail) where.buyerEmail = buyerEmail.trim().toLowerCase();
    if (storeId) where.storeId = storeId;
    if (storeName) where.storeName = storeName;

    const rows = await prisma.conversation.findMany({
      where,
      orderBy: { lastMessageAt: "desc" },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    return rows.map((c) => ({
      ...c,
      lastMessageAt: c.lastMessageAt.toISOString(),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      messages: (c.messages || []).map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })),
    }));
  },

  async getStoreConversations(storeId: string): Promise<DbChatConversation[]> {
    const rows = await prisma.conversation.findMany({
      where: { storeId },
      orderBy: { lastMessageAt: "desc" },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    return rows.map((c) => ({
      ...c,
      lastMessageAt: c.lastMessageAt.toISOString(),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      messages: (c.messages || []).map((m) => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
      })),
    }));
  },
};

// -------------------------------------------------------------
// 13. CHAT SETTINGS & STORE OPERATING HOURS
// -------------------------------------------------------------
const DEFAULT_SCHEDULE: DbOperatingHoursSchedule[] = [
  { day: "Senin", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "Selasa", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "Rabu", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "Kamis", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "Jumat", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "Sabtu", isOpen: true, openTime: "09:00", closeTime: "15:00" },
  { day: "Minggu", isOpen: false, openTime: "09:00", closeTime: "15:00" },
];

const DEFAULT_TEMPLATES: DbChatTemplate[] = [
  { id: "tpl-1", title: "Sapaan Hangat", text: "Halo kak! Terima kasih telah menghubungi TonalZone. Ada yang bisa kami bantu seputar IEM pilihan kakak hari ini?", category: "GREETING" },
  { id: "tpl-2", title: "Cek Stok Produk", text: "Stok produk ini tersedia dan siap dikirim hari ini sebelum pukul 16:00 WIB kak.", category: "PRODUCT_INQUIRY" },
  { id: "tpl-3", title: "Status Pengiriman", text: "Pesanan kakak sedang kami siapkan dengan bubble wrap tebal dan kardus khusus audio.", category: "SHIPPING" },
];

const globalChatSettingsCache = new Map<string, DbStoreChatSettings>();

export const chatSettingsRepo = {
  async getSettings(storeId: string): Promise<DbStoreChatSettings> {
    const cleanId = (storeId || "default-store").trim().toLowerCase();
    const existing = globalChatSettingsCache.get(cleanId);
    if (existing) return existing;

    const initial: DbStoreChatSettings = {
      storeId: cleanId,
      templates: [...DEFAULT_TEMPLATES],
      operatingHours: {
        enabled: true,
        timezone: "WIB",
        schedule: [...DEFAULT_SCHEDULE],
      },
      autoReplyOutOfHours: true,
      outOfHoursMessage:
        "Halo kak! Terima kasih sudah menghubungi kami. Saat ini toko sedang berada di luar jam operasional (Senin-Jumat 09.00-18.00 WIB, Sabtu 09.00-15.00 WIB). Pesan Anda telah kami terima dan akan dibalas secepatnya saat jam operasional kembali aktif.",
      welcomeMessageEnabled: false,
      welcomeMessage:
        "Halo! Selamat datang di toko kami di TonalZone. Ada yang bisa kami bantu mengenai IEM, kabel, atau DAC pilihan kakak?",
      updatedAt: new Date().toISOString(),
    };

    globalChatSettingsCache.set(cleanId, initial);
    return initial;
  },

  async updateSettings(storeId: string, updates: Partial<DbStoreChatSettings>): Promise<DbStoreChatSettings> {
    const current = await this.getSettings(storeId);
    const updated: DbStoreChatSettings = {
      ...current,
      ...updates,
      storeId: current.storeId,
      updatedAt: new Date().toISOString(),
    };

    globalChatSettingsCache.set(current.storeId, updated);
    return updated;
  },

  async isStoreOpen(storeId: string): Promise<{ isOpen: boolean; scheduleText: string; reason?: string }> {
    const settings = await this.getSettings(storeId);
    if (!settings.operatingHours.enabled) {
      return { isOpen: true, scheduleText: "Buka 24 Jam (Operasional Fleksibel)" };
    }

    const now = new Date();
    const jakartaTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
    const jakartaDate = new Date(jakartaTimeStr);

    const dayIndex = jakartaDate.getDay();
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const todayName = dayNames[dayIndex];

    const todaySched = settings.operatingHours.schedule.find(
      (s) => s.day.toLowerCase() === todayName.toLowerCase()
    );

    if (!todaySched || !todaySched.isOpen) {
      return {
        isOpen: false,
        scheduleText: `${todayName}: Tutup / Libur`,
        reason: `Toko tutup pada hari ${todayName}`,
      };
    }

    const currentMinutes = jakartaDate.getHours() * 60 + jakartaDate.getMinutes();
    const [openH, openM] = todaySched.openTime.split(":").map(Number);
    const [closeH, closeM] = todaySched.closeTime.split(":").map(Number);
    const openMinutes = (openH || 0) * 60 + (openM || 0);
    const closeMinutes = (closeH || 0) * 60 + (closeM || 0);

    const isOpenNow = currentMinutes >= openMinutes && currentMinutes <= closeMinutes;

    return {
      isOpen: isOpenNow,
      scheduleText: `${todayName} ${todaySched.openTime} - ${todaySched.closeTime} WIB`,
      reason: isOpenNow ? undefined : `Di luar jam kerja (${todaySched.openTime} - ${todaySched.closeTime} WIB)`,
    };
  },
};
