"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MotionButton from "@/components/MotionButton";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { t } = useLanguage();
  const { formatPrice } = useLocation();
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // Handle Apply Promo
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "TONAL10" || promoCode.trim().toUpperCase() === "AUDIOPHILE") {
      setDiscount(0.1); // 10% off
      setPromoMessage("[BERHASIL] KODE PROMO DITERAPKAN: DISKON 10%");
    } else if (promoCode.trim() !== "") {
      setDiscount(0.05); // 5% off courtesy
      setPromoMessage("[BERHASIL] BONUS MEMBER: DISKON 5%");
    } else {
      setPromoMessage("[GAGAL] SILAKAN MASUKKAN KODE YANG VALID");
    }
  };

  // Financial Calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    return subtotal * discount;
  }, [subtotal, discount]);

  const shipping = 0; // Free Insured Delivery
  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + shipping);
  }, [subtotal, discountAmount, shipping]);

  return (
    <div className="flex flex-col min-h-screen bg-[#080808] text-[#FAF9F6] font-sans selection:bg-[#D4FF00] selection:text-[#0e0e0e]">
      <Navbar />

      {/* Breadcrumb & Header */}
      <section className="w-full bg-[#0a0a0a] border-b border-[#1c1c1c] pt-16 pb-10 px-6 lg:px-12">
        <div className="max-w-[1200px] mx-auto">
          <nav className="text-[11px] font-mono text-[#777777] uppercase tracking-widest mb-4 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">BERANDA</Link>
            <span>/</span>
            <Link href="/collection" className="hover:text-white transition-colors">KATALOG</Link>
            <span>/</span>
            <span className="text-white font-bold">{t("cart.yourCart")}</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-tight text-white leading-none">
                {t("cart.yourCart")}
              </h1>
              <p className="text-xs text-[#888888] mt-2 font-mono uppercase tracking-wider">
                {items.length > 0
                  ? `${items.reduce((acc, i) => acc + i.quantity, 0)} PRODUK DI DALAM KERANJANG`
                  : t("cart.empty")}
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-mono text-[#777777] hover:text-red-400 transition-colors uppercase underline cursor-pointer self-start md:self-auto"
              >
                HAPUS SEMUA BARANG
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Cart Section */}
      <section className="flex-grow w-full py-12 px-6 lg:px-12">
        <div className="max-w-[1200px] mx-auto">
          {items.length > 0 ? (
            <div className="flex flex-col lg:flex-row gap-10 items-start">
              
              {/* LEFT COLUMN: Cart Items List */}
              <div className="w-full lg:w-2/3 flex flex-col gap-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      className="bg-[#0e0e0e] border border-[#1c1c1c] hover:border-[#2a2a2a] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all shadow-md group"
                    >
                      {/* Product Image & Details */}
                      <div className="flex items-center gap-5 w-full sm:w-auto">
                        <Link
                          href={`/product/${item.productId || item.id}`}
                          className="relative w-24 h-24 sm:w-28 sm:h-28 bg-[#141414] border border-[#222222] overflow-hidden shrink-0 flex items-center justify-center group-hover:border-[#444444] transition-colors"
                        >
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </Link>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#888888] mb-1">
                            {item.brand} • {item.category || "IEM"}
                          </span>
                          <Link
                            href={`/product/${item.productId || item.id}`}
                            className="font-sans text-base font-medium tracking-tight text-white hover:text-[#D4FF00] transition-colors leading-snug"
                          >
                            {item.name}
                          </Link>
                          <span className="text-xs font-mono text-[#777777] mt-1 uppercase">
                            Varian: {item.variant || "Standard"}
                          </span>
                          <span className="font-mono font-bold text-sm text-white mt-2 sm:hidden">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Stepper & Price / Remove */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 border-t sm:border-t-0 border-[#1c1c1c] pt-4 sm:pt-0">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-[#262626] bg-[#141414] overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#222] transition-colors font-mono text-sm font-medium cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="w-9 text-center font-mono text-xs font-bold text-white select-none">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#222] transition-colors font-mono text-sm font-medium cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-[#666666] hover:text-red-400 hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                            title="Hapus barang"
                            aria-label="Hapus barang"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        <span className="font-mono font-bold text-base text-white hidden sm:block">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Return to Shop Banner */}
                <div className="mt-4 p-6 bg-[#0a0a0a] border border-[#1c1c1c] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#141414] border border-[#222222] flex items-center justify-center text-white shrink-0">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-heading text-sm font-bold uppercase text-white">
                        Butuh Kabel Upgrade atau Eartips Tambahan?
                      </h4>
                      <p className="text-xs text-[#777777] font-mono">
                        Lengkapi koleksi Anda dengan aksesori audiophile pilihan.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/collection"
                    className="font-mono text-xs font-bold uppercase tracking-wider text-white hover:text-[#D4FF00] underline whitespace-nowrap transition-colors"
                  >
                    Tambah Produk Lain →
                  </Link>
                </div>
              </div>

              {/* RIGHT COLUMN: Order Summary & Checkout Action */}
              <div className="w-full lg:w-1/3">
                <div className="bg-[#0e0e0e] border border-[#1c1c1c] p-6 lg:p-8 space-y-6 sticky top-28">
                  <div className="border-b border-[#1c1c1c] pb-4">
                    <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-white">
                      {t("cart.summary")}
                    </h3>
                    <p className="text-xs text-[#777777] font-mono mt-1">
                      Transaksi terenkripsi dan aman.
                    </p>
                  </div>

                  {/* Promo Code Input */}
                  <form onSubmit={handleApplyPromo} className="space-y-2">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[#777777] font-bold">
                      Kode Promo / Voucher
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Contoh: TONAL10"
                        className="bg-[#141414] border border-[#262626] focus:border-white text-xs font-mono text-white uppercase px-3 py-2.5 flex-1 outline-none transition-colors"
                      />
                      <button
                        type="submit"
                        className="bg-[#1c1c1c] hover:bg-[#282828] text-white border border-[#2a2a2a] text-xs font-mono font-bold uppercase px-4 py-2.5 transition-colors cursor-pointer"
                      >
                        Gunakan
                      </button>
                    </div>
                    {promoMessage && (
                      <p className={`text-[10px] font-mono ${promoMessage.includes("BERHASIL") ? "text-emerald-400" : "text-red-400"}`}>
                        {promoMessage}
                      </p>
                    )}
                  </form>

                  {/* Financial Breakdown */}
                  <div className="space-y-3 border-t border-[#1c1c1c] pt-4 text-xs font-mono">
                    <div className="flex justify-between text-[#888888]">
                      <span>{t("cart.subtotal")}</span>
                      <span className="text-white font-bold">{formatPrice(subtotal)}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Diskon ({discount * 100}%)</span>
                        <span className="font-bold">-{formatPrice(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-[#888888]">
                      <span>{t("cart.shipping")}</span>
                      <span className="text-white font-bold">GRATIS</span>
                    </div>

                    <div className="flex justify-between items-center border-t border-[#1c1c1c] pt-4 text-sm font-sans">
                      <span className="font-bold text-white uppercase">{t("cart.total")}</span>
                      <span className="font-mono text-xl font-bold text-white">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  {/* Checkout CTA with Diagonal Wipe Animation */}
                  <MotionButton
                    href="/checkout"
                    variant="neon"
                    className="w-full text-center py-4"
                  >
                    LANJUT KE PEMBAYARAN →
                  </MotionButton>

                  <div className="pt-2 flex items-center justify-center gap-2 text-[10px] font-mono text-[#555555] uppercase tracking-wider text-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <span>100% Produk Original & Bergaransi Resmi</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* EMPTY CART STATE */
            <div className="text-center py-20 bg-[#0e0e0e] border border-[#1c1c1c] max-w-xl mx-auto p-8 space-y-6">
              <div className="w-16 h-16 bg-[#141414] border border-[#222222] flex items-center justify-center mx-auto text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-heading text-2xl font-bold uppercase tracking-tight text-white">
                  Keranjang Belanja Anda Kosong
                </h3>
                <p className="text-xs font-mono text-[#777777] mt-2 max-w-sm mx-auto leading-relaxed">
                  Jelajahi koleksi In-Ear Monitor, DAC/AMP, dan kabel upgrade terbaik di TonalZone.
                </p>
              </div>
              <MotionButton
                href="/collection"
                variant="light"
                className="inline-block px-8 py-3.5"
              >
                JELAJAHI KATALOG PRODUK →
              </MotionButton>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
