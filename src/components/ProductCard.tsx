"use client";

import React from "react";
import Link from "next/link";
import { useLocation } from "@/context/LocationContext";
import { CatalogProduct, computeDynamicProductBadge } from "@/lib/products-db";

interface ProductCardProps {
  product: CatalogProduct;
  badgeText?: string;
  className?: string;
}

function formatProductTitle(title: string): string {
  if (!title) return "";
  const preserveUpper = new Set([
    "IEM", "TWS", "DAC", "AMP", "CNC", "SE", "BAL", "USB", "DSP", "PRO", "MK2", "MKII", "MK3", "MKIII",
    "IER-M9", "IER-Z1R", "IE900", "IE600", "IE200", "HD800S", "HD600", "HD650", "KA13", "KA17", "FH9", "FD7", "FA9",
    "EA500", "EA1000", "EM6L", "EW200", "LM", "OG", "LE", "MAX", "ULTRA", "PLUS", "II", "III", "IV", "V"
  ]);

  return title
    .split(" ")
    .map((word) => {
      const upper = word.toUpperCase();
      if (preserveUpper.has(upper) || /\d/.test(word) || upper.includes("-")) {
        return upper;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export default function ProductCard({
  product,
  badgeText,
  className = "",
}: ProductCardProps) {
  const { formatPrice } = useLocation();

  // Dynamically compute truthful product tag: NEW ARRIVAL, BEST SELLER, TOP RATED.
  // A product with 0 reviews will NEVER falsely display TOP RATED.
  const dynamicTag = computeDynamicProductBadge({
    rawBadge: badgeText || product.badge,
    rating: product.rating,
    reviews: product.reviews,
  });
  const displayBadge = dynamicTag ? (dynamicTag.toUpperCase() as "NEW ARRIVAL" | "BEST SELLER" | "TOP RATED") : undefined;

  const isOutOfStock =
    Number(product.stock) <= 0 ||
    product.stock === 0 ||
    product.inStock === false ||
    String(product.inStock) === "false" ||
    (product as any).status === "OUT_OF_STOCK";

  const formattedTitle = formatProductTitle(product.name);

  return (
    <Link
      href={`/product/${product.id}`}
      prefetch={false}
      className={`group cursor-pointer block flex flex-col h-full transition-all duration-300 ${
        isOutOfStock ? "opacity-60 hover:opacity-85" : "opacity-100"
      } ${className}`}
    >
      {/* 1. Image Container with 16px Rounded Corners (Zero Borders) */}
      <div className={`aspect-square rounded-2xl relative overflow-hidden flex items-center justify-center transition-colors duration-300 shadow-sm ${
        isOutOfStock ? "bg-[#181818] grayscale-[60%]" : "bg-[#F4F4F6] group-hover:bg-[#EAEAEA]"
      }`}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
            isOutOfStock ? "opacity-50" : ""
          }`}
        />

        {/* Top-Right Tag Badge (Rounded-Full Pill, Zero Border) - only shown when item is in stock */}
        {!isOutOfStock && displayBadge && (
          <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 bg-[#181818] px-3 py-1 text-[9px] sm:text-[10px] font-sans font-bold text-white rounded-full z-10 uppercase tracking-wider shadow-md leading-none">
            {displayBadge}
          </div>
        )}

        {/* Out of Stock Subtle Overlay Pill */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-10 p-2">
            <span className="px-3.5 py-1.5 rounded-full bg-[#121212] border border-white/20 text-[9px] sm:text-[10px] font-sans font-bold text-zinc-300 tracking-widest uppercase shadow-2xl leading-none">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* 2. Crystal-Clear Visual Hierarchy & Title Case */}
      <div className="flex flex-col mt-2.5 sm:mt-3 gap-0.5 sm:gap-1 w-full flex-1">
        {/* Tier 1: Store / Brand Name & Multi-Seller Pill */}
        <div className="flex items-center justify-between gap-1 w-full min-h-[16px]">
          <span className="text-[9px] sm:text-[11px] font-mono text-[#7A7A80] group-hover:text-[#A0A0A5] uppercase tracking-wider block truncate transition-colors">
            {product.storeName || product.brand || "Official Store"}
          </span>
          {product.sellerOffers && product.sellerOffers.length > 1 && (
            <span className="text-[8px] sm:text-[9px] font-mono text-zinc-400 bg-white/10 px-1.5 py-0.5 rounded-full shrink-0 tracking-tight leading-none">
              {product.sellerOffers.length} Pilihan Toko
            </span>
          )}
        </div>

        {/* Tier 2: Product Title (Soft Silver/Platinum - Non-Glaring) */}
        <h3 className={`font-sans text-xs sm:text-[15px] font-medium transition-colors line-clamp-2 sm:line-clamp-1 leading-snug ${
          isOutOfStock ? "text-[#71717A]" : "text-[#D1D1D6] group-hover:text-[#F2F2F7]"
        }`}>
          {formattedTitle}
        </h3>

        {/* Tier 3: Price on Bottom-Left & Warm Gold Review on Bottom-Right */}
        <div className="flex items-baseline justify-between gap-1.5 sm:gap-2 mt-auto pt-1 sm:pt-1.5">
          {/* Price */}
          <span className={`font-sans text-xs sm:text-base md:text-lg font-bold tracking-wide ${
            isOutOfStock ? "text-[#52525B]" : "text-[#EDEDED]"
          }`}>
            {formatPrice(product.price)}
          </span>

          {/* Review at Bottom Right (Warm Gold #fbbf24) */}
          <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-mono text-[#7A7A80] shrink-0">
            <span className="text-[#fbbf24]">★</span>
            {product.reviews && product.reviews > 0 ? (
              <>
                <span className="font-medium text-[#C7C7CC]">{(product.rating || 0).toFixed(1)}</span>
                <span className="hidden sm:inline text-[#555555]">({product.reviews})</span>
              </>
            ) : (
              <span className="text-[#555555]">(0)</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
