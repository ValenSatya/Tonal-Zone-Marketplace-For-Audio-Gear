"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation } from "@/context/LocationContext";
import { fetchProductsFromDb, CatalogProduct } from "@/lib/products-db";
import { Printer, CheckCircle2, ArrowRight } from "lucide-react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("orderId") || "ORD-90214";
  const { formatPrice } = useLocation();

  const [order, setOrder] = useState<any>(null);
  const [recommendedGear, setRecommendedGear] = useState<CatalogProduct[]>([]);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (orderId) {
        try {
          const res = await fetch(`/api/orders/${orderId}`);
          if (res.ok) {
            const text = await res.text();
            const data = JSON.parse(text);
            if (data && data.success && data.order) {
              setOrder(data.order);
            }
          }
        } catch (err) {
          console.warn("Could not parse order:", err);
        }
      }

      try {
        const live = await fetchProductsFromDb();
        if (live && live.length > 0) {
          setRecommendedGear(live.slice(0, 4));
        }
      } catch (e) {
        console.error("Failed to load recommended gear:", e);
      }
    }
    loadData();
  }, [orderId]);

  const handlePrintReceipt = () => {
    window.print();
  };

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
            <button
              type="button"
              onClick={() => setIsInvoiceOpen(true)}
              className="flex-1 py-3.5 bg-[#181818] hover:bg-[#222222] border border-[#333333] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4 text-[#D4FF00]" />
              <span>Lihat Faktur Resmi</span>
            </button>
            <Link
              href="/orders"
              className="flex-1 py-3.5 bg-[#D4FF00] hover:bg-white text-[#080808] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
            >
              Lacak Pengiriman →
            </Link>
          </div>
        </motion.div>

        {/* RELATED PRODUCTS FROM SUPABASE DB */}
        {recommendedGear.length > 0 && (
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
                Lihat Semua Katalog →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedGear.map((prod) => (
                <Link
                  key={prod.id}
                  href={`/product/${prod.id}`}
                  className="bg-[#0f0f0f] border border-[#1c1c1c] p-4 hover:border-[#444444] transition-colors group block"
                >
                  <div className="aspect-square bg-[#141414] overflow-hidden mb-3 relative">
                    <Image
                      src={prod.image || prod.images[0]}
                      alt={prod.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
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
        )}
      </main>

      {/* Minimalist Official Audio Invoice Modal */}
      <AnimatePresence>
        {isInvoiceOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0e0e0e] border border-[#262626] p-8 sm:p-10 max-w-2xl w-full text-left space-y-6 shadow-2xl relative my-8 print:border-none print:p-0 print:bg-white print:text-black"
            >
              <div className="flex justify-between items-start border-b border-[#222] pb-6">
                <div>
                  <span className="text-xs font-mono text-[#D4FF00] font-bold tracking-[0.25em] uppercase block mb-1">
                    TONAL ZONE LABS
                  </span>
                  <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-white print:text-black">
                    OFFICIAL ESCROW INVOICE
                  </h2>
                  <p className="text-[11px] font-mono text-[#71717A] mt-1">
                    No. Ref: {orderId} | Tanggal: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <button
                  onClick={() => setIsInvoiceOpen(false)}
                  className="text-xs font-mono text-[#8E8E93] hover:text-white px-3 py-1 border border-[#222] print:hidden cursor-pointer uppercase"
                >
                  Tutup [ESC]
                </button>
              </div>

              {/* Invoice Meta Grid */}
              <div className="grid grid-cols-2 gap-6 text-xs font-mono text-[#8E8E93] py-2">
                <div>
                  <span className="text-[10px] text-[#555] uppercase block mb-1">PENJUAL MITRA</span>
                  <span className="text-white font-bold block">{order?.storeName || "TonalZone Partner Merchant"}</span>
                  <span className="text-[11px] text-[#71717A]">Verifikasi Toko Resmi TonalZone</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#555] uppercase block mb-1">ALAMAT PENGIRIMAN</span>
                  <span className="text-white font-bold block">{order?.destinationAddress || "Jakarta Selatan"}</span>
                  <span className="text-[11px] text-[#71717A]">{order?.destinationCity || "DKI Jakarta"}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-[#1f1f1f] overflow-hidden">
                <div className="grid grid-cols-12 bg-[#141414] p-3 text-[10px] font-mono uppercase tracking-wider text-[#71717A] font-bold border-b border-[#1f1f1f]">
                  <div className="col-span-7">Deskripsi Perangkat</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-3 text-right">Harga</div>
                </div>
                <div className="p-3.5 space-y-2 text-xs font-mono">
                  <div className="grid grid-cols-12 items-center text-white">
                    <div className="col-span-7">
                      <span className="font-semibold block">{order?.items?.[0]?.productName || "Audiophile Precision IEM"}</span>
                      <span className="text-[10px] text-[#71717A]">{order?.items?.[0]?.selectedVariant || "Standard Edition"}</span>
                    </div>
                    <div className="col-span-2 text-center text-[#71717A]">
                      {order?.items?.[0]?.quantity || 1}x
                    </div>
                    <div className="col-span-3 text-right font-bold text-[#D4FF00]">
                      {formatPrice(order?.totalAmount || 1318.20)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Total & Proteksi Escrow */}
              <div className="p-4 bg-[#141414] border border-[#1f1f1f] flex justify-between items-center text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#71717A] uppercase block">STATUS TRANSAKSI</span>
                  <span className="text-emerald-400 font-bold">LUNAS (ESCROW SECURED)</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#71717A] uppercase block">TOTAL PEMBAYARAN</span>
                  <span className="text-xl font-mono font-bold text-white">
                    {formatPrice(order?.totalAmount || 1318.20)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#222] print:hidden">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="px-6 py-2.5 bg-[#FAF9F6] hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
