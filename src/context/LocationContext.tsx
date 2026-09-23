"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  CurrencyCode,
  COUNTRY_CURRENCY_MAP,
  formatCurrency,
  convertCurrency,
  calculatePlatformFee,
  PriceFormatOptions,
  ConvertedPriceResult,
  PlatformFeeCalculation,
} from "@/lib/currency";

interface LocationContextType {
  location: string;
  currency: CurrencyCode;
  setLocation: (loc: string) => void;
  setCurrency: (curr: CurrencyCode) => void;
  formatPrice: (priceInUSD: number, options?: PriceFormatOptions) => string;
  convertPrice: (amount: number, from?: CurrencyCode, to?: CurrencyCode) => ConvertedPriceResult;
  calculateFees: (subtotal: number, options?: { includeInsurance?: boolean }) => PlatformFeeCalculation;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<string>("Indonesia");
  const [currency, setCurrencyState] = useState<CurrencyCode>("IDR");

  useEffect(() => {
    // Read from localStorage on mount and when event fires
    const loadLocation = () => {
      const explicitCurrency = (localStorage.getItem("tonalzone_currency") || localStorage.getItem("tonalzone_seller_currency")) as CurrencyCode | null;
      if (explicitCurrency) {
        setCurrencyState(explicitCurrency);
      }

      const stored = localStorage.getItem("tonalzone_user");
      if (stored) {
        try {
          const user = JSON.parse(stored);
          if (user.location) {
            setLocationState(user.location);
            if (!explicitCurrency) {
              const mappedCurrency = COUNTRY_CURRENCY_MAP[user.location] || "IDR";
              setCurrencyState(mappedCurrency);
            }
          }
        } catch (e) {
          console.error("Failed to parse user location", e);
        }
      }
    };

    loadLocation();

    // Listen for login/signup changes and storage events
    window.addEventListener("userLoginChange", loadLocation);
    window.addEventListener("storage", loadLocation);
    return () => {
      window.removeEventListener("userLoginChange", loadLocation);
      window.removeEventListener("storage", loadLocation);
    };
  }, []);

  const setLocation = (loc: string) => {
    setLocationState(loc);
    const mapped = COUNTRY_CURRENCY_MAP[loc] || "IDR";
    setCurrencyState(mapped);
    localStorage.setItem("tonalzone_currency", mapped);
  };

  const setCurrency = (curr: CurrencyCode) => {
    setCurrencyState(curr);
    localStorage.setItem("tonalzone_currency", curr);
    localStorage.setItem("tonalzone_seller_currency", curr);
    window.dispatchEvent(new Event("storage"));
  };

  const formatPrice = (priceInUSD: number, options?: PriceFormatOptions) => {
    if (currency === "USD") {
      return formatCurrency(priceInUSD, "USD", options);
    }
    const converted = convertCurrency(priceInUSD, "USD", currency);
    return formatCurrency(converted.convertedAmount, currency, options);
  };

  const convertPrice = (
    amount: number,
    from: CurrencyCode = "USD",
    to: CurrencyCode = currency
  ): ConvertedPriceResult => {
    return convertCurrency(amount, from, to);
  };

  const calculateFees = (
    subtotal: number,
    options?: { includeInsurance?: boolean }
  ): PlatformFeeCalculation => {
    return calculatePlatformFee(subtotal, currency, options);
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        currency,
        setLocation,
        setCurrency,
        formatPrice,
        convertPrice,
        calculateFees,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
