"use client";

import { LanguageProvider } from "@/context/LanguageContext";
import { LocationProvider } from "@/context/LocationContext";
import { CartProvider } from "@/context/CartContext";
import { NotificationProvider } from "@/context/NotificationContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <LocationProvider>
      <LanguageProvider>
        <CartProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </CartProvider>
      </LanguageProvider>
    </LocationProvider>
  );
}
