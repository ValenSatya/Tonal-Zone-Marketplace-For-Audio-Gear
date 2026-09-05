"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = ["EAR PHONES", "TWS", "CABLE", "HEADPHONES"] as const;

export default function FigmaNewArrival() {
  const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]>("EAR PHONES");

  return (
    <section className="w-full bg-[#090808] py-32 lg:py-40">
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
                      ? "text-[#d4ff00] border-b-2 border-[#d4ff00]"
                      : "text-[#c4c7c8] hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid: 3 Exact Products from Figma Frame 17 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Product 1: Mimisbrunnr */}
          <Link
            href="/collection"
            className="w-full flex flex-col group cursor-pointer"
          >
            {/* Taller Image */}
            <div className="relative w-full aspect-[4/5] lg:aspect-[3/4] overflow-hidden bg-[#161616]">
              <Image
                src="/figma/prod-mimisbrunnr.png"
                alt="Mimisbrunnr"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Direct Text Below Image */}
            <div className="pt-4 flex flex-col items-start">
              <h4 className="font-sans font-medium text-2xl sm:text-[26px] leading-[36px] text-[#e5e2e1] group-hover:text-white transition-colors">
                Mimisbrunnr
              </h4>
              <p className="font-sans font-normal text-sm sm:text-base leading-relaxed tracking-[2px] text-[#c4c7c8] mt-1">
                RP 14.335.640,00
              </p>
            </div>
          </Link>

          {/* Product 2: EPZ G30 Gaming */}
          <Link
            href="/collection"
            className="w-full flex flex-col group cursor-pointer"
          >
            {/* Taller Image */}
            <div className="relative w-full aspect-[4/5] lg:aspect-[3/4] overflow-hidden bg-[#161616]">
              <Image
                src="/figma/prod-epz-g30.png"
                alt="EPZ G30 Gaming"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Direct Text Below Image */}
            <div className="pt-4 flex flex-col items-start">
              <h4 className="font-sans font-medium text-2xl sm:text-[26px] leading-[36px] text-[#e5e2e1] group-hover:text-white transition-colors">
                EPZ G30 Gaming
              </h4>
              <p className="font-sans font-normal text-sm sm:text-base leading-relaxed tracking-[2px] text-[#c4c7c8] mt-1">
                Rp 1.460.000,00
              </p>
            </div>
          </Link>

          {/* Product 3: Tangzu WuKong */}
          <Link
            href="/collection"
            className="w-full flex flex-col group cursor-pointer"
          >
            {/* Taller Image */}
            <div className="relative w-full aspect-[4/5] lg:aspect-[3/4] overflow-hidden bg-[#161616]">
              <Image
                src="/figma/prod-wukong.png"
                alt="Tangzu WuKong"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Direct Text Below Image */}
            <div className="pt-4 flex flex-col items-start">
              <h4 className="font-sans font-medium text-2xl sm:text-[26px] leading-[36px] text-[#e5e2e1] group-hover:text-white transition-colors">
                Tangzu WuKong
              </h4>
              <p className="font-sans font-normal text-sm sm:text-base leading-relaxed tracking-[2px] text-[#c4c7c8] mt-1">
                Rp 34.299.000
              </p>
            </div>
          </Link>

        </div>

      </div>
    </section>
  );
}
