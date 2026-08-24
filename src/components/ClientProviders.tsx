"use client";

import { LanguageProvider } from "@/context/LanguageContext";
import { LocationProvider } from "@/context/LocationContext";
import { CartProvider } from "@/context/CartContext";
import { AdminDataProvider } from "@/context/AdminDataContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <LocationProvider>
      <LanguageProvider>
        <CartProvider>
          <AdminDataProvider>{children}</AdminDataProvider>
        </CartProvider>
      </LanguageProvider>
    </LocationProvider>
  );
}
