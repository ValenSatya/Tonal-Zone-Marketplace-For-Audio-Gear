import {
  CurrencyCode,
  PriceFormatOptions,
  ConvertedPriceResult,
  PlatformFeeCalculation,
} from "./types";

/**
 * Standard baseline exchange rates against base USD.
 */
export const BASELINE_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  IDR: 16000,
  SGD: 1.35,
  MYR: 4.70,
  JPY: 155,
  EUR: 0.92,
  GBP: 0.79,
};

export const COUNTRY_CURRENCY_MAP: Record<string, CurrencyCode> = {
  "United States": "USD",
  "USA": "USD",
  "Indonesia": "IDR",
  "ID": "IDR",
  "Singapore": "SGD",
  "SG": "SGD",
  "Malaysia": "MYR",
  "MY": "MYR",
  "Japan": "JPY",
  "JP": "JPY",
  "Germany": "EUR",
  "France": "EUR",
  "United Kingdom": "GBP",
  "UK": "GBP",
};

interface CurrencyMetadata {
  symbol: string;
  symbolPosition: "prefix" | "suffix";
  decimalDigits: number;
  thousandsSeparator: string;
  decimalSeparator: string;
}

export const CURRENCY_METADATA: Record<CurrencyCode, CurrencyMetadata> = {
  USD: {
    symbol: "$",
    symbolPosition: "prefix",
    decimalDigits: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
  IDR: {
    symbol: "Rp ",
    symbolPosition: "prefix",
    decimalDigits: 0,
    thousandsSeparator: ".",
    decimalSeparator: ",",
  },
  SGD: {
    symbol: "S$",
    symbolPosition: "prefix",
    decimalDigits: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
  MYR: {
    symbol: "RM ",
    symbolPosition: "prefix",
    decimalDigits: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
  JPY: {
    symbol: "¥",
    symbolPosition: "prefix",
    decimalDigits: 0,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
  EUR: {
    symbol: "€",
    symbolPosition: "prefix",
    decimalDigits: 2,
    thousandsSeparator: ".",
    decimalSeparator: ",",
  },
  GBP: {
    symbol: "£",
    symbolPosition: "prefix",
    decimalDigits: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
  },
};

/**
 * Get exchange rate between two currencies.
 */
export function getExchangeRate(
  from: CurrencyCode,
  to: CurrencyCode,
  customRates?: Partial<Record<CurrencyCode, number>>
): number {
  if (from === to) return 1;
  const rates = { ...BASELINE_RATES, ...customRates };
  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;
  return toRate / fromRate;
}

/**
 * Convert any amount from one currency to another with high precision.
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  customRates?: Partial<Record<CurrencyCode, number>>
): ConvertedPriceResult {
  const rate = getExchangeRate(from, to, customRates);
  const converted = amount * rate;
  const meta = CURRENCY_METADATA[to] || CURRENCY_METADATA.USD;

  // Rounding based on currency rules
  const rounded =
    meta.decimalDigits === 0
      ? Math.round(converted)
      : Math.round(converted * 100) / 100;

  return {
    originalAmount: amount,
    fromCurrency: from,
    toCurrency: to,
    rate,
    convertedAmount: rounded,
    formatted: formatCurrency(rounded, to),
  };
}

/**
 * Normalizes any price to base USD.
 */
export function normalizeToUSD(amount: number, fromCurrency: CurrencyCode): number {
  if (fromCurrency === "USD") return amount;
  const rate = BASELINE_RATES[fromCurrency] || 1;
  return Math.round((amount / rate) * 100) / 100;
}

/**
 * Converts a base USD amount to target currency.
 */
export function convertFromUSD(amountUSD: number, targetCurrency: CurrencyCode): number {
  if (targetCurrency === "USD") return amountUSD;
  const rate = BASELINE_RATES[targetCurrency] || 1;
  const converted = amountUSD * rate;
  return CURRENCY_METADATA[targetCurrency]?.decimalDigits === 0
    ? Math.round(converted)
    : Math.round(converted * 100) / 100;
}

/**
 * Format any currency value consistently across the platform.
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = "USD",
  options?: PriceFormatOptions
): string {
  const meta = CURRENCY_METADATA[currency] || CURRENCY_METADATA.USD;
  const digits = options?.minimumFractionDigits ?? meta.decimalDigits;

  if (isNaN(amount)) return `${meta.symbol}0`;

  let formattedNumber = "";

  if (currency === "IDR") {
    // IDR standard: Rp 4.990.000 (No decimals)
    const rounded = Math.round(amount);
    formattedNumber = rounded
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `Rp ${formattedNumber}`;
  }

  if (currency === "JPY") {
    const rounded = Math.round(amount);
    formattedNumber = rounded.toLocaleString("ja-JP");
    return `¥${formattedNumber}`;
  }

  if (currency === "SGD") {
    formattedNumber = amount.toLocaleString("en-SG", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    return `S$${formattedNumber}`;
  }

  if (currency === "MYR") {
    formattedNumber = amount.toLocaleString("en-MY", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    return `RM ${formattedNumber}`;
  }

  if (currency === "EUR") {
    formattedNumber = amount.toLocaleString("de-DE", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    return `€${formattedNumber}`;
  }

  if (currency === "GBP") {
    formattedNumber = amount.toLocaleString("en-GB", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    return `£${formattedNumber}`;
  }

  // Default USD
  formattedNumber = amount.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `$${formattedNumber}`;
}

/**
 * Comprehensive fee calculator for escrow transactions, payment gateways, and insurance.
 */
export function calculatePlatformFee(
  subtotal: number,
  currency: CurrencyCode = "USD",
  options?: {
    escrowRate?: number; // default 0.02 (2%)
    includeInsurance?: boolean;
    insuranceRate?: number; // default 0.002 (0.2%)
  }
): PlatformFeeCalculation {
  const escrowRate = options?.escrowRate ?? 0.02;
  const insuranceRate = options?.includeInsurance ? options.insuranceRate ?? 0.002 : 0;

  const escrowFee = subtotal * escrowRate;
  const insuranceFee = subtotal * insuranceRate;

  // Fixed Gateway fee: Rp 4.500 in IDR or $0.30 in USD
  const paymentGatewayFee = currency === "IDR" ? 4500 : convertFromUSD(0.3, currency);

  const grandTotal = subtotal + escrowFee + paymentGatewayFee + insuranceFee;

  return {
    currency,
    subtotal,
    escrowFeeRate: escrowRate,
    escrowFee: Math.round(escrowFee),
    paymentGatewayFee: Math.round(paymentGatewayFee),
    insuranceFee: Math.round(insuranceFee),
    grandTotal: Math.round(grandTotal),
    formattedSubtotal: formatCurrency(subtotal, currency),
    formattedEscrowFee: formatCurrency(escrowFee, currency),
    formattedTotal: formatCurrency(grandTotal, currency),
  };
}

/**
 * Parses user string input into a clean numeric value.
 */
export function parseCurrencyInput(input: string): number {
  if (!input) return 0;
  // Remove symbols and keep numbers, dots, and commas
  const cleaned = input.replace(/[^0-9.,]/g, "").trim();
  if (!cleaned) return 0;

  // Handle dot thousands with comma decimal (European/Indonesian) or standard US
  if (cleaned.includes(".") && cleaned.includes(",")) {
    if (cleaned.indexOf(".") < cleaned.indexOf(",")) {
      // European/ID format: 1.500,50 -> 1500.50
      return parseFloat(cleaned.replace(/\./g, "").replace(",", ".")) || 0;
    } else {
      // US format: 1,500.50 -> 1500.50
      return parseFloat(cleaned.replace(/,/g, "")) || 0;
    }
  }

  // Single separator
  if (cleaned.includes(".")) {
    const parts = cleaned.split(".");
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      // Thousand separator without decimal
      return parseFloat(cleaned.replace(/\./g, "")) || 0;
    }
    return parseFloat(cleaned) || 0;
  }

  if (cleaned.includes(",")) {
    return parseFloat(cleaned.replace(/,/g, "")) || 0;
  }

  return parseFloat(cleaned) || 0;
}
