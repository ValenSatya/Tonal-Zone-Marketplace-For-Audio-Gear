import { supabase } from "./supabase";
export { supabase };

export interface DbUser {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
  role: "BUYER" | "SELLER" | "ADMIN";
  location?: string | null;
  language?: string | null;
  tuningPreference?: string | null;
  createdAt?: string;
  updatedAt?: string;
  store?: DbStore | null;
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
  createdAt?: string;
  updatedAt?: string;
  storeType?: "RETAIL_MERCHANT" | "OFFICIAL_BRAND";
  brandName?: string | null;
}

export function parseStoreMetadata(store: any): DbStore {
  if (!store) return store;
  const desc = store.description || "";
  const name = store.storeName || "";
  const isOfficial =
    desc.includes("OFFICIAL_BRAND") ||
    name.toLowerCase().includes("moondrop official") ||
    store.id === "store-moondrop-official";

  let brandName = null;
  if (isOfficial) {
    const match = desc.match(/OFFICIAL_BRAND:([A-Za-z0-9_\s-]+)/);
    brandName = match ? match[1].trim() : "MOONDROP";
  }

  return {
    ...store,
    storeType: isOfficial ? "OFFICIAL_BRAND" : "RETAIL_MERCHANT",
    brandName,
  };
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
  createdAt?: string;
  updatedAt?: string;
}

// -------------------------------------------------------------
// USER ADDRESS CACHE & REPOSITORY (PURE SUPABASE + CACHE)
// -------------------------------------------------------------
export const globalUserAddressCache = new Map<string, DbUserAddress[]>();

export function parseUserAddresses(locationStr?: string | null): DbUserAddress[] {
  if (!locationStr) return [];
  try {
    const parsed = JSON.parse(locationStr);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed && Array.isArray(parsed.addresses)) {
      return parsed.addresses;
    }
  } catch {
    // Plain location string
  }
  return [];
}

// -------------------------------------------------------------
// USER REPOSITORY (PURE SUPABASE)
// -------------------------------------------------------------
export const userRepo = {
  async findByEmail(email: string): Promise<DbUser | null> {
    const { data: users, error } = await supabase
      .from("User")
      .select("*, store:Store(*)")
      .eq("email", email.trim().toLowerCase())
      .limit(1);

    if (error || !users || users.length === 0) return null;
    const user = users[0];
    const rawStore = Array.isArray(user.store) ? user.store[0] : user.store;
    return {
      ...user,
      store: rawStore ? parseStoreMetadata(rawStore) : null,
    };
  },

  async findById(id: string): Promise<DbUser | null> {
    const { data: users, error } = await supabase
      .from("User")
      .select("*, store:Store(*)")
      .eq("id", id)
      .limit(1);

    if (error || !users || users.length === 0) return null;
    const user = users[0];
    const rawStore = Array.isArray(user.store) ? user.store[0] : user.store;
    return {
      ...user,
      store: rawStore ? parseStoreMetadata(rawStore) : null,
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
  }): Promise<DbUser> {
    const email = user.email.trim().toLowerCase();
    const existing = await this.findByEmail(email);

    const payload = {
      id: user.id || existing?.id || `usr-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      email,
      name: user.name ?? existing?.name ?? email.split("@")[0],
      avatar: user.avatar ?? existing?.avatar ?? "/placeholder.svg",
      role: user.role ?? existing?.role ?? (email.includes("admin") ? "ADMIN" : "BUYER"),
      location: user.location ?? existing?.location ?? "Indonesia",
      language: user.language ?? existing?.language ?? "id",
      tuningPreference: user.tuningPreference ?? existing?.tuningPreference ?? "Reference / Neutral",
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("User")
      .upsert(payload, { onConflict: "email" })
      .select("*, store:Store(*)")
      .single();

    if (error) {
      console.error("[Supabase DB] upsert user error:", error.message);
      return { ...payload, store: existing?.store || null };
    }

    const rawStore = Array.isArray(data.store) ? data.store[0] : data.store;
    return {
      ...data,
      store: rawStore ? parseStoreMetadata(rawStore) : null,
    };
  },

  async update(
    email: string,
    updates: Partial<{
      name: string;
      avatar: string;
      role: "BUYER" | "SELLER" | "ADMIN";
      location: string;
      language: string;
      tuningPreference: string;
    }>
  ): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from("User")
      .update({ ...updates, updatedAt: new Date().toISOString() })
      .eq("email", email.trim().toLowerCase())
      .select("*, store:Store(*)")
      .single();

    if (error) {
      console.error("[Supabase DB] update user error:", error.message);
      return null;
    }

    const rawStore = Array.isArray(data.store) ? data.store[0] : data.store;
    return {
      ...data,
      store: rawStore ? parseStoreMetadata(rawStore) : null,
    };
  },

  async getAddresses(userIdOrEmail: string): Promise<DbUserAddress[]> {
    const key = userIdOrEmail.trim().toLowerCase();
    if (globalUserAddressCache.has(key)) {
      return globalUserAddressCache.get(key)!;
    }

    const user = key.includes("@") ? await this.findByEmail(key) : await this.findById(key);
    if (!user) return [];

    const addresses = parseUserAddresses(user.location);
    globalUserAddressCache.set(key, addresses);
    if (user.email && user.email.toLowerCase() !== key) {
      globalUserAddressCache.set(user.email.toLowerCase(), addresses);
    }
    if (user.id && user.id !== key) {
      globalUserAddressCache.set(user.id, addresses);
    }
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
    let currentAddresses = await this.getAddresses(key);

    const addressId = address.id || `addr-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const isFirst = currentAddresses.length === 0;
    const shouldBeDefault = address.isDefault !== undefined ? address.isDefault : isFirst;

    const newAddressItem: DbUserAddress = {
      id: addressId,
      label: address.label || "Alamat Utama",
      recipientName: address.recipientName,
      phone: address.phone,
      street: address.street,
      city: address.city,
      province: address.province || "DKI Jakarta",
      postalCode: address.postalCode,
      country: address.country || "Indonesia",
      isDefault: shouldBeDefault,
    };

    if (shouldBeDefault) {
      currentAddresses = currentAddresses.map((a) => ({ ...a, isDefault: false }));
    }

    const existingIndex = currentAddresses.findIndex((a) => a.id === addressId);
    let updatedAddresses: DbUserAddress[];
    if (existingIndex >= 0) {
      currentAddresses[existingIndex] = newAddressItem;
      updatedAddresses = [...currentAddresses];
    } else {
      updatedAddresses = [newAddressItem, ...currentAddresses];
    }

    if (!updatedAddresses.some((a) => a.isDefault) && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }

    // Update Cache
    globalUserAddressCache.set(key, updatedAddresses);
    if (user?.email) globalUserAddressCache.set(user.email.toLowerCase(), updatedAddresses);
    if (user?.id) globalUserAddressCache.set(user.id, updatedAddresses);

    // Persist to Supabase User
    if (user?.email) {
      await this.update(user.email, {
        location: JSON.stringify(updatedAddresses),
      });
    } else if (key.includes("@")) {
      user = await this.upsert({
        email: key,
        name: address.recipientName || key.split("@")[0],
        location: JSON.stringify(updatedAddresses),
      });
      if (user?.id) globalUserAddressCache.set(user.id, updatedAddresses);
    }

    return newAddressItem;
  },

  async deleteAddress(userIdOrEmail: string, addressId: string): Promise<boolean> {
    const key = userIdOrEmail.trim().toLowerCase();
    const user = key.includes("@") ? await this.findByEmail(key) : await this.findById(key);
    let currentAddresses = await this.getAddresses(key);

    const filtered = currentAddresses.filter((a) => a.id !== addressId);
    if (filtered.length === currentAddresses.length) return false;

    if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
      filtered[0].isDefault = true;
    }

    globalUserAddressCache.set(key, filtered);
    if (user?.email) globalUserAddressCache.set(user.email.toLowerCase(), filtered);
    if (user?.id) globalUserAddressCache.set(user.id, filtered);

    if (user?.email) {
      await this.update(user.email, {
        location: JSON.stringify(filtered),
      });
    }

    return true;
  },

  async setDefaultAddress(userIdOrEmail: string, addressId: string): Promise<boolean> {
    const key = userIdOrEmail.trim().toLowerCase();
    const user = key.includes("@") ? await this.findByEmail(key) : await this.findById(key);
    let currentAddresses = await this.getAddresses(key);

    const exists = currentAddresses.some((a) => a.id === addressId);
    if (!exists) return false;

    const updated = currentAddresses.map((a) => ({
      ...a,
      isDefault: a.id === addressId,
    }));

    globalUserAddressCache.set(key, updated);
    if (user?.email) globalUserAddressCache.set(user.email.toLowerCase(), updated);
    if (user?.id) globalUserAddressCache.set(user.id, updated);

    if (user?.email) {
      await this.update(user.email, {
        location: JSON.stringify(updated),
      });
    }

    return true;
  },
};

// -------------------------------------------------------------
// STORE REPOSITORY (PURE SUPABASE)
// -------------------------------------------------------------
export const storeRepo = {
  async findById(id: string): Promise<DbStore | null> {
    const { data, error } = await supabase
      .from("Store")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) return parseStoreMetadata(data);

    if (id === "store-moondrop-official" || id.toLowerCase().includes("moondrop")) {
      return {
        id: "store-moondrop-official",
        userId: "usr-moondrop",
        storeName: "MOONDROP Official Flagship Store",
        status: "APPROVED",
        storeType: "OFFICIAL_BRAND",
        brandName: "MOONDROP",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };
    }

    try {
      const metaStore = loadPersistentOrdersMeta();
      for (const order of Object.values(metaStore)) {
        if (order.storeId === id) {
          return {
            id: order.storeId,
            userId: order.buyerId || "usr-seller",
            storeName: order.storeName || "Seller Store",
            status: "APPROVED",
            storeType: "RETAIL_MERCHANT",
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          };
        }
      }
    } catch (e) {}

    return null;
  },

  async findByUserId(userId: string): Promise<DbStore | null> {
    const { data, error } = await supabase
      .from("Store")
      .select("*")
      .eq("userId", userId)
      .maybeSingle();

    if (!error && data) return parseStoreMetadata(data);

    if (userId === "usr-moondrop" || userId.toLowerCase().includes("moondrop")) {
      return {
        id: "store-moondrop-official",
        userId: "usr-moondrop",
        storeName: "MOONDROP Official Flagship Store",
        status: "APPROVED",
        storeType: "OFFICIAL_BRAND",
        brandName: "MOONDROP",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      };
    }

    return null;
  },

  async findByName(storeName: string): Promise<DbStore | null> {
    const { data, error } = await supabase
      .from("Store")
      .select("*")
      .eq("storeName", storeName.trim())
      .limit(1);

    if (error || !data || data.length === 0) return null;
    return parseStoreMetadata(data[0]);
  },

  async update(id: string, updates: Partial<DbStore>): Promise<DbStore | null> {
    const payload: any = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    delete payload.storeType;
    delete payload.brandName;

    const { data, error } = await supabase
      .from("Store")
      .update(payload)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error || !data) {
      console.error("[Supabase DB] update store error:", error?.message);
      return null;
    }
    return parseStoreMetadata(data);
  },

  async create(store: {
    userId: string;
    storeName: string;
    description?: string;
    address?: string;
    status?: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
    bankName?: string;
    bankAccount?: string;
  }): Promise<DbStore | null> {
    const payload = {
      id: `store-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      userId: store.userId,
      storeName: store.storeName.trim(),
      description: store.description || "",
      address: store.address || "Jakarta",
      status: store.status || "PENDING",
      bankName: store.bankName || "BCA",
      bankAccount: store.bankAccount || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("Store")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("[Supabase DB] create store error:", error.message);
      return null;
    }
    return parseStoreMetadata(data);
  },
};

// -------------------------------------------------------------
// BRAND & CATEGORY REPOSITORIES (PURE SUPABASE)
// -------------------------------------------------------------
export const brandRepo = {
  async upsert(name: string, submittedById?: string): Promise<{ id: string; name: string }> {
    const trimmed = name.trim();
    const { data: existing } = await supabase
      .from("Brand")
      .select("id, name")
      .eq("name", trimmed)
      .limit(1);

    if (existing && existing.length > 0) {
      return existing[0];
    }

    const payload = {
      id: `brand-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      name: trimmed,
      status: "APPROVED",
      submittedById: submittedById || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("Brand").insert(payload).select("id, name").single();
    if (error) return { id: payload.id, name: trimmed };
    return data;
  },
};

export const categoryRepo = {
  async upsert(name: string): Promise<{ id: string; name: string }> {
    const formatted = name.trim().toUpperCase();
    const { data: existing } = await supabase
      .from("Category")
      .select("id, name")
      .eq("name", formatted)
      .limit(1);

    if (existing && existing.length > 0) {
      return existing[0];
    }

    const payload = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      name: formatted,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("Category").insert(payload).select("id, name").single();
    if (error) return { id: payload.id, name: formatted };
    return data;
  },
};

