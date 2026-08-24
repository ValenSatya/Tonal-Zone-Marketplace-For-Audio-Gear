export type CurrencyCode = "USD" | "IDR" | "SGD" | "MYR" | "JPY" | "EUR" | "GBP";

export interface ExchangeRateTable {
  baseCurrency: "USD";
  timestamp: number;
  rates: Record<CurrencyCode, number>;
}

export interface PriceFormatOptions {
  locale?: string;
  showSymbol?: boolean;
  showCode?: boolean;
  compact?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export interface ConvertedPriceResult {
  originalAmount: number;
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  rate: number;
  convertedAmount: number;
  formatted: string;
}

export interface PlatformFeeCalculation {
  currency: CurrencyCode;
  subtotal: number;
  escrowFeeRate: number; // e.g. 0.025 (2.5%)
  escrowFee: number;
  paymentGatewayFee: number; // e.g. fixed Rp 4.500 or $0.30
  insuranceFee: number;
  grandTotal: number;
  formattedSubtotal: string;
  formattedEscrowFee: string;
  formattedTotal: string;
}
