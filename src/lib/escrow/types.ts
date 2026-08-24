import { CourierCode, ServiceTier } from "@/lib/logistics/types";

export type EscrowStatus =
  | "PAYMENT_PENDING"         // Awaiting payment in Midtrans
  | "ESCROW_HOLDING"          // Paid by buyer, funds locked in TonalZone Rekber
  | "DISPATCHED"              // Merchant has packed and provided waybill number
  | "IN_TRANSIT"              // Courier has picked up, traveling to buyer
  | "DELIVERED_INSPECTION_48H"// Delivered, 48-hour acoustic inspection timer running
  | "SETTLED_TO_SELLER"       // Inspection completed/auto-released, funds in seller wallet
  | "DISPUTE_ACTIVE"          // Buyer opened acoustic defect complaint, mediation in progress
  | "REFUNDED_TO_BUYER"       // Dispute resolved, funds returned to buyer
  | "CANCELLED";              // Order cancelled before payment or dispatch

export type PaymentMethod =
  | "MIDTRANS_QRIS"
  | "MIDTRANS_BCA_VA"
  | "MIDTRANS_MANDIRI_VA"
  | "MIDTRANS_BNI_VA"
  | "MIDTRANS_BRI_VA"
  | "MIDTRANS_GOPAY"
  | "MIDTRANS_CREDIT_CARD"
  | "SANDBOX_MOCK_PAYMENT";

export interface CartItemCheckoutInput {
  productId: string;
  productName: string;
  brand: string;
  category?: string;
  storeId: string;
  storeName: string;
  storeCity: string;
  priceUSD: number;
  priceIDR?: number;
  quantity: number;
  selectedVariant?: string;
  image?: string;
}

export interface SubOrderItem {
  productId: string;
  productName: string;
  brand: string;
  category?: string;
  priceUSD: number;
  priceIDR: number;
  quantity: number;
  selectedVariant?: string;
  image?: string;
  itemTotalUSD: number;
  itemTotalIDR: number;
}

export interface SubOrder {
  id: string; // e.g. "SUB-STORE1-9821"
  parentOrderId: string; // e.g. "TZ-20260820-8812"
  storeId: string;
  storeName: string;
  originCity: string;
  items: SubOrderItem[];
  
  // Financials per Store
  itemsSubtotalUSD: number;
  itemsSubtotalIDR: number;
  shippingFeeUSD: number;
  shippingFeeIDR: number;
  insuranceFeeUSD: number;
  insuranceFeeIDR: number;
  grossAmountUSD: number;
  grossAmountIDR: number;
  
  // Platform Escrow Deductions
  platformFeePercent: number; // 2.0%
  platformFeeUSD: number;
  platformFeeIDR: number;
  netSellerPayoutUSD: number; // gross - platformFee
  netSellerPayoutIDR: number;

  // Logistics & Delivery
  courierCode: CourierCode;
  serviceTier: ServiceTier;
  waybillNumber?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  inspectionExpiresAt?: string; // deliveredAt + 48 hours

  // State
  status: EscrowStatus;
  disputeReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParentOrder {
  id: string; // e.g. "TZ-20260820-8812"
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  destinationAddress: string;
  destinationCity: string;
  destinationPostalCode: string;
  
  // Aggregate Totals across all stores
  subOrders: SubOrder[];
  totalItemsCount: number;
  totalGrossAmountUSD: number;
  totalGrossAmountIDR: number;
  totalShippingFeeIDR: number;
  totalInsuranceFeeIDR: number;
  paymentGatewayFeeIDR: number; // Rp 4.500

  // Payment Gateway
  paymentMethod: PaymentMethod;
  midtransSnapToken?: string;
  midtransRedirectUrl?: string;
  midtransTransactionId?: string;
  paidAt?: string;

  // Lifecycle
  overallStatus: EscrowStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MidtransWebhookPayload {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: "capture" | "settlement" | "pending" | "deny" | "cancel" | "expire" | "refund";
  fraud_status?: "accept" | "deny" | "challenge";
  payment_type?: string;
  transaction_id?: string;
  settlement_time?: string;
  transaction_time?: string;
}

export interface WalletLedgerEntry {
  id: string;
  storeId: string;
  subOrderId?: string;
  type:
    | "ESCROW_INFLOW"            // Dana rekber masuk (tertahan)
    | "ESCROW_SETTLEMENT"        // Selesai inspeksi 48h -> cair ke saldo
    | "PLATFORM_FEE_DEDUCTION"   // Potongan admin rekber 2%
    | "WITHDRAWAL_DISBURSEMENT"  // Penarikan dana ke rekening bank
    | "BUYER_REFUND";            // Pengembalian dana komplain
  amountUSD: number;
  amountIDR: number;
  balanceAfterIDR: number;
  notes: string;
  createdAt: string;
}

export interface StoreWalletSummary {
  storeId: string;
  availableBalanceUSD: number;
  availableBalanceIDR: number;
  inEscrowHoldingUSD: number;
  inEscrowHoldingIDR: number;
  lifetimeDisbursedUSD: number;
  lifetimeDisbursedIDR: number;
  recentLedger: WalletLedgerEntry[];
}
