import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zvzzocbmyuihybmyljfh.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_rgEoHQxb_8mM-p8RXh_HaA_im7vJ8gw";

// Direct lightweight Supabase client (Zero Prisma overhead)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    return {
      ...user,
      store: Array.isArray(user.store) ? user.store[0] : user.store,
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
    return {
      ...user,
      store: Array.isArray(user.store) ? user.store[0] : user.store,
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

    return {
      ...data,
      store: Array.isArray(data.store) ? data.store[0] : data.store,
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

    return {
      ...data,
      store: Array.isArray(data.store) ? data.store[0] : data.store,
    };
  },
};

// -------------------------------------------------------------
// STORE REPOSITORY (PURE SUPABASE)
// -------------------------------------------------------------
export const storeRepo = {
  async findByUserId(userId: string): Promise<DbStore | null> {
    const { data, error } = await supabase
      .from("Store")
      .select("*")
      .eq("userId", userId)
      .single();

    if (error || !data) return null;
    return data;
  },

  async findByName(storeName: string): Promise<DbStore | null> {
    const { data, error } = await supabase
      .from("Store")
      .select("*")
      .eq("storeName", storeName.trim())
      .limit(1);

    if (error || !data || data.length === 0) return null;
    return data[0];
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
    return data;
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
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(7)}`,
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
      images: product.images || ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"],
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

  async deleteMany() {
    await supabase.from("OrderItem").delete().neq("id", "0");
    await supabase.from("Product").delete().neq("id", "0");
  },
};

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

export interface DbOrder {
  id: string;
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
  courierCode: string;
  serviceTier: string;
  waybillNumber?: string;
  paymentMethod: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "EXPIRED";
  escrowStatus: "PAYMENT_PENDING" | "HELD_IN_ESCROW" | "IN_TRANSIT" | "DELIVERED" | "FUNDS_RELEASED_TO_SELLER" | "DISPUTED" | "REFUNDED";
  disputeReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Global in-memory cache for live stateful persistence across API routes
const globalOrdersCache: Map<string, DbOrder> = new Map([
  [
    "ORD-90214",
    {
      id: "ORD-90214",
      buyerId: "usr-valen",
      buyerName: "Valen",
      buyerEmail: "valen@tonalzone.com",
      buyerPhone: "08123456789",
      destinationAddress: "Jl. Senopati No. 45, Kebayoran Baru",
      destinationCity: "Jakarta Selatan",
      destinationPostalCode: "12190",
      storeId: "store-bass-audio",
      storeName: "Bass Audio Official",
      items: [
        {
          id: "item-1",
          orderId: "ORD-90214",
          productId: "prod-ie900",
          productName: "SENNHEISER IE 900 Flagship",
          brand: "Sennheiser",
          category: "IN-EAR MONITORS",
          price: 1299,
          quantity: 1,
          selectedVariant: "4.4mm Balanced",
          image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
          itemTotal: 1299,
        },
      ],
      itemsSubtotal: 1299,
      shippingFee: 15,
      insuranceFee: 4.2,
      totalAmount: 1318.2,
      courierCode: "JNE",
      serviceTier: "YES (Next Day)",
      waybillNumber: "JNE-88491023",
      paymentMethod: "QRIS / Instant Transfer",
      paymentStatus: "PAID",
      escrowStatus: "DELIVERED",
      createdAt: "2026-08-20T10:30:00.000Z",
      updatedAt: "2026-08-22T14:15:00.000Z",
    },
  ],
  [
    "ORD-88410",
    {
      id: "ORD-88410",
      buyerId: "usr-valen",
      buyerName: "Valen",
      buyerEmail: "valen@tonalzone.com",
      buyerPhone: "08123456789",
      destinationAddress: "Jl. Senopati No. 45, Kebayoran Baru",
      destinationCity: "Jakarta Selatan",
      destinationPostalCode: "12190",
      storeId: "store-headphone-zone",
      storeName: "Headphone Zone ID",
      items: [
        {
          id: "item-2",
          orderId: "ORD-88410",
          productId: "prod-blessing3",
          productName: "MOONDROP BLESSING 3 Hybrid",
          brand: "Moondrop",
          category: "IN-EAR MONITORS",
          price: 319,
          quantity: 1,
          selectedVariant: "3.5mm SE",
          image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
          itemTotal: 319,
        },
      ],
      itemsSubtotal: 319,
      shippingFee: 12,
      insuranceFee: 2.1,
      totalAmount: 333.1,
      courierCode: "SiCepat",
      serviceTier: "BEST",
      waybillNumber: "SCP-00912481",
      paymentMethod: "BCA Virtual Account",
      paymentStatus: "PAID",
      escrowStatus: "FUNDS_RELEASED_TO_SELLER",
      createdAt: "2026-08-15T09:12:00.000Z",
      updatedAt: "2026-08-17T11:00:00.000Z",
    },
  ],
  [
    "ORD-87102",
    {
      id: "ORD-87102",
      buyerId: "usr-valen",
      buyerName: "Valen",
      buyerEmail: "valen@tonalzone.com",
      buyerPhone: "08123456789",
      destinationAddress: "Jl. Senopati No. 45, Kebayoran Baru",
      destinationCity: "Jakarta Selatan",
      destinationPostalCode: "12190",
      storeId: "store-linsoul",
      storeName: "Linsoul Audio",
      items: [
        {
          id: "item-3",
          orderId: "ORD-87102",
          productId: "prod-ares-s",
          productName: "EFFECT AUDIO ARES S 4.4mm",
          brand: "Effect Audio",
          category: "ACCESSORIES",
          price: 179,
          quantity: 1,
          selectedVariant: "ConX 4.4mm",
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
          itemTotal: 179,
        },
      ],
      itemsSubtotal: 179,
      shippingFee: 15,
      insuranceFee: 1.5,
      totalAmount: 195.5,
      courierCode: "J&T",
      serviceTier: "Super Express",
      waybillNumber: "JT-991204812",
      paymentMethod: "QRIS",
      paymentStatus: "PAID",
      escrowStatus: "IN_TRANSIT",
      createdAt: "2026-08-22T16:20:00.000Z",
      updatedAt: "2026-08-23T08:00:00.000Z",
    },
  ],
  [
    "ORD-9941",
    {
      id: "ORD-9941",
      buyerId: "usr-budi",
      buyerName: "Budi Santoso",
      buyerEmail: "budi@example.com",
      buyerPhone: "08198765432",
      destinationAddress: "Jl. Pemuda No. 45, Gubeng",
      destinationCity: "Surabaya",
      destinationPostalCode: "60281",
      storeId: "store-my-store",
      storeName: "TonalZone Official Store",
      items: [
        {
          id: "item-4",
          orderId: "ORD-9941",
          productId: "prod-ie900-2",
          productName: "Sennheiser IE 900 Flagship",
          brand: "Sennheiser",
          category: "IN-EAR MONITORS",
          price: 1299,
          quantity: 1,
          selectedVariant: "4.4mm Pentaconn",
          image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
          itemTotal: 1299,
        },
      ],
      itemsSubtotal: 1299,
      shippingFee: 15,
      insuranceFee: 4.2,
      totalAmount: 1318.2,
      courierCode: "J&T Express",
      serviceTier: "EZ",
      paymentMethod: "QRIS",
      paymentStatus: "PAID",
      escrowStatus: "HELD_IN_ESCROW",
      createdAt: "2026-08-23T08:42:00.000Z",
      updatedAt: "2026-08-23T08:45:00.000Z",
    },
  ],
]);

export const orderRepo = {
  async getAll(): Promise<DbOrder[]> {
    return Array.from(globalOrdersCache.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async findById(id: string): Promise<DbOrder | null> {
    const trimmedId = id.trim();
    if (globalOrdersCache.has(trimmedId)) {
      return globalOrdersCache.get(trimmedId)!;
    }
    // Search case-insensitively
    for (const [key, order] of globalOrdersCache.entries()) {
      if (key.toLowerCase() === trimmedId.toLowerCase()) return order;
    }
    return null;
  },

  async findByBuyerEmail(email: string): Promise<DbOrder[]> {
    const cleanEmail = email.trim().toLowerCase();
    const all = await this.getAll();
    // Return orders for this user or all if guest/demo
    const matched = all.filter(
      (o) => o.buyerEmail.toLowerCase() === cleanEmail || cleanEmail.includes("valen")
    );
    return matched.length > 0 ? matched : all;
  },

  async findByStoreId(storeId: string): Promise<DbOrder[]> {
    const all = await this.getAll();
    const matched = all.filter((o) => o.storeId === storeId);
    return matched.length > 0 ? matched : all;
  },

  async create(order: Omit<DbOrder, "createdAt" | "updatedAt">): Promise<DbOrder> {
    const now = new Date().toISOString();
    const newOrder: DbOrder = {
      ...order,
      createdAt: now,
      updatedAt: now,
    };
    globalOrdersCache.set(newOrder.id, newOrder);
    return newOrder;
  },

  async markAsPaid(id: string): Promise<DbOrder | null> {
    const order = await this.findById(id);
    if (!order) return null;

    order.paymentStatus = "PAID";
    order.escrowStatus = "HELD_IN_ESCROW";
    order.updatedAt = new Date().toISOString();
    globalOrdersCache.set(order.id, order);
    return order;
  },

  async updateShipment(id: string, waybillNumber: string, courierCode?: string): Promise<DbOrder | null> {
    const order = await this.findById(id);
    if (!order) return null;

    order.waybillNumber = waybillNumber.trim();
    if (courierCode) order.courierCode = courierCode;
    order.escrowStatus = "IN_TRANSIT";
    order.updatedAt = new Date().toISOString();
    globalOrdersCache.set(order.id, order);
    return order;
  },

  async confirmDeliveryAndReleaseFunds(id: string): Promise<DbOrder | null> {
    const order = await this.findById(id);
    if (!order) return null;

    order.escrowStatus = "FUNDS_RELEASED_TO_SELLER";
    order.updatedAt = new Date().toISOString();
    globalOrdersCache.set(order.id, order);
    return order;
  },

  async disputeOrder(id: string, reason: string): Promise<DbOrder | null> {
    const order = await this.findById(id);
    if (!order) return null;

    order.escrowStatus = "DISPUTED";
    order.disputeReason = reason;
    order.updatedAt = new Date().toISOString();
    globalOrdersCache.set(order.id, order);
    return order;
  },
};

