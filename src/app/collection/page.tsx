"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { fetchProductsFromDb, CatalogProduct } from "@/lib/products-db";

const CATEGORIES = [
  "ALL PRODUCTS",
  "IN-EAR MONITORS",
  "TWS",
  "HEADPHONE",
  "DAC/AMP",
  "ACCESSORIES",
];

const BRANDS_FALLBACK = [
  "SENNHEISER",
  "64 AUDIO",
  "SONY",
  "EMPIRE EARS",
  "CHORD AUDIO",
  "EFFECT AUDIO",
  "MOONDROP",
  "TANGZU",
  "SIMGOT",
  "KIWI EARS",
];

const SIGNATURES = ["NEUTRAL", "WARM", "V_SHAPE", "BRIGHT", "BASSHEAD"];
const CONNECTIVITIES = ["WIRED (3.5MM)", "BALANCED (4.4MM)", "WIRELESS (BLUETOOTH)"];

const SORT_OPTIONS = [
  { value: "FEATURED", labelKey: "collection.featured" },
  { value: "NEWEST", labelKey: "collection.newestReleases" },
  { value: "BEST SELLING", labelKey: "collection.bestSelling" },
  { value: "PRICE: LOW TO HIGH", labelKey: "collection.priceLowHigh" },
  { value: "PRICE: HIGH TO LOW", labelKey: "collection.priceHighLow" },
  { value: "TOP RATED", labelKey: "collection.highestRating" },
];

