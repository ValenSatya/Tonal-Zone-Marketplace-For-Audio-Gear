"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AreaChart } from "@/components/charts/area-chart";
import { Area } from "@/components/charts/area";
import { useLanguage } from "@/context/LanguageContext";
import { useAdminData } from "@/context/AdminDataContext";

export default function SellerOverviewPage() {
  const { language } = useLanguage();
  const { orders } = useAdminData();
  const isEn = language === "English";

  const [mounted, setMounted] = useState(false);
  const [storeData, setStoreData] = useState({
    storeName: "AudioZone Official",
    ownerName: "Alexander Rivera",
    brandFocus: "Universal Audiophile Gear & Studio Equipment",
    status: "APPROVED",
    storeAvatar: "",
  });

  const loadUserData = () => {
    const stored = localStorage.getItem("tonalzone_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setStoreData({
          storeName: u.storeName || "AudioZone Official",
          ownerName: u.name || "Alexander Rivera",
          brandFocus: u.brandFocus || "Universal Audiophile Gear & Studio Equipment",
          status: u.sellerStatus || (u.isSeller ? "APPROVED" : "APPROVED"),
          storeAvatar: u.storeAvatar || "",
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

  // Mock Sparklines with valid timestamps
  const sparklineRevenue = [
    { date: "2026-08-10", val: 1200 }, { date: "2026-08-11", val: 2100 }, { date: "2026-08-12", val: 1800 },
    { date: "2026-08-13", val: 3400 }, { date: "2026-08-14", val: 2900 }, { date: "2026-08-15", val: 4200 }, { date: "2026-08-16", val: 5600 }
  ];
  const sparklineOrders = [
    { date: "2026-08-10", val: 2 }, { date: "2026-08-11", val: 5 }, { date: "2026-08-12", val: 4 },
    { date: "2026-08-13", val: 8 }, { date: "2026-08-14", val: 6 }, { date: "2026-08-15", val: 11 }, { date: "2026-08-16", val: 9 }
  ];
  const sparklineCatalog = [
    { date: "2026-08-10", val: 6 }, { date: "2026-08-11", val: 8 }, { date: "2026-08-12", val: 11 },
    { date: "2026-08-13", val: 12 }, { date: "2026-08-14", val: 15 }, { date: "2026-08-15", val: 16 }, { date: "2026-08-16", val: 18 }
  ];
  const sparklineEscrow = [
    { date: "2026-08-10", val: 800 }, { date: "2026-08-11", val: 1400 }, { date: "2026-08-12", val: 1100 },
    { date: "2026-08-13", val: 2200 }, { date: "2026-08-14", val: 1850 }, { date: "2026-08-15", val: 2400 }, { date: "2026-08-16", val: 3100 }
  ];

  // Recent Orders for this store
  const recentOrders = [
    {
      id: "ORD-9941",
      buyer: "Budi Santoso",
      product: "Sennheiser IE 900 Flagship",
      amount: "$1,299",
      date: "2026-08-16 15:42",
      status: "TO_SHIP",
      courier: "J&T Express",
    },
    {
      id: "ORD-9938",
      buyer: "Sarah Jenkins",
      product: "64 Audio U12t Reference",
      amount: "$2,499",
      date: "2026-08-16 11:20",
      status: "IN_TRANSIT",
      courier: "DHL Express",
      waybill: "DHL-88942109",
    },
    {
      id: "ORD-9935",
      buyer: "Reza Pratama",
      product: "Moondrop Blessing 3 Hybrid",
      amount: "$319",
      date: "2026-08-15 18:05",
      status: "COMPLETED",
      courier: "JNE YES",
      waybill: "JNE-01994821",
    },
    {
      id: "ORD-9930",
      buyer: "Kenji Tanaka",
      product: "Effect Audio Ares S 4.4mm Cable",
      amount: "$249",
      date: "2026-08-15 09:30",
      status: "COMPLETED",
      courier: "SiCepat REG",
      waybill: "SCP-77401928",
    },
  ];

  // Top Inventory items
  const topProducts = [
    { name: "Sennheiser IE 900", category: "IN-EAR MONITORS", stock: 8, sold: 14, price: "$1,299" },
    { name: "Sennheiser HD 660S2", category: "HEADPHONES", stock: 5, sold: 11, price: "$599" },
    { name: "Topping DX3 Pro+ DAC", category: "DAC/AMP", stock: 12, sold: 18, price: "$199" },
    { name: "Effect Audio Ares S", category: "CABLES", stock: 6, sold: 22, price: "$279" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Profile & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E1E1E]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#1E1E1E] border border-[#333] overflow-hidden flex items-center justify-center font-mono font-bold text-sm text-white shrink-0 shadow-md">
            {storeData.storeAvatar ? (
              <img src={storeData.storeAvatar} alt="Store Avatar" className="w-full h-full object-cover" />
            ) : (
              storeData.storeName.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold font-sans tracking-tight text-white">
                {storeData.storeName}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider bg-[#161616] text-[#D4D4D8] border border-[#27272A]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                {isEn ? "Verified Merchant" : "Penjual Terverifikasi"}
              </span>
            </div>
            <p className="text-xs font-mono text-[#8E8E93] mt-0.5">
              {isEn ? `Owner: ${storeData.ownerName} • ${storeData.brandFocus}` : `Pemilik: ${storeData.ownerName} • ${storeData.brandFocus}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/seller/products/new"
            className="inline-flex items-center gap-2 bg-[#FAF9F6] text-black hover:bg-[#E5E5E5] px-3.5 py-1.5 rounded-lg text-xs font-sans font-bold transition-all shadow-sm cursor-pointer"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {isEn ? "Add Product" : "Tambah Produk"}
          </Link>
          <Link
            href="/seller/products"
            className="inline-flex items-center gap-1.5 bg-[#141414] hover:bg-[#1C1C1C] text-[#FAF9F6] border border-[#262626] hover:border-[#3E3E3E] px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            {isEn ? "Import CSV" : "Import CSV"}
          </Link>
          <Link
            href="/seller/payouts"
            className="inline-flex items-center gap-1.5 bg-[#141414] hover:bg-[#1C1C1C] text-[#FAF9F6] border border-[#262626] hover:border-[#3E3E3E] px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isEn ? "Withdraw" : "Tarik Saldo"}
          </Link>
        </div>
      </div>

      {/* Urgent Action Needed Notification */}
      <div className="bg-[#141414] border border-[#2E2E2E] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#2E2E2E] flex items-center justify-center shrink-0 text-white mt-0.5">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-sans">
              {isEn ? "1 Order Awaiting Shipping Waybill" : "1 Pesanan Menunggu Input Resi Pengiriman"}
            </h4>
            <p className="text-[11px] text-[#888] font-sans mt-0.5">
              {isEn
                ? "Order #ORD-9941 (Sennheiser IE 900) requires waybill confirmation before dispatch cutoff."
                : "Pesanan #ORD-9941 (Sennheiser IE 900) harus diinput nomor resi kurir agar tidak otomatis dibatalkan."}
            </p>
          </div>
        </div>

        <Link
          href="/seller/orders"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#222] hover:bg-[#2E2E2E] text-white text-xs font-mono font-bold rounded-lg border border-[#3E3E3E] transition-colors shrink-0"
        >
          {isEn ? "Process Order" : "Proses Sekarang"}
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Net Revenue */}
        <div className="bg-[#111111] border border-[#222222] hover:border-[#333333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888888] uppercase tracking-wider">
                {isEn ? "Net Revenue (30d)" : "Pendapatan Bersih (30h)"}
              </p>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">$24,850</p>
            </div>
            <div className="w-16 h-8 shrink-0 opacity-80">
              <AreaChart data={sparklineRevenue} aspectRatio="2 / 1" className="w-full h-full">
                <Area dataKey="val" stroke="#10b981" fill="#10b981" strokeWidth={1.5} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a] text-[11px] font-mono text-[#777777]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 font-semibold">+14.2%</span>
            <span>{isEn ? "vs last month" : "vs bulan lalu"}</span>
          </div>
        </div>

        {/* Card 2: Active Orders */}
        <div className="bg-[#111111] border border-[#222222] hover:border-[#333333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888888] uppercase tracking-wider">
                {isEn ? "Total Orders (30d)" : "Total Pesanan (30h)"}
              </p>
              <p className="text-2xl font-bold font-mono text-white mt-1">
                42 <span className="text-xs font-normal text-[#888]">{isEn ? "Orders" : "Pesanan"}</span>
              </p>
            </div>
            <div className="w-16 h-8 shrink-0 opacity-80">
              <AreaChart data={sparklineOrders} aspectRatio="2 / 1" className="w-full h-full">
                <Area dataKey="val" stroke="#ffffff" fill="#ffffff" strokeWidth={1.5} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a] text-[11px] font-mono text-[#777777]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-amber-400 font-semibold">1 {isEn ? "to ship" : "perlu dikirim"}</span>
            <span>• 1 {isEn ? "in transit" : "dikirim"}</span>
          </div>
        </div>

        {/* Card 3: Active Audio Catalog */}
        <div className="bg-[#111111] border border-[#222222] hover:border-[#333333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888888] uppercase tracking-wider">
                {isEn ? "Active Catalog" : "Katalog Aktif"}
              </p>
              <p className="text-2xl font-bold font-mono text-indigo-400 mt-1">
                18 <span className="text-xs font-normal text-[#888]">{isEn ? "SKUs" : "Produk"}</span>
              </p>
            </div>
            <div className="w-16 h-8 shrink-0 opacity-80">
              <AreaChart data={sparklineCatalog} aspectRatio="2 / 1" className="w-full h-full">
                <Area dataKey="val" stroke="#818cf8" fill="#818cf8" strokeWidth={1.5} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a] text-[11px] font-mono text-[#777777]">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>100% {isEn ? "QC Verified" : "Lolos Uji QC"}</span>
          </div>
        </div>

        {/* Card 4: Wallet & Escrow */}
        <div className="bg-[#111111] border border-[#222222] hover:border-[#333333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888888] uppercase tracking-wider">
                {isEn ? "Available Balance" : "Saldo Siap Tarik"}
              </p>
              <p className="text-2xl font-bold font-mono text-amber-400 mt-1">$4,320</p>
            </div>
            <div className="w-16 h-8 shrink-0 opacity-80">
              <AreaChart data={sparklineEscrow} aspectRatio="2 / 1" className="w-full h-full">
                <Area dataKey="val" stroke="#f59e0b" fill="#f59e0b" strokeWidth={1.5} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a] text-[11px] font-mono text-[#777777]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
            <span>{isEn ? "$1,250 pending settlement" : "$1,250 saldo tertahan (pesanan berjalan)"}</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Orders & Top Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Orders (2 Cols) */}
        <div className="lg:col-span-2 bg-[#111111] border border-[#222222] rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#1E1E1E] flex items-center justify-between bg-[#141414]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
                {isEn ? "Recent Store Orders" : "Pesanan Terbaru Toko"}
              </h3>
            </div>
            <Link
              href="/seller/orders"
              className="text-[11px] font-mono text-[#888] hover:text-white transition-colors"
            >
              {isEn ? "View All Orders →" : "Lihat Semua Pesanan →"}
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-[#1E1E1E] bg-[#0E0E0E] text-[10px] font-mono uppercase text-[#777] tracking-wider">
                  <th className="px-4 py-3">{isEn ? "Order & Buyer" : "Pesanan & Pembeli"}</th>
                  <th className="px-4 py-3">{isEn ? "Product" : "Produk"}</th>
                  <th className="px-4 py-3 text-right">{isEn ? "Total" : "Total"}</th>
                  <th className="px-4 py-3 text-center">{isEn ? "Status" : "Status"}</th>
                  <th className="px-4 py-3 text-right">{isEn ? "Action" : "Aksi"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E1E1E]">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#161616] transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-white text-xs">{ord.id}</span>
                        <span className="text-[11px] text-[#888]">{ord.buyer}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col max-w-[200px]">
                        <span className="font-medium text-white truncate">{ord.product}</span>
                        <span className="text-[10px] font-mono text-[#777]">{ord.courier}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-white">
                      {ord.amount}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider bg-[#161616] text-[#D4D4D8] border border-[#27272A]">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          ord.status === "DELIVERED" ? "bg-emerald-400" : ord.status === "IN_TRANSIT" ? "bg-white" : "bg-amber-400"
                        }`} />
                        {ord.status === "TO_SHIP"
                          ? isEn ? "To Ship" : "Perlu Kirim"
                          : ord.status === "IN_TRANSIT"
                          ? isEn ? "In Transit" : "Dikirim"
                          : isEn ? "Delivered" : "Selesai"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href="/seller/orders"
                        className="px-2.5 py-1 bg-[#1C1C1C] hover:bg-[#282828] border border-[#2E2E2E] text-white text-[11px] font-mono rounded transition-colors"
                      >
                        {ord.status === "TO_SHIP" ? (isEn ? "Input Resi" : "Input Resi") : isEn ? "Details" : "Rincian"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Top Products & Stock Watch */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#1E1E1E] flex items-center justify-between bg-[#141414]">
            <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
              {isEn ? "Top Stock & Inventory" : "Inventaris & Stok Terlaris"}
            </h3>
            <Link
              href="/seller/products"
              className="text-[11px] font-mono text-[#888] hover:text-white transition-colors"
            >
              {isEn ? "Manage →" : "Kelola →"}
            </Link>
          </div>

          <div className="p-4 space-y-4">
            {topProducts.map((prod, idx) => (
              <div key={idx} className="space-y-1.5 pb-3 border-b border-[#1A1A1A] last:border-0 last:pb-0">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="font-semibold text-white truncate max-w-[170px]">{prod.name}</span>
                  <span className="font-mono font-bold text-emerald-400">{prod.price}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#888]">
                  <span>{prod.category}</span>
                  <span className={prod.stock <= 3 ? "text-amber-400 font-bold" : "text-[#AAA]"}>
                    {prod.stock} {isEn ? "in stock" : "tersisa"} • {prod.sold} {isEn ? "sold" : "terjual"}
                  </span>
                </div>
                {/* Stock Bar */}
                <div className="w-full bg-[#1C1C1C] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      prod.stock <= 3 ? "bg-amber-400" : "bg-emerald-400"
                    }`}
                    style={{ width: `${Math.min(100, (prod.stock / 20) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#0E0E0E] border-t border-[#1E1E1E] mt-auto">
            <Link
              href="/seller/products/new"
              className="w-full py-2 bg-[#1A1A1A] hover:bg-[#242424] text-white text-xs font-mono font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-[#2E2E2E]"
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {isEn ? "Upload New Product" : "Upload Produk Baru"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
