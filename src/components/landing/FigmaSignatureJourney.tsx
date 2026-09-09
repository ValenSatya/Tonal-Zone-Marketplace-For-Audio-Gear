"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchProductsFromDb, CatalogProduct } from "@/lib/products-db";
import { useLocation } from "@/context/LocationContext";

interface SignatureInfo {
  id: number;
  key: "NEUTRAL" | "WARM" | "V_SHAPE" | "BRIGHT";
  label: string;
  description: string;
}

const SIGNATURES: SignatureInfo[] = [
  {
    id: 0,
    key: "NEUTRAL",
    label: "NEUTRAL",
    description:
      "Pure uncolored acoustic reference with balanced flat midrange and clinical transient accuracy for critical mastering and studio monitoring.",
  },
  {
    id: 1,
    key: "WARM",
    label: "WARM",
    description:
      "Rich tonal density, natural organic vocal intimacy, and smooth musical sub-bass impact designed for long, fatigue-free listening sessions.",
  },
  {
    id: 2,
    key: "V_SHAPE",
    label: "V-SHAPE",
    description:
      "High-energy dynamic punch, deep visceral sub-bass impact, and sparkling upper-treble detail tailored for EDM, rock, and modern pop.",
  },
  {
    id: 3,
    key: "BRIGHT",
    label: "BRIGHT",
    description:
      "Analytical microscopic resolution, expansive soundstage air, and crystal-clear instrument separation with fast transient speed.",
  },
];

export default function FigmaSignatureJourney() {
  const [selectedTab, setSelectedTab] = useState(0);
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

  const currentSig = SIGNATURES[selectedTab];

  const signatureProducts = useMemo(() => {
    if (allProducts.length === 0) return [];
    const filtered = allProducts.filter((p) => p.soundSignature === currentSig.key);
    return filtered.slice(0, 3);
  }, [allProducts, currentSig.key]);

  return (
    <section className="w-full bg-[#030303] py-32 lg:py-40">
      <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section Title: "START YOUR JOURNEY HERE" - General Sans */}
        <div className="mb-16 lg:mb-20">
          <h2 className="font-sans font-semibold text-4xl sm:text-5xl text-white tracking-[2px] leading-none uppercase">
            START YOUR JOURNEY HERE
          </h2>
        </div>

        {/* 2-Column Section Grid (Matching Frame 17 layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: 4 Signature Tabs (w: 276, h: 50) + Description Paragraph */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            {SIGNATURES.map((tab, idx) => {
              const isActive = selectedTab === idx;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(idx)}
                  className={`w-full max-w-[276px] h-[50px] border flex items-center justify-between px-6 transition-colors cursor-pointer ${
                    isActive
                      ? "border-[#BFDD25] bg-transparent"
                      : "border-[#4a4a4a] hover:border-white bg-transparent"
                  }`}
                >
                  <span className={`font-sans font-medium text-[20px] sm:text-[24px] tracking-[-1px] ${isActive ? "text-[#BFDD25]" : "text-white"}`}>
                    {tab.label}
                  </span>

                  {/* Arrow Icon */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={isActive ? "text-[#BFDD25]" : "text-white"}>
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              );
            })}

            {/* Dynamic Description Text: General Sans */}
            <div className="w-full max-w-[343px] mt-6">
              <p className="font-sans font-normal text-[15px] sm:text-[16px] leading-[30px] text-[#949494]">
                {currentSig.description}
              </p>
            </div>
          </div>

          {/* Right Column: 3 Products matching selected signature */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {isLoading && signatureProducts.length === 0 ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="w-full flex flex-col animate-pulse">
                  <div className="w-full aspect-[4/5] lg:aspect-[3/4] bg-[#0c0c0c]" />
                  <div className="pt-4 space-y-2">
                    <div className="h-5 w-3/4 bg-[#141414]" />
                    <div className="h-4 w-1/2 bg-[#141414]" />
                  </div>
                </div>
              ))
            ) : (
              signatureProducts.map((prod) => (
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
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    {prod.badge && (
                      <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm border border-white/20 px-2 py-0.5 text-[9px] font-mono tracking-widest text-[#BFDD25] uppercase">
                        {prod.badge}
                      </div>
                    )}
                  </div>

                  {/* Direct Text Below Image */}
                  <div className="pt-4 flex flex-col items-start">
                    <h4 className="font-sans font-medium text-lg sm:text-xl leading-snug text-[#e5e2e1] group-hover:text-white transition-colors truncate w-full">
                      {prod.name}
                    </h4>
                    <p className="font-sans font-normal text-xs sm:text-sm leading-relaxed tracking-[2px] text-[#c4c7c8] mt-1">
                      {formatPrice(prod.price)}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
