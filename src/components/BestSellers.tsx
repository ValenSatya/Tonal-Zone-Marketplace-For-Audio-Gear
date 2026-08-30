"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import MotionButton from "./MotionButton";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { ArrowUpRight } from "lucide-react";

const pages = [
  {
    range: "01 — 03 / 06",
    large: {
      tag: "FLAGSHIP HYBRID",
      name: "Moondrop Blessing 3",
      price: 319.99,
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    },
    small1: {
      tag: "DYNAMIC DRIVER",
      name: "Simgot EA1000 Fermat",
      price: 219.99,
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    },
    small2: {
      tag: "ALL-BA REFERENCE",
      name: "Kiwi Ears Orchestra Lite",
      price: 249.00,
      image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
    },
  },
  {
    range: "04 — 06 / 06",
    large: {
      tag: "OPEN-BACK REFERENCE",
      name: "Sennheiser HD 560S",
      price: 199.00,
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800",
    },
    small1: {
      tag: "FLAGSHIP TRIBRID",
      name: "Thieaudio Monarch MKIII",
      price: 999.00,
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    },
    small2: {
      tag: "BALANCED DAC / AMP",
      name: "FiiO K7 Balanced DAC/AMP",
      price: 199.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    },
  },
];

export default function BestSellers() {
  const { t } = useLanguage();
  const { formatPrice } = useLocation();
  const [pageIndex, setPageIndex] = useState(0);
  const current = pages[pageIndex];

  const handleNext = () => {
    setPageIndex((prev) => (prev + 1) % pages.length);
  };

  const handlePrev = () => {
    setPageIndex((prev) => (prev - 1 + pages.length) % pages.length);
  };

  return (
    <section id="bestseller" className="w-full bg-[#0a0a0a] py-32 border-b border-[#1c1c1c]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0 mb-12">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#888888] block mb-2">
              BESTSELLER CURATION
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl uppercase tracking-tight text-[#FAF9F6] cursor-default">
              {t("home.bestSellers")}
            </h2>
            <p className="text-xs sm:text-sm text-[#888888] max-w-md leading-relaxed mt-2">
              {t("home.bestSellersDesc")}
            </p>
          </div>

          {/* Pagination and Arrow Controls */}
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs font-mono text-[#888888] tracking-widest">
              {current.range}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                className="w-10 h-10 border border-[#222222] bg-[#121212] flex items-center justify-center text-[#FAF9F6] hover:border-white/40 hover:bg-[#1a1a1a] active:scale-95 transition-all duration-200 cursor-pointer"
                aria-label="Previous best sellers"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 border border-[#222222] bg-[#121212] flex items-center justify-center text-[#FAF9F6] hover:border-white/40 hover:bg-[#1a1a1a] active:scale-95 transition-all duration-200 cursor-pointer"
                aria-label="Next best sellers"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Grid */}
        <AnimatePresence mode="wait">
          <div key={pageIndex} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Card */}
            <Link
              href="/collection"
              className="md:col-span-2 group relative aspect-[16/9] border border-[#1c1c1c] overflow-hidden bg-[#121212] flex flex-col justify-end p-8 cursor-pointer hover:border-[#333333] transition-colors duration-300"
            >
              {/* Product Background Image */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={current.large.image}
                  alt={current.large.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-60 group-hover:opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
              </div>

              <div className="relative z-10 flex items-end justify-between gap-4 w-full">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#888888] block mb-1">
                    {current.large.tag}
                  </span>
                  <h3 className="font-heading text-2xl sm:text-4xl uppercase tracking-tight text-white mb-1">
                    {current.large.name}
                  </h3>
                  <p className="text-white font-mono text-base sm:text-lg font-bold">
                    {formatPrice(current.large.price)}
                  </p>
                </div>
                <div className="w-10 h-10 border border-white/20 bg-black/60 flex items-center justify-center text-white group-hover:border-white group-hover:bg-white group-hover:text-black transition-all duration-300 shrink-0">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
            </Link>

            {/* Small Cards Column */}
            <div className="flex flex-col gap-6">
              {/* Small Card 1 */}
              <Link
                href="/collection"
                className="group relative flex-1 border border-[#1c1c1c] overflow-hidden bg-[#121212] flex flex-col justify-end p-6 min-h-[220px] cursor-pointer hover:border-[#333333] transition-colors duration-300"
              >
                <div className="absolute inset-0 z-0">
                  <Image
                    src={current.small1.image}
                    alt={current.small1.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-60 group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
                </div>

                <div className="relative z-10 flex items-end justify-between gap-4 w-full">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#888888] block mb-0.5">
                      {current.small1.tag}
                    </span>
                    <h4 className="font-heading text-lg sm:text-xl uppercase tracking-tight text-white mb-0.5">
                      {current.small1.name}
                    </h4>
                    <p className="text-white font-mono text-sm font-bold">
                      {formatPrice(current.small1.price)}
                    </p>
                  </div>
                  <div className="w-8 h-8 border border-white/20 bg-black/60 flex items-center justify-center text-white group-hover:border-white group-hover:bg-white group-hover:text-black transition-all duration-300 shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>

              {/* Small Card 2 */}
              <Link
                href="/collection"
                className="group relative flex-1 border border-[#1c1c1c] overflow-hidden bg-[#121212] flex flex-col justify-end p-6 min-h-[220px] cursor-pointer hover:border-[#333333] transition-colors duration-300"
              >
                <div className="absolute inset-0 z-0">
                  <Image
                    src={current.small2.image}
                    alt={current.small2.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-60 group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
                </div>

                <div className="relative z-10 flex items-end justify-between gap-4 w-full">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#888888] block mb-0.5">
                      {current.small2.tag}
                    </span>
                    <h4 className="font-heading text-lg sm:text-xl uppercase tracking-tight text-white mb-0.5">
                      {current.small2.name}
                    </h4>
                    <p className="text-white font-mono text-sm font-bold">
                      {formatPrice(current.small2.price)}
                    </p>
                  </div>
                  <div className="w-8 h-8 border border-white/20 bg-black/60 flex items-center justify-center text-white group-hover:border-white group-hover:bg-white group-hover:text-black transition-all duration-300 shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </AnimatePresence>

        <div className="flex justify-end mt-10">
          <MotionButton variant="white" href="/collection">
            View All Products
          </MotionButton>
        </div>
      </div>
    </section>
  );
}
