import { PackageDimensions, AudioItemForLogistics } from "./types";

interface CategoryDimensionPreset {
  weightGram: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  fragileIndex: "LOW" | "MEDIUM" | "HIGH" | "ULTRA_FRAGILE";
}

/**
 * Standard physical dimensional presets for audiophile equipment packaging
 */
export const AUDIO_DIMENSION_PRESETS: Record<string, CategoryDimensionPreset> = {
  "IN-EAR MONITORS": {
    weightGram: 300,
    lengthCm: 15,
    widthCm: 11,
    heightCm: 6,
    fragileIndex: "MEDIUM",
  },
  "HEADPHONES": {
    weightGram: 900,
    lengthCm: 28,
    widthCm: 22,
    heightCm: 14,
    fragileIndex: "HIGH",
  },
  "DAC/AMP": {
    weightGram: 2400,
    lengthCm: 32,
    widthCm: 25,
    heightCm: 16,
    fragileIndex: "ULTRA_FRAGILE", // Contains tubes, precision PCB, glass windows
  },
  "DIGITAL AUDIO PLAYERS": {
    weightGram: 500,
    lengthCm: 18,
    widthCm: 12,
    heightCm: 6,
    fragileIndex: "HIGH",
  },
  "CABLES & ADAPTERS": {
    weightGram: 180,
    lengthCm: 14,
    widthCm: 10,
    heightCm: 4,
    fragileIndex: "LOW",
  },
  "STUDIO MONITORS": {
    weightGram: 6800,
    lengthCm: 42,
    widthCm: 34,
    heightCm: 30,
    fragileIndex: "ULTRA_FRAGILE",
  },
  "ACCESSORIES": {
    weightGram: 100,
    lengthCm: 10,
    widthCm: 8,
    heightCm: 3,
    fragileIndex: "LOW",
  },
};

/**
 * Computes volumetric weight according to standard logistics formula: (L x W x H) / 6000
 * and determines the actual billable weight in Kilograms (minimum 1 kg).
 */
export function calculatePackageDimensions(
  items: AudioItemForLogistics[]
): PackageDimensions {
  let totalActualGrams = 0;
  let totalVolumeCm3 = 0;

  for (const item of items) {
    const qty = Math.max(1, item.quantity || 1);
    const categoryKey = (item.category || "IN-EAR MONITORS").toUpperCase();
    const preset = AUDIO_DIMENSION_PRESETS[categoryKey] || AUDIO_DIMENSION_PRESETS["IN-EAR MONITORS"];

    const weightGrams = item.customWeightGrams ?? preset.weightGram;
    const lengthCm = item.customDimensions?.lengthCm ?? preset.lengthCm;
    const widthCm = item.customDimensions?.widthCm ?? preset.widthCm;
    const heightCm = item.customDimensions?.heightCm ?? preset.heightCm;

    totalActualGrams += weightGrams * qty;
    totalVolumeCm3 += lengthCm * widthCm * heightCm * qty;
  }

  // Volumetric weight formula: Volume / 6000 (standard for air & express couriers)
  const volumetricGrams = Math.round((totalVolumeCm3 / 6000) * 1000);

  // Billable weight is the greater of actual weight or volumetric weight
  const billableGrams = Math.max(totalActualGrams, volumetricGrams);
  const billableWeightKg = Math.max(1, Math.ceil(billableGrams / 1000));

  // Estimate effective single outer carton bounding box (cube root approximation)
  const effectiveDim = Math.max(10, Math.ceil(Math.cbrt(totalVolumeCm3)));

  return {
    lengthCm: effectiveDim,
    widthCm: effectiveDim,
    heightCm: Math.ceil(totalVolumeCm3 / (effectiveDim * effectiveDim)),
    actualWeightGrams: totalActualGrams,
    volumetricWeightGrams: volumetricGrams,
    billableWeightKg,
  };
}
