"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import MotionButton from "@/components/MotionButton";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { fetchProductsFromDb, fetchProductByIdFromDb, CatalogProduct } from "@/lib/products-db";

interface Offer {
  id: string;
  sellerName: string;
  sellerType: "OFFICIAL" | "AUTHORIZED" | "INDIVIDUAL";
  condition: string;
  price: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { formatPrice } = useLocation();
  const { addToCart, openCart } = useCart();
  const { t } = useLanguage();

  const rawId = typeof params?.id === "string" ? params.id : "";
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<CatalogProduct[]>([]);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedTermination, setSelectedTermination] = useState("3.5mm SE");
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string>("off-1");

  useEffect(() => {
    async function loadProductData() {
      setIsLoading(true);
      const all = await fetchProductsFromDb();
      let found: CatalogProduct | null | undefined = all.find((p) => p.id === rawId);
      if (!found) {
        found = await fetchProductByIdFromDb(rawId);
      }
      if (!found && all.length > 0) {
        found = all[0];
      }

      setProduct(found || null);
      if (found) {
        const others = all.filter((p) => p.id !== found!.id).slice(0, 4);
        setRelatedProducts(others);
      }
      setIsLoading(false);
    }
    loadProductData();
  }, [rawId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleAddToCart = () => {
    if (!product) return;
    const chosenPrice = currentOffer ? currentOffer.price : product.price;
    addToCart({
      id: product.id,
      name: `${product.name} (${selectedTermination})`,
      price: chosenPrice,
      image: product.image,
      quantity: 1,
      storeName: currentOffer ? currentOffer.sellerName : (product.storeName || "Official Merchant"),
    } as any);
    openCart();
    showToast(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    const chosenPrice = currentOffer ? currentOffer.price : product.price;
    addToCart({
      id: product.id,
      name: `${product.name} (${selectedTermination})`,
      price: chosenPrice,
      image: product.image,
      quantity: 1,
      storeName: currentOffer ? currentOffer.sellerName : (product.storeName || "Official Merchant"),
    } as any);
    router.push("/checkout");
  };

  const handleChatSeller = () => {
    if (!product) return;
    router.push(`/messages?seller=${encodeURIComponent(currentOffer ? currentOffer.sellerName : (product.storeName || "Official Store"))}`);
  };

  const offers: Offer[] = product ? [
    {
      id: "off-1",
      sellerName: product.storeName || "Tonal Zone Official",
      sellerType: "OFFICIAL",
      condition: "Brand New — 1 Year Official Disty Warranty",
      price: product.price,
    },
    {
      id: "off-2",
      sellerName: "Bass Audio Jakarta",
      sellerType: "AUTHORIZED",
      condition: "Brand New Sealed — Local Disty",
      price: Math.round(product.price * 1.03),
    },
    {
      id: "off-3",
      sellerName: "Audiophile Lab Surabaya",
      sellerType: "INDIVIDUAL",
      condition: "Like New / Mint — 99% Complete Box",
      price: Math.round(product.price * 0.88),
    },
  ] : [];

  const currentOffer = offers.find((o) => o.id === selectedOfferId) || offers[0];

  if (isLoading || !product) {
    return (
      <main className="min-h-screen bg-[#080808] text-[#FAF9F6] font-sans">
        <Navbar />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square bg-[#0e0e0e] border border-[#1c1c1c]" />
            <div className="space-y-6">
              <div className="h-6 w-32 bg-[#181818]" />
              <div className="h-12 w-3/4 bg-[#181818]" />
              <div className="h-20 w-full bg-[#111111]" />
              <div className="h-10 w-48 bg-[#181818]" />
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const variants = [
    { label: "VARIAN 1", image: product.image },
    { label: "VARIAN 2", image: product.image },
    { label: "VARIAN 3", image: product.image },
  ];

  return (
    <main className="min-h-screen bg-[#080808] text-[#FAF9F6] selection:bg-[#FAF9F6] selection:text-[#080808] font-sans">
      <Navbar />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-50 bg-[#111111] border border-[#444444] text-[#FAF9F6] px-5 py-3 shadow-2xl flex items-center gap-3 font-mono text-xs"
          >
            <span className="w-2 h-2 bg-white" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO & PRODUCT CONFIGURATION */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-8 pb-16">
        {/* Back Navigation */}
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs font-mono text-[#555555] hover:text-white uppercase transition-colors inline-flex items-center gap-2 mb-8 cursor-pointer"
        >
          <span>←</span>
          <span>BACK TO CATALOG</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Image Display with Variants */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-square border border-[#1c1c1c] bg-[#0c0c0c] relative overflow-hidden flex items-center justify-center group">
              <img
                src={variants[selectedVariant]?.image || product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Top Left Marketplace Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                <span className="px-2.5 py-1 bg-black/90 text-white border border-[#333333] font-mono text-[10px] uppercase font-bold tracking-wider">
                  AUTHENTIC GEAR
                </span>
                <span className="px-2.5 py-1 bg-black/90 text-[#888888] border border-[#222222] font-mono text-[10px] uppercase font-bold tracking-wider">
                  DISTRIBUTOR RESMI
                </span>
              </div>

              {/* Bottom Right Photo Index Counter */}
              <div className="absolute bottom-4 right-4 bg-black/85 px-2.5 py-1 text-[10px] font-mono text-[#666666] border border-[#222222] z-10 uppercase tracking-wider">
                {selectedVariant + 1} / {variants.length} SHOTS
              </div>
            </div>

            {/* Thumbnail Variant Selector */}
            <div className="flex items-center gap-3 pt-2">
              {variants.map((v, idx) => {
                const isSelected = selectedVariant === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedVariant(idx)}
                    className="flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    <div
                      className={`w-20 h-20 sm:w-24 sm:h-24 bg-[#0e0e0e] border ${
                        isSelected
                          ? "border-white"
                          : "border-[#1c1c1c] group-hover:border-[#444444]"
                      } overflow-hidden relative transition-all duration-200 flex items-center justify-center p-1`}
                    >
                      <img
                        src={v.image}
                        alt={v.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span
                      className={`font-mono text-[9px] uppercase tracking-wider transition-colors ${
                        isSelected
                          ? "text-white font-bold"
                          : "text-[#555555] group-hover:text-[#FAF9F6]"
                      }`}
                    >
                      {v.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Product Details & Actions */}
          <div className="lg:col-span-6 pt-1 flex flex-col">
            {/* Top Badge & Rating */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <span className="w-6 h-[1px] bg-white" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#888888] font-bold">
                  {product.badge || "PRO SERIES"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex text-[#D4FF00]">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
                <span className="font-mono text-[#555555] text-xs mt-0.5">
                  {product.rating || 4.9} ({product.reviews || 128} Reviews)
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[#FAF9F6] mb-8 leading-[1.05]">
              {product.name}
            </h1>

            {/* Variant Selector (Termination Box Style) */}
            <div className="mb-8">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#666666] font-bold mb-3">
                Select Cable Termination
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTermination("3.5mm SE")}
                  className={`px-4 py-2.5 border font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer ${
                    selectedTermination === "3.5mm SE"
                      ? "border-white bg-[#141414] text-[#FAF9F6] font-bold"
                      : "border-[#222222] bg-[#0c0c0c] text-[#555555] hover:border-[#444444] hover:text-[#FAF9F6]"
                  }`}
                >
                  3.5mm SE (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTermination("4.4mm BAL")}
                  className={`px-4 py-2.5 border font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer ${
                    selectedTermination === "4.4mm BAL"
                      ? "border-white bg-[#141414] text-[#FAF9F6] font-bold"
                      : "border-[#222222] bg-[#0c0c0c] text-[#555555] hover:border-[#444444] hover:text-[#FAF9F6]"
                  }`}
                >
                  4.4mm BAL (Pentaconn)
                </button>
              </div>
            </div>

            {/* Price Row */}
            <div className="flex flex-col mb-8 border-b border-[#1c1c1c] pb-8">
              <span className="font-mono text-[10px] text-[#666666] uppercase tracking-widest mb-2">Price</span>
              <div className="flex items-baseline gap-4">
                <span className="font-heading text-4xl sm:text-5xl font-bold text-[#FAF9F6] tracking-tight">
                  {formatPrice(currentOffer ? currentOffer.price : product.price)}
                </span>
                <span className="font-mono text-lg sm:text-xl text-[#444444] line-through">
                  {formatPrice(Math.round((currentOffer ? currentOffer.price : product.price) * 1.25))}
                </span>
              </div>
            </div>

            {/* OFFERS DROPDOWN (PILIH TOKO) */}
            <div className="mb-6 w-full max-w-xl">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888] font-bold mb-3">
                Select Merchant ({offers.length} Verified Offers)
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsOffersOpen(!isOffersOpen)}
                  className={`w-full bg-[#0e0e0e] border border-[#222222] hover:border-[#444444] focus:border-white p-4 text-left flex items-center justify-between transition-all cursor-pointer ${
                    isOffersOpen ? "border-white" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-heading font-bold text-[#FAF9F6] text-sm uppercase tracking-wide">
                      {currentOffer?.sellerName}
                    </span>
                    <span className="font-mono text-[9px] text-[#666666] uppercase tracking-wider">
                      {currentOffer?.condition}
                    </span>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    className={`shrink-0 text-[#666666] transition-transform duration-200 ${
                      isOffersOpen ? "rotate-180 text-white" : ""
                    }`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                <AnimatePresence>
                  {isOffersOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute left-0 right-0 top-full mt-1 bg-[#0a0a0a] border border-[#262626] z-50 overflow-hidden p-1 space-y-0.5 divide-y divide-[#1c1c1c]"
                    >
                      {offers.map((offer) => {
                        const isSelected = selectedOfferId === offer.id;
                        return (
                          <button
                            key={offer.id}
                            type="button"
                            onClick={() => {
                              setSelectedOfferId(offer.id);
                              setIsOffersOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-3.5 text-left cursor-pointer transition-all ${
                              isSelected
                                ? "bg-[#181818] text-white font-semibold border-l-2 border-white"
                                : "text-[#777777] hover:bg-[#111111] hover:text-white"
                            }`}
                          >
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className={`font-heading font-bold text-xs uppercase tracking-wide ${isSelected ? "text-white" : "text-[#FAF9F6]"}`}>
                                  {offer.sellerName}
                                </span>
                                {offer.sellerType === "OFFICIAL" && (
                                  <span className="bg-[#FAF9F6] text-[#080808] text-[8px] font-mono px-1.5 py-0.5 uppercase tracking-widest font-bold">
                                    Official
                                  </span>
                                )}
                                {offer.sellerType === "AUTHORIZED" && (
                                  <span className="bg-[#222222] text-[#FAF9F6] text-[8px] font-mono px-1.5 py-0.5 uppercase tracking-widest">
                                    Authorized
                                  </span>
                                )}
                                {offer.sellerType === "INDIVIDUAL" && (
                                  <span className="bg-transparent border border-[#262626] text-[#666666] text-[8px] font-mono px-1.5 py-0.5 uppercase tracking-widest">
                                    Pre-loved
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-[9px] text-[#555555] uppercase tracking-wider">
                                {offer.condition}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-white text-xs tracking-tight">
                                {formatPrice(offer.price)}
                              </span>
                              {isSelected && (
                                <span className="text-white font-mono font-bold text-xs">✓</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Chat Seller Button */}
              <button
                type="button"
                onClick={handleChatSeller}
                className="w-full mt-3 py-3 px-4 bg-[#0c0c0c] hover:bg-[#161616] border border-[#222222] hover:border-[#444444] text-[#888888] hover:text-white font-mono text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Konsultasi dengan Penjual</span>
              </button>
            </div>

            {/* Action Buttons with Motion Diagonal Wipe Animations */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <MotionButton
                onClick={handleBuyNow}
                variant="light"
                className="w-full text-center"
              >
                BUY NOW
              </MotionButton>
              <MotionButton
                onClick={handleAddToCart}
                variant="dark"
                className="w-full text-center"
              >
                ADD TO CART
              </MotionButton>
            </div>

            {/* Security Notice with Crisp Vector Icons */}
            <div className="flex flex-col gap-3 pt-4 border-t border-[#1c1c1c] mb-8">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#555555]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span>SECURE ENCRYPTED TRANSACTION</span>
              </div>
              <div className="flex items-center gap-2 text-[#555555]">
                <div className="px-2 py-1 border border-[#222222] bg-[#0c0c0c] flex items-center justify-center text-[9px] font-mono tracking-widest">VISA</div>
                <div className="px-2 py-1 border border-[#222222] bg-[#0c0c0c] flex items-center justify-center text-[9px] font-mono tracking-widest">MASTERCARD</div>
                <div className="px-2 py-1 border border-[#222222] bg-[#0c0c0c] flex items-center justify-center text-[9px] font-mono tracking-widest">BCA VIRTUAL</div>
                <div className="px-2 py-1 border border-[#222222] bg-[#0c0c0c] flex items-center justify-center text-[9px] font-mono tracking-widest">QRIS</div>
              </div>
            </div>

            {/* Accordion Description */}
            <div className="border-t border-[#1c1c1c]">
              <details className="group" open>
                <summary className="flex justify-between items-center font-mono text-xs font-bold uppercase tracking-widest text-[#FAF9F6] cursor-pointer py-5 hover:text-white transition-colors list-none">
                  <span>Product Overview & Acoustical Target</span>
                  <span className="transition group-open:rotate-180 text-[#666666]">
                    <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="16"><path d="M6 9l6 6 6-6" /></svg>
                  </span>
                </summary>
                <div className="font-sans text-sm text-[#777777] leading-relaxed pb-6 max-w-xl space-y-3">
                  <p>
                    {product.description || "Professional in-ear monitoring system engineered for high-fidelity clinical environments and elite technical audio production."}
                  </p>
                  <p className="font-mono text-xs text-[#555555]">
                    Karakter suara: <span className="text-white font-bold">{product.soundSignature ? product.soundSignature.replace(/_/g, " ") : "NEUTRAL / REFERENCE"}</span>.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DETAIL SPECIFICATIONS */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 border-t border-[#1c1c1c]">
        <h2 className="font-heading text-2xl md:text-3xl uppercase tracking-wider text-white mb-8 pb-4 border-b border-[#1c1c1c]">
          DETAIL SPECIFICATIONS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: SPESIFICATION */}
          <div className="bg-[#0a0a0a] border border-[#1c1c1c] p-6 space-y-4">
            <span className="text-[#888888] font-mono text-xs uppercase tracking-[0.2em] font-bold block mb-4">
              ACOUSTIC ENGINE
            </span>
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between items-center py-1.5 border-b border-[#141414]">
                <span className="text-[#555555]">Sound Profile</span>
                <span className="text-white font-medium">{product.soundSignature ? `${product.soundSignature.replace(/_/g, " ")} Tuned` : "Triple-Beryllium DD"}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#141414]">
                <span className="text-[#555555]">Experience Tier</span>
                <span className="text-white font-medium">{product.experienceLevel ? `${product.experienceLevel} Tier` : "Audiophile Reference"}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#141414]">
                <span className="text-[#555555]">Gear Category</span>
                <span className="text-white font-medium">{product.category || "In-Ear Monitor"}</span>
              </div>
            </div>
          </div>

          {/* Card 2: WARRANTY */}
          <div className="bg-[#0a0a0a] border border-[#1c1c1c] p-6 space-y-4">
            <span className="text-[#888888] font-mono text-xs uppercase tracking-[0.2em] font-bold block mb-4">
              WARRANTY & AUTHENTICITY
            </span>
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between items-center py-1.5 border-b border-[#141414]">
                <span className="text-[#555555]">Coverage</span>
                <span className="text-white font-medium">1-Year Limited Disty Warranty</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#141414]">
                <span className="text-[#555555]">Cable Warranty</span>
                <span className="text-white font-medium">6-Months Replacement</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#141414]">
                <span className="text-[#555555]">Serial Verification</span>
                <span className="text-white font-medium">Original Authenticity Card</span>
              </div>
            </div>
          </div>

          {/* Card 3: BUILD SPECS */}
          <div className="bg-[#0a0a0a] border border-[#1c1c1c] p-6 space-y-4">
            <span className="text-[#888888] font-mono text-xs uppercase tracking-[0.2em] font-bold block mb-4">
              CHASSIS & TERMINATION
            </span>
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between items-center py-1.5 border-b border-[#141414]">
                <span className="text-[#555555]">Chassis Shell</span>
                <span className="text-white font-medium">Machined Aluminum / Resin</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#141414]">
                <span className="text-[#555555]">Connector Type</span>
                <span className="text-white font-medium">2-Pin 0.78mm Flush</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#141414]">
                <span className="text-[#555555]">Finish</span>
                <span className="text-white font-medium">Matte Anodized Gunmetal</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CUSTOMER REVIEWS (AUTHENTIC AUDIOPHILE COMMUNITY IMPRESSIONS) */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 border-t border-[#1c1c1c]">
        <h2 className="font-heading text-2xl md:text-3xl uppercase tracking-wider text-white mb-8 pb-4 border-b border-[#1c1c1c]">
          LISTENING IMPRESSIONS & REVIEWS
        </h2>

        {/* Rating Summary Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mb-12 p-8 bg-[#0a0a0a] border border-[#1c1c1c]">
          {/* Left: Overall Score */}
          <div>
            <div className="flex items-center gap-3">
              <span className="font-heading text-6xl md:text-7xl font-bold text-white leading-none">
                {product.rating || 4.9}
              </span>
              <span className="text-[#D4FF00] text-3xl">★</span>
            </div>
            <div className="mt-3 inline-block px-3 py-1 bg-[#141414] border border-[#222222] text-[10px] font-mono text-[#777777] uppercase tracking-widest font-bold">
              {product.reviews || 128} COMMUNITY REVIEWS
            </div>
          </div>

          {/* Middle: Rating Bars */}
          <div className="space-y-2 font-mono text-xs">
            {[
              { star: 5, pct: "88%" },
              { star: 4, pct: "10%" },
              { star: 3, pct: "2%" },
              { star: 2, pct: "0%" },
              { star: 1, pct: "0%" },
            ].map((bar) => (
              <div key={bar.star} className="flex items-center gap-3">
                <span className="w-3 text-[#555555]">{bar.star}</span>
                <div className="flex-1 h-2 bg-[#141414] overflow-hidden">
                  <div
                    style={{ width: bar.pct }}
                    className="h-full bg-[#D4FF00]"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Right: Picture From Customers */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#666666] block mb-3 font-bold">
              CUSTOMER DESK & RIG SHOTS
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-[#111111] border border-[#1c1c1c] overflow-hidden"
                >
                  <img
                    src={product.image}
                    alt="Customer review setup"
                    className="w-full h-full object-cover opacity-70"
                  />
                </div>
              ))}
              <div className="aspect-square bg-[#141414] border border-[#222222] flex items-center justify-center font-mono text-xs font-bold text-white cursor-pointer hover:border-[#444444] transition-colors">
                +14
              </div>
            </div>
          </div>
        </div>

        {/* 3 Authentic Audiophile Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0a0a0a] border border-[#1c1c1c] p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white font-mono text-xs uppercase tracking-wider font-bold">
                @AUDIO_SURABAYA
              </span>
              <span className="text-[#D4FF00] text-xs">★★★★★</span>
            </div>
            <p className="text-xs font-sans text-[#777777] leading-relaxed italic">
              &ldquo;Tested paired with FiiO KA13 & SpinFit CP145. Pinna gain at 3kHz is well-controlled with zero harsh sibilance on female vocal tracks like Norah Jones.&rdquo;
            </p>
            <span className="text-[9px] font-mono text-[#444444] block">Verified Buyer • 4.4mm Balanced</span>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1c1c1c] p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white font-mono text-xs uppercase tracking-wider font-bold">
                @VALEN_ACOUSTIC
              </span>
              <span className="text-[#D4FF00] text-xs">★★★★★</span>
            </div>
            <p className="text-xs font-sans text-[#777777] leading-relaxed italic">
              &ldquo;Solid CNC metal shell with zero pin wobble on the 2-pin socket. Sub-bass punch has clean texture without bleeding into lower-mids.&rdquo;
            </p>
            <span className="text-[9px] font-mono text-[#444444] block">Verified Buyer • 3.5mm SE</span>
          </div>

          <div className="bg-[#0a0a0a] border border-[#1c1c1c] p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white font-mono text-xs uppercase tracking-wider font-bold">
                @HEADFI_JKT
              </span>
              <span className="text-[#D4FF00] text-xs">★★★★★</span>
            </div>
            <p className="text-xs font-sans text-[#777777] leading-relaxed italic">
              &ldquo;Separation and layer positioning across busy orchestral passages is surprisingly accurate. Excellent value for this price bracket.&rdquo;
            </p>
            <span className="text-[9px] font-mono text-[#444444] block">Verified Buyer • 4.4mm Balanced</span>
          </div>
        </div>
      </section>

      {/* 4. YOU MAY ALSO LIKE */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 border-t border-[#1c1c1c]">
        <h2 className="font-heading text-2xl md:text-3xl uppercase tracking-wider text-white mb-8 pb-4 border-b border-[#1c1c1c]">
          YOU MAY ALSO LIKE
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-[18px] gap-y-8">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
