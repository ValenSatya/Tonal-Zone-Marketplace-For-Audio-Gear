export type CourierCode = "JNE" | "SICEPAT" | "JNT" | "DHL" | "GOSEND";

export type ServiceTier = "REGULAR" | "NEXT_DAY" | "SAME_DAY" | "CARGO" | "INTERNATIONAL";

export type IndonesianZone =
  | "JABODETABEK"
  | "JAVA_MAJOR_CITY"
  | "JAVA_INNER"
  | "BALI_LOMBOK"
  | "SUMATRA"
  | "KALIMANTAN"
  | "SULAWESI"
  | "MALUKU_PAPUA"
  | "INTERNATIONAL";

export interface PackageDimensions {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  actualWeightGrams: number;
  volumetricWeightGrams: number;
  billableWeightKg: number;
}

export interface AudioItemForLogistics {
  id?: string;
  name: string;
  category?: string;
  priceUSD: number;
  quantity: number;
  customWeightGrams?: number;
  customDimensions?: { lengthCm: number; widthCm: number; heightCm: number };
}

export interface InsuranceBreakdown {
  declaredValueUSD: number;
  declaredValueIDR: number;
  insuranceRatePercent: number; // e.g. 0.2%
  insuranceFeeUSD: number;
  insuranceFeeIDR: number;
  woodPackingRequired: boolean;
  woodPackingFeeUSD: number;
  woodPackingFeeIDR: number;
  totalProtectionUSD: number;
  totalProtectionIDR: number;
  policyNotes: string;
}

export interface CourierOptionQuote {
  courierCode: CourierCode;
  courierName: string;
  serviceTier: ServiceTier;
  serviceName: string;
  estimatedDays: string;
  shippingFeeUSD: number;
  shippingFeeIDR: number;
  insuranceBreakdown: InsuranceBreakdown;
  totalWithInsuranceUSD: number;
  totalWithInsuranceIDR: number;
  trackingSupported: boolean;
}

export interface SingleStoreLogisticsResult {
  storeId?: string;
  storeName?: string;
  originCity: string;
  originZone: IndonesianZone;
  destinationCity: string;
  destinationZone: IndonesianZone;
  packageSummary: PackageDimensions;
  courierOptions: CourierOptionQuote[];
}

export interface MultiVendorLogisticsResult {
  destinationCity: string;
  destinationCountry: string;
  stores: SingleStoreLogisticsResult[];
  grandTotalShippingUSD: number;
  grandTotalShippingIDR: number;
  grandTotalInsuranceUSD: number;
  grandTotalInsuranceIDR: number;
}
