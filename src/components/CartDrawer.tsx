"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import MotionButton from "./MotionButton";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";

interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialItem?: any;
}

export default function CartDrawer({ isOpen: propIsOpen, onClose: propOnClose }: CartDrawerProps) {
  const { t } = useLanguage();
  const { formatPrice } = useLocation();
  const { items, updateQuantity, removeFromCart, subtotal, isCartOpen, closeCart } = useCart();
  
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

  const discountAmount = subtotal * discount;
  const total = Math.max(0, subtotal - discountAmount);

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

          {/* Off-Canvas Slide-over Panel (Nike/Adidas style) */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-screen w-full sm:w-[480px] md:w-[520px] bg-[#111111] border-l border-[#262626] z-[100] flex flex-col shadow-2xl text-[#FAF9F6] font-sans selection:bg-[#D4FF00] selection:text-[#0e0e0e]"
          >
            {/* 1. Header */}
            <div className="p-6 border-b border-[#222] flex items-center justify-between shrink-0 bg-[#0e0e0e]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-[#D4FF00]">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-heading text-lg font-medium uppercase tracking-wider text-[#FAF9F6] leading-none">
                    {t("cart.yourCart")}
                  </h2>
                  <span className="text-[10px] font-mono text-[#FAF9F6]/50 uppercase">
                    {items.reduce((acc, i) => acc + i.quantity, 0)} {t("cart.items")}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-3 py-1.5 border border-[#333] hover:border-[#D4FF00] rounded-lg text-xs font-mono text-[#FAF9F6]/70 hover:text-[#D4FF00] transition-colors flex items-center gap-1.5 cursor-pointer uppercase"
              >
                <span>{t("cart.close")}</span>
                <span className="text-sm font-bold">×</span>
              </button>
            </div>

            {/* 2. Scrollable Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4 no-scrollbar">
              {items.length > 0 ? (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#161616] border border-[#222] hover:border-[#333] rounded-xl p-4 flex gap-4 relative group transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-20 bg-[#0d0d0d] border border-[#262626] rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex flex-col flex-grow min-w-0 pr-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-medium text-[#D4FF00] uppercase tracking-[0.2em]">
                          {item.brand}
                        </span>
                        {item.sellerName && (
                          <span className="text-[8px] font-mono text-[#888] px-1.5 py-0.2 bg-[#222] rounded">
                            {item.sellerName}
                          </span>
                        )}
                      </div>
                      <h4 className="font-sans text-[13px] font-normal tracking-wide text-[#FAF9F6] truncate leading-relaxed mt-0.5">
                        {item.name}
                      </h4>
                      <span className="text-[10px] font-mono text-[#FAF9F6]/50 uppercase tracking-wider mt-0.5">
                        {item.variant}
                      </span>

                      {/* Price & Quantity Controls */}
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-mono font-medium text-xs tracking-wider text-[#D4FF00]">
                          {formatPrice(item.price * item.quantity)}
                        </span>

                        <div className="flex items-center border border-[#333] bg-[#111] rounded-md overflow-hidden h-7">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center text-[#FAF9F6]/70 hover:text-white hover:bg-[#222] font-mono text-sm font-medium cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-mono text-[11px] font-medium text-[#FAF9F6] select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#FAF9F6]/70 hover:text-white hover:bg-[#222] font-mono text-sm font-medium cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Item Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="absolute top-3 right-3 text-[#FAF9F6]/40 hover:text-red-400 p-1 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#161616] border border-[#262626] flex items-center justify-center text-[#FAF9F6]/30 mb-6 mx-auto">
                    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                    </svg>
                  </div>
                  <p className="font-mono text-xs text-[#FAF9F6]/50 uppercase mb-4">{t("cart.empty")}</p>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 bg-[#222] hover:bg-[#333] border border-[#333] hover:border-[#D4FF00] text-xs font-mono font-bold text-[#D4FF00] rounded-lg transition-colors cursor-pointer uppercase"
                  >
                    {t("cart.continueShopping")}
                  </button>
                </div>
              )}
            </div>

            {/* 3. Footer / Checkout Area */}
            {items.length > 0 && (
              <div className="p-6 border-t border-[#222] bg-[#0e0e0e] space-y-4 shrink-0">
                {/* Promo Code Box */}
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder={t("cart.promoPlaceholder")}
                    className="bg-[#111] border border-[#333] focus:border-[#D4FF00] rounded-lg px-3 py-2 text-[11px] font-mono text-[#FAF9F6] outline-none flex-grow uppercase transition-colors"
                  />
                  <button
                    type="submit"
                    className="bg-[#222] hover:bg-[#333] border border-[#444] text-[#FAF9F6] hover:text-[#D4FF00] font-mono text-[11px] font-medium tracking-wider px-3 py-2 rounded-lg transition-colors uppercase cursor-pointer shrink-0"
                  >
                    {t("cart.apply")}
                  </button>
                </form>
                {promoMessage && (
                  <p className={`text-[10px] font-mono font-normal tracking-wide -mt-2 ${promoMessage.includes("[SUCCESS]") ? "text-[#D4FF00]" : "text-red-400"}`}>
                    {promoMessage}
                  </p>
                )}

                {/* Totals */}
                <div className="space-y-1.5 font-mono text-xs text-[#FAF9F6]/80">
                  <div className="flex justify-between">
                    <span>{t("cart.subtotal")}</span>
                    <span className="font-medium tracking-wide">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#D4FF00]">
                      <span>{t("cart.discount")} ({discount * 100}%)</span>
                      <span className="font-medium tracking-wide">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-[#222] text-sm">
                    <span className="font-medium tracking-wider text-[#FAF9F6]">{t("cart.total")}</span>
                    <span className="font-mono text-xl font-semibold tracking-wide text-[#D4FF00]">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <MotionButton
                  href="/checkout"
                  onClick={onClose}
                  variant="neon"
                  className="w-full py-4 text-xs font-semibold tracking-[0.2em] uppercase rounded-xl shadow-[0_0_20px_rgba(212,255,0,0.15)]"
                >
                  {t("cart.proceedToCheckout")}
                </MotionButton>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