function CustomSortDropdown({
  value,
  onChange,
  isOpen,
  onToggle,
  t,
}: {
  value: string;
  onChange: (val: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  t: (key: string) => string;
}) {
  const currentLabel = SORT_OPTIONS.find((o) => o.value === value)?.labelKey;

  return (
    <div className={`relative w-full ${isOpen ? "z-50" : ""}`}>
      <button
        type="button"
        onClick={onToggle}
        className={`w-full bg-[#0a0a0a] border border-[#222222] hover:border-[#383838] focus:border-[#FAF9F6] px-4 py-3 text-xs font-mono uppercase tracking-widest text-[#FAF9F6] text-left flex items-center justify-between transition-colors cursor-pointer ${
          isOpen ? "relative z-50 border-[#FAF9F6] bg-[#121212]" : ""
        }`}
      >
        <span className="truncate mr-2 font-bold">{currentLabel ? t(currentLabel) : t("collection.featured")}</span>
        <svg
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          className={`shrink-0 text-[#666666] transition-transform duration-200 ${isOpen ? "rotate-180 text-white" : ""}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={onToggle} />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute left-0 right-0 top-full mt-1 bg-[#0a0a0a] border border-[#262626] z-50 overflow-hidden p-1 space-y-0.5"
            >
              {SORT_OPTIONS.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={`w-full text-left px-3.5 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-between cursor-pointer border ${
                      isSelected
                        ? "bg-[#181818] text-[#FAF9F6] font-bold border-[#333333]"
                        : "text-[#666666] hover:text-[#FAF9F6] hover:bg-[#111111] border-transparent"
                    }`}
                  >
                    <span className="truncate mr-2">{t(opt.labelKey)}</span>
                    {isSelected && <span className="text-white font-mono font-bold text-xs shrink-0">✓</span>}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CollectionPage() {
  const { t } = useLanguage();
  const { formatPrice } = useLocation();

  // Dynamic Products state from Supabase DB
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [activeCategory, setActiveCategory] = useState("ALL PRODUCTS");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSignatures, setSelectedSignatures] = useState<string[]>([]);
  const [selectedConnectivities, setSelectedConnectivities] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [preOrderOnly, setPreOrderOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<number>(5000);
  const [sortOption, setSortOption] = useState("FEATURED");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [gridCols, setGridCols] = useState<number>(3);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Load persisted grid column preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tonalzone_collection_cols");
      if (saved) {
        const num = parseInt(saved, 10);
        if ([3, 4, 5].includes(num)) {
          setGridCols(num);
        }
      }
    } catch (e) {}
  }, []);

  const handleSetGridCols = (cols: number) => {
    setGridCols(cols);
    try {
      localStorage.setItem("tonalzone_collection_cols", String(cols));
    } catch (e) {}
  };

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const data = await fetchProductsFromDb();
      setProducts(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  const brandsList = useMemo(() => {
    const fromDb = Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort();
    return fromDb.length > 0 ? fromDb : BRANDS_FALLBACK;
  }, [products]);

  // Toggle Checkboxes
  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setCurrentPage(1);
  };

  const toggleSignature = (sig: string) => {
    setSelectedSignatures((prev) =>
      prev.includes(sig) ? prev.filter((s) => s !== sig) : [...prev, sig]
    );
    setCurrentPage(1);
  };

  const toggleConnectivity = (conn: string) => {
    setSelectedConnectivities((prev) =>
      prev.includes(conn) ? prev.filter((c) => c !== conn) : [...prev, conn]
    );
    setCurrentPage(1);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        // Category
        if (activeCategory !== "ALL PRODUCTS" && item.category !== activeCategory) {
          return false;
        }
        // Price
        if (item.price > priceRange) return false;
        // Brands
        if (selectedBrands.length > 0 && !selectedBrands.includes(item.brand)) {
          return false;
        }
        // Sound Signature
        if (selectedSignatures.length > 0 && !selectedSignatures.includes(item.soundSignature)) {
          return false;
        }
        // Rating
        if (ratingFilter && item.rating < 4.8) {
          return false;
        }
        // Availability
        if (inStockOnly && !item.inStock) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOption === "PRICE: LOW TO HIGH") return a.price - b.price;
        if (sortOption === "PRICE: HIGH TO LOW") return b.price - a.price;
        if (sortOption === "TOP RATED") return b.rating - a.rating;
        if (sortOption === "NEWEST") {
          return b.id.localeCompare(a.id);
        }
        if (sortOption === "BEST SELLING") {
          return b.reviews - a.reviews;
        }
        return 0; // FEATURED
      });
  }, [
    products,
    activeCategory,
    priceRange,
    selectedBrands,
    selectedSignatures,
    ratingFilter,
    inStockOnly,
    sortOption,
  ]);

  // Dynamic Items Per Page: Exactly 3 full rows based on selected grid columns
  const itemsPerPage = useMemo(() => {
    if (gridCols === 3) return 9;  // 3 full rows of 3
    if (gridCols === 4) return 12; // 3 full rows of 4
    if (gridCols === 5) return 15; // 3 full rows of 5
    return 9;
  }, [gridCols]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedProducts = filteredProducts.slice(
    (validCurrentPage - 1) * itemsPerPage,
    validCurrentPage * itemsPerPage
  );

  useEffect(() => {
    if (currentPage !== validCurrentPage && validCurrentPage > 0) {
      setCurrentPage(validCurrentPage);
    }
  }, [currentPage, validCurrentPage]);

  return (
    <div className="flex flex-col min-h-screen bg-[#080808] text-[#FAF9F6] font-sans selection:bg-[#FAF9F6] selection:text-[#080808] relative">
      {/* 1. Global Header */}
      <Navbar />

      {/* 2. Top Title Hero Section with Cinematic Audio Gear Background */}
      <section className="w-full relative border-b border-[#1c1c1c] overflow-hidden min-h-[380px] md:min-h-[460px] flex items-end pb-14 pt-20 px-6 lg:px-12 bg-[#080808]">
        {/* Background Image with Crisp Audio Gear Visibility */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src="/images/collection-hero-bg.jpg"
            alt="High-fidelity audio gear setup"
            className="w-full h-full object-cover object-center opacity-85 md:opacity-90"
          />
          {/* Targeted Vignette: Darken Left for Title & Bottom for Border Blend */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/75 md:via-[#080808]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/30 to-black/40" />
        </div>

        <div className="max-w-[1500px] mx-auto w-full relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
          <div>
            <h1 className="font-heading text-6xl md:text-8xl lg:text-[104px] font-bold uppercase tracking-tight text-[#FAF9F6] leading-[0.88] select-none drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
              OUR
              <br />
              COLLECTION
            </h1>
          </div>

          <div className="max-w-xl">
            <p className="text-sm md:text-base font-sans text-[#FAF9F6]/90 leading-relaxed lg:text-right drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              {t("collection.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Shop by Category Tabs Bar (Static & Zero-Glitch Pure CSS) */}
      <section className="w-full bg-[#0a0a0a] border-b border-[#1c1c1c]">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 py-3 sm:py-4 flex items-center justify-between gap-4 sm:gap-8">
          <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar flex-1">
            <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-[0.2em] sm:tracking-[0.25em] text-[#444444] font-bold shrink-0">
              CATEGORY
            </span>
            <div className="flex items-center gap-4 sm:gap-8 shrink-0">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setCurrentPage(1);
                    }}
                    className={`relative text-[11px] sm:text-xs uppercase font-mono tracking-wider sm:tracking-widest transition-colors duration-200 py-1 cursor-pointer touch-manipulation border-b-2 ${
                      isActive
                        ? "text-white font-bold border-white"
                        : "text-[#666666] hover:text-[#FAF9F6] border-transparent"
                    }`}
                  >
                    {isActive && <span className="mr-1 text-white">×</span>}
                    {cat === "ALL PRODUCTS" ? t("collection.allProducts") : cat === "IN-EAR MONITORS" ? t("collection.inEarMonitors") : cat === "TWS" ? t("collection.tws") : cat === "HEADPHONE" ? t("collection.headphone") : cat === "DAC/AMP" ? t("collection.dacAmp") : cat === "ACCESSORIES" ? t("collection.accessories") : cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Grid Column Switcher (Universal Column Layout Icons) */}
            <div className="hidden sm:flex items-center border border-[#222222] bg-[#0a0a0a] p-0.5 relative">
              {[3, 4, 5].map((cols) => {
                const isActive = gridCols === cols;
                return (
                  <button
                    key={cols}
                    type="button"
                    onClick={() => handleSetGridCols(cols)}
                    className={`w-7 h-7 flex items-center justify-center transition-colors relative z-10 cursor-pointer ${
                      isActive ? "text-[#080808]" : "text-[#555555] hover:text-[#FAF9F6]"
                    }`}
                    aria-label={`${cols} columns`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeGridSelector"
                        className="absolute inset-0 bg-white z-[-1]"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      />
                    )}
                    {cols === 3 && (
                      <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                        <rect x="2" y="2.5" width="4.2" height="15" />
                        <rect x="7.9" y="2.5" width="4.2" height="15" />
                        <rect x="13.8" y="2.5" width="4.2" height="15" />
                      </svg>
                    )}
                    {cols === 4 && (
                      <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                        <rect x="1.5" y="2.5" width="3.2" height="15" />
                        <rect x="6.1" y="2.5" width="3.2" height="15" />
                        <rect x="10.7" y="2.5" width="3.2" height="15" />
                        <rect x="15.3" y="2.5" width="3.2" height="15" />
                      </svg>
                    )}
                    {cols === 5 && (
                      <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                        <rect x="1" y="2.5" width="2.4" height="15" />
                        <rect x="4.8" y="2.5" width="2.4" height="15" />
                        <rect x="8.6" y="2.5" width="2.4" height="15" />
                        <rect x="12.4" y="2.5" width="2.4" height="15" />
                        <rect x="16.2" y="2.5" width="2.4" height="15" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Filter Button */}
            <button 
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className="flex items-center gap-1.5 sm:gap-2 border border-[#222222] hover:border-white hover:text-white px-2.5 sm:px-4 h-8 sm:h-9 font-mono text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest text-[#777777] transition-colors shrink-0 font-bold touch-manipulation cursor-pointer"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              <span>{t("collection.filters") || "FILTERS"}</span>
              <span className="text-[#D4FF00]">({filteredProducts.length})</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Main Content (Filters Sidebar + Product Grid) */}
      <section className="max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-12 py-6 sm:py-12 w-full flex-1 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-start w-full">
          {/* LEFT SIDEBAR FILTERS */}
          <AnimatePresence initial={false}>
            {isFilterDrawerOpen && (
              <>
                {/* Mobile Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/80 z-40 lg:hidden"
                  onClick={() => setIsFilterDrawerOpen(false)}
                />
                
                <motion.aside 
                  key="filter-drawer"
                  initial={{ x: "-100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "-100%", opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed inset-y-0 left-0 w-[300px] bg-[#0c0c0c] border-r border-[#1c1c1c] z-50 p-6 overflow-y-auto lg:static lg:w-[260px] lg:border lg:border-[#1c1c1c] lg:bg-[#0a0a0a] lg:p-6 lg:z-auto shrink-0 shadow-2xl lg:shadow-none"
                >
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1c1c1c]">
                    <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#FAF9F6]">
                      {t("collection.filters") || "FILTERS"}
                    </span>
                    <button 
                      type="button"
                      onClick={() => setIsFilterDrawerOpen(false)}
                      className="text-[#666666] hover:text-white text-lg font-mono leading-none cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-8">
                    {/* SORT BY */}
                    <div>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#888888] block mb-3">
                        {t("collection.sortBy")}
                      </span>
                      <CustomSortDropdown
                        value={sortOption}
                        onChange={(val) => {
                          setSortOption(val);
                          setIsSortOpen(false);
                        }}
                        isOpen={isSortOpen}
                        onToggle={() => setIsSortOpen(!isSortOpen)}
                        t={t}
                      />
                    </div>

                    {/* PRICE RANGE */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#888888]">
                          {t("collection.priceRange")}
                        </span>
                      </div>
                      <div className="relative w-full py-2">
                        <input
                          type="range"
                          min="0"
                          max="5000"
                          step="50"
                          value={priceRange}
                          onChange={(e) => {
                            setPriceRange(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="w-full accent-[#D4FF00] bg-[#1c1c1c] h-1.5 cursor-pointer appearance-none"
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs font-mono text-[#555555] mt-2">
                        <span>$0</span>
                        <span className="text-white font-bold">{formatPrice(priceRange)}</span>
                      </div>
                    </div>

                    {/* SOUND SIGNATURE (ACOUSTIC TARGET) */}
                    <div>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#888888] block mb-4">
                        SOUND SIGNATURE
                      </span>
                      <div className="space-y-2.5">
                        {SIGNATURES.map((sig) => {
                          const isChecked = selectedSignatures.includes(sig);
                          return (
                            <label
                              key={sig}
                              onClick={() => toggleSignature(sig)}
                              className="flex items-center gap-3 cursor-pointer group text-xs font-mono uppercase tracking-wider text-[#777777] hover:text-white transition-colors"
                            >
                              <div
                                className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                                  isChecked
                                    ? "border-[#D4FF00] bg-[#D4FF00] text-[#080808]"
                                    : "border-[#2a2a2a] bg-[#111111] group-hover:border-[#555555]"
                                }`}
                              >
                                {isChecked && <span className="text-[10px] font-bold">✓</span>}
                              </div>
                              <span className="truncate">{sig.replace("_", "-")}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* RATING */}
                    <div>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#888888] block mb-4">
                        {t("collection.rating")}
                      </span>
                      <label className="flex items-center gap-3 cursor-pointer group w-fit">
                        <div
                          onClick={() => setRatingFilter(!ratingFilter)}
                          className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                            ratingFilter
                              ? "border-[#D4FF00] bg-[#D4FF00] text-[#080808]"
                              : "border-[#2a2a2a] bg-[#111111] group-hover:border-[#555555]"
                          }`}
                        >
                          {ratingFilter && <span className="text-[10px] font-bold">✓</span>}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-[#D4FF00]">
                          <span>★</span>
                          <span>★</span>
                          <span>★</span>
                          <span>★</span>
                          <span className="text-[#333333]">★</span>
                          <span className="text-xs font-mono text-[#555555] ml-1.5">& UP</span>
                        </div>
                      </label>
                    </div>

                    {/* BRAND */}
                    <div>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#888888] block mb-4">
                        {t("collection.brand")} ({brandsList.length})
                      </span>
                      <div className="space-y-3 max-h-52 overflow-y-auto pr-2">
                        {brandsList.map((brand) => {
                          const isChecked = selectedBrands.includes(brand);
                          return (
                            <label
                              key={brand}
                              onClick={() => toggleBrand(brand)}
                              className="flex items-center gap-3 cursor-pointer group text-xs font-mono uppercase tracking-wider text-[#777777] hover:text-white transition-colors"
                            >
                              <div
                                className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                                  isChecked
                                    ? "border-[#D4FF00] bg-[#D4FF00] text-[#080808]"
                                    : "border-[#2a2a2a] bg-[#111111] group-hover:border-[#555555]"
                                }`}
                              >
                                {isChecked && <span className="text-[10px] font-bold">✓</span>}
                              </div>
                              <span className="truncate">{brand}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* CONNECTIVITY */}
                    <div>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#888888] block mb-4">
                        {t("collection.connectivity")}
                      </span>
                      <div className="space-y-3">
                        {CONNECTIVITIES.map((conn) => {
                          const isChecked = selectedConnectivities.includes(conn);
                          return (
                            <label
                              key={conn}
                              onClick={() => toggleConnectivity(conn)}
                              className="flex items-center gap-3 cursor-pointer group text-xs font-mono uppercase tracking-wider text-[#777777] hover:text-white transition-colors"
                            >
                              <div
                                className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                                  isChecked
                                    ? "border-[#D4FF00] bg-[#D4FF00] text-[#080808]"
                                    : "border-[#2a2a2a] bg-[#111111] group-hover:border-[#555555]"
                                }`}
                              >
                                {isChecked && <span className="text-[10px] font-bold">✓</span>}
                              </div>
                              <span>{conn}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* AVAILABILITY */}
                    <div>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#888888] block mb-4">
                        AVAILABILITY
                      </span>
                      <div className="space-y-4">
                        <div
                          onClick={() => setInStockOnly(!inStockOnly)}
                          className="flex items-center justify-between cursor-pointer group"
                        >
                          <span className="text-xs font-mono uppercase tracking-wider text-[#777777] group-hover:text-white">
                            IN STOCK ONLY
                          </span>
                          <div className={`w-9 h-5 border flex items-center p-0.5 transition-colors ${inStockOnly ? "border-[#D4FF00] bg-[#D4FF00]/10" : "border-[#2a2a2a] bg-[#111111]"}`}>
                            <div className={`w-3.5 h-3.5 transition-transform ${inStockOnly ? "translate-x-4 bg-[#D4FF00]" : "translate-x-0 bg-[#444444]"}`} />
                          </div>
                        </div>

                        <div
                          onClick={() => setPreOrderOnly(!preOrderOnly)}
                          className="flex items-center justify-between cursor-pointer group"
                        >
                          <span className="text-xs font-mono uppercase tracking-wider text-[#777777] group-hover:text-white">
                            PRE-ORDER ONLY
                          </span>
                          <div className={`w-9 h-5 border flex items-center p-0.5 transition-colors ${preOrderOnly ? "border-[#D4FF00] bg-[#D4FF00]/10" : "border-[#2a2a2a] bg-[#111111]"}`}>
                            <div className={`w-3.5 h-3.5 transition-transform ${preOrderOnly ? "translate-x-4 bg-[#D4FF00]" : "translate-x-0 bg-[#444444]"}`} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RESET FILTERS */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBrands([]);
                        setSelectedSignatures([]);
                        setSelectedConnectivities([]);
                        setRatingFilter(false);
                        setInStockOnly(false);
                        setPreOrderOnly(false);
                        setPriceRange(5000);
                        setActiveCategory("ALL PRODUCTS");
                        setCurrentPage(1);
                      }}
                      className="w-full py-3 bg-[#111111] hover:bg-white hover:text-[#080808] border border-[#262626] text-xs font-mono font-bold uppercase tracking-widest text-[#777777] transition-colors cursor-pointer"
                    >
                      {t("collection.resetFilters") || "RESET FILTERS"}
                    </button>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* PRODUCT GRID */}
          <div className="flex-1 w-full">
            {isLoading ? (
              <div className={`grid grid-cols-2 sm:grid-cols-2 ${gridCols === 4 ? "md:grid-cols-3 lg:grid-cols-4" : gridCols === 5 ? "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "md:grid-cols-3 lg:grid-cols-3"} gap-x-2.5 sm:gap-x-[18px] gap-y-5 sm:gap-y-8`}>
                {[...Array(itemsPerPage)].map((_, i) => (
                  <div key={i} className="aspect-square bg-[#0e0e0e] border border-[#1c1c1c] animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-24 text-center border border-[#1c1c1c] bg-[#0a0a0a] p-8">
                <div className="w-12 h-12 border border-[#222222] flex items-center justify-center mx-auto mb-4 text-[#555555]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2v20"></path>
                    <circle cx="12" cy="12" r="7"></circle>
                  </svg>
                </div>
                <h3 className="font-heading text-xl uppercase tracking-wider text-white mb-2">NO MATCHING GEAR</h3>
                <p className="font-sans text-xs text-[#666666] max-w-sm mx-auto mb-6">
                  Tidak ada produk yang sesuai dengan parameter filter spesifikasi yang dipilih.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBrands([]);
                    setSelectedSignatures([]);
                    setSelectedConnectivities([]);
                    setRatingFilter(false);
                    setInStockOnly(false);
                    setPreOrderOnly(false);
                    setPriceRange(5000);
                    setActiveCategory("ALL PRODUCTS");
                  }}
                  className="px-6 py-3 bg-[#FAF9F6] hover:bg-white text-black font-mono font-bold text-xs uppercase tracking-widest cursor-pointer transition-colors"
                >
                  RESET PARAMETERS
                </button>
              </div>
            ) : (
              <>
                <motion.div
                  layout
                  transition={{
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`grid grid-cols-2 sm:grid-cols-2 ${
                    gridCols === 4
                      ? "md:grid-cols-3 lg:grid-cols-4"
                      : gridCols === 5
                      ? "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                      : "md:grid-cols-3 lg:grid-cols-3"
                  } gap-x-2.5 sm:gap-x-[18px] gap-y-5 sm:gap-y-8`}
                >
                  {paginatedProducts.map((product) => (
                    <motion.div
                      layout
                      key={product.id}
                      transition={{
                        duration: 0.4,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-20 pt-10 border-t border-[#1c1c1c] flex flex-col sm:flex-row items-center justify-center gap-6">
                    <div className="flex items-center gap-2 font-mono">
                      {/* Prev Arrow Button */}
                      <button
                        type="button"
                        disabled={validCurrentPage <= 1}
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                          window.scrollTo({ top: 300, behavior: "smooth" });
                        }}
                        className="w-10 h-10 bg-[#0a0a0a] border border-[#222222] hover:border-[#555555] hover:text-white text-[#666666] disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer flex items-center justify-center"
                        aria-label="Previous page"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>

                      {/* Numbered Boxes */}
                      <div className="flex items-center gap-2">
                        {(() => {
                          const pages: (number | string)[] = [];
                          if (totalPages <= 5) {
                            for (let i = 1; i <= totalPages; i++) pages.push(i);
                          } else {
                            if (validCurrentPage <= 3) {
                              pages.push(1, 2, 3, "...", totalPages);
                            } else if (validCurrentPage >= totalPages - 2) {
                              pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
                            } else {
                              pages.push(1, "...", validCurrentPage, "...", totalPages);
                            }
                          }
                          return pages.map((page, idx) => {
                            if (page === "...") {
                              return (
                                <span
                                  key={`ellipsis-${idx}`}
                                  className="w-10 h-10 flex items-center justify-center text-xs font-mono text-[#444444]"
                                >
                                  ...
                                </span>
                              );
                            }

                            const pageNum = Number(page);
                            const isActive = pageNum === validCurrentPage;
                            const formatted = String(pageNum).padStart(2, "0");

                            return (
                              <button
                                key={pageNum}
                                type="button"
                                onClick={() => {
                                  setCurrentPage(pageNum);
                                  window.scrollTo({ top: 300, behavior: "smooth" });
                                }}
                                className={`w-10 h-10 text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                                  isActive
                                    ? "bg-white text-[#080808]"
                                    : "bg-[#0a0a0a] border border-[#222222] text-[#666666] hover:text-white hover:border-[#444444]"
                                }`}
                              >
                                {formatted}
                              </button>
                            );
                          });
                        })()}
                      </div>

                      {/* Next Arrow Button */}
                      <button
                        type="button"
                        disabled={validCurrentPage >= totalPages}
                        onClick={() => {
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                          window.scrollTo({ top: 300, behavior: "smooth" });
                        }}
                        className="w-10 h-10 bg-[#0a0a0a] border border-[#222222] hover:border-[#555555] hover:text-white text-[#666666] disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer flex items-center justify-center"
                        aria-label="Next page"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
