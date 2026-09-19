"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CatalogProduct } from "@/lib/products-db";
import { useLocation } from "@/context/LocationContext";
import { KeyboardArrowRight } from "@/components/ui/keyboard-arrow";

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products?: CatalogProduct[];
}

const DEFAULT_QUICK_LINKS = [
  { label: "Explore All In-Ear Monitors", href: "/collection", category: "Katalog" },
  { label: "Interactive Frequency Graph", href: "/graph", category: "Tools" },
  { label: "Moondrop Blessing 3 Hybrid", href: "/product/prod-blessing-3", category: "IEM" },
  { label: "Tangzu Wan'er Studio Edition", href: "/product/prod-waner-se", category: "IEM" },
  { label: "Sennheiser HD 560S Reference", href: "/product/prod-hd560s", category: "Headphone" },
  { label: "FiiO BTR7 Balanced DAC/AMP", href: "/product/prod-fiio-btr7", category: "DAC/AMP" },
  { label: "Customer Support & Warranty", href: "/support", category: "Bantuan" },
];

const POPULAR_SEARCHES = [
  "In-Ear Monitors",
  "Planar Magnetic IEM",
  "Balanced DAC Amp",
  "Kabel 4.4mm Pentaconn",
  "TWS Active Noise Canceling",
  "Open-Back Studio Headphones",
];

const SEARCH_CATEGORIES = [
  "IN-EAR MONITORS",
  "TWS",
  "HEADPHONE",
  "DAC/AMP",
  "ACCESSORIES",
  "FLAGSHIP MODELS",
];

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) {
    return <span>{text}</span>;
  }
  const cleanQ = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${cleanQ})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, idx) =>
        regex.test(part) ? (
          <span key={idx} className="font-bold text-white">
            {part}
          </span>
        ) : (
          <span key={idx} className="text-[#a1a1a6]">
            {part}
          </span>
        )
      )}
    </span>
  );
}

