"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchProductByIdFromDb, CatalogProduct } from "@/lib/products-db";
import { useLocation } from "@/context/LocationContext";
import { KeyboardArrowRight } from "@/components/ui/keyboard-arrow";

export default function FigmaAudiophileHype() {
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const { formatPrice } = useLocation();

  useEffect(() => {
    async function loadProduct() {
      const p = await fetchProductByIdFromDb("prod-sparxie");
      if (p) setProduct(p);
    }
    loadProduct();
  }, []);

  const sparxieId = product?.id || "prod-sparxie";
  const sparxiePrice = product ? formatPrice(product.price) : "$89.99";
  const sparxieDriver = product?.driverType || "10mm Wood Dome Dynamic Driver";
  const sparxieMaterial = product?.material || "Sparkle Sculpted Housing + Acrylic Stand";

  return (
    <section id="collab" className="w-full bg-[#030303] py-32 lg:py-40 scroll-mt-20">
      <div className="w-full max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Main 2-Column Grid: Left Container + Right Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Vertical Accent Border with Tag + Title + Price */}
            <div className="border-l-2 border-[#BFDD25] pl-6 mb-8 flex flex-col items-start">
              {/* Heading 3: "OFFICIAL COLLABORATION" */}
              <span className="font-sans font-medium text-[12px] leading-[14px] tracking-[4.8px] text-[#c4c7c8] uppercase mb-4 block">
                HONKAI: STAR RAIL × MOONDROP
              </span>

              {/* Heading 2: "SPARXIE RT-ADAPTIVE ANC TWS" */}
              <h2 className="font-sans font-bold text-4xl sm:text-5xl lg:text-[56px] leading-[54px] tracking-[-2.5px] text-[#f0f0f0] mb-6">
                SPARXIE<br />RT-ADAPTIVE<br />ANC MINI TWS
              </h2>

              {/* Price Box */}
              <div className="w-full max-w-[317px] h-[59px] bg-[#e5e2e1] border border-[#6b7280] flex items-center justify-center px-6 shadow-sm">
                <span className="font-sans font-bold text-[16px] leading-[14px] tracking-[4.8px] text-black uppercase">
                  {sparxiePrice}
                </span>
              </div>
            </div>

            {/* Paragraph Text 1: Drivers Headline */}
            <div className="mb-6">
              <p className="font-sans font-normal text-base sm:text-[19px] leading-[30px] text-[#c4c7c8]">
                {product?.driverType
                  ? `${product.driverType} • Bluetooth 6.0 LHDC-V`
                  : "10mm Wide-Band Wood Dome Dynamic Driver • Bluetooth 6.0 LHDC-V Low-Latency Hi-Fi"}
              </p>
            </div>

            {/* Paragraph Text 2: Tuning Description */}
            <div className="mb-8">
              <p className="font-sans font-normal text-sm sm:text-[17px] leading-[30px] text-[#a1a1aa] text-justify">
                {product?.description ||
                  "Kolaborasi resmi HoYoverse Honkai: Star Rail bersama Moondrop menghadirkan TWS audiophile edisi karakter Sparkle. Ditenagai chip cerdas 22nm Moondrop TWS-2 dengan RT-Adaptive ANC, driver dinamis wood-dome 10mm bersuspensi redaman impedansi variabel, mode latensi rendah 60ms, DSP parametrik EQ 10-band, serta suara pemandu eksklusif karakter Sparkle."}
              </p>
            </div>

            {/* Horizontal Specs Bar: DRIVER & CONNECTIVITY / MATERIAL */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#444748] mb-8">
              <div>
                <span className="font-sans font-medium text-[12px] leading-[14px] tracking-[1.2px] text-[#BFDD25] uppercase block mb-1">
                  DRIVER
                </span>
                <span
                  className="font-sans font-medium text-sm sm:text-base leading-[24px] text-white block line-clamp-2"
                  title={sparxieDriver}
                >
                  {sparxieDriver}
                </span>
              </div>

              <div>
                <span className="font-sans font-medium text-[12px] leading-[14px] tracking-[1.2px] text-[#BFDD25] uppercase block mb-1">
                  EDISI & MATERIAL
                </span>
                <span
                  className="font-sans font-medium text-sm sm:text-base leading-[24px] text-white block line-clamp-2"
                  title={sparxieMaterial}
                >
                  {sparxieMaterial}
                </span>
              </div>
            </div>

            {/* Action Buttons: SHOP NOW & OFFICIAL STORE */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={`/product/${sparxieId}`}
                className="w-[176px] h-[50px] bg-[#d9d9d9] hover:bg-[#BFDD25] transition-colors flex items-center justify-center cursor-pointer shadow-md"
              >
                <span className="font-sans font-bold text-[12px] leading-[13px] tracking-[2.2px] text-[#131313] uppercase">
                  SHOP NOW
                </span>
              </Link>
              <a
                href={product?.squiglinkUrl || "https://shenzhenaudio.com/products/honkai-star-rail-x-moondrop-sparxie-rt-adaptive-anc-mini-hi-fi-tws"}
                target="_blank"
                rel="noopener noreferrer"
                className="h-[50px] px-5 border border-[#444748] hover:border-[#BFDD25] bg-[#050505] text-[#c4c7c8] hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="font-mono text-[11px] uppercase tracking-wider">OFFICIAL PAGE ↗</span>
              </a>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Top Showcase Banner Card */}
            <div className="relative w-full aspect-[16/10] bg-[#050505] border border-[#333333] overflow-hidden group rounded-sm">
              <Image
                src="https://cdn.shopify.com/s/files/1/0013/3896/6076/files/1_588ae6a9-9f9c-4160-8013-ec97beac8304.jpg?v=1788923488"
                alt="HONKAI: STAR RAIL × MOONDROP Sparxie TWS"
                fill
                sizes="(max-width: 1024px) 100vw, 665px"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                priority
              />

              {/* Badge: "HONKAI: STAR RAIL SPECIAL COLLABORATION" */}
              <div className="absolute bottom-4 left-4 bg-black/85 backdrop-blur-md border border-[#444748] px-4 py-2">
                <span className="font-sans font-medium text-[11px] leading-[15px] tracking-[1.5px] text-[#BFDD25] uppercase font-mono">
                  SPARKLE COLLABORATION 0.1A
                </span>
              </div>
            </div>

            {/* Bottom 2 Split Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Left Photo Card */}
              <div className="relative aspect-square w-full bg-[#050505] border border-[#333333] overflow-hidden flex items-center justify-center p-4 group rounded-sm">
                <Image
                  src="https://cdn.shopify.com/s/files/1/0013/3896/6076/files/2_1_7b581902-261e-4cca-bd6b-46748f5aeced.jpg?v=1788923488"
                  alt="Moondrop Sparxie Case & Earbuds"
                  fill
                  sizes="(max-width: 640px) 100vw, 325px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Right Detail Card linking to /product/prod-sparxie */}
              <Link
                href={`/product/${sparxieId}`}
                className="relative aspect-square w-full bg-[#080808] border border-[#333333] hover:border-[#BFDD25] p-8 flex flex-col justify-between group transition-colors cursor-pointer rounded-sm"
              >
                <div>
                  <span className="text-[10px] font-mono text-[#BFDD25] uppercase tracking-widest block mb-2">
                    Edisi Spesial Sparkle
                  </span>
                  <span className="font-sans font-semibold text-[14px] leading-[20px] tracking-[2px] text-white group-hover:text-[#BFDD25] uppercase block">
                    LIHAT SPESIFIKASI LENGKAP & BUNDLE AKSESORIS
                  </span>
                  <p className="text-xs text-[#8E8E93] mt-3 leading-relaxed">
                    Termasuk stand akrilik Sparkle, pendant, custom protective case, lanyard, dan voice prompt eksklusif.
                  </p>
                </div>

                <div className="flex items-center justify-between text-[#c4c7c8] group-hover:text-[#BFDD25] transition-colors pt-4 border-t border-[#222222]">
                  <span className="font-sans text-xs uppercase tracking-widest font-semibold">Buka Halaman Produk</span>
                  <KeyboardArrowRight className="w-5 h-5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
