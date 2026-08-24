import { SubOrder, StoreWalletSummary, WalletLedgerEntry } from "./types";

/**
 * Calculates store wallet balance breakdown: Available, In-Escrow Holding, and Lifetime Payouts.
 */
export function calculateStoreWalletBalances(
  storeId: string,
  subOrders: SubOrder[],
  existingLedger: WalletLedgerEntry[] = []
): StoreWalletSummary {
  const storeOrders = subOrders.filter((s) => s.storeId === storeId);

  let inEscrowHoldingUSD = 0;
  let inEscrowHoldingIDR = 0;
  let availableBalanceUSD = 0;
  let availableBalanceIDR = 0;

  for (const order of storeOrders) {
    const isHolding =
      order.status === "ESCROW_HOLDING" ||
      order.status === "DISPATCHED" ||
      order.status === "IN_TRANSIT" ||
      order.status === "DELIVERED_INSPECTION_48H";

    const isSettled = order.status === "SETTLED_TO_SELLER";

    if (isHolding) {
      inEscrowHoldingUSD += order.netSellerPayoutUSD;
      inEscrowHoldingIDR += order.netSellerPayoutIDR;
    } else if (isSettled) {
      availableBalanceUSD += order.netSellerPayoutUSD;
      availableBalanceIDR += order.netSellerPayoutIDR;
    }
  }

  // Deduct already disbursed withdrawals from ledger
  let lifetimeDisbursedUSD = 0;
  let lifetimeDisbursedIDR = 0;

  for (const entry of existingLedger) {
    if (entry.storeId === storeId && entry.type === "WITHDRAWAL_DISBURSEMENT") {
      availableBalanceUSD = Math.max(0, availableBalanceUSD - entry.amountUSD);
      availableBalanceIDR = Math.max(0, availableBalanceIDR - entry.amountIDR);
      lifetimeDisbursedUSD += entry.amountUSD;
      lifetimeDisbursedIDR += entry.amountIDR;
    }
  }

  return {
    storeId,
    availableBalanceUSD: Math.round(availableBalanceUSD * 100) / 100,
    availableBalanceIDR,
    inEscrowHoldingUSD: Math.round(inEscrowHoldingUSD * 100) / 100,
    inEscrowHoldingIDR,
    lifetimeDisbursedUSD: Math.round(lifetimeDisbursedUSD * 100) / 100,
    lifetimeDisbursedIDR,
    recentLedger: existingLedger.filter((e) => e.storeId === storeId).slice(-20),
  };
}

/**
 * Creates a financial ledger entry for audit trail
 */
export function recordLedgerEntry(params: {
  storeId: string;
  subOrderId?: string;
  type: WalletLedgerEntry["type"];
  amountUSD: number;
  amountIDR: number;
  balanceAfterIDR: number;
  notes: string;
}): WalletLedgerEntry {
  return {
    id: `LEDGER-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    storeId: params.storeId,
    subOrderId: params.subOrderId,
    type: params.type,
    amountUSD: params.amountUSD,
    amountIDR: params.amountIDR,
    balanceAfterIDR: params.balanceAfterIDR,
    notes: params.notes,
    createdAt: new Date().toISOString(),
  };
}
