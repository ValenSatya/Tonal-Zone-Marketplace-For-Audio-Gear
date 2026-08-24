"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useLocation } from "@/context/LocationContext";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
      embed: (token: string, options: { embedId: string }) => void;
    };
  }
}

function PaymentGatewayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const method = searchParams?.get("method") || "qr";
  const orderId = searchParams?.get("orderId") || "ORD-90214";
  const snapToken = searchParams?.get("snapToken") || "";
  
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [snapReady, setSnapReady] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real order from API
  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.order) {
            setOrderDetails(data.order);
          }
        })
        .catch((err) => console.error("Error fetching order details:", err));
    }
  }, [orderId]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const { formatPrice } = useLocation();
  const { items, subtotal: cartSubtotal, clearCart } = useCart();
  
  const mainItem = orderDetails?.items?.[0] || items[0] || {
    name: "Sennheiser IE 900 Flagship",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    sellerName: "Bass Audio Official",
    price: 1299,
  };

  const calculatedTotal = orderDetails?.totalAmount || (items.length > 0 ? (cartSubtotal * 0.9 + 15) : 1318.20);
  const isDemoParam = searchParams?.get("isDemo") === "1" || searchParams?.get("demo") === "1";
  const isDemoOrder = isDemoParam || (orderDetails?.totalAmount !== undefined && orderDetails?.totalAmount <= 0.001);

  // Trigger Midtrans Snap Popup
  const openMidtransSnap = useCallback(() => {
    if (typeof window !== "undefined" && window.snap && snapToken) {
      try {
        window.snap.pay(snapToken, {
          onSuccess: async (result) => {
            console.log("Midtrans Snap Success:", result);
            if (orderId) {
              await fetch(`/api/orders/${orderId}/pay`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
              });
            }
            clearCart();
            router.push(`/checkout/success?orderId=${orderId}`);
          },
          onPending: async (result) => {
            console.log("Midtrans Snap Pending:", result);
            clearCart();
            router.push(`/checkout/success?orderId=${orderId}`);
          },
          onError: (error) => {
            console.error("Midtrans Snap Error:", error);
            alert("Pembayaran belum berhasil diselesaikan. Silakan coba kembali.");
          },
          onClose: () => {
            console.log("Customer closed the Snap popup without completing payment");
          },
        });
      } catch (e) {
        console.error("Error invoking window.snap.pay:", e);
      }
    }
  }, [snapToken, orderId, clearCart, router]);

  // Auto trigger Snap when ready if token exists
  useEffect(() => {
    if (snapReady && snapToken && typeof window !== "undefined" && window.snap) {
      const timer = setTimeout(() => {
        openMidtransSnap();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [snapReady, snapToken, openMidtransSnap]);

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      if (orderId) {
        await fetch(`/api/orders/${orderId}/pay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      }
      clearCart();
      router.push(`/checkout/success?orderId=${orderId}`);
    } catch (err) {
      console.error("Error confirming payment:", err);
      clearCart();
      router.push(`/checkout/success?orderId=${orderId}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "Mid-client-fg6vrckoZjVlNofV";
  const snapScriptUrl = isProd
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <div className="min-h-[100svh] bg-[#080808] text-[#FAF9F6] font-sans flex flex-col items-center justify-center p-4 selection:bg-[#D4FF00] selection:text-[#0e0e0e]">
      {/* Official Midtrans Snap Script */}
      <Script
        src={snapScriptUrl}
        data-client-key={clientKey}
        strategy="afterInteractive"
        onLoad={() => setSnapReady(true)}
      />

      {/* Provider Logo */}
      <div className="mb-6 flex items-center justify-center gap-3 opacity-80">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
        <span className="font-mono tracking-widest font-bold uppercase text-xs text-[#CCCCCC]">
          MIDTRANS PAYMENT GATEWAY
        </span>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0e0e0e] border border-[#1c1c1c] rounded-none p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Progress Bar (Timer based) */}
        <div className="absolute top-0 left-0 h-1 bg-[#1a1a1a] w-full">
          <div 
            className="h-full bg-[#D4FF00] transition-all duration-1000 ease-linear" 
            style={{ width: `${(timeLeft / (15 * 60)) * 100}%` }}
          />
        </div>

        <div className="text-center mb-6 mt-2">
          <h1 className="text-[11px] font-mono uppercase tracking-widest text-[#777777] mb-2 font-bold">
            Batas Waktu Pembayaran
          </h1>
          <div className="text-4xl font-mono font-bold text-[#D4FF00] tracking-tight">
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Order Details Header */}
        <div className="bg-[#121212] border border-[#222222] p-4 mb-5 text-left">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-[10px] text-[#777777] font-mono tracking-widest uppercase">Nomor Pesanan</span>
              <p className="font-mono text-sm text-white font-bold">#{orderId}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#777777] font-mono tracking-widest uppercase">Merchant</span>
              <p className="font-mono text-sm text-white font-bold truncate max-w-[140px]">
                {orderDetails?.storeName || mainItem.sellerName || mainItem.storeName || "TonalZone Official"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3 bg-[#0a0a0a] p-2.5 border border-[#1c1c1c]">
            <div className="w-10 h-10 bg-[#1c1c1c] overflow-hidden shrink-0 relative">
              <Image src={mainItem.image || "/placeholder.svg"} alt={mainItem.name || mainItem.productName || "Product"} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white truncate font-medium">{mainItem.name || mainItem.productName}</p>
              <p className="text-[10px] text-[#777777] font-mono">{orderDetails?.items?.length ? `${orderDetails.items.length} Item` : items.length > 0 ? `${items.length} Item` : "1 Item"}</p>
            </div>
          </div>
        </div>

        {/* Midtrans Snap Trigger Area */}
        <div className="space-y-3 mb-6">
          {snapToken ? (
            <button
              type="button"
              onClick={openMidtransSnap}
              className="w-full py-3.5 bg-white hover:bg-[#D4FF00] text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              <span>BUKA POPUP MIDTRANS (QRIS / VA / GOPAY)</span>
            </button>
          ) : (
            <div className="p-3 bg-[#141414] border border-[#222222] text-center text-xs font-mono text-[#888888]">
              Memuat saluran pembayaran Midtrans...
            </div>
          )}

          {/* Payment Method Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[9px] font-mono text-[#666666] uppercase">
            <span className="border border-[#222222] px-2 py-0.5 bg-[#0a0a0a]">QRIS</span>
            <span className="border border-[#222222] px-2 py-0.5 bg-[#0a0a0a]">GoPay</span>
            <span className="border border-[#222222] px-2 py-0.5 bg-[#0a0a0a]">ShopeePay</span>
            <span className="border border-[#222222] px-2 py-0.5 bg-[#0a0a0a]">BCA VA</span>
            <span className="border border-[#222222] px-2 py-0.5 bg-[#0a0a0a]">Mandiri</span>
            <span className="border border-[#222222] px-2 py-0.5 bg-[#0a0a0a]">BNI</span>
            <span className="border border-[#222222] px-2 py-0.5 bg-[#0a0a0a]">Visa / MC</span>
          </div>
        </div>

        {/* Total Price */}
        <div className="flex justify-between items-center text-xs font-mono border-t border-[#1c1c1c] pt-4 mb-5">
          <span className="text-[#888888] uppercase tracking-wider">TOTAL TAGIHAN</span>
          <span className="text-xl font-bold text-[#D4FF00]">
            {isDemoOrder ? "Rp 1" : formatPrice(calculatedTotal)}
          </span>
        </div>

        {/* Simulation / Manual Confirmation Action */}
        <button 
          type="button"
          onClick={handleConfirmPayment}
          disabled={isProcessing}
          className="w-full py-3.5 bg-[#141414] hover:bg-[#222222] text-[#CCCCCC] hover:text-white border border-[#262626] font-mono font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? "MEMPROSES PEMBAYARAN..." : isDemoOrder ? "SAYA SUDAH MEMBAYAR RP 1 (DEMO) ✓" : "SAYA SUDAH MEMBAYAR (SIMULASI) ✓"}
        </button>

        <div className="text-center mt-4">
          <button 
            type="button"
            onClick={() => router.back()}
            className="text-[10px] text-[#666666] hover:text-red-400 font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            ← Kembali ke Keranjang
          </button>
        </div>

      </motion.div>
    </div>
  );
}

export default function PaymentGatewayPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#080808] flex items-center justify-center text-white font-mono text-xs">Memuat Midtrans Payment Gateway...</div>}>
      <PaymentGatewayContent />
    </React.Suspense>
  );
}
