import { EscrowStatus, SubOrder } from "./types";

interface TransitionContext {
  waybillNumber?: string;
  disputeReason?: string;
  actorRole?: "BUYER" | "SELLER" | "ADMIN" | "SYSTEM_WEBHOOK";
  adminResolutionNotes?: string;
  forceBypassTimer?: boolean;
}

interface TransitionResult {
  success: boolean;
  error?: string;
  updatedSubOrder: SubOrder;
}

// Legal State Transition Matrix
const LEGAL_TRANSITIONS: Record<EscrowStatus, EscrowStatus[]> = {
  PAYMENT_PENDING: ["ESCROW_HOLDING", "CANCELLED"],
  ESCROW_HOLDING: ["DISPATCHED", "CANCELLED", "REFUNDED_TO_BUYER"],
  DISPATCHED: ["IN_TRANSIT", "CANCELLED"],
  IN_TRANSIT: ["DELIVERED_INSPECTION_48H"],
  DELIVERED_INSPECTION_48H: ["SETTLED_TO_SELLER", "DISPUTE_ACTIVE"],
  DISPUTE_ACTIVE: ["SETTLED_TO_SELLER", "REFUNDED_TO_BUYER"],
  SETTLED_TO_SELLER: [], // Terminal state
  REFUNDED_TO_BUYER: [], // Terminal state
  CANCELLED: [],         // Terminal state
};

/**
 * Validates if a transition from currentStatus to targetStatus is legally permitted.
 */
export function isLegalTransition(currentStatus: EscrowStatus, targetStatus: EscrowStatus): boolean {
  const allowed = LEGAL_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

/**
 * Executes a state transition on a SubOrder with safety guards and timestamping.
 */
export function transitionSubOrder(
  subOrder: SubOrder,
  targetStatus: EscrowStatus,
  context?: TransitionContext
): TransitionResult {
  const currentStatus = subOrder.status;

  // 1. Check legal graph transition
  if (!isLegalTransition(currentStatus, targetStatus)) {
    return {
      success: false,
      error: `Illegal state transition from ${currentStatus} to ${targetStatus}.`,
      updatedSubOrder: subOrder,
    };
  }

  const now = new Date();
  const nowISO = now.toISOString();
  const updated: SubOrder = { ...subOrder, updatedAt: nowISO };

  // 2. Guard: DISPATCHED requires valid tracking / waybill number
  if (targetStatus === "DISPATCHED") {
    const waybill = context?.waybillNumber || subOrder.waybillNumber;
    if (!waybill || waybill.trim().length < 5) {
      return {
        success: false,
        error: "Cannot dispatch order without a valid courier tracking waybill number.",
        updatedSubOrder: subOrder,
      };
    }
    updated.waybillNumber = waybill.trim();
    updated.dispatchedAt = nowISO;
    updated.status = "DISPATCHED";
    return { success: true, updatedSubOrder: updated };
  }

  // 3. Guard: DELIVERED_INSPECTION_48H initializes 48-Hour Inspection Timer
  if (targetStatus === "DELIVERED_INSPECTION_48H") {
    const expiryDate = new Date(now.getTime() + 48 * 3600 * 1000); // +48 hours
    updated.deliveredAt = nowISO;
    updated.inspectionExpiresAt = expiryDate.toISOString();
    updated.status = "DELIVERED_INSPECTION_48H";
    return { success: true, updatedSubOrder: updated };
  }

  // 4. Guard: SETTLED_TO_SELLER requires 48h timer expiry or explicit buyer approval
  if (targetStatus === "SETTLED_TO_SELLER") {
    if (currentStatus === "DELIVERED_INSPECTION_48H") {
      const expiry = subOrder.inspectionExpiresAt ? new Date(subOrder.inspectionExpiresAt) : null;
      const isExpired = expiry ? now.getTime() >= expiry.getTime() : false;
      const isBuyerManualAccept = context?.actorRole === "BUYER";
      const isAdminForce = context?.actorRole === "ADMIN";

      if (!isExpired && !isBuyerManualAccept && !isAdminForce && !context?.forceBypassTimer) {
        return {
          success: false,
          error: "Acoustic inspection period (48h) is still active. Funds can only settle after 48h or upon buyer acceptance.",
          updatedSubOrder: subOrder,
        };
      }
    }
    updated.status = "SETTLED_TO_SELLER";
    return { success: true, updatedSubOrder: updated };
  }

  // 5. Guard: DISPUTE_ACTIVE requires dispute reason
  if (targetStatus === "DISPUTE_ACTIVE") {
    if (!context?.disputeReason) {
      return {
        success: false,
        error: "Dispute reason is required when opening a complaint.",
        updatedSubOrder: subOrder,
      };
    }
    updated.disputeReason = context.disputeReason;
    updated.status = "DISPUTE_ACTIVE";
    return { success: true, updatedSubOrder: updated };
  }

  // 6. Generic allowed transitions (ESCROW_HOLDING, IN_TRANSIT, REFUNDED_TO_BUYER, CANCELLED)
  updated.status = targetStatus;
  return { success: true, updatedSubOrder: updated };
}

/**
 * Re-evaluates parent order overall status based on its composite sub-orders.
 */
export function recomputeParentOrderStatus(subOrders: SubOrder[]): EscrowStatus {
  if (subOrders.length === 0) return "CANCELLED";

  const allStatuses = subOrders.map((s) => s.status);

  // If any sub-order is in dispute, flag parent order
  if (allStatuses.includes("DISPUTE_ACTIVE")) return "DISPUTE_ACTIVE";

  // If all sub-orders are settled
  if (allStatuses.every((s) => s === "SETTLED_TO_SELLER")) return "SETTLED_TO_SELLER";

  // If all sub-orders are cancelled
  if (allStatuses.every((s) => s === "CANCELLED")) return "CANCELLED";

  // If all are refunded
  if (allStatuses.every((s) => s === "REFUNDED_TO_BUYER")) return "REFUNDED_TO_BUYER";

  // In-flight progression
  if (allStatuses.some((s) => s === "DELIVERED_INSPECTION_48H")) return "DELIVERED_INSPECTION_48H";
  if (allStatuses.some((s) => s === "IN_TRANSIT")) return "IN_TRANSIT";
  if (allStatuses.some((s) => s === "DISPATCHED")) return "DISPATCHED";
  if (allStatuses.some((s) => s === "ESCROW_HOLDING")) return "ESCROW_HOLDING";

  return "PAYMENT_PENDING";
}
