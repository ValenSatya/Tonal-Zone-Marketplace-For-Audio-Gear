"use client";

import { LanguageProvider } from "@/context/LanguageContext";
import { LocationProvider } from "@/context/LocationContext";
import { CartProvider } from "@/context/CartContext";
import { AdminDataProvider } from "@/context/AdminDataContext";
import { NotificationProvider } from "@/context/NotificationContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <LocationProvider>
      <LanguageProvider>
        <CartProvider>
          <NotificationProvider>
            <AdminDataProvider>{children}</AdminDataProvider>
          </NotificationProvider>
        </CartProvider>
      </LanguageProvider>
    </LocationProvider>
  );
}
