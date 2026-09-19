"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomSelect from "@/components/ui/custom-select";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/context/LanguageContext";
import { fetchProductsFromDb, searchCatalog, CatalogProduct } from "@/lib/products-db";
import { KeyboardArrowRight } from "@/components/ui/keyboard-arrow";

const POPULAR_SEARCHES = [
  "Blessing 3",
  "Aria 2",
  "Bunny",
  "Nora",
  "Chu II",
  "Wan'er",
  "HD600",
  "Planar",
  "Dawn Pro",
  "Simgot",
];

const SOUND_SIGNATURES = [
  { label: "Semua Karakter", value: "ALL" },
  { label: "Neutral / Ref", value: "NEUTRAL" },
  { label: "Warm / Musical", value: "WARM" },
  { label: "V-Shape", value: "V_SHAPE" },
  { label: "Bright / Treble", value: "BRIGHT" },
  { label: "Basshead", value: "BASSHEAD" },
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const initialQuery = searchParams.get("q") || "";

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputVal, setInputVal] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [activeSignature, setActiveSignature] = useState("ALL");
  const [sortOption, setSortOption] = useState("featured");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await fetchProductsFromDb();
      setProducts(data);
      setIsLoading(false);
    }
    load();

    const handleSync = () => {
      load();
    };

    window.addEventListener("productsUpdated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("productsUpdated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Sync state if URL param changes
  useEffect(() => {
    setInputVal(initialQuery);
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      router.push(`/search?q=${encodeURIComponent(inputVal.trim())}`);
    } else {
      router.push("/search");
    }
  };

  const categories = useMemo(() => {
    const raw = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return ["ALL", ...raw];
  }, [products]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: products.length };
    products.forEach((p) => {
      const cat = p.category || "OTHER";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let res = products;

    // 1. Intelligent catalog search (supports synonyms, driver types, roman numerals e.g. Chu 3/III)
    if (initialQuery.trim()) {
      res = searchCatalog(res, initialQuery);
    }

    // 2. Category filter
    if (activeCategory !== "ALL") {
      res = res.filter((p) => p.category?.toUpperCase() === activeCategory.toUpperCase());
    }

    // 3. Sound Signature filter
    if (activeSignature !== "ALL") {
      res = res.filter((p) => {
        const sig = (p.soundSignature || "").toUpperCase().replace(/[\s-]/g, "_");
        return sig.includes(activeSignature.toUpperCase().replace(/[\s-]/g, "_"));
      });
    }

    // 4. Sort
    if (sortOption === "price-low") {
      res = [...res].sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-high") {
      res = [...res].sort((a, b) => b.price - a.price);
    } else if (sortOption === "rating") {
      res = [...res].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortOption === "newest") {
      res = [...res].sort((a, b) => {
        const aNew = a.badge?.toLowerCase().includes("new") ? 1 : 0;
        const bNew = b.badge?.toLowerCase().includes("new") ? 1 : 0;
        return bNew - aNew;
      });
    }

    return res;
  }, [products, initialQuery, activeCategory, activeSignature, sortOption]);

  const isFiltered = activeCategory !== "ALL" || activeSignature !== "ALL" || initialQuery !== "";

  const handleResetFilters = () => {
    setActiveCategory("ALL");
    setActiveSignature("ALL");
    setInputVal("");
    router.push("/search");
  };

  const filterSidebarContent = (
    <div className="space-y-6">
      {/* Header with Title & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-[#222]">
        <span className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#FAF9F6]">
          {t("collection.filters") || "FILTERS"}
        </span>
        {isFiltered && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[11px] font-sans text-[#BFDD25] hover:underline cursor-pointer transition-colors"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* 1. URUTKAN (SORT BY) */}
      <div>
        <span className="text-[11px] font-sans font-bold uppercase tracking-[0.18em] text-[#888888] block mb-2.5">
          {t("search.sort") || "URUTKAN"}
        </span>
        <CustomSelect
          variant="default"
          value={sortOption}
          onChange={setSortOption}
          options={[
            { label: "Featured", value: "featured" },
            { label: "Newest Releases", value: "newest" },
            { label: "Price: Low to High", value: "price-low" },
            { label: "Price: High to Low", value: "price-high" },
            { label: "Top Rated", value: "rating" },
          ]}
          buttonClassName="w-full bg-[#141414] hover:bg-[#1a1a1a] text-xs font-sans text-zinc-200 px-3.5 py-2.5 rounded-[8px] flex items-center justify-between gap-2 cursor-pointer transition-colors border border-[#262626]"
        />
      </div>

      {/* 2. KATEGORI (CATEGORIES) */}
      <div className="pt-3 border-t border-[#1a1a1a]">
        <span className="text-[11px] font-sans font-bold uppercase tracking-[0.18em] text-[#888888] block mb-2.5">
          KATEGORI
        </span>
        <div className="space-y-1">
          {categories.map((cat) => {
            const isSel = activeCategory === cat;
            const count = categoryCounts[cat] ?? 0;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setIsMobileFilterOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-[8px] text-xs font-sans transition-all cursor-pointer ${
                  isSel
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-[#141414]"
                }`}
              >
                <span className="truncate pr-2 uppercase text-left">
                  {cat === "ALL" ? "Semua Kategori" : cat}
                </span>
                <span className={`text-[10px] font-mono shrink-0 ${isSel ? "text-zinc-600" : "text-zinc-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. KARAKTER SUARA (SOUND SIGNATURE) */}
      <div className="pt-3 border-t border-[#1a1a1a]">
        <span className="text-[11px] font-sans font-bold uppercase tracking-[0.18em] text-[#888888] block mb-2.5">
          KARAKTER SUARA
        </span>
        <div className="space-y-1">
          {SOUND_SIGNATURES.map((sig) => {
            const isSel = activeSignature === sig.value;
            return (
              <button
                key={sig.value}
                type="button"
                onClick={() => {
                  setActiveSignature(sig.value);
                  setIsMobileFilterOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-[8px] text-xs font-sans transition-all cursor-pointer ${
                  isSel
                    ? "bg-[#1f1f1f] text-white font-medium"
                    : "text-zinc-400 hover:text-white hover:bg-[#141414]"
                }`}
              >
                <span>{sig.label}</span>
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                    isSel ? "bg-[#BFDD25] text-black" : "bg-[#222222]"
                  }`}
                >
                  {isSel && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#000000] text-[#FAF9F6] font-sans selection:bg-[#BFDD25] selection:text-[#030303] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 pt-16 pb-24 w-full flex-1">
        {/* Search Header Banner */}
        <div className="mb-6">
          <nav className="text-[11px] font-mono text-[#777777] uppercase tracking-widest mb-4 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">
              BERANDA
            </Link>
            <span className="text-[#444]">/</span>
            <Link href="/collection" className="hover:text-white transition-colors">
              KATALOG
            </Link>
            <span className="text-[#444]">/</span>
            <span className="text-[#BFDD25] font-semibold">{t("search.title") || "SEARCH RESULTS"}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
            <div>
              <h1 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-tight text-white leading-none">
                {initialQuery ? `${t("search.resultsFor") || "Results For"}: "${initialQuery}"` : (t("search.title") || "Pencarian Katalog")}
              </h1>
              <p className="text-xs text-zinc-400 mt-2 font-mono uppercase tracking-wider">
                {filteredProducts.length} PRODUK DITEMUKAN
              </p>
            </div>
          </div>

          {/* Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl relative mb-3">
            <div className="relative flex items-center w-full bg-[#121212] hover:bg-[#161616] focus-within:bg-[#161616] border border-[#262626] focus-within:border-zinc-400 rounded-[8px] transition-all">
              <span className="pl-4 sm:pl-5 text-zinc-500 shrink-0 pointer-events-none">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
                </svg>
              </span>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Cari IEM, DAC, Cable, atau Brand (e.g. Blessing 3, Aria 2, Chu II)..."
                className="w-full bg-transparent text-white px-3 sm:px-4 py-3 sm:py-3.5 text-sm outline-none placeholder:text-zinc-500 font-sans"
              />
              {inputVal && (
                <button
                  type="button"
                  onClick={() => {
                    setInputVal("");
                    router.push("/search");
                  }}
                  className="p-2 text-zinc-500 hover:text-white transition-colors cursor-pointer mr-1 text-xs"
                  title="Bersihkan pencarian"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="mr-2 sm:mr-2.5 px-5 sm:px-6 py-2.5 bg-[#BFDD25] hover:bg-[#aecd20] text-black font-sans font-bold text-xs uppercase tracking-wider rounded-[6px] transition-all cursor-pointer shrink-0"
              >
                Cari
              </button>
            </div>
          </form>

          {/* Trending Searches Strip */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-mono text-zinc-400 mb-6">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 mr-1">
              {t("search.popularTerms") || "Populer"}:
            </span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setInputVal(term);
                  router.push(`/search?q=${encodeURIComponent(term)}`);
                }}
                className="px-3 py-1 bg-[#1f1f1f] hover:bg-[#282828] text-zinc-300 hover:text-white rounded-full text-xs transition-colors cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between w-full pb-4 mb-6 border-b border-[#222]">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="px-4 py-2 bg-[#1f1f1f] hover:bg-[#282828] text-white rounded-full text-xs font-sans font-medium flex items-center gap-2 cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filter & Urutkan</span>
            {isFiltered && (
              <span className="w-2 h-2 rounded-full bg-[#BFDD25]" />
            )}
          </button>
          <span className="text-xs font-mono text-zinc-400">
            {filteredProducts.length} Produk
          </span>
        </div>

        {/* Main Layout: Sidebar + Product Grid */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start w-full">
          {/* Desktop Sticky Sidebar */}
          <aside className="hidden lg:block w-[260px] shrink-0 sticky top-24 bg-[#0e0e0e] rounded-[16px] p-5 border border-[#1a1a1a]">
            {filterSidebarContent}
          </aside>

          {/* Mobile Filter Drawer */}
          <AnimatePresence>
            {isMobileFilterOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/80 z-50 lg:hidden"
                  onClick={() => setIsMobileFilterOpen(false)}
                />
                <motion.aside
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed inset-y-0 left-0 w-[300px] bg-[#121212] z-50 p-6 overflow-y-auto lg:hidden shadow-2xl"
                >
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#222]">
                    <span className="text-xs font-sans font-bold uppercase tracking-[0.2em] text-[#FAF9F6]">
                      {t("collection.filters") || "FILTERS"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="w-8 h-8 rounded-full bg-[#1f1f1f] hover:bg-[#282828] text-[#888888] hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  {filterSidebarContent}
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Main Products Grid Column */}
          <div className="flex-1 min-w-0 w-full">
            {/* Active Filter Tags */}
            {isFiltered && (
              <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-[#1a1a1a]">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mr-1">
                  Filter:
                </span>
                {initialQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1f1f1f] text-zinc-200 text-xs font-sans">
                    <span>&ldquo;{initialQuery}&rdquo;</span>
                    <button
                      type="button"
                      onClick={() => {
                        setInputVal("");
                        router.push("/search");
                      }}
                      className="hover:text-white cursor-pointer ml-0.5 text-zinc-400"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {activeCategory !== "ALL" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1f1f1f] text-zinc-200 text-xs font-sans">
                    <span>{activeCategory}</span>
                    <button
                      type="button"
                      onClick={() => setActiveCategory("ALL")}
                      className="hover:text-white cursor-pointer ml-0.5 text-zinc-400"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {activeSignature !== "ALL" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1f1f1f] text-zinc-200 text-xs font-sans">
                    <span>{SOUND_SIGNATURES.find((s) => s.value === activeSignature)?.label}</span>
                    <button
                      type="button"
                      onClick={() => setActiveSignature("ALL")}
                      className="hover:text-white cursor-pointer ml-0.5 text-zinc-400"
                    >
                      ✕
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-[#BFDD25] hover:underline cursor-pointer ml-2"
                >
                  Reset Semua
                </button>
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-[#121212] border border-[#1e1e1e] rounded-[8px] animate-pulse" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Clean Empty State (Open & Spacious, No Card-in-Card) */
              <div className="py-20 sm:py-24 text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-full border border-zinc-700/60 bg-[#121212] flex items-center justify-center mx-auto text-zinc-300 mb-4">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                  {t("search.noResults") || "Produk Tidak Ditemukan"}
                </h3>
                <p className="font-sans text-sm text-zinc-400 max-w-sm mx-auto mb-7 leading-relaxed">
                  {initialQuery ? (
                    <>
                      Tidak ditemukan produk yang sesuai dengan pencarian <span className="text-white font-semibold">&ldquo;{initialQuery}&rdquo;</span>.
                    </>
                  ) : (
                    t("search.tryDifferent") || "Coba gunakan kata kunci berbeda atau sesuaikan filter."
                  )}
                </p>

                {/* Popular Search Suggestions */}
                <div className="mb-7">
                  <p className="text-[11px] font-sans uppercase tracking-wider text-zinc-500 mb-2.5">
                    Coba cari kata kunci populer ini:
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {["Blessing 3", "Aria 2", "Chu II", "Simgot", "HD600"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setInputVal(s);
                          router.push(`/search?q=${encodeURIComponent(s)}`);
                        }}
                        className="px-3.5 py-1.5 bg-[#1f1f1f] hover:bg-[#282828] text-xs font-sans text-zinc-300 hover:text-white rounded-full transition-colors cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <Link
                  href="/collection"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#BFDD25] hover:bg-[#aecd20] text-black font-sans font-bold text-xs uppercase tracking-wider rounded-[6px] transition-all group"
                >
                  <span>{t("search.viewFullCollection") || "Lihat Semua Koleksi"} ({products.length})</span>
                  <KeyboardArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#000000] flex items-center justify-center text-white font-mono text-xs">Memuat Pencarian Katalog...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
