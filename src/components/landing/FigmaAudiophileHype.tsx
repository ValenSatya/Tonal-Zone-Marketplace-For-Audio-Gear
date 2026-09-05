import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function FigmaAudiophileHype() {
  return (
    <section className="w-full bg-[#090808] py-32 lg:py-40">
      <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Main 2-Column Grid matching Figma: Left Container (471px) + Right Container (665px) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column (471px on 1280px canvas -> 5-6 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            
            {/* Vertical Accent Border with Tag + Title + Price */}
            <div className="border-l-2 border-[#d4ff00] pl-6 mb-8 flex flex-col items-start">
              {/* Heading 3: "HYPE FOR AUDIOPHILE" - General Sans */}
              <span className="font-sans font-medium text-[12px] leading-[14px] tracking-[4.8px] text-[#c4c7c8] uppercase mb-4 block">
                HYPE FOR AUDIOPHILE
              </span>

              {/* Heading 2: "MOONDROP X CRINACLE DUSK" - General Sans Bold */}
              <h2 className="font-sans font-bold text-4xl sm:text-5xl lg:text-[64px] leading-[58px] tracking-[-3.2px] text-[#f0f0f0] mb-6">
                MOONDROP<br />X<br />CRINACLE DUSK
              </h2>

              {/* Price Box: Rectangle 7 (w: 317, h: 59, fill: #e5e2e1, stroke: #6b7280) - General Sans */}
              <div className="w-full max-w-[317px] h-[59px] bg-[#e5e2e1] border border-[#6b7280] flex items-center justify-center px-6">
                <span className="font-sans font-bold text-[16px] leading-[14px] tracking-[4.8px] text-black uppercase">
                  RP 6.444.360,11
                </span>
              </div>
            </div>

            {/* Paragraph Text 1: Drivers Headline - General Sans */}
            <div className="mb-6">
              <p className="font-sans font-normal text-base sm:text-[20px] leading-[33px] text-[#c4c7c8]">
                Two Dynamic Drivers + Two Balanced Armatures + Two Planar Drivers + Triplicate Hybrid Three-Way Frequency Crossover
              </p>
            </div>

            {/* Paragraph Text 2: Tuning Description - General Sans */}
            <div className="mb-8">
              <p className="font-sans font-normal text-sm sm:text-[18px] leading-[33px] text-[#c4c7c8] text-justify">
                Building on Blessing 3’s split-composite physical frequency separation framework, DUSK replaces the balanced armature treble driver with low-distortion, smooth-response planar treble driver and further optimizes the treble timbre through collaborative tuning, resulting in more natural treble definition.
              </p>
            </div>

            {/* Horizontal Specs Bar: DRIVER & MATERIAL - General Sans */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#444748] mb-8">
              <div>
                <span className="font-sans font-medium text-[12px] leading-[14px] tracking-[1.2px] text-[#d4ff00] uppercase block mb-1">
                  DRIVER
                </span>
                <span className="font-sans font-medium text-xl sm:text-[24px] leading-[36px] text-white">
                  2DD+2BA+2Planar
                </span>
              </div>

              <div>
                <span className="font-sans font-medium text-[12px] leading-[14px] tracking-[1.2px] text-[#d4ff00] uppercase block mb-1">
                  MATERIAL
                </span>
                <span className="font-sans font-medium text-xl sm:text-[24px] leading-[36px] text-white">
                  3D-Printed Medical Resin
                </span>
              </div>
            </div>

            {/* Action Button: SHOP NOW - General Sans */}
            <Link
              href="/product/prod-blessing-3"
              className="w-[176px] h-[50px] bg-[#d9d9d9] hover:bg-[#d4ff00] transition-colors flex items-center justify-center cursor-pointer shadow-md"
            >
              <span className="font-sans font-bold text-[12px] leading-[13px] tracking-[2.2px] text-[#131313] uppercase">
                SHOP NOW
              </span>
            </Link>

          </div>

          {/* Right Column (665px on 1280px canvas -> 7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Top Blueprint Card (w: 665, h: 374, stroke: #444748) */}
            <div className="relative w-full aspect-[16/10] bg-[#141414] border border-[#444748] overflow-hidden group">
              <Image
                src="/figma/dusk-blueprint.png"
                alt="Visual Blueprint 0.1A"
                fill
                sizes="(max-width: 1024px) 100vw, 665px"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />

              {/* Tag: "VISUAL BLUEPRINT 0.1A" - General Sans */}
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-[#444748] px-4 py-2">
                <span className="font-sans font-medium text-[10px] leading-[15px] tracking-[1px] text-white uppercase">
                  VISUAL BLUEPRINT 0.1A
                </span>
              </div>
            </div>

            {/* Bottom 2 Split Cards (w: 325 each) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Left Photo Card (w: 325, h: 325, bg: #201f1f, stroke: #444748) */}
              <div className="relative aspect-square w-full bg-[#201f1f] border border-[#444748] overflow-hidden flex items-center justify-center p-6 group">
                <div className="relative w-[275px] h-[275px]">
                  <Image
                    src="/figma/dusk-iem.png"
                    alt="Moondrop Dusk Shell"
                    fill
                    sizes="(max-width: 640px) 100vw, 325px"
                    className="object-contain group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

              {/* Right Detail Card (w: 324, h: 325, bg: #201f1f, stroke: #444748) - General Sans */}
              <Link
                href="/product/prod-blessing-3"
                className="relative aspect-square w-full bg-[#201f1f] border border-[#444748] hover:border-[#d4ff00] p-8 flex flex-col justify-between group transition-colors cursor-pointer"
              >
                <div>
                  <span className="font-sans font-medium text-[12px] leading-[15px] tracking-[3.6px] text-[#c4c7c8] group-hover:text-white uppercase block leading-relaxed">
                    SEE DETAIL SPESIFICATION
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#c4c7c8] group-hover:text-[#d4ff00] transition-colors">
                  <span className="font-sans text-xs uppercase tracking-widest">Detail Produk</span>
                  <span>→</span>
                </div>
              </Link>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
