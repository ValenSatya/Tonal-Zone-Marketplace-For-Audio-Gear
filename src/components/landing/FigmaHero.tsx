"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchProductByIdFromDb, CatalogProduct } from "@/lib/products-db";
import { fetchLandingConfigFromDb, DEFAULT_LANDING_CONFIG, HeroConfig } from "@/lib/landing-config";
import { useLanguage } from "@/context/LanguageContext";

export default function FigmaHero() {
  const { t } = useLanguage();
  const [heroConfig, setHeroConfig] = useState<HeroConfig>(DEFAULT_LANDING_CONFIG.hero);
  const [product, setProduct] = useState<CatalogProduct | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const config = await fetchLandingConfigFromDb();
        if (isMounted && config?.hero) {
          setHeroConfig(config.hero);
          if (config.hero.productId) {
            const p = await fetchProductByIdFromDb(config.hero.productId);
            if (isMounted && p) setProduct(p);
          }
        }
      } catch (err) {
        console.error("Failed to load hero data:", err);
      }
    }
    loadData();

    // Custom event to refresh when admin updates
    const handleUpdate = () => loadData();
    window.addEventListener("tonalzone_landing_updated", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("tonalzone_landing_updated", handleUpdate);
    };
  }, []);

  const heroImage = heroConfig.imageUrl || "/images/Headphone-Zone-Moondrop-Chu-III-Homepage-Desktop-Banner-02.webp";
  const heroTitle = heroConfig.productName || (product?.name ? (product.name.includes("CHU") ? "CHU III" : product.name) : "CHU III");
  
  // If description matches default Chu III English description, translate it dynamically via t("landing.heroFallbackDesc")
  const defaultEnglishDesc = "Engineered with a high-performance 10mm dynamic driver featuring an Aluminum-Magnesium alloy dome composite diaphragm and brass CNC acoustic nozzle, delivering pure acoustic clarity and neutral reference sound.";
  const rawDesc = heroConfig.description || product?.description || defaultEnglishDesc;
  const heroDescription = (rawDesc === defaultEnglishDesc || rawDesc === "Engineered with a high-performance 10mm dynamic driver.")
    ? t("landing.heroFallbackDesc")
    : rawDesc;

  const heroTarget = heroConfig.ctaLink || (product ? `/product/${product.id}` : "/product/prod-chu3");
  const heroCtaText = heroConfig.ctaText && heroConfig.ctaText !== "SHOP NOW" ? heroConfig.ctaText : t("landing.heroCta");

  return (
    <section className="relative w-full min-h-[580px] h-[85vh] max-h-[780px] sm:h-[735px] sm:max-h-[735px] bg-[#030303] overflow-hidden select-none">
      {/* 1. Exact Figma Background Image (Rectangle 85) */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt={heroTitle}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-[72%_center] sm:object-center [image-rendering:-webkit-optimize-contrast] contrast-[1.04] brightness-[1.02]"
        />
        {/* Seamless bottom fade to #030303 without dulling the IEM clarity */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/60 sm:via-[#030303]/35 via-40% to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent 65% to-[#030303]/40 pointer-events-none" />
      </div>

      {/* 2. Content Container */}
      <div className="relative z-10 w-full max-w-[1360px] h-full mx-auto px-5 sm:px-8 lg:px-12 flex flex-col justify-between pt-20 pb-8 sm:pt-24 sm:pb-14">
        {/* Empty Spacer */}
        <div className="flex-1" />

        {/* Bottom Hero Layout: Description + Title on Left, Custom Action Button on Right */}
        <div className="relative z-10 w-full flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
          {/* Left Block: Description Paragraph (Above) + Dynamic Title (Below) */}
          <div className="flex flex-col items-start gap-4 sm:gap-8 lg:gap-16">
            {/* Real Audiophile Product Description */}
            <p className="font-sans text-[12px] sm:text-[14px] leading-relaxed text-white/80 max-w-[310px] sm:max-w-[340px]">
              {heroDescription}
            </p>

            {/* Main Title: Dynamic Model / Campaign Name */}
            <h1 className="font-heading font-bold text-5xl sm:text-7xl lg:text-[128px] leading-none tracking-tight sm:tracking-[1.28px] text-white uppercase select-none">
              {heroTitle}
            </h1>
          </div>

          {/* Right Action Block: Smooth Green Expanding Morphing Button */}
          <div className="flex flex-col items-start lg:items-end pt-1 sm:pt-0">
            <Link
              href={heroTarget}
              className="relative inline-flex items-center h-[46px] sm:h-[58px] group cursor-pointer select-none"
            >
              {/* Main Button Container with generous rounded pill shape */}
              <div className="relative flex items-center h-[44px] sm:h-[54px] w-[215px] sm:w-[260px]">
                
                {/* 1. Underlying White Pill for Text (Positioned on the right side in idle) */}
                <div className="absolute right-0 top-0 bottom-0 left-[52px] sm:left-[64px] bg-white rounded-full shadow-md flex items-center justify-center transition-opacity duration-300 group-hover:opacity-0 pointer-events-none">
                  <span className="font-sans font-bold text-[12px] sm:text-[14px] tracking-[2px] sm:tracking-[2.4px] text-black uppercase whitespace-nowrap px-3 sm:px-4">
                    {heroCtaText}
                  </span>
                </div>

                {/* 2. Green Element: Starts as a perfect circle on the left, EXPANDS to full width on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-[44px] sm:w-[54px] group-hover:w-full rounded-full bg-[#BFDD25] shadow-lg flex items-center transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-hidden z-10">
                  
                  {/* Left Chevron: Visible when it's a circle (idle), fades out smoothly on hover */}
                  <div className="w-[44px] sm:w-[54px] h-full flex items-center justify-center shrink-0 transition-opacity duration-300 group-hover:opacity-0">
                    <svg
                      width="9"
                      height="15"
                      viewBox="0 0 10 16"
                      fill="none"
                      className="text-black stroke-[2.8] sm:stroke-[3]"
                    >
                      <path
                        d="M2 2L8 8L2 14"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {/* Expanded Content: Text centered + Chevron on the right (Fades in when green pill expands) */}
                  <div className="absolute inset-0 flex items-center justify-between px-5 sm:px-7 opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-100">
                    <span className="font-sans font-extrabold text-[12px] sm:text-[14px] tracking-[2px] sm:tracking-[2.4px] text-black uppercase whitespace-nowrap">
                      {heroCtaText}
                    </span>
                    <svg
                      width="10"
                      height="16"
                      viewBox="0 0 11 17"
                      fill="none"
                      className="text-black stroke-[3] sm:stroke-[3.2] shrink-0"
                    >
                      <path
                        d="M2.5 2.5L8.5 8.5L2.5 14.5"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                </div>

              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
