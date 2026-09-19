"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

import { fetchProductsFromDb, cleanProductName, CatalogProduct } from "@/lib/products-db";
import { useLanguage } from "@/context/LanguageContext";

interface BestSellerProduct {
  id: string;
  brand: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

const DEFAULT_PRODUCTS: BestSellerProduct[] = [
  {
    id: "prod-waner-sg2",
    brand: "TANGZU",
    title: "TANGZU WAN'ER SG 2",
    description:
      "The highly anticipated successor featuring a dual-cavity dynamic driver and artisan Red Lion faceplate, delivering lush musical warmth and smooth vocal presence.",
    image: "/images/tangzu-waner-redlion-official.webp",
    href: "/product/prod-waner-sg2",
  },
  {
    id: "prod-chu3",
    brand: "MOONDROP",
    title: "MOONDROP CHU III",
    description:
      "Next-generation 10mm high-performance composite diaphragm dynamic driver with alloy casting acoustic cavity, brass CNC acoustic nozzle, and pure reference clarity.",
    image: "/images/Headphone-Zone-Moondrop-Chu-III-Homepage-Desktop-Banner-02.webp",
    href: "/product/prod-chu3",
  },
  {
    id: "prod-tanchjim-nora",
    brand: "TANCHJIM",
    title: "TANCHJIM NORA",
    description:
      "Dual-magnetic dynamic driver architecture powered by Tanchjim's patented DMT acoustic cavity, reproducing pristine instrumental separation and transparent vocal clarity.",
    image: "/images/tanchjim-nora-showcase.webp",
    href: "/product/prod-tanchjim-nora",
  },
  {
    id: "prod-kiwi-cadenza",
    brand: "KIWI EARS",
    title: "KIWI EARS CADENZA",
    description:
      "Acclaimed 10mm beryllium-coated dynamic driver housed in an artisan medical-grade 3D printed resin shell, celebrated for punchy bass authority and natural musical timbre.",
    image: "/images/kiwi-ears-cadenza-gallery.webp",
    href: "/product/prod-kiwi-cadenza",
  },
];

const AUTO_SLIDE_DURATION = 5000; // 5 seconds per slide
const PROGRESS_INTERVAL = 50; // 50ms interval

export default function FigmaBestSellers() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<BestSellerProduct[]>(DEFAULT_PRODUCTS);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [cursorDirection, setCursorDirection] = useState<"left" | "right">("right");

  const firstCardRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [cardOffset, setCardOffset] = useState(1210);

  useEffect(() => {
    let isMounted = true;
    async function loadBestSellers() {
      try {
        const { fetchLandingConfigFromDb } = await import("@/lib/landing-config");
        const config = await fetchLandingConfigFromDb();
        if (config?.best_sellers && config.best_sellers.length > 0 && isMounted) {
          setProducts(config.best_sellers);
          return;
        }

        const dbAll = await fetchProductsFromDb();
        if (dbAll && dbAll.length > 0 && isMounted) {
          const targetIds = ["prod-waner-sg2", "prod-chu3", "prod-tanchjim-nora", "prod-kiwi-cadenza"];
          const loaded: BestSellerProduct[] = [];

          for (const tid of targetIds) {
            const found = dbAll.find((p) => p.id === tid);
            const fallbackItem = DEFAULT_PRODUCTS.find((p) => p.id === tid);
            if (found && fallbackItem) {
              loaded.push({
                id: found.id,
                brand: found.brand.toUpperCase(),
                title: cleanProductName(found.name, found.id).toUpperCase(),
                description: found.description || fallbackItem.description,
                image: fallbackItem.image || found.image,
                href: `/product/${found.id}`,
              });
            } else if (fallbackItem) {
              loaded.push(fallbackItem);
            }
          }

          if (loaded.length > 0) {
            setProducts(loaded);
          }
        }
      } catch (err) {
        console.error("Failed to load best sellers:", err);
      }
    }
    loadBestSellers();

    const handleUpdate = () => loadBestSellers();
    window.addEventListener("tonalzone_landing_updated", handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("tonalzone_landing_updated", handleUpdate);
    };
  }, []);

  const updateCardOffset = useCallback(() => {
    if (firstCardRef.current) {
      const width = firstCardRef.current.offsetWidth;
      const gap = window.innerWidth >= 1024 ? 30 : 24;
      if (width > 0) {
        setCardOffset(width + gap);
      }
    }
  }, []);

