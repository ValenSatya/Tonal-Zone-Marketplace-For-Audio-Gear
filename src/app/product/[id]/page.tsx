"use client";

import React, { useState, useEffect, useMemo } from "react";
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

  const availableTerminations = useMemo(() => {
    if (!product) return ["3.5mm SE", "4.4mm BAL"];
    const term = (product.cableTermination || "").toLowerCase();
    const cat = (product.category || "").toLowerCase();

    if (term.includes("bluetooth") || term.includes("wireless") || cat.includes("tws")) {
      return ["Wireless Bluetooth (aptX Adaptive)", "3.5mm Wired Analog"];
    }
    if (term.includes("freedsp") || term.includes("usb-c")) {
      return ["FreeDSP USB-C (Interactive DSP)", "3.5mm SE Analog", "4.4mm BAL (Pentaconn)"];
    }
    if (term.includes("modular") || (term.includes("3.5") && term.includes("4.4"))) {
      return ["3.5mm SE (Modular Plug)", "4.4mm BAL (Balanced Plug)"];
    }
    if (term.includes("6.35")) {
      return ["3.5mm SE (with 6.35mm Adapter)", "4.4mm BAL (Pentaconn)"];
    }
    return ["3.5mm SE (Standard)", "4.4mm BAL (Pentaconn)"];
  }, [product]);

  useEffect(() => {
    if (availableTerminations.length > 0 && !availableTerminations.includes(selectedTermination)) {
      setSelectedTermination(availableTerminations[0]);
    }
  }, [availableTerminations, selectedTermination]);

  useEffect(() => {
    setSelectedVariant(0);
    async function loadProductData() {
      setIsLoading(true);
      // 1. Authoritative lookup by ID / alias
      let found = await fetchProductByIdFromDb(rawId);

      // 2. Secondary fallback / recommendations loading
      const all = await fetchProductsFromDb();
      if (!found && all.length > 0) {
        const norm = rawId.toLowerCase().replace(/[^a-z0-9]/g, "");
        const norm3 = norm.replace(/iii/g, "3").replace(/ii/g, "2");
        found =
          all.find((p) => {
            const pNorm = p.id.toLowerCase().replace(/[^a-z0-9]/g, "");
            const pNorm3 = pNorm.replace(/iii/g, "3").replace(/ii/g, "2");
            const pNameNorm = p.name.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/iii/g, "3").replace(/ii/g, "2");
            return (
              p.id === rawId ||
              pNorm === norm ||
              pNorm3 === norm3 ||
              pNorm3.includes(norm3) ||
              norm3.includes(pNorm3) ||
              pNameNorm.includes(norm3)
            );
          }) || null;
      }

      setProduct(found || null);
      if (found) {
        const sameCategory = all.filter((p) => p.id !== found!.id && p.category === found!.category);
        const others = sameCategory.length >= 4
          ? sameCategory.slice(0, 4)
          : [...sameCategory, ...all.filter((p) => p.id !== found!.id && p.category !== found!.category)].slice(0, 4);
        setRelatedProducts(others);
      } else {
        setRelatedProducts(all.slice(0, 4));
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
    const sellerName = currentOffer ? currentOffer.sellerName : (product.storeName || "Official Merchant");
    const sellerId = currentOffer ? currentOffer.id : (product.storeName ? `store-${product.id}` : "official");
    const cartItemId = `${product.id}-${currentOffer?.id || "default"}-${selectedTermination.replace(/\s+/g, "_")}`;
    addToCart({
      id: cartItemId,
      productId: product.id,
      name: `${product.name} (${selectedTermination})`,
      brand: product.brand,
      category: product.category,
      price: chosenPrice,
      variant: selectedTermination,
      sellerId: sellerId,
      sellerName: sellerName,
      image: product.image,
    });
    openCart();
    showToast(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    const chosenPrice = currentOffer ? currentOffer.price : product.price;
    const sellerName = currentOffer ? currentOffer.sellerName : (product.storeName || "Official Merchant");
    const sellerId = currentOffer ? currentOffer.id : (product.storeName ? `store-${product.id}` : "official");
    const cartItemId = `${product.id}-${currentOffer?.id || "default"}-${selectedTermination.replace(/\s+/g, "_")}`;
    addToCart({
      id: cartItemId,
      productId: product.id,
      name: `${product.name} (${selectedTermination})`,
      brand: product.brand,
      category: product.category,
      price: chosenPrice,
      variant: selectedTermination,
      sellerId: sellerId,
      sellerName: sellerName,
      image: product.image,
    });
    router.push("/checkout");
  };

  const handleChatSeller = () => {
    if (!product) return;
    const storeName = currentOffer ? currentOffer.sellerName : (product.storeName || "Official Store");
    router.push(`/messages?seller=${encodeURIComponent(storeName)}&product=${encodeURIComponent(product.id)}`);
  };

  const offers: Offer[] = useMemo(() => {
    if (!product) return [];

    const baseOffers: Offer[] = [
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
    ];

    if (typeof window !== "undefined") {
      try {
        const custom = localStorage.getItem("tonalzone_custom_products");
        if (custom) {
          const list = JSON.parse(custom);
          const found = list.find((it: any) => it.name.toLowerCase() === product.name.toLowerCase() || it.id === product.id);
          if (found) {
            let storeName = "AudioZone";
            const storedUser = localStorage.getItem("tonalzone_user");
            if (storedUser) {
              const u = JSON.parse(storedUser);
              if (u.storeName) storeName = u.storeName;
            }
            baseOffers.unshift({
              id: "off-custom-seller",
              sellerName: storeName,
              sellerType: "AUTHORIZED",
              condition: found.condition || "Brand New Sealed",
              price: found.priceUSD || product.price,
            });
          }
        }
      } catch (e) {}
    }

    return baseOffers;
  }, [product]);

  const variants = useMemo(() => {
    if (!product) return [];
    const imgs = Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image];
    const defaultLabels = [
      "OVERVIEW",
      "DETAIL VIEW",
      "ACOUSTIC CAVITY",
      "ACCESSORIES & PACKAGING",
      "EXPLODED BLUEPRINT",
    ];
    return imgs.map((img, idx) => ({
      label: defaultLabels[idx] || `VIEW 0${idx + 1}`,
      image: img,
    }));
  }, [product]);

  const currentOffer = offers.find((o) => o.id === selectedOfferId) || offers[0];

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#030303] text-[#FAF9F6] font-sans">
        <Navbar />
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square bg-[#030303] border border-[#1c1c1c]" />
            <div className="space-y-6">
              <div className="h-6 w-32 bg-[#050505]" />
              <div className="h-12 w-3/4 bg-[#050505]" />
              <div className="h-20 w-full bg-[#050505]" />
              <div className="h-10 w-48 bg-[#050505]" />
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#030303] text-[#FAF9F6] font-sans flex flex-col justify-between">
        <Navbar />
        <div className="max-w-[800px] mx-auto px-6 py-28 text-center flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#050505] border border-[#1c1c1c] flex items-center justify-center mb-6 text-2xl shadow-xl">
            🔍
          </div>
          <span className="text-xs font-mono text-[#BFDD25] uppercase tracking-widest block mb-2 font-semibold">
            Katalog IEM Tonal Zone
          </span>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4 uppercase tracking-tight">
            Produk Tidak Ditemukan
          </h1>
          <p className="text-sm text-[#888] font-sans max-w-md mx-auto mb-8 leading-relaxed">
            Produk yang Anda tuju tidak tersedia dalam katalog atau tautan pencarian tidak lagi aktif.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/collection"
              className="px-6 py-3.5 bg-[#BFDD25] hover:bg-white text-black font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(191,221,37,0.3)]"
            >
              Jelajahi Semua Koleksi
            </Link>
            <Link
              href="/search"
              className="px-6 py-3.5 bg-[#050505] hover:bg-[#080808] border border-[#1c1c1c] hover:border-[#333] text-white font-mono text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Buka Pencarian Catalog →
            </Link>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-20 w-full text-left border-t border-[#1c1c1c] pt-10">
              <h3 className="text-xs font-mono uppercase tracking-widest text-[#777] mb-6">
                Rekomendasi Audiophile Teratas
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030303] text-[#FAF9F6] selection:bg-[#FAF9F6] selection:text-[#030303] font-sans">
      <Navbar />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-50 bg-[#050505] border border-[#444444] text-[#FAF9F6] px-5 py-3 shadow-2xl flex items-center gap-3 font-mono text-xs"
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
            <div className="aspect-square border border-[#1c1c1c] bg-[#050505] relative overflow-hidden flex items-center justify-center group">
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
                      className={`w-20 h-20 sm:w-24 sm:h-24 bg-[#030303] border ${
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
                <div className="flex text-[#BFDD25]">
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
                {availableTerminations.map((termOption) => {
                  const isChosen = selectedTermination === termOption;
                  return (
                    <button
                      key={termOption}
                      type="button"
                      onClick={() => setSelectedTermination(termOption)}
                      className={`px-4 py-2.5 border font-mono text-xs uppercase tracking-widest transition-colors cursor-pointer ${
                        isChosen
                          ? "border-white bg-[#050505] text-[#FAF9F6] font-bold"
                          : "border-[#222222] bg-[#050505] text-[#555555] hover:border-[#444444] hover:text-[#FAF9F6]"
                      }`}
                    >
                      {termOption}
                    </button>
                  );
                })}
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
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#888888] font-semibold">
                  Pilih Penjual ({offers.length} Toko Tersedia)
                </span>
                <span className="text-[11px] font-mono text-[#666]">
                  Garansi & Stok Terverifikasi
                </span>
              </div>

              <div className="relative">
                {/* Click outside backdrop */}
                {isOffersOpen && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOffersOpen(false)}
                  />
                )}

                <button
                  type="button"
                  onClick={() => setIsOffersOpen(!isOffersOpen)}
                  className={`w-full bg-[#050505] border rounded-xl p-3.5 text-left flex items-center justify-between transition-all cursor-pointer outline-none focus:outline-none ${
                    isOffersOpen ? "border-[#444] bg-[#050505]" : "border-[#222222] hover:border-[#383838]"
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-semibold text-sm text-white truncate">
                        {currentOffer?.sellerName}
                      </span>
                      {currentOffer?.sellerType === "OFFICIAL" && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded shrink-0">
                          Official
                        </span>
                      )}
                      {currentOffer?.sellerType === "AUTHORIZED" && (
                        <span className="text-[10px] font-mono text-[#aaa] bg-[#050505] px-1.5 py-0.5 rounded shrink-0">
                          Authorized
                        </span>
                      )}
                      {currentOffer?.sellerType === "INDIVIDUAL" && (
                        <span className="text-[10px] font-mono text-[#888] bg-[#050505] px-1.5 py-0.5 rounded shrink-0">
                          Pre-loved
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#777] mt-0.5 truncate font-sans">
                      {currentOffer?.condition}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-semibold text-sm text-white">
                      {formatPrice(currentOffer ? currentOffer.price : product.price)}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      className={`text-[#777] transition-transform duration-200 ${
                        isOffersOpen ? "rotate-180 text-white" : ""
                      }`}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </button>

                <AnimatePresence>
                  {isOffersOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute left-0 right-0 top-full mt-1.5 bg-[#050505] border border-[#1c1c1c] rounded-xl shadow-2xl z-50 overflow-hidden p-1.5 space-y-1"
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
                            className={`w-full flex items-center justify-between p-3 rounded-lg text-left cursor-pointer transition-colors outline-none focus:outline-none ${
                              isSelected
                                ? "bg-[#1c1c1c] text-white"
                                : "text-[#888] hover:bg-[#050505] hover:text-white"
                            }`}
                          >
                            <div className="min-w-0 flex-1 pr-3">
                              <div className="flex items-center gap-2">
                                <span className={`font-sans font-medium text-xs sm:text-sm truncate ${isSelected ? "text-white font-semibold" : "text-[#ddd]"}`}>
                                  {offer.sellerName}
                                </span>
                                {offer.sellerType === "OFFICIAL" && (
                                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded shrink-0">
                                    Official
                                  </span>
                                )}
                                {offer.sellerType === "AUTHORIZED" && (
                                  <span className="text-[9px] font-mono text-[#aaa] bg-[#050505] px-1.5 py-0.5 rounded shrink-0">
                                    Authorized
                                  </span>
                                )}
                                {offer.sellerType === "INDIVIDUAL" && (
                                  <span className="text-[9px] font-mono text-[#888] bg-[#050505] px-1.5 py-0.5 rounded shrink-0">
                                    Pre-loved
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#666] mt-0.5 truncate font-sans">
                                {offer.condition}
                              </p>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0">
                              <span className="font-mono font-medium text-xs sm:text-sm text-white">
                                {formatPrice(offer.price)}
                              </span>
                              {isSelected ? (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400 shrink-0">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              ) : (
                                <div className="w-[15px]" />
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
                className="w-full mt-2.5 py-2.5 px-4 bg-[#050505] hover:bg-[#050505] border border-[#222222] hover:border-[#383838] text-[#888888] hover:text-white font-sans text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer outline-none focus:outline-none"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Chat Penjual</span>
              </button>
            </div>

            {/* Action Buttons with Motion Diagonal Wipe Animations */}
            <div className="grid grid-cols-2 gap-4 mb-4">
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

            {/* Squiglink Frequency Response Secondary CTA (PRD FR-03 & Design Guide) */}
            {product.squiglinkUrl && (
              <a
                href={product.squiglinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mb-6 py-3 px-4 border border-[#333333] hover:border-[#BFDD25] bg-[#050505] hover:bg-[#0a0a0a] text-[#c4c7c8] hover:text-white transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  {/* Waveform vector icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#BFDD25]">
                    <path d="M2 12h3l2-6 4 12 4-8 2 5 3-3h2" />
                  </svg>
                  <span className="font-mono text-xs uppercase tracking-widest font-semibold">
                    Cek Tonal Graph di Squiglink
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#888888] group-hover:text-[#BFDD25] transition-colors">
                  <span>Open Target</span>
                  <span>↗</span>
                </div>
              </a>
            )}

            {/* Security Notice with Crisp Vector Icons */}
            <div className="flex flex-col gap-3 pt-4 border-t border-[#1c1c1c] mb-8">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#555555]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span>SECURE ENCRYPTED TRANSACTION</span>
              </div>
              <div className="flex items-center gap-2 text-[#555555]">
                <div className="px-2 py-1 border border-[#222222] bg-[#050505] flex items-center justify-center text-[9px] font-mono tracking-widest">VISA</div>
                <div className="px-2 py-1 border border-[#222222] bg-[#050505] flex items-center justify-center text-[9px] font-mono tracking-widest">MASTERCARD</div>
                <div className="px-2 py-1 border border-[#222222] bg-[#050505] flex items-center justify-center text-[9px] font-mono tracking-widest">BCA VIRTUAL</div>
                <div className="px-2 py-1 border border-[#222222] bg-[#050505] flex items-center justify-center text-[9px] font-mono tracking-widest">QRIS</div>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#1c1c1c]">
          <h2 className="font-heading text-2xl md:text-3xl uppercase tracking-wider text-white">
            DETAIL SPECIFICATIONS
          </h2>
          {product.squiglinkUrl && (
            <a
              href={product.squiglinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-xs text-[#BFDD25] hover:underline"
            >
              <span>Explore Squiglink Tonal Response</span>
              <span>↗</span>
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: ACOUSTIC ENGINE & DRIVERS */}
          <div className="bg-[#050505] border border-[#1c1c1c] p-6 space-y-4">
            <span className="text-[#888888] font-mono text-xs uppercase tracking-[0.2em] font-bold block mb-4">
              ACOUSTIC ENGINE & DRIVERS
            </span>
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between items-start py-1.5 border-b border-[#141414] gap-2">
                <span className="text-[#555555] shrink-0">Driver Config</span>
                <span className="text-white font-medium text-right">{product.driverType || "High-Resolution Dynamic Driver"}</span>
              </div>
              <div className="flex justify-between items-start py-1.5 border-b border-[#141414] gap-2">
                <span className="text-[#555555] shrink-0">Tuning Profile</span>
                <span className="text-white font-medium text-right">{product.tuning || `${product.soundSignature || "Neutral"} Target`}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#141414]">
                <span className="text-[#555555]">Sound Profile</span>
                <span className="text-[#BFDD25] font-medium">{product.soundSignature ? `${product.soundSignature.replace(/_/g, " ")} Tuned` : "Neutral Reference"}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#141414]">
                <span className="text-[#555555]">Experience Tier</span>
                <span className="text-white font-medium">{product.experienceLevel ? `${product.experienceLevel} Tier` : "Audiophile Reference"}</span>
              </div>
            </div>
          </div>

          {/* Card 2: ELECTRICAL & ACOUSTIC RESPONSE */}
          <div className="bg-[#050505] border border-[#1c1c1c] p-6 space-y-4">
            <span className="text-[#888888] font-mono text-xs uppercase tracking-[0.2em] font-bold block mb-4">
              ELECTRICAL & FREQUENCY SPECS
            </span>
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between items-center py-1.5 border-b border-[#141414]">
                <span className="text-[#555555]">Freq Response</span>
                <span className="text-white font-medium">{product.frequencyResponse || "20Hz – 20,000Hz"}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#141414]">
                <span className="text-[#555555]">Impedance</span>
                <span className="text-white font-medium">{product.impedance || "16Ω – 32Ω (@1kHz)"}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#141414]">
                <span className="text-[#555555]">Sensitivity</span>
                <span className="text-white font-medium">{product.sensitivity || "119dB/Vrms (@1kHz)"}</span>
              </div>
              <div className="flex justify-between items-start py-1.5 border-b border-[#141414] gap-2">
                <span className="text-[#555555] shrink-0">Termination</span>
                <span className="text-white font-medium text-right">{product.cableTermination || "3.5mm SE / 0.78mm 2-Pin"}</span>
              </div>
            </div>
          </div>

          {/* Card 3: CHASSIS & SQUIGLINK ACCESS */}
          <div className="bg-[#050505] border border-[#1c1c1c] p-6 space-y-4">
            <span className="text-[#888888] font-mono text-xs uppercase tracking-[0.2em] font-bold block mb-4">
              CHASSIS & SQUIGLINK GRAPH
            </span>
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between items-start py-1.5 border-b border-[#141414] gap-2">
                <span className="text-[#555555] shrink-0">Chassis Build</span>
                <span className="text-white font-medium text-right">{product.material || "Precision CNC Acoustic Resin"}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#141414]">
                <span className="text-[#555555]">Warranty</span>
                <span className="text-white font-medium">1-Year Official Distributor</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#141414]">
                <span className="text-[#555555]">Authenticity</span>
                <span className="text-white font-medium">Verified Serial Card</span>
              </div>
              <div className="pt-2">
                <a
                  href={product.squiglinkUrl || "https://squig.link"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-[#111111] hover:bg-[#BFDD25] text-[#c4c7c8] hover:text-black border border-[#262626] flex items-center justify-center gap-2 transition-all font-mono text-[11px] font-bold uppercase tracking-wider"
                >
                  <span>Buka Squiglink Graph</span>
                  <span>↗</span>
                </a>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mb-12 p-8 bg-[#050505] border border-[#1c1c1c]">
          {/* Left: Overall Score */}
          <div>
            <div className="flex items-center gap-3">
              <span className="font-heading text-6xl md:text-7xl font-bold text-white leading-none">
                {product.rating || 4.9}
              </span>
              <span className="text-[#BFDD25] text-3xl">★</span>
            </div>
            <div className="mt-3 inline-block px-3 py-1 bg-[#050505] border border-[#222222] text-[10px] font-mono text-[#777777] uppercase tracking-widest font-bold">
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
                <div className="flex-1 h-2 bg-[#050505] overflow-hidden">
                  <div
                    style={{ width: bar.pct }}
                    className="h-full bg-[#BFDD25]"
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
              {[...Array(7)].map((_, i) => {
                const gallery = Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image];
                const shotImg = gallery[i % gallery.length];
                return (
                  <div
                    key={i}
                    className="aspect-square bg-[#050505] border border-[#1c1c1c] overflow-hidden"
                  >
                    <img
                      src={shotImg}
                      alt="Customer review setup"
                      className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity"
                    />
                  </div>
                );
              })}
              <div className="aspect-square bg-[#050505] border border-[#222222] flex items-center justify-center font-mono text-xs font-bold text-white cursor-pointer hover:border-[#444444] transition-colors">
                +14
              </div>
            </div>
          </div>
        </div>

        {/* 3 Authentic Audiophile Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#050505] border border-[#1c1c1c] p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white font-mono text-xs uppercase tracking-wider font-bold">
                @AUDIO_SURABAYA
              </span>
              <span className="text-[#BFDD25] text-xs">★★★★★</span>
            </div>
            <p className="text-xs font-sans text-[#777777] leading-relaxed italic">
              &ldquo;Tested paired with FiiO KA13 & SpinFit CP145. Pinna gain at 3kHz is well-controlled with zero harsh sibilance on female vocal tracks like Norah Jones.&rdquo;
            </p>
            <span className="text-[9px] font-mono text-[#444444] block">Verified Buyer • 4.4mm Balanced</span>
          </div>

          <div className="bg-[#050505] border border-[#1c1c1c] p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white font-mono text-xs uppercase tracking-wider font-bold">
                @VALEN_ACOUSTIC
              </span>
              <span className="text-[#BFDD25] text-xs">★★★★★</span>
            </div>
            <p className="text-xs font-sans text-[#777777] leading-relaxed italic">
              &ldquo;Solid CNC metal shell with zero pin wobble on the 2-pin socket. Sub-bass punch has clean texture without bleeding into lower-mids.&rdquo;
            </p>
            <span className="text-[9px] font-mono text-[#444444] block">Verified Buyer • 3.5mm SE</span>
          </div>

          <div className="bg-[#050505] border border-[#1c1c1c] p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white font-mono text-xs uppercase tracking-wider font-bold">
                @HEADFI_JKT
              </span>
              <span className="text-[#BFDD25] text-xs">★★★★★</span>
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
