"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import MotionButton from "./MotionButton";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";
import { KeyboardArrowRight } from "@/components/ui/keyboard-arrow";

interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialItem?: any;
}

export default function CartDrawer({ isOpen: propIsOpen, onClose: propOnClose }: CartDrawerProps) {
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
    isCartOpen,
    closeCart,
  } = useCart();
  
  const isOpen = propIsOpen !== undefined ? propIsOpen : isCartOpen;
  const onClose = propOnClose || closeCart;

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "TONAL10" || promoCode.trim().toUpperCase() === "AUDIOPHILE") {
      setDiscount(0.1);
      setPromoMessage("[SUCCESS] 10% AUDIOPHILE DISCOUNT APPLIED");
    } else if (promoCode.trim() !== "") {
      setDiscount(0.05);
      setPromoMessage("[SUCCESS] 5% WELCOME DISCOUNT APPLIED");
    } else {
      setPromoMessage("[ERROR] INVALID PROMOTIONAL CODE");
    }
  };

  const discountAmount = selectedSubtotal * discount;
  const total = Math.max(0, selectedSubtotal - discountAmount);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] cursor-pointer"
          />

          {/* Off-Canvas Slide-over Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-screen w-full sm:w-[480px] md:w-[520px] bg-[#0A0A0A] z-[100] flex flex-col shadow-2xl text-[#FAF9F6] font-sans selection:bg-[#BFDD25] selection:text-[#030303]"
          >
            {/* 1. Header */}
            <div className="p-6 pb-4 flex items-center justify-between shrink-0 bg-[#0A0A0A]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#141414] flex items-center justify-center text-[#BFDD25]">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-heading text-base font-bold uppercase tracking-wider text-white leading-none">
                    {t("cart.yourCart")}
                  </h2>
                  <span className="text-[10px] font-mono text-[#888888] uppercase mt-1 block">
                    {items.reduce((acc, i) => acc + i.quantity, 0)} {t("cart.items")}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#141414] hover:bg-[#202020] text-[#888888] hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                aria-label={t("cart.close")}
              >
                <span className="text-base font-bold leading-none">×</span>
              </button>
            </div>

            {/* Multi-Select Action Bar */}
            {items.length > 0 && (
              <div className="px-6 py-2.5 bg-[#101010] border-y border-[#1C1C1C] flex items-center justify-between text-xs font-mono shrink-0">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2.5 text-zinc-300 hover:text-white cursor-pointer select-none transition-colors"
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
                  <span className="font-medium uppercase tracking-wider text-[11px]">
                    Pilih Semua ({selectedItems.length}/{items.length})
                  </span>
                </button>

                {selectedItems.length > 0 && (
                  <button
                    type="button"
                    onClick={removeSelectedItems}
                    className="text-[11px] font-mono text-zinc-500 hover:text-red-400 transition-colors uppercase cursor-pointer"
                  >
                    Hapus ({selectedItems.length})
                  </button>
                )}
              </div>
            )}

            {/* 2. Scrollable Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-3.5 no-scrollbar">
              {items.length > 0 ? (
                items.map((item) => {
                  const isSelected = selectedItemIds.includes(item.id);
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`rounded-2xl p-4 flex items-center gap-3.5 relative group transition-all shadow-sm border ${
                        isSelected
                          ? "bg-[#121212] border-[#2A2A2A]"
                          : "bg-[#0E0E0E] border-[#181818] opacity-70 hover:opacity-95"
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleSelectItem(item.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          isSelected
                            ? "bg-white border-white text-black shadow-sm"
                            : "bg-[#181818] border-[#383838] text-transparent hover:border-[#666]"
                        }`}
                        aria-label={isSelected ? "Batal pilih item" : "Pilih item"}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>

                      {/* Thumbnail */}
                      <div className="relative w-18 h-18 bg-[#181818] rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          sizes="72px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex flex-col flex-grow min-w-0 pr-6">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold text-[#BFDD25] uppercase tracking-[0.2em]">
                            {item.brand}
                          </span>
                          {item.sellerName && (
                            <span className="text-[8px] font-mono text-[#888] px-2 py-0.5 bg-[#181818] rounded-full truncate max-w-[140px]">
                              {item.sellerName}
                            </span>
                          )}
                        </div>
                        <h4 className="font-sans text-[13px] font-medium tracking-wide text-white truncate leading-relaxed mt-0.5">
                          {item.name}
                        </h4>
                        <span className="text-[10px] font-mono text-[#777777] uppercase tracking-wider mt-0.5 truncate">
                          {item.variant}
                        </span>

                        {/* Price & Quantity Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-mono font-bold text-xs tracking-wider text-[#BFDD25]">
                            {formatPrice(item.price * item.quantity)}
                          </span>

                          {/* Modern Pill Stepper */}
                          <div className="flex items-center bg-[#181818] rounded-full p-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#252525] font-mono text-xs font-bold transition-colors cursor-pointer"
                              aria-label="Decrease"
                            >
                              -
                            </button>
                            <span className="w-7 text-center font-mono text-xs font-bold text-white select-none">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#252525] font-mono text-xs font-bold transition-colors cursor-pointer"
                              aria-label="Increase"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Remove Item Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="absolute top-3 right-3 text-[#666666] hover:text-red-400 p-1.5 rounded-full hover:bg-[#1c1c1c] transition-colors cursor-pointer"
                        title="Remove"
                        aria-label="Remove item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </motion.div>
                  );
                })
              ) : (
                <div className="py-20 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#141414] flex items-center justify-center text-[#BFDD25] mb-4 mx-auto">
                    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                    </svg>
                  </div>
                  <p className="font-mono text-xs text-[#777777] uppercase mb-4">{t("cart.empty")}</p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-[#BFDD25] text-black text-xs font-mono font-bold rounded-full hover:bg-[#aecd20] transition-colors cursor-pointer uppercase shadow-[0_0_12px_rgba(191,221,37,0.3)] inline-flex items-center gap-1.5 group"
                  >
                    <span>{t("cart.continueShopping")}</span>
                    <KeyboardArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}
            </div>

            {/* 3. Footer / Checkout Area */}
            {items.length > 0 && (
              <div className="p-6 bg-[#0E0E0E] space-y-4 shrink-0 rounded-t-3xl shadow-2xl border-t border-[#1C1C1C]">
                {/* Promo Code Box */}
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder={t("cart.promoPlaceholder")}
                    className="bg-[#181818] rounded-full px-4 py-2.5 text-xs font-mono text-white outline-none flex-grow uppercase focus:ring-1 focus:ring-white/30 transition-all"
                  />
                  <button
                    type="submit"
                    className="bg-[#222222] hover:bg-white hover:text-black text-white font-mono text-xs font-bold tracking-wider px-4 py-2.5 rounded-full transition-colors uppercase cursor-pointer shrink-0"
                  >
                    {t("cart.apply")}
                  </button>
                </form>
                {promoMessage && (
                  <p className={`text-[10px] font-mono font-normal tracking-wide -mt-2 ${promoMessage.includes("[SUCCESS]") ? "text-emerald-400" : "text-red-400"}`}>
                    {promoMessage}
                  </p>
                )}

                {/* Totals based on selected items */}
                <div className="space-y-1.5 font-mono text-xs text-[#888888]">
                  <div className="flex justify-between">
                    <span>{t("cart.subtotal")} ({selectedItems.length} produk)</span>
                    <span className="font-bold text-white tracking-wide">{formatPrice(selectedSubtotal)}</span>
                  </div>
                  {discount > 0 && selectedSubtotal > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>{t("cart.discount")} ({discount * 100}%)</span>
                      <span className="font-bold tracking-wide">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 text-sm font-sans">
                    <span className="font-bold uppercase text-white">{t("cart.total")}</span>
                    <span className="font-mono text-xl font-bold tracking-wide text-white">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                {selectedItems.length > 0 ? (
                  <MotionButton
                    href="/checkout"
                    onClick={onClose}
                    variant="neon"
                    className="w-full py-3.5 text-xs font-bold tracking-[0.2em] uppercase rounded-full shadow-[0_0_20px_rgba(212,255,0,0.2)] flex items-center justify-center gap-2 group"
                  >
                    <span>{t("cart.proceedToCheckout")} ({selectedItems.length})</span>
                    <KeyboardArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                  </MotionButton>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full py-3.5 text-xs font-mono font-bold tracking-[0.2em] uppercase rounded-full bg-[#181818] text-zinc-600 border border-[#242424] cursor-not-allowed flex items-center justify-center select-none"
                  >
                    PILIH PRODUK DULU (0)
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
