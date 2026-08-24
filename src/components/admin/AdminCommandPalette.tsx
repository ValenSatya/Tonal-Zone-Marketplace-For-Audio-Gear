"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminData } from "@/context/AdminDataContext";
import { useLanguage } from "@/context/LanguageContext";

interface SearchItem {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  path: string;
  badge?: string;
  badgeColor?: string;
  keywords: string[];
}

export interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminCommandPalette({ isOpen, onClose }: AdminCommandPaletteProps) {
  const router = useRouter();
  const { stores, brands, products, couriers, categories } = useAdminData();
  const { language } = useLanguage();
  const isEn = language === "English";

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build comprehensive search index
  const searchIndex: SearchItem[] = useMemo(() => {
    const items: SearchItem[] = [
      // Main Menus
      {
        id: "nav-overview",
        category: isEn ? "Navigation" : "Menu Utama",
        title: isEn ? "System Overview & Telemetry" : "Ringkasan Sistem & Telemetri",
        subtitle: isEn ? "GMV, active stores, live system metrics" : "GMV, toko aktif, antrean moderasi",
        path: "/admin",
        badge: "Overview",
        badgeColor: "bg-[#181818] text-[#D4D4D8] border border-[#2E2E2E]",
        keywords: ["overview", "ringkasan", "dashboard", "home", "metrics", "telemetry", "gmv", "omzet", "penjualan"],
      },
      {
        id: "nav-sellers",
        category: isEn ? "Approvals & Moderation" : "Persetujuan & Moderasi",
        title: isEn ? "Store & Seller Verification" : "Verifikasi Toko & Penjual",
        subtitle: isEn ? "Review seller verification, documents, identity" : "Verifikasi identitas merchant, toko baru, dokumen",
        path: "/admin/approvals/sellers",
        badge: isEn ? "Sellers" : "Toko",
        badgeColor: "bg-[#181818] text-[#D4D4D8] border border-[#2E2E2E]",
        keywords: ["sellers", "toko", "penjual", "kyc", "verifikasi", "approval", "merchant", "store", "identitas"],
      },
      {
        id: "nav-brands",
        category: isEn ? "Approvals & Moderation" : "Persetujuan & Moderasi",
        title: isEn ? "Brand Distributor Approvals" : "Persetujuan Brand & Distributor",
        subtitle: isEn ? "Authorize audio brands & official distributors" : "Katalog merek resmi & distributor audio",
        path: "/admin/approvals/brands",
        badge: isEn ? "Brands" : "Merek",
        badgeColor: "bg-[#181818] text-[#D4D4D8] border border-[#2E2E2E]",
        keywords: ["brand", "merek", "distributor", "authorization", "katalog", "resmi", "sennheiser", "moondrop", "64 audio"],
      },
      {
        id: "nav-products",
        category: isEn ? "Approvals & Moderation" : "Persetujuan & Moderasi",
        title: isEn ? "Product Approvals & Acoustic QC" : "Persetujuan & Kualitas Produk IEM",
        subtitle: isEn ? "Inspect IEM target curves, driver specs, price" : "Periksa kurva frekuensi, driver, dan harga IEM",
        path: "/admin/approvals/products",
        badge: isEn ? "Products" : "Produk",
        badgeColor: "bg-[#181818] text-[#D4D4D8] border border-[#2E2E2E]",
        keywords: ["product", "produk", "iem", "qc", "curve", "frekuensi", "tuning", "driver", "kurva", "earphone"],
      },
      {
        id: "nav-banners",
        category: isEn ? "Visuals & Promos" : "Tampilan & Promosi",
        title: isEn ? "Hero Banners & Promotions CMS" : "Banner & Promo CMS",
        subtitle: isEn ? "Configure carousel hero, strip promo, popup" : "Atur slider hero utama, strip promo, dan popup",
        path: "/admin/banners",
        badge: "CMS",
        badgeColor: "bg-[#181818] text-[#D4D4D8] border border-[#2E2E2E]",
        keywords: ["banner", "promo", "hero", "cms", "iklan", "promosi", "slider", "carousel", "tampilan"],
      },
      {
        id: "nav-tracking",
        category: isEn ? "Logistics & Fleets" : "Pengiriman & Ekspedisi",
        title: isEn ? "Shipment & Waybill Tracking" : "Lacak Pengiriman & Resi",
        subtitle: isEn ? "Live courier parcel milestones & 2x24h trial inspection" : "Status paket ekspedisi, resi, dan masa uji coba 2x24 jam",
        path: "/admin/logistics/tracking",
        badge: isEn ? "Tracking" : "Lacak",
        badgeColor: "bg-[#181818] text-[#D4D4D8] border border-[#2E2E2E]",
        keywords: ["tracking", "lacak", "resi", "waybill", "pengiriman", "logistics", "kurir", "paket", "sla", "transit"],
      },
      {
        id: "nav-couriers",
        category: isEn ? "Logistics & Fleets" : "Pengiriman & Ekspedisi",
        title: isEn ? "Courier Partners & Freight Rates" : "Daftar Ekspedisi & Ongkir",
        subtitle: isEn ? "Manage fleet partners, base rate per kg, cargo insurance" : "Kelola partner kurir, tarif ongkir per kg, asuransi kargo",
        path: "/admin/logistics/couriers",
        badge: isEn ? "Couriers" : "Ekspedisi",
        badgeColor: "bg-[#181818] text-[#D4D4D8] border border-[#2E2E2E]",
        keywords: ["couriers", "ekspedisi", "ongkir", "tarif", "jne", "jnt", "sicepat", "dhl", "fedex", "armada"],
      },
      {
        id: "nav-transactions",
        category: isEn ? "Finance & Ledger" : "Keuangan & Rekber",
        title: isEn ? "Buyer Protection & Settlement (Rekber)" : "Rekening Bersama (Rekber) & Sengketa",
        subtitle: isEn ? "Escrow vaults, seller payouts, refunds, dispute arbitration" : "Rekening bersama, pencairan dana seller, refund, arbitrase komplain",
        path: "/admin/transactions",
        badge: "Escrow",
        badgeColor: "bg-[#181818] text-[#D4D4D8] border border-[#2E2E2E]",
        keywords: ["transactions", "transaksi", "rekber", "escrow", "rekening bersama", "saldo", "settlement", "refund", "dispute", "sengketa", "komplain"],
      },
      {
        id: "nav-users",
        category: isEn ? "Registry & Accounts" : "Pengguna & Akun",
        title: isEn ? "Marketplace User Directory" : "Daftar Pengguna Marketplace",
        subtitle: isEn ? "Buyer & seller accounts, CSV import/export, role manager" : "Database akun pembeli, penjual, import/export CSV, role",
        path: "/admin/users",
        badge: isEn ? "Users" : "Pengguna",
        badgeColor: "bg-[#181818] text-[#D4D4D8] border border-[#2E2E2E]",
        keywords: ["users", "pengguna", "akun", "user", "buyer", "seller", "admin", "csv", "import", "database"],
      },
      {
        id: "nav-catalog-config",
        category: isEn ? "System Config" : "Konfigurasi Sistem",
        title: isEn ? "Product Categories & Taxonomy" : "Kategori Produk & Taksonomi",
        subtitle: isEn ? "Manage category tree, URL slugs, SEO metadata" : "Atur kategori produk audio, slug URL, metadata",
        path: "/admin/config/catalog",
        badge: isEn ? "Taxonomy" : "Kategori",
        badgeColor: "bg-[#181818] text-[#D4D4D8] border border-[#2E2E2E]",
        keywords: ["category", "kategori", "taksonomi", "taxonomy", "slug", "tag", "dac", "planar", "tws"],
      },
      {
        id: "nav-storefront",
        category: isEn ? "External" : "Toko Publik",
        title: isEn ? "Go to Public Storefront" : "Buka Halaman Toko Marketplace",
        subtitle: isEn ? "View customer-facing homepage & catalog" : "Lihat antarmuka pembeli & katalog belanja publik",
        path: "/",
        badge: isEn ? "Storefront" : "Toko",
        badgeColor: "bg-[#181818] text-[#D4D4D8] border border-[#2E2E2E]",
        keywords: ["storefront", "toko", "home", "homepage", "pembeli", "koleksi", "marketplace"],
      },
    ];

    // Append dynamic data from live stores
    stores.forEach((store) => {
      items.push({
        id: `store-${store.id}`,
        category: isEn ? "Merchant Stores" : "Toko Terdaftar",
        title: store.storeName,
        subtitle: `${store.ownerName} • ${store.brandFocus} • ${store.status}`,
        path: "/admin/approvals/sellers",
        badge: store.status,
        badgeColor: "bg-[#181818] text-[#D4D4D8] border border-[#2E2E2E]",
        keywords: ["toko", "store", store.storeName.toLowerCase(), store.ownerName.toLowerCase(), store.brandFocus.toLowerCase(), store.email.toLowerCase()],
      });
    });

    // Append dynamic data from brands
    brands.forEach((brand) => {
      items.push({
        id: `brand-${brand.id}`,
        category: isEn ? "Audio Brands" : "Brand Audio",
        title: brand.name,
        subtitle: `${brand.submittedBy || "Official Distributor"} • ${brand.country} • ${brand.tier}`,
        path: "/admin/approvals/brands",
        badge: brand.tier,
        badgeColor: "bg-[#181818] text-[#D4D4D8] border border-[#2E2E2E]",
        keywords: ["brand", "merek", brand.name.toLowerCase(), (brand.submittedBy || "").toLowerCase(), brand.country.toLowerCase()],
      });
    });

    // Append dynamic data from products
    products.forEach((prod) => {
      items.push({
        id: `prod-${prod.id}`,
        category: isEn ? "IEM Catalog Products" : "Katalog Produk IEM",
        title: prod.name,
        subtitle: `${prod.storeName} • $${prod.price} • ${prod.soundSignature}`,
        path: "/admin/approvals/products",
        badge: prod.status,
        badgeColor: "bg-[#181818] text-[#D4D4D8] border border-[#2E2E2E]",
        keywords: ["produk", "iem", prod.name.toLowerCase(), prod.storeName.toLowerCase(), prod.brand.toLowerCase(), prod.soundSignature.toLowerCase()],
      });
    });

    // Append dynamic data from couriers
    couriers.forEach((courier) => {
      items.push({
        id: `courier-${courier.id}`,
        category: isEn ? "Courier Fleets" : "Armada Ekspedisi",
        title: `${courier.name} (${courier.code})`,
        subtitle: `${courier.type} • $${courier.baseRateUSD}/kg • ${courier.estimatedDays}`,
        path: "/admin/logistics/couriers",
        badge: courier.code,
        badgeColor: "bg-[#181818] text-[#D4D4D8] border border-[#2E2E2E]",
        keywords: ["kurir", "ekspedisi", courier.name.toLowerCase(), courier.code.toLowerCase(), courier.type.toLowerCase()],
      });
    });

    return items;
  }, [stores, brands, products, couriers, categories, isEn]);

  // Filter items matching query
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      // Show default main menu navigation when query is empty
      return searchIndex.filter((item) => item.category === (isEn ? "Navigation" : "Menu Utama") || item.category === (isEn ? "Approvals & Moderation" : "Persetujuan & Moderasi") || item.category === (isEn ? "Finance & Ledger" : "Keuangan & Rekber"));
    }

    const q = query.toLowerCase().trim();
    return searchIndex.filter((item) => {
      if (item.title.toLowerCase().includes(q)) return true;
      if (item.subtitle && item.subtitle.toLowerCase().includes(q)) return true;
      if (item.category.toLowerCase().includes(q)) return true;
      return item.keywords.some((k) => k.includes(q));
    });
  }, [query, searchIndex, isEn]);

  // Keyboard navigation inside command palette
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          const target = filteredItems[selectedIndex];
          onClose();
          router.push(target.path);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, router, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  const handleSelect = (item: SearchItem) => {
    onClose();
    router.push(item.path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full max-w-2xl bg-[#111111] border border-[#2A2A2A] rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden z-10 flex flex-col font-sans"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-[#222] bg-[#141414] gap-3">
              <svg className="w-5 h-5 text-[#888] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder={
                  isEn
                    ? "Search admin menu, stores, IEM products, couriers, or keywords..."
                    : "Cari menu admin, toko, produk IEM, ekspedisi, atau kata kunci..."
                }
                className="flex-1 bg-transparent text-sm text-[#FAF9F6] placeholder:text-[#666] outline-none font-sans"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="px-2 py-0.5 text-[11px] font-mono text-[#888] hover:text-white bg-[#222] hover:bg-[#333] rounded cursor-pointer transition-colors"
                >
                  {isEn ? "Clear" : "Bersihkan"}
                </button>
              )}

              <kbd
                onClick={onClose}
                className="px-2 py-1 text-[10px] font-mono text-[#888] hover:text-white bg-[#1C1C1C] border border-[#2E2E2E] rounded cursor-pointer transition-colors"
              >
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div ref={listRef} className="max-h-[380px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      data-index={idx}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? "bg-[#242424] text-[#FAF9F6] border-[#383838] shadow-sm"
                          : "text-[#8E8E93] hover:bg-[#1A1A1A] hover:text-[#FAF9F6] border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Icon / Indicator */}
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? "bg-[#161616] text-[#FAF9F6] border-[#444]"
                              : "bg-[#181818] text-[#777] border-[#2A2A2A]"
                          }`}
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-white truncate">{item.title}</span>
                            <span className="text-[10px] font-mono text-[#777] hidden sm:inline">•</span>
                            <span className="text-[10px] font-mono text-[#777] truncate hidden sm:inline">{item.category}</span>
                          </div>
                          {item.subtitle && (
                            <p className="text-[11px] text-[#888] truncate mt-0.5 font-sans">{item.subtitle}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        {item.badge && (
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${
                              item.badgeColor || "bg-[#222] text-[#888] border-[#333]"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}

                        {isSelected && (
                          <kbd className="hidden sm:inline text-[10px] font-mono text-[#FAF9F6] bg-[#181818] px-1.5 py-0.5 rounded border border-[#444]">
                            ↵
                          </kbd>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 px-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2A2A2A] text-[#777] flex items-center justify-center mx-auto mb-3">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-white">
                    {isEn ? "No matching admin results" : "Tidak ada hasil yang cocok"}
                  </p>
                  <p className="text-[11px] text-[#777] mt-1 font-mono">
                    {isEn
                      ? `No records found matching "${query}". Try searching "sellers", "products", "escrow", etc.`
                      : `Tidak ditemukan data untuk "${query}". Coba cari "toko", "produk", "rekber", dll.`}
                  </p>
                </div>
              )}
            </div>

            {/* Command Palette Footer */}
            <div className="px-4 py-2.5 bg-[#0D0D0D] border-t border-[#1E1E1E] flex items-center justify-between text-[10px] font-mono text-[#777]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-[#1C1C1C] border border-[#2A2A2A] rounded text-[#FAF9F6]">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-[#1C1C1C] border border-[#2A2A2A] rounded text-[#FAF9F6]">↓</kbd>
                  <span className="ml-0.5">{isEn ? "to navigate" : "untuk memilih"}</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-[#1C1C1C] border border-[#2A2A2A] rounded text-[#FAF9F6]">↵</kbd>
                  <span className="ml-0.5">{isEn ? "to select" : "buka menu"}</span>
                </span>
              </div>

              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[#1C1C1C] border border-[#2A2A2A] rounded text-[#FAF9F6]">esc</kbd>
                <span className="ml-0.5">{isEn ? "to close" : "tutup"}</span>
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
