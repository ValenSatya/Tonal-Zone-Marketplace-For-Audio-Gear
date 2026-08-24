"use client";

import React, { useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function SellerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const isEn = language === "English";

  const [mounted, setMounted] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currency, setCurrency] = useState<"IDR" | "USD">("IDR");
  const [sellerMode, setSellerMode] = useState<"RETAIL_MERCHANT" | "OFFICIAL_BRAND">("RETAIL_MERCHANT");
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);

  const [sellerData, setSellerData] = useState<{
    storeName: string;
    ownerName: string;
    email: string;
    status: string;
    storeAvatar?: string;
    brandName?: string;
  }>({
    storeName: "AudioZone Official",
    ownerName: "Alexander Rivera",
    email: "seller@tonalzone.id",
    status: "APPROVED",
    storeAvatar: "",
    brandName: "TANGZU Audio",
  });

  const loadUserData = () => {
    const stored = localStorage.getItem("tonalzone_user");
    const savedCurrency = localStorage.getItem("tonalzone_seller_currency") as "IDR" | "USD" | null;
    const savedMode = localStorage.getItem("tonalzone_seller_mode") as "RETAIL_MERCHANT" | "OFFICIAL_BRAND" | null;

    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
    if (savedMode) {
      setSellerMode(savedMode);
    }

    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (!savedCurrency && u.location === "Indonesia") {
          setCurrency("IDR");
        } else if (!savedCurrency && u.storeCurrency) {
          setCurrency(u.storeCurrency);
        }

        if (!savedMode && u.storeType) {
          setSellerMode(u.storeType);
        }

        setSellerData({
          storeName: u.storeName || (u.name ? `${u.name}'s Store` : "AudioZone Official"),
          ownerName: u.name || "Alexander Rivera",
          email: u.email || "seller@tonalzone.id",
          status: u.sellerStatus || (u.isSeller ? "APPROVED" : "APPROVED"),
          storeAvatar: u.storeAvatar || "",
          brandName: u.brandName || "TANGZU Audio",
        });
      } catch (e) {}
    }
  };

  useEffect(() => {
    setMounted(true);
    loadUserData();

    window.addEventListener("storage", loadUserData);
    return () => window.removeEventListener("storage", loadUserData);
  }, []);

  const handleCurrencyChange = (newCurr: "IDR" | "USD") => {
    setCurrency(newCurr);
    localStorage.setItem("tonalzone_seller_currency", newCurr);
    try {
      const stored = localStorage.getItem("tonalzone_user");
      if (stored) {
        const u = JSON.parse(stored);
        u.storeCurrency = newCurr;
        localStorage.setItem("tonalzone_user", JSON.stringify(u));
      }
    } catch (e) {}
    window.dispatchEvent(new Event("storage"));
  };

  const handleModeChange = (newMode: "RETAIL_MERCHANT" | "OFFICIAL_BRAND") => {
    setSellerMode(newMode);
    setIsModeDropdownOpen(false);
    localStorage.setItem("tonalzone_seller_mode", newMode);
    try {
      const stored = localStorage.getItem("tonalzone_user");
      if (stored) {
        const u = JSON.parse(stored);
        u.storeType = newMode;
        if (newMode === "OFFICIAL_BRAND") {
          u.storeName = "TANGZU Audio Official";
          u.brandName = "TANGZU Audio";
        } else {
          u.storeName = "AudioZone Official";
        }
        localStorage.setItem("tonalzone_user", JSON.stringify(u));
      }
    } catch (e) {}
    window.dispatchEvent(new Event("storage"));
  };

  // Compute Breadcrumb Trail
  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return [{ label: isEn ? "Overview" : "Ringkasan", path: "/seller" }];

    const breadcrumbs = [{ label: isEn ? "Seller Hub" : "Portal Penjual", path: "/seller" }];
    if (parts[1] === "orders") {
      breadcrumbs.push({ label: isEn ? "Orders & Shipments" : "Pesanan & Pengiriman", path: "/seller/orders" });
    } else if (parts[1] === "products") {
      if (parts[2] === "new") {
        breadcrumbs.push({ label: isEn ? "Product Catalog" : "Katalog Produk", path: "/seller/products" });
        breadcrumbs.push({ label: isEn ? "Add Product" : "Tambah Produk", path: "/seller/products/new" });
      } else {
        breadcrumbs.push({ label: isEn ? "Product Catalog" : "Katalog Produk", path: "/seller/products" });
      }
    } else if (parts[1] === "payouts") {
      breadcrumbs.push({ label: isEn ? "Wallet & Payouts" : "Dompet & Pencairan", path: "/seller/payouts" });
    } else if (parts[1] === "settings") {
      breadcrumbs.push({ label: isEn ? "Store Settings" : "Pengaturan Toko", path: "/seller/settings" });
    } else if (parts[1] === "brand") {
      breadcrumbs.push({ label: isEn ? "Official Brand Hub" : "Hub Brand Resmi", path: "/seller/brand/profile" });
      if (parts[2] === "curves") {
        breadcrumbs.push({ label: isEn ? "Master Target FR Vault" : "Kurva Akustik FR", path: "/seller/brand/curves" });
      } else if (parts[2] === "campaigns") {
        breadcrumbs.push({ label: isEn ? "Pre-Order Campaigns" : "Kampanye Pre-Order", path: "/seller/brand/campaigns" });
      } else if (parts[2] === "resellers") {
        breadcrumbs.push({ label: isEn ? "Authorized Resellers" : "Reseller Resmi", path: "/seller/brand/resellers" });
      }
    }
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const NAV_SECTIONS = [
    ...(sellerMode === "OFFICIAL_BRAND"
      ? [
          {
            group: isEn ? "Official Brand Flagship" : "Fitur Brand Resmi (TANGZU)",
            items: [
              {
                label: isEn ? "Brand Profile & Tuning Story" : "Profil & Filosofi Brand",
                path: "/seller/brand/profile",
                icon: (
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
                  </svg>
                ),
              },
              {
                label: isEn ? "Master Target FR Curves" : "Master FR Curve Vault",
                path: "/seller/brand/curves",
                icon: (
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                ),
              },
              {
                label: isEn ? "Pre-Order & Group-Buys" : "Kampanye Pre-Order",
                path: "/seller/brand/campaigns",
                icon: (
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.401A3.75 3.75 0 0012 18z" />
                  </svg>
                ),
              },
              {
                label: isEn ? "Authorized Resellers" : "Direktori Reseller Resmi",
                path: "/seller/brand/resellers",
                icon: (
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                ),
              },
            ],
          },
        ]
      : []),
    {
      group: isEn ? "Store Management" : "Manajemen Toko",
      items: [
        {
          label: isEn ? "Overview & Telemetry" : "Ringkasan Toko",
          path: "/seller",
          icon: (
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
          ),
        },
        {
          label: isEn ? "Orders & Waybills" : "Pesanan & Resi",
          path: "/seller/orders",
          icon: (
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.175V3.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75" />
            </svg>
          ),
        },
      ],
    },
    {
      group: isEn ? "Inventory & Products" : "Inventaris & Produk",
      items: [
        {
          label: isEn ? "All Products & Stock" : "Katalog Semua Produk",
          path: "/seller/products",
          icon: (
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          ),
        },
        {
          label: isEn ? "Add Product" : "Tambah Produk",
          path: "/seller/products/new",
          icon: (
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8" />
            </svg>
          ),
        },
      ],
    },
    {
      group: isEn ? "Finance & Settings" : "Keuangan & Toko",
      items: [
        {
          label: isEn ? "Wallet & Payouts" : "Dompet & Saldo Toko",
          path: "/seller/payouts",
          icon: (
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h20M6 15h.01M10 15h.01" />
            </svg>
          ),
        },
        {
          label: isEn ? "Store Settings" : "Pengaturan Toko",
          path: "/seller/settings",
          icon: (
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#090909] text-[#FAF9F6] font-sans selection:bg-[#242424] selection:text-[#FAF9F6] flex">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 border-r border-[#1E1E1E] bg-[#0D0D0D] flex flex-col shrink-0 min-h-screen sticky top-0 h-screen hidden md:flex z-30">
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-[#1E1E1E] shrink-0">
          <Link href="/seller" className="flex items-center gap-2.5 group">
            <div className="w-5 h-5 bg-[#FAF9F6] rounded flex items-center justify-center text-black font-bold text-[10px] tracking-tighter">
              TZ
            </div>
            <span className="font-mono font-semibold text-xs tracking-wider text-[#FAF9F6]">
              TONAL ZONE
            </span>
          </Link>
          {sellerMode === "OFFICIAL_BRAND" ? (
            <span className="text-[10px] font-mono font-medium text-[#FAF9F6] bg-[#161616] px-2 py-0.5 rounded border border-[#2A2A2A] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white" /> BRAND HUB
            </span>
          ) : (
            <span className="text-[10px] font-mono font-medium text-[#FAF9F6] bg-[#161616] px-2 py-0.5 rounded border border-[#2A2A2A] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> SELLER HUB
            </span>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {NAV_SECTIONS.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
                {section.group}
              </div>
              {section.items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans transition-all duration-150 border ${
                      isActive
                        ? "bg-[#242424] text-[#FAF9F6] font-semibold border-[#383838] shadow-sm"
                        : "text-[#8E8E93] hover:text-[#FAF9F6] hover:bg-[#1A1A1A] border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? "text-[#FAF9F6]" : "text-[#71717A]"}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Store Profile Card Footer */}
        <div className="p-3 border-t border-[#1E1E1E] bg-[#0A0A0A] shrink-0">
          <Link
            href="/seller/settings"
            className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1A1A1A] border border-[#222] hover:border-[#333] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-[#1E1E1E] border border-[#333] overflow-hidden flex items-center justify-center font-mono font-bold text-xs text-white shrink-0">
              {sellerData.storeAvatar ? (
                <img src={sellerData.storeAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                sellerMode === "OFFICIAL_BRAND" ? "TZ" : sellerData.storeName.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-sans font-bold text-white truncate">
                  {sellerMode === "OFFICIAL_BRAND" ? "TANGZU Audio Official" : sellerData.storeName}
                </p>
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    sellerMode === "OFFICIAL_BRAND" ? "bg-white" : "bg-emerald-400"
                  }`}
                  title={sellerMode === "OFFICIAL_BRAND" ? "Verified Flagship Brand" : "Verified Retail Merchant"}
                />
              </div>
              <p className="text-[10px] font-mono text-[#888] truncate">
                {sellerMode === "OFFICIAL_BRAND" ? "brand@tangzu.audio" : sellerData.email}
              </p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden min-h-screen">
        {/* Top Header */}
        <header className="h-14 flex items-center px-4 sm:px-6 justify-between sticky top-0 z-20 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-[#1E1E1E] gap-4">
          {/* Mobile hamburger & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg text-[#8E8E93] hover:text-[#FAF9F6] hover:bg-[#1A1A1A] md:hidden focus:outline-none"
              aria-label="Open sidebar menu"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Breadcrumb Trail */}
            <nav className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#8E8E93] truncate">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.path}>
                  {idx > 0 && <span className="text-[#444] select-none">/</span>}
                  <span className={idx === breadcrumbs.length - 1 ? "text-[#FAF9F6] font-semibold" : "hover:text-[#FAF9F6]"}>
                    {crumb.label}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Right Header Controls: Mode Switcher, Currency Toggle, Language Switcher, Notifications, Public Store Link */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Account Mode Switcher (Merchant ⇄ Official Brand TANGZU) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-[#141414] text-[#FAF9F6] border border-[#2E2E2E] hover:bg-[#1E1E1E] transition-colors cursor-pointer"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${sellerMode === "OFFICIAL_BRAND" ? "bg-white" : "bg-emerald-400"}`} />
                <span className="hidden sm:inline">
                  {sellerMode === "OFFICIAL_BRAND" ? "Brand: TANGZU" : "Retail: AudioZone"}
                </span>
                <span className="sm:hidden">
                  {sellerMode === "OFFICIAL_BRAND" ? "Brand" : "Retail"}
                </span>
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="ml-0.5 text-[#71717A]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              <AnimatePresence>
                {isModeDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-1.5 w-60 bg-[#121212] border border-[#2E2E2E] rounded-xl shadow-2xl p-1.5 z-50 font-sans text-xs space-y-1"
                  >
                    <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase text-[#71717A] border-b border-[#222]">
                      {isEn ? "Select Seller Mode" : "Pilih Mode Akun"}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleModeChange("RETAIL_MERCHANT")}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                        sellerMode === "RETAIL_MERCHANT" ? "bg-[#222222] text-white font-semibold" : "text-[#A1A1AA] hover:bg-[#181818] hover:text-white"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-medium text-white">Merchant Retail Store</p>
                        <p className="text-[10px] font-mono text-[#71717A]">AudioZone Retail Hub</p>
                      </div>
                      {sellerMode === "RETAIL_MERCHANT" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange("OFFICIAL_BRAND")}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                        sellerMode === "OFFICIAL_BRAND" ? "bg-[#222222] text-white font-semibold" : "text-[#A1A1AA] hover:bg-[#181818] hover:text-white"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-medium text-white">Official Brand Flagship</p>
                        <p className="text-[10px] font-mono text-[#71717A]">TANGZU Audio Official</p>
                      </div>
                      {sellerMode === "OFFICIAL_BRAND" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Currency Switcher (IDR / USD) */}
            <div className="flex items-center bg-[#141414] border border-[#262626] rounded-lg p-0.5 text-xs font-mono font-medium">
              <button
                type="button"
                onClick={() => handleCurrencyChange("IDR")}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  currency === "IDR"
                    ? "bg-[#262626] text-white font-bold shadow-sm"
                    : "text-[#71717A] hover:text-[#FAF9F6]"
                }`}
                title="Indonesian Rupiah (Rp)"
              >
                IDR
              </button>
              <button
                type="button"
                onClick={() => handleCurrencyChange("USD")}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  currency === "USD"
                    ? "bg-[#262626] text-white font-bold shadow-sm"
                    : "text-[#71717A] hover:text-[#FAF9F6]"
                }`}
                title="US Dollar ($)"
              >
                USD
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-[#141414] border border-[#262626] rounded-lg p-0.5 text-xs font-mono font-medium">
              <button
                type="button"
                onClick={() => setLanguage("English")}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  isEn
                    ? "bg-[#262626] text-white font-bold shadow-sm"
                    : "text-[#71717A] hover:text-[#FAF9F6]"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("Bahasa Indonesia")}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  !isEn
                    ? "bg-[#262626] text-white font-bold shadow-sm"
                    : "text-[#71717A] hover:text-[#FAF9F6]"
                }`}
              >
                ID
              </button>
            </div>

            {/* Public Storefront Link */}
            <Link
              href="/collection"
              target="_blank"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1A1A1A] border border-[#2E2E2E] text-xs font-mono text-[#8E8E93] hover:text-[#FAF9F6] transition-colors"
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              <span>{isEn ? "Live Store" : "Lihat Toko"}</span>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-72 bg-[#0D0D0D] border-r border-[#1E1E1E] flex flex-col h-full z-10"
            >
              {/* Mobile Drawer Header */}
              <div className="h-14 flex items-center justify-between px-5 border-b border-[#1E1E1E] shrink-0">
                <Link href="/seller" onClick={() => setIsMobileSidebarOpen(false)} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 bg-[#FAF9F6] rounded flex items-center justify-center text-black font-bold text-[10px]">
                    TZ
                  </div>
                  <span className="font-mono font-semibold text-xs text-[#FAF9F6]">
                    TONAL ZONE
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 rounded text-[#8E8E93] hover:text-white"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Nav Links */}
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
                {NAV_SECTIONS.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-1">
                    <div className="px-3 pb-1 text-[10px] font-mono uppercase text-[#71717A]">
                      {section.group}
                    </div>
                    {section.items.map((item) => {
                      const isActive = pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={() => setIsMobileSidebarOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans border ${
                            isActive
                              ? "bg-[#242424] text-[#FAF9F6] font-semibold border-[#383838]"
                              : "text-[#8E8E93] hover:text-[#FAF9F6] border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Mobile Drawer Footer */}
              <div className="p-3 border-t border-[#1E1E1E] bg-[#0A0A0A] shrink-0">
                <Link
                  href="/seller/settings"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-[#141414] border border-[#222]"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1E1E1E] overflow-hidden flex items-center justify-center font-mono font-bold text-xs text-white shrink-0">
                    {sellerData.storeAvatar ? (
                      <img src={sellerData.storeAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      sellerMode === "OFFICIAL_BRAND" ? "TZ" : sellerData.storeName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">
                      {sellerMode === "OFFICIAL_BRAND" ? "TANGZU Audio Official" : sellerData.storeName}
                    </p>
                    <p className="text-[10px] font-mono text-[#888] truncate">
                      {sellerMode === "OFFICIAL_BRAND" ? "brand@tangzu.audio" : sellerData.email}
                    </p>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
