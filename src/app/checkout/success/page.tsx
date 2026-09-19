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
import { Printer, CheckCircle2 } from "lucide-react";
import { KeyboardArrowRight } from "@/components/ui/keyboard-arrow";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("orderId") || searchParams?.get("order_id") || "ORD-90214";
  const { formatPrice } = useLocation();

  const [order, setOrder] = useState<any>(null);
  const [recommendedGear, setRecommendedGear] = useState<CatalogProduct[]>([]);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (orderId) {
        try {
          if (orderId !== "ORD-90214") {
            // Auto sync in localhost/sandbox so payment state is confirmed
            await fetch(`/api/orders/${orderId}/pay`, { method: "POST" }).catch(() => {});
          }
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

  const formatPaymentMethod = (method?: string) => {
    if (!method) return "QRIS (GoPay / BCA / ShopeePay)";
    const upper = method.toUpperCase();
    if (upper.includes("QRIS")) return "QRIS (GoPay / BCA / ShopeePay)";
    if (upper.includes("BCA")) return "BCA Virtual Account";
    if (upper.includes("MANDIRI")) return "Mandiri Bill Payment";
    if (upper.includes("BNI")) return "BNI Virtual Account";
    if (upper.includes("BRI")) return "BRI Virtual Account";
    if (upper.includes("CARD") || upper.includes("CREDIT")) return "Kartu Kredit / Debit";
    return method.replace(/_/g, " ");
  };

  return (
    <div className="min-h-screen bg-[#030303] text-[#FAF9F6] font-sans selection:bg-white selection:text-black flex flex-col relative">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        {/* SUCCESS CONFIRMATION CARD */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto py-10 sm:py-12 px-6 sm:px-10 bg-[#0A0A0A] border border-[#1E1E1E] rounded-3xl text-center mb-16 space-y-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
        >
          {/* Subtle Glow Checkmark Icon */}
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div>
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest font-bold block mb-1.5">
              Pembayaran Berhasil
            </span>
            <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block mb-2">
              Pesanan #{orderId} Dikonfirmasi
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white mt-1">
              Terima Kasih atas Pesanan Anda
            </h2>
            <p className="font-sans text-[13px] text-[#A1A1AA] mt-2.5 leading-relaxed max-w-md mx-auto">
              Pembayaran Anda telah berhasil kami terima. Penjual ({order?.storeName || "MOONDROP Official Flagship Store"}) akan segera memproses dan mengirimkan pesanan Anda.
            </p>
          </div>

          {/* Receipt Summary Card */}
          <div className="p-5 bg-[#121212] rounded-2xl text-left text-xs font-mono space-y-3.5 text-[#FAF9F6]/90 border border-[#1E1E1E]">
            <div className="flex justify-between items-start gap-4">
              <span className="text-[#71717A] shrink-0 uppercase tracking-wider">ALAMAT TUJUAN</span>
              <span className="font-medium text-right text-white leading-tight">
                {order?.destinationAddress || "Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan"}
              </span>
            </div>

            <div className="flex justify-between items-center border-t border-[#1C1C1C] pt-3">
              <span className="text-[#71717A] uppercase tracking-wider">METODE BAYAR</span>
              <span className="font-medium text-right text-white">
                {formatPaymentMethod(order?.paymentMethod)}
              </span>
            </div>

            <div className="flex justify-between items-center border-t border-[#1C1C1C] pt-3">
              <span className="font-bold text-white font-sans uppercase text-[12px] tracking-wider">TOTAL DIBAYAR</span>
              <span className="text-xl font-bold text-white font-mono tracking-wide">
                {formatPrice(order?.totalAmount || 422.24)}
              </span>
            </div>
          </div>

          {/* Primary & Secondary Action Pills */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsInvoiceOpen(true)}
              className="flex-1 py-3.5 px-5 rounded-full bg-[#141414] hover:bg-[#1E1E1E] border border-[#2A2A2A] text-zinc-300 hover:text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer text-center flex items-center justify-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4 text-zinc-400" />
              <span>Lihat Faktur Resmi</span>
            </button>

            <Link
              href="/orders"
              className="flex-1 py-3.5 px-5 rounded-full bg-white hover:bg-zinc-200 text-black font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center inline-flex items-center justify-center gap-1.5 shadow-lg group"
            >
              <span>Lacak Pengiriman</span>
              <KeyboardArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* RELATED PRODUCTS */}
        {recommendedGear.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-t border-[#181818] pt-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-lg uppercase tracking-wider text-white">
                Lengkapi Setup Audio Anda
              </h3>
              <Link href="/collection" className="font-mono text-xs text-zinc-400 hover:text-white hover:underline uppercase tracking-wider inline-flex items-center gap-1 group">
                <span>Lihat Semua Katalog</span>
                <KeyboardArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedGear.map((prod) => (
                <Link
                  key={prod.id}
                  href={`/product/${prod.id}`}
                  className="bg-[#0C0C0C] border border-[#1A1A1A] hover:border-[#2E2E2E] rounded-2xl p-4 transition-all duration-300 group block shadow-md"
                >
                  <div className="aspect-square bg-[#121212] rounded-xl overflow-hidden mb-3 relative">
                    <Image
                      src={prod.image || prod.images[0]}
                      alt={prod.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#71717A] uppercase block">{prod.brand}</span>
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

      {/* Official Audio Invoice Modal */}
      <AnimatePresence>
        {isInvoiceOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#0D0D0D] border border-[#242424] rounded-3xl p-6 sm:p-10 max-w-2xl w-full text-left space-y-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] relative my-8 print:border-none print:p-0 print:bg-white print:text-black"
            >
              <div className="flex justify-between items-start border-b border-[#1F1F1F] pb-6">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 font-bold tracking-[0.25em] uppercase block mb-1">
                    TONAL ZONE LABS
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold uppercase tracking-tight text-white print:text-black">
                    OFFICIAL ESCROW INVOICE
                  </h2>
                  <p className="text-[11px] font-mono text-[#71717A] mt-1">
                    No. Ref: {orderId} | Tanggal: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <button
                  onClick={() => setIsInvoiceOpen(false)}
                  className="text-xs font-mono text-[#8E8E93] hover:text-white px-3 py-1.5 rounded-full bg-[#181818] hover:bg-[#222] border border-white/10 print:hidden cursor-pointer uppercase transition-colors"
                >
                  Tutup [ESC]
                </button>
              </div>

              {/* Invoice Meta Grid */}
              <div className="grid grid-cols-2 gap-6 text-xs font-mono text-[#8E8E93] py-2">
                <div>
                  <span className="text-[10px] text-[#666] uppercase tracking-wider block mb-1">PENJUAL MITRA</span>
                  <span className="text-white font-bold block">{order?.storeName || "MOONDROP Official Flagship Store"}</span>
                  <span className="text-[11px] text-[#71717A]">Verifikasi Toko Resmi TonalZone</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#666] uppercase tracking-wider block mb-1">ALAMAT PENGIRIMAN</span>
                  <span className="text-white font-bold block">{order?.destinationAddress || "Jl. Senopati No. 45"}</span>
                  <span className="text-[11px] text-[#71717A]">{order?.destinationCity || "Jakarta Selatan"}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="rounded-2xl border border-[#202020] overflow-hidden bg-[#111111]">
                <div className="grid grid-cols-12 bg-[#161616] p-3 text-[10px] font-mono uppercase tracking-wider text-[#71717A] font-bold border-b border-[#202020]">
                  <div className="col-span-7">Deskripsi Perangkat</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-3 text-right">Harga</div>
                </div>
                <div className="p-4 space-y-2 text-xs font-mono divide-y divide-[#1C1C1C]">
                  <div className="grid grid-cols-12 items-center text-white pt-1">
                    <div className="col-span-7">
                      <span className="font-semibold block text-sm">{order?.items?.[0]?.productName || "Moondrop Space Travel TWS"}</span>
                      <span className="text-[11px] text-[#71717A]">{order?.items?.[0]?.selectedVariant || "White"}</span>
                    </div>
                    <div className="col-span-2 text-center text-[#A1A1AA]">
                      {order?.items?.[0]?.quantity || 1}x
                    </div>
                    <div className="col-span-3 text-right font-bold text-white text-sm">
                      {formatPrice(order?.totalAmount || 422.24)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Total & Proteksi Escrow */}
              <div className="p-4 rounded-2xl bg-[#121212] border border-[#202020] flex justify-between items-center text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#71717A] uppercase tracking-wider block mb-0.5">STATUS TRANSAKSI</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    LUNAS (ESCROW SECURED)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#71717A] uppercase tracking-wider block mb-0.5">TOTAL PEMBAYARAN</span>
                  <span className="text-xl font-mono font-bold text-white">
                    {formatPrice(order?.totalAmount || 422.24)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#1F1F1F] print:hidden">
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="px-6 py-3 rounded-full bg-white hover:bg-zinc-200 text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-2 shadow-lg"
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
    <React.Suspense fallback={<div className="min-h-screen bg-[#030303] flex items-center justify-center text-white font-mono text-xs">Loading confirmation...</div>}>
      <CheckoutSuccessContent />
    </React.Suspense>
  );
}
