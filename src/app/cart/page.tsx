"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MotionButton from "@/components/MotionButton";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";
import { KeyboardArrowRight } from "@/components/ui/keyboard-arrow";
import { getStoreSlug } from "@/lib/store-utils";

export default function CartPage() {
  const { t } = useLanguage();
  const { formatPrice } = useLocation();
  const {
    items,
    selectedItemIds,
    selectedItems,
    isAllSelected,
    selectedSubtotal,
    toggleSelectItem,
    toggleSelectAll,
    removeSelectedItems,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isDemoRp1, setIsDemoRp1] = useState(false);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // Load previously saved promo from storage if any
  useEffect(() => {
    try {
      const savedPromo = localStorage.getItem("tonalzone_applied_promo");
      if (savedPromo) {
        setPromoCode(savedPromo);
        if (["DEMO1RP", "RP1", "DEMO", "TONAL1RP"].includes(savedPromo.toUpperCase())) {
          setIsDemoRp1(true);
          setDiscount(0);
          setPromoMessage("[BERHASIL] VOUCHER DEMO AKTIF: TOTAL PEMBAYARAN MENJADI RP 1!");
        } else if (["TONAL10", "AUDIOPHILE"].includes(savedPromo.toUpperCase())) {
          setDiscount(0.1);
          setPromoMessage("[BERHASIL] KODE PROMO DITERAPKAN: DISKON 10%");
        }
      }
    } catch (e) {}
  }, []);

  // Handle Apply Promo
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = promoCode.trim().toUpperCase();
    if (["DEMO1RP", "RP1", "DEMO", "TONAL1RP"].includes(cleanCode)) {
      setIsDemoRp1(true);
      setDiscount(0);
      setPromoMessage("[BERHASIL] VOUCHER DEMO AKTIF: TOTAL PEMBAYARAN MENJADI RP 1!");
      try { localStorage.setItem("tonalzone_applied_promo", cleanCode); } catch (e) {}
    } else if (cleanCode === "TONAL10" || cleanCode === "AUDIOPHILE") {
      setIsDemoRp1(false);
      setDiscount(0.1); // 10% off
      setPromoMessage("[BERHASIL] KODE PROMO DITERAPKAN: DISKON 10%");
      try { localStorage.setItem("tonalzone_applied_promo", cleanCode); } catch (e) {}
    } else if (cleanCode === "TONAL50") {
      setIsDemoRp1(false);
      setDiscount(0.5); // 50% off
      setPromoMessage("[BERHASIL] KODE PROMO DITERAPKAN: DISKON 50%");
      try { localStorage.setItem("tonalzone_applied_promo", cleanCode); } catch (e) {}
    } else if (cleanCode !== "") {
      setIsDemoRp1(false);
      setDiscount(0.05); // 5% off courtesy
      setPromoMessage("[BERHASIL] BONUS MEMBER: DISKON 5%");
      try { localStorage.setItem("tonalzone_applied_promo", cleanCode); } catch (e) {}
    } else {
      setIsDemoRp1(false);
      setDiscount(0);
      setPromoMessage("[GAGAL] SILAKAN MASUKKAN KODE YANG VALID");
      try { localStorage.removeItem("tonalzone_applied_promo"); } catch (e) {}
    }
  };

  // Financial Calculations
  const subtotal = selectedSubtotal;

  const discountAmount = useMemo(() => {
    if (isDemoRp1) return subtotal - 0.0000625; // Leaving 1 IDR equivalent
    return subtotal * discount;
  }, [subtotal, discount, isDemoRp1]);

  const shipping = 0; // Free Insured Delivery
  const total = useMemo(() => {
    if (isDemoRp1) return 0.0000625; // Special Rp 1
    return Math.max(0, subtotal - discountAmount + shipping);
  }, [subtotal, discountAmount, shipping, isDemoRp1]);

  return (
    <div className="flex flex-col min-h-screen bg-[#000000] text-[#FAF9F6] font-sans selection:bg-[#BFDD25] selection:text-[#030303]">
      <Navbar />

      {/* Cart Header */}
      <section className="w-full bg-[#000000] pt-16 pb-8 px-5 sm:px-8 lg:px-12">
        <div className="max-w-[1360px] mx-auto">
          <nav className="text-[11px] font-mono text-[#777777] uppercase tracking-widest mb-4 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">BERANDA</Link>
            <span className="text-[#444]">/</span>
            <Link href="/collection" className="hover:text-white transition-colors">KATALOG</Link>
            <span className="text-[#444]">/</span>
            <span className="text-[#BFDD25] font-semibold">{t("cart.yourCart")}</span>
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
                className="text-xs font-mono px-3.5 py-1.5 rounded-full bg-[#121212] hover:bg-[#1c1c1c] text-[#888888] hover:text-red-400 transition-colors uppercase cursor-pointer self-start md:self-auto"
              >
                Hapus Semua Barang
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Cart Section */}
      <section className="flex-grow w-full py-6 pb-20 px-5 sm:px-8 lg:px-12">
        <div className="max-w-[1360px] mx-auto">
          {items.length > 0 ? (
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              
              {/* LEFT COLUMN: Cart Items List */}
              <div className="w-full lg:w-2/3 flex flex-col gap-4">
                {/* Multi-Select Action Bar */}
                <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl px-5 py-3.5 flex items-center justify-between text-xs font-mono">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="flex items-center gap-3 text-zinc-300 hover:text-white cursor-pointer select-none transition-colors"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isAllSelected
                          ? "bg-white border-white text-black"
                          : "bg-[#181818] border-[#383838] text-transparent hover:border-[#666]"
                      }`}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="font-medium uppercase tracking-wider text-xs">
                      PILIH SEMUA ({selectedItems.length}/{items.length})
                    </span>
                  </button>

                  {selectedItems.length > 0 && (
                    <button
                      type="button"
                      onClick={removeSelectedItems}
                      className="text-xs font-mono text-zinc-500 hover:text-red-400 transition-colors uppercase cursor-pointer"
                    >
                      Hapus Pilihan ({selectedItems.length})
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {items.map((item) => {
                    const isSelected = selectedItemIds.includes(item.id);
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        className={`rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all shadow-sm group border ${
                          isSelected
                            ? "bg-[#0A0A0A] border-[#222222] hover:bg-[#0E0E0E]"
                            : "bg-[#080808] border-[#161616] opacity-75 hover:opacity-100"
                        }`}
                      >
                        {/* Checkbox & Product Image & Details */}
                        <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => toggleSelectItem(item.id)}
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                              isSelected
                                ? "bg-white border-white text-black"
                                : "bg-[#161616] border-[#333333] text-transparent hover:border-[#666]"
                            }`}
                            aria-label={isSelected ? "Batalkan pilihan item" : "Pilih item"}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>

                          <Link
                            href={`/product/${item.productId || item.id}`}
                            className="relative w-24 h-24 sm:w-28 sm:h-28 bg-[#141414] rounded-xl overflow-hidden shrink-0 flex items-center justify-center transition-colors"
                          >
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 96px, 112px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </Link>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                            <Link
                              href={`/store/${getStoreSlug((item as any).storeName || item.sellerName || item.brand)}`}
                              className="text-[#BFDD25] hover:underline"
                            >
                              {(item as any).storeName || item.sellerName || item.brand}
                            </Link>
                            <span className="text-[#555]">•</span>
                            <span className="text-[#888888]">{item.category || "IEM"}</span>
                          </div>
                          <Link
                            href={`/product/${item.productId || item.id}`}
                            className="font-sans text-base font-medium tracking-tight text-white hover:text-[#BFDD25] transition-colors leading-snug"
                          >
                            {item.name}
                          </Link>
                          <span className="text-xs font-mono text-[#777777] mt-1 uppercase">
                            Varian: {item.variant || "Standard"}
                          </span>
                          <span className="font-mono font-bold text-sm text-[#BFDD25] mt-2 sm:hidden">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Stepper & Price / Remove */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-2 sm:pt-0">
                        <div className="flex items-center gap-3">
                          {/* Modern Pill Stepper */}
                          <div className="flex items-center bg-[#141414] rounded-full p-1">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#222222] transition-colors font-mono text-sm font-bold cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-mono text-xs font-bold text-white select-none">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#222222] transition-colors font-mono text-sm font-bold cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 rounded-full text-[#666666] hover:text-red-400 hover:bg-[#141414] transition-colors cursor-pointer"
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
                  );
                })}
                </AnimatePresence>

                {/* Return to Shop Banner */}
                <div className="mt-2 p-6 bg-[#0A0A0A] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#141414] flex items-center justify-center text-[#BFDD25] shrink-0">
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
                    className="px-4 py-2 rounded-full bg-[#141414] hover:bg-[#1e1e1e] font-mono text-xs font-bold uppercase tracking-wider text-white hover:text-[#BFDD25] whitespace-nowrap transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <span>Tambah Produk Lain</span>
                    <KeyboardArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* RIGHT COLUMN: Order Summary & Checkout Action */}
              <div className="w-full lg:w-1/3">
                <div className="bg-[#0A0A0A] rounded-2xl p-6 lg:p-8 space-y-6 sticky top-28 shadow-lg">
                  <div>
                    <h3 className="font-heading text-lg font-bold uppercase tracking-wider text-white">
                      {t("cart.summary")}
                    </h3>
                    <p className="text-xs text-[#777777] font-mono mt-1">
                      Transaksi terenkripsi dan aman via Escrow TonalZone.
                    </p>
                  </div>

                  {/* Promo Code Input */}
                  <form onSubmit={handleApplyPromo} className="space-y-2">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA] font-bold">
                      Kode Promo / Voucher
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Contoh: TONAL10"
                        className="bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-full text-xs font-mono text-white placeholder:text-[#666] uppercase px-4 py-2.5 flex-1 outline-none transition-all"
                      />
                      <button
                        type="submit"
                        className="bg-[#1c1c1c] hover:bg-white hover:text-black text-white text-xs font-mono font-bold uppercase px-5 py-2.5 rounded-full transition-colors cursor-pointer"
                      >
                        Gunakan
                      </button>
                    </div>
                    {promoMessage && (
                      <p className={`text-[10px] font-mono ${promoMessage.includes("BERHASIL") ? "text-[#BFDD25]" : "text-red-400"}`}>
                        {promoMessage}
                      </p>
                    )}
                  </form>

                  {/* Financial Breakdown */}
                  <div className="space-y-3 pt-2 text-xs font-mono">
                    <div className="flex justify-between text-[#888888]">
                      <span>{t("cart.subtotal")}</span>
                      <span className="text-white font-bold">{formatPrice(subtotal)}</span>
                    </div>

                    {isDemoRp1 ? (
                      <div className="flex justify-between text-emerald-400">
                        <span>Voucher Demo Khusus</span>
                        <span className="font-bold">Potongan Sisa Jadi Rp 1</span>
                      </div>
                    ) : discount > 0 ? (
                      <div className="flex justify-between text-emerald-400">
                        <span>Diskon ({discount * 100}%)</span>
                        <span className="font-bold">-{formatPrice(discountAmount)}</span>
                      </div>
                    ) : null}

                    <div className="flex justify-between text-[#888888]">
                      <span>{t("cart.shipping")}</span>
                      <span className="text-[#BFDD25] font-bold">GRATIS</span>
                    </div>

                    <div className="flex justify-between items-center pt-4 text-sm font-sans">
                      <span className="font-bold text-white uppercase">{t("cart.total")}</span>
                      <span className="font-mono text-xl font-bold text-[#BFDD25] drop-shadow-[0_0_8px_rgba(191,221,37,0.3)]">
                        {isDemoRp1 ? "Rp 1" : formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  {selectedItems.length > 0 ? (
                    <MotionButton
                      href="/checkout"
                      variant="neon"
                      className="w-full text-center py-4 rounded-full flex items-center justify-center gap-2 group"
                    >
                      <span>LANJUT KE PEMBAYARAN ({selectedItems.length})</span>
                      <KeyboardArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                    </MotionButton>
                  ) : (
                    <button
                      disabled
                      className="w-full text-center py-4 rounded-full flex items-center justify-center gap-2 font-mono text-xs font-bold uppercase tracking-wider bg-[#141414] text-[#666666] border border-[#222222] cursor-not-allowed select-none"
                    >
                      <span>PILIH PRODUK DAHULU (0)</span>
                    </button>
                  )}

                  <div className="pt-2 flex items-center justify-center gap-2 text-[10px] font-mono text-[#555555] uppercase tracking-wider text-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <span>100% Produk Original & Bergaransi Resmi</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* EMPTY CART STATE */
            <div className="text-center py-20 bg-[#0A0A0A] rounded-2xl max-w-xl mx-auto p-8 space-y-6 shadow-md">
              <div className="w-16 h-16 bg-[#141414] rounded-2xl flex items-center justify-center mx-auto text-[#BFDD25]">
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
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full group"
              >
                <span>JELAJAHI KATALOG PRODUK</span>
                <KeyboardArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
              </MotionButton>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