// -------------------------------------------------------------
// PRODUCT REPOSITORY (PURE SUPABASE)
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
  }): Promise<DbProduct | null> {
    const payload = {
      id: product.id || `prod-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      name: product.name,
      storeId: product.storeId,
      brandId: product.brandId,
      categoryId: product.categoryId,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      experienceLevel: product.experienceLevel || "INTERMEDIATE",
      soundSignature: product.soundSignature || "NEUTRAL",
      status: "APPROVED",
      images: product.images || ["/hero-blessing-3.jpg"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("Product").insert(payload).select().single();
    if (error) {
      console.error("[Supabase DB] create product error:", error.message);
      return null;
    }
    return data;
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
    const payload = {
      id: product.id,
      name: product.name,
      storeId: product.storeId,
      brandId: product.brandId,
      categoryId: product.categoryId,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      experienceLevel: product.experienceLevel || "INTERMEDIATE",
      soundSignature: product.soundSignature || "NEUTRAL",
      status: "APPROVED",
      images: product.images || ["/hero-blessing-3.jpg"],
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("Product")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error("[Supabase DB] upsert product error:", error.message);
      return null;
    }
    return data;
  },

  async findById(id: string): Promise<any | null> {
    const { data, error } = await supabase
      .from("Product")
      .select(`
        *,
        brand:Brand(id, name),
        category:Category(id, name),
        store:Store(id, storeName, address)
      `)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  },

  async findByStoreId(storeId?: string | null): Promise<any[]> {
    if (!storeId) return [];

    const { data, error } = await supabase
      .from("Product")
      .select(`
        *,
        brand:Brand(id, name),
        category:Category(id, name),
        store:Store(id, storeName, address)
      `)
      .eq("storeId", storeId)
      .order("createdAt", { ascending: false });

    if (error || !data) {
      console.error("[Supabase DB] findByStoreId error:", error?.message);
      return [];
    }
    return data;
  },

  async update(id: string, updates: Partial<DbProduct>): Promise<any | null> {
    const payload = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("Product")
      .update(payload)
      .eq("id", id)
      .select(`
        *,
        brand:Brand(id, name),
        category:Category(id, name),
        store:Store(id, storeName, address)
      `)
      .single();

    if (error) {
      console.error("[Supabase DB] update product error:", error.message);
      return null;
    }
    return data;
  },

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("Product")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[Supabase DB] delete product error:", error.message);
      return false;
    }
    return true;
  },

  async deleteMany() {
    await supabase.from("OrderItem").delete().neq("id", "0");
    await supabase.from("Product").delete().neq("id", "0");
  },

  async getStock(productId: string): Promise<number> {
    const cleanId = (productId || "").trim().toLowerCase();
    if (globalProductStockCache.has(cleanId)) {
      return globalProductStockCache.get(cleanId)!;
    }
    try {
      const { data } = await supabase.from("Product").select("stock").eq("id", cleanId).maybeSingle();
      if (data && data.stock !== undefined && data.stock !== null) {
        const val = Number(data.stock);
        globalProductStockCache.set(cleanId, val);
        return val;
      }
    } catch {}
    return 10;
  },

  async deductStock(productId: string, quantity: number): Promise<{ success: boolean; remainingStock: number; error?: string }> {
    const cleanId = (productId || "").trim().toLowerCase();
    const current = await this.getStock(cleanId);
    if (current < quantity) {
      return {
        success: false,
        remainingStock: current,
        error: `Stok produk tidak mencukupi. Tersedia: ${current} unit, diminta: ${quantity} unit.`,
      };
    }
    const remaining = current - quantity;
    globalProductStockCache.set(cleanId, remaining);

    try {
      await supabase.from("Product").update({ stock: remaining }).eq("id", cleanId);
    } catch {}

    return { success: true, remainingStock: remaining };
  },

  async restoreStock(productId: string, quantity: number): Promise<{ success: boolean; remainingStock: number }> {
    const cleanId = (productId || "").trim().toLowerCase();
    const current = await this.getStock(cleanId);
    const newStock = current + quantity;
    globalProductStockCache.set(cleanId, newStock);

    try {
      await supabase.from("Product").update({ stock: newStock }).eq("id", cleanId);
    } catch {}

    return { success: true, remainingStock: newStock };
  },

  async updateStock(productId: string, newStock: number): Promise<boolean> {
    const cleanId = (productId || "").trim().toLowerCase();
    const stockVal = Math.max(0, newStock);
    globalProductStockCache.set(cleanId, stockVal);

    try {
      await supabase.from("Product").update({ stock: stockVal }).eq("id", cleanId);
    } catch {}

    return true;
  },
};

// Global in-memory stock tracking across runtime sessions
export const globalProductStockCache: Map<string, number> = new Map();

// -------------------------------------------------------------
// ORDER & ESCROW REPOSITORY (SUPABASE + IN-MEMORY PERSISTENCE)
// -------------------------------------------------------------
export interface DbOrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  brand: string;
  category?: string;
  price: number;
  quantity: number;
  selectedVariant?: string;
  image?: string;
  itemTotal: number;
}

export type TrackingStatusCode =
  | "ORDER_CREATED"
  | "PAYMENT_CONFIRMED"
  | "PACKED"
  | "PICKED_UP"
  | "SORTING_HUB_ORIGIN"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

export interface DbTrackingCheckpoint {
  id: string;
  orderId: string;
  status: TrackingStatusCode;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  timeFormatted: string;
  isCompleted: boolean;
}

export interface DbOrder {
  id: string;
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
  items: DbOrderItem[];
  itemsSubtotal: number;
  shippingFee: number;
  insuranceFee: number;
  totalAmount: number;
  platformFee?: number;
  platformCommissionRate?: number;
  platformCommissionFee?: number;
  netSellerPayout?: number;
  cancelReason?: string;
  cancelledBy?: "BUYER" | "SELLER";
  cancelledAt?: string;
  courierCode: string;
  serviceTier: string;
  waybillNumber?: string;
  paymentMethod: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "EXPIRED";
  escrowStatus: "PAYMENT_PENDING" | "HELD_IN_ESCROW" | "IN_TRANSIT" | "DELIVERED" | "FUNDS_RELEASED_TO_SELLER" | "DISPUTED" | "REFUNDED";
  disputeReason?: string;
  returnId?: string;
  returnStatus?: ReturnStatusCode;
  hasReviewed?: boolean;
  trackingHistory?: DbTrackingCheckpoint[];
  estimatedDeliveryDays?: number;
  isInsured?: boolean;
  deliveredAt?: string;
  inspectionExpiresAt?: string;
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
  | "REJECTED";

export interface DbReturnRequest {
  id: string;
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
  evidenceImages: string[];
  unboxingVideoUrl?: string;
  unboxingVideoType?: "upload" | "link";
  requestedSolution?: "REFUND" | "REPLACEMENT";
  resolutionType?: "REFUND" | "REPLACEMENT";
  replacementWaybillNumber?: string;
  replacementCourier?: string;
  shippingFeeBearer?: "SELLER" | "BUYER";
  returnShippingCost?: number;
  qcStage?: "STAGE_1_INITIAL_REVIEW" | "STAGE_2_ACOUSTIC_PHYSICAL_QC" | "COMPLETED";
  qcStatus?: "PENDING" | "PASSED" | "FAILED";
  qcNotes?: string;
  qcAcousticReport?: {
    channelBalancePassed: boolean;
    frequencyResponsePassed: boolean;
    shellIntegrityPassed: boolean;
    inspectorName?: string;
    inspectedAt?: string;
  };
  status: ReturnStatusCode;
  storeReturnAddress?: string;
  returnWaybillNumber?: string;
  returnCourier?: string;
  sellerRejectReason?: string;
  refundAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbNotification {
  id: string;
  recipientEmail: string;
  recipientRole?: "buyer" | "seller" | "admin";
  storeId?: string;
  type: "order" | "chat" | "system" | "promo";
  title: string;
  message: string;
  unread: boolean;
  actionLink: string;
  meta?: {
    orderId?: string;
    productName?: string;
    storeName?: string;
    image?: string;
  };
  createdAt: string;
}

declare global {
  var __tonalzone_orders_cache: Map<string, DbOrder> | undefined;
  var __tonalzone_orders_meta: Record<string, any> | undefined;
}

// Live shared cache across all Next.js API route handler bundles
const globalOrdersCache: Map<string, DbOrder> =
  globalThis.__tonalzone_orders_cache ||
  (globalThis.__tonalzone_orders_cache = new Map());

function getNodeFs() {
  if (typeof window !== "undefined") return null;
  try {
    const nodeReq = eval("require");
    return {
      fs: nodeReq("fs"),
      path: nodeReq("path"),
    };
  } catch {
    return null;
  }
}

function loadPersistentOrdersMeta(): Record<string, any> {
  if (globalThis.__tonalzone_orders_meta) {
    return globalThis.__tonalzone_orders_meta;
  }
  const node = getNodeFs();
  if (!node) {
    globalThis.__tonalzone_orders_meta = globalThis.__tonalzone_orders_meta || {};
    return globalThis.__tonalzone_orders_meta;
  }
  try {
    const metaFile = node.path.join(process.cwd(), "data", "orders_metadata.json");
    if (node.fs.existsSync(metaFile)) {
      const content = node.fs.readFileSync(metaFile, "utf-8");
      const parsed = JSON.parse(content);
      globalThis.__tonalzone_orders_meta = parsed;
      return parsed;
    }
  } catch (e) {
    console.warn("[Orders Persistent Storage] Failed to read orders_metadata.json:", e);
  }
  globalThis.__tonalzone_orders_meta = {};
  return globalThis.__tonalzone_orders_meta;
}

function savePersistentOrdersMeta(meta: Record<string, any>) {
  globalThis.__tonalzone_orders_meta = meta;
  const node = getNodeFs();
  if (!node) return;
  try {
    const metaFile = node.path.join(process.cwd(), "data", "orders_metadata.json");
    const dir = node.path.dirname(metaFile);
    if (!node.fs.existsSync(dir)) {
      node.fs.mkdirSync(dir, { recursive: true });
    }
    node.fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2), "utf-8");
  } catch (e) {
    console.warn("[Orders Persistent Storage] Failed to write orders_metadata.json:", e);
  }
}

function formatCheckpointTime(date: Date = new Date()): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}.${minutes}`;
}

export const orderRepo = {
  async getAll(): Promise<DbOrder[]> {
    const metaStore = loadPersistentOrdersMeta();
    try {
      const { data: dbOrders, error } = await supabase
        .from("Order")
        .select("*, user:User(*), items:OrderItem(*, product:Product(*, store:Store(*)))")
        .order("createdAt", { ascending: false });

      if (!error && Array.isArray(dbOrders)) {
        for (const dbOrder of dbOrders) {
          const cached = globalOrdersCache.get(dbOrder.id);
          const meta = metaStore[dbOrder.id] || {};
          const firstItem = dbOrder.items?.[0];
          const resolvedStoreId =
            meta.storeId ||
            cached?.storeId ||
            firstItem?.product?.storeId ||
            (firstItem?.product?.name?.toUpperCase().includes("MOONDROP")
              ? "store-moondrop-official"
              : "store-moondrop-official");
          const resolvedStoreName =
            meta.storeName ||
            cached?.storeName ||
            firstItem?.product?.store?.storeName ||
            (resolvedStoreId === "store-moondrop-official"
              ? "MOONDROP Official Flagship Store"
              : "TonalZone Partner Merchant");

          // Determine escrowStatus with Single Source of Truth
          const dbStatus = (dbOrder.status || "").toUpperCase();
          let resolvedEscrowStatus: DbOrder["escrowStatus"] = "HELD_IN_ESCROW";

          if (
            meta.escrowStatus === "FUNDS_RELEASED_TO_SELLER" ||
            cached?.escrowStatus === "FUNDS_RELEASED_TO_SELLER" ||
            (meta.hasReviewed && (meta.escrowStatus === "DELIVERED" || dbStatus === "DELIVERED"))
          ) {
            resolvedEscrowStatus = "FUNDS_RELEASED_TO_SELLER";
          } else if (dbStatus === "DELIVERED" || meta.escrowStatus === "DELIVERED" || cached?.escrowStatus === "DELIVERED") {
            resolvedEscrowStatus = "DELIVERED";
          } else if (dbStatus === "SHIPPED" || dbStatus === "IN_TRANSIT" || meta.escrowStatus === "IN_TRANSIT" || cached?.escrowStatus === "IN_TRANSIT") {
            resolvedEscrowStatus = "IN_TRANSIT";
          } else if (dbStatus === "PAID") {
            resolvedEscrowStatus = "HELD_IN_ESCROW";
          } else if (dbStatus === "PENDING") {
            resolvedEscrowStatus = "PAYMENT_PENDING";
          } else {
            resolvedEscrowStatus = meta.escrowStatus || cached?.escrowStatus || "HELD_IN_ESCROW";
          }

          // DUAL-ASSURANCE 3-SECOND AUTO TRANSITION:
          // If order is IN_TRANSIT and at least 3 seconds have passed since shippedAt, promote to DELIVERED!
          const shippedAt = meta.shippedAt || (cached as any)?.shippedAt;
          if (resolvedEscrowStatus === "IN_TRANSIT" && shippedAt && Date.now() - shippedAt >= 3000) {
            resolvedEscrowStatus = "DELIVERED";
            meta.escrowStatus = "DELIVERED";
            meta.deliveredAt = meta.deliveredAt || new Date().toISOString();
            meta.inspectionExpiresAt = meta.inspectionExpiresAt || new Date(Date.now() + 48 * 3600 * 1000).toISOString();
            metaStore[dbOrder.id] = meta;
            savePersistentOrdersMeta(metaStore);

            // Persist to Supabase
            try {
              await supabase
                .from("Order")
                .update({ status: "DELIVERED", updatedAt: new Date().toISOString() })
                .eq("id", dbOrder.id);
            } catch (err: any) {
              console.error("[Auto-Deliver 3s] Supabase update error:", err);
            }
          }

          const waybill = meta.waybillNumber || cached?.waybillNumber;

          const mappedOrder: DbOrder = {
            id: dbOrder.id,
            parentOrderId: meta.parentOrderId || cached?.parentOrderId || dbOrder.id,
            buyerId: dbOrder.userId || cached?.buyerId || "usr-buyer",
            buyerName: meta.buyerName || cached?.buyerName || dbOrder.user?.name || "Pembeli Terverifikasi",
            buyerEmail: meta.buyerEmail || cached?.buyerEmail || dbOrder.user?.email || "valen@tonalzone.com",
            buyerPhone: meta.buyerPhone || cached?.buyerPhone || "08123456789",
            destinationAddress: meta.destinationAddress || cached?.destinationAddress || dbOrder.user?.location || "Alamat Pembeli",
            destinationCity: meta.destinationCity || cached?.destinationCity || "Jakarta Selatan",
            destinationPostalCode: meta.destinationPostalCode || cached?.destinationPostalCode || "12190",
            storeId: resolvedStoreId,
            storeName: resolvedStoreName,
            items: (dbOrder.items && dbOrder.items.length > 0)
              ? dbOrder.items.map((it: any) => ({
                  id: it.id,
                  orderId: dbOrder.id,
                  productId: it.productId,
                  productName: it.product?.name || meta.items?.find((ci: any) => ci.productId === it.productId)?.productName || cached?.items?.find((ci: any) => ci.productId === it.productId)?.productName || "Audiophile Product",
                  brand: it.product?.name?.toUpperCase().includes("MOONDROP") ? "MOONDROP" : "Audiophile",
                  category: it.product?.categoryId || "IN-EAR MONITORS",
                  price: Number(it.price) || 0,
                  quantity: Number(it.quantity) || 1,
                  selectedVariant: meta.items?.find((ci: any) => ci.productId === it.productId)?.selectedVariant || cached?.items?.find((ci: any) => ci.productId === it.productId)?.selectedVariant || "Standard",
                  image: it.product?.images?.[0] || meta.items?.find((ci: any) => ci.productId === it.productId)?.image || cached?.items?.find((ci: any) => ci.productId === it.productId)?.image || "/hero-blessing-3.jpg",
                  itemTotal: (Number(it.price) || 0) * (Number(it.quantity) || 1),
                }))
              : (meta.items || cached?.items || []),
            itemsSubtotal: Number(dbOrder.totalAmount) || meta.itemsSubtotal || cached?.itemsSubtotal || 0,
            shippingFee: meta.shippingFee || cached?.shippingFee || 0,
            insuranceFee: meta.insuranceFee || cached?.insuranceFee || 0,
            isInsured: meta.isInsured ?? (cached?.isInsured || ((meta.insuranceFee || cached?.insuranceFee || 0) > 0)),
            deliveredAt: meta.deliveredAt || cached?.deliveredAt,
            inspectionExpiresAt: meta.inspectionExpiresAt || cached?.inspectionExpiresAt,
            autoSettled: Boolean(meta.autoSettled || cached?.autoSettled),
            totalAmount: (Number(dbOrder.totalAmount) > 0
              ? Number(dbOrder.totalAmount)
              : (meta.totalAmount > 0 ? meta.totalAmount : (meta.itemsSubtotal > 0 ? meta.itemsSubtotal : 0))),
            platformFee: meta.platformFee ?? cached?.platformFee ?? 0.1,
            platformCommissionRate: meta.platformCommissionRate ?? cached?.platformCommissionRate ?? 0.03,
            platformCommissionFee: (Number(dbOrder.totalAmount) > 0 || meta.totalAmount > 0 || meta.itemsSubtotal > 0)
              ? Math.round((Number(dbOrder.totalAmount) || meta.totalAmount || meta.itemsSubtotal || 0) * (meta.platformCommissionRate ?? 0.03) * 100) / 100
              : 0,
            netSellerPayout: (Number(dbOrder.totalAmount) > 0 || meta.totalAmount > 0 || meta.itemsSubtotal > 0)
              ? Math.round(((Number(dbOrder.totalAmount) || meta.totalAmount || meta.itemsSubtotal || 0) - (Math.round((Number(dbOrder.totalAmount) || meta.totalAmount || meta.itemsSubtotal || 0) * (meta.platformCommissionRate ?? 0.03) * 100) / 100)) * 100) / 100
              : 0,
            cancelReason: meta.cancelReason || cached?.cancelReason,
            cancelledBy: meta.cancelledBy || cached?.cancelledBy,
            cancelledAt: meta.cancelledAt || cached?.cancelledAt,
            courierCode: meta.courierCode || cached?.courierCode || "JNE Express",
            serviceTier: meta.serviceTier || cached?.serviceTier || "Regular",
            waybillNumber: waybill,
            paymentMethod: meta.paymentMethod || cached?.paymentMethod || "QRIS",
            paymentStatus: dbOrder.status === "PENDING" ? "PENDING" : (dbOrder.status === "CANCELLED" ? "FAILED" : "PAID"),
            escrowStatus: meta.cancelReason ? "REFUNDED" : resolvedEscrowStatus,
            trackingHistory: meta.trackingHistory || cached?.trackingHistory || [
              {
                id: `chk-${dbOrder.id}-created`,
                orderId: dbOrder.id,
                status: "ORDER_CREATED",
                title: "Pesanan Berhasil Dibuat",
                description: "Pesanan telah tersimpan di sistem TonalZone.",
                location: "Platform Escrow",
                timestamp: dbOrder.createdAt,
                timeFormatted: formatCheckpointTime(new Date(dbOrder.createdAt)),
                isCompleted: true,
              },
            ],
            estimatedDeliveryDays: meta.estimatedDeliveryDays || cached?.estimatedDeliveryDays || 3,
            hasReviewed: meta.hasReviewed ?? cached?.hasReviewed ?? false,
            returnId: meta.returnId || cached?.returnId,
            returnStatus: meta.returnStatus || cached?.returnStatus,
            createdAt: dbOrder.createdAt,
            updatedAt: dbOrder.updatedAt,
          };
          globalOrdersCache.set(dbOrder.id, mappedOrder);
        }
      }
    } catch (e) {
      console.error("[orderRepo.getAll] Error loading orders from Supabase:", e);
    }

    // Ingest persistent orders from metaStore that were not returned by Supabase or need field synchronization
    for (const [metaId, meta] of Object.entries(metaStore)) {
      if (!metaId) continue;
      if (globalOrdersCache.has(metaId)) {
        const existing = globalOrdersCache.get(metaId)!;
        if (meta.escrowStatus && meta.escrowStatus !== existing.escrowStatus) {
          existing.escrowStatus = meta.escrowStatus;
        }
        if (meta.hasReviewed !== undefined) {
          existing.hasReviewed = meta.hasReviewed;
        }
        if (meta.netSellerPayout !== undefined) {
          existing.netSellerPayout = meta.netSellerPayout;
        }
        if (meta.platformCommissionFee !== undefined) {
          existing.platformCommissionFee = meta.platformCommissionFee;
        }
        if (meta.deliveredAt) existing.deliveredAt = meta.deliveredAt;
        if (meta.inspectionExpiresAt) existing.inspectionExpiresAt = meta.inspectionExpiresAt;
        if (meta.trackingHistory && meta.trackingHistory.length > (existing.trackingHistory?.length || 0)) {
          existing.trackingHistory = meta.trackingHistory;
        }
        continue;
      }

      // If not present in globalOrdersCache, construct DbOrder from metaStore
      const resolvedStoreId = meta.storeId || "store-moondrop-official";
      const resolvedStoreName =
        meta.storeName ||
        (resolvedStoreId === "store-moondrop-official"
          ? "MOONDROP Official Flagship Store"
          : "TonalZone Partner Merchant");

      const orderAmount = Number(meta.totalAmount) || Number(meta.itemsSubtotal) || 0;
      const commFee =
        meta.platformCommissionFee ??
        (Math.round(orderAmount * (meta.platformCommissionRate ?? 0.03) * 100) / 100);
      const netPayout =
        meta.netSellerPayout ??
        (Math.round((orderAmount - commFee) * 100) / 100);

      const mappedOrder: DbOrder = {
        id: metaId,
        parentOrderId: meta.parentOrderId || metaId,
        buyerId: meta.buyerId || "usr-buyer",
        buyerName: meta.buyerName || "Valen Satya",
        buyerEmail: meta.buyerEmail || "valen@tonalzone.com",
        buyerPhone: meta.buyerPhone || "08123456789",
        destinationAddress: meta.destinationAddress || "Alamat Pembeli",
        destinationCity: meta.destinationCity || "Jakarta Selatan",
        destinationPostalCode: meta.destinationPostalCode || "12190",
        storeId: resolvedStoreId,
        storeName: resolvedStoreName,
        items: meta.items || [],
        itemsSubtotal: Number(meta.itemsSubtotal) || orderAmount,
        shippingFee: Number(meta.shippingFee) || 0,
        insuranceFee: Number(meta.insuranceFee) || 0,
        isInsured: Boolean(meta.isInsured),
        deliveredAt: meta.deliveredAt,
        inspectionExpiresAt: meta.inspectionExpiresAt,
        autoSettled: Boolean(meta.autoSettled),
        totalAmount: orderAmount,
        platformFee: meta.platformFee ?? 0.1,
        platformCommissionRate: meta.platformCommissionRate ?? 0.03,
        platformCommissionFee: commFee,
        netSellerPayout: netPayout,
        cancelReason: meta.cancelReason,
        cancelledBy: meta.cancelledBy,
        cancelledAt: meta.cancelledAt,
        courierCode: meta.courierCode || "JNE Express",
        serviceTier: meta.serviceTier || "Regular",
        waybillNumber: meta.waybillNumber,
        paymentMethod: meta.paymentMethod || "QRIS",
        paymentStatus: (meta.escrowStatus === "PAYMENT_PENDING" || !meta.escrowStatus) ? "PENDING" : "PAID",
        escrowStatus: meta.escrowStatus || "HELD_IN_ESCROW",
        trackingHistory: meta.trackingHistory || [],
        estimatedDeliveryDays: meta.estimatedDeliveryDays || 3,
        hasReviewed: Boolean(meta.hasReviewed),
        returnId: meta.returnId,
        returnStatus: meta.returnStatus,
        createdAt: meta.createdAt || new Date().toISOString(),
        updatedAt: meta.deliveredAt || meta.createdAt || new Date().toISOString(),
      };

      globalOrdersCache.set(metaId, mappedOrder);
    }

    // Automatically check and settle eligible 48h expired orders
    await this.checkAndProcessAutoSettlements();

    return Array.from(globalOrdersCache.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async findById(id: string): Promise<DbOrder | null> {
    const trimmedId = id.trim();
    if (globalOrdersCache.has(trimmedId)) {
      return globalOrdersCache.get(trimmedId)!;
    }
    await this.getAll();
    if (globalOrdersCache.has(trimmedId)) {
      return globalOrdersCache.get(trimmedId)!;
    }

    // Direct key match
    for (const [key, order] of globalOrdersCache.entries()) {
      if (key.toLowerCase() === trimmedId.toLowerCase()) return order;
    }

    // Match by parentOrderId: collect all sub-orders under this parent
    const matchingSubOrders: DbOrder[] = [];
    for (const order of globalOrdersCache.values()) {
      if (order.parentOrderId && order.parentOrderId.toLowerCase() === trimmedId.toLowerCase()) {
        matchingSubOrders.push(order);
      }
    }

    if (matchingSubOrders.length > 0) {
      if (matchingSubOrders.length === 1) {
        return matchingSubOrders[0];
      }
      // Merge multiple sub-orders into single consolidated order for unified payment view
      const allItems = matchingSubOrders.flatMap((sub) => sub.items || []);
      const totalAmount = matchingSubOrders.reduce((sum, sub) => sum + (Number(sub.totalAmount) || 0), 0);
      const itemsSubtotal = matchingSubOrders.reduce((sum, sub) => sum + (Number(sub.itemsSubtotal) || 0), 0);
      const shippingFee = matchingSubOrders.reduce((sum, sub) => sum + (Number(sub.shippingFee) || 0), 0);
      const insuranceFee = matchingSubOrders.reduce((sum, sub) => sum + (Number(sub.insuranceFee) || 0), 0);
      return {
        ...matchingSubOrders[0],
        id: trimmedId,
        parentOrderId: trimmedId,
        items: allItems,
        totalAmount,
        itemsSubtotal,
        shippingFee,
        insuranceFee,
      };
    }

    // Check persistent metadata store directly
    const metaStore = loadPersistentOrdersMeta();
    if (metaStore[trimmedId]) {
      return metaStore[trimmedId];
    }
    const metaSubOrders = Object.values(metaStore).filter(
      (m: any) => m.parentOrderId && m.parentOrderId.toLowerCase() === trimmedId.toLowerCase()
    );
    if (metaSubOrders.length > 0) {
      const allItems = metaSubOrders.flatMap((sub: any) => sub.items || []);
      const totalAmount = metaSubOrders.reduce((sum: number, sub: any) => sum + (Number(sub.totalAmount) || 0), 0);
      return {
        ...(metaSubOrders[0] as any),
        id: trimmedId,
        parentOrderId: trimmedId,
        items: allItems,
        totalAmount,
      };
    }

    return null;
  },

  async findByBuyerEmail(email: string): Promise<DbOrder[]> {
    if (!email) return [];
    const cleanEmail = email.trim().toLowerCase();
    const all = await this.getAll();
    return all.filter((o) => {
      const bEmail = (o.buyerEmail || "").trim().toLowerCase();
      if (bEmail === cleanEmail) return true;
      if (
        (cleanEmail.includes("valen") || cleanEmail.includes("tonalzone")) &&
        (bEmail.includes("valen") || bEmail.includes("tonalzone"))
      ) {
        return true;
      }
      return false;
    });
  },

  /**
   * Scoped to storeId strictly with intelligent Moondrop Brand resolution
   */
  async findByStoreId(storeId: string): Promise<DbOrder[]> {
    const all = await this.getAll();
    const cleanStoreId = (storeId || "").trim().toLowerCase();
    return all.filter((o) => {
      const orderStore = (o.storeId || "").trim().toLowerCase();
      if (!cleanStoreId) return true;
      if (orderStore === cleanStoreId) return true;
      if (cleanStoreId === "store-moondrop-official") {
        const hasMoondropItem = o.items?.some((it) =>
          (it.brand || "").toUpperCase().includes("MOONDROP") ||
          (it.productName || "").toUpperCase().includes("MOONDROP") ||
          (it.productId || "").includes("blessing3") ||
          (it.productId || "").includes("chu") ||
          (it.productId || "").includes("dusk") ||
          (it.productId || "").includes("variations") ||
          (it.productId || "").includes("kato") ||
          (it.productId || "").includes("sparxie") ||
          (it.productId || "").includes("dawn")
        );
        return orderStore === "store-moondrop-official" || hasMoondropItem;
      }
      return false;
    });
  },

  async create(order: Omit<DbOrder, "createdAt" | "updatedAt">): Promise<DbOrder> {
    const now = new Date();
    const nowIso = now.toISOString();
    const orderId = order.id || `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const initialCheckpoints: DbTrackingCheckpoint[] = order.trackingHistory || [
      {
        id: `chk-${Date.now()}-1`,
        orderId: orderId,
        status: "ORDER_CREATED",
        title: "Pesanan Berhasil Dibuat",
        description: "Pesanan telah dibuat dan menunggu pembayaran dari pembeli.",
        location: "Platform Escrow",
        timestamp: nowIso,
        timeFormatted: formatCheckpointTime(now),
        isCompleted: true,
      },
    ];

    const platformCommissionRate = order.platformCommissionRate ?? 0.03; // 3.0% platform commission fee
    const platformCommissionFee =
      order.platformCommissionFee ??
      (Math.round((order.itemsSubtotal || order.totalAmount || 0) * platformCommissionRate * 100) / 100);
    const netSellerPayout =
      order.netSellerPayout ??
      (Math.round(((order.totalAmount || 0) - platformCommissionFee) * 100) / 100);

    const newOrder: DbOrder = {
      ...order,
      id: orderId,
      platformFee: order.platformFee ?? 0.1,
      platformCommissionRate,
      platformCommissionFee,
      netSellerPayout,
      trackingHistory: initialCheckpoints,
      estimatedDeliveryDays: order.estimatedDeliveryDays || 3,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    globalOrdersCache.set(newOrder.id, newOrder);

    // Save to metadata persistent store as well
    const metaStore = loadPersistentOrdersMeta();
    metaStore[newOrder.id] = {
      ...(metaStore[newOrder.id] || {}),
      id: newOrder.id,
      parentOrderId: newOrder.parentOrderId,
      buyerId: newOrder.buyerId,
      buyerName: newOrder.buyerName,
      buyerEmail: newOrder.buyerEmail,
      buyerPhone: newOrder.buyerPhone,
      destinationAddress: newOrder.destinationAddress,
      destinationCity: newOrder.destinationCity,
      destinationPostalCode: newOrder.destinationPostalCode,
      storeId: newOrder.storeId,
      storeName: newOrder.storeName,
      items: newOrder.items,
      itemsSubtotal: newOrder.itemsSubtotal,
      shippingFee: newOrder.shippingFee,
      insuranceFee: newOrder.insuranceFee,
      platformFee: newOrder.platformFee,
      platformCommissionRate,
      platformCommissionFee,
      netSellerPayout,
      totalAmount: newOrder.totalAmount,
      courierCode: newOrder.courierCode,
      serviceTier: newOrder.serviceTier,
      waybillNumber: newOrder.waybillNumber,
      paymentMethod: newOrder.paymentMethod,
      escrowStatus: newOrder.escrowStatus,
      trackingHistory: newOrder.trackingHistory,
      estimatedDeliveryDays: newOrder.estimatedDeliveryDays,
      createdAt: nowIso,
    };
    savePersistentOrdersMeta(metaStore);

    // Persist strictly to genuine Supabase 'Order' and 'OrderItem' tables
    try {
      let resolvedUserId = newOrder.buyerId;
      if (newOrder.buyerEmail) {
        const dbUser = await userRepo.findByEmail(newOrder.buyerEmail);
        if (dbUser?.id) {
          resolvedUserId = dbUser.id;
        }
      }
      if (!resolvedUserId || resolvedUserId.startsWith("usr-")) {
        const dbUser = await userRepo.upsert({
          email: newOrder.buyerEmail || "valen@tonalzone.com",
          name: newOrder.buyerName || "Valen Satya",
        });
        resolvedUserId = dbUser.id;
      }

      await supabase.from("Order").upsert({
        id: newOrder.id,
        userId: resolvedUserId,
        totalAmount: Number(newOrder.totalAmount) || 0,
        status: newOrder.paymentStatus || "PENDING",
        createdAt: nowIso,
        updatedAt: nowIso,
      });

      if (newOrder.items && newOrder.items.length > 0) {
        for (const it of newOrder.items) {
          await supabase.from("OrderItem").upsert({
            id: it.id || `item-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            orderId: newOrder.id,
            productId: it.productId,
            quantity: Number(it.quantity) || 1,
            price: Number(it.price) || 0,
          });
        }
      }
    } catch (dbErr) {
      console.error("[orderRepo.create] Supabase insert error:", dbErr);
    }

    // Notify buyer
    notificationRepo.create({
      recipientEmail: newOrder.buyerEmail,
      recipientRole: "buyer",
      type: "order",
      title: "Pesanan Berhasil Dibuat",
      message: `Pesanan #${newOrder.id} berhasil dibuat dan menunggu pembayaran.`,
      actionLink: "/orders",
      unread: true,
      meta: {
        orderId: newOrder.id,
        productName: newOrder.items[0]?.productName,
        storeName: newOrder.storeName,
        image: newOrder.items[0]?.image,
      },
    }).catch(() => {});

    // Notify store seller
    if (newOrder.storeId) {
      notificationRepo.create({
        recipientEmail: "seller",
        recipientRole: "seller",
        storeId: newOrder.storeId,
        type: "order",
        title: "Pesanan Baru Masuk",
        message: `Ada pesanan baru #${newOrder.id} (${newOrder.items[0]?.productName || "Audiophile Gear"}) dari ${newOrder.buyerName}.`,
        actionLink: "/seller/orders",
        unread: true,
        meta: {
          orderId: newOrder.id,
          productName: newOrder.items[0]?.productName,
          storeName: newOrder.storeName,
          image: newOrder.items[0]?.image,
        },
      }).catch(() => {});
    }

    return newOrder;
  },

  async markAsPaid(id: string): Promise<DbOrder | null> {
    if (!id) return null;
    await this.getAll();
    const trimmedId = id.trim();
    const now = new Date();
    const nowIso = now.toISOString();
    let updatedOrder: DbOrder | null = null;

    for (const [key, order] of globalOrdersCache.entries()) {
      if (
        key.toLowerCase() === trimmedId.toLowerCase() ||
        (order.parentOrderId && order.parentOrderId.toLowerCase() === trimmedId.toLowerCase())
      ) {
        order.paymentStatus = "PAID";
        order.escrowStatus = "HELD_IN_ESCROW";
        order.hasReviewed = false;
        order.updatedAt = nowIso;

        const metaStore = loadPersistentOrdersMeta();
        metaStore[order.id] = {
          ...(metaStore[order.id] || {}),
          escrowStatus: "HELD_IN_ESCROW",
          trackingHistory: order.trackingHistory,
          storeId: order.storeId,
          storeName: order.storeName,
          buyerEmail: order.buyerEmail,
          buyerName: order.buyerName,
          hasReviewed: false,
        };
        savePersistentOrdersMeta(metaStore);

        // Persist status change to Supabase Order table (AWAITED!)
        try {
          await supabase
            .from("Order")
            .update({
              status: "PAID",
              updatedAt: nowIso,
            })
            .eq("id", order.id);
        } catch (err: any) {
          console.error("[orderRepo.markAsPaid] Supabase error:", err);
        }

        if (!order.trackingHistory) order.trackingHistory = [];
        if (!order.trackingHistory.some((c) => c.status === "PAYMENT_CONFIRMED")) {
          order.trackingHistory.push({
            id: `chk-${Date.now()}-2`,
            orderId: order.id,
            status: "PAYMENT_CONFIRMED",
            title: "Pembayaran Terverifikasi (Escrow Holding)",
            description: "Pembayaran telah diamankan di TonalZone Escrow. Menunggu konfirmasi pengiriman dari toko penjual.",
            location: "Escrow Holding Vault",
            timestamp: nowIso,
            timeFormatted: formatCheckpointTime(now),
            isCompleted: true,
          });
        }

        // Notify buyer
        notificationRepo.create({
          recipientEmail: order.buyerEmail,
          recipientRole: "buyer",
          type: "order",
          title: "Pembayaran Terverifikasi (Escrow Holding)",
          message: `Pembayaran untuk pesanan #${order.id} berhasil diamankan di TonalZone Escrow. Toko akan segera memproses barang.`,
          actionLink: "/orders",
          unread: true,
          meta: {
            orderId: order.id,
            productName: order.items[0]?.productName,
            storeName: order.storeName,
            image: order.items[0]?.image,
          },
        }).catch(() => {});

        // Notify store seller
        if (order.storeId) {
          notificationRepo.create({
            recipientEmail: "seller",
            recipientRole: "seller",
            storeId: order.storeId,
            type: "order",
            title: "Pesanan Siap Dikirim",
            message: `Pembeli telah membayar pesanan #${order.id}. Silakan segera kemas dan kirimkan barang.`,
            actionLink: "/seller/orders",
            unread: true,
            meta: {
              orderId: order.id,
              productName: order.items[0]?.productName,
              storeName: order.storeName,
              image: order.items[0]?.image,
            },
          }).catch(() => {});
        }

        globalOrdersCache.set(order.id, order);
        if (!updatedOrder) updatedOrder = order;
      }
    }

    return updatedOrder || (await this.findById(trimmedId));
  },

  async updateShipment(id: string, waybillNumber: string, courierCode?: string): Promise<DbOrder | null> {
    await this.getAll();
    const order = await this.findById(id);
    if (!order) return null;

    const now = new Date();
    const nowIso = now.toISOString();
    const packedTime = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const cleanWaybill = waybillNumber.trim().toUpperCase();
    order.waybillNumber = cleanWaybill;
    if (courierCode) order.courierCode = courierCode;
    order.escrowStatus = "IN_TRANSIT";
    order.updatedAt = nowIso;
    (order as any).shippedAt = now.getTime();

    if (!order.trackingHistory) order.trackingHistory = [];

    // 1. Checkpoint PACKED
    if (!order.trackingHistory.some((c) => c.status === "PACKED")) {
      order.trackingHistory.push({
        id: `chk-${Date.now()}-packed`,
        orderId: order.id,
        status: "PACKED",
        title: "Paket Sedang Di Kemas",
        description: "Penjual sedang menyiapkan dan mengemas barang sesuai standar audiophile.",
        location: order.storeName || "Toko Penjual",
        timestamp: packedTime.toISOString(),
        timeFormatted: formatCheckpointTime(packedTime),
        isCompleted: true,
      });
    }

    // 2. Checkpoint PICKED_UP
    if (!order.trackingHistory.some((c) => c.status === "PICKED_UP")) {
      order.trackingHistory.push({
        id: `chk-${Date.now()}-pickup`,
        orderId: order.id,
        status: "PICKED_UP",
        title: "Paket Telah Di jemput",
        description: `Kurir ${order.courierCode || "JNE Express"} telah mengambil paket dan dalam proses pengiriman ke kota tujuan.`,
        location: "Drop Point Hub Origin",
        timestamp: nowIso,
        timeFormatted: formatCheckpointTime(now),
        isCompleted: true,
      });
    }

    // Notify buyer of shipment
    notificationRepo.create({
      recipientEmail: order.buyerEmail,
      recipientRole: "buyer",
      type: "order",
      title: "Pesanan Sedang Dikirim",
      message: `Toko ${order.storeName} telah mengirim pesanan #${order.id} dengan nomor resi ${order.waybillNumber} via ${order.courierCode || "JNE Express"}.`,
      actionLink: "/orders",
      unread: true,
      meta: {
        orderId: order.id,
        productName: order.items[0]?.productName,
        storeName: order.storeName,
        image: order.items[0]?.image,
      },
    }).catch(() => {});

    order.hasReviewed = false;
    globalOrdersCache.set(order.id, order);

    const metaStore = loadPersistentOrdersMeta();
    metaStore[order.id] = {
      ...(metaStore[order.id] || {}),
      waybillNumber: cleanWaybill,
      courierCode: order.courierCode,
      escrowStatus: "IN_TRANSIT",
      trackingHistory: order.trackingHistory,
      shippedAt: now.getTime(),
      storeId: order.storeId,
      storeName: order.storeName,
      buyerEmail: order.buyerEmail,
      buyerName: order.buyerName,
      hasReviewed: false,
    };
    savePersistentOrdersMeta(metaStore);

    // Persist status change to Supabase Order table (AWAITED!)
    try {
      await supabase
        .from("Order")
        .update({ status: "SHIPPED", updatedAt: nowIso })
        .eq("id", order.id);
    } catch (err: any) {
      console.error("[orderRepo.updateShipment] Supabase error:", err);
    }

    // Automatically trigger advanceTracking to DELIVERED after 3 seconds!
    setTimeout(async () => {
      try {
        await orderRepo.advanceTracking(order.id, "DELIVERED");
      } catch (err) {
        console.error("[updateShipment 3s auto-deliver] Error:", err);
      }
    }, 3000);

    return order;
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
      estimatedDeliveryDays: order.estimatedDeliveryDays || 3,
      checkpoints: order.trackingHistory || [],
      currentCheckpoint:
        order.trackingHistory && order.trackingHistory.length > 0
          ? order.trackingHistory[order.trackingHistory.length - 1]
          : null,
    };
  },

  async advanceTracking(orderId: string, customStatus?: TrackingStatusCode): Promise<DbOrder | null> {
    const order = await this.findById(orderId);
    if (!order) return null;

    if (!order.trackingHistory) order.trackingHistory = [];
    const existingStatuses = new Set(order.trackingHistory.map((c) => c.status));
    const now = new Date();
    const nowIso = now.toISOString();

    let nextStatus: TrackingStatusCode = customStatus || "SORTING_HUB_ORIGIN";
    if (!customStatus) {
      if (!existingStatuses.has("PACKED")) nextStatus = "PACKED";
      else if (!existingStatuses.has("PICKED_UP")) nextStatus = "PICKED_UP";
      else if (!existingStatuses.has("SORTING_HUB_ORIGIN")) nextStatus = "SORTING_HUB_ORIGIN";
      else if (!existingStatuses.has("IN_TRANSIT")) nextStatus = "IN_TRANSIT";
      else if (!existingStatuses.has("OUT_FOR_DELIVERY")) nextStatus = "OUT_FOR_DELIVERY";
      else if (!existingStatuses.has("DELIVERED")) nextStatus = "DELIVERED";
      else return order; // already delivered
    }

    const titleMap: Record<TrackingStatusCode, { title: string; desc: string; loc: string }> = {
      ORDER_CREATED: {
        title: "Pesanan Berhasil Dibuat",
        desc: "Pesanan telah dibuat dan menunggu pembayaran dari pembeli.",
        loc: "Platform Escrow",
      },
      PAYMENT_CONFIRMED: {
        title: "Pembayaran Terverifikasi (Escrow Holding)",
        desc: "Pembayaran telah diamankan di TonalZone Escrow. Menunggu konfirmasi toko.",
        loc: "Escrow Holding Vault",
      },
      PACKED: {
        title: "Paket Sedang Di Kemas",
        desc: "Penjual sedang menyiapkan dan mengemas barang sesuai standar audiophile.",
        loc: order.storeName || "Toko Penjual",
      },
      PICKED_UP: {
        title: "Paket Telah Di jemput",
        desc: `Kurir ${order.courierCode || "JNE Express"} telah mengambil paket dari toko.`,
        loc: "Drop Point Hub Origin",
      },
      SORTING_HUB_ORIGIN: {
        title: "Tiba di Fasilitas Sortir Logistik",
        desc: "Paket telah tiba di fasilitas sortir logistik kota asal dan dipersiapkan untuk pemberangkatan.",
        loc: "Central Sorting Facility",
      },
      IN_TRANSIT: {
        title: "Dalam Perjalanan Menuju Kota Tujuan",
        desc: `Paket sedang diberangkatkan via jalur logistik express menuju ${order.destinationCity}.`,
        loc: "Linehaul Transport",
      },
      OUT_FOR_DELIVERY: {
        title: "Paket Dibawa Kurir Menuju Alamat Tujuan",
        desc: "Kurir pengantaran sedang dalam perjalanan menuju alamat penerima.",
        loc: `${order.destinationCity} Delivery Hub`,
      },
      DELIVERED: {
        title: "Paket Berhasil Diterima",
        desc: `Paket telah berhasil diterima oleh ${order.buyerName} di alamat tujuan.`,
        loc: order.destinationAddress,
      },
    };

    const details = titleMap[nextStatus];
    order.trackingHistory.push({
      id: `chk-${Date.now()}-${nextStatus.toLowerCase()}`,
      orderId: order.id,
      status: nextStatus,
      title: details.title,
      description: details.desc,
      location: details.loc,
      timestamp: nowIso,
      timeFormatted: formatCheckpointTime(now),
      isCompleted: true,
    });

    if (nextStatus === "DELIVERED") {
      order.escrowStatus = "DELIVERED";
      order.deliveredAt = order.deliveredAt || nowIso;
      order.inspectionExpiresAt = order.inspectionExpiresAt || new Date(now.getTime() + 48 * 3600 * 1000).toISOString();

      // Persist status change to Supabase Order table (AWAITED!)
      try {
        await supabase
          .from("Order")
          .update({ status: "DELIVERED", updatedAt: nowIso })
          .eq("id", order.id);
      } catch (err: any) {
        console.error("[advanceTracking DELIVERED] Supabase error:", err);
      }

      // Notify buyer that package arrived
      notificationRepo.create({
        recipientEmail: order.buyerEmail,
        recipientRole: "buyer",
        type: "order",
        title: "Paket Telah Tiba di Tujuan!",
        message: `Pesanan #${order.id} telah tiba di alamat pengiriman. Silakan konfirmasi penerimaan dalam 48 jam atau sistem otomatis menyelesaikan pesanan.`,
        actionLink: "/orders",
        unread: true,
        meta: {
          orderId: order.id,
          productName: order.items[0]?.productName,
          storeName: order.storeName,
          image: order.items[0]?.image,
        },
      }).catch(() => {});
    } else if (
      order.escrowStatus === "HELD_IN_ESCROW" &&
      (nextStatus === "PACKED" || nextStatus === "PICKED_UP" || nextStatus === "SORTING_HUB_ORIGIN" || nextStatus === "IN_TRANSIT")
    ) {
      order.escrowStatus = "IN_TRANSIT";
    }

    order.updatedAt = nowIso;
    globalOrdersCache.set(order.id, order);

    const metaStore = loadPersistentOrdersMeta();
    metaStore[order.id] = {
      ...(metaStore[order.id] || {}),
      escrowStatus: order.escrowStatus,
      trackingHistory: order.trackingHistory,
      waybillNumber: order.waybillNumber,
      courierCode: order.courierCode,
      deliveredAt: order.deliveredAt,
      inspectionExpiresAt: order.inspectionExpiresAt,
    };
    savePersistentOrdersMeta(metaStore);

    return order;
  },

  async confirmDeliveryAndReleaseFunds(id: string): Promise<DbOrder | null> {
    const order = await this.findById(id);
    if (!order) return null;

    const now = new Date();
    const nowIso = now.toISOString();

    if (!order.trackingHistory) order.trackingHistory = [];
    if (!order.trackingHistory.some((c) => c.status === "DELIVERED")) {
      order.trackingHistory.push({
        id: `chk-${Date.now()}-delivered`,
        orderId: order.id,
        status: "DELIVERED",
        title: "Paket Berhasil Diterima",
        description: `Paket telah berhasil diterima oleh ${order.buyerName} dan dana diteruskan ke penjual.`,
        location: order.destinationAddress,
        timestamp: nowIso,
        timeFormatted: formatCheckpointTime(now),
        isCompleted: true,
      });
    }

    order.escrowStatus = "FUNDS_RELEASED_TO_SELLER";
    order.updatedAt = nowIso;
    globalOrdersCache.set(order.id, order);

    const metaStore = loadPersistentOrdersMeta();
    metaStore[order.id] = {
      ...(metaStore[order.id] || {}),
      escrowStatus: "FUNDS_RELEASED_TO_SELLER",
      trackingHistory: order.trackingHistory,
      waybillNumber: order.waybillNumber,
      hasReviewed: true,
    };
    savePersistentOrdersMeta(metaStore);

    // Persist to Supabase (AWAITED!)
    try {
      await supabase
        .from("Order")
        .update({ status: "DELIVERED", updatedAt: nowIso })
        .eq("id", order.id);
    } catch (err: any) {
      console.error("[orderRepo.confirmDeliveryAndReleaseFunds] Supabase error:", err);
    }

    // Notify seller that escrow funds are released
    if (order.storeId) {
      notificationRepo.create({
        recipientEmail: "seller",
        recipientRole: "seller",
        storeId: order.storeId,
        type: "order",
        title: "Dana Escrow Berhasil Dicairkan!",
        message: `Pembeli telah mengonfirmasi penerimaan pesanan #${order.id}. Dana sebesar $${order.totalAmount} telah dicairkan ke saldo toko Anda.`,
        actionLink: "/seller/payouts",
        unread: true,
        meta: {
          orderId: order.id,
          productName: order.items[0]?.productName,
          storeName: order.storeName,
          image: order.items[0]?.image,
        },
      }).catch(() => {});
    }

    return order;
  },

  /**
   * Scans and automatically settles any orders delivered > 48 hours ago
   */
  async checkAndProcessAutoSettlements(): Promise<number> {
    const metaStore = loadPersistentOrdersMeta();
    const now = Date.now();
    let count = 0;

    for (const [orderId, meta] of Object.entries(metaStore)) {
      if (
        meta.escrowStatus === "DELIVERED" &&
        !meta.returnId &&
        meta.inspectionExpiresAt &&
        now >= new Date(meta.inspectionExpiresAt).getTime()
      ) {
        try {
          const updated = await this.confirmDeliveryAndReleaseFunds(orderId);
          if (updated) {
            meta.autoSettled = true;
            meta.escrowStatus = "FUNDS_RELEASED_TO_SELLER";
            metaStore[orderId] = meta;
            count++;
          }
        } catch (e) {
          console.error(`[Auto-Settle Error for ${orderId}]:`, e);
        }
      }
    }

    if (count > 0) {
      savePersistentOrdersMeta(metaStore);
    }
    return count;
  },

  /**
   * Fast-forward simulation for PJBL demo: auto-settles an order immediately
   */
  async simulateAutoSettle(orderId: string): Promise<DbOrder | null> {
    const order = await this.findById(orderId);
    if (!order) return null;
    order.autoSettled = true;
    const res = await this.confirmDeliveryAndReleaseFunds(orderId);
    if (res) res.autoSettled = true;
    return res;
  },

  async disputeOrder(id: string, reason: string): Promise<DbOrder | null> {
    const order = await this.findById(id);
    if (!order) return null;

    order.escrowStatus = "DISPUTED";
    order.disputeReason = reason;
    order.updatedAt = new Date().toISOString();
    globalOrdersCache.set(order.id, order);

    const metaStore = loadPersistentOrdersMeta();
    metaStore[order.id] = {
      ...(metaStore[order.id] || {}),
      escrowStatus: "DISPUTED",
    };
    savePersistentOrdersMeta(metaStore);

    return order;
  },

  async cancelOrder(
    id: string,
    reason: string = "Dibatalkan oleh pembeli",
    cancelledBy: "BUYER" | "SELLER" = "BUYER"
  ): Promise<{ success: boolean; order?: DbOrder; error?: string }> {
    const order = await this.findById(id);
    if (!order) return { success: false, error: "Pesanan tidak ditemukan." };

    // Validation: cannot cancel if already in transit or delivered
    if (order.escrowStatus === "IN_TRANSIT" || order.escrowStatus === "DELIVERED") {
      return {
        success: false,
        error: "Pesanan sudah dalam pengiriman kurir. Pembatalan tidak dapat dilakukan langsung, silakan ajukan retur saat paket tiba.",
      };
    }
    if (order.escrowStatus === "FUNDS_RELEASED_TO_SELLER") {
      return {
        success: false,
        error: "Pesanan sudah selesai dan dana telah dicairkan ke penjual.",
      };
    }

    const now = new Date();
    const nowIso = now.toISOString();

    order.paymentStatus = "FAILED";
    order.escrowStatus = "REFUNDED";
    order.cancelReason = reason;
    order.cancelledBy = cancelledBy;
    order.cancelledAt = nowIso;
    order.updatedAt = nowIso;

    // Add cancellation checkpoint to trackingHistory
    const cancelCheckpoint: DbTrackingCheckpoint = {
      id: `chk-${order.id}-cancelled`,
      orderId: order.id,
      status: "ORDER_CREATED",
      title: cancelledBy === "BUYER" ? "Pesanan Dibatalkan Pembeli" : "Pesanan Dibatalkan Penjual",
      description: `Alasan: ${reason}. Dana escrow telah dikembalikan 100% ke rekening/saldo asal.`,
      location: "Platform Escrow",
      timestamp: nowIso,
      timeFormatted: formatCheckpointTime(now),
      isCompleted: true,
    };
    order.trackingHistory = [...(order.trackingHistory || []), cancelCheckpoint];

    globalOrdersCache.set(order.id, order);

    const metaStore = loadPersistentOrdersMeta();
    metaStore[order.id] = {
      ...(metaStore[order.id] || {}),
      escrowStatus: "REFUNDED",
      cancelReason: reason,
      cancelledBy: cancelledBy,
      cancelledAt: nowIso,
      trackingHistory: order.trackingHistory,
      updatedAt: nowIso,
    };
    savePersistentOrdersMeta(metaStore);

    // Auto-restock items
    if (order.items && Array.isArray(order.items)) {
      for (const it of order.items) {
        if (it.productId && it.quantity > 0) {
          await productRepo.restoreStock(it.productId, it.quantity);
        }
      }
    }

    // Persist to Supabase Order table
    try {
      await supabase
        .from("Order")
        .update({ status: "CANCELLED", updatedAt: nowIso })
        .eq("id", order.id);
    } catch (e) {
      console.warn("[cancelOrder] Supabase update warning:", e);
    }

    // Dispatch cancellation notification to buyer
    notificationRepo.create({
      recipientEmail: order.buyerEmail,
      recipientRole: "buyer",
      type: "order",
      title: "Pesanan Dibatalkan - Dana Dikembalikan",
      message: `Pesanan #${order.id} telah berhasil dibatalkan (${reason}). Dana escrow sebesar $${order.totalAmount} telah dikembalikan 100%.`,
      actionLink: "/orders",
      unread: true,
      meta: {
        orderId: order.id,
        productName: order.items[0]?.productName,
        storeName: order.storeName,
        image: order.items[0]?.image,
      },
    }).catch(() => {});

    // Dispatch cancellation notification to seller
    if (order.storeId) {
      notificationRepo.create({
        recipientEmail: "seller",
        recipientRole: "seller",
        storeId: order.storeId,
        type: "order",
        title: "Pesanan Dibatalkan",
        message: `Pesanan #${order.id} (${order.items[0]?.productName || "Audiophile Gear"}) dibatalkan (${cancelledBy === "BUYER" ? "oleh pembeli" : "oleh toko"}). Stok otomatis dipulihkan.`,
        actionLink: "/seller/orders",
        unread: true,
        meta: {
          orderId: order.id,
          productName: order.items[0]?.productName,
          storeName: order.storeName,
          image: order.items[0]?.image,
        },
      }).catch(() => {});
    }

    return { success: true, order };
  },

  async markAsReviewed(id: string): Promise<DbOrder | null> {
    const order = await this.findById(id);
    if (!order) return null;

    order.hasReviewed = true;
    const metaStore = loadPersistentOrdersMeta();
    metaStore[order.id] = {
      ...(metaStore[order.id] || {}),
      hasReviewed: true,
    };
    savePersistentOrdersMeta(metaStore);

    if (order.escrowStatus === "DELIVERED" || order.escrowStatus === "IN_TRANSIT") {
      await this.confirmDeliveryAndReleaseFunds(id);
    }
    order.updatedAt = new Date().toISOString();
    globalOrdersCache.set(order.id, order);
    return order;
  },
};

