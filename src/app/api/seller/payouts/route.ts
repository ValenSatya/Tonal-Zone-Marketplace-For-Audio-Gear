import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { orderRepo, payoutRepo, storeRepo, userRepo } from "@/lib/supabase-db";
import { verifySession } from "@/lib/auth/security";

const USD_TO_IDR_RATE = 15500;

/**
 * Helper to resolve the authenticated seller's store
 */
async function resolveCurrentStore(request: Request) {
  const { searchParams } = new URL(request.url);
  const explicitStoreId = searchParams.get("storeId");
  const explicitEmail = searchParams.get("email") || searchParams.get("sellerEmail");

  if (explicitStoreId) {
    let store = await storeRepo.findById(explicitStoreId);
    if (!store) store = await storeRepo.findByUserId(explicitStoreId);
    if (!store) store = await storeRepo.findByName(explicitStoreId);
    if (store) return store;
    return {
      id: explicitStoreId,
      userId: "usr-seller",
      storeName: "Toko Saya",
      status: "APPROVED",
      storeType: "RETAIL_MERCHANT",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    };
  }

  if (explicitEmail) {
    const user = await userRepo.findByEmail(explicitEmail);
    if (user?.store) return user.store;
    if (user?.id) {
      const store = await storeRepo.findByUserId(user.id);
      if (store) return store;
    }
    return null;
  }

  // Check session cookie
  let hasActiveSession = false;
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("tonalzone_session");
    if (sessionCookie?.value) {
      const session = verifySession<{ id?: string; email?: string; storeId?: string }>(sessionCookie.value);
      if (session) {
        hasActiveSession = true;
        if (session.storeId) {
          const store = await storeRepo.findById(session.storeId);
          if (store) return store;
        }
        if (session.email) {
          const user = await userRepo.findByEmail(session.email);
          if (user?.store) return user.store;
          if (user?.id) {
            const store = await storeRepo.findByUserId(user.id);
            if (store) return store;
          }
        }
      }
    }
  } catch (e) {
    console.error("Error reading session in seller/payouts:", e);
  }

  // If user is authenticated, do not leak Moondrop payouts
  if (hasActiveSession) {
    return null;
  }

  // Fallback to official Moondrop store ONLY for unauthenticated public requests
  const moondropStore = await storeRepo.findById("store-moondrop-official");
  if (moondropStore) return moondropStore;

  return null;
}

export interface PayoutTransactionItem {
  id: string;
  date: string;
  type: "ORDER_SETTLEMENT" | "BANK_WITHDRAWAL" | "FEE_ADJUSTMENT";
  description: string;
  amountUSD: number;
  bankAccount?: string;
  status: "COMPLETED" | "PROCESSING" | "ESCROW_HELD";
}

/**
 * Computes wallet metrics for a specific store
 */
