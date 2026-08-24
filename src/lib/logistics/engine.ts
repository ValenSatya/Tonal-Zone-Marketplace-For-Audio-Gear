import {
  AudioItemForLogistics,
  SingleStoreLogisticsResult,
  MultiVendorLogisticsResult,
  CourierCode,
} from "./types";
import { calculatePackageDimensions } from "./dimensions";
import { calculateAudiophileInsurance } from "./insurance";
import { resolveCityZone, buildCourierQuotes } from "./rates";

/**
 * Calculates complete shipping and insurance quotes for a single merchant/store origin.
 */
export function calculateStoreShipping(params: {
  storeId?: string;
  storeName?: string;
  originCity: string;
  destinationCity: string;
  items: AudioItemForLogistics[];
  forceWoodPacking?: boolean;
}): SingleStoreLogisticsResult {
  const { storeId, storeName, originCity, destinationCity, items, forceWoodPacking } = params;

  const originZone = resolveCityZone(originCity);
  const destinationZone = resolveCityZone(destinationCity);

  const packageSummary = calculatePackageDimensions(items);
  const insuranceBreakdown = calculateAudiophileInsurance(items, { forceWoodPacking });

  const courierOptions = buildCourierQuotes(
    originZone,
    destinationZone,
    packageSummary.billableWeightKg,
    insuranceBreakdown
  );

  return {
    storeId,
    storeName: storeName || "TonalZone Authorized Merchant",
    originCity,
    originZone,
    destinationCity,
    destinationZone,
    packageSummary,
    courierOptions,
  };
}

/**
 * Multi-Vendor Split-Shipment Calculator
 * Groups cart items per merchant store, calculates shipping for each origin independently,
 * and sums up platform grand totals.
 */
export function calculateMultiVendorShipping(params: {
  destinationCity: string;
  destinationCountry?: string;
  storeOrders: Array<{
    storeId: string;
    storeName: string;
    originCity: string;
    items: AudioItemForLogistics[];
    forceWoodPacking?: boolean;
  }>;
}): MultiVendorLogisticsResult {
  const { destinationCity, destinationCountry = "Indonesia", storeOrders } = params;

  const storeResults: SingleStoreLogisticsResult[] = [];
  let grandTotalShippingUSD = 0;
  let grandTotalShippingIDR = 0;
  let grandTotalInsuranceUSD = 0;
  let grandTotalInsuranceIDR = 0;

  for (const order of storeOrders) {
    const quote = calculateStoreShipping({
      storeId: order.storeId,
      storeName: order.storeName,
      originCity: order.originCity,
      destinationCity,
      items: order.items,
      forceWoodPacking: order.forceWoodPacking,
    });

    storeResults.push(quote);

    // Pick recommended/default regular option for grand total estimation
    const defaultOption = quote.courierOptions[0];
    if (defaultOption) {
      grandTotalShippingUSD += defaultOption.shippingFeeUSD;
      grandTotalShippingIDR += defaultOption.shippingFeeIDR;
      grandTotalInsuranceUSD += defaultOption.insuranceBreakdown.totalProtectionUSD;
      grandTotalInsuranceIDR += defaultOption.insuranceBreakdown.totalProtectionIDR;
    }
  }

  return {
    destinationCity,
    destinationCountry,
    stores: storeResults,
    grandTotalShippingUSD: Math.round(grandTotalShippingUSD * 100) / 100,
    grandTotalShippingIDR,
    grandTotalInsuranceUSD: Math.round(grandTotalInsuranceUSD * 100) / 100,
    grandTotalInsuranceIDR,
  };
}

/**
 * Generates realistic real-time tracking checkpoints simulator for audiophile orders
 */
export function generateAudiophileTrackingMilestones(
  courierCode: CourierCode,
  waybillNumber: string,
  originCity: string,
  destinationCity: string
) {
  const now = new Date();

  const timeOffset = (hoursAgo: number) => {
    const d = new Date(now.getTime() - hoursAgo * 3600 * 1000);
    return d.toISOString().replace("T", " ").substring(0, 16);
  };

  return [
    {
      timestamp: timeOffset(24),
      status: "PICKED_UP",
      location: `${originCity} Merchant Hub`,
      description: `Package picked up by ${courierCode} courier. Audiophile driver acoustic seal verified.`,
    },
    {
      timestamp: timeOffset(18),
      status: "SORTING_HUB",
      location: `${originCity} Air Cargo Hub`,
      description: "Passed fragility optical scanner and dimensional weight classification.",
    },
    {
      timestamp: timeOffset(8),
      status: "IN_TRANSIT",
      location: `Transit Gateway -> ${destinationCity}`,
      description: "Dispatched via secure climate-controlled air cargo line.",
    },
    {
      timestamp: timeOffset(2),
      status: "OUT_FOR_DELIVERY",
      location: `${destinationCity} Local Delivery Hub`,
      description: `With courier on delivery route to recipient address (Waybill: ${waybillNumber}).`,
    },
  ];
}
