"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MistralText from "@/components/MistralText";
import CustomSelect from "@/components/ui/custom-select";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { fetchProductsFromDb, CatalogProduct } from "@/lib/products-db";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { formatPrice } = useLocation();
  const initialQuery = searchParams.get("q") || "";

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputVal, setInputVal] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [sortOption, setSortOption] = useState("featured");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await fetchProductsFromDb();
      setProducts(data);
      setIsLoading(false);
    }
    load();
  }, []);

  // Sync state if URL param changes
  useEffect(() => {
    setInputVal(initialQuery);
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(inputVal.trim())}`);
  };

  const categories = useMemo(() => {
    const raw = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return ["ALL", ...raw];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let res = products;

    // Filter by query string
    if (initialQuery.trim()) {
      const q = initialQuery.toLowerCase().trim();
      res = res.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.storeName.toLowerCase().includes(q) ||
          p.soundSignature.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Filter by category tab
    if (activeCategory !== "ALL") {
      res = res.filter((p) => p.category === activeCategory);
    }

    // Sort
    if (sortOption === "price-low") {
      res = [...res].sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-high") {
      res = [...res].sort((a, b) => b.price - a.price);
    } else if (sortOption === "rating") {
      res = [...res].sort((a, b) => b.rating - a.rating);
    }

    return res;
  }, [products, initialQuery, activeCategory, sortOption]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#FAF9F6] font-sans selection:bg-[#D4FF00] selection:text-[#0e0e0e] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 w-full flex-1">
        
        {/* Search Header Banner */}
        <div className="mb-12 border-b border-[#222] pb-10">
          <div className="flex items-center gap-2 font-mono text-xs text-[#FAF9F6]/50 uppercase tracking-widest mb-4">
            <Link href="/" className="hover:text-white transition-colors">HOME</Link>
            <span>/</span>
            <span className="text-[#D4FF00]">{t("search.title")}</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6 uppercase">
            {t("search.title")}
          </h1>

          {/* Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl relative">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Cari IEM, DAC, Cable, atau Brand (e.g. Blessing 3, Simgot, Sennheiser)..."
              className="w-full bg-[#141414] border border-[#2e2e2e] focus:border-[#D4FF00] text-white px-5 py-4 rounded-2xl text-sm outline-none transition-all placeholder:text-[#555] font-mono shadow-xl pr-28"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-5 bg-[#D4FF00] hover:bg-white text-black font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Cari
            </button>
          </form>
        </div>

        {/* Filter Controls & Result Count */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          
          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSel = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer border ${
                    isSel
                      ? "bg-[#D4FF00] text-black font-bold border-[#D4FF00] shadow-md"
                      : "bg-[#141414] text-[#888] hover:text-white border-[#262626]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Sort Selector & Count */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs font-mono text-[#777]">
              {filteredProducts.length} Results
            </span>

            <CustomSelect
              value={sortOption}
              onChange={setSortOption}
              options={[
                { label: "Featured", value: "featured" },
                { label: "Price: Low to High", value: "price-low" },
                { label: "Price: High to Low", value: "price-high" },
                { label: "Top Rated", value: "rating" },
              ]}
              className="w-44"
            />
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-[#141414] border border-[#222] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center border border-[#222] rounded-3xl bg-[#111] p-8">
            <span className="font-mono text-4xl mb-4 block">🔍</span>
            <h3 className="font-heading text-xl font-bold text-white mb-2">No Matching Products</h3>
            <p className="font-sans text-xs text-[#888] max-w-sm mx-auto mb-6">
              Tidak ditemukan produk yang sesuai dengan pencarian "{initialQuery}".
            </p>
            <Link
              href="/collection"
              className="inline-block px-6 py-3 bg-[#D4FF00] text-black font-mono font-bold text-xs uppercase rounded-xl"
            >
              Lihat Semua Koleksi ({products.length})
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-mono text-xs">Loading Catalog Search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
