"use client";

import React from "react";
import Link from "next/link";
import { useLocation } from "@/context/LocationContext";
import { CatalogProduct } from "@/lib/products-db";

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

  const displayBadge =
    badgeText ||
    (product.category === "IN-EAR MONITORS"
      ? "[ 2-PIN 0.78MM ]"
      : `[ ${product.brand} ]`);

  const formattedTitle = formatProductTitle(product.name);

  return (
    <Link
      href={`/product/${product.id}`}
      className={`group cursor-pointer block flex flex-col h-full ${className}`}
    >
      {/* 1. Square Image Container with Dark Industrial Border */}
      <div className="aspect-square border border-[#1c1c1c] group-hover:border-[#444444] bg-[#0c0c0c] relative overflow-hidden flex items-center justify-center transition-colors duration-300">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Top-Right Badge */}
        <div className="absolute top-3 right-3 bg-black/90 px-2.5 py-1 text-[10px] font-mono text-[#777777] border border-[#222222] z-10 uppercase tracking-wider group-hover:border-[#444444] group-hover:text-white transition-colors">
          {displayBadge}
        </div>
      </div>

      {/* 2. Crystal-Clear Visual Hierarchy & Title Case */}
      <div className="flex flex-col mt-3 gap-1 w-full flex-1">
        {/* Tier 1: Store / Brand Name */}
        <span className="text-[11px] font-mono text-[#7A7A80] group-hover:text-[#A0A0A5] uppercase tracking-wider block truncate transition-colors">
          {product.storeName || product.brand || "Official Store"}
        </span>

        {/* Tier 2: Product Title (Soft Silver/Platinum - Non-Glaring) */}
        <h3 className="font-sans text-[15px] font-medium text-[#D1D1D6] group-hover:text-[#F2F2F7] transition-colors line-clamp-1 leading-snug">
          {formattedTitle}
        </h3>

        {/* Tier 3: Price on Bottom-Left (Soft Ivory) & Review on Bottom-Right */}
        <div className="flex items-baseline justify-between gap-2 mt-auto pt-1.5">
          {/* Price */}
          <span className="font-sans text-base md:text-lg font-bold text-[#EDEDED] tracking-wide">
            {formatPrice(product.price)}
          </span>

          {/* Review at Bottom Right */}
          <div className="flex items-center gap-1 text-xs font-mono text-[#7A7A80] shrink-0">
            <span className="text-[#D4FF00]">★</span>
            <span className="font-medium text-[#C7C7CC]">{product.rating || 4.9}</span>
            <span className="text-[#555555]">({product.reviews || 124})</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
