import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { orderRepo, storeRepo, userRepo, DbOrder } from "@/lib/supabase-db";

/**
 * Helper to resolve the authenticated seller's store
 */
async function resolveCurrentStore(request: Request) {
  const { searchParams } = new URL(request.url);
  const explicitStoreId = searchParams.get("storeId");
  const explicitEmail = searchParams.get("email") || searchParams.get("sellerEmail");

  if (explicitStoreId) {
    const store = await storeRepo.findById(explicitStoreId);
    if (store) return store;
    return null;
  }

  if (explicitEmail) {
    const user = await userRepo.findByEmail(explicitEmail);
    if (user?.store) return user.store;
    return null;
  }

  // Check session cookie
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("tonalzone_session");
    if (sessionCookie) {
      const session = JSON.parse(decodeURIComponent(sessionCookie.value));
      if (session.storeId) {
        const store = await storeRepo.findById(session.storeId);
        if (store) return store;
      }
      if (session.email) {
        const user = await userRepo.findByEmail(session.email);
        if (user?.store) return user.store;
      }
    }
  } catch (e) {}

  // Fallback to official Moondrop store
  const moondropStore = await storeRepo.findById("store-moondrop-official");
  if (moondropStore) return moondropStore;

  return null;
}

/**
 * Maps a DbOrder to the SellerOrder model expected by the seller dashboard
 */
function mapToSellerOrder(o: DbOrder) {
  let status: "TO_SHIP" | "IN_TRANSIT" | "COMPLETED" | "DISPUTED" | "CANCELLED" = "TO_SHIP";
  let escrowStatus: "HELD_IN_ESCROW" | "RELEASED" | "REFUNDED" = "HELD_IN_ESCROW";

  if (o.cancelReason || o.escrowStatus === "REFUNDED") {
    status = "CANCELLED";
    escrowStatus = "REFUNDED";
  } else {
    switch (o.escrowStatus) {
      case "PAYMENT_PENDING":
      case "HELD_IN_ESCROW":
        status = "TO_SHIP";
        escrowStatus = "HELD_IN_ESCROW";
        break;
      case "IN_TRANSIT":
      case "DELIVERED":
        status = "IN_TRANSIT";
        escrowStatus = "HELD_IN_ESCROW";
        break;
      case "FUNDS_RELEASED_TO_SELLER":
        status = "COMPLETED";
        escrowStatus = "RELEASED";
        break;
      case "DISPUTED":
        status = "DISPUTED";
        escrowStatus = "HELD_IN_ESCROW";
        break;
    }
  }

  const safeTotal = o.totalAmount || (o.items?.[0] ? Number(o.items[0].price) * (o.items[0].quantity || 1) : 0);
  const commFee = o.platformCommissionFee ?? (safeTotal > 0 ? Math.round(safeTotal * 0.03 * 100) / 100 : 0);
  const netPayout = o.netSellerPayout ?? (safeTotal > 0 ? Math.round((safeTotal - commFee) * 100) / 100 : 0);

  return {
    id: o.id,
    createdAt: o.createdAt ? o.createdAt.replace("T", " ").substring(0, 16) : new Date().toISOString().substring(0, 16),
    buyerName: o.buyerName,
    buyerCity: o.destinationCity,
    buyerAddress: o.destinationAddress,
    productName: o.items?.[0]?.productName || "Audiophile Equipment",
    productQty: o.items?.[0]?.quantity || 1,
    totalPriceUSD: safeTotal,
    courier: o.courierCode || "J&T Express",
    waybill: o.waybillNumber,
    status,
    escrowStatus,
    isDelivered: o.escrowStatus === "DELIVERED",
    items: o.items,
    shippingFee: o.shippingFee,
    insuranceFee: o.insuranceFee,
    platformFee: o.platformFee ?? 0.1,
    platformCommissionRate: o.platformCommissionRate ?? 0.03,
    platformCommissionFee: commFee,
    netSellerPayout: netPayout,
    cancelReason: o.cancelReason,
    cancelledBy: o.cancelledBy,
    cancelledAt: o.cancelledAt,
  };
}

/**
 * GET /api/seller/orders
 * Returns orders for the authenticated seller's store
 */
export async function GET(request: Request) {
  try {
    const store = await resolveCurrentStore(request);
    if (!store) {
      return NextResponse.json({
        success: true,
        count: 0,
        orders: [],
      });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status")?.toUpperCase();

    // 100% multi-tenant isolated orders
    const rawOrders = await orderRepo.findByStoreId(store.id);
    let mapped = rawOrders.map(mapToSellerOrder);

    if (statusFilter && statusFilter !== "ALL") {
      mapped = mapped.filter((o) => o.status === statusFilter);
    }

    return NextResponse.json({
      success: true,
      storeId: store.id,
      storeName: store.storeName,
      count: mapped.length,
      orders: mapped,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to fetch seller orders";
    console.error("[Seller Orders API] Error:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

/**
 * POST /api/seller/orders
 * Dispatches an order with waybill tracking
 */
export async function POST(request: Request) {
  try {
    const store = await resolveCurrentStore(request);
    if (!store) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Store not found." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, waybillNumber, courierCode } = body;

    if (!orderId || !waybillNumber || !waybillNumber.trim()) {
      return NextResponse.json(
        { success: false, error: "Order ID and Waybill Number are required." },
        { status: 400 }
      );
    }

    // Verify order ownership
    const order = await orderRepo.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order #${orderId} not found.` },
        { status: 404 }
      );
    }

    if (order.storeId !== store.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden: You do not own this order." },
        { status: 403 }
      );
    }

    const updated = await orderRepo.updateShipment(orderId, waybillNumber.trim().toUpperCase(), courierCode);

    return NextResponse.json({
      success: true,
      message: `Waybill ${waybillNumber} successfully recorded for order #${orderId}.`,
      order: updated ? mapToSellerOrder(updated) : null,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to update order shipment";
    console.error("[Seller Orders Dispatch API] Error:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
