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

  const [sellerData, setSellerData] = useState<{
    storeName: string;
    ownerName: string;
    email: string;
    status: string;
    storeAvatar?: string;
    brandName?: string;
  }>({
    storeName: "Toko Saya (Tonal Zone)",
    ownerName: "Alexander Rivera",
    email: "seller@tonalzone.id",
    status: "APPROVED",
    storeAvatar: "",
    brandName: "Official Store",
  });

  const loadUserData = async () => {
    const stored = localStorage.getItem("tonalzone_user");
    const savedCurrency = localStorage.getItem("tonalzone_seller_currency") as "IDR" | "USD" | null;

    if (savedCurrency) {
      setCurrency(savedCurrency);
    }

    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (!savedCurrency && u.location === "Indonesia") {
          setCurrency("IDR");
        } else if (!savedCurrency && u.storeCurrency) {
          setCurrency(u.storeCurrency);
        }

        if (u.storeType) {
          setSellerMode(u.storeType);
        }

        setSellerData({
          storeName: u.storeName || (u.name ? `Toko ${u.name}` : "Toko Saya"),
          ownerName: u.name || "Valen Satya",
          email: u.email || "seller@tonalzone.id",
          status: u.sellerStatus || (u.isSeller ? "APPROVED" : "APPROVED"),
          storeAvatar: u.storeAvatar || "",
          brandName: u.brandName || (u.storeType === "OFFICIAL_BRAND" ? "MOONDROP" : "Official Store"),
        });
      } catch (e) {}
    }

    // Fetch verified store profile from backend Supabase API
    try {
      const res = await fetch("/api/seller/store");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.store) {
          const s = data.store;
          const isBrand = s.storeType === "OFFICIAL_BRAND";
          setSellerMode(isBrand ? "OFFICIAL_BRAND" : "RETAIL_MERCHANT");
          setSellerData((prev) => ({
            ...prev,
            storeName: s.storeName || prev.storeName,
            status: s.status || prev.status,
            brandName: s.brandName || (isBrand ? "MOONDROP" : prev.brandName),
          }));

          if (stored) {
            try {
              const u = JSON.parse(stored);
              u.storeId = s.id;
              u.storeName = s.storeName;
              u.storeType = s.storeType;
              u.brandName = s.brandName;
              localStorage.setItem("tonalzone_user", JSON.stringify(u));
            } catch (err) {}
          }
        }
      }
    } catch (err) {
      console.warn("Failed to load store profile:", err);
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

  // Compute Breadcrumb Trail
  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return [{ label: isEn ? "Overview" : "Ringkasan", path: "/seller" }];

    const breadcrumbs = [{ label: isEn ? "Seller Hub" : "Portal Penjual", path: "/seller" }];
    if (parts[1] === "orders") {
      breadcrumbs.push({ label: isEn ? "Orders & Shipments" : "Pesanan & Pengiriman", path: "/seller/orders" });
    } else if (parts[1] === "returns") {
      breadcrumbs.push({ label: isEn ? "Returns & Complaints" : "Retur & Komplain", path: "/seller/returns" });
    } else if (parts[1] === "chat") {
      breadcrumbs.push({ label: isEn ? "Customer Chat" : "Pesan & Chat Pembeli", path: "/seller/chat" });
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
    {
      group: isEn ? "Main Menu" : "Menu Utama Toko",
      items: [
        {
          label: isEn ? "Dashboard" : "Ringkasan Toko",
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
          label: isEn ? "Orders & Shipping" : "Pesanan & Kirim Paket",
          path: "/seller/orders",
          icon: (
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.175V3.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75" />
            </svg>
          ),
        },
        {
          label: isEn ? "Returns & Complaints" : "Retur & Komplain",
          path: "/seller/returns",
          icon: (
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          ),
        },
        {
          label: isEn ? "Customer Chat" : "Pesan & Chat Pembeli",
          path: "/seller/chat",
          icon: (
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-.818-.836 5.86 5.86 0 01.99-2.73C4.062 16.035 3 14.12 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          ),
        },
      ],
    },
    {
      group: isEn ? "Products" : "Produk & Stok",
      items: [
        {
          label: isEn ? "My Products" : "Daftar Produk Saya",
          path: "/seller/products",
          icon: (
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          ),
        },
        {
          label: isEn ? "Add New Product" : "Tambah Produk Baru",
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
      group: isEn ? "Finance & Settings" : "Keuangan & Akun",
      items: [
        {
          label: isEn ? "Earnings & Withdraw" : "Saldo & Tarik Dana",
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
    <div className="min-h-screen bg-[#000000] text-[#FAF9F6] font-sans selection:bg-[#141414] selection:text-[#FAF9F6] flex">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-[#060606] flex flex-col shrink-0 min-h-screen sticky top-0 h-screen hidden md:flex z-30">
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-5 shrink-0">
          <Link href="/seller" className="flex items-center gap-2.5 group">
            <div className="w-6 h-6 bg-[#FAF9F6] rounded-lg flex items-center justify-center text-black font-bold text-[10px] tracking-tighter">
              TZ
            </div>
            <span className="font-mono font-semibold text-xs tracking-wider text-[#FAF9F6]">
              TONAL ZONE
            </span>
          </Link>
          {sellerMode === "OFFICIAL_BRAND" ? (
            <span className="text-[10px] font-mono font-medium text-[#FAF9F6] bg-[#121212] px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              BRAND HUB
            </span>
          ) : (
            <span className="text-[10px] font-mono font-medium text-[#FAF9F6] bg-[#121212] px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              SELLER HUB
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
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-sans transition-all duration-150 ${
                      isActive
                        ? "bg-[#141414] text-[#FAF9F6] font-semibold shadow-sm"
                        : "text-[#8E8E93] hover:text-[#FAF9F6] hover:bg-[#0A0A0A]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? "text-[#FAF9F6]" : "text-[#71717A]"}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Store Profile Card Footer */}
        <div className="p-3 bg-[#060606] shrink-0">
          <Link
            href="/seller/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-[#0A0A0A] hover:bg-[#121212] transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-[#161616] overflow-hidden flex items-center justify-center font-mono font-bold text-xs text-white shrink-0">
              {sellerData.storeAvatar ? (
                <img src={sellerData.storeAvatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                sellerData.storeName.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-sans font-bold text-white truncate">
                  {sellerData.storeName}
                </p>
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    sellerMode === "OFFICIAL_BRAND" ? "bg-white" : "bg-[#BFDD25]"
                  }`}
                  title={sellerMode === "OFFICIAL_BRAND" ? "Official Brand" : "Verified Merchant"}
                />
              </div>
              <p className="text-[10px] font-mono text-[#8E8E93] truncate">
                {sellerData.email}
              </p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden min-h-screen">
        {/* Top Header */}
        <header className="h-14 flex items-center px-4 sm:px-6 justify-between sticky top-0 z-20 bg-[#000000]/80 backdrop-blur-md gap-4">
          {/* Mobile hamburger & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg text-[#8E8E93] hover:text-[#FAF9F6] hover:bg-[#0A0A0A] md:hidden focus:outline-none cursor-pointer"
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
            {/* Store Type Badge */}
            {sellerMode === "OFFICIAL_BRAND" ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-[#121212] text-[#FAF9F6]">
                <span className="hidden sm:inline">BRAND RESMI: {sellerData.brandName || "MOONDROP"}</span>
                <span className="sm:hidden">BRAND RESMI</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-[#121212] text-[#FAF9F6]">
                <span className="hidden sm:inline">{isEn ? "VERIFIED MERCHANT" : "TOKO RETAIL VERIFIKASI"}</span>
                <span className="sm:hidden">RETAIL</span>
              </div>
            )}

            {/* Currency Switcher (IDR / USD) */}
            <div className="flex items-center bg-[#121212] rounded-full p-0.5 text-xs font-mono font-medium">
              <button
                type="button"
                onClick={() => handleCurrencyChange("IDR")}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  currency === "IDR"
                    ? "bg-[#222222] text-white font-bold shadow-sm"
                    : "text-[#71717A] hover:text-[#FAF9F6]"
                }`}
                title="Indonesian Rupiah (Rp)"
              >
                IDR
              </button>
              <button
                type="button"
                onClick={() => handleCurrencyChange("USD")}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  currency === "USD"
                    ? "bg-[#222222] text-white font-bold shadow-sm"
                    : "text-[#71717A] hover:text-[#FAF9F6]"
                }`}
                title="US Dollar ($)"
              >
                USD
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-[#121212] rounded-full p-0.5 text-xs font-mono font-medium">
              <button
                type="button"
                onClick={() => setLanguage("English")}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  isEn
                    ? "bg-[#222222] text-white font-bold shadow-sm"
                    : "text-[#71717A] hover:text-[#FAF9F6]"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("Bahasa Indonesia")}
                className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                  !isEn
                    ? "bg-[#222222] text-white font-bold shadow-sm"
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
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#121212] hover:bg-[#1E1E1E] text-xs font-mono text-[#8E8E93] hover:text-[#FAF9F6] transition-colors"
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
          {sellerData.status === "PENDING" && (
            <div className="mb-6 p-4 rounded-2xl bg-[#121212] text-xs font-sans text-amber-200 flex items-start gap-3 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0 animate-pulse" />
              <div>
                <p className="font-semibold text-white">Status Toko: Dalam Antrean Verifikasi Admin</p>
                <p className="text-[#A1A1AA] mt-0.5">
                  Toko Anda sedang diverifikasi oleh kurator TonalZone. Anda tetap dapat melengkapi profil toko dan menambahkan draf produk sebelum toko dipublikasikan secara resmi.
                </p>
              </div>
            </div>
          )}
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
              className="relative w-72 bg-[#060606] flex flex-col h-full z-10"
            >
              {/* Mobile Drawer Header */}
              <div className="h-14 flex items-center justify-between px-5 shrink-0">
                <Link href="/seller" onClick={() => setIsMobileSidebarOpen(false)} className="flex items-center gap-2.5">
                  <div className="w-6 h-6 bg-[#FAF9F6] rounded-lg flex items-center justify-center text-black font-bold text-[10px]">
                    TZ
                  </div>
                  <span className="font-mono font-semibold text-xs text-[#FAF9F6]">
                    TONAL ZONE
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-[#8E8E93] hover:text-white"
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
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-sans transition-colors ${
                            isActive
                              ? "bg-[#141414] text-[#FAF9F6] font-semibold shadow-sm"
                              : "text-[#8E8E93] hover:text-[#FAF9F6] hover:bg-[#0A0A0A]"
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
              <div className="p-3 bg-[#060606] shrink-0">
                <Link
                  href="/seller/settings"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-[#0A0A0A] hover:bg-[#121212] transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#161616] overflow-hidden flex items-center justify-center font-mono font-bold text-xs text-white shrink-0">
                    {sellerData.storeAvatar ? (
                      <img src={sellerData.storeAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      sellerData.storeName.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">
                      {sellerData.storeName}
                    </p>
                    <p className="text-[10px] font-mono text-[#8E8E93] truncate">
                      {sellerData.email}
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