export interface DbWithdrawal {
  id: string;
  storeId: string;
  amountUSD: number;
  amountIDR: number;
  bankName: string;
  bankAccount: string;
  accountHolder?: string;
  status: "COMPLETED" | "PROCESSING" | "REJECTED";
  createdAt: string;
}

const globalWithdrawalsCache: Map<string, DbWithdrawal> = new Map([
  [
    "PO-4091",
    {
      id: "PO-4091",
      storeId: "store-moondrop-official",
      amountUSD: 2500,
      amountIDR: 2500 * 15500,
      bankName: "BCA",
      bankAccount: "0123456789",
      accountHolder: "Alexander Rivera",
      status: "COMPLETED",
      createdAt: "2026-08-12T14:15:00.000Z",
    },
  ],
  [
    "PO-4090",
    {
      id: "PO-4090",
      storeId: "store-moondrop-official",
      amountUSD: 1800,
      amountIDR: 1800 * 15500,
      bankName: "Bank Mandiri",
      bankAccount: "140001928371",
      accountHolder: "Alexander Rivera",
      status: "COMPLETED",
      createdAt: "2026-08-01T10:00:00.000Z",
    },
  ],
]);

export const payoutRepo = {
  async getWithdrawals(storeId: string): Promise<DbWithdrawal[]> {
    return Array.from(globalWithdrawalsCache.values())
      .filter((w) => w.storeId === storeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async recordWithdrawal(params: {
    storeId: string;
    amountUSD: number;
    amountIDR?: number;
    bankName: string;
    bankAccount: string;
    accountHolder?: string;
  }): Promise<DbWithdrawal> {
    const id = `PO-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const entry: DbWithdrawal = {
      id,
      storeId: params.storeId,
      amountUSD: params.amountUSD,
      amountIDR: params.amountIDR || Math.round(params.amountUSD * 15500),
      bankName: params.bankName,
      bankAccount: params.bankAccount,
      accountHolder: params.accountHolder || "Official Store Owner",
      status: "PROCESSING",
      createdAt: now,
    };
    globalWithdrawalsCache.set(id, entry);
    return entry;
  },
};

export interface DbReviewReply {
  id: string;
  authorName: string;
  authorRole?: "seller" | "buyer" | "admin";
  authorAvatar?: string;
  replyToUser?: string;
  comment: string;
  createdAt: string;
}

export interface DbReview {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string | null;
  variant?: string | null;
  rating: number; // 1 to 5
  title?: string | null;
  comment: string;
  photos?: string[];
  tags?: string[];
  buyerName: string;
  buyerAvatar?: string | null;
  isAnonymous: boolean;
  storeId?: string | null;
  storeName?: string | null;
  createdAt: string;
  replies?: DbReviewReply[];
}

// Seed data — inserted once into Supabase if table is empty
const initialSeedReviews: Omit<DbReview, "replies">[] = [
  {
    id: "rev-waner-01",
    orderId: "ORD-98210",
    productId: "prod-waner-sg2",
    productName: "Tangzu Wan'er S.G II",
    productImage: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    variant: "White / 3,5mm",
    rating: 5,
    title: "Vokal super manis & fitting sangat nyaman",
    comment: "Tuning vokalnya beneran manis banget di kuping! Treble-nya smooth tanpa harshness, fitting juga sangat nyaman buat sesi mendengarkan lama. Packaging rapi dan pengiriman super cepat.",
    photos: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600",
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600",
    ],
    tags: ["Audiophile Grade", "Clear Vocal"],
    buyerName: "Dimas Anggara",
    buyerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
    isAnonymous: false,
    storeId: "store-tangzu-official",
    storeName: "TANGZU OFFICIAL SHOP",
    createdAt: "2026-09-10T14:30:00.000Z",
  },
  {
    id: "rev-waner-02",
    orderId: "ORD-98244",
    productId: "prod-waner-sg2",
    productName: "Tangzu Wan'er S.G II",
    productImage: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    variant: "Black / 3,5mm",
    rating: 5,
    comment: "Karakter warm-neutral dengan bass yang punchy dan artikulasi instrumen yang detail. Worth every penny untuk IEM harga segini!",
    tags: ["Punchy Bass", "Great Soundstage"],
    buyerName: "Rizky Pratama",
    isAnonymous: false,
    storeId: "store-tangzu-official",
    storeName: "TANGZU OFFICIAL SHOP",
    createdAt: "2026-09-11T09:15:00.000Z",
  },
];

const initialSeedReplies: Omit<DbReviewReply & { reviewId: string }, never>[] = [
  {
    id: "rep-waner-01-1",
    reviewId: "rev-waner-01",
    authorName: "TANGZU OFFICIAL SHOP",
    authorRole: "seller",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
    replyToUser: "Dimas Anggara",
    comment: "Terima kasih banyak atas ulasan positif dan kepercayaannya kak Dimas! Senang sekali Wan'er S.G II cocok dengan tuning preferensi kakak. Selamat menikmati musik!",
    createdAt: "2026-09-10T16:00:00.000Z",
  },
];

// Auto-seed: insert seed data if Supabase table is empty (runs once)
async function seedReviewsIfEmpty() {
  try {
    const { count } = await supabase.from("Review").select("id", { count: "exact", head: true });
    if (count !== null && count > 0) return; // already has data

    // Insert seed reviews
    for (const rev of initialSeedReviews) {
      await supabase.from("Review").upsert({
        id: rev.id,
        orderId: rev.orderId,
        productId: rev.productId,
        productName: rev.productName,
        productImage: rev.productImage || null,
        variant: rev.variant || null,
        rating: rev.rating,
        title: rev.title || null,
        comment: rev.comment,
        photos: rev.photos || [],
        tags: rev.tags || [],
        buyerName: rev.buyerName,
        buyerAvatar: rev.buyerAvatar || null,
        isAnonymous: rev.isAnonymous,
        storeId: rev.storeId || null,
        storeName: rev.storeName || null,
        createdAt: rev.createdAt,
      });
    }

    // Insert seed replies
    for (const rep of initialSeedReplies) {
      await supabase.from("ReviewReply").upsert({
        id: rep.id,
        reviewId: rep.reviewId,
        authorName: rep.authorName,
        authorRole: rep.authorRole || "seller",
        authorAvatar: rep.authorAvatar || null,
        replyToUser: rep.replyToUser || null,
        comment: rep.comment,
        createdAt: rep.createdAt,
      });
    }

    console.log("[ReviewRepo] Seed data inserted into Supabase.");
  } catch (e) {
    console.error("[ReviewRepo] Seed error:", e);
  }
}

// Fire seed check once on module load (non-blocking)
seedReviewsIfEmpty();

// Helper: attach replies to a list of reviews
async function attachReplies(reviews: Omit<DbReview, "replies">[]): Promise<DbReview[]> {
  if (reviews.length === 0) return [];
  const ids = reviews.map((r) => r.id);
  const { data: replies } = await supabase
    .from("ReviewReply")
    .select("*")
    .in("reviewId", ids)
    .order("createdAt", { ascending: true });

  const replyMap = new Map<string, DbReviewReply[]>();
  (replies || []).forEach((rep: any) => {
    const arr = replyMap.get(rep.reviewId) || [];
    arr.push({
      id: rep.id,
      authorName: rep.authorName,
      authorRole: rep.authorRole,
      authorAvatar: rep.authorAvatar,
      replyToUser: rep.replyToUser,
      comment: rep.comment,
      createdAt: rep.createdAt,
    });
    replyMap.set(rep.reviewId, arr);
  });

  return reviews.map((r) => ({ ...r, replies: replyMap.get(r.id) || [] }));
}

export const reviewRepo = {
  async getAll(): Promise<DbReview[]> {
    const { data, error } = await supabase
      .from("Review")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("[ReviewRepo] getAll error:", error.message);
      return [];
    }
    return attachReplies(data || []);
  },

  async findByProductId(productId: string): Promise<DbReview[]> {
    const cleanId = productId.trim().toLowerCase();
    // Use ilike for flexible matching
    const { data, error } = await supabase
      .from("Review")
      .select("*")
      .or(`productId.ilike.%${cleanId}%`)
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("[ReviewRepo] findByProductId error:", error.message);
      return [];
    }
    return attachReplies(data || []);
  },

  async findByOrderId(orderId: string): Promise<DbReview[]> {
    const { data, error } = await supabase
      .from("Review")
      .select("*")
      .eq("orderId", orderId.trim())
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("[ReviewRepo] findByOrderId error:", error.message);
      return [];
    }
    return attachReplies(data || []);
  },

  async create(review: Omit<DbReview, "id" | "createdAt">): Promise<DbReview> {
    const id = `rev-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const now = new Date().toISOString();

    const payload = {
      id,
      orderId: review.orderId,
      productId: review.productId,
      productName: review.productName,
      productImage: review.productImage || null,
      variant: review.variant || null,
      rating: review.rating,
      title: review.title || null,
      comment: review.comment,
      photos: review.photos || [],
      tags: review.tags || [],
      buyerName: review.buyerName,
      buyerAvatar: review.buyerAvatar || null,
      isAnonymous: review.isAnonymous,
      storeId: review.storeId || null,
      storeName: review.storeName || null,
      createdAt: now,
    };

    const { data, error } = await supabase.from("Review").insert(payload).select().single();
    if (error) {
      console.error("[ReviewRepo] create error:", error.message);
      // Fallback: return constructed object
      return { ...payload, replies: [] };
    }
    return { ...data, replies: [] };
  },

  async addReply(
    reviewId: string,
    reply: Omit<DbReviewReply, "id" | "createdAt">
  ): Promise<DbReviewReply | null> {
    // Verify review exists
    const { data: rev } = await supabase.from("Review").select("id").eq("id", reviewId).maybeSingle();
    if (!rev) return null;

    const newReply = {
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      reviewId,
      authorName: reply.authorName,
      authorRole: reply.authorRole || "seller",
      authorAvatar: reply.authorAvatar || null,
      replyToUser: reply.replyToUser || null,
      comment: reply.comment,
      createdAt: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("ReviewReply").insert(newReply).select().single();
    if (error) {
      console.error("[ReviewRepo] addReply error:", error.message);
      return null;
    }
    return {
      id: data.id,
      authorName: data.authorName,
      authorRole: data.authorRole,
      authorAvatar: data.authorAvatar,
      replyToUser: data.replyToUser,
      comment: data.comment,
      createdAt: data.createdAt,
    };
  },
};

// -------------------------------------------------------------
// CHAT REPOSITORY (100% PURE DATABASE - ZERO DUMMY DATA)
// -------------------------------------------------------------

export interface DbChatConversation {
  id: string;
  buyerEmail: string;
  buyerName: string;
  storeId: string;
  storeName: string;
  storeType?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadBuyer: number;
  unreadSeller: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbChatMessage {
  id: string;
  conversationId: string;
  senderRole: "buyer" | "seller";
  senderName: string;
  senderEmail?: string;
  text: string;
  createdAt: string;
  productCard?: {
    id: string;
    name: string;
    brand: string;
    price: number;
    image: string;
    soundSignature?: string;
    category?: string;
  };
  orderCard?: {
    orderNumber: string;
    productName: string;
    brand?: string;
    price: number;
    status: string;
    waybillNumber?: string;
    courierCode?: string;
    image?: string;
  };
}

// In-memory persistent database cache (survives Next.js dev hot-reloads)
const globalForChat = globalThis as unknown as {
  tonalConversationsCache?: Map<string, DbChatConversation>;
  tonalChatMessagesCache?: Map<string, DbChatMessage[]>;
  tonalChatSettingsCache?: Map<string, DbStoreChatSettings>;
};

if (!globalForChat.tonalConversationsCache) {
  globalForChat.tonalConversationsCache = new Map();
}
if (!globalForChat.tonalChatMessagesCache) {
  globalForChat.tonalChatMessagesCache = new Map();
}
if (!globalForChat.tonalChatSettingsCache) {
  globalForChat.tonalChatSettingsCache = new Map();
}

const globalConversationsCache: Map<string, DbChatConversation> = globalForChat.tonalConversationsCache;
const globalChatMessagesCache: Map<string, DbChatMessage[]> = globalForChat.tonalChatMessagesCache;

export const chatRepo = {
  async getConversations(buyerEmail?: string, storeId?: string, storeName?: string): Promise<DbChatConversation[]> {
    const all = Array.from(globalConversationsCache.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    if (buyerEmail) {
      const cleanEmail = buyerEmail.trim().toLowerCase();
      return all.filter((c) => c.buyerEmail.toLowerCase() === cleanEmail);
    }
    if (storeId || storeName) {
      const cleanStoreId = storeId ? storeId.trim().toLowerCase() : "";
      const cleanStoreName = storeName ? storeName.trim().toLowerCase() : "";
      return all.filter((c) => {
        const matchId = cleanStoreId && (c.storeId.toLowerCase() === cleanStoreId || c.storeId.toLowerCase().includes(cleanStoreId));
        const matchName = cleanStoreName && (c.storeName.toLowerCase() === cleanStoreName || c.storeName.toLowerCase().includes(cleanStoreName));
        return matchId || matchName;
      });
    }
    return all;
  },

  async getConversationById(id: string): Promise<DbChatConversation | null> {
    const trimmed = id.trim();
    return globalConversationsCache.get(trimmed) || null;
  },

  async findOrCreateConversation(params: {
    buyerEmail: string;
    buyerName: string;
    storeId: string;
    storeName: string;
    storeType?: string;
  }): Promise<DbChatConversation> {
    const cleanEmail = params.buyerEmail.trim().toLowerCase();
    const cleanStoreId = params.storeId.trim().toLowerCase();
    const cleanStoreName = params.storeName.trim().toLowerCase();

    // Check existing conversation
    for (const conv of globalConversationsCache.values()) {
      if (
        conv.buyerEmail.toLowerCase() === cleanEmail &&
        (conv.storeId.toLowerCase() === cleanStoreId || conv.storeName.toLowerCase() === cleanStoreName)
      ) {
        return conv;
      }
    }

    // Create new conversation
    const id = `conv-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const now = new Date().toISOString();
    const newConv: DbChatConversation = {
      id,
      buyerEmail: params.buyerEmail.trim(),
      buyerName: params.buyerName.trim(),
      storeId: params.storeId.trim(),
      storeName: params.storeName.trim(),
      storeType:
        params.storeType ||
        (params.storeName.toLowerCase().includes("official") ? "Official Store" : "Authorized Dealer"),
      lastMessage: "",
      lastMessageAt: now,
      unreadBuyer: 0,
      unreadSeller: 0,
      createdAt: now,
      updatedAt: now,
    };

    globalConversationsCache.set(id, newConv);
    globalChatMessagesCache.set(id, []);
    return newConv;
  },

  async getMessages(conversationId: string): Promise<DbChatMessage[]> {
    const trimmed = conversationId.trim();
    const msgs = globalChatMessagesCache.get(trimmed) || [];
    return [...msgs].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  },

  async sendMessage(params: {
    conversationId: string;
    senderRole: "buyer" | "seller";
    senderName: string;
    senderEmail?: string;
    text: string;
    productCard?: any;
    orderCard?: any;
  }): Promise<DbChatMessage> {
    const conversation = await this.getConversationById(params.conversationId);
    const now = new Date().toISOString();
    const id = `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const newMsg: DbChatMessage = {
      id,
      conversationId: params.conversationId,
      senderRole: params.senderRole,
      senderName: params.senderName,
      senderEmail: params.senderEmail,
      text: params.text,
      createdAt: now,
      productCard: params.productCard,
      orderCard: params.orderCard,
    };

    const msgs = globalChatMessagesCache.get(params.conversationId) || [];
    msgs.push(newMsg);
    globalChatMessagesCache.set(params.conversationId, msgs);

    if (conversation) {
      conversation.lastMessage =
        params.text.trim() ||
        (params.productCard ? `Menanyakan: ${params.productCard.name}` : "") ||
        (params.orderCard ? `Pesanan #${params.orderCard.orderNumber}` : "Lampiran");
      conversation.lastMessageAt = now;
      conversation.updatedAt = now;
      if (params.senderRole === "buyer") {
        conversation.unreadSeller += 1;
      } else {
        conversation.unreadBuyer += 1;
      }
      globalConversationsCache.set(conversation.id, conversation);
    }

    return newMsg;
  },

  async markAsRead(conversationId: string, role: "buyer" | "seller"): Promise<void> {
    const conv = await this.getConversationById(conversationId);
    if (conv) {
      if (role === "buyer") {
        conv.unreadBuyer = 0;
      } else {
        conv.unreadSeller = 0;
      }
      globalConversationsCache.set(conv.id, conv);
    }
  },
};

// -------------------------------------------------------------
// SELLER CHAT SETTINGS & OPERATING HOURS (DATABASE CACHE)
// -------------------------------------------------------------
export interface DbChatTemplate {
  id: string;
  title: string;
  content: string;
  shortcut?: string;
  category?: string;
}

export interface DbOperatingHoursSchedule {
  day: string; // "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | "Sabtu" | "Minggu"
  isOpen: boolean;
  openTime: string; // "09:00"
  closeTime: string; // "18:00"
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

const DEFAULT_TEMPLATES: DbChatTemplate[] = [
  {
    id: "tpl-1",
    title: "Konfirmasi Stok & Ketersediaan",
    content: "Halo kak! Unit IEM ini ready stock 100% original BNIB bergaransi resmi distributor. Siap langsung kami proses dan kirim hari ini.",
    shortcut: "/ready",
    category: "Stok",
  },
  {
    id: "tpl-2",
    title: "Garansi & Keaslian Unit",
    content: "Tentu kak! Seluruh unit bergaransi distributor resmi 1 tahun. Serial number terdaftar resmi dan kami siap bantu klaim garansi jika ada kendala akustik atau channel imbalance.",
    shortcut: "/garansi",
    category: "Garansi",
  },
  {
    id: "tpl-3",
    title: "Jadwal & Batas Kirim",
    content: "Pesanan yang terverifikasi sebelum pukul 16:00 WIB langsung kami serahkan ke kurir di hari yang sama dengan perlindungan packing bubble wrap tebal.",
    shortcut: "/kirim",
    category: "Pengiriman",
  },
  {
    id: "tpl-4",
    title: "Karakter & Tuning Suara",
    content: "Karakter suara unit ini mengacu pada target neutral-balanced dengan vokal yang jernih, detail treble halus, serta respons bass yang padat dan terkontrol rapi.",
    shortcut: "/tuning",
    category: "Akustik",
  },
  {
    id: "tpl-5",
    title: "Kelengkapan Dalam Boks",
    content: "Paket penjualan lengkap meliputi 1 pasang housing IEM, kabel bawaan silver-plated, 3 pasang eartips silikon berbagai ukuran, pouch penyimpanan, dan buku panduan/garansi.",
    shortcut: "/kelengkapan",
    category: "Produk",
  },
];

const DEFAULT_SCHEDULE: DbOperatingHoursSchedule[] = [
  { day: "Senin", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "Selasa", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "Rabu", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "Kamis", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "Jumat", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "Sabtu", isOpen: true, openTime: "09:00", closeTime: "15:00" },
  { day: "Minggu", isOpen: false, openTime: "09:00", closeTime: "15:00" },
];

const globalChatSettingsCache: Map<string, DbStoreChatSettings> = globalForChat.tonalChatSettingsCache!;

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

  async updateSettings(
    storeId: string,
    updates: Partial<DbStoreChatSettings>
  ): Promise<DbStoreChatSettings> {
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

    // Get current Jakarta time (WIB, UTC+7)
    const now = new Date();
    const jakartaTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
    const jakartaDate = new Date(jakartaTimeStr);

    const dayIndex = jakartaDate.getDay(); // 0 = Sunday, 1 = Monday, ...
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

// Global in-memory cache for live persistent notifications (Zero dummy data)
const globalNotificationsCache: Map<string, DbNotification> = new Map();

export const notificationRepo = {
  async getAll(): Promise<DbNotification[]> {
    return Array.from(globalNotificationsCache.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async getByRecipient(email?: string, storeId?: string): Promise<DbNotification[]> {
    const all = await this.getAll();
    const cleanEmail = email?.trim().toLowerCase();
    const cleanStoreId = storeId?.trim();

    return all.filter((n) => {
      // Global broadcast
      if (n.recipientEmail === "all") return true;
      // Match by recipient email
      if (cleanEmail && n.recipientEmail.toLowerCase() === cleanEmail) return true;
      // Match by storeId
      if (cleanStoreId && n.storeId === cleanStoreId) return true;
      return false;
    });
  },

  async create(item: Omit<DbNotification, "id" | "createdAt">): Promise<DbNotification> {
    const now = new Date().toISOString();
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newNotification: DbNotification = {
      ...item,
      id,
      unread: item.unread !== undefined ? item.unread : true,
      createdAt: now,
    };
    globalNotificationsCache.set(id, newNotification);
    return newNotification;
  },

  async markAsRead(id: string): Promise<boolean> {
    const notif = globalNotificationsCache.get(id);
    if (!notif) return false;
    notif.unread = false;
    globalNotificationsCache.set(id, notif);
    return true;
  },

  async markAllAsRead(email?: string, storeId?: string): Promise<number> {
    const list = await this.getByRecipient(email, storeId);
    let count = 0;
    for (const notif of list) {
      if (notif.unread) {
        notif.unread = false;
        globalNotificationsCache.set(notif.id, notif);
        count++;
      }
    }
    return count;
  },

  async delete(id: string): Promise<boolean> {
    return globalNotificationsCache.delete(id);
  },

  async clearAll(email?: string, storeId?: string): Promise<number> {
    const list = await this.getByRecipient(email, storeId);
    for (const notif of list) {
      globalNotificationsCache.delete(notif.id);
    }
    return list.length;
  },
};

// -------------------------------------------------------------
// RETURN & REFUND REPOSITORY (BIDIRECTIONAL REAL-TIME SYNC)
// -------------------------------------------------------------
const globalReturnsCache: Map<string, DbReturnRequest> = new Map([
  [
    "RET-2026-0816-01",
    {
      id: "RET-2026-0816-01",
      orderId: "ORD-9935",
      buyerId: "usr-reza",
      buyerName: "Reza Pratama",
      buyerEmail: "reza.p@example.com",
      buyerPhone: "08129876123",
      storeId: "store-moondrop-official",
      storeName: "MOONDROP Official Flagship Store",
      productId: "prod-blessing3",
      productName: "MOONDROP BLESSING 3 Hybrid",
      productImage: "/hero-blessing-3.jpg",
      productPrice: 319,
      quantity: 1,
      selectedVariant: "3.5mm SE",
      reason: "Cacat Suara / Driver Imbalance",
      description: "Earpiece sebelah kiri volume lebih pelan -3dB dan terdapat suara distorsi halus pada frekuensi 4kHz saat mendengarkan vokal akustik.",
      evidenceImages: ["/hero-blessing-3.jpg"],
      unboxingVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-opening-a-box-41551-large.mp4",
      unboxingVideoType: "upload",
      requestedSolution: "REPLACEMENT",
      shippingFeeBearer: "SELLER",
      returnShippingCost: 0,
      qcStage: "STAGE_1_INITIAL_REVIEW",
      qcStatus: "PENDING",
      status: "REQUESTED",
      refundAmount: 319,
      createdAt: "2026-08-16T19:00:00.000Z",
      updatedAt: "2026-08-16T19:00:00.000Z",
    },
  ],
]);

// Sync pre-seeded return with order
const initialOrder9935 = globalOrdersCache.get("ORD-9935");
if (initialOrder9935) {
  initialOrder9935.returnId = "RET-2026-0816-01";
  initialOrder9935.returnStatus = "REQUESTED";
  initialOrder9935.escrowStatus = "DISPUTED";
  initialOrder9935.disputeReason = "Cacat Suara / Driver Imbalance";
}

export const returnRepo = {
  async getAll(): Promise<DbReturnRequest[]> {
    return Array.from(globalReturnsCache.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async findById(id: string): Promise<DbReturnRequest | null> {
    const cleanId = id.trim().toLowerCase();
    for (const [key, item] of globalReturnsCache.entries()) {
      if (key.toLowerCase() === cleanId) return item;
    }
    return null;
  },

  async findByOrderId(orderId: string): Promise<DbReturnRequest | null> {
    const cleanOrderId = orderId.trim().toLowerCase();
    for (const item of globalReturnsCache.values()) {
      if (item.orderId.toLowerCase() === cleanOrderId) return item;
    }
    return null;
  },

  async findByBuyerEmail(email: string): Promise<DbReturnRequest[]> {
    if (!email) return [];
    const cleanEmail = email.trim().toLowerCase();
    const all = await this.getAll();
    return all.filter((r) => r.buyerEmail.toLowerCase() === cleanEmail);
  },

  async findByStoreId(storeId: string): Promise<DbReturnRequest[]> {
    if (!storeId) return [];
    const cleanStoreId = storeId.trim();
    const all = await this.getAll();
    return all.filter((r) => r.storeId === cleanStoreId || cleanStoreId === "store-moondrop-official");
  },

  async create(data: Omit<DbReturnRequest, "id" | "createdAt" | "updatedAt" | "status">): Promise<DbReturnRequest> {
    const now = new Date().toISOString();
    const id = `RET-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const isBuyerPreference = data.reason?.includes("Berubah Pikiran") || data.reason?.includes("Salah Pilih");
    const shippingFeeBearer = isBuyerPreference ? "BUYER" : "SELLER";
    const returnShippingCost = isBuyerPreference ? 15 : 0;

    const newReturn: DbReturnRequest = {
      ...data,
      id,
      shippingFeeBearer: data.shippingFeeBearer || shippingFeeBearer,
      returnShippingCost: data.returnShippingCost !== undefined ? data.returnShippingCost : returnShippingCost,
      qcStage: "STAGE_1_INITIAL_REVIEW",
      qcStatus: "PENDING",
      status: "REQUESTED",
      createdAt: now,
      updatedAt: now,
    };

    globalReturnsCache.set(id, newReturn);

    // Synchronize target order
    const order = globalOrdersCache.get(data.orderId);
    if (order) {
      order.returnId = id;
      order.returnStatus = "REQUESTED";
      order.escrowStatus = "DISPUTED";
      order.disputeReason = data.reason;
      order.updatedAt = now;
      globalOrdersCache.set(order.id, order);
    }

    // Trigger notification to seller
    await notificationRepo.create({
      recipientEmail: "seller@tonalzone.id",
      recipientRole: "seller",
      storeId: data.storeId,
      type: "order",
      title: "Pengajuan Retur & Komplain Baru",
      message: `Pembeli ${data.buyerName} mengajukan retur untuk pesanan #${data.orderId} (${data.productName}). Alasan: ${data.reason}.`,
      actionLink: "/seller/returns",
      unread: true,
      meta: {
        orderId: data.orderId,
        productName: data.productName,
        storeName: data.storeName,
        image: data.productImage,
      },
    });

    // Trigger confirmation notification to buyer
    await notificationRepo.create({
      recipientEmail: data.buyerEmail,
      recipientRole: "buyer",
      type: "order",
      title: "Pengajuan Retur Diterima",
      message: `Pengajuan retur #${data.orderId} berhasil dikirim ke ${data.storeName}. Dana escrow ditahan aman menunggu tanggapan penjual.`,
      actionLink: `/orders/return/${data.orderId}`,
      unread: true,
      meta: {
        orderId: data.orderId,
        productName: data.productName,
        storeName: data.storeName,
        image: data.productImage,
      },
    });

    return newReturn;
  },

  async approveBySeller(returnId: string, storeReturnAddress: string): Promise<DbReturnRequest | null> {
    const ret = await this.findById(returnId);
    if (!ret) return null;

    const now = new Date().toISOString();
    ret.status = "APPROVED_WAITING_SHIPMENT";
    ret.storeReturnAddress = storeReturnAddress;
    ret.qcStage = "STAGE_2_ACOUSTIC_PHYSICAL_QC";

    // Auto-generate Return Waybill / Booking Code for cashless drop-off
    if (!ret.returnWaybillNumber) {
      const courierCode = "JNE";
      const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
      ret.returnWaybillNumber = `RTN-${courierCode}-${randomDigits}`;
      ret.returnCourier = "JNE Express";
    }

    ret.updatedAt = now;
    globalReturnsCache.set(ret.id, ret);

    const order = globalOrdersCache.get(ret.orderId);
    if (order) {
      order.returnStatus = "APPROVED_WAITING_SHIPMENT";
      order.updatedAt = now;
      globalOrdersCache.set(order.id, order);
    }

    // Send notification to buyer
    await notificationRepo.create({
      recipientEmail: ret.buyerEmail,
      recipientRole: "buyer",
      type: "order",
      title: "Retur Disetujui Penjual",
      message: `Toko ${ret.storeName} telah menyetujui retur pesanan #${ret.orderId}. Silakan kirimkan unit IEM ke alamat toko yang tertera.`,
      actionLink: `/orders/return/${ret.orderId}`,
      unread: true,
      meta: {
        orderId: ret.orderId,
        productName: ret.productName,
        storeName: ret.storeName,
        image: ret.productImage,
      },
    });

    return ret;
  },

  async rejectBySeller(returnId: string, sellerRejectReason: string): Promise<DbReturnRequest | null> {
    const ret = await this.findById(returnId);
    if (!ret) return null;

    const now = new Date().toISOString();
    ret.status = "REJECTED";
    ret.sellerRejectReason = sellerRejectReason;
    ret.updatedAt = now;
    globalReturnsCache.set(ret.id, ret);

    const order = globalOrdersCache.get(ret.orderId);
    if (order) {
      order.returnStatus = "REJECTED";
      order.updatedAt = now;
      globalOrdersCache.set(order.id, order);
    }

    // Send notification to buyer
    await notificationRepo.create({
      recipientEmail: ret.buyerEmail,
      recipientRole: "buyer",
      type: "order",
      title: "Retur Ditolak Penjual",
      message: `Pengajuan retur #${ret.orderId} ditolak oleh ${ret.storeName}. Alasan: ${sellerRejectReason}`,
      actionLink: `/orders/return/${ret.orderId}`,
      unread: true,
      meta: {
        orderId: ret.orderId,
        productName: ret.productName,
        storeName: ret.storeName,
        image: ret.productImage,
      },
    });

    return ret;
  },

  async submitReturnShipment(
    returnId: string,
    returnWaybillNumber: string,
    returnCourier: string
  ): Promise<DbReturnRequest | null> {
    const ret = await this.findById(returnId);
    if (!ret) return null;

    const now = new Date().toISOString();
    ret.status = "IN_TRANSIT_TO_SELLER";
    ret.returnWaybillNumber = returnWaybillNumber.trim().toUpperCase();
    ret.returnCourier = returnCourier;
    ret.updatedAt = now;
    globalReturnsCache.set(ret.id, ret);

    const order = globalOrdersCache.get(ret.orderId);
    if (order) {
      order.returnStatus = "IN_TRANSIT_TO_SELLER";
      order.updatedAt = now;
      globalOrdersCache.set(order.id, order);
    }

    // Send notification to seller
    await notificationRepo.create({
      recipientEmail: "seller@tonalzone.id",
      recipientRole: "seller",
      storeId: ret.storeId,
      type: "order",
      title: "Unit Retur Sedang Dikirim Pembeli",
      message: `Pembeli telah mengirim unit retur #${ret.orderId} via ${returnCourier} dengan resi: ${returnWaybillNumber}.`,
      actionLink: "/seller/returns",
      unread: true,
      meta: {
        orderId: ret.orderId,
        productName: ret.productName,
        storeName: ret.storeName,
        image: ret.productImage,
      },
    });

    return ret;
  },

  async confirmReceipt(returnId: string): Promise<DbReturnRequest | null> {
    const ret = await this.findById(returnId);
    if (!ret) return null;

    const now = new Date().toISOString();
    ret.status = "RECEIVED_INSPECTING";
    ret.updatedAt = now;
    globalReturnsCache.set(ret.id, ret);

    const order = globalOrdersCache.get(ret.orderId);
    if (order) {
      order.returnStatus = "RECEIVED_INSPECTING";
      order.updatedAt = now;
      globalOrdersCache.set(order.id, order);
    }

    // Send notification to buyer
    await notificationRepo.create({
      recipientEmail: ret.buyerEmail,
      recipientRole: "buyer",
      type: "order",
      title: "Paket Retur Diterima Penjual",
      message: `Unit retur #${ret.orderId} telah sampai di toko ${ret.storeName} dan sedang dalam proses inspeksi teknis & pengujian audio.`,
      actionLink: `/orders/return/${ret.orderId}`,
      unread: true,
      meta: {
        orderId: ret.orderId,
        productName: ret.productName,
        storeName: ret.storeName,
        image: ret.productImage,
      },
    });

    return ret;
  },

  async issueRefund(returnId: string): Promise<DbReturnRequest | null> {
    const ret = await this.findById(returnId);
    if (!ret) return null;

    const now = new Date().toISOString();
    ret.status = "REFUNDED";
    ret.qcStage = "COMPLETED";
    ret.updatedAt = now;
    globalReturnsCache.set(ret.id, ret);

    const order = globalOrdersCache.get(ret.orderId);
    if (order) {
      order.returnStatus = "REFUNDED";
      order.escrowStatus = "REFUNDED";
      order.updatedAt = now;
      globalOrdersCache.set(order.id, order);
    }

    // Send notification to buyer
    await notificationRepo.create({
      recipientEmail: ret.buyerEmail,
      recipientRole: "buyer",
      type: "order",
      title: "Pengembalian Dana Berhasil",
      message: `Dana retur sebesar $${ret.refundAmount} untuk pesanan #${ret.orderId} telah berhasil dikembalikan ke rekening/saldo Anda.`,
      actionLink: `/orders/return/${ret.orderId}`,
      unread: true,
      meta: {
        orderId: ret.orderId,
        productName: ret.productName,
        storeName: ret.storeName,
        image: ret.productImage,
      },
    });

    return ret;
  },

  async submitQcInspection(
    returnId: string,
    passed: boolean,
    notes: string,
    report: {
      channelBalancePassed: boolean;
      frequencyResponsePassed: boolean;
      shellIntegrityPassed: boolean;
      inspectorName?: string;
    }
  ): Promise<DbReturnRequest | null> {
    const ret = await this.findById(returnId);
    if (!ret) return null;

    const now = new Date().toISOString();
    ret.qcStatus = passed ? "PASSED" : "FAILED";
    ret.qcNotes = notes;
    ret.qcAcousticReport = {
      ...report,
      inspectedAt: now,
    };
    ret.updatedAt = now;

    if (!passed) {
      ret.status = "REJECTED";
      ret.qcStage = "COMPLETED";
      ret.sellerRejectReason = `[Hasil Uji Lab QC] ${notes}`;
      const order = globalOrdersCache.get(ret.orderId);
      if (order) {
        order.returnStatus = "REJECTED";
        order.updatedAt = now;
        globalOrdersCache.set(order.id, order);
      }
    }

    globalReturnsCache.set(ret.id, ret);

    await notificationRepo.create({
      recipientEmail: ret.buyerEmail,
      recipientRole: "buyer",
      type: "order",
      title: passed ? "Hasil Uji QC Lab: Cacat Pabrik Terverifikasi" : "Hasil Uji QC Lab: Retur Ditolak",
      message: passed
        ? `Unit IEM #${ret.orderId} lolos uji teknis & akustik lab QC (${notes}). Solusi retur segera diselesaikan.`
        : `Hasil uji lab teknisi toko menunjukkan unit #${ret.orderId} mengalami kerusakan fisik kelalaian pengguna.`,
      actionLink: `/orders/return/${ret.orderId}`,
      unread: true,
    });

    return ret;
  },

  async issueReplacement(
    returnId: string,
    replacementWaybillNumber: string,
    replacementCourier: string
  ): Promise<DbReturnRequest | null> {
    const ret = await this.findById(returnId);
    if (!ret) return null;

    const now = new Date().toISOString();
    ret.status = "REPLACED";
    ret.resolutionType = "REPLACEMENT";
    ret.replacementWaybillNumber = replacementWaybillNumber;
    ret.replacementCourier = replacementCourier;
    ret.qcStage = "COMPLETED";
    ret.updatedAt = now;
    globalReturnsCache.set(ret.id, ret);

    const order = globalOrdersCache.get(ret.orderId);
    if (order) {
      order.returnStatus = "REPLACED";
      order.escrowStatus = "FUNDS_RELEASED_TO_SELLER";
      order.updatedAt = now;
      globalOrdersCache.set(order.id, order);
    }

    await notificationRepo.create({
      recipientEmail: ret.buyerEmail,
      recipientRole: "buyer",
      type: "order",
      title: "Unit Pengganti Sedang Dikirim",
      message: `Toko ${ret.storeName} telah mengirim unit baru pengganti via ${replacementCourier} dengan resi: ${replacementWaybillNumber}.`,
      actionLink: `/orders/return/${ret.orderId}`,
      unread: true,
      meta: {
        orderId: ret.orderId,
        productName: ret.productName,
        storeName: ret.storeName,
        image: ret.productImage,
      },
    });

    return ret;
  },
};


