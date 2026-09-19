"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchProductByIdFromDb, CatalogProduct } from "@/lib/products-db";
import { useLocation } from "@/context/LocationContext";
import { fetchLandingConfigFromDb, DEFAULT_LANDING_CONFIG, CollaborationConfig } from "@/lib/landing-config";
import { useLanguage } from "@/context/LanguageContext";

export default function FigmaCollaboration() {
  const { t } = useLanguage();
  const [collabConfig, setCollabConfig] = useState<CollaborationConfig>(DEFAULT_LANDING_CONFIG.collaboration);
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const { formatPrice } = useLocation();

  useEffect(() => {
    let isMounted = true;
    async function loadCollabData() {
      try {
        const config = await fetchLandingConfigFromDb();
        if (isMounted && config?.collaboration) {
          setCollabConfig(config.collaboration);
          const pId = config.collaboration.productId || "prod-sparxie";
          const data = await fetchProductByIdFromDb(pId);
          if (isMounted && data) {
            setProduct(data);
          }
        }
      } catch (err) {
        console.error("Failed to load collaboration data:", err);
      }
    }
    loadCollabData();

    const handleUpdate = () => loadCollabData();
    window.addEventListener("tonalzone_landing_updated", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("tonalzone_landing_updated", handleUpdate);
    };
  }, []);

  const bgImage = collabConfig.bgImage || "/images/collab-hsr-moondrop-bg.png";
  const img1 = collabConfig.productImage1 || "/images/collab-sparxie-case.png";
  const img2 = collabConfig.productImage2 || "/images/collab-sparxie-earbuds.png";
  const title = collabConfig.title || "Moondrop X HSR Sparxie TWS";
  
  const defaultEnCollabDesc = "Official collaboration between HoYoverse Honkai: Star Rail and Moondrop, featuring customized sound tuning and collectible design.";
  const defaultIdCollabDesc = "Kolaborasi resmi HoYoverse Honkai: Star Rail bersama Moondrop.";
  const rawDesc = collabConfig.description || product?.description || defaultEnCollabDesc;
  const description = (rawDesc === defaultEnCollabDesc || rawDesc === defaultIdCollabDesc)
    ? t("landing.collabDesc")
    : rawDesc;

  const features = collabConfig.features && collabConfig.features.length > 0
    ? collabConfig.features
    : ["RT-Adaptive ANC", "Wood Dome 10mm", "VDSF Target DSP"];
  const displayPrice = product ? formatPrice(product.price) : (collabConfig.price || "RP 1.400.000");
  const ctaLink = collabConfig.ctaLink || (product ? `/product/${product.id}` : "/product/prod-sparxie");

  return (
    <section className="relative w-full min-h-[720px] lg:min-h-[820px] bg-[#030303] overflow-hidden flex items-center py-16 lg:py-24 select-none">
      {/* 1. Full-Bleed Edge-to-Edge Hero Background */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <Image
          src={bgImage}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[78%_center] sm:object-[center_right] lg:object-center brightness-[0.98] contrast-[1.02]"
        />

        {/* Seamless Blend: Top & Bottom Fade into #030303 Website Canvas */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#030303] via-[#030303]/60 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#030303] via-[#030303]/60 to-transparent pointer-events-none" />

        {/* Left Side Shadow: Ensures high contrast & legibility for the modal and titles */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 via-45% to-transparent pointer-events-none" />
      </div>

      {/* 2. Content Container (Aligned with Site Max-Width) */}
      <div className="relative z-10 w-full max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col justify-center">
        {/* Section Header: "Collaboration" (Figma Frame 121) */}
        <div className="mb-8 lg:mb-10">
          <h2 className="font-sans font-semibold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight uppercase drop-shadow-md">
            {t("landing.collaboration")}
          </h2>
        </div>

        {/* Floating Showcase Modal/Card */}
        <div className="relative z-10 w-full max-w-[540px] bg-[#F3F3F3] text-[#131313] rounded-[24px] p-6 sm:p-8 shadow-2xl shadow-black/90">
          {/* Dual Image Gallery: Charging Case & Earbuds */}
          <div className="grid grid-cols-2 gap-3.5 mb-6">
            {/* Image 1: Case */}
            <div className="relative h-40 sm:h-48 bg-white rounded-[16px] overflow-hidden p-3 shadow-sm group/img flex items-center justify-center">
              <Image
                src={img1}
                alt="Product Showcase 1"
                fill
                className="object-contain p-2 group-hover/img:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, 250px"
              />
            </div>

            {/* Image 2: Earbuds (Fill Container) */}
            <div className="relative h-40 sm:h-48 bg-[#0a0a0a] rounded-[16px] overflow-hidden shadow-sm group/img">
              <Image
                src={img2}
                alt="Product Showcase 2"
                fill
                className="object-cover group-hover/img:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, 250px"
              />
            </div>
          </div>

          {/* Product Title & Copywriting */}
          <div className="mb-4">
            <h3 className="font-sans font-bold text-2xl sm:text-3xl text-[#131313] tracking-tight leading-snug">
              {title}
            </h3>
            <p className="font-sans text-sm text-[#505050] leading-relaxed mt-2 line-clamp-3">
              {description}
            </p>
          </div>

          {/* Price & Badge */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-sans font-bold text-2xl sm:text-[28px] text-[#131313]">
              {displayPrice}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E2E2E2] text-zinc-700">
              {collabConfig.badge && collabConfig.badge !== "Official Collab" ? collabConfig.badge : t("landing.officialCollab")}
            </span>
          </div>

          {/* Feature Pills */}
          <div className="mb-6">
            <span className="block font-sans font-bold text-[11px] tracking-widest text-zinc-500 uppercase mb-2">
              {t("landing.feature")}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {features.map((feat, idx) => (
                <span key={idx} className="px-3.5 py-1.5 rounded-full bg-[#E2E2E2] text-xs font-semibold text-zinc-800">
                  {feat}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Shop Now Button */}
          <div>
            <Link
              href={ctaLink}
              className="group inline-flex items-center justify-center gap-3 w-full sm:w-auto px-9 py-4 rounded-full bg-black text-white hover:bg-zinc-800 transition-all font-sans font-bold text-sm tracking-wider uppercase shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{t("landing.shopNow")}</span>
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