  useEffect(() => {
    updateCardOffset();
    window.addEventListener("resize", updateCardOffset);
    return () => window.removeEventListener("resize", updateCardOffset);
  }, [updateCardOffset]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : products.length - 1));
  }, [products.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % products.length);
  }, [products.length]);

  // Slide Timer & Circular Progress Bar
  useEffect(() => {
    setProgress(0);
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 100;
        }
        return prev + (PROGRESS_INTERVAL / AUTO_SLIDE_DURATION) * 100;
      });
    }, PROGRESS_INTERVAL);

    return () => clearInterval(timer);
  }, [currentSlide]);

  useEffect(() => {
    if (progress >= 100) {
      nextSlide();
    }
  }, [progress, nextSlide]);

  // Track Mouse Movements & Determine Arrow Direction (Optimized via ref to eliminate re-renders)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${e.clientX - 30}px, ${e.clientY - 30}px, 0)`;
    }

    const cardEl = (e.target as HTMLElement).closest("[data-slide-index]");
    if (cardEl) {
      const slideIdx = parseInt(cardEl.getAttribute("data-slide-index") || "0", 10);
      if (slideIdx < currentSlide) {
        setCursorDirection((prev) => (prev !== "left" ? "left" : prev));
        return;
      } else if (slideIdx > currentSlide) {
        setCursorDirection((prev) => (prev !== "right" ? "right" : prev));
        return;
      }
    }

    if (currentSlide > 0 && e.clientX < 80) {
      setCursorDirection((prev) => (prev !== "left" ? "left" : prev));
      return;
    }

    setCursorDirection((prev) => (prev !== "right" ? "right" : prev));
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsClicking(false);
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("a") || target.closest("button")) {
      return;
    }

    const cardEl = target.closest("[data-slide-index]");
    if (cardEl) {
      const clickedIdx = parseInt(cardEl.getAttribute("data-slide-index") || "0", 10);
      if (clickedIdx < currentSlide) {
        prevSlide();
        return;
      } else if (clickedIdx > currentSlide) {
        nextSlide();
        return;
      }
    }

    if (cursorDirection === "left") {
      prevSlide();
    } else {
      nextSlide();
    }
  };

  // SVG Progress Ring calculations (radius = 26px)
  const ringRadius = 26;
  const circumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <section className="w-full bg-[#030303] py-32 lg:py-40 overflow-hidden select-none">
      {/* Custom Floating Cursor (Visible on Hover) */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-50 transition-opacity duration-150 ease-out ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          transform: "translate3d(-100px, -100px, 0)",
        }}
      >
          <div
            className={`relative w-[60px] h-[60px] flex items-center justify-center transition-transform duration-100 ${
              isClicking ? "scale-90" : "scale-100"
            }`}
          >
            {/* Outer Circular Progress Ring (Thin 1.5px - 2px) */}
            <svg
              className="absolute inset-0 -rotate-90 pointer-events-none"
              width="60"
              height="60"
              viewBox="0 0 60 60"
            >
              {/* Subtle background track ring */}
              <circle
                cx="30"
                cy="30"
                r={ringRadius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth="1.5"
              />
              {/* Dynamic Progress indicator */}
              <circle
                cx="30"
                cy="30"
                r={ringRadius}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-[stroke-dashoffset] duration-75 ease-linear"
              />
            </svg>

            {/* Inner White Circle with Arrow */}
            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
              {/* Arrow Icon with Smooth Direction Flip */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-300 ${
                  cursorDirection === "left" ? "rotate-180" : "rotate-0"
                }`}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

      {/* Section Title: "BEST SELLERS" */}
      <div className="w-full max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 mb-16 lg:mb-20 text-center">
        <h2 className="font-sans font-semibold text-4xl sm:text-5xl text-white tracking-[2px] leading-none uppercase">
          {t("landing.bestSellers")}
        </h2>
      </div>

      {/* Horizontal Sliding Rail Container */}
      <div
        className="w-full overflow-hidden cursor-none"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => setIsClicking(true)}
        onMouseUp={() => setIsClicking(false)}
        onClick={handleTrackClick}
      >
        {/* Sliding Track */}
        <div
          className="flex items-center gap-6 lg:gap-[30px] overflow-visible w-max transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            paddingLeft: "calc(max(0px, (100vw - 1500px) / 2) + clamp(1.5rem, 4vw, 4rem))",
            transform: `translate3d(-${currentSlide * cardOffset}px, 0, 0)`,
          }}
        >
          {products.map((prod, idx) => {
            const isActive = idx === currentSlide;

            // Translate known default descriptions
            let translatedDesc = prod.description;
            if (prod.id === "prod-waner-sg2" || prod.title.includes("WAN'ER")) {
              translatedDesc = t("landing.prodWanerDesc");
            } else if (prod.id === "prod-chu3" || prod.title.includes("CHU III")) {
              translatedDesc = t("landing.prodChu3Desc");
            } else if (prod.id === "prod-tanchjim-nora" || prod.title.includes("NORA")) {
              translatedDesc = t("landing.prodNoraDesc");
            } else if (prod.id === "prod-kiwi-cadenza" || prod.title.includes("CADENZA")) {
              translatedDesc = t("landing.prodCadenzaDesc");
            }

            return (
              <div
                key={prod.id}
                data-slide-index={idx}
                ref={idx === 0 ? firstCardRef : undefined}
                onMouseEnter={() => {
                  if (idx < currentSlide) {
                    setCursorDirection("left");
                  } else {
                    setCursorDirection("right");
                  }
                }}
                className="relative w-[88vw] md:w-[82vw] lg:w-[1180px] h-[520px] sm:h-[600px] lg:h-[671px] bg-[#050505] overflow-hidden group shrink-0"
              >
                {/* Product Banner Image */}
                <Image
                  src={prod.image}
                  alt={prod.title}
                  fill
                  priority={idx < 2}
                  sizes="(max-width: 1024px) 88vw, 1180px"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />

                {/* Dark gradient overlay for text legibility (Visible when active) */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-opacity duration-500 ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />

                {/* Subtle dark tint for preview cards (when not active) */}
                <div
                  className={`absolute inset-0 bg-black/25 transition-opacity duration-500 ${
                    isActive ? "opacity-0 pointer-events-none" : "opacity-100 group-hover:opacity-10"
                  }`}
                />

                {/* Overlaid Typography & Button (Slides in smoothly when active) */}
                <div
                  className={`absolute inset-0 p-8 sm:p-14 flex flex-col justify-end items-start max-w-xl transition-all duration-700 ${
                    isActive
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 translate-y-6 pointer-events-none"
                  }`}
                >
                  {/* Heading */}
                  <h3 className="font-sans font-bold text-4xl sm:text-5xl text-white tracking-[2px] leading-none mb-4 uppercase">
                    {prod.title}
                  </h3>

                  {/* Description */}
                  <p className="font-sans font-normal text-sm sm:text-base leading-[33px] text-white/90 mb-8 max-w-md line-clamp-3">
                    {translatedDesc}
                  </p>

                  {/* Button: "SHOP NOW" */}
                  <Link
                    href={prod.href}
                    onClick={(e) => e.stopPropagation()}
                    className="relative inline-flex items-center h-[46px] group/btn cursor-pointer select-none"
                  >
                    <div className="relative flex items-center h-[44px] w-[190px]">
                      {/* Underlying White Pill */}
                      <div className="absolute right-0 top-0 bottom-0 left-[52px] bg-white rounded-full shadow-md flex items-center justify-center transition-opacity duration-300 group-hover/btn:opacity-0 pointer-events-none">
                        <span className="font-sans font-bold text-[12px] tracking-[2px] text-black uppercase whitespace-nowrap px-3">
                          {t("landing.shopNow")}
                        </span>
                      </div>

                      {/* Green Element: Circle on left that expands to full width */}
                      <div className="absolute left-0 top-0 bottom-0 w-[44px] group-hover/btn:w-full rounded-full bg-[#BFDD25] shadow-lg flex items-center transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-hidden z-10">
                        {/* Idle Left Chevron */}
                        <div className="w-[44px] h-full flex items-center justify-center shrink-0 transition-opacity duration-300 group-hover/btn:opacity-0">
                          <svg
                            width="9"
                            height="15"
                            viewBox="0 0 9 15"
                            fill="none"
                            className="text-black stroke-[3]"
                          >
                            <path
                              d="M1.5 1.5L7.5 7.5L1.5 13.5"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>

                        {/* Expanded Content on Hover */}
                        <div className="absolute inset-0 flex items-center justify-between px-5 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-400 delay-100">
                          <span className="font-sans font-extrabold text-[12px] tracking-[2px] text-black uppercase whitespace-nowrap">
                            {t("landing.shopNow")}
                          </span>
                          <svg
                            width="10"
                            height="16"
                            viewBox="0 0 10 16"
                            fill="none"
                            className="text-black stroke-[3] shrink-0"
                          >
                            <path
                              d="M2 2L8 8L2 14"
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
            );
          })}
        </div>
      </div>

      {/* Slide Indicators (Centered Below the Slider) */}
      <div className="flex items-center justify-center gap-2.5 mt-8 lg:mt-12">
        {products.map((p, pIdx) => (
          <button
            key={p.id}
            onClick={() => {
              setCurrentSlide(pIdx);
              setProgress(0);
            }}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              currentSlide === pIdx
                ? "w-8 h-2 bg-white"
                : "w-2 h-2 bg-white/30 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${pIdx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
