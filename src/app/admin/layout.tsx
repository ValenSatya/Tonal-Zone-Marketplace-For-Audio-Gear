"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import { useAdminData } from "@/context/AdminDataContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import AdminCommandPalette from "@/components/admin/AdminCommandPalette";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { stores, brands, products } = useAdminData();
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isEn = language === "English";
  const pendingStores = mounted ? stores.filter((s) => s.status === "PENDING").length : 0;
  const pendingBrands = mounted ? brands.filter((b) => b.status === "PENDING").length : 0;
  const pendingProducts = mounted ? products.filter((p) => p.status === "PENDING").length : 0;

  // Breadcrumb mapping
  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return [{ label: isEn ? "Overview" : "Ringkasan", path: "/admin" }];

    const breadcrumbs = [{ label: "Admin", path: "/admin" }];
    if (parts[1] === "approvals") {
      breadcrumbs.push({ label: isEn ? "Moderation" : "Moderasi", path: "/admin/approvals/sellers" });
      if (parts[2] === "sellers") breadcrumbs.push({ label: isEn ? "Store Verification" : "Verifikasi Toko", path: "/admin/approvals/sellers" });
      if (parts[2] === "brands") breadcrumbs.push({ label: isEn ? "Brand Approvals" : "Persetujuan Brand", path: "/admin/approvals/brands" });
      if (parts[2] === "products") breadcrumbs.push({ label: isEn ? "Product Approvals" : "Persetujuan Produk", path: "/admin/approvals/products" });
    } else if (parts[1] === "banners") {
      breadcrumbs.push({ label: isEn ? "Hero Banners" : "Banner Promo", path: "/admin/banners" });
    } else if (parts[1] === "logistics") {
      breadcrumbs.push({ label: isEn ? "Shipments" : "Pengiriman", path: "/admin/logistics/tracking" });
      if (parts[2] === "tracking") breadcrumbs.push({ label: isEn ? "Shipment Tracking" : "Lacak Pengiriman", path: "/admin/logistics/tracking" });
      if (parts[2] === "couriers") breadcrumbs.push({ label: isEn ? "Couriers & Fleets" : "Daftar Ekspedisi", path: "/admin/logistics/couriers" });
    } else if (parts[1] === "users") {
      breadcrumbs.push({ label: isEn ? "User Directory" : "Daftar Pengguna", path: "/admin/users" });
    } else if (parts[1] === "transactions") {
      breadcrumbs.push({ label: isEn ? "Escrow & Settlements" : "Rekening Bersama", path: "/admin/transactions" });
    } else if (parts[1] === "config") {
      breadcrumbs.push({ label: isEn ? "Categories" : "Kategori Produk", path: "/admin/config/catalog" });
    }
    return breadcrumbs;
  };

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `group flex items-center justify-between px-3 py-2 text-xs font-sans rounded-md transition-all duration-150 border ${
      isActive
        ? "bg-[#222222] text-[#FAF9F6] font-medium border-[#333333] shadow-sm"
        : "text-[#8E8E93] hover:bg-[#161616] hover:text-[#FAF9F6] border-transparent"
    }`;
  };

  const getIconClass = (path: string) => {
    const isActive = pathname === path;
    return `w-4 h-4 shrink-0 transition-colors ${
      isActive ? "text-[#FAF9F6]" : "text-[#71717A] group-hover:text-[#FAF9F6]"
    }`;
  };

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1E1E1E] flex items-center justify-between bg-[#0B0B0B]">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
          <div className="w-7 h-7 rounded-md bg-[#1C1C1C] text-[#FAF9F6] border border-[#2E2E2E] flex items-center justify-center font-mono font-black text-xs shadow-sm">
            TZ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold text-[#FAF9F6] tracking-wider uppercase font-mono">
                Tonal Zone
              </h1>
              <span className="text-[9px] font-mono font-bold bg-white/10 text-[#FAF9F6] px-1.5 py-0.2 rounded border border-white/10">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] font-mono text-[#71717A] mt-0.5">
              {isEn ? "Admin Command Center" : "Pusat Kendali Admin"}
            </p>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto custom-scrollbar">
        {/* Overview */}
        <div>
          <h2 className="text-[9px] font-mono font-bold text-[#52525B] uppercase tracking-widest mb-1.5 px-3">
            {isEn ? "Core Overview" : "Ringkasan Utama"}
          </h2>
          <div className="flex flex-col space-y-0.5">
            <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className={getLinkClass("/admin")}>
              <span className="flex items-center gap-2.5">
                <svg className={getIconClass("/admin")} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                </svg>
                {isEn ? "System Overview" : "Ringkasan Sistem"}
              </span>
            </Link>
          </div>
        </div>

        {/* Moderation Queue */}
        <div>
          <div className="flex items-center justify-between px-3 mb-1.5">
            <h2 className="text-[9px] font-mono font-bold text-[#52525B] uppercase tracking-widest">
              {isEn ? "Approvals & Moderation" : "Persetujuan & Moderasi"}
            </h2>
            {(pendingStores + pendingBrands + pendingProducts > 0) && (
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            )}
          </div>
          <div className="flex flex-col space-y-0.5">
            <Link href="/admin/approvals/sellers" onClick={() => setMobileMenuOpen(false)} className={getLinkClass("/admin/approvals/sellers")}>
              <span className="flex items-center gap-2.5">
                <svg className={getIconClass("/admin/approvals/sellers")} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                {isEn ? "Store Verification" : "Verifikasi Toko & Penjual"}
              </span>
              {pendingStores > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-[#1A1A1A] text-[#FAF9F6] border border-[#2E2E2E]">
                  {pendingStores}
                </span>
              )}
            </Link>

            <Link href="/admin/approvals/brands" onClick={() => setMobileMenuOpen(false)} className={getLinkClass("/admin/approvals/brands")}>
              <span className="flex items-center gap-2.5">
                <svg className={getIconClass("/admin/approvals/brands")} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.386l5.06-2.98c.828-.487 1.001-1.568.302-2.267l-9.581-9.58A2.25 2.25 0 0010.046 3H9.568z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
                {isEn ? "Brand Approvals" : "Persetujuan Brand"}
              </span>
              {pendingBrands > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-[#1A1A1A] text-[#FAF9F6] border border-[#2E2E2E]">
                  {pendingBrands}
                </span>
              )}
            </Link>

            <Link href="/admin/approvals/products" onClick={() => setMobileMenuOpen(false)} className={getLinkClass("/admin/approvals/products")}>
              <span className="flex items-center gap-2.5">
                <svg className={getIconClass("/admin/approvals/products")} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
                {isEn ? "Product Approvals" : "Persetujuan Produk"}
              </span>
              {pendingProducts > 0 && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-[#1A1A1A] text-[#FAF9F6] border border-[#2E2E2E]">
                  {pendingProducts}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Content Management */}
        <div>
          <h2 className="text-[9px] font-mono font-bold text-[#52525B] uppercase tracking-widest mb-1.5 px-3">
            {isEn ? "Visuals & Promos" : "Tampilan & Promosi"}
          </h2>
          <div className="flex flex-col space-y-0.5">
            <Link href="/admin/banners" onClick={() => setMobileMenuOpen(false)} className={getLinkClass("/admin/banners")}>
              <span className="flex items-center gap-2.5">
                <svg className={getIconClass("/admin/banners")} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                {isEn ? "Hero Banners & Promos" : "Banner & Promo"}
              </span>
            </Link>
          </div>
        </div>

        {/* Logistics & Tracking */}
        <div>
          <h2 className="text-[9px] font-mono font-bold text-[#52525B] uppercase tracking-widest mb-1.5 px-3">
            {isEn ? "Logistics & Fleets" : "Pengiriman & Ekspedisi"}
          </h2>
          <div className="flex flex-col space-y-0.5">
            <Link href="/admin/logistics/tracking" onClick={() => setMobileMenuOpen(false)} className={getLinkClass("/admin/logistics/tracking")}>
              <span className="flex items-center gap-2.5">
                <svg className={getIconClass("/admin/logistics/tracking")} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V16.5m0-9h-7.5a2.25 2.25 0 00-2.25 2.25v6.75" />
                </svg>
                {isEn ? "Shipment Tracking" : "Lacak Pengiriman"}
              </span>
            </Link>
            <Link href="/admin/logistics/couriers" onClick={() => setMobileMenuOpen(false)} className={getLinkClass("/admin/logistics/couriers")}>
              <span className="flex items-center gap-2.5">
                <svg className={getIconClass("/admin/logistics/couriers")} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isEn ? "Couriers & Rates" : "Daftar Ekspedisi & Ongkir"}
              </span>
            </Link>
          </div>
        </div>

        {/* System Ledger & Registry */}
        <div>
          <h2 className="text-[9px] font-mono font-bold text-[#52525B] uppercase tracking-widest mb-1.5 px-3">
            {isEn ? "Finance & Users" : "Keuangan & Pengguna"}
          </h2>
          <div className="flex flex-col space-y-0.5">
            <Link href="/admin/transactions" onClick={() => setMobileMenuOpen(false)} className={getLinkClass("/admin/transactions")}>
              <span className="flex items-center gap-2.5">
                <svg className={getIconClass("/admin/transactions")} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
                {isEn ? "Escrow & Disputes" : "Rekening Bersama & Komplain"}
              </span>
            </Link>
            <Link href="/admin/users" onClick={() => setMobileMenuOpen(false)} className={getLinkClass("/admin/users")}>
              <span className="flex items-center gap-2.5">
                <svg className={getIconClass("/admin/users")} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                {isEn ? "User Directory" : "Daftar Pengguna"}
              </span>
            </Link>
            <Link href="/admin/config/catalog" onClick={() => setMobileMenuOpen(false)} className={getLinkClass("/admin/config/catalog")}>
              <span className="flex items-center gap-2.5">
                <svg className={getIconClass("/admin/config/catalog")} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                </svg>
                {isEn ? "Product Categories" : "Kategori Produk"}
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Admin User Footer */}
      <div className="p-4 border-t border-[#1E1E1E] bg-[#0A0A0A]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#1C1C1C] text-[#FAF9F6] border border-[#2E2E2E] font-mono font-bold text-xs flex items-center justify-center shadow-sm">
            SA
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#FAF9F6] truncate">Super Admin</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] font-mono text-[#71717A]">
                {isEn ? "Full Access Level" : "Hak Akses Penuh"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-[#090909] text-[#FAF9F6] font-sans selection:bg-white selection:text-black flex flex-col md:flex-row">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[260px] bg-[#0D0D0D] border-r border-[#1E1E1E] min-h-screen flex-col sticky top-0 z-30 shrink-0">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden flex"
          >
            <motion.div 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="w-[280px] bg-[#0D0D0D] border-r border-[#1E1E1E] h-full flex flex-col"
            >
              {navContent}
            </motion.div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 w-full min-h-screen flex flex-col relative z-10">
        
        {/* Top Header */}
        <header className="h-14 flex items-center px-4 sm:px-6 justify-between sticky top-0 z-20 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-[#1E1E1E] gap-4">
          
          {/* Mobile hamburger & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-md hover:bg-white/5 text-[#A1A1AA] hover:text-white cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Mobile quick search button */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="md:hidden p-1.5 rounded-md hover:bg-white/5 text-[#A1A1AA] hover:text-white cursor-pointer"
              title={isEn ? "Search admin menu" : "Cari menu admin"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Breadcrumb Trail */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-[#71717A]">
              {breadcrumbs.map((crumb, idx) => (
                <span key={`crumb-${crumb.path}-${crumb.label}-${idx}`} className="flex items-center gap-1.5">
                  {idx > 0 && <span className="text-[#3F3F46]">/</span>}
                  <Link 
                    href={crumb.path}
                    className={`hover:text-[#FAF9F6] transition-colors ${
                      idx === breadcrumbs.length - 1 ? "text-[#FAF9F6] font-semibold" : "text-[#71717A]"
                    }`}
                  >
                    {crumb.label}
                  </Link>
                </span>
              ))}
            </nav>
          </div>

          {/* Center Search / Command palette trigger (Desktop) */}
          <div 
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex-1 max-w-md relative hidden md:flex items-center bg-[#141414] hover:bg-[#181818] border border-[#262626] hover:border-[#3E3E3E] rounded-lg px-3.5 py-1.5 cursor-pointer transition-all group shadow-sm"
          >
            <svg className="w-3.5 h-3.5 text-[#71717A] group-hover:text-[#FAF9F6] transition-colors shrink-0 mr-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs font-sans text-[#71717A] group-hover:text-[#AAA] transition-colors flex-1 truncate">
              {isEn ? "Search admin menu, stores, IEMs..." : "Cari menu admin, toko, produk IEM..."}
            </span>
            <div className="flex items-center gap-1 shrink-0 pointer-events-none">
              <kbd className="text-[10px] font-mono text-[#71717A] group-hover:text-[#FAF9F6] bg-[#1E1E1E] px-1.5 py-0.5 rounded border border-[#2E2E2E] transition-colors">
                Ctrl K
              </kbd>
            </div>
          </div>

          {/* Right System Health, Language & Exit */}
          <div className="flex items-center gap-3 ml-auto">
             {/* Language Switcher Pill */}
             <div className="flex items-center bg-[#141414] border border-[#262626] rounded-full p-0.5 text-[10px] font-mono shadow-sm">
                <button
                  type="button"
                  onClick={() => setLanguage("English")}
                  className={`px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                    language === "English"
                      ? "bg-[#282828] text-[#FAF9F6] border border-[#3E3E3E] shadow-sm"
                      : "text-[#888] hover:text-[#FAF9F6] border border-transparent"
                  }`}
                  title="Switch to English"
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("Bahasa Indonesia")}
                  className={`px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                    language === "Bahasa Indonesia"
                      ? "bg-[#282828] text-[#FAF9F6] border border-[#3E3E3E] shadow-sm"
                      : "text-[#8E8E93] hover:text-[#FAF9F6] border border-transparent"
                  }`}
                  title="Ganti ke Bahasa Indonesia"
                >
                  ID
                </button>
             </div>

             <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-[#141414] border border-[#222]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-mono text-[#A1A1AA]">
                  {language === "English" ? "System Normal • 14ms" : "Sistem Normal • 14ms"}
                </span>
             </div>

             <Link 
               href="/" 
               className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#A1A1AA] hover:text-[#FAF9F6] bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] transition-colors px-3 py-1.5 rounded-md cursor-pointer"
             >
               <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
               </svg>
               {language === "English" ? "Storefront" : "Lihat Toko"}
             </Link>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-grow p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="max-w-[1500px] mx-auto h-full">
            {children}
          </div>
        </div>

        {/* Global Admin Command Palette (GitHub / Vercel style) */}
        <AdminCommandPalette 
          isOpen={isCommandPaletteOpen} 
          onClose={() => setIsCommandPaletteOpen(false)} 
        />
      </main>
    </div>
  );
}