async function computeWallet(storeId: string) {
  const orders = await orderRepo.findByStoreId(storeId);
  const withdrawals = await payoutRepo.getWithdrawals(storeId);

  let inEscrowUSD = 0;
  let grossSettledUSD = 0;

  const transactions: PayoutTransactionItem[] = [];

  for (const order of orders) {
    const productName = order.items?.[0]?.productName || "Audiophile Gear";
    const dateStr = order.updatedAt
      ? order.updatedAt.replace("T", " ").substring(0, 16)
      : order.createdAt.replace("T", " ").substring(0, 16);

    // Resilient gross calculation even with demo 1 Rp promo totalAmount
    const safeGross =
      (order.totalAmount && order.totalAmount >= 1)
        ? order.totalAmount
        : (order.itemsSubtotal && order.itemsSubtotal > 0)
        ? order.itemsSubtotal
        : (order.items?.reduce((s, it) => s + (Number(it.price || 0) * Number(it.quantity || 1)), 0) || 0);

    const commRate = order.platformCommissionRate ?? 0.03;
    const commFee =
      order.platformCommissionFee ??
      (Math.round(safeGross * commRate * 100) / 100);

    const netPayout =
      (order.netSellerPayout && order.netSellerPayout > 0)
        ? order.netSellerPayout
        : (Math.round((safeGross - commFee) * 100) / 100);

    if (order.escrowStatus === "FUNDS_RELEASED_TO_SELLER") {
      grossSettledUSD += netPayout;
      transactions.push({
        id: `TX-${order.id.replace("ORD-", "")}`,
        date: dateStr,
        type: "ORDER_SETTLEMENT",
        description: `Escrow Release: #${order.id} (${productName}) [Komisi Platform 3%: -$${commFee.toFixed(2)}]`,
        amountUSD: netPayout,
        status: "COMPLETED",
      });
    } else if (
      order.escrowStatus === "HELD_IN_ESCROW" ||
      order.escrowStatus === "IN_TRANSIT" ||
      order.escrowStatus === "DELIVERED" ||
      order.escrowStatus === "PAYMENT_PENDING"
    ) {
      inEscrowUSD += netPayout;
      transactions.push({
        id: `TX-${order.id.replace("ORD-", "")}`,
        date: dateStr,
        type: "ORDER_SETTLEMENT",
        description: `Escrow Holding: #${order.id} (${productName})`,
        amountUSD: netPayout,
        status: "ESCROW_HELD",
      });
    }
  }

  let lifetimeUSD = 0;
  for (const w of withdrawals) {
    lifetimeUSD += w.amountUSD;
    transactions.push({
      id: w.id,
      date: w.createdAt.replace("T", " ").substring(0, 16),
      type: "BANK_WITHDRAWAL",
      description: `Payout to ${w.bankName} (${w.bankAccount})`,
      amountUSD: -w.amountUSD,
      bankAccount: `${w.bankName} •••• ${w.bankAccount.slice(-4) || "0000"}`,
      status: w.status === "COMPLETED" ? "COMPLETED" : "PROCESSING",
    });
  }

  // Sort transactions descending by date
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Moondrop Official Flagship store has historical starting revenue ($8,620)
  // that accounted for initial $4,300 past mock withdrawals and $4,320 starting balance.
  const isMoondropOfficial = storeId === "store-moondrop-official" || storeId.toLowerCase().includes("moondrop");
  const initialBrandGross = isMoondropOfficial ? 8620 : 0;
  const availableUSD = Math.max(0, Math.round((initialBrandGross + grossSettledUSD - lifetimeUSD) * 100) / 100);

  return {
    availableUSD,
    availableIDR: Math.round(availableUSD * USD_TO_IDR_RATE),
    inEscrowUSD: Math.round(inEscrowUSD * 100) / 100,
    inEscrowIDR: Math.round(inEscrowUSD * USD_TO_IDR_RATE),
    lifetimeUSD: Math.round(lifetimeUSD * 100) / 100,
    lifetimeIDR: Math.round(lifetimeUSD * USD_TO_IDR_RATE),
    transactions,
  };
}

/**
 * GET /api/seller/payouts
 * Get wallet balances and transaction history for the authenticated store
 */
export async function GET(request: Request) {
  try {
    const store = await resolveCurrentStore(request);
    if (!store) {
      return NextResponse.json({
        success: true,
        availableUSD: 0,
        availableIDR: 0,
        inEscrowUSD: 0,
        inEscrowIDR: 0,
        lifetimeUSD: 0,
        lifetimeIDR: 0,
        transactions: [],
      });
    }

    const wallet = await computeWallet(store.id);

    return NextResponse.json({
      success: true,
      storeId: store.id,
      storeName: store.storeName,
      ...wallet,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to fetch wallet payouts";
    console.error("[Seller Payouts API] GET Error:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

/**
 * POST /api/seller/payouts
 * Request bank withdrawal from available wallet balance
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
    const { amountUSD, amountIDR, bankName, bankAccount, accountHolder } = body;

    let targetUSD = 0;
    if (typeof amountUSD === "number" && amountUSD > 0) {
      targetUSD = amountUSD;
    } else if (typeof amountIDR === "number" && amountIDR > 0) {
      targetUSD = Math.round((amountIDR / USD_TO_IDR_RATE) * 100) / 100;
    }

    if (targetUSD <= 0) {
      return NextResponse.json(
        { success: false, error: "Nominal penarikan dana harus lebih besar dari 0." },
        { status: 400 }
      );
    }

    if (!bankName || !bankAccount) {
      return NextResponse.json(
        { success: false, error: "Nama bank dan nomor rekening tujuan wajib diisi." },
        { status: 400 }
      );
    }

    const currentWallet = await computeWallet(store.id);
    if (targetUSD > currentWallet.availableUSD + 0.01) {
      return NextResponse.json(
        {
          success: false,
          error: `Saldo tidak mencukupi. Saldo tersedia: $${currentWallet.availableUSD} (Rp ${currentWallet.availableIDR.toLocaleString("id-ID")}).`,
        },
        { status: 400 }
      );
    }

    const withdrawal = await payoutRepo.recordWithdrawal({
      storeId: store.id,
      amountUSD: targetUSD,
      amountIDR: Math.round(targetUSD * USD_TO_IDR_RATE),
      bankName: bankName.trim(),
      bankAccount: bankAccount.trim(),
      accountHolder: accountHolder || store.storeName,
    });

    const updatedWallet = await computeWallet(store.id);

    return NextResponse.json({
      success: true,
      message: `Permintaan penarikan dana sebesar $${targetUSD} ke rekening ${bankName} (${bankAccount}) berhasil diajukan dan sedang diproses.`,
      withdrawal,
      ...updatedWallet,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to process withdrawal";
    console.error("[Seller Payouts API] POST Error:", error);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
