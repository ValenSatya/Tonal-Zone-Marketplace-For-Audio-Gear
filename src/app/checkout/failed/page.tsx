"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MotionButton from "@/components/MotionButton";
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

function CheckoutFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("orderId") || searchParams?.get("order_id") || "ORD-90214";
  const status = searchParams?.get("status") || searchParams?.get("reason") || "failed";
  const { formatPrice } = useLocation();

  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId && orderId !== "ORD-90214") {
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

  const getStatusDescription = () => {
    if (status === "expire" || status === "expired") {
      return "Batas waktu transaksi telah habis sebelum pembayaran diselesaikan.";
    }
    if (status === "cancel" || status === "cancelled" || status === "unfinish") {
      return "Proses pembayaran dibatalkan sebelum transaksi selesai.";
    }
    if (status === "deny" || status === "denied") {
      return "Transaksi ditolak oleh pihak penerbit kartu / bank penyedia.";
    }
    return "Kami tidak dapat memverifikasi pembayaran Anda. Saldo atau limit Anda tidak terpotong.";
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#FAF9F6] font-sans selection:bg-[#FF334B] selection:text-white flex flex-col relative">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        {/* FAILED NOTIFICATION CARD */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto py-12 px-8 bg-[#111111] border border-[#261818] rounded-none text-center mb-16 space-y-6 shadow-2xl relative overflow-hidden"
        >
          {/* Top Red Status Accent Line */}
          <div className="absolute top-0 left-0 h-1 bg-[#FF334B] w-full" />

          <div className="w-16 h-16 bg-[#1f1012] border border-[#FF334B]/40 text-[#FF334B] flex items-center justify-center mx-auto text-3xl font-bold font-mono">
            <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>

          <div>
            <span className="text-xs font-mono text-[#FF334B] uppercase block mb-1 tracking-widest font-semibold">
              [TRANSAKSI BELUM BERHASIL]
            </span>
            <span className="text-[10px] font-mono text-[#777777] uppercase block mb-2">
              Nomor Pesanan: #{orderId}
            </span>
            <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-white mt-1">
              Pembayaran Tidak Selesai
            </h2>
            <p className="font-sans text-[13px] text-[#A0A0A5] mt-3 leading-relaxed max-w-sm mx-auto">
              {getStatusDescription()}
            </p>
          </div>

          {/* Breakdown Info */}
          <div className="p-5 bg-[#141414] text-left text-xs font-mono space-y-3 text-[#FAF9F6]/80 border border-[#222222]">
            <div className="flex justify-between items-start gap-4">
              <span className="text-[#666666] shrink-0 uppercase">STATUS TAGIHAN</span>
              <span className="font-semibold text-right text-[#FF334B]">
                BELUM DIBAYAR / DIBATALKAN
              </span>
            </div>
            <div className="flex justify-between border-t border-[#222222] pt-3">
              <span className="text-[#666666] uppercase">ESTIMASI TOTAL</span>
              <span className="font-semibold text-white">
                {order?.totalAmount ? formatPrice(order.totalAmount) : "Rp 1"}
              </span>
            </div>
            <div className="flex justify-between border-t border-[#222222] pt-3 text-[11px] text-[#777777]">
              <span>PENYEBAB UMUM</span>
              <span className="text-right text-[#AAAAAA]">Batas waktu habis / Koneksi terputus</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <MotionButton
              href="/checkout"
              variant="white"
              className="flex-1 py-3 text-center text-xs font-mono font-bold uppercase"
            >
              COBA BAYAR ULANG →
            </MotionButton>
            <Link
              href="/cart"
              className="flex-1 py-3 text-center border border-[#333333] hover:border-white text-xs font-mono font-bold uppercase text-[#CCCCCC] hover:text-white transition-colors flex items-center justify-center"
            >
              KEMBALI KE KERANJANG
            </Link>
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/"
              className="text-[11px] font-mono text-[#666666] hover:text-[#999999] uppercase tracking-wider transition-colors"
            >
              ← Kembali ke Halaman Utama
            </Link>
          </div>
        </motion.div>

        {/* RELATED / RECOMMENDED AUDIO GEAR */}
        <section className="border-t border-[#1c1c1c] pt-14">
          <div className="mb-8">
            <span className="text-xs font-mono text-[#777777] uppercase tracking-widest block mb-1">
              REKOMENDASI AUDIOPHILE
            </span>
            <h3 className="font-heading text-xl font-bold uppercase tracking-tight text-white">
              Pilihan Gear Populer Lainnya
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {RELATED_PRODUCTS.map((prod) => (
              <Link
                key={prod.id}
                href={`/product/${prod.id}`}
                className="group bg-[#0e0e0e] border border-[#1c1c1c] hover:border-[#333333] transition-all p-4 flex flex-col justify-between"
              >
                <div className="relative aspect-square w-full bg-[#141414] overflow-hidden mb-4 border border-[#1a1a1a]">
                  <Image
                    src={prod.image}
                    alt={prod.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#666666] uppercase block mb-1">
                    {prod.brand}
                  </span>
                  <h4 className="font-sans text-xs font-semibold text-white group-hover:text-[#D4FF00] transition-colors truncate">
                    {prod.name}
                  </h4>
                  <p className="font-mono text-xs font-bold text-white mt-2">
                    {formatPrice(prod.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutFailedPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#080808] flex items-center justify-center text-white font-mono text-xs">Memuat status transaksi...</div>}>
      <CheckoutFailedContent />
    </React.Suspense>
  );
}
