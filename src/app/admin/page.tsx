"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAdminData } from "@/context/AdminDataContext";
import { useLocation } from "@/context/LocationContext";
import { useLanguage } from "@/context/LanguageContext";
import { AreaChart } from "@/components/charts/area-chart";
import { Area } from "@/components/charts/area";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";

export default function AdminDashboard() {
  const { users, stores, brands, products, orders, auditLogs } = useAdminData();
  const { formatPrice } = useLocation();
  const { language } = useLanguage();
  const isEn = language === "English";

  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "ALL">("7D");

  const pendingStoresCount = stores.filter((s) => s.status === "PENDING").length;
  const pendingBrandsCount = brands.filter((b) => b.status === "PENDING").length;
  const pendingProductsCount = products.filter((p) => p.status === "PENDING").length;
  const totalPending = pendingStoresCount + pendingBrandsCount + pendingProductsCount;

  const totalGMV = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeSellers = stores.filter((s) => s.status === "APPROVED").length;

  // Sound Signatures distribution
  const soundSignatureCounts = useMemo(() => {
    const counts: Record<string, number> = { Neutral: 0, Warm: 0, "V-Shape": 0, Bright: 0, Basshead: 0 };
    products.forEach((p) => {
      if (counts[p.soundSignature] !== undefined) {
        counts[p.soundSignature]++;
      } else {
        counts[p.soundSignature] = 1;
      }
    });
    return counts;
  }, [products]);

  // Order status breakdown
  const orderStatusCounts = useMemo(() => {
    const counts: Record<string, number> = { COMPLETED: 0, PAID: 0, SHIPPED: 0, PENDING: 0 };
    orders.forEach((o) => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      } else {
        counts[o.status] = 1;
      }
    });
    return counts;
  }, [orders]);

  // Area Chart Time Series Data
  const chartData = useMemo(() => {
    if (timeRange === "7D") {
      return [
        { date: new Date("2026-08-10"), revenue: Math.round(totalGMV * 0.22), orders: 2 },
        { date: new Date("2026-08-11"), revenue: Math.round(totalGMV * 0.35), orders: 4 },
        { date: new Date("2026-08-12"), revenue: Math.round(totalGMV * 0.31), orders: 3 },
        { date: new Date("2026-08-13"), revenue: Math.round(totalGMV * 0.58), orders: 7 },
        { date: new Date("2026-08-14"), revenue: Math.round(totalGMV * 0.52), orders: 6 },
        { date: new Date("2026-08-15"), revenue: Math.round(totalGMV * 0.79), orders: 9 },
        { date: new Date("2026-08-16"), revenue: totalGMV, orders: orders.length },
      ];
    } else if (timeRange === "30D") {
      return [
        { date: new Date("2026-07-18"), revenue: Math.round(totalGMV * 0.08), orders: 1 },
        { date: new Date("2026-07-25"), revenue: Math.round(totalGMV * 0.25), orders: 3 },
        { date: new Date("2026-08-01"), revenue: Math.round(totalGMV * 0.44), orders: 5 },
        { date: new Date("2026-08-08"), revenue: Math.round(totalGMV * 0.62), orders: 8 },
        { date: new Date("2026-08-16"), revenue: totalGMV, orders: orders.length },
      ];
    } else {
      return [
        { date: new Date("2026-01-01"), revenue: 0, orders: 0 },
        { date: new Date("2026-03-01"), revenue: Math.round(totalGMV * 0.15), orders: 2 },
        { date: new Date("2026-05-01"), revenue: Math.round(totalGMV * 0.38), orders: 5 },
        { date: new Date("2026-07-01"), revenue: Math.round(totalGMV * 0.72), orders: 9 },
        { date: new Date("2026-08-16"), revenue: totalGMV, orders: orders.length },
      ];
    }
  }, [totalGMV, orders.length, timeRange]);

  // Mini Sparkline Data for Bento Cards
  const sparklineGMV = useMemo(() => [
    { date: new Date("2026-08-10"), val: 12 },
    { date: new Date("2026-08-11"), val: 19 },
    { date: new Date("2026-08-12"), val: 16 },
    { date: new Date("2026-08-13"), val: 28 },
    { date: new Date("2026-08-14"), val: 24 },
    { date: new Date("2026-08-15"), val: 35 },
    { date: new Date("2026-08-16"), val: 42 },
  ], []);

  const sparklineSellers = useMemo(() => [
    { date: new Date("2026-08-10"), val: 2 },
    { date: new Date("2026-08-11"), val: 2 },
    { date: new Date("2026-08-12"), val: 3 },
    { date: new Date("2026-08-13"), val: 3 },
    { date: new Date("2026-08-14"), val: 4 },
    { date: new Date("2026-08-15"), val: 4 },
    { date: new Date("2026-08-16"), val: activeSellers },
  ], [activeSellers]);

  const sparklineProducts = useMemo(() => [
    { date: new Date("2026-08-10"), val: 5 },
    { date: new Date("2026-08-11"), val: 5 },
    { date: new Date("2026-08-12"), val: 6 },
    { date: new Date("2026-08-13"), val: 7 },
    { date: new Date("2026-08-14"), val: 7 },
    { date: new Date("2026-08-15"), val: 8 },
    { date: new Date("2026-08-16"), val: products.length },
  ], [products.length]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Title & Status Header (Zero border, clean modern elevation) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold font-sans text-white tracking-tight">
              {isEn ? "System Overview & Telemetry" : "Ringkasan Utama Sistem"}
            </h2>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#141F17] text-[#BFDD25]">
              {isEn ? "ADMIN PORTAL" : "PANEL ADMIN"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#A1A1AA] font-sans mt-1">
            {isEn
              ? "Monitor marketplace volume, escrow holding vault, and active moderation queues."
              : "Pantau perputaran penjualan toko, status rekening bersama, dan daftar persetujuan produk."}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#0E0E0E] px-4 py-2 rounded-full shadow-sm">
          <span className="text-[10px] font-mono text-white uppercase tracking-wider font-semibold">
            {isEn ? "Live Telemetry Connected" : "Data Terhubung Real-Time"}
          </span>
        </div>
      </div>

      {/* Bento Telemetry Grid (Rounded-2xl, Zero Stroke) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Main GMV Card (Spans 2 cols) */}
        <div className="col-span-1 md:col-span-2 bg-[#0A0A0A] rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden group hover:bg-[#0D0D0D] transition-all shadow-sm">
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-[11px] font-mono font-bold text-[#A1A1AA] uppercase tracking-wider">
                  {isEn ? "Gross Merchandise Volume (GMV)" : "Total Transaksi Penjualan (GMV)"}
                </h3>
              </div>
              <p className="text-2xl sm:text-4xl font-mono font-bold text-white tracking-tight">
                {formatPrice(totalGMV)}
              </p>
            </div>
            <div className="w-28 h-12 relative opacity-80 group-hover:opacity-100 transition-opacity">
              <AreaChart data={sparklineGMV} aspectRatio="2 / 1" className="w-full h-full" margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
                <Area dataKey="val" stroke="#BFDD25" fill="#BFDD25" strokeWidth={1.75} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="relative z-10 flex items-center justify-between pt-4 mt-4 text-xs font-mono">
            <span className="text-[#71717A]">
              {isEn ? "Settled Orders Volume" : "Total Pembayaran Berhasil"}
            </span>
            <span className="text-[10px] font-mono font-bold text-white bg-[#141414] px-3 py-1 rounded-full">
              {orders.length} {isEn ? "Orders Processed" : "Pesanan Terproses"}
            </span>
          </div>
        </div>

        {/* Verified Merchants Card */}
        <div className="bg-[#0A0A0A] rounded-2xl p-6 flex flex-col justify-between hover:bg-[#0D0D0D] transition-all group relative overflow-hidden shadow-sm">
          <div className="flex items-start justify-between">
            <h3 className="text-[11px] font-mono font-bold text-[#A1A1AA] uppercase tracking-wider">
              {isEn ? "Verified Stores" : "Toko Terverifikasi"}
            </h3>
            <div className="w-16 h-8 relative opacity-70 group-hover:opacity-100 transition-opacity">
              <AreaChart data={sparklineSellers} aspectRatio="2 / 1" className="w-full h-full" margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                <Area dataKey="val" stroke="#FFFFFF" fill="#FFFFFF" strokeWidth={1.5} fillOpacity={0.12} />
              </AreaChart>
            </div>
          </div>
          <div className="my-2">
            <p className="text-3xl font-mono font-bold text-white">
              {activeSellers}
            </p>
            <span className="text-[11px] text-[#71717A] font-mono">
              {isEn ? "Active Merchant Vaults" : "Toko Siap Berjualan"}
            </span>
          </div>
          <div className="pt-3 flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#71717A]">{isEn ? "KYC Approved" : "KTP Disetujui"}</span>
            <Link href="/admin/approvals/sellers" className="text-white hover:text-[#BFDD25] flex items-center gap-1 transition-colors">
              {isEn ? "View Stores" : "Lihat Toko"}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
            </Link>
          </div>
        </div>

        {/* Curated Catalog Items Card */}
        <div className="bg-[#0A0A0A] rounded-2xl p-6 flex flex-col justify-between hover:bg-[#0D0D0D] transition-all group relative overflow-hidden shadow-sm">
          <div className="flex items-start justify-between">
            <h3 className="text-[11px] font-mono font-bold text-[#A1A1AA] uppercase tracking-wider">
              {isEn ? "Active Catalog Products" : "Daftar Produk Aktif"}
            </h3>
            <div className="w-16 h-8 relative opacity-70 group-hover:opacity-100 transition-opacity">
              <AreaChart data={sparklineProducts} aspectRatio="2 / 1" className="w-full h-full" margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                <Area dataKey="val" stroke="#BFDD25" fill="#BFDD25" strokeWidth={1.5} fillOpacity={0.12} />
              </AreaChart>
            </div>
          </div>
          <div className="my-2">
            <p className="text-3xl font-mono font-bold text-white">
              {products.length}
            </p>
            <span className="text-[11px] text-[#71717A] font-mono">
              {isEn ? "IEM, DAC & Accessories" : "IEM, DAC & Aksesoris"}
            </span>
          </div>
          <div className="pt-3 flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#71717A]">{isEn ? "QC Verified" : "Produk Lolos Uji"}</span>
            <Link href="/admin/approvals/products" className="text-white hover:text-[#BFDD25] flex items-center gap-1 transition-colors">
              {isEn ? "Catalog" : "Katalog"}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
            </Link>
          </div>
        </div>

        {/* Moderation Action Required (Spans 2 cols on large) */}
        <div className="col-span-1 md:col-span-3 lg:col-span-2 bg-[#0A0A0A] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:bg-[#0D0D0D] transition-all shadow-sm">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
                {isEn ? "Action Required (Queue)" : "Perlu Tindakan Admin"}
              </h3>
            </div>
            {totalPending > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-medium text-amber-300 bg-[#1A1811] px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {totalPending} {isEn ? "Pending Moderation" : "Menunggu Persetujuan"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-medium text-[#BFDD25] bg-[#141F17] px-3 py-1 rounded-full">
                {isEn ? "Queue Clear" : "Semua Sudah Selesai"}
              </span>
            )}
          </div>

          <div className="my-4">
            <p className="text-2xl sm:text-3xl font-bold font-sans text-white tracking-tight">
              {totalPending} {isEn ? "Items Pending Moderation" : "Pengajuan Menunggu Diperiksa"}
            </p>
            <p className="text-xs text-[#A1A1AA] font-sans mt-1">
              {isEn
                ? `Includes ${pendingStoresCount} new store applicants, ${pendingBrandsCount} brand requests, and ${pendingProductsCount} new IEM listings.`
                : `Terdiri dari ${pendingStoresCount} pendaftaran toko baru, ${pendingBrandsCount} brand baru, dan ${pendingProductsCount} produk baru.`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-3">
            <Link
              href="/admin/approvals/sellers"
              className="inline-flex items-center gap-2 text-xs font-sans font-bold bg-white hover:bg-[#E5E5E5] text-black px-5 py-2.5 rounded-full transition-all shadow-md cursor-pointer"
            >
              {isEn ? "Review Stores" : "Periksa Toko"} ({pendingStoresCount})
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/admin/approvals/products"
              className="inline-flex items-center gap-1.5 text-xs font-sans font-medium bg-[#141414] hover:bg-[#1E1E1E] text-white px-4 py-2.5 rounded-full transition-colors cursor-pointer"
            >
              {isEn ? "Review Products" : "Periksa Produk"} ({pendingProductsCount})
            </Link>
            <Link
              href="/admin/approvals/brands"
              className="inline-flex items-center gap-1.5 text-xs font-sans font-medium bg-[#141414] hover:bg-[#1E1E1E] text-white px-4 py-2.5 rounded-full transition-colors cursor-pointer"
            >
              {isEn ? "Review Brands" : "Periksa Brand"} ({pendingBrandsCount})
            </Link>
          </div>
        </div>

        {/* User Base Registry Metric */}
        <div className="bg-[#0A0A0A] rounded-2xl p-6 flex flex-col justify-between hover:bg-[#0D0D0D] transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#A1A1AA] uppercase tracking-wider">
              {isEn ? "Total Users" : "Total Pengguna"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-medium text-[#D4D4D8] bg-[#141414] px-3 py-1 rounded-full">
              {isEn ? "Active Accounts" : "Akun Aktif"}
            </span>
          </div>
          <div className="my-2">
            <span className="text-3xl font-mono font-bold text-white">{users.length}</span>
            <p className="text-[11px] font-mono text-[#71717A] mt-0.5">
              {isEn ? "Buyers & Merchants" : "Akun Pembeli & Penjual"}
            </p>
          </div>
          <div className="pt-3 flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#71717A]">
              {isEn ? "User Registry" : "Data Pengguna"}
            </span>
            <Link href="/admin/users" className="text-xs font-mono text-white hover:text-[#BFDD25] flex items-center gap-1 transition-colors">
              {isEn ? "View All" : "Lihat Semua"}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
            </Link>
          </div>
        </div>

        {/* Registered Brands Metric */}
        <div className="bg-[#0A0A0A] rounded-2xl p-6 flex flex-col justify-between hover:bg-[#0D0D0D] transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-[#A1A1AA] uppercase tracking-wider">
              {isEn ? "Official Brands" : "Daftar Brand Resmi"}
            </span>
            <span className="text-[10px] font-mono text-[#D4D4D8] bg-[#141414] px-3 py-1 rounded-full font-medium">
              {brands.length} {isEn ? "Brands" : "Brand"}
            </span>
          </div>
          <div className="my-2">
            <span className="text-3xl font-mono font-bold text-white">{brands.length}</span>
            <p className="text-[11px] font-mono text-[#71717A] mt-0.5">Tangzu, Moondrop, EPZ, etc</p>
          </div>
          <div className="pt-3 flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#71717A]">
              {isEn ? "Distributors" : "Distributor"}
            </span>
            <Link href="/admin/approvals/brands" className="text-xs font-mono text-white hover:text-[#BFDD25] flex items-center gap-1 transition-colors">
              {isEn ? "Manage" : "Kelola"}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
            </Link>
          </div>
        </div>

        {/* Interactive GMV Revenue Chart Module (Rounded-2xl, Zero Stroke) */}
        <div className="col-span-1 md:col-span-3 lg:col-span-4 bg-[#0A0A0A] rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-white tracking-tight font-sans">
                  {isEn ? "Gross Revenue Telemetry" : "Grafik Perputaran Uang Penjualan"}
                </h3>
                <span className="text-[10px] font-mono bg-[#141414] text-[#D4D4D8] px-3 py-1 rounded-full font-medium">
                  {isEn ? "GMV Velocity" : "Grafik Penjualan"}
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA] font-sans">
                {isEn
                  ? "Time-series curve of overall marketplace transaction volume and order intake."
                  : "Perkembangan total penjualan dan jumlah pesanan yang masuk."}
              </p>
            </div>
            
            {/* Range Toggle Pills */}
            <div className="flex items-center gap-1 bg-[#121212] p-1 rounded-full">
              {(["7D", "30D", "ALL"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3.5 py-1 text-xs font-mono font-bold rounded-full transition-all cursor-pointer ${
                    timeRange === r
                      ? "bg-white text-black shadow-md"
                      : "text-[#71717A] hover:text-white"
                  }`}
                >
                  {r === "7D" ? (isEn ? "7 Days" : "7 Hari") : r === "30D" ? (isEn ? "30 Days" : "30 Hari") : (isEn ? "All Time" : "Semua")}
                </button>
              ))}
            </div>
          </div>

          {/* Area Chart with TonalZone Volt Green Accent */}
          <div className="w-full h-64 relative">
            <AreaChart data={chartData} aspectRatio="3 / 1" className="w-full h-full">
              <Grid horizontal stroke="rgba(255,255,255,0.03)" strokeDasharray="3,3" />
              <Area dataKey="revenue" stroke="#BFDD25" fill="#BFDD25" strokeWidth={2} fillOpacity={0.15} />
              <XAxis />
            </AreaChart>
          </div>
        </div>

        {/* Sound Signature & Escrow Breakdown Modules */}
        <div className="col-span-1 md:col-span-2 bg-[#0A0A0A] rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-bold text-white font-sans tracking-tight">
              {isEn ? "Catalog Acoustic Signatures" : "Karakter Suara Produk (Sound Signature)"}
            </h3>
            <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">
              {isEn ? "Tuning" : "Tipe Suara"}
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA] font-sans mb-4">
            {isEn
              ? "Inventory distribution classified by target frequency response (Neutral, V-Shape, Basshead, etc)."
              : "Jumlah produk berdasarkan tipe karakter suara (Bass, Netral, V-Shape, dll)."}
          </p>

          <div className="space-y-3.5 font-sans text-xs">
            {Object.entries(soundSignatureCounts).map(([sig, count]) => {
              const pct = products.length > 0 ? Math.round((count / products.length) * 100) : 0;
              return (
                <div key={sig} className="space-y-1.5">
                  <div className="flex justify-between text-[#A1A1AA]">
                    <span className="font-semibold text-white">{sig}</span>
                    <span className="font-mono text-white font-bold">{count} {isEn ? "items" : "produk"} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#141414] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#BFDD25] transition-all duration-500 rounded-full shadow-[0_0_6px_rgba(191,221,37,0.6)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Escrow Liquidity Breakdown */}
        <div className="col-span-1 md:col-span-2 bg-[#0A0A0A] rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-bold text-white font-sans tracking-tight">
              {isEn ? "Escrow Settlement Stages" : "Status Dana Pembayaran (Rekening Bersama)"}
            </h3>
            <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">
              {isEn ? "Escrow" : "Rekber"}
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA] font-sans mb-4">
            {isEn
              ? "Fund flow from buyer checkout, transit holding, through merchant payout release."
              : "Alur dana pembeli dari mulai dibayar, barang dikirim, sampai diteruskan ke penjual."}
          </p>

          <div className="space-y-3.5 font-sans text-xs">
            {Object.entries(orderStatusCounts).map(([st, count]) => {
              const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
              const labelMap: Record<string, string> = {
                COMPLETED: isEn ? "Funds Disbursed to Seller" : "Dana Sudah Dicairkan (Selesai)",
                PAID: isEn ? "Held in Escrow Vault" : "Dana Ditahan di Rekber (Dibayar)",
                SHIPPED: isEn ? "In Transit (Under Test Period)" : "Barang Sedang Dikirim",
                PENDING: isEn ? "Awaiting Payment" : "Menunggu Pembayaran",
              };
              return (
                <div key={st} className="space-y-1.5">
                  <div className="flex justify-between text-[#A1A1AA]">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        st === "COMPLETED" ? "bg-[#BFDD25] shadow-[0_0_6px_rgba(191,221,37,0.7)]" :
                        st === "PAID" ? "bg-amber-400" :
                        st === "SHIPPED" ? "bg-sky-400" : "bg-[#71717A]"
                      }`} />
                      <span className="font-mono text-[11px] font-medium text-white">{labelMap[st] || st}</span>
                    </div>
                    <span className="font-mono text-white font-bold">{count} {isEn ? "orders" : "pesanan"} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#141414] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Audit Log Stream (Rounded-2xl, Zero Stroke) */}
        <div className="col-span-1 md:col-span-3 lg:col-span-4 bg-[#0A0A0A] rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-white tracking-tight font-sans">
                  {isEn ? "Real-Time System Audit Logs" : "Catatan Aktivitas Admin Terkini"}
                </h3>
              </div>
              <p className="text-xs text-[#A1A1AA] font-sans">
                {isEn
                  ? "Immutable trail of administrative decisions, merchant approvals, and status mutations."
                  : "Riwayat persetujuan, penolakan, dan perubahan status oleh admin."}
              </p>
            </div>
            <span className="text-[10px] font-mono bg-[#141414] text-[#D4D4D8] px-3 py-1 rounded-full font-medium">
              {auditLogs.length} {isEn ? "records" : "catatan"}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[280px] overflow-y-auto custom-scrollbar">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#121212] hover:bg-[#161616] transition-colors rounded-xl font-mono text-xs gap-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-bold text-white shrink-0">{log.action}:</span>
                    <span className="text-[#A1A1AA] truncate">{log.target}</span>
                  </div>
                  <span className="text-[#71717A] text-[11px] shrink-0">{log.timestamp}</span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-[#71717A] font-mono bg-[#121212] rounded-xl">
                {isEn
                  ? "No audit records found. All administrative operations will be timestamped here."
                  : "Belum ada aktivitas yang dicatat. Setiap persetujuan atau perubahan data akan otomatis tercatat di sini."}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

