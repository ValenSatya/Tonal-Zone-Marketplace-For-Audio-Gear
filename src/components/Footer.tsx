"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const COLUMNS = [
  {
    title: "HOME",
    links: [
      { label: "Best Sellers", href: "/#bestseller" },
      { label: "Collaborations", href: "/#collab" },
      { label: "New Arrivals", href: "/#new-arrival" },
    ],
  },
  {
    title: "COLLECTION",
    links: [
      { label: "All Products", href: "/collection" },
      { label: "In-Ear Monitors", href: "/collection" },
      { label: "DAC / Amplifiers", href: "/collection" },
      { label: "Accessories", href: "/collection" },
    ],
  },
  {
    title: "GRAPH",
    links: [
      { label: "How To Read Graph", href: "/graph" },
      { label: "IEM Signature", href: "/graph" },
      { label: "Find Your Signature", href: "/graph" },
      { label: "Try Squiglink", href: "/graph" },
    ],
  },
  {
    title: "SUPPORT",
    links: [
      { label: "Audiophile Chat", href: "#" },
      { label: "Warranty Claim", href: "#" },
      { label: "Track Order", href: "#" },
      { label: "Knowledge Base", href: "#" },
    ],
  },
];

const BRAND_LETTERS = [
  { char: "T", color: "text-[#2a2a2a] hover:text-[#333] transition-colors duration-500" },
  { char: "O", color: "text-[#2a2a2a] hover:text-[#333] transition-colors duration-500" },
  { char: "N", color: "text-[#2a2a2a] hover:text-[#333] transition-colors duration-500" },
  { char: "A", color: "text-[#2a2a2a] hover:text-[#333] transition-colors duration-500" },
  { char: "L", color: "text-[#2a2a2a] hover:text-[#333] transition-colors duration-500" },
];

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-[#0e0e0e] text-[#FAF9F6] border-t border-[#1c1c1c] pt-12 md:pt-20 pb-8 md:pb-12 overflow-hidden selection:bg-[#D4FF00] selection:text-[#0e0e0e] relative z-10">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        
        {/* TOP 4 COLUMNS WITH GIGA-STYLE ANGLED CHAMFER BORDERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 md:pb-24 border-b border-[#1c1c1c]">
          {COLUMNS.map((col, idx) => (
            <div key={idx} className="flex flex-col">
              {/* Angled Chamfer Top Border */}
              <div className="relative pt-4 mb-6">
                {/* Horizontal border line */}
                <div className="absolute top-0 left-0 right-4 h-[1px] bg-[#2a2a2a]" />
                {/* Diagonal 45-degree chamfer notch on right end */}
                <div className="absolute top-0 right-1 w-4 h-[1px] bg-[#2a2a2a] origin-top-left rotate-45" />
                
                <span className="font-mono text-[11px] uppercase tracking-[0.25em] font-bold text-[#FAF9F6]/90 block">
                  {col.title}
                </span>
              </div>

              {/* Links */}
              <div className="flex flex-col gap-3.5">
                {col.links.map((link, lIdx) => (
                  <Link
                    key={lIdx}
                    href={link.href}
                    className="text-xs sm:text-[13px] font-sans text-[#FAF9F6]/60 hover:text-[#D4FF00] hover:translate-x-1 transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* MIDDLE INFO & SOCIAL ICONS */}
        <div className="py-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 text-xs font-mono text-[#FAF9F6]/50 uppercase tracking-widest border-b border-[#1c1c1c]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
            <span className="text-[#FAF9F6]">AUDIOPHILE REFERENCE MARKETPLACE</span>
            <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#1c1c1c]"></span>
            <div className="flex items-center gap-4">
              <a href="mailto:hello@tonalzone.com" className="hover:text-white transition-colors">hello@tonalzone.com</a>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1c1c1c]"></span>
              <a href="tel:+6281234567890" className="hover:text-white transition-colors">+62 812-3456-7890</a>
            </div>
          </div>

          <div className="flex items-center gap-6 text-[#FAF9F6]/80">
            <Link href="#" className="hover:text-[#D4FF00] transition-colors flex items-center gap-1.5">
              <span>LN</span>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5V13.2a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2v-8.37H6.46M7.83 6.67a1.64 1.64 0 0 0-1.65 1.65 1.65 1.65 0 0 0 1.65 1.65 1.65 1.65 0 0 0 1.65-1.65 1.65 1.65 0 0 0-1.65-1.65Z"/>
              </svg>
            </Link>
            <Link href="#" className="hover:text-[#D4FF00] transition-colors flex items-center gap-1.5">
              <span>X</span>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </Link>
            <Link href="#" className="hover:text-[#D4FF00] transition-colors flex items-center gap-1.5">
              <span>TG</span>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.68 3.25a1.2 1.2 0 0 0-1.19-.21L2.5 9.77a1.2 1.2 0 0 0-.12 2.27l4.78 1.83 1.8 5.67a1.2 1.2 0 0 0 1.8.69l2.76-2.25 5.76 4.25c.66.49 1.6.01 1.74-.78l3.15-16.96a1.2 1.2 0 0 0-.49-1.24zM8.38 13.31l9.92-6.28-7.75 6.98-.37 3.96-1.8-5.66z"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* BOTTOM GIANT BRAND TITLE */}
        <div className="pt-12 pb-6 relative select-none">
          {/* Giant Wordmark Container */}
          <div
            className="relative z-10 w-full flex justify-between items-center font-heading text-[18vw] sm:text-[17vw] leading-[0.75] font-bold tracking-tighter overflow-visible py-4"
          >
            {BRAND_LETTERS.map((item, index) => {
              return (
                <div
                  key={index}
                  className={`relative ${item.color}`}
                >
                  {/* Main Character */}
                  <span className="block select-none">{item.char}</span>
                </div>
              );
            })}
          </div>
          
          {/* Standard Copyright Bar */}
          <div className="mt-12 pt-6 border-t border-[#1c1c1c] flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-sans text-[#FAF9F6]/40">
            <p>© {new Date().getFullYear()} Tonal Zone Inc. {t("nav.allRightsReserved") || "All rights reserved."}</p>
            <div className="flex items-center gap-6">
              <Link href="#" className="hover:text-[#FAF9F6] transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-[#FAF9F6] transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-[#FAF9F6] transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