export default function SearchDrawer({ isOpen, onClose, products = [] }: SearchDrawerProps) {
  const router = useRouter();
  const { formatPrice } = useLocation();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const catalog = products;

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
    }
  }, [isOpen]);

  // Keyboard navigation & ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectSearch = (searchText: string) => {
    onClose();
    router.push(`/search?q=${encodeURIComponent(searchText)}`);
  };

  // Search Results
  const searchResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      return {
        matchedProducts: [],
        suggestedLinks: DEFAULT_QUICK_LINKS,
        suggestedSearches: POPULAR_SEARCHES,
      };
    }

    const matches = catalog.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.soundSignature && p.soundSignature.toLowerCase().includes(q))
      );
    });

    const links = matches.slice(0, 4).map((p) => ({
      label: p.name,
      href: `/product/${p.id}`,
      category: p.brand || p.category,
    }));

    // Generate dynamic search keywords matching Apple suggestion style
    const searches = [
      `${query} in-ear monitor`,
      `${query} DAC / AMP`,
      `${query} balanced cable`,
      `${query} frequency graph`,
      `${query} upgrade cable`,
    ];

    return {
      matchedProducts: matches.slice(0, 4),
      suggestedLinks: links,
      suggestedSearches: searches,
    };
  }, [query, catalog]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* 1. Backdrop Overlay with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* 2. Apple-Style Right Sidebar Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="relative w-full max-w-[480px] h-full bg-[#030303] border-l border-[#1c1c1c] text-white flex flex-col z-[101] shadow-[-20px_0_60px_rgba(0,0,0,0.9)] overflow-hidden"
          >
            {/* Top Close Bar */}
            <div className="pt-6 px-6 sm:px-8 flex items-center justify-end">
              <button
                type="button"
                onClick={onClose}
                className="p-2 -mr-2 text-[#86868b] hover:text-white transition-colors cursor-pointer rounded-full hover:bg-[#080808]"
                aria-label="Tutup pencarian"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Apple-Style Prominent Search Input */}
            <div className="px-6 sm:px-8 pt-2 pb-5 border-b border-[#1c1c1c]">
              <form onSubmit={handleSubmit} className="flex items-center gap-3.5">
                {/* Search Glass Icon */}
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#86868b] shrink-0"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>

                {/* Big Input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari..."
                  className="w-full bg-transparent text-2xl sm:text-[28px] font-semibold text-white placeholder-[#444] outline-none tracking-tight leading-tight"
                />

                {/* Apple-Style Clear (X) Button */}
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      inputRef.current?.focus();
                    }}
                    className="text-[#86868b] hover:text-white transition-colors cursor-pointer p-1 shrink-0"
                    aria-label="Hapus kata kunci"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" className="text-[#333] hover:text-[#444]" />
                      <path
                        d="M15 9l-6 6M9 9l6 6"
                        stroke="#030303"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
              </form>
            </div>

            {/* Scrollable Content: Suggestions & Links */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-7 custom-scrollbar">
              {/* Section 1: Suggested Links */}
              <div>
                <span className="text-xs font-normal text-[#86868b] tracking-normal mb-3 block">
                  {query.trim() ? "Suggested Links" : "Quick Links"}
                </span>

                {searchResults.suggestedLinks.length > 0 ? (
                  <div className="space-y-0.5">
                    {searchResults.suggestedLinks.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center gap-3 py-2 px-2 -mx-2 hover:bg-[#080808] rounded-lg text-[15px] font-normal transition-colors group cursor-pointer"
                      >
                        <KeyboardArrowRight className="w-3.5 h-3.5 stroke-[2.5] text-[#86868b] group-hover:text-white transition-colors shrink-0" />
                        <div className="flex-1 truncate">
                          <HighlightMatch text={item.label} query={query} />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#666] py-1">Tidak ada tautan langsung yang cocok.</p>
                )}
              </div>

              {/* Section 2: Suggested Searches */}
              <div>
                <span className="text-xs font-normal text-[#86868b] tracking-normal mb-3 block">
                  {query.trim() ? "Suggested Searches" : "Pencarian Populer"}
                </span>

                <div className="space-y-0.5">
                  {searchResults.suggestedSearches.map((sText, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSearch(sText)}
                      className="w-full flex items-center gap-3 py-2 px-2 -mx-2 hover:bg-[#080808] rounded-lg text-[15px] font-normal transition-colors group cursor-pointer text-left"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-[#86868b] group-hover:text-white transition-colors shrink-0"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <div className="flex-1 truncate">
                        <HighlightMatch text={sText} query={query} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 3: Live Matched Products (When Query exists) */}
              {query.trim() && searchResults.matchedProducts.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-normal text-[#86868b]">
                      Hasil Produk ({searchResults.matchedProducts.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectSearch(query)}
                      className="text-xs text-[#BFDD25] hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Lihat semua hasil</span>
                      <KeyboardArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {searchResults.matchedProducts.map((prod) => (
                      <Link
                        key={prod.id}
                        href={`/product/${prod.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 rounded-xl bg-[#050505] border border-[#1c1c1c] hover:border-[#333] hover:bg-[#080808] transition-all group cursor-pointer"
                      >
                        <div className="relative w-12 h-12 rounded-lg bg-[#080808] border border-[#1c1c1c] overflow-hidden shrink-0">
                          <Image
                            src={prod.image || prod.images[0]}
                            alt={prod.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-medium text-white group-hover:text-[#BFDD25] transition-colors truncate">
                            {prod.name}
                          </h4>
                          <span className="text-[11px] font-mono text-[#86868b] block mt-0.5">
                            {prod.brand} • {formatPrice(prod.price)}
                          </span>
                        </div>
                        <KeyboardArrowRight className="w-3.5 h-3.5 stroke-[2.5] text-[#555] group-hover:text-white transition-colors shrink-0 pr-0.5" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* When Query is Empty: Quick Categories */}
              {!query.trim() && (
                <div>
                  <span className="text-xs font-normal text-[#86868b] tracking-normal mb-3 block">
                    Kategori Populer
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {SEARCH_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          onClose();
                          router.push(`/collection?category=${encodeURIComponent(cat)}`);
                        }}
                        className="px-3 py-1.5 bg-[#050505] hover:bg-[#080808] border border-[#1c1c1c] hover:border-[#333] rounded-full text-xs font-mono text-[#a1a1a6] hover:text-white transition-colors cursor-pointer"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer CTA */}
            {query.trim() && (
              <div className="p-4 px-6 sm:px-8 border-t border-[#1c1c1c] bg-[#030303]">
                <button
                  type="button"
                  onClick={() => handleSelectSearch(query)}
                  className="w-full py-3 bg-[#050505] hover:bg-[#080808] border border-[#1c1c1c] hover:border-[#333] text-white rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Tekan Enter atau klik untuk cari</span>
                  <span className="text-[#BFDD25] font-semibold">&ldquo;{query}&rdquo;</span>
                  <KeyboardArrowRight className="w-4 h-4 stroke-[2.5] text-[#BFDD25] group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
