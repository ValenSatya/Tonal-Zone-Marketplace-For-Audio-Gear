"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useLocation } from "@/context/LocationContext";

function PaymentGatewayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const method = searchParams?.get("method") || "qr";
  const orderId = searchParams?.get("orderId") || "ORD-90214";
  
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

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

  return (
    <div className="min-h-[100svh] bg-[#080808] text-[#FAF9F6] font-sans flex flex-col items-center justify-center p-4 selection:bg-[#D4FF00] selection:text-[#0e0e0e]">
      
      {/* Provider Logo */}
      <div className="mb-8 flex items-center justify-center gap-3 opacity-70">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
        <span className="font-heading tracking-widest font-bold uppercase text-sm">TonalZone Pembayaran Aman</span>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#111] border border-[#222] rounded-none p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Progress Bar (Timer based) */}
        <div className="absolute top-0 left-0 h-1 bg-[#222] w-full">
          <div 
            className="h-full bg-[#D4FF00] transition-all duration-1000 ease-linear" 
            style={{ width: `${(timeLeft / (15 * 60)) * 100}%` }}
          />
        </div>

        <div className="text-center mb-8 mt-2">
          <h1 className="text-xs font-mono uppercase tracking-widest text-[#888] mb-2 font-bold">Batas Waktu Pembayaran</h1>
          <div className="text-4xl font-mono font-bold text-[#D4FF00] tracking-tight">
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="bg-[#141414] border border-[#222] p-5 mb-6 text-center">
          
          {/* Order Details Header */}
          <div className="mb-6 pb-6 border-b border-[#222] text-left">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] text-[#777] font-mono tracking-widest uppercase">Nomor Pesanan</span>
                <p className="font-mono text-sm text-[#FAF9F6] font-bold">#{orderId}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#777] font-mono tracking-widest uppercase">Penjual</span>
                <p className="font-mono text-sm text-[#FAF9F6] font-bold">{orderDetails?.storeName || mainItem.sellerName || mainItem.storeName || "Bass Audio Official"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 bg-[#0a0a0a] p-3 border border-[#222]">
              <div className="w-10 h-10 bg-[#1c1c1c] overflow-hidden shrink-0 relative">
                <Image src={mainItem.image || "/placeholder.svg"} alt={mainItem.name || mainItem.productName || "Product"} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#FAF9F6] truncate font-medium">{mainItem.name || mainItem.productName}</p>
                <p className="text-[10px] text-[#777] font-mono">{orderDetails?.items?.length ? `${orderDetails.items.length} Item` : items.length > 0 ? `${items.length} Item` : "1 Item"}</p>
              </div>
            </div>
          </div>

          {method === "qr" && (
            <div className="flex flex-col items-center">
              <h2 className="font-mono font-bold text-xs uppercase tracking-wider mb-4 text-[#FAF9F6]">Scan QRIS via Mobile Banking / E-Wallet</h2>
              <div className="bg-white p-3 border border-white inline-block mb-4">
                <div className="w-44 h-44 bg-[url('https://api.dicebear.com/9.x/identicon/svg?seed=TZ-QR&backgroundColor=ffffff&rowColor=000000')] bg-contain bg-center rounded"></div>
              </div>
              <p className="text-[10px] text-[#777] font-mono uppercase tracking-widest">NMID: ID1020039281093</p>
            </div>
          )}

          {method === "va" && (
            <div className="flex flex-col items-center">
              <h2 className="font-mono font-bold text-xs uppercase tracking-wider mb-4 text-[#FAF9F6]">BCA Virtual Account</h2>
              <p className="text-[11px] font-mono text-[#888] mb-2">Transfer ke nomor VA berikut:</p>
              <div className="bg-[#0a0a0a] border border-[#333] px-6 py-4 mb-2 w-full">
                <span className="font-mono text-xl tracking-widest text-[#D4FF00] font-bold">1928 4402 9918 003</span>
              </div>
              <p className="text-[10px] text-[#666] font-mono uppercase tracking-wider mt-1">
                Atas Nama: PT TONAL ZONE INDONESIA
              </p>
            </div>
          )}

          {method === "card" && (
            <div className="flex flex-col items-center text-left">
              <h2 className="font-mono font-bold text-xs uppercase tracking-wider mb-4 text-[#FAF9F6] text-center w-full">Kartu Kredit / Debit</h2>
              <div className="w-full space-y-3">
                <input type="text" placeholder="Card Number" className="w-full bg-[#0a0a0a] border border-[#333] px-4 py-3 text-xs font-mono text-[#FAF9F6] focus:border-white outline-none" defaultValue="4111 1111 1111 1111" />
                <div className="flex gap-3">
                  <input type="text" placeholder="MM/YY" className="w-1/2 bg-[#0a0a0a] border border-[#333] px-4 py-3 text-xs font-mono text-[#FAF9F6] focus:border-white outline-none" defaultValue="12/28" />
                  <input type="text" placeholder="CVC" className="w-1/2 bg-[#0a0a0a] border border-[#333] px-4 py-3 text-xs font-mono text-[#FAF9F6] focus:border-white outline-none" defaultValue="123" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center text-xs font-mono border-t border-[#222] pt-5 mb-6">
          <span className="text-[#888] uppercase tracking-wider">TOTAL TAGIHAN</span>
          <span className="text-xl font-bold text-white">{formatPrice(calculatedTotal)}</span>
        </div>

        <button 
          onClick={handleConfirmPayment}
          disabled={isProcessing}
          className="w-full py-4 bg-[#D4FF00] hover:bg-white text-[#080808] font-mono font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? "MEMPROSES PEMBAYARAN..." : "SAYA SUDAH MEMBAYAR (SIMULASI)"}
        </button>

        <div className="text-center mt-5">
          <button 
            onClick={() => router.back()}
            className="text-[10px] text-[#666] hover:text-red-400 font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            Batalkan Transaksi
          </button>
        </div>

      </motion.div>
    </div>
  );
}

export default function PaymentGatewayPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#080808] flex items-center justify-center text-white font-mono text-xs">Memuat halaman pembayaran...</div>}>
      <PaymentGatewayContent />
    </React.Suspense>
  );
}
