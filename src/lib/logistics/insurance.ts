import { InsuranceBreakdown, AudioItemForLogistics } from "./types";
import { BASELINE_RATES } from "@/lib/currency";

const IDR_RATE = BASELINE_RATES.IDR || 16000;

/**
 * Standard Audiophile Fragile Cargo Insurance Calculator
 * - Insurance Premium: 0.2% of declared product value.
 * - Mandatory Admin/Policy fee: Rp 5.000 ($0.32 USD).
 * - Optional / Automatic Wood Packing (Packing Kayu) surcharge for ultra-fragile or heavy items (> 3.5kg or Tube DAC/AMP / Studio Monitors).
 */
export function calculateAudiophileInsurance(
  items: AudioItemForLogistics[],
  options?: {
    forceWoodPacking?: boolean;
    customDeclaredValueUSD?: number;
  }
): InsuranceBreakdown {
  const totalValueUSD =
    options?.customDeclaredValueUSD ??
    items.reduce((sum, it) => sum + (it.priceUSD || 0) * (it.quantity || 1), 0);

  const declaredValueIDR = Math.round(totalValueUSD * IDR_RATE);

  // 0.2% of product value
  const baseInsuranceUSD = Math.round(totalValueUSD * 0.002 * 100) / 100;
  const adminFeeUSD = 0.35; // Rp 5.000
  const insuranceFeeUSD = Math.max(adminFeeUSD, Math.round((baseInsuranceUSD + adminFeeUSD) * 100) / 100);
  const insuranceFeeIDR = Math.round(insuranceFeeUSD * IDR_RATE);

  // Check if wood packing is necessary (Heavy DAC/AMP or Studio Monitors)
  const hasUltraFragileGear = items.some((it) => {
    const cat = (it.category || "").toUpperCase();
    return cat === "DAC/AMP" || cat === "STUDIO MONITORS";
  });

  const totalActualWeightKg = items.reduce(
    (sum, it) => sum + ((it.customWeightGrams || 500) * (it.quantity || 1)) / 1000,
    0
  );

  const woodPackingRequired = Boolean(
    options?.forceWoodPacking || hasUltraFragileGear || totalActualWeightKg >= 3.5
  );

  // Wood packing standard surcharge: Rp 75.000 ($4.70 USD)
  const woodPackingFeeUSD = woodPackingRequired ? 4.70 : 0;
  const woodPackingFeeIDR = woodPackingRequired ? Math.round(woodPackingFeeUSD * IDR_RATE) : 0;

  const totalProtectionUSD = Math.round((insuranceFeeUSD + woodPackingFeeUSD) * 100) / 100;
  const totalProtectionIDR = insuranceFeeIDR + woodPackingFeeIDR;

  const policyNotes = woodPackingRequired
    ? "Includes 100% full replacement value cover + Reinforced acoustic wood crate packing for high-precision components."
    : "Includes 100% full replacement value cover against loss, courier mishandling, and acoustic driver damage.";

  return {
    declaredValueUSD: totalValueUSD,
    declaredValueIDR,
    insuranceRatePercent: 0.2,
    insuranceFeeUSD,
    insuranceFeeIDR,
    woodPackingRequired,
    woodPackingFeeUSD,
    woodPackingFeeIDR,
    totalProtectionUSD,
    totalProtectionIDR,
    policyNotes,
  };
}
