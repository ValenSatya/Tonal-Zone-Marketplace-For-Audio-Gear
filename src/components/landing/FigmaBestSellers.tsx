"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface BestSellerProduct {
  id: string;
  brand: string;
  title: string;
  description: string;
  image: string;
  href: string;
}

const PRODUCTS: BestSellerProduct[] = [
  {
    id: "sennheiser-main",
    brand: "SENNHEISER",
    title: "SENNHEISER",
    description:
      "Lorem ipsum tellus aliquam sagittis orci a viverra enim mattis dolor mattis egestas ornare lectus ac eget hendrerit et nullam.",
    image: "/figma/sennheiser-main.png",
    href: "/collection",
  },
  {
    id: "sennheiser-sec",
    brand: "SENNHEISER",
    title: "SENNHEISER MOMENTUM 4",
    description:
      "Signature Sennheiser audiophile transducer system with adaptive noise cancellation, crystal-clear calls, and up to 60-hour battery life.",
    image: "/figma/sennheiser-sec.png",
    href: "/collection",
  },
  {
    id: "blessing-3",
    brand: "MOONDROP",
    title: "MOONDROP BLESSING 3",
    description:
      "Dual dynamic drivers and four balanced armatures engineered for reference acoustic neutrality and expansive spatial imaging.",
    image: "/figma/hero-bg.png",
    href: "/product/prod-blessing-3",
  },
  {
    id: "dusk",
    brand: "CRINACLE",
    title: "MOONDROP DUSK",
    description:
      "Groundbreaking collaboration crossover featuring dual dynamic, dual balanced armature, and dual planar magnetic drivers.",
    image: "/figma/dusk-blueprint.png",
    href: "/product/prod-blessing-3",
  },
];

const AUTO_SLIDE_DURATION = 5000; // 5 seconds per slide
const PROGRESS_INTERVAL = 50; // 50ms interval

export default function FigmaBestSellers() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [cursorDirection, setCursorDirection] = useState<"left" | "right">("right");

  const firstCardRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [cardOffset, setCardOffset] = useState(1210);

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
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : PRODUCTS.length - 1));
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % PRODUCTS.length);
  }, []);

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
    <section className="w-full bg-[#090808] py-32 lg:py-40 overflow-hidden select-none">
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
      <div className="w-full max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 mb-16 lg:mb-20 text-center">
        <h2 className="font-sans font-semibold text-4xl sm:text-5xl text-white tracking-[2px] leading-none uppercase">
          BEST SELLERS
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
          {PRODUCTS.map((prod, idx) => {
            const isActive = idx === currentSlide;

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
                className="relative w-[88vw] md:w-[82vw] lg:w-[1180px] h-[520px] sm:h-[600px] lg:h-[671px] bg-[#161616] overflow-hidden group shrink-0"
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
                    {prod.description}
                  </p>

                  {/* Button: "SHOP NOW" */}
                  <Link
                    href={prod.href}
                    onClick={(e) => e.stopPropagation()}
                    className="w-[176px] h-[50px] bg-[#d9d9d9] hover:bg-[#D4FF00] hover:text-black transition-colors flex items-center justify-center shadow-md cursor-pointer group/btn"
                  >
                    <span className="font-sans font-bold text-[12px] leading-[13px] tracking-[2.2px] text-[#131313] uppercase">
                      SHOP NOW
                    </span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide Indicators (Centered Below the Slider) */}
      <div className="flex items-center justify-center gap-2.5 mt-8 lg:mt-12">
        {PRODUCTS.map((p, pIdx) => (
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
