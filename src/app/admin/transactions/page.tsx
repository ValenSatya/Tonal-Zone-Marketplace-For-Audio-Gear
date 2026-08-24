"use client";

import React, { useState, useMemo, useDeferredValue } from "react";
import { useAdminData, AdminOrder } from "@/context/AdminDataContext";
import { useLocation } from "@/context/LocationContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart } from "@/components/charts/area-chart";
import { Area } from "@/components/charts/area";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import CustomSelect from "@/components/ui/custom-select";

const PAGE_SIZE = 10;

export default function TransactionsAdminPage() {
  const { orders, releaseEscrowPayout, refundEscrowOrder, resolveOrderDispute, exportToCSV } = useAdminData();
  const { formatPrice } = useLocation();
  const { language } = useLanguage();
  const isEn = language === "English";

  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [chartRange, setChartRange] = useState<"7D" | "30D" | "90D" | "ALL">("7D");
  const [sortField, setSortField] = useState<"orderNumber" | "buyerName" | "totalAmount" | "status" | "createdAt">("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Escrow Vault & Dispute Modals
  const [settlingOrder, setSettlingOrder] = useState<AdminOrder | null>(null);
  const [refundingOrder, setRefundingOrder] = useState<AdminOrder | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [disputeOrder, setDisputeOrder] = useState<AdminOrder | null>(null);
  const [disputeNotes, setDisputeNotes] = useState("");
  const [disputeResolution, setDisputeResolution] = useState<"RELEASE_TO_SELLER" | "REFUND_TO_BUYER">("RELEASE_TO_SELLER");

  const processedOrders = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase();
    const filtered = orders.filter((o) => {
      const matchSearch =
        !query ||
        o.orderNumber.toLowerCase().includes(query) ||
        o.buyerName.toLowerCase().includes(query) ||
        o.buyerEmail.toLowerCase().includes(query) ||
        o.sellerName.toLowerCase().includes(query) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(query));

      const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });

    return filtered.sort((a, b) => {
      let aVal: any = a[sortField] || "";
      let bVal: any = b[sortField] || "";
      if (sortField === "totalAmount") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [orders, deferredSearchQuery, statusFilter, sortField, sortDirection]);

  // Paginated orders
  const totalPages = Math.max(1, Math.ceil(processedOrders.length / PAGE_SIZE));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return processedOrders.slice(start, start + PAGE_SIZE);
  }, [processedOrders, currentPage]);

  const handleSortToggle = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Escrow Calculations
  const escrowHoldingOrders = useMemo(() => {
    return orders.filter((o) => o.status === "PAID" || o.status === "SHIPPED" || o.status === "DELIVERED");
  }, [orders]);

  const escrowHolding = useMemo(() => {
    return escrowHoldingOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [escrowHoldingOrders]);

  const escrowReleasedOrders = useMemo(() => {
    return orders.filter((o) => o.status === "COMPLETED");
  }, [orders]);

  const escrowReleased = useMemo(() => {
    return escrowReleasedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [escrowReleasedOrders]);

  const totalGMV = useMemo(() => {
    return orders.reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders]);

  // Micro Sparklines Data for Metric Cards
  const sparklineHolding = useMemo(() => [
    { date: new Date("2026-08-10"), val: Math.round(escrowHolding * 0.4) },
    { date: new Date("2026-08-11"), val: Math.round(escrowHolding * 0.6) },
    { date: new Date("2026-08-12"), val: Math.round(escrowHolding * 0.5) },
    { date: new Date("2026-08-13"), val: Math.round(escrowHolding * 0.8) },
    { date: new Date("2026-08-14"), val: Math.round(escrowHolding * 0.75) },
    { date: new Date("2026-08-15"), val: Math.round(escrowHolding * 0.9) },
    { date: new Date("2026-08-16"), val: escrowHolding },
  ], [escrowHolding]);

  const sparklineReleased = useMemo(() => [
    { date: new Date("2026-08-10"), val: Math.round(escrowReleased * 0.2) },
    { date: new Date("2026-08-11"), val: Math.round(escrowReleased * 0.35) },
    { date: new Date("2026-08-12"), val: Math.round(escrowReleased * 0.45) },
    { date: new Date("2026-08-13"), val: Math.round(escrowReleased * 0.6) },
    { date: new Date("2026-08-14"), val: Math.round(escrowReleased * 0.7) },
    { date: new Date("2026-08-15"), val: Math.round(escrowReleased * 0.85) },
    { date: new Date("2026-08-16"), val: escrowReleased },
  ], [escrowReleased]);

  const sparklineGMV = useMemo(() => [
    { date: new Date("2026-08-10"), val: Math.round(totalGMV * 0.25) },
    { date: new Date("2026-08-11"), val: Math.round(totalGMV * 0.4) },
    { date: new Date("2026-08-12"), val: Math.round(totalGMV * 0.5) },
    { date: new Date("2026-08-13"), val: Math.round(totalGMV * 0.68) },
    { date: new Date("2026-08-14"), val: Math.round(totalGMV * 0.72) },
    { date: new Date("2026-08-15"), val: Math.round(totalGMV * 0.88) },
    { date: new Date("2026-08-16"), val: totalGMV },
  ], [totalGMV]);

  // Main Time Series Data
  const lineChartData = useMemo(() => {
    if (chartRange === "7D") {
      return [
        { date: new Date("2026-08-10"), inflow: Math.round(totalGMV * 0.2), payouts: Math.round(escrowReleased * 0.15) },
        { date: new Date("2026-08-11"), inflow: Math.round(totalGMV * 0.35), payouts: Math.round(escrowReleased * 0.25) },
        { date: new Date("2026-08-12"), inflow: Math.round(totalGMV * 0.32), payouts: Math.round(escrowReleased * 0.22) },
        { date: new Date("2026-08-13"), inflow: Math.round(totalGMV * 0.55), payouts: Math.round(escrowReleased * 0.45) },
        { date: new Date("2026-08-14"), inflow: Math.round(totalGMV * 0.5), payouts: Math.round(escrowReleased * 0.42) },
        { date: new Date("2026-08-15"), inflow: Math.round(totalGMV * 0.78), payouts: Math.round(escrowReleased * 0.65) },
        { date: new Date("2026-08-16"), inflow: totalGMV, payouts: escrowReleased },
      ];
    } else if (chartRange === "30D") {
      return [
        { date: new Date("2026-07-20"), inflow: Math.round(totalGMV * 0.1), payouts: Math.round(escrowReleased * 0.05) },
        { date: new Date("2026-07-28"), inflow: Math.round(totalGMV * 0.28), payouts: Math.round(escrowReleased * 0.18) },
        { date: new Date("2026-08-05"), inflow: Math.round(totalGMV * 0.48), payouts: Math.round(escrowReleased * 0.38) },
        { date: new Date("2026-08-12"), inflow: Math.round(totalGMV * 0.75), payouts: Math.round(escrowReleased * 0.62) },
        { date: new Date("2026-08-16"), inflow: totalGMV, payouts: escrowReleased },
      ];
    } else {
      return [
        { date: new Date("2026-01-01"), inflow: 0, payouts: 0 },
        { date: new Date("2026-03-01"), inflow: Math.round(totalGMV * 0.2), payouts: Math.round(escrowReleased * 0.12) },
        { date: new Date("2026-05-01"), inflow: Math.round(totalGMV * 0.45), payouts: Math.round(escrowReleased * 0.35) },
        { date: new Date("2026-07-01"), inflow: Math.round(totalGMV * 0.75), payouts: Math.round(escrowReleased * 0.6) },
        { date: new Date("2026-08-16"), inflow: totalGMV, payouts: escrowReleased },
      ];
    }
  }, [totalGMV, escrowReleased, chartRange]);

  const handleReleasePayout = (orderId: string) => {
    releaseEscrowPayout(orderId);
    setSettlingOrder(null);
  };

  const handleOpenRefund = (order: AdminOrder) => {
    setRefundingOrder(order);
    setRefundReason("");
    setSettlingOrder(null);
  };

  const handleConfirmRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundingOrder) return;
    refundEscrowOrder(refundingOrder.id, refundReason);
    setRefundingOrder(null);
  };

  const handleOpenDispute = (order: AdminOrder) => {
    setDisputeOrder(order);
    setDisputeNotes("");
    setDisputeResolution("RELEASE_TO_SELLER");
    setSettlingOrder(null);
  };

  const handleConfirmDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeOrder) return;
    resolveOrderDispute(disputeOrder.id, disputeResolution, disputeNotes);
    setDisputeOrder(null);
  };

  const handleExport = () => {
    const dataToExport = processedOrders.map((o) => ({
      OrderNumber: o.orderNumber,
      Buyer: o.buyerName,
      BuyerEmail: o.buyerEmail,
      Seller: o.sellerName,
      Items: o.itemSummary,
      Amount_USD: o.totalAmount,
      Status: o.status,
      Courier: o.courier,
      TrackingNo: o.trackingNumber || "N/A",
      Date: o.createdAt,
    }));
    exportToCSV("tonalzone_escrow_settlements", dataToExport);
  };

  return (
    <div className="space-y-6 text-[#FAF9F6] selection:bg-white selection:text-black">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold bg-[#1C1C1C] text-[#FAF9F6] border border-[#2E2E2E] px-2 py-0.5 rounded uppercase tracking-wider">
              {isEn ? "Escrow Vault" : "Rekening Bersama"}
            </span>
            <span className="text-[11px] font-mono text-[#888]">
              {isEn ? "Buyer Fund Protection & Merchant Disbursement" : "Keamanan Dana Pembeli & Pencairan Penjual"}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans">
            {isEn ? "Transaction Management & Escrow Vault" : "Kelola Transaksi & Rekening Bersama"}
          </h1>
          <p className="text-xs text-[#888] font-sans mt-0.5">
            {isEn
              ? "Monitor buyer funds held securely in escrow, disburse payouts upon delivery confirmation, and mediate disputes."
              : "Pantau dana transaksi pembeli yang aman ditahan di rekber, cairkan dana ke penjual saat pesanan tiba, dan tangani komplain."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#141414] hover:bg-[#1f1f1f] border border-[#2a2a2a] hover:border-[#444] text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {isEn ? "Export Report (.CSV)" : "Unduh Laporan (.CSV)"}
          </button>
        </div>
      </div>

      {/* KPI Cards with Micro-Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Escrow In Vault */}
        <div className="bg-[#111] border border-[#222] hover:border-[#333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888] uppercase tracking-wider">
                {isEn ? "Held in Escrow Vault" : "Dana Ditahan di Rekber"}
              </p>
              <p className="text-2xl font-bold font-mono text-white mt-1">{formatPrice(escrowHolding)}</p>
            </div>
            <div className="w-20 h-10 shrink-0 opacity-70">
              <AreaChart data={sparklineHolding} aspectRatio="2 / 1" className="w-full h-full">
                <Area dataKey="val" stroke="#f59e0b" fill="#f59e0b" strokeWidth={1.5} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a] text-[11px] font-mono text-[#777]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>
              {isEn ? `${escrowHoldingOrders.length} orders in transit` : `${escrowHoldingOrders.length} pesanan sedang berjalan`}
            </span>
          </div>
        </div>

        {/* Card 2: Settled Payouts */}
        <div className="bg-[#111] border border-[#222] hover:border-[#333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888] uppercase tracking-wider">
                {isEn ? "Settled & Disbursed" : "Dana Berhasil Dicairkan"}
              </p>
              <p className="text-2xl font-bold font-mono text-white mt-1">{formatPrice(escrowReleased)}</p>
            </div>
            <div className="w-20 h-10 shrink-0 opacity-70">
              <AreaChart data={sparklineReleased} aspectRatio="2 / 1" className="w-full h-full">
                <Area dataKey="val" stroke="#10b981" fill="#10b981" strokeWidth={1.5} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a] text-[11px] font-mono text-[#777]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>
              {isEn ? `${escrowReleasedOrders.length} completed smoothly` : `${escrowReleasedOrders.length} pesanan selesai tanpa kendala`}
            </span>
          </div>
        </div>

        {/* Card 3: Total GMV */}
        <div className="bg-[#111] border border-[#222] hover:border-[#333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888] uppercase tracking-wider">
                {isEn ? "Gross Merchandise Value" : "Total Perputaran Transaksi"}
              </p>
              <p className="text-2xl font-bold font-mono text-white mt-1">{formatPrice(totalGMV)}</p>
            </div>
            <div className="w-20 h-10 shrink-0 opacity-70">
              <AreaChart data={sparklineGMV} aspectRatio="2 / 1" className="w-full h-full">
                <Area dataKey="val" stroke="#ffffff" fill="#ffffff" strokeWidth={1.5} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a] text-[11px] font-mono text-[#777]">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span>
              {isEn ? `${orders.length} total orders recorded` : `${orders.length} total pesanan tercatat`}
            </span>
          </div>
        </div>

      </div>

      {/* Interactive Telemetry Chart */}
      <div className="bg-[#111] border border-[#222] p-5 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight font-sans">
              {isEn ? "Inflow vs Merchant Payout Telemetry" : "Arus Dana Masuk vs Pencairan ke Penjual"}
            </h3>
            <p className="text-xs text-[#888] font-sans">
              {isEn
                ? "Comparison between buyer escrow payments received and total funds released to sellers."
                : "Perbandingan nominal uang pembeli yang masuk ke rekber dibanding nominal dana yang dicairkan ke penjual."}
            </p>
          </div>

          <div className="flex items-center bg-[#161616] p-1 rounded-lg border border-[#262626] self-start sm:self-auto">
            {(["7D", "30D", "90D", "ALL"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setChartRange(r)}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-all cursor-pointer border ${
                  chartRange === r
                    ? "bg-[#242424] text-[#FAF9F6] font-semibold border-[#383838] shadow-sm"
                    : "text-[#8E8E93] hover:text-[#FAF9F6] hover:bg-[#1A1A1A] border-transparent"
                }`}
              >
                {r === "7D" ? (isEn ? "7 Days" : "7 Hari") : r === "30D" ? (isEn ? "30 Days" : "30 Hari") : r === "90D" ? (isEn ? "90 Days" : "90 Hari") : (isEn ? "All" : "Semua")}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[200px] w-full pt-3">
          <AreaChart data={lineChartData} className="h-full w-full">
            <Grid strokeDasharray="3 3" stroke="#222" />
            <XAxis numTicks={5} />
            <Area
              dataKey="inflow"
              stroke="#ffffff"
              fill="#ffffff"
              strokeWidth={2}
              fillOpacity={0.2}
            />
            <Area
              dataKey="payouts"
              stroke="#f59e0b"
              fill="#f59e0b"
              strokeWidth={2}
              fillOpacity={0.2}
            />
          </AreaChart>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-[#111] border border-[#222] p-3.5 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder={isEn ? "Search order ID, buyer, store, tracking..." : "Cari no pesanan, pembeli, toko, resi..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161616] border border-[#2a2a2a] focus:border-white rounded-lg pl-9 pr-3.5 py-2 text-xs font-sans text-white placeholder:text-[#666] outline-none transition-colors"
            />
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777]"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Pills */}
            <div className="flex items-center bg-[#161616] p-1 rounded-lg border border-[#262626]">
              {[
                { id: "ALL", label: isEn ? "All Orders" : "Semua Pesanan" },
                { id: "PAID", label: isEn ? "Held in Escrow" : "Ditahan di Rekber" },
                { id: "SHIPPED", label: isEn ? "In Transit" : "Sedang Dikirim" },
                { id: "COMPLETED", label: isEn ? "Settled" : "Dana Dicairkan" },
                { id: "CANCELLED", label: isEn ? "Refunded" : "Dibatalkan / Refund" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-all cursor-pointer border ${
                    statusFilter === tab.id
                      ? "bg-[#242424] text-[#FAF9F6] font-semibold border-[#383838] shadow-sm"
                      : "text-[#8E8E93] hover:text-[#FAF9F6] hover:bg-[#1A1A1A] border-transparent"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort Custom Dropdown */}
            <CustomSelect
              variant="compact"
              value={`${sortField}-${sortDirection}`}
              onChange={(val) => {
                const [f, d] = val.split("-") as [typeof sortField, typeof sortDirection];
                setSortField(f);
                setSortDirection(d);
              }}
              options={[
                { label: isEn ? "Newest Orders" : "Pesanan Terbaru", value: "createdAt-desc" },
                { label: isEn ? "Oldest Orders" : "Pesanan Terlama", value: "createdAt-asc" },
                { label: isEn ? "Highest Amount" : "Nominal Tertinggi", value: "totalAmount-desc" },
                { label: isEn ? "Lowest Amount" : "Nominal Terendah", value: "totalAmount-asc" },
                { label: isEn ? "Order Number" : "Nomor Pesanan", value: "orderNumber-asc" },
              ]}
              buttonClassName="bg-[#161616] border border-[#2a2a2a] hover:border-[#444] text-xs font-mono text-white px-3 py-1.5 rounded-lg flex items-center justify-between gap-2 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Escrow Ledger Table */}
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222] bg-[#141414] text-[10px] font-mono uppercase text-[#777] tracking-wider">
                <th
                  onClick={() => handleSortToggle("orderNumber")}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  {isEn ? "Order ID & Date" : "ID Pesanan & Tgl"}
                </th>
                <th className="py-3 px-4">{isEn ? "Buyer Name" : "Nama Pembeli"}</th>
                <th className="py-3 px-4">{isEn ? "Seller Store" : "Toko Penjual"}</th>
                <th className="py-3 px-4">{isEn ? "Items Summary" : "Barang Dipesan"}</th>
                <th
                  onClick={() => handleSortToggle("totalAmount")}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  {isEn ? "Amount" : "Nominal Dana"}
                </th>
                <th className="py-3 px-4">{isEn ? "Courier & Tracking" : "Ekspedisi & Resi"}</th>
                <th
                  onClick={() => handleSortToggle("status")}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  {isEn ? "Payment Status" : "Status Pembayaran"}
                </th>
                <th className="py-3 px-4 text-right">{isEn ? "Escrow Actions" : "Tindakan Dana"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e] text-xs font-sans">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#141414] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span
                          className="font-bold text-white hover:underline cursor-pointer font-mono"
                          onClick={() => setSettlingOrder(ord)}
                        >
                          {ord.orderNumber}
                        </span>
                        <span className="text-[10px] font-mono text-[#888]">{ord.createdAt}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{ord.buyerName}</span>
                        <span className="text-[10px] font-mono text-[#777]">{ord.buyerEmail}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-white/80 font-medium">
                      {ord.sellerName}
                    </td>

                    <td className="py-3.5 px-4 text-[#aaa] max-w-[200px] truncate">
                      {ord.itemSummary}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {formatPrice(ord.totalAmount)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col font-mono text-[11px]">
                        <span className="text-white font-semibold">{ord.courier}</span>
                        <span className="text-[#888] text-[10px]">
                          {ord.trackingNumber || (isEn ? "Pending Dispatch" : "Menunggu Pengiriman")}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#161616] text-[#D4D4D8] border border-[#27272A]">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          ord.status === "COMPLETED" ? "bg-emerald-400" : ord.status === "CANCELLED" ? "bg-rose-400" : "bg-amber-400"
                        }`} />
                        {ord.status === "PAID" || ord.status === "SHIPPED"
                          ? (isEn ? "In Escrow" : "Ditahan di Rekber")
                          : ord.status === "COMPLETED"
                          ? (isEn ? "Settled" : "Dana Dicairkan")
                          : ord.status === "CANCELLED"
                          ? (isEn ? "Refunded" : "Dibatalkan / Refund")
                          : ord.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSettlingOrder(ord)}
                        className="px-2.5 py-1 bg-[#1c1c1c] hover:bg-[#282828] border border-[#333] hover:border-white text-xs font-mono font-semibold text-white rounded-lg transition-colors cursor-pointer"
                      >
                        {isEn ? "Settle Escrow" : "Kelola Dana"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#666] font-mono">
                    {isEn ? "No transactions found matching the filter criteria." : "Tidak ada transaksi yang sesuai dengan filter pencarian."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & Pagination */}
        <div className="p-3.5 border-t border-[#1e1e1e] bg-[#141414] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#777] gap-3">
          <div className="flex items-center gap-2">
            <span>
              {isEn
                ? `Showing ${processedOrders.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}-${Math.min(currentPage * PAGE_SIZE, processedOrders.length)} of ${processedOrders.length} records`
                : `Menampilkan ${processedOrders.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}-${Math.min(currentPage * PAGE_SIZE, processedOrders.length)} dari ${processedOrders.length} transaksi`}
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded bg-[#1c1c1c] hover:bg-[#262626] border border-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed text-white font-mono text-xs transition-colors cursor-pointer"
              >
                {isEn ? "Previous" : "Sebelumnya"}
              </button>
              <span className="px-2 text-white/60 font-mono text-xs">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded bg-[#1c1c1c] hover:bg-[#262626] border border-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed text-white font-mono text-xs transition-colors cursor-pointer"
              >
                {isEn ? "Next" : "Selanjutnya"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* INSPECT & SETTLE ESCROW MODAL */}
      <AnimatePresence>
        {settlingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettlingOrder(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1, y: 0 }}
              className="relative w-full max-w-xl bg-[#141414] border border-[#333] rounded-2xl p-5 sm:p-6 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
                    {isEn ? "Escrow Vault Settlement" : "Penyelesaian Rekening Bersama"}
                  </span>
                  <h3 className="text-base font-bold text-white uppercase font-heading mt-0.5">
                    {isEn ? `Order #${settlingOrder.orderNumber}` : `Pesanan #${settlingOrder.orderNumber}`}
                  </h3>
                </div>
                <button
                  onClick={() => setSettlingOrder(null)}
                  className="text-[#888] hover:text-white p-1 cursor-pointer"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#191919] p-3 rounded-xl border border-[#282828] space-y-1">
                  <span className="font-mono text-[10px] text-[#777] uppercase">
                    {isEn ? "Buyer Information" : "Informasi Pembeli"}
                  </span>
                  <p className="font-bold text-white">{settlingOrder.buyerName}</p>
                  <p className="text-[#aaa] text-[11px] font-mono">{settlingOrder.buyerEmail}</p>
                </div>

                <div className="bg-[#191919] p-3 rounded-xl border border-[#282828] space-y-1">
                  <span className="font-mono text-[10px] text-[#777] uppercase">
                    {isEn ? "Seller Store Name" : "Nama Toko Penjual"}
                  </span>
                  <p className="font-bold text-white">{settlingOrder.sellerName}</p>
                  <p className="text-[#aaa] text-[11px]">{isEn ? "Verified Merchant" : "Penjual Terverifikasi"}</p>
                </div>

                <div className="bg-[#191919] p-3 rounded-xl border border-[#282828] space-y-1">
                  <span className="font-mono text-[10px] text-[#777] uppercase">
                    {isEn ? "Total Escrow Amount" : "Total Dana di Rekber"}
                  </span>
                  <p className="font-bold font-mono text-white text-base">{formatPrice(settlingOrder.totalAmount)}</p>
                  <p className="text-emerald-400 text-[11px] font-mono">
                    {isEn ? "100% Funds Secured in Vault" : "100% Dana Diamankan di Rekber"}
                  </p>
                </div>

                <div className="bg-[#191919] p-3 rounded-xl border border-[#282828] space-y-1">
                  <span className="font-mono text-[10px] text-[#777] uppercase">
                    {isEn ? "Courier & Resi AWB" : "Ekspedisi & Nomor Resi"}
                  </span>
                  <p className="font-bold text-white">{settlingOrder.courier}</p>
                  <p className="text-[#aaa] text-[11px] font-mono">{settlingOrder.trackingNumber || (isEn ? "Pending Dispatch" : "Menunggu Pengiriman")}</p>
                </div>
              </div>

              {/* Settlement Actions */}
              <div className="bg-[#191919] p-3.5 rounded-xl border border-[#282828] space-y-2.5">
                <span className="text-[10px] font-mono text-[#777] uppercase block">
                  {isEn ? "Admin Vault Settlement Controls:" : "Tindakan Admin untuk Dana Rekber:"}
                </span>
                
                <div className="flex flex-wrap items-center gap-2">
                  {settlingOrder.status !== "COMPLETED" && (
                    <button
                      type="button"
                      onClick={() => handleReleasePayout(settlingOrder.id)}
                      className="px-3.5 py-2 bg-white hover:bg-[#e0e0e0] text-black font-mono font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-sm"
                    >
                      {isEn ? "Release Payout to Seller" : "Cairkan Dana ke Penjual"}
                    </button>
                  )}

                  {settlingOrder.status !== "CANCELLED" && (
                    <button
                      type="button"
                      onClick={() => handleOpenRefund(settlingOrder)}
                      className="px-3.5 py-2 bg-[#181818] hover:bg-[#262626] text-white border border-[#2E2E2E] font-mono font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      {isEn ? "Refund Buyer (100%)" : "Kembalikan Dana ke Pembeli"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleOpenDispute(settlingOrder)}
                    className="px-3.5 py-2 bg-[#181818] hover:bg-[#262626] text-white border border-[#2E2E2E] font-mono font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    {isEn ? "Mediate Dispute" : "Penyelesaian Komplain"}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setSettlingOrder(null)}
                  className="px-3.5 py-1.5 bg-[#222] hover:bg-[#333] text-white text-xs font-mono rounded-lg transition-colors cursor-pointer"
                >
                  {isEn ? "Close" : "Tutup"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REFUND MODAL */}
      <AnimatePresence>
        {refundingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRefundingOrder(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1, y: 0 }}
              className="relative w-full max-w-md bg-[#141414] border border-[#333] rounded-2xl p-5 shadow-2xl z-10 space-y-4"
            >
              <h3 className="text-sm font-bold text-white font-sans">
                {isEn
                  ? `Refund Order #${refundingOrder.orderNumber}?`
                  : `Kembalikan Dana Pesanan #${refundingOrder.orderNumber}?`}
              </h3>
              <p className="text-xs text-[#888] font-sans">
                {isEn
                  ? `Full amount of `
                  : `Dana sebesar `}
                <strong className="text-white font-mono">{formatPrice(refundingOrder.totalAmount)}</strong>
                {isEn
                  ? ` will be refunded directly to the buyer (${refundingOrder.buyerName}).`
                  : ` akan dikembalikan secara penuh ke rekening/e-wallet pembeli (${refundingOrder.buyerName}).`}
              </p>

              <form onSubmit={handleConfirmRefund} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-[#aaa]">
                    {isEn ? "Refund Reason / Justification:" : "Alasan Pengembalian Dana:"}
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder={isEn ? "e.g., Package lost in transit, seller cancelled shipment..." : "Contoh: Paket hilang dalam pengiriman, seller batal kirim, atau kesepakatan return..."}
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333] focus:border-rose-400 rounded-lg p-2.5 text-xs text-white outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRefundingOrder(null)}
                    className="px-3.5 py-1.5 bg-[#222] hover:bg-[#333] text-white text-xs font-mono rounded-lg transition-colors cursor-pointer"
                  >
                    {isEn ? "Cancel" : "Batal"}
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-lg shadow-rose-900/40"
                  >
                    {isEn ? "Refund 100%" : "Kembalikan Dana 100%"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DISPUTE MEDIATION MODAL */}
      <AnimatePresence>
        {disputeOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDisputeOrder(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1, y: 0 }}
              className="relative w-full max-w-md bg-[#141414] border border-[#333] rounded-2xl p-5 shadow-2xl z-10 space-y-4"
            >
              <div className="border-b border-[#262626] pb-3">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
                  {isEn ? "Order Dispute Mediation" : "Penyelesaian Komplain Pesanan"}
                </span>
                <h3 className="text-sm font-bold text-white font-sans mt-0.5">
                  {isEn ? `Mediate Dispute #${disputeOrder.orderNumber}` : `Mediasi Komplain #${disputeOrder.orderNumber}`}
                </h3>
              </div>

              <form onSubmit={handleConfirmDispute} className="space-y-3.5 text-xs font-sans">
                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] text-[#aaa]">
                    {isEn ? "Marketplace Admin Ruling:" : "Keputusan Admin Marketplace:"}
                  </label>
                  <CustomSelect
                    value={disputeResolution}
                    onChange={(val) => setDisputeResolution(val as any)}
                    options={[
                      {
                        label: isEn ? "Release Funds to Seller (Item Valid as Described)" : "Cairkan Dana ke Penjual (Barang Sesuai & Valid)",
                        value: "RELEASE_TO_SELLER",
                      },
                      {
                        label: isEn ? "Refund Funds to Buyer (Damaged / Wrong Item)" : "Kembalikan Dana ke Pembeli (Barang Rusak / Salah Kirim)",
                        value: "REFUND_TO_BUYER",
                      },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] text-[#aaa]">
                    {isEn ? "Mediation Findings & Notes:" : "Catatan & Alasan Keputusan:"}
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder={isEn ? "Summarize unboxing video review, courier check, or arbitration justification..." : "Tuliskan ringkasan bukti video unboxing, hasil mediasi, atau alasan keputusan..."}
                    value={disputeNotes}
                    onChange={(e) => setDisputeNotes(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333] focus:border-amber-400 rounded-lg p-2.5 text-white outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDisputeOrder(null)}
                    className="px-3.5 py-1.5 bg-[#222] hover:bg-[#333] text-white text-xs font-mono rounded-lg transition-colors cursor-pointer"
                  >
                    {isEn ? "Cancel" : "Batal"}
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-[#262626] hover:bg-[#333333] text-[#FAF9F6] border border-[#3E3E3E] font-mono font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    {isEn ? "Save Ruling" : "Simpan Keputusan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
