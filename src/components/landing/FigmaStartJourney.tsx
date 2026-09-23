"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchProductsFromDb, getInstantCatalog, CatalogProduct } from "@/lib/products-db";
import { useLocation } from "@/context/LocationContext";
import { useLanguage } from "@/context/LanguageContext";

// Preferred beginner items strictly priced under Rp 600.000 (< $37.50) with transparent cutouts
const BEGINNER_JOURNEY_CONFIG = [
  {
    id: "prod-chu3",
    name: "Moondrop Chu II DSP",
    fallbackPrice: 22.0,
    image: "/images/transparent/chu-2-transparent.png",
    layout: "landscape" as const,
  },
  {
    id: "prod-waner-sg2",
    name: "Tangzu Wan'er S.G",
    fallbackPrice: 19.9,
    image: "/images/transparent/waner-sg-transparent.png",
    layout: "square" as const,
  },
  {
    id: "prod-space-travel",
    name: "Moondrop Space Travel",
    fallbackPrice: 25.0,
    image: "/images/transparent/space-travel-transparent.png",
    layout: "tall" as const,
  },
];

type BentoProductItem = CatalogProduct & { layout: "landscape" | "square" | "tall" };

export default function FigmaStartJourney() {
  const { t } = useLanguage();
  const [allProducts, setAllProducts] = useState<CatalogProduct[]>(() => getInstantCatalog());
  const [customJourney, setCustomJourney] = useState<typeof BEGINNER_JOURNEY_CONFIG | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { formatPrice } = useLocation();

  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        const { fetchLandingConfigFromDb } = await import("@/lib/landing-config");
        const [data, config] = await Promise.all([
          fetchProductsFromDb(),
          fetchLandingConfigFromDb(),
        ]);
        if (isMounted) {
          setAllProducts(data);
          if (config?.start_journey && config.start_journey.length > 0) {
            setCustomJourney(config.start_journey as any);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load journey products:", err);
        if (isMounted) setIsLoading(false);
      }
    }
    loadProducts();

    const handleUpdate = () => loadProducts();
    window.addEventListener("tonalzone_landing_updated", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("tonalzone_landing_updated", handleUpdate);
    };
  }, []);

  // Map products matching configured beginner items
  const bentoProducts: BentoProductItem[] = useMemo(() => {
    const journeyList = customJourney || BEGINNER_JOURNEY_CONFIG;
    return journeyList.map((cfg) => {
      const match = allProducts.find((p) => p.id === cfg.id);
      if (match) {
        return {
          ...match,
          image: cfg.image || match.image,
          layout: cfg.layout,
        } as BentoProductItem;
      }
      return {
        id: cfg.id,
        name: cfg.name,
        brand: cfg.name.split(" ")[0] || "Audiophile",
        price: cfg.fallbackPrice,
        image: cfg.image,
        description: "Compact, pristine audiophile tuning engineered for pure listening clarity.",
        rating: 4.8,
        reviews: 210,
        badge: "Best Seller",
        category: "IN-EAR MONITORS",
        stock: 50,
        inStock: true,
        preOrder: false,
        layout: cfg.layout,
      } as BentoProductItem;
    });
  }, [allProducts, customJourney]);

  return (
    <section className="w-full bg-[#030303] py-20 lg:py-28">
      <div className="w-full max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Main Title: "Start your journey here" (Figma Frame 125) */}
        <div className="mb-6 lg:mb-8">
          <h2 className="font-sans font-semibold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
            {t("landing.startJourney")}
          </h2>
        </div>

        {/* Sub-header Bar: "For Beginner" + "See all" */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.06] mb-8">
          <div className="flex items-center gap-3">
            <h3 className="font-sans font-bold text-xl sm:text-2xl text-white tracking-tight">
              {t("landing.forBeginner")}
            </h3>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[#D4FF00]/10 text-[#D4FF00] border border-[#D4FF00]/20">
              {t("landing.under600k")}
            </span>
          </div>

          <Link
            href="/collection?experience=BEGINNER&maxPrice=37.5"
            className="group inline-flex items-center gap-2 text-white hover:text-[#BFDD25] transition-colors font-sans font-semibold text-base sm:text-lg"
          >
            <span>{t("landing.seeAll")}</span>
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>

        {/* Bento Grid Layout (Frame 125 Structure: 735px Left + 391px Right) */}
        {isLoading && allProducts.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 w-full">
            <div className="lg:col-span-8 flex flex-col gap-2.5 sm:gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 h-64">
                <div className="bg-[#141414] rounded-[24px] animate-pulse" />
                <div className="bg-[#141414] rounded-[24px] animate-pulse" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 h-56">
                <div className="bg-[#141414] rounded-[24px] animate-pulse" />
                <div className="bg-[#141414] rounded-[24px] animate-pulse" />
                <div className="bg-[#141414] rounded-[24px] animate-pulse" />
              </div>
            </div>
            <div className="lg:col-span-4 h-[532px] bg-[#141414] rounded-[24px] animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 items-stretch">
            {/* LEFT COLUMN (Span 8 in 12-col grid = ~67%) */}
            <div className="lg:col-span-8 flex flex-col gap-2.5 sm:gap-3">
              {/* TOP ROW: 2 Landscape Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3">
                {/* Card 1 (~48% width in Figma Frame 104) */}
                {bentoProducts[0] && (
                  <div className="sm:col-span-6">
                    <BentoCard product={bentoProducts[0]} formatPrice={formatPrice} layout="landscape" />
                  </div>
                )}

                {/* Card 2 (~52% width in Figma Frame 105) */}
                {bentoProducts[1] && (
                  <div className="sm:col-span-6">
                    <BentoCard product={bentoProducts[1]} formatPrice={formatPrice} layout="landscape" />
                  </div>
                )}
              </div>

              {/* BOTTOM ROW: 3 Square Cards (Frame 110: Cards 107, 108, 109) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {bentoProducts[2] && (
                  <BentoCard product={bentoProducts[2]} formatPrice={formatPrice} layout="square" />
                )}
                {bentoProducts[3] && (
                  <BentoCard product={bentoProducts[3]} formatPrice={formatPrice} layout="square" />
                )}
                {bentoProducts[4] && (
                  <BentoCard product={bentoProducts[4]} formatPrice={formatPrice} layout="square" />
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: 1 Tall Portrait Card (Span 4 in 12-col grid = ~33%, Frame 106) */}
            <div className="lg:col-span-4 flex flex-col">
              {bentoProducts[5] && (
                <BentoCard product={bentoProducts[5]} formatPrice={formatPrice} layout="tall" />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Sub-component for each individual Bento Card
interface BentoCardProps {
  product: BentoProductItem;
  formatPrice: (price: number) => string;
  layout: "landscape" | "square" | "tall";
}

function BentoCard({ product, formatPrice, layout }: BentoCardProps) {
  // Container heights matching Figma proportions
  const heightClasses = {
    landscape: "h-[250px] sm:h-[260px]",
    square: "h-[240px] sm:h-[250px]",
    tall: "h-[360px] lg:h-full min-h-[360px] lg:min-h-[530px]",
  }[layout];

  return (
    <Link
      href={`/product/${product.id}`}
      className={`group relative flex flex-col justify-between p-5 sm:p-6 bg-[#161616] hover:bg-[#1a1a1a] border border-white/[0.05] hover:border-white/15 rounded-[24px] transition-all duration-300 w-full ${heightClasses} overflow-hidden shadow-lg`}
    >
      {/* Product Image Thumbnail - Seamless transparent floating display with soft depth */}
      <div
        className={`relative w-full flex items-center justify-center overflow-visible bg-transparent ${layout === "tall"
            ? "h-48 sm:h-64 lg:h-72 my-auto"
            : layout === "landscape"
              ? "h-28 sm:h-32 mb-4"
              : "h-24 sm:h-28 mb-3"
          }`}
      >
        <Image
          src={product.image || product.images?.[0] || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Subtle Brand Badge */}
        {product.brand && (
          <span className="absolute top-0 left-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/[0.07] border border-white/10 backdrop-blur-md text-zinc-300">
            {product.brand}
          </span>
        )}
      </div>

      {/* Bottom Info Bar: Product Name, Price, and Circular Action Badge */}
      <div className="flex items-end justify-between gap-3 pt-2">
        <div className="flex flex-col min-w-0 pr-2">
          <h4 className="font-sans font-bold text-sm sm:text-base text-white truncate group-hover:text-[#BFDD25] transition-colors">
            {product.name}
          </h4>
          <p className="font-sans font-semibold text-sm sm:text-base text-zinc-300 mt-0.5">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* Circular White Action Badge */}
        <div className="flex-shrink-0 w-11 h-11 rounded-full bg-white text-black flex items-center justify-center group-hover:bg-[#BFDD25] group-hover:scale-105 transition-all duration-300 shadow-md">
          <svg
            className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
