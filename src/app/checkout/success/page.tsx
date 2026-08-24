"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation } from "@/context/LocationContext";

const RELATED_PRODUCTS = [
  {
    id: "prod-aria",
    name: "Moondrop Aria Snow Edition",
    brand: "MOONDROP",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
  },
  {
    id: "prod-btr5",
    name: "FiiO BTR5 Portable DAC AMP",
    brand: "FIIO",
    price: 119.50,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
  },
  {
    id: "prod-cp145",
    name: "SpinFit CP145 Medical Grade Silicone Eartips",
    brand: "SPINFIT",
    price: 12.00,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
  },
  {
    id: "prod-zonie",
    name: "Tripowin Zonie 16 Core Silver Plated Cable",
    brand: "TRIPOWIN",
    price: 19.90,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
  },
];

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("orderId") || "ORD-90214";
  const { formatPrice } = useLocation();

  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.order) {
            setOrder(data.order);
          }
        })
        .catch((err) => console.error("Error fetching order:", err));
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-[#080808] text-[#FAF9F6] font-sans selection:bg-[#D4FF00] selection:text-[#0e0e0e] flex flex-col relative">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        {/* SUCCESS CONFIRMATION STATE */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto py-12 px-8 bg-[#111111] border border-[#222222] rounded-none text-center mb-16 space-y-6 shadow-2xl"
        >
          <div className="w-16 h-16 bg-[#D4FF00] text-[#080808] flex items-center justify-center mx-auto text-3xl font-bold font-mono">
            <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div>
            <span className="text-xs font-mono text-[#D4FF00] uppercase block mb-2 tracking-widest font-semibold">
              Pembayaran Berhasil
            </span>
            <span className="text-[10px] font-mono text-[#777777] uppercase block mb-1">
              Pesanan #{orderId} Dikonfirmasi
            </span>
            <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-white mt-1">
              Terima Kasih atas Pesanan Anda
            </h2>
            <p className="font-sans text-[13px] text-[#A0A0A5] mt-3 leading-relaxed max-w-sm mx-auto">
              Pembayaran Anda telah berhasil kami terima. Penjual ({order?.storeName || "TonalZone Partner Merchant"}) akan segera memproses dan mengirimkan pesanan Anda.
            </p>
          </div>

          <div className="p-5 bg-[#141414] text-left text-xs font-mono space-y-3 text-[#FAF9F6]/80 border border-[#222222]">
            <div className="flex justify-between items-start gap-4">
              <span className="text-[#666666] shrink-0 uppercase">ALAMAT TUJUAN</span>
              <span className="font-semibold text-right text-white leading-tight">
                {order?.destinationAddress || "Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan"}
              </span>
            </div>
            <div className="flex justify-between border-t border-[#222222] pt-3">
              <span className="text-[#666666] uppercase">METODE BAYAR</span>
              <span className="font-semibold text-right uppercase text-white">
                {order?.paymentMethod || "QRIS / Instant Transfer"}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-[#222222] pt-3">
              <span className="font-bold text-white font-sans uppercase text-[13px]">TOTAL DIBAYAR</span>
              <span className="text-lg font-bold text-[#D4FF00]">
                {formatPrice(order?.totalAmount || 1318.20)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/"
              className="flex-1 py-3.5 bg-[#D4FF00] hover:bg-white text-[#080808] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
            >
              Kembali ke Beranda
            </Link>
            <Link
              href="/orders"
              className="flex-1 py-3.5 bg-[#181818] hover:bg-[#222222] border border-[#333333] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
            >
              Lacak Pesanan Saya
            </Link>
          </div>
        </motion.div>

        {/* RELATED PRODUCTS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-[#1c1c1c] pt-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading text-lg uppercase tracking-wider text-white">
              Lengkapi Setup Audio Anda
            </h3>
            <Link href="/collection" className="font-mono text-xs text-[#D4FF00] hover:underline uppercase tracking-wider">
              Lihat Katalog →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {RELATED_PRODUCTS.map((prod) => (
              <Link
                key={prod.id}
                href="/collection"
                className="bg-[#0f0f0f] border border-[#1c1c1c] p-4 hover:border-[#444444] transition-colors group block"
              >
                <div className="aspect-square bg-[#141414] overflow-hidden mb-3 relative">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <span className="text-[10px] font-mono text-[#666666] uppercase block">{prod.brand}</span>
                <h4 className="text-xs font-sans font-medium text-[#D1D1D6] group-hover:text-white truncate mb-2">
                  {prod.name}
                </h4>
                <span className="text-sm font-sans font-bold text-white block">
                  {formatPrice(prod.price)}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#080808] flex items-center justify-center text-white font-mono text-xs">Loading confirmation...</div>}>
      <CheckoutSuccessContent />
    </React.Suspense>
  );
}
