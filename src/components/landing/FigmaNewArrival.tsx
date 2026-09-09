"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchProductsFromDb, CatalogProduct } from "@/lib/products-db";
import { useLocation } from "@/context/LocationContext";

const CATEGORIES = ["EAR PHONES", "TWS", "CABLE", "HEADPHONES"] as const;

export default function FigmaNewArrival() {
  const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]>("EAR PHONES");
  const [allProducts, setAllProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { formatPrice } = useLocation();

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      const data = await fetchProductsFromDb();
      setAllProducts(data);
      setIsLoading(false);
    }
    loadProducts();
  }, []);

  const displayedProducts = useMemo(() => {
    if (allProducts.length === 0) return [];

    let filtered: CatalogProduct[] = [];
    if (activeCategory === "EAR PHONES") {
      filtered = allProducts.filter((p) => p.category.toUpperCase().includes("IN-EAR"));
      // Ensure the iconic Figma new arrivals (Mimisbrunnr, EPZ G30, Tangzu WuKong) are prioritized
      const priorityOrder = ["prod-mimisbrunnr", "prod-epz-g30", "prod-wukong", "prod-chu3"];
      filtered.sort((a, b) => {
        const aIdx = priorityOrder.indexOf(a.id);
        const bIdx = priorityOrder.indexOf(b.id);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return 0;
      });
    } else if (activeCategory === "TWS") {
      filtered = allProducts.filter(
        (p) => p.category.toUpperCase().includes("TWS") || p.category.toUpperCase().includes("WIRELESS")
      );
    } else if (activeCategory === "CABLE") {
      filtered = allProducts.filter(
        (p) => p.category.toUpperCase().includes("CABLE") || p.category.toUpperCase().includes("ACCESSORIES")
      );
    } else if (activeCategory === "HEADPHONES") {
      filtered = allProducts.filter((p) => p.category.toUpperCase().includes("HEADPHONE"));
    }

    return filtered.slice(0, 3);
  }, [allProducts, activeCategory]);

  return (
    <section className="w-full bg-[#030303] py-32 lg:py-40">
      <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Top Header Row (x: 64, y: 782, w: 1152, h: 96) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 lg:mb-20">
          {/* Heading 2: "NEW ARRIVAL" - General Sans */}
          <h2 className="font-sans font-medium text-5xl sm:text-6xl text-[#e5e2e1] tracking-[-3.2px] leading-none uppercase">
            NEW ARRIVAL
          </h2>

          {/* Category Tabs: Ear Phones, TWS, Cable, Headphones - General Sans */}
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none pb-2 md:pb-0">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`font-sans font-medium text-[12px] leading-[14px] tracking-[2.4px] uppercase py-1.5 px-3 transition-colors cursor-pointer ${
                    isActive
                      ? "text-[#BFDD25] border-b-2 border-[#BFDD25]"
                      : "text-[#c4c7c8] hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid: Sourced dynamically from database with links to /product/[id] */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {isLoading && displayedProducts.length === 0 ? (
            // Subtle loading skeleton
            [...Array(3)].map((_, i) => (
              <div key={i} className="w-full flex flex-col animate-pulse">
                <div className="w-full aspect-[4/5] lg:aspect-[3/4] bg-[#0c0c0c]" />
                <div className="pt-4 space-y-2">
                  <div className="h-6 w-3/4 bg-[#141414]" />
                  <div className="h-4 w-1/2 bg-[#141414]" />
                </div>
              </div>
            ))
          ) : (
            displayedProducts.map((prod) => (
              <Link
                key={prod.id}
                href={`/product/${prod.id}`}
                className="w-full flex flex-col group cursor-pointer"
              >
                {/* Taller Image */}
                <div className="relative w-full aspect-[4/5] lg:aspect-[3/4] overflow-hidden bg-[#050505]">
                  <Image
                    src={prod.image}
                    alt={prod.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  {prod.badge && (
                    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-white/20 px-3 py-1 text-[10px] font-mono tracking-widest text-[#BFDD25] uppercase">
                      {prod.badge}
                    </div>
                  )}
                </div>

                {/* Direct Text Below Image */}
                <div className="pt-4 flex flex-col items-start">
                  <h4 className="font-sans font-medium text-2xl sm:text-[26px] leading-[36px] text-[#e5e2e1] group-hover:text-white transition-colors truncate w-full">
                    {prod.name}
                  </h4>
                  <p className="font-sans font-normal text-sm sm:text-base leading-relaxed tracking-[2px] text-[#c4c7c8] mt-1">
                    {formatPrice(prod.price)}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
