"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchProductByIdFromDb, CatalogProduct } from "@/lib/products-db";

export default function FigmaHero() {
  const [product, setProduct] = useState<CatalogProduct | null>(null);

  useEffect(() => {
    async function loadHeroProduct() {
      const p = await fetchProductByIdFromDb("prod-chu3");
      if (p) setProduct(p);
    }
    loadHeroProduct();
  }, []);

  const heroImage = product?.images?.[2] || product?.image || "/images/Headphone-Zone-Moondrop-Chu-III-Homepage-Desktop-Banner-02.webp";
  const heroDescription = product?.description || "Engineered with a high-performance dynamic driver and interchangeable brass nozzles, delivering pure acoustic clarity and neutral reference sound.";
  const heroTarget = product ? `/product/${product.id}` : "/product/prod-chu3";

  return (
    <section className="relative w-full h-[735px] max-h-[735px] bg-[#030303] overflow-hidden select-none">
      {/* 1. Exact Figma Background Image (Rectangle 85) */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt="Moondrop CHU III Hero"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-center [image-rendering:-webkit-optimize-contrast] contrast-[1.04] brightness-[1.02]"
        />
        {/* Seamless bottom fade to #030303 without dulling the IEM clarity */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/35 via-35% to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent 65% to-[#030303]/40 pointer-events-none" />
      </div>

      {/* 2. Content Container */}
      <div className="relative z-10 w-full max-w-[1500px] h-full mx-auto px-6 sm:px-10 lg:px-16 flex flex-col justify-between pt-24 pb-14">
        {/* Empty Spacer */}
        <div className="flex-1" />

        {/* Bottom Hero Layout: Description + CHU III on Left, Custom SHOP NOW Button on Right */}
        <div className="relative z-10 w-full flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          {/* Left Block: Description Paragraph (Above) + Title "CHU III" (Below) */}
          <div className="flex flex-col items-start gap-10 sm:gap-14 lg:gap-16">
            {/* Real Audiophile Product Description */}
            <p className="font-sans text-[13px] sm:text-[14px] leading-[1.65] text-white/85 max-w-[280px] sm:max-w-[320px]">
              {heroDescription}
            </p>

            {/* Main Title: Dynamic CHU III / Model Name */}
            <h1 className="font-heading font-bold text-6xl sm:text-8xl lg:text-[128px] leading-none tracking-[1.28px] text-white uppercase select-none">
              {product?.name ? (product.name.includes("CHU") ? "CHU III" : product.name) : "CHU III"}
            </h1>
          </div>

          {/* Right Action Block: Elongated Sharp-Cornered "SHOP NOW" Button with Hover 2 Animation Aligned to Baseline */}
          <div className="flex flex-col items-start lg:items-end">
            <Link
              href={heroTarget}
              className="relative w-[220px] sm:w-[252px] h-[52px] sm:h-[56px] p-1.5 bg-white hover:bg-[#BFDD25] transition-colors duration-300 ease-out flex items-center justify-between cursor-pointer shadow-lg group rounded-none overflow-hidden select-none"
            >
              {/* 1. Left Inset Dark Square (Visible in Idle, slides left & collapses on Hover 2) */}
              <div className="w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] bg-[#131313] flex items-center justify-center rounded-none shrink-0 overflow-hidden transition-all duration-300 ease-out group-hover:w-0 group-hover:opacity-0 group-hover:-translate-x-6">
                <svg
                  width="9"
                  height="15"
                  viewBox="0 0 9 15"
                  fill="none"
                  className="text-[#BFDD25] shrink-0"
                >
                  <path
                    d="M1.5 1.5L7.5 7.5L1.5 13.5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* 2. Button Label (Smoothly remains balanced across the transition) */}
              <span className="flex-1 text-center font-sans font-bold text-[13px] sm:text-[14px] leading-none tracking-[2.4px] text-[#131313] uppercase transition-all duration-300 ease-out">
                SHOP NOW
              </span>

              {/* 3. Right Chevron (Hidden in Idle, smoothly slides in on Hover 2) */}
              <div className="w-0 opacity-0 -translate-x-4 overflow-hidden flex items-center justify-center shrink-0 transition-all duration-300 ease-out group-hover:w-[40px] sm:group-hover:w-[44px] group-hover:opacity-100 group-hover:translate-x-0">
                <svg
                  width="9"
                  height="15"
                  viewBox="0 0 9 15"
                  fill="none"
                  className="text-[#131313] shrink-0"
                >
                  <path
                    d="M1.5 1.5L7.5 7.5L1.5 13.5"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
