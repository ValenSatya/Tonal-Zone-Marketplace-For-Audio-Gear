import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function FigmaHero() {
  return (
    <section className="relative w-full h-[735px] max-h-[735px] bg-[#090808] overflow-hidden select-none">
      {/* 1. Exact Figma Background Image (Rectangle 85) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/figma/hero-bg.png"
          alt="Moondrop Blessing 3 Hero"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Subtle overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090808] via-transparent to-black/40" />
      </div>

      {/* 2. Content Container */}
      <div className="relative z-10 w-full max-w-[1500px] h-full mx-auto px-6 sm:px-10 lg:px-16 flex flex-col justify-between pt-24 pb-14">
        
        {/* Top Watermark Typography: "MOONDROP" */}
        <div className="absolute top-[80px] right-6 sm:right-10 lg:right-16 pointer-events-none z-0">
          <span className="font-heading font-bold text-[72px] sm:text-[100px] lg:text-[128px] leading-[171px] tracking-[1.28px] uppercase text-white/[0.06]">
            MOONDROP
          </span>
        </div>

        {/* Empty Spacer */}
        <div className="flex-1" />

        {/* Bottom Hero Layout: BLESSING 3 + Button + Neutral Tag */}
        <div className="relative z-10 w-full flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          
          {/* Main Title: "BLESSING 3 " (x: 61, y: 505, w: 756, h: 141) */}
          <div className="flex flex-col">
            <h1 className="font-heading font-bold text-6xl sm:text-8xl lg:text-[128px] leading-none tracking-[1.28px] text-white uppercase">
              BLESSING 3
            </h1>
          </div>

          {/* Right Action Block: Button "SHOP NOW" + "Neutral" Tag */}
          <div className="flex flex-col items-start lg:items-end gap-3">
            {/* Tag: "Neutral" (x: 927, y: 646) - General Sans */}
            <span className="font-sans font-bold text-[11px] leading-[13px] tracking-[2.2px] text-[#e5e2e1] uppercase">
              NEUTRAL
            </span>

            {/* Button: "SHOP NOW" (x: 1004, y: 591, w: 212, h: 55) - General Sans */}
            <Link
              href="/product/prod-blessing-3"
              className="w-[212px] h-[55px] bg-white hover:bg-[#D4FF00] transition-colors duration-200 flex items-center justify-center gap-3 cursor-pointer shadow-lg group rounded-sm"
            >
              <span className="font-sans font-bold text-[14px] leading-[13px] tracking-[2.2px] text-[#131313] uppercase">
                SHOP NOW
              </span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#131313] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
                <path d="M2.5 2.5H11.5V11.5M11.5 2.5L2.5 11.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
