"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState, useEffect, useCallback } from "react";
import { AdminDataProvider, useAdminData } from "@/context/AdminDataContext";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { motion, AnimatePresence } from "framer-motion";
import AdminCommandPalette from "@/components/admin/AdminCommandPalette";
import { signOutUser } from "@/app/actions/auth";
import { broadcastRealtime, subscribeRealtime } from "@/lib/realtime-bus";

function AdminLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { stores, brands, products } = useAdminData();
  const { language, setLanguage } = useLanguage();
  const { currency, setCurrency } = useLocation();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Admin session & logout state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [adminUser, setAdminUser] = useState<{
    name: string;
    email: string;
    avatar?: string;
  }>({
    name: "Super Admin",
    email: "admin@tonalzone.id",
    avatar: "",
  });

  const checkAdminAuth = useCallback(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("tonalzone_user");
    if (!stored) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    try {
      const u = JSON.parse(stored);
      setAdminUser({
        name: u.name || "Super Admin",
        email: u.email || "admin@tonalzone.id",
        avatar: u.avatar || "",
      });
      const isElevated = u.email && (u.email.toLowerCase().includes("valenandra") || u.email.toLowerCase().includes("admin"));
      if (u.role !== "ADMIN" && !isElevated) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    } catch {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router]);

  useEffect(() => {
    setMounted(true);
    checkAdminAuth();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // 1. Cross-tab logout listener via Universal Realtime Bus (< 1ms delivery)
    const unsubAuth = subscribeRealtime("AUTH", (data) => {
      if (data?.action === "LOGOUT") {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    });

    // 2. Cross-tab logout listener via native storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "tonalzone_user" && !e.newValue) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
      if (e.key === "tonalzone_logout_timestamp") {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("userLoginChange", checkAdminAuth);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      unsubAuth();
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("userLoginChange", checkAdminAuth);
    };
  }, [checkAdminAuth, pathname, router]);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOutUser();
    } catch (err) {
      console.error("Sign out error:", err);
    }
    localStorage.removeItem("tonalzone_user");
    localStorage.setItem("tonalzone_logout_timestamp", Date.now().toString());

    // Broadcast instant logout across all other open tabs
    broadcastRealtime("AUTH", { action: "LOGOUT", role: "admin", timestamp: Date.now() });

    window.dispatchEvent(new Event("userLoginChange"));
    setIsLoggingOut(false);
    setIsLogoutModalOpen(false);
    router.replace("/login");
  };

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
    } else if (parts[1] === "vouchers") {
      breadcrumbs.push({ label: isEn ? "Redeem Codes & Vouchers" : "Kode Redeem & Voucher", path: "/admin/vouchers" });
    } else if (parts[1] === "logistics") {
      breadcrumbs.push({ label: isEn ? "Shipments" : "Pengiriman", path: "/admin/logistics/tracking" });
      if (parts[2] === "tracking") breadcrumbs.push({ label: isEn ? "Shipment Tracking" : "Lacak Pengiriman", path: "/admin/logistics/tracking" });
      if (parts[2] === "couriers") breadcrumbs.push({ label: isEn ? "Couriers & Fleets" : "Daftar Ekspedisi", path: "/admin/logistics/couriers" });
    } else if (parts[1] === "users") {
      breadcrumbs.push({ label: isEn ? "User Directory" : "Daftar Pengguna", path: "/admin/users" });
    } else if (parts[1] === "transactions") {
      breadcrumbs.push({ label: isEn ? "Escrow & Settlements" : "Rekening Bersama", path: "/admin/transactions" });
    } else if (parts[1] === "reports") {
      breadcrumbs.push({ label: isEn ? "Financial Reports" : "Laporan Finansial", path: "/admin/reports" });
    } else if (parts[1] === "logs") {
      breadcrumbs.push({ label: isEn ? "Audit Trail & Logs" : "Log Aktivitas Admin", path: "/admin/logs" });
    } else if (parts[1] === "config") {
      if (parts[2] === "system") {
        breadcrumbs.push({ label: isEn ? "System Settings" : "Pengaturan Sistem", path: "/admin/config/system" });
      } else if (parts[2] === "content") {
        breadcrumbs.push({ label: isEn ? "Content Policy" : "Kebijakan Konten", path: "/admin/config/content" });
      } else {
        breadcrumbs.push({ label: isEn ? "Categories" : "Kategori Produk", path: "/admin/config/catalog" });
      }
    } else if (parts[1] === "support") {
      breadcrumbs.push({ label: isEn ? "Customer Support" : "Layanan Pelanggan (CS)", path: "/admin/support" });
    }
    return breadcrumbs;
  };

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `group flex items-center justify-between px-3.5 py-2.5 text-xs font-sans rounded-xl transition-all duration-150 ${
      isActive
        ? "bg-[#141414] text-[#FAF9F6] font-semibold shadow-sm"
        : "text-[#8E8E93] hover:bg-[#0E0E0E] hover:text-[#FAF9F6]"
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
      <div className="p-5 flex items-center justify-between bg-[#060606]">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
          <div className="w-8 h-8 rounded-xl bg-[#141414] text-[#FAF9F6] flex items-center justify-center font-mono font-black text-xs shadow-sm">
            TZ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold text-[#FAF9F6] tracking-wider uppercase font-mono">
                Tonal Zone
              </h1>
              <span className="text-[9px] font-mono font-bold bg-[#141F17] text-[#BFDD25] px-2 py-0.5 rounded-full">
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
          <div className="flex flex-col space-y-1">
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
          </div>
          <div className="flex flex-col space-y-1">
            <Link href="/admin/approvals/sellers" onClick={() => setMobileMenuOpen(false)} className={getLinkClass("/admin/approvals/sellers")}>
              <span className="flex items-center gap-2.5">
                <svg className={getIconClass("/admin/approvals/sellers")} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                {isEn ? "Store Verification" : "Verifikasi Toko & Penjual"}
              </span>
              {pendingStores > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#141F17] text-[#BFDD25]">
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
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#141F17] text-[#BFDD25]">
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
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#141F17] text-[#BFDD25]">
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
          <div className="flex flex-col space-y-1">
            <Link href="/admin/banners" onClick={() => setMobileMenuOpen(false)} className={getLinkClass("/admin/banners")}>
              <span className="flex items-center gap-2.5">
                <svg className={getIconClass("/admin/banners")} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                {isEn ? "Hero Banners & Promos" : "Banner & Promo"}
              </span>
            </Link>
            <Link href="/admin/vouchers" onClick={() => setMobileMenuOpen(false)} className={getLinkClass("/admin/vouchers")}>
              <span className="flex items-center gap-2.5">
                <svg className={getIconClass("/admin/vouchers")} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                </svg>
                {isEn ? "Redeem Codes & Vouchers" : "Kode Redeem & Voucher"}
              </span>
            </Link>
          </div>
        </div>

        {/* Logistics & Tracking */}
        <div>
          <h2 className="text-[9px] font-mono font-bold text-[#52525B] uppercase tracking-widest mb-1.5 px-3">
            {isEn ? "Logistics & Fleets" : "Pengiriman & Ekspedisi"}
          </h2>
          <div className="flex flex-col space-y-1">
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
          <div className="flex flex-col space-y-1">
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
            <Link href="/admin/reports" onClick={() => setMobileMenuOpen(false)} className={getLinkClass("/admin/reports")}>
              <span className="flex items-center gap-2.5">
                <svg className={getIconClass("/admin/reports")} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                {isEn ? "Financial & Export Reports" : "Laporan & Ekspor CSV"}
              </span>
            </Link>
            <Link href="/admin/support" onClick={() => setMobileMenuOpen(false)} className={getLinkClass("/admin/support")}>
              <span className="flex items-center gap-2.5">
                <svg className={getIconClass("/admin/support")} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-.874-.954 5.485 5.485 0 00.867-2.147C3.903 16.275 3 14.24 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                {isEn ? "Customer Service" : "Layanan CS / Bantuan"}
              </span>
            </Link>
          </div>
        </div>

        {/* Platform & Governance */}
        <div>
          <h2 className="text-[9px] font-mono font-bold text-[#52525B] uppercase tracking-widest mb-1.5 px-3">
            {isEn ? "Platform & System" : "Konfigurasi & Sistem"}
          </h2>
          <div className="flex flex-col space-y-1">
            <Link href="/admin/config/system" onClick={() => setMobileMenuOpen(false)} className={getLinkClass("/admin/config/system")}>
              <span className="flex items-center gap-2.5">
                <svg className={getIconClass("/admin/config/system")} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.27.1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.27-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {isEn ? "System & Escrow Settings" : "Pengaturan Sistem & Rekber"}
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
            <Link href="/admin/config/content" onClick={() => setMobileMenuOpen(false)} className={getLinkClass("/admin/config/content")}>
              <span className="flex items-center gap-2.5">
                <svg className={getIconClass("/admin/config/content")} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                {isEn ? "Content & Anti-KW Policy" : "Kebijakan Konten & Anti-KW"}
              </span>
            </Link>
            <Link href="/admin/logs" onClick={() => setMobileMenuOpen(false)} className={getLinkClass("/admin/logs")}>
              <span className="flex items-center gap-2.5">
                <svg className={getIconClass("/admin/logs")} fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isEn ? "Audit Trail & Logs" : "Log Aktivitas Admin"}
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Admin User Footer */}
      <div className="p-3 bg-[#060606] border-t border-[#141414]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#0A0A0A] hover:bg-[#101010] transition-colors group">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#141414] text-[#FAF9F6] font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-[#222] overflow-hidden">
              {adminUser.avatar ? (
                <img src={adminUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                adminUser.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#FAF9F6] truncate">{adminUser.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-mono text-[#71717A] truncate">
                  {adminUser.email}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="p-1.5 rounded-lg text-[#71717A] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0 ml-1.5"
            title={isEn ? "Log Out of Admin" : "Keluar dari Dashboard Admin"}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-[#000000] text-[#FAF9F6] font-sans selection:bg-[#141414] selection:text-[#FAF9F6] flex flex-col md:flex-row">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[260px] bg-[#060606] min-h-screen flex-col sticky top-0 z-30 shrink-0">
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
              className="w-[280px] bg-[#060606] h-full flex flex-col"
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
        <header className="h-14 flex items-center px-4 sm:px-6 justify-between sticky top-0 z-20 bg-[#000000]/80 backdrop-blur-md gap-4">
          
          {/* Mobile hamburger & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-xl hover:bg-white/5 text-[#A1A1AA] hover:text-white cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Mobile quick search button */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="md:hidden p-1.5 rounded-xl hover:bg-white/5 text-[#A1A1AA] hover:text-white cursor-pointer"
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
            className="flex-1 max-w-md relative hidden md:flex items-center bg-[#0E0E0E] hover:bg-[#141414] rounded-xl px-4 py-2 cursor-pointer transition-all group shadow-sm"
          >
            <svg className="w-3.5 h-3.5 text-[#71717A] group-hover:text-[#FAF9F6] transition-colors shrink-0 mr-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs font-sans text-[#71717A] group-hover:text-[#AAA] transition-colors flex-1 truncate">
              {isEn ? "Search admin menu, stores, IEMs..." : "Cari menu admin, toko, produk IEM..."}
            </span>
            <div className="flex items-center gap-1 shrink-0 pointer-events-none">
              <kbd className="text-[10px] font-mono text-[#71717A] group-hover:text-[#FAF9F6] bg-[#181818] px-2 py-0.5 rounded-lg transition-colors">
                Ctrl K
              </kbd>
            </div>
          </div>

          {/* Right System Health, Language & Exit */}
          <div className="flex items-center gap-3 ml-auto">
             {/* Currency Switcher Pill (Standard Rupiah IDR) */}
             <div className="flex items-center bg-[#0E0E0E] rounded-full p-0.5 text-xs font-mono font-medium shadow-sm">
                <button
                  type="button"
                  onClick={() => setCurrency("IDR")}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    currency === "IDR"
                      ? "bg-[#1E1E1E] text-[#BFDD25] shadow-sm"
                      : "text-[#888] hover:text-[#FAF9F6]"
                  }`}
                  title="Standar Rupiah (Rp)"
                >
                  IDR
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    currency === "USD"
                      ? "bg-[#1E1E1E] text-white shadow-sm"
                      : "text-[#8E8E93] hover:text-[#FAF9F6]"
                  }`}
                  title="US Dollar ($)"
                >
                  USD
                </button>
             </div>

             {/* Language Switcher Pill */}
             <div className="flex items-center bg-[#0E0E0E] rounded-full p-0.5 text-xs font-mono font-medium shadow-sm">
                <button
                  type="button"
                  onClick={() => setLanguage("English")}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    language === "English"
                      ? "bg-[#1E1E1E] text-[#FAF9F6] shadow-sm"
                      : "text-[#888] hover:text-[#FAF9F6]"
                  }`}
                  title="Switch to English"
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("Bahasa Indonesia")}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    language === "Bahasa Indonesia"
                      ? "bg-[#1E1E1E] text-[#FAF9F6] shadow-sm"
                      : "text-[#8E8E93] hover:text-[#FAF9F6]"
                  }`}
                  title="Ganti ke Bahasa Indonesia"
                >
                  ID
                </button>
             </div>

             <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0E0E0E]">
                <span className="text-[10px] font-mono text-[#A1A1AA]">
                  {language === "English" ? "System Normal • 14ms" : "Sistem Normal • 14ms"}
                </span>
             </div>

             <Link 
               href="/" 
               className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#A1A1AA] hover:text-[#FAF9F6] bg-[#0E0E0E] hover:bg-[#141414] transition-colors px-3.5 py-1.5 rounded-full cursor-pointer"
             >
               <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
               </svg>
               <span className="hidden sm:inline">{language === "English" ? "Storefront" : "Lihat Toko"}</span>
             </Link>

             {/* Logout Button (Quick access in header) */}
             <button 
               type="button"
               onClick={() => setIsLogoutModalOpen(true)}
               className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#8E8E93] hover:text-rose-400 bg-[#0E0E0E] hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all px-3.5 py-1.5 rounded-full cursor-pointer"
               title={isEn ? "Log Out of Admin" : "Keluar dari Admin"}
             >
               <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
               </svg>
               <span>{isEn ? "Log Out" : "Keluar"}</span>
             </button>
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

        {/* Logout Confirmation Modal */}
        <AnimatePresence>
          {isLogoutModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isLoggingOut && setIsLogoutModalOpen(false)}
                className="fixed inset-0 bg-black/85 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-sm rounded-2xl bg-[#0A0A0A] border border-[#222222] p-6 shadow-2xl z-10"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white font-sans truncate">
                      {isEn ? "Log Out from Admin?" : "Keluar dari Dashboard Admin?"}
                    </h3>
                    <p className="text-[11px] font-mono text-[#8E8E93] truncate mt-0.5">
                      {adminUser.email}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[#A1A1AA] leading-relaxed mb-6 font-sans">
                  {isEn
                    ? "You will be signed out from your admin session. Any other open tabs will also synchronize and log out automatically."
                    : "Sesi administrator Anda akan diakhiri. Seluruh tab lain yang sedang membuka dashboard admin di browser ini akan otomatis keluar secara bersamaan."}
                </p>

                <div className="flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    disabled={isLoggingOut}
                    onClick={() => setIsLogoutModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-mono font-medium text-[#A1A1AA] hover:text-white bg-[#141414] hover:bg-[#1E1E1E] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isEn ? "Cancel" : "Batal"}
                  </button>
                  <button
                    type="button"
                    disabled={isLoggingOut}
                    onClick={handleConfirmLogout}
                    className="px-4 py-2 rounded-xl text-xs font-mono font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isLoggingOut ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{isEn ? "Logging out..." : "Mengeluarkan..."}</span>
                      </>
                    ) : (
                      <span>{isEn ? "Yes, Log Out" : "Ya, Keluar"}</span>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminDataProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminDataProvider>
  );
}
