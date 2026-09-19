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
        className={`w-full bg-[#1e1e1e] hover:bg-[#252525] px-4 py-3 rounded-full text-xs font-sans font-semibold tracking-wider text-white text-left flex items-center justify-between transition-colors cursor-pointer ${
          isOpen ? "relative z-50 bg-[#252525]" : ""
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
          className={`shrink-0 text-[#888888] transition-transform duration-200 ${isOpen ? "rotate-180 text-white" : ""}`}
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
              className="absolute left-0 right-0 top-full mt-2 bg-[#1a1a1a] rounded-[16px] shadow-2xl z-50 overflow-hidden p-1.5 space-y-1"
            >
              {SORT_OPTIONS.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={`w-full text-left px-3.5 py-2.5 text-xs font-sans tracking-wide rounded-[10px] transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-[#252525] text-white font-bold"
                        : "text-[#888888] hover:text-white hover:bg-[#222222]"
                    }`}
                  >
                    <span className="truncate mr-2">{t(opt.labelKey)}</span>
                    {isSelected && <span className="text-white font-sans font-bold text-xs shrink-0">✓</span>}
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

    const handleSync = () => {
      loadData();
    };

    window.addEventListener("productsUpdated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("productsUpdated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
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
        // Category Filter with case-insensitive and variant tolerance
        if (activeCategory !== "ALL PRODUCTS") {
          const catUpper = (item.category || "").toUpperCase();
          if (activeCategory === "IN-EAR MONITORS") {
            if (!catUpper.includes("IN-EAR") && !catUpper.includes("EAR PHONE") && !catUpper.includes("IEM")) return false;
          } else if (activeCategory === "TWS") {
            if (!catUpper.includes("TWS") && !catUpper.includes("WIRELESS")) return false;
          } else if (activeCategory === "HEADPHONE") {
            if (!catUpper.includes("HEADPHONE")) return false;
          } else if (activeCategory === "DAC/AMP") {
            if (!catUpper.includes("DAC") && !catUpper.includes("AMP") && !catUpper.includes("PLAYER")) return false;
          } else if (activeCategory === "ACCESSORIES") {
            if (!catUpper.includes("ACCESSORIES") && !catUpper.includes("CABLE")) return false;
          } else if (item.category !== activeCategory) {
            return false;
          }
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
        // Connectivity (3.5mm SE, 4.4mm Balanced, Wireless Bluetooth)
        if (selectedConnectivities.length > 0) {
          const termUpper = (item.cableTermination || "").toUpperCase();
          const catUpper = (item.category || "").toUpperCase();
          const descUpper = (item.description || "").toUpperCase();
          const matchesAny = selectedConnectivities.some((conn) => {
            if (conn === "WIRED (3.5MM)") {
              return (
                termUpper.includes("3.5") ||
                termUpper.includes("SE") ||
                termUpper.includes("SINGLE-ENDED") ||
                descUpper.includes("3.5MM") ||
                (!catUpper.includes("TWS") && !catUpper.includes("WIRELESS") && termUpper.length === 0)
              );
            }
            if (conn === "BALANCED (4.4MM)") {
              return (
                termUpper.includes("4.4") ||
                termUpper.includes("BAL") ||
                termUpper.includes("BALANCED") ||
                termUpper.includes("2.5") ||
                descUpper.includes("4.4MM")
              );
            }
            if (conn === "WIRELESS (BLUETOOTH)") {
              return (
                termUpper.includes("BLUETOOTH") ||
                termUpper.includes("WIRELESS") ||
                catUpper.includes("TWS") ||
                catUpper.includes("WIRELESS") ||
                descUpper.includes("BLUETOOTH")
              );
            }
            return false;
          });
          if (!matchesAny) return false;
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
    selectedConnectivities,
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
    <div className="flex flex-col min-h-screen bg-[#030303] text-[#FAF9F6] font-sans selection:bg-[#FAF9F6] selection:text-[#030303] relative">
      {/* 1. Global Header */}
      <Navbar />

      {/* 2. Top Title Hero Section with Cinematic Audio Gear Background */}
      <section className="w-full relative border-b border-[#1c1c1c] overflow-hidden min-h-[380px] md:min-h-[460px] flex items-end pb-14 pt-20 px-5 sm:px-8 lg:px-12 bg-[#030303]">
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

        <div className="max-w-[1360px] mx-auto w-full relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
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

      {/* 3. Shop by Category Tabs Bar (Clean Pill Tabs, Zero Borders) */}
      <section className="w-full bg-[#030303] border-b border-[#1c1c1c]">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 py-3 sm:py-4 flex items-center justify-between gap-4 sm:gap-8">
          <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar flex-1 py-1">
            <span className="text-[10px] sm:text-[11px] uppercase font-mono tracking-[0.2em] text-[#555555] font-bold shrink-0 mr-2">
              CATEGORY
            </span>
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setCurrentPage(1);
                    }}
                    className={`relative text-xs font-sans tracking-wide transition-all duration-200 px-4 py-2 rounded-full cursor-pointer touch-manipulation shrink-0 ${
                      isActive
                        ? "bg-white text-[#131313] font-bold shadow-md"
                        : "bg-[#141414] hover:bg-[#1f1f1f] text-[#888888] hover:text-white font-medium"
                    }`}
                  >
                    {cat === "ALL PRODUCTS" ? t("collection.allProducts") : cat === "IN-EAR MONITORS" ? t("collection.inEarMonitors") : cat === "TWS" ? t("collection.tws") : cat === "HEADPHONE" ? t("collection.headphone") : cat === "DAC/AMP" ? t("collection.dacAmp") : cat === "ACCESSORIES" ? t("collection.accessories") : cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Grid Column Switcher (Pill Shaped, Zero Border) */}
            <div className="hidden sm:flex items-center rounded-full bg-[#141414] p-1 gap-1 relative">
              {[3, 4, 5].map((cols) => {
                const isActive = gridCols === cols;
                return (
                  <button
                    key={cols}
                    type="button"
                    onClick={() => handleSetGridCols(cols)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors relative z-10 cursor-pointer ${
                      isActive ? "text-[#030303]" : "text-[#777777] hover:text-white"
                    }`}
                    aria-label={`${cols} columns`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeGridSelector"
                        className="absolute inset-0 bg-white rounded-full z-[-1]"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      />
                    )}
                    {cols === 3 && (
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                        <rect x="2" y="2.5" width="4.2" height="15" rx="1" />
                        <rect x="7.9" y="2.5" width="4.2" height="15" rx="1" />
                        <rect x="13.8" y="2.5" width="4.2" height="15" rx="1" />
                      </svg>
                    )}
                    {cols === 4 && (
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                        <rect x="1.5" y="2.5" width="3.2" height="15" rx="1" />
                        <rect x="6.1" y="2.5" width="3.2" height="15" rx="1" />
                        <rect x="10.7" y="2.5" width="3.2" height="15" rx="1" />
                        <rect x="15.3" y="2.5" width="3.2" height="15" rx="1" />
                      </svg>
                    )}
                    {cols === 5 && (
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                        <rect x="1" y="2.5" width="2.4" height="15" rx="0.8" />
                        <rect x="4.8" y="2.5" width="2.4" height="15" rx="0.8" />
                        <rect x="8.6" y="2.5" width="2.4" height="15" rx="0.8" />
                        <rect x="12.4" y="2.5" width="2.4" height="15" rx="0.8" />
                        <rect x="16.2" y="2.5" width="2.4" height="15" rx="0.8" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Filter Button (Pill Shaped, Zero Border) */}
            <button 
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className="flex items-center gap-2 rounded-full bg-[#181818] hover:bg-[#222222] text-white px-4 h-9 font-sans text-xs font-semibold tracking-wider transition-colors shrink-0 touch-manipulation cursor-pointer"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              <span>{t("collection.filters") || "FILTERS"}</span>
              <span className="px-2 py-0.5 rounded-full bg-[#262626] text-white text-[11px] font-bold">
                {filteredProducts.length}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Main Content (Filters Sidebar + Product Grid) */}
      <section className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 py-6 sm:py-12 w-full flex-1 relative overflow-hidden">
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
                  className="fixed inset-y-0 left-0 w-[300px] bg-[#121212] z-50 p-6 overflow-y-auto lg:static lg:w-[260px] lg:rounded-[20px] lg:bg-[#141414] lg:p-6 lg:z-auto shrink-0 shadow-2xl lg:shadow-none"
                >
                  <div className="flex items-center justify-between pb-4 mb-6">
                    <span className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#FAF9F6]">
                      {t("collection.filters") || "FILTERS"}
                    </span>
                    <button 
                      type="button"
                      onClick={() => setIsFilterDrawerOpen(false)}
                      className="w-8 h-8 rounded-full bg-[#1f1f1f] hover:bg-[#282828] text-[#888888] hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-8">
                    {/* SORT BY */}
                    <div>
                      <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#888888] block mb-3">
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
                        <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#888888]">
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
                          className="w-full accent-white bg-[#222222] rounded-full h-1.5 cursor-pointer appearance-none"
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs font-sans text-[#888888] mt-2">
                        <span>$0</span>
                        <span className="text-white font-bold">{formatPrice(priceRange)}</span>
                      </div>
                    </div>

                    {/* SOUND SIGNATURE (ACOUSTIC TARGET) */}
                    <div>
                      <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#888888] block mb-4">
                        SOUND SIGNATURE
                      </span>
                      <div className="space-y-2.5">
                        {SIGNATURES.map((sig) => {
                          const isChecked = selectedSignatures.includes(sig);
                          return (
                            <label
                              key={sig}
                              onClick={() => toggleSignature(sig)}
                              className="flex items-center gap-3 cursor-pointer group text-xs font-sans uppercase tracking-wider text-[#888888] hover:text-white transition-colors"
                            >
                              <div
                                className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                                  isChecked
                                    ? "bg-white text-black"
                                    : "bg-[#222222] group-hover:bg-[#2a2a2a]"
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
                      <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#888888] block mb-4">
                        {t("collection.rating")}
                      </span>
                      <label className="flex items-center gap-3 cursor-pointer group w-fit">
                        <div
                          onClick={() => setRatingFilter(!ratingFilter)}
                          className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                            ratingFilter
                              ? "bg-white text-black"
                              : "bg-[#222222] group-hover:bg-[#2a2a2a]"
                          }`}
                        >
                          {ratingFilter && <span className="text-[10px] font-bold">✓</span>}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-[#fbbf24]">
                          <span>★</span>
                          <span>★</span>
                          <span>★</span>
                          <span>★</span>
                          <span className="text-[#333333]">★</span>
                          <span className="text-xs font-sans text-[#888888] ml-1.5">& UP</span>
                        </div>
                      </label>
                    </div>

                    {/* BRAND */}
                    <div>
                      <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#888888] block mb-4">
                        {t("collection.brand")} ({brandsList.length})
                      </span>
                      <div className="space-y-3 max-h-52 overflow-y-auto pr-2 [scrollbar-width:thin] [scrollbar-color:#2a2a2a_transparent]">
                        {brandsList.map((brand) => {
                          const isChecked = selectedBrands.includes(brand);
                          return (
                            <label
                              key={brand}
                              onClick={() => toggleBrand(brand)}
                              className="flex items-center gap-3 cursor-pointer group text-xs font-sans uppercase tracking-wider text-[#888888] hover:text-white transition-colors"
                            >
                              <div
                                className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                                  isChecked
                                    ? "bg-white text-black"
                                    : "bg-[#222222] group-hover:bg-[#2a2a2a]"
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
                      <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#888888] block mb-4">
                        {t("collection.connectivity")}
                      </span>
                      <div className="space-y-3">
                        {CONNECTIVITIES.map((conn) => {
                          const isChecked = selectedConnectivities.includes(conn);
                          return (
                            <label
                              key={conn}
                              onClick={() => toggleConnectivity(conn)}
                              className="flex items-center gap-3 cursor-pointer group text-xs font-sans uppercase tracking-wider text-[#888888] hover:text-white transition-colors"
                            >
                              <div
                                className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                                  isChecked
                                    ? "bg-white text-black"
                                    : "bg-[#222222] group-hover:bg-[#2a2a2a]"
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
                      <span className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-[#888888] block mb-4">
                        AVAILABILITY
                      </span>
                      <div className="space-y-4">
                        <div
                          onClick={() => setInStockOnly(!inStockOnly)}
                          className="flex items-center justify-between cursor-pointer group"
                        >
                          <span className="text-xs font-sans uppercase tracking-wider text-[#888888] group-hover:text-white">
                            IN STOCK ONLY
                          </span>
                          <div className={`w-10 h-6 rounded-full p-1 transition-colors ${inStockOnly ? "bg-white" : "bg-[#222222]"}`}>
                            <div className={`w-4 h-4 rounded-full transition-transform ${inStockOnly ? "translate-x-4 bg-black" : "translate-x-0 bg-[#666666]"}`} />
                          </div>
                        </div>

                        <div
                          onClick={() => setPreOrderOnly(!preOrderOnly)}
                          className="flex items-center justify-between cursor-pointer group"
                        >
                          <span className="text-xs font-sans uppercase tracking-wider text-[#888888] group-hover:text-white">
                            PRE-ORDER ONLY
                          </span>
                          <div className={`w-10 h-6 rounded-full p-1 transition-colors ${preOrderOnly ? "bg-white" : "bg-[#222222]"}`}>
                            <div className={`w-4 h-4 rounded-full transition-transform ${preOrderOnly ? "translate-x-4 bg-black" : "translate-x-0 bg-[#666666]"}`} />
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
                      className="w-full h-[42px] rounded-full bg-[#1e1e1e] hover:bg-[#282828] text-[#a0a0a0] hover:text-white text-xs font-sans font-semibold tracking-wider uppercase transition-colors cursor-pointer flex items-center justify-center"
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
                  <div key={i} className="aspect-square rounded-[4px] bg-[#141414] animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-20 text-center rounded-[20px] bg-[#141414] p-8 max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-full bg-[#1e1e1e] flex items-center justify-center mx-auto mb-4 text-[#888888]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2v20"></path>
                    <circle cx="12" cy="12" r="7"></circle>
                  </svg>
                </div>
                <h3 className="font-heading text-xl uppercase tracking-wider text-white mb-2">NO MATCHING GEAR</h3>
                <p className="font-sans text-xs text-[#888888] max-w-sm mx-auto mb-6">
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
                  className="h-[42px] px-8 rounded-full bg-white hover:bg-[#e8e8e8] text-black font-sans font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors shadow"
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

                {/* Pagination Controls (Rounded-Full Buttons, Zero Borders) */}
                {totalPages > 1 && (
                  <div className="mt-20 pt-10 border-t border-[#1c1c1c] flex flex-col sm:flex-row items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                      {/* Prev Arrow Button */}
                      <button
                        type="button"
                        disabled={validCurrentPage <= 1}
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                          window.scrollTo({ top: 300, behavior: "smooth" });
                        }}
                        className="w-10 h-10 rounded-full bg-[#181818] hover:bg-[#222222] text-[#888888] hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer flex items-center justify-center"
                        aria-label="Previous page"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>

                      {/* Numbered Boxes (Pill Shaped) */}
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
                                  className="w-10 h-10 flex items-center justify-center text-xs font-sans text-[#555555]"
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
                                className={`w-10 h-10 rounded-full text-xs font-sans font-bold flex items-center justify-center transition-all cursor-pointer ${
                                  isActive
                                    ? "bg-white text-[#131313] shadow"
                                    : "bg-[#141414] hover:bg-[#1f1f1f] text-[#888888] hover:text-white"
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
                        className="w-10 h-10 rounded-full bg-[#181818] hover:bg-[#222222] text-[#888888] hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer flex items-center justify-center"
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
