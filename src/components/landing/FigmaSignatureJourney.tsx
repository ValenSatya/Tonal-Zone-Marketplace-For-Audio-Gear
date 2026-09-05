"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const SIGNATURE_TABS = [
  { id: 0, label: "NEUTRAL", active: true },
  { id: 1, label: "NEUTRAL", active: false },
  { id: 2, label: "NEUTRAL", active: false },
  { id: 3, label: "NEUTRAL", active: false },
];

export default function FigmaSignatureJourney() {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <section className="w-full bg-[#090808] py-32 lg:py-40">
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
            {SIGNATURE_TABS.map((tab, idx) => {
              const isActive = selectedTab === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedTab(idx)}
                  className={`w-full max-w-[276px] h-[50px] border flex items-center justify-between px-6 transition-colors cursor-pointer ${
                    isActive
                      ? "border-[#d4ff00] bg-transparent"
                      : "border-[#4a4a4a] hover:border-white bg-transparent"
                  }`}
                >
                  <span className="font-sans font-medium text-[20px] sm:text-[24px] tracking-[-1px] text-white">
                    {tab.label}
                  </span>

                  {/* Arrow Icon */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              );
            })}

            {/* Description Text: General Sans */}
            <div className="w-full max-w-[343px] mt-6">
              <p className="font-sans font-normal text-[16px] leading-[33px] text-[#949494]">
                Lorem ipsum tellus aliquam sagittis orci a viverra enim mattis dolor mattis egestas ornare lectus ac eget hendrerit et nullam.
              </p>
            </div>
          </div>

          {/* Right Column: 3 Products matching Frame 17 (Container x: 456, y: 3907, w: 1152) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            
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
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Direct Text Below Image */}
              <div className="pt-4 flex flex-col items-start">
                <h4 className="font-sans font-medium text-lg sm:text-xl leading-snug text-[#e5e2e1] group-hover:text-white transition-colors truncate w-full">
                  Mimisbrunnr
                </h4>
                <p className="font-sans font-normal text-xs sm:text-sm leading-relaxed tracking-[2px] text-[#c4c7c8] mt-1">
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
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Direct Text Below Image */}
              <div className="pt-4 flex flex-col items-start">
                <h4 className="font-sans font-medium text-lg sm:text-xl leading-snug text-[#e5e2e1] group-hover:text-white transition-colors truncate w-full">
                  EPZ G30 Gaming
                </h4>
                <p className="font-sans font-normal text-xs sm:text-sm leading-relaxed tracking-[2px] text-[#c4c7c8] mt-1">
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
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Direct Text Below Image */}
              <div className="pt-4 flex flex-col items-start">
                <h4 className="font-sans font-medium text-lg sm:text-xl leading-snug text-[#e5e2e1] group-hover:text-white transition-colors truncate w-full">
                  Tangzu WuKong
                </h4>
                <p className="font-sans font-normal text-xs sm:text-sm leading-relaxed tracking-[2px] text-[#c4c7c8] mt-1">
                  Rp 34.299.000
                </p>
              </div>
            </Link>

          </div>

        </div>

      </div>
    </section>
  );
}
