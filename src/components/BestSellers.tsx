"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import MotionButton from "./MotionButton";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { fetchProductsFromDb, CatalogProduct, FALLBACK_CATALOG } from "@/lib/products-db";

const DEFAULT_PAGES = [
  {
    large: {
      id: "prod-ier-z1r",
      name: "Sony IER-Z1R Flagship In-Ear Monitor",
      price: 1699,
      color: "from-black/90 via-black/40 to-transparent",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    },
    small1: {
      id: "prod-ier-m9",
      name: "Sony IER-M9 Stage Monitor",
      price: 999,
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    },
    small2: {
      id: "prod-hd560s",
      name: "Sennheiser HD 560S Reference",
      price: 199,
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800",
    },
  },
  {
    large: {
      id: "prod-monarch-mk3",
      name: "Thieaudio Monarch MKIII Flagship",
      price: 999,
      color: "from-black/90 via-black/40 to-transparent",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    },
    small1: {
      id: "prod-blessing-3",
      name: "Moondrop Blessing 3 Hybrid",
      price: 319.99,
      image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
    },
    small2: {
      id: "prod-fiio-k7",
      name: "FiiO K7 Balanced Desktop DAC/AMP",
      price: 199.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    },
  },
];

export default function BestSellers() {
  const { t } = useLanguage();
  const { formatPrice } = useLocation();
  const [pageIndex, setPageIndex] = useState(0);
  const [pages, setPages] = useState(DEFAULT_PAGES);

  useEffect(() => {
    async function loadDbBestSellers() {
      try {
        const live = await fetchProductsFromDb();
        if (live && live.length >= 6) {
          const p1 = {
            large: {
              id: live[0].id,
              name: live[0].name,
              price: live[0].price,
              color: "from-black/90 via-black/40 to-transparent",
              image: live[0].image || live[0].images[0],
            },
            small1: {
              id: live[1].id,
              name: live[1].name,
              price: live[1].price,
              image: live[1].image || live[1].images[0],
            },
            small2: {
              id: live[2].id,
              name: live[2].name,
              price: live[2].price,
              image: live[2].image || live[2].images[0],
            },
          };
          const p2 = {
            large: {
              id: live[3].id,
              name: live[3].name,
              price: live[3].price,
              color: "from-black/90 via-black/40 to-transparent",
              image: live[3].image || live[3].images[0],
            },
            small1: {
              id: live[4].id,
              name: live[4].name,
              price: live[4].price,
              image: live[4].image || live[4].images[0],
            },
            small2: {
              id: live[5].id,
              name: live[5].name,
              price: live[5].price,
              image: live[5].image || live[5].images[0],
            },
          };
          setPages([p1, p2]);
        }
      } catch (e) {
        console.error("Failed to load live best sellers:", e);
      }
    }
    loadDbBestSellers();
  }, []);

  const current = pages[pageIndex] || DEFAULT_PAGES[0];

  const handleNext = () => {
    setPageIndex((prev) => (prev + 1) % pages.length);
  };

  const handlePrev = () => {
    setPageIndex((prev) => (prev - 1 + pages.length) % pages.length);
  };

  return (
    <section id="bestseller" className="w-full bg-[#0e0e0e] py-40 border-b border-[#444748]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0 mb-12">
          <div>
            <h2 className="font-heading text-4xl sm:text-5xl tracking-wide mb-3 hover:text-[#D4FF00] transition-colors duration-300 cursor-default text-[#FAF9F6]">
              {t("home.bestSellers")}
            </h2>
            <p className="text-base sm:text-[17px] text-[#FAF9F6]/70 max-w-md leading-relaxed">
              {t("home.bestSellersDesc")}
            </p>
          </div>

          {/* Pagination Arrow Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-10 h-10 border border-[#444748] flex items-center justify-center text-[#FAF9F6] hover:border-[#D4FF00] hover:bg-[#D4FF00] hover:text-[#0e0e0e] active:scale-95 transition-all duration-300 group cursor-pointer"
              aria-label="Previous best sellers"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-0.5 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="w-10 h-10 border border-[#444748] flex items-center justify-center text-[#FAF9F6] hover:border-[#D4FF00] hover:bg-[#D4FF00] hover:text-[#0e0e0e] active:scale-95 transition-all duration-300 group cursor-pointer"
              aria-label="Next best sellers"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-0.5 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel Grid with Shutter Block Reveal Animation (No Glow) */}
        <AnimatePresence mode="wait">
          <div key={pageIndex} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large Card */}
            <Link href={`/product/${current.large.id}`} className="md:col-span-2 block">
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 1 }}
                className="relative aspect-[16/9] border border-[#444748] group overflow-hidden bg-[#0a0a0a] flex items-center justify-center cursor-pointer hover:border-[#D4FF00] transition-all duration-500 w-full h-full"
              >
                {/* Solid Neon Yellow Shutter Block Reveal (Tanpa Glow) */}
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ 
                    scaleX: 0,
                    transition: { duration: 1.15, ease: [0.16, 1, 0.3, 1], delay: 0.28 } 
                  }}
                  exit={{ 
                    scaleX: 1,
                    transition: { duration: 0.55, ease: [0.7, 0, 0.3, 1] } 
                  }}
                  style={{ originX: 0 }}
                  className="absolute inset-0 bg-[#D4FF00] z-50 pointer-events-none"
                />

                {/* Product Background Image */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={current.large.image}
                    alt={current.large.name}
                    fill
                    className="object-cover opacity-60 group-hover:scale-105 group-hover:opacity-85 transition-all duration-700"
                  />
                </div>

                <div className={`absolute inset-0 bg-gradient-to-t ${current.large.color} z-10 group-hover:from-black transition-all duration-500`}></div>

                <motion.div
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="absolute bottom-6 left-6 z-20"
                >
                  <p className="font-heading text-3xl uppercase tracking-wide mb-1 group-hover:translate-x-2 transition-transform duration-300">
                    {current.large.name}
                  </p>
                  <p className="text-[#D4FF00] font-mono text-lg font-medium tracking-wide group-hover:translate-x-2 transition-transform duration-300 delay-75">
                    {formatPrice(current.large.price)}
                  </p>
                </motion.div>
              </motion.div>
            </Link>

            {/* Small Cards Column */}
            <div className="flex flex-col gap-4">
              {/* Small Card 1 */}
              <Link href={`/product/${current.small1.id}`} className="flex-1 block">
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 1 }}
                  className="relative h-full border border-[#444748] group overflow-hidden bg-[#0a0a0a] flex items-center justify-center min-h-[200px] cursor-pointer hover:border-[#D4FF00] transition-all duration-500"
                >
                  {/* Solid Neon Yellow Shutter Block Reveal (Tanpa Glow) */}
                  <motion.div
                    initial={{ scaleX: 1 }}
                    animate={{ 
                      scaleX: 0,
                      transition: { duration: 1.15, ease: [0.16, 1, 0.3, 1], delay: 0.28 } 
                    }}
                    exit={{ 
                      scaleX: 1,
                      transition: { duration: 0.55, ease: [0.7, 0, 0.3, 1] } 
                    }}
                    style={{ originX: 0 }}
                    className="absolute inset-0 bg-[#D4FF00] z-50 pointer-events-none"
                  />

                  {/* Product Background Image */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={current.small1.image}
                      alt={current.small1.name}
                      fill
                      className="object-cover opacity-60 group-hover:scale-105 group-hover:opacity-85 transition-all duration-700"
                    />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10"></div>
                  
                  <motion.div
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="absolute bottom-4 left-4 z-20"
                  >
                    <p className="font-heading text-xl uppercase tracking-wide mb-1 group-hover:translate-x-1 transition-transform duration-300">
                      {current.small1.name}
                    </p>
                    <p className="text-[#D4FF00] font-mono text-sm font-medium tracking-wide group-hover:translate-x-1 transition-transform duration-300 delay-75">
                      {formatPrice(current.small1.price)}
                    </p>
                  </motion.div>
                </motion.div>
              </Link>

              {/* Small Card 2 */}
              <Link href={`/product/${current.small2.id}`} className="flex-1 block">
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 1 }}
                  className="relative h-full border border-[#444748] group overflow-hidden bg-[#0a0a0a] flex items-center justify-center min-h-[200px] cursor-pointer hover:border-[#D4FF00] transition-all duration-500"
                >
                  {/* Solid Neon Yellow Shutter Block Reveal (Tanpa Glow) */}
                  <motion.div
                    initial={{ scaleX: 1 }}
                    animate={{ 
                      scaleX: 0,
                      transition: { duration: 1.15, ease: [0.16, 1, 0.3, 1], delay: 0.28 } 
                    }}
                    exit={{ 
                      scaleX: 1,
                      transition: { duration: 0.55, ease: [0.7, 0, 0.3, 1] } 
                    }}
                    style={{ originX: 0 }}
                    className="absolute inset-0 bg-[#D4FF00] z-50 pointer-events-none"
                  />

                  {/* Product Background Image */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={current.small2.image}
                      alt={current.small2.name}
                      fill
                      className="object-cover opacity-60 group-hover:scale-105 group-hover:opacity-85 transition-all duration-700"
                    />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10"></div>
                  
                  <motion.div
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.28 }}
                    className="absolute bottom-4 left-4 z-20"
                  >
                    <p className="font-heading text-xl uppercase tracking-wide mb-1 group-hover:translate-x-1 transition-transform duration-300">
                      {current.small2.name}
                    </p>
                    <p className="text-[#D4FF00] font-mono text-sm font-medium tracking-wide group-hover:translate-x-1 transition-transform duration-300 delay-75">
                      {formatPrice(current.small2.price)}
                    </p>
                  </motion.div>
                </motion.div>
              </Link>
            </div>
          </div>
        </AnimatePresence>

        <div className="flex justify-end mt-8">
          <Link href="/collection">
            <MotionButton variant="neon">
              {t("home.viewAllProducts") || "View All Products"}
            </MotionButton>
          </Link>
        </div>
      </div>
    </section>
  );
}
