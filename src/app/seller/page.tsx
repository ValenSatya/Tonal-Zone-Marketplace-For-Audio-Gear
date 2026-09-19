"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AreaChart } from "@/components/charts/area-chart";
import { Area } from "@/components/charts/area";
import { useLanguage } from "@/context/LanguageContext";
import { useAdminData } from "@/context/AdminDataContext";
import { KeyboardArrowRight } from "@/components/ui/keyboard-arrow";

export default function SellerOverviewPage() {
  const { language } = useLanguage();
  const isEn = language === "English";

  const [mounted, setMounted] = useState(false);
  const [currency, setCurrency] = useState<"IDR" | "USD">("IDR");
  const [sellerMode, setSellerMode] = useState<"RETAIL_MERCHANT" | "OFFICIAL_BRAND">("RETAIL_MERCHANT");
  const [catalogUnits, setCatalogUnits] = useState(0);
  const [storeOrders, setStoreOrders] = useState<any[]>([]);
  const [storeRevenue, setStoreRevenue] = useState(0);
  const [escrowBalance, setEscrowBalance] = useState(0);

  const [storeData, setStoreData] = useState({
    storeName: "Toko Saya",
    ownerName: "Alexander Rivera",
    brandFocus: "Katalog Audiophile & Perlengkapan Audio Profesional",
    status: "APPROVED",
    storeAvatar: "",
  });

  const loadUserData = async () => {
    const stored = localStorage.getItem("tonalzone_user");
    const savedCurrency = localStorage.getItem("tonalzone_seller_currency") as "IDR" | "USD" | null;
    const savedMode = localStorage.getItem("tonalzone_seller_mode") as "RETAIL_MERCHANT" | "OFFICIAL_BRAND" | null;

    if (savedCurrency) setCurrency(savedCurrency);
    if (savedMode) setSellerMode(savedMode);

    if (stored) {
      try {
        const u = JSON.parse(stored);
        setStoreData({
          storeName: u.storeName || (u.name ? `Toko ${u.name}` : "Toko Saya"),
          ownerName: u.name || "Alexander Rivera",
          brandFocus: u.brandFocus || "Katalog Audiophile & Perlengkapan Audio Profesional",
          status: u.sellerStatus || (u.isSeller ? "APPROVED" : "APPROVED"),
          storeAvatar: u.storeAvatar || "",
        });
      } catch (e) {}
    }

    let storeIdParam = "";
    let emailParam = "";

    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u.storeId) storeIdParam = u.storeId;
        if (u.email) emailParam = u.email;
        setStoreData({
          storeName: u.storeName || (u.name ? `Toko ${u.name}` : "Toko Saya"),
          ownerName: u.name || "Alexander Rivera",
          brandFocus: u.brandFocus || "Katalog Audiophile & Perlengkapan Audio Profesional",
          status: u.sellerStatus || (u.isSeller ? "APPROVED" : "APPROVED"),
          storeAvatar: u.storeAvatar || "",
        });
      } catch (e) {}
    }

    const currentMode = savedMode || "RETAIL_MERCHANT";
    if (!storeIdParam && currentMode === "OFFICIAL_BRAND") {
      storeIdParam = "store-moondrop-official";
    }

    const query = new URLSearchParams();
    if (storeIdParam) query.set("storeId", storeIdParam);
    if (emailParam) query.set("email", emailParam);
    const queryString = query.toString() ? `?${query.toString()}` : "";

    // Live sync from Seller Orders API
    try {
      const ordersRes = await fetch(`/api/seller/orders${queryString}`);
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (ordersData && ordersData.success && Array.isArray(ordersData.orders)) {
          setStoreOrders(ordersData.orders);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch live seller orders in overview:", e);
    }

    // Live sync from Seller Products API
    try {
      const prodRes = await fetch(`/api/seller/products${queryString}`);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (prodData && prodData.success && Array.isArray(prodData.products)) {
          setCatalogUnits(prodData.products.length);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch products count:", e);
    }

    // Live sync from Seller Payouts API
    try {
      const payoutsRes = await fetch(`/api/seller/payouts${queryString}`);
      if (payoutsRes.ok) {
        const payoutsData = await payoutsRes.json();
        if (payoutsData && payoutsData.success) {
          const rev = (payoutsData.availableUSD || 0) + (payoutsData.lifetimeUSD || 0);
          setStoreRevenue(rev);
          setEscrowBalance(payoutsData.inEscrowUSD || 0);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch live seller payouts in overview:", e);
    }

    // Fallback to local storage if API is unreachable
    if (currentMode === "OFFICIAL_BRAND") {
      setCatalogUnits((prev) => prev || 4);
      setStoreRevenue(24850);
      setEscrowBalance(3420);
    } else {
      const custom = localStorage.getItem("tonalzone_custom_products");
      const customList = custom ? JSON.parse(custom) : [];
      setCatalogUnits(customList.length);

      const savedOrders = localStorage.getItem("tonalzone_seller_orders");
      const ordersList = savedOrders ? JSON.parse(savedOrders) : [];
      if (ordersList.length > 0) setStoreOrders(ordersList);

      const savedBal = localStorage.getItem("tonalzone_seller_balance");
      if (savedBal) {
        try {
          const balObj = JSON.parse(savedBal);
          setStoreRevenue(balObj.totalRevenue || 0);
          setEscrowBalance(balObj.escrow || 0);
        } catch (e) {}
      } else {
        setStoreRevenue(0);
        setEscrowBalance(0);
      }
    }
  };

  useEffect(() => {
    setMounted(true);
    loadUserData();

    window.addEventListener("storage", loadUserData);
    return () => window.removeEventListener("storage", loadUserData);
  }, []);

  const formatPrice = (usd: number) => {
    if (currency === "IDR") {
      return `Rp ${Math.round(usd * 15500).toLocaleString("id-ID")}`;
    }
    return `$${usd.toLocaleString()}`;
  };

  const sparklineRevenue = storeRevenue > 0 ? [
    { date: "2026-08-10", val: Math.round(storeRevenue * 0.1) },
    { date: "2026-08-11", val: Math.round(storeRevenue * 0.2) },
    { date: "2026-08-12", val: Math.round(storeRevenue * 0.4) },
    { date: "2026-08-13", val: Math.round(storeRevenue * 0.6) },
    { date: "2026-08-14", val: Math.round(storeRevenue * 0.8) },
    { date: "2026-08-15", val: Math.round(storeRevenue * 0.9) },
    { date: "2026-08-16", val: storeRevenue }
  ] : [
    { date: "2026-08-10", val: 0 }, { date: "2026-08-11", val: 0 }, { date: "2026-08-12", val: 0 },
    { date: "2026-08-13", val: 0 }, { date: "2026-08-14", val: 0 }, { date: "2026-08-15", val: 0 }, { date: "2026-08-16", val: 0 }
  ];

  const sparklineOrders = storeOrders.length > 0 ? [
    { date: "2026-08-10", val: 1 }, { date: "2026-08-11", val: 1 }, { date: "2026-08-12", val: 2 },
    { date: "2026-08-13", val: 2 }, { date: "2026-08-14", val: 3 }, { date: "2026-08-15", val: 4 }, { date: "2026-08-16", val: storeOrders.length }
  ] : [
    { date: "2026-08-10", val: 0 }, { date: "2026-08-11", val: 0 }, { date: "2026-08-12", val: 0 },
    { date: "2026-08-13", val: 0 }, { date: "2026-08-14", val: 0 }, { date: "2026-08-15", val: 0 }, { date: "2026-08-16", val: 0 }
  ];

  const sparklineCatalog = [
    { date: "2026-08-10", val: 0 }, { date: "2026-08-11", val: 0 }, { date: "2026-08-12", val: 0 },
    { date: "2026-08-13", val: 0 }, { date: "2026-08-14", val: 0 }, { date: "2026-08-15", val: catalogUnits }, { date: "2026-08-16", val: catalogUnits }
  ];

  const sparklineEscrow = [
    { date: "2026-08-10", val: 0 }, { date: "2026-08-11", val: 0 }, { date: "2026-08-12", val: 0 },
    { date: "2026-08-13", val: 0 }, { date: "2026-08-14", val: 0 }, { date: "2026-08-15", val: escrowBalance }, { date: "2026-08-16", val: escrowBalance }
  ];

  return (
    <div className="space-y-6">
      {/* Header Profile & Quick Action Bar (Zero border, soft modern elevation) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-[#121212] overflow-hidden flex items-center justify-center font-mono font-bold text-sm text-white shrink-0 shadow-sm">
            {storeData.storeAvatar ? (
              <img src={storeData.storeAvatar} alt="Store Avatar" className="w-full h-full object-cover" />
            ) : (
              storeData.storeName.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-white">
                {storeData.storeName}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider bg-[#141F17] text-[#BFDD25]">
                {isEn ? "Verified Merchant" : "Penjual Terverifikasi"}
              </span>
            </div>
            <p className="text-xs font-mono text-[#8E8E93] mt-1">
              {isEn ? `Owner: ${storeData.ownerName} • ${storeData.brandFocus}` : `Pemilik: ${storeData.ownerName} • ${storeData.brandFocus}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/seller/products/new"
            className="inline-flex items-center gap-2 bg-white text-black hover:bg-[#E5E5E5] px-5 py-2.5 rounded-full text-xs font-sans font-bold transition-all shadow-md cursor-pointer"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {isEn ? "Add Product" : "Tambah Produk"}
          </Link>
          <Link
            href="/seller/products"
            className="inline-flex items-center gap-1.5 bg-[#141414] hover:bg-[#1E1E1E] text-[#D4D4D8] hover:text-white px-4 py-2.5 rounded-full text-xs font-sans font-medium transition-colors cursor-pointer"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            {isEn ? "Import CSV" : "Import CSV"}
          </Link>
          <Link
            href="/seller/payouts"
            className="inline-flex items-center gap-1.5 bg-[#141414] hover:bg-[#1E1E1E] text-[#D4D4D8] hover:text-white px-4 py-2.5 rounded-full text-xs font-sans font-medium transition-colors cursor-pointer"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isEn ? "Withdraw" : "Tarik Saldo"}
          </Link>
        </div>
      </div>

      {/* Urgent Action Needed Notification (Rounded-2xl, Zero Stroke) */}
      {storeOrders.some((o) => o.status === "TO_SHIP") && (
        <div className="bg-[#0E0E0E] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#181818] flex items-center justify-center shrink-0 text-[#BFDD25]">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-sans">
                {isEn
                  ? `${storeOrders.filter((o) => o.status === "TO_SHIP").length} Order(s) Awaiting Shipping Waybill`
                  : `${storeOrders.filter((o) => o.status === "TO_SHIP").length} Pesanan Menunggu Input Resi Pengiriman`}
              </h4>
              <p className="text-xs text-[#8E8E93] font-sans mt-0.5">
                {isEn
                  ? "Input waybill tracking numbers for active orders to process shipping and lock escrow funds."
                  : "Input nomor resi pengiriman untuk memproses pengiriman paket dan mengamankan saldo escrow."}
              </p>
            </div>
          </div>

          <Link
            href="/seller/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-[#E4E4E7] text-black text-xs font-mono font-bold uppercase tracking-wider rounded-full transition-all shrink-0 shadow-md"
          >
            <span>{isEn ? "Process Order" : "Proses Sekarang"}</span>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>
      )}

      {/* KPI Cards Grid (Rounded-2xl, Zero Stroke, Soft Dark Elevation) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Net Revenue */}
        <div className="bg-[#0A0A0A] hover:bg-[#0D0D0D] transition-all p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block">
                {isEn ? "Net Revenue" : "Pendapatan Bersih"}
              </span>
              <p className="text-2xl font-bold font-mono text-white mt-1.5">
                {formatPrice(storeRevenue)}
              </p>
            </div>
            <div className="w-16 h-8 shrink-0 opacity-90">
              <AreaChart data={sparklineRevenue} aspectRatio="2 / 1" className="w-full h-full">
                <Area dataKey="val" stroke="#BFDD25" fill="#BFDD25" strokeWidth={1.75} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-[#71717A]">
            <span className="text-[#BFDD25] font-semibold">{storeRevenue > 0 ? "+14.2%" : "0%"}</span>
            <span>{isEn ? "vs last month" : "vs bulan lalu"}</span>
          </div>
        </div>

        {/* Card 2: Active Orders */}
        <div className="bg-[#0A0A0A] hover:bg-[#0D0D0D] transition-all p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block">
                {isEn ? "Total Orders" : "Total Pesanan"}
              </span>
              <p className="text-2xl font-bold font-mono text-white mt-1.5">
                {storeOrders.length} <span className="text-xs font-normal text-[#71717A]">{isEn ? "Orders" : "Pesanan"}</span>
              </p>
            </div>
            <div className="w-16 h-8 shrink-0 opacity-80">
              <AreaChart data={sparklineOrders} aspectRatio="2 / 1" className="w-full h-full">
                <Area dataKey="val" stroke="#ffffff" fill="#ffffff" strokeWidth={1.75} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-[#71717A]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-amber-400 font-semibold">
              {storeOrders.filter((o) => o.status === "TO_SHIP").length} {isEn ? "to ship" : "perlu kirim"}
            </span>
            <span>• {storeOrders.filter((o) => o.status === "IN_TRANSIT").length} {isEn ? "in transit" : "dikirim"}</span>
          </div>
        </div>

        {/* Card 3: Active Audio Catalog */}
        <div className="bg-[#0A0A0A] hover:bg-[#0D0D0D] transition-all p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block">
                {isEn ? "Active Catalog" : "Katalog Aktif"}
              </span>
              <p className="text-2xl font-bold font-mono text-white mt-1.5">
                {catalogUnits} <span className="text-xs font-normal text-[#71717A]">{isEn ? "SKUs" : "Produk"}</span>
              </p>
            </div>
            <div className="w-16 h-8 shrink-0 opacity-80">
              <AreaChart data={sparklineCatalog} aspectRatio="2 / 1" className="w-full h-full">
                <Area dataKey="val" stroke="#A1A1AA" fill="#A1A1AA" strokeWidth={1.75} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-[#71717A]">
            <span>{catalogUnits > 0 ? (isEn ? "Ready in stock" : "Siap dipesan") : (isEn ? "No items listed" : "Belum ada produk")}</span>
          </div>
        </div>

        {/* Card 4: Wallet & Escrow */}
        <div className="bg-[#0A0A0A] hover:bg-[#0D0D0D] transition-all p-5 sm:p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block">
                {isEn ? "Available Balance" : "Saldo Siap Tarik"}
              </span>
              <p className="text-2xl font-bold font-mono text-white mt-1.5">
                {formatPrice(storeRevenue)}
              </p>
            </div>
            <div className="w-16 h-8 shrink-0 opacity-80">
              <AreaChart data={sparklineEscrow} aspectRatio="2 / 1" className="w-full h-full">
                <Area dataKey="val" stroke="#E4E4E7" fill="#E4E4E7" strokeWidth={1.75} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-[#71717A]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{formatPrice(escrowBalance)} {isEn ? "in escrow protection" : "dalam proteksi escrow"}</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Orders & Top Stock (Rounded-2xl, Zero Stroke) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Left Column: Recent Orders (2 Cols) */}
        <div className="lg:col-span-2 bg-[#0A0A0A] rounded-2xl p-6 sm:p-7 flex flex-col space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
                {isEn ? "Recent Store Orders" : "Pesanan Terbaru Toko"}
              </h3>
            </div>
            <Link
              href="/seller/orders"
              className="px-3 py-1.5 rounded-full bg-[#141414] hover:bg-[#1E1E1E] text-[11px] font-mono text-[#A1A1AA] hover:text-white transition-all inline-flex items-center gap-1 group"
            >
              <span>{isEn ? "View All Orders" : "Lihat Semua Pesanan"}</span>
              <KeyboardArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="text-[10px] font-mono uppercase text-[#71717A] tracking-wider">
                  <th className="pb-3 pr-4 font-semibold">{isEn ? "Order & Buyer" : "Pesanan & Pembeli"}</th>
                  <th className="pb-3 px-4 font-semibold">{isEn ? "Product" : "Produk"}</th>
                  <th className="pb-3 px-4 text-right font-semibold">{isEn ? "Total" : "Total"}</th>
                  <th className="pb-3 px-4 text-center font-semibold">{isEn ? "Status" : "Status"}</th>
                  <th className="pb-3 pl-4 text-right font-semibold">{isEn ? "Action" : "Aksi"}</th>
                </tr>
              </thead>
              <tbody className="space-y-1">
                {storeOrders.length > 0 ? (
                  storeOrders.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-[#121212] transition-colors rounded-xl">
                      <td className="py-4 pr-4">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-white text-xs">{ord.id}</span>
                          <span className="text-[11px] text-[#71717A] mt-0.5">{ord.buyer || ord.buyerName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col max-w-[200px]">
                          <span className="font-medium text-white truncate">{ord.product || ord.productName}</span>
                          <span className="text-[10px] font-mono text-[#71717A] mt-0.5">{ord.courier}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-white">
                        {ord.amount || formatPrice(ord.totalPriceUSD || 0)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider bg-[#141414] text-[#D4D4D8]">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            ord.status === "DELIVERED" || ord.status === "COMPLETED"
                              ? "bg-[#BFDD25] shadow-[0_0_6px_rgba(191,221,37,0.6)]"
                              : ord.status === "IN_TRANSIT"
                              ? "bg-white"
                              : "bg-amber-400"
                          }`} />
                          {ord.status === "TO_SHIP"
                            ? isEn ? "To Ship" : "Perlu Kirim"
                            : ord.status === "IN_TRANSIT"
                            ? isEn ? "In Transit" : "Dikirim"
                            : isEn ? "Completed" : "Selesai"}
                        </span>
                      </td>
                      <td className="py-4 pl-4 text-right">
                        <Link
                          href="/seller/orders"
                          className="px-3.5 py-1.5 bg-[#181818] hover:bg-[#222222] text-white text-[11px] font-mono font-medium rounded-full transition-colors inline-block"
                        >
                          {ord.status === "TO_SHIP" ? (isEn ? "Input Waybill" : "Input Resi") : isEn ? "Details" : "Rincian"}
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs font-mono text-[#71717A]">
                      <p className="text-white font-medium text-xs font-sans">
                        {isEn ? "No Orders Received Yet" : "Belum Ada Pesanan Masuk"}
                      </p>
                      <p className="text-[11px] text-[#52525B] mt-1">
                        {isEn
                          ? "New customer purchases will appear here in real-time."
                          : "Pesanan baru dari pembeli akan muncul di sini secara real-time."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Top Products & Stock Watch */}
        <div className="bg-[#0A0A0A] rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
              {isEn ? "Top Stock & Inventory" : "Inventaris & Stok Terlaris"}
            </h3>
            <Link
              href="/seller/products"
              className="px-3 py-1.5 rounded-full bg-[#141414] hover:bg-[#1E1E1E] text-[11px] font-mono text-[#A1A1AA] hover:text-white transition-all inline-flex items-center gap-1 group"
            >
              <span>{isEn ? "Manage" : "Kelola"}</span>
              <KeyboardArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {catalogUnits > 0 ? (
              <div className="space-y-3">
                <div className="p-4 bg-[#121212] rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="font-semibold text-white truncate max-w-[170px]">
                      {isEn ? "Active Catalog Items" : "Total Produk Aktif"}
                    </span>
                    <span className="font-mono font-bold text-[#BFDD25]">{catalogUnits} SKU</span>
                  </div>
                  <p className="text-[10px] font-mono text-[#71717A] mt-1">
                    {isEn ? "All products listed are active for buyers." : "Semua produk terdaftar dan siap dipesan pembeli."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs font-mono text-[#71717A]">
                <p className="text-white font-medium text-xs font-sans">
                  {isEn ? "Catalog is Empty" : "Katalog Masih Kosong"}
                </p>
                <p className="text-[11px] text-[#52525B] mt-1">
                  {isEn ? "No products listed in your store yet." : "Belum ada produk yang terdaftar di toko Anda."}
                </p>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Link
              href="/seller/products/new"
              className="w-full py-3 bg-white hover:bg-[#E5E5E5] text-black text-xs font-sans font-bold rounded-full flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>{isEn ? "Upload New Product" : "Upload Produk Baru"}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
