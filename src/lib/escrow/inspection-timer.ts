import { SubOrder } from "./types";

export interface InspectionWindowStatus {
  isActive: boolean;
  isExpired: boolean;
  hoursRemaining: number;
  minutesRemaining: number;
  formattedCountdown: string;
  deliveredDateFormatted: string;
  expiryDateFormatted: string;
  percentElapsed: number; // 0% to 100%
}

/**
 * Calculates current countdown and progress of the 48-Hour Acoustic Inspection Window.
 */
export function getInspectionWindowStatus(
  deliveredAtISO?: string,
  inspectionExpiresAtISO?: string
): InspectionWindowStatus {
  if (!deliveredAtISO) {
    return {
      isActive: false,
      isExpired: false,
      hoursRemaining: 48,
      minutesRemaining: 0,
      formattedCountdown: "48h 00m",
      deliveredDateFormatted: "-",
      expiryDateFormatted: "-",
      percentElapsed: 0,
    };
  }

  const deliveredDate = new Date(deliveredAtISO);
  const expiryDate = inspectionExpiresAtISO
    ? new Date(inspectionExpiresAtISO)
    : new Date(deliveredDate.getTime() + 48 * 3600 * 1000);

  const now = new Date();
  const totalDurationMs = 48 * 3600 * 1000;
  const elapsedMs = now.getTime() - deliveredDate.getTime();
  const remainingMs = expiryDate.getTime() - now.getTime();

  const isExpired = remainingMs <= 0;
  const isActive = !isExpired && elapsedMs >= 0;

  const totalRemainingMinutes = Math.max(0, Math.floor(remainingMs / (1000 * 60)));
  const hoursRemaining = Math.floor(totalRemainingMinutes / 60);
  const minutesRemaining = totalRemainingMinutes % 60;

  const percentElapsed = Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)));

  const pad = (n: number) => n.toString().padStart(2, "0");
  const formattedCountdown = isExpired
    ? "Inspection Completed (Auto-Settled)"
    : `${hoursRemaining}h ${pad(minutesRemaining)}m remaining`;

  return {
    isActive,
    isExpired,
    hoursRemaining,
    minutesRemaining,
    formattedCountdown,
    deliveredDateFormatted: deliveredDate.toLocaleString("id-ID"),
    expiryDateFormatted: expiryDate.toLocaleString("id-ID"),
    percentElapsed,
  };
}

/**
 * Checks if a sub-order is eligible for automated settlement release to merchant wallet.
 */
export function shouldAutoSettle(subOrder: SubOrder): boolean {
  if (subOrder.status !== "DELIVERED_INSPECTION_48H") return false;
  if (!subOrder.inspectionExpiresAt) return false;

  const expiry = new Date(subOrder.inspectionExpiresAt);
  const now = new Date();
  return now.getTime() >= expiry.getTime();
}
