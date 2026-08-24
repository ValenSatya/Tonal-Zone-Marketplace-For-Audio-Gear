import {
  CartItemCheckoutInput,
  ParentOrder,
  SubOrder,
  SubOrderItem,
  PaymentMethod,
  EscrowStatus,
} from "./types";
import { calculateStoreShipping } from "@/lib/logistics";
import { CourierCode, ServiceTier } from "@/lib/logistics/types";
import { BASELINE_RATES } from "@/lib/currency";

const IDR_RATE = BASELINE_RATES.IDR || 16000;
const PLATFORM_FEE_PERCENT = 0.02; // 2.0% Escrow Platform Fee
const MIDTRANS_GATEWAY_FEE_IDR = 4500; // Rp 4.500

/**
 * Splits a single shopping cart checkout into segregated Sub-Orders grouped by Merchant/Store.
 */
export function splitOrderForCheckout(params: {
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  destinationAddress: string;
  destinationCity: string;
  destinationPostalCode: string;
  paymentMethod: PaymentMethod;
  cartItems: CartItemCheckoutInput[];
  storeCourierSelections?: Record<string, { courierCode: CourierCode; serviceTier: ServiceTier }>;
}): ParentOrder {
  const {
    buyerId,
    buyerName,
    buyerEmail,
    buyerPhone,
    destinationAddress,
    destinationCity,
    destinationPostalCode,
    paymentMethod,
    cartItems,
    storeCourierSelections = {},
  } = params;

  // 1. Group cart items by storeId
  const storeGroups = new Map<string, CartItemCheckoutInput[]>();
  for (const item of cartItems) {
    const existing = storeGroups.get(item.storeId) || [];
    existing.push(item);
    storeGroups.set(item.storeId, existing);
  }

  const now = new Date();
  const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomSalt = Math.floor(1000 + Math.random() * 9000);
  const parentOrderId = `TZ-${dateStamp}-${randomSalt}`;

  const subOrders: SubOrder[] = [];
  let totalGrossUSD = 0;
  let totalGrossIDR = 0;
  let totalShippingIDR = 0;
  let totalInsuranceIDR = 0;
  let totalItemsCount = 0;

  // 2. Process each store group independently
  let storeIndex = 1;
  for (const [storeId, items] of storeGroups.entries()) {
    const firstItem = items[0];
    const storeName = firstItem.storeName || "TonalZone Partner Merchant";
    const originCity = firstItem.storeCity || "Jakarta Selatan";

    // Transform items for logistics & financials
    let storeItemsSubtotalUSD = 0;
    let storeItemsSubtotalIDR = 0;

    const subOrderItems: SubOrderItem[] = items.map((it) => {
      const priceUSD = it.priceUSD;
      const priceIDR = it.priceIDR || Math.round(priceUSD * IDR_RATE);
      const itemTotalUSD = priceUSD * it.quantity;
      const itemTotalIDR = priceIDR * it.quantity;

      storeItemsSubtotalUSD += itemTotalUSD;
      storeItemsSubtotalIDR += itemTotalIDR;
      totalItemsCount += it.quantity;

      return {
        productId: it.productId,
        productName: it.productName,
        brand: it.brand,
        category: it.category,
        priceUSD,
        priceIDR,
        quantity: it.quantity,
        selectedVariant: it.selectedVariant,
        image: it.image,
        itemTotalUSD,
        itemTotalIDR,
      };
    });

    // Calculate shipping & insurance for this store's origin -> buyer's destination
    const logistics = calculateStoreShipping({
      storeId,
      storeName,
      originCity,
      destinationCity,
      items: items.map((it) => ({
        id: it.productId,
        name: it.productName,
        category: it.category,
        priceUSD: it.priceUSD,
        quantity: it.quantity,
      })),
    });

    // Selected courier or default recommended
    const userSelected = storeCourierSelections[storeId];
    const chosenCourier =
      logistics.courierOptions.find(
        (c) =>
          c.courierCode === userSelected?.courierCode &&
          c.serviceTier === userSelected?.serviceTier
      ) || logistics.courierOptions[0];

    const shippingFeeUSD = chosenCourier ? chosenCourier.shippingFeeUSD : 2.0;
    const shippingFeeIDR = chosenCourier ? chosenCourier.shippingFeeIDR : 32000;
    const insuranceFeeUSD = chosenCourier ? chosenCourier.insuranceBreakdown.totalProtectionUSD : 1.0;
    const insuranceFeeIDR = chosenCourier ? chosenCourier.insuranceBreakdown.totalProtectionIDR : 16000;

    // Sub-order totals
    const grossAmountUSD = Math.round((storeItemsSubtotalUSD + shippingFeeUSD + insuranceFeeUSD) * 100) / 100;
    const grossAmountIDR = storeItemsSubtotalIDR + shippingFeeIDR + insuranceFeeIDR;

    // Platform Escrow Deductions (2.0% of items subtotal)
    const platformFeeUSD = Math.round(storeItemsSubtotalUSD * PLATFORM_FEE_PERCENT * 100) / 100;
    const platformFeeIDR = Math.round(storeItemsSubtotalIDR * PLATFORM_FEE_PERCENT);

    const netSellerPayoutUSD = Math.round((grossAmountUSD - platformFeeUSD) * 100) / 100;
    const netSellerPayoutIDR = grossAmountIDR - platformFeeIDR;

    const subOrderId = `SUB-${storeName.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, "TZ")}-${randomSalt}-${storeIndex}`;
    storeIndex++;

    subOrders.push({
      id: subOrderId,
      parentOrderId,
      storeId,
      storeName,
      originCity,
      items: subOrderItems,
      itemsSubtotalUSD: storeItemsSubtotalUSD,
      itemsSubtotalIDR: storeItemsSubtotalIDR,
      shippingFeeUSD,
      shippingFeeIDR,
      insuranceFeeUSD,
      insuranceFeeIDR,
      grossAmountUSD,
      grossAmountIDR,
      platformFeePercent: PLATFORM_FEE_PERCENT,
      platformFeeUSD,
      platformFeeIDR,
      netSellerPayoutUSD,
      netSellerPayoutIDR,
      courierCode: chosenCourier?.courierCode || "JNE",
      serviceTier: chosenCourier?.serviceTier || "REGULAR",
      status: "PAYMENT_PENDING" as EscrowStatus,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    totalGrossUSD += grossAmountUSD;
    totalGrossIDR += grossAmountIDR;
    totalShippingIDR += shippingFeeIDR;
    totalInsuranceIDR += insuranceFeeIDR;
  }

  // Add Midtrans Payment Gateway Admin Fee (Rp 4.500 / $0.30 USD)
  const paymentGatewayFeeUSD = 0.3;
  totalGrossUSD = Math.round((totalGrossUSD + paymentGatewayFeeUSD) * 100) / 100;
  totalGrossIDR += MIDTRANS_GATEWAY_FEE_IDR;

  return {
    id: parentOrderId,
    buyerId,
    buyerName,
    buyerEmail,
    buyerPhone,
    destinationAddress,
    destinationCity,
    destinationPostalCode,
    subOrders,
    totalItemsCount,
    totalGrossAmountUSD: totalGrossUSD,
    totalGrossAmountIDR: totalGrossIDR,
    totalShippingFeeIDR: totalShippingIDR,
    totalInsuranceFeeIDR: totalInsuranceIDR,
    paymentGatewayFeeIDR: MIDTRANS_GATEWAY_FEE_IDR,
    paymentMethod,
    overallStatus: "PAYMENT_PENDING",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}
