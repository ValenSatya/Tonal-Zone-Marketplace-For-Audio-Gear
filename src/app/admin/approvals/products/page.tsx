"use client";

import React, { useState, useMemo, useDeferredValue } from "react";
import { useAdminData, AdminProduct } from "@/context/AdminDataContext";
import { useLocation } from "@/context/LocationContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart } from "@/components/charts/area-chart";
import { Area } from "@/components/charts/area";
import CustomSelect from "@/components/ui/custom-select";

const PAGE_SIZE = 10;

export default function ProductModerationPage() {
  const { products, updateProduct, bulkUpdateProductStatus, exportToCSV } = useAdminData();
  const { formatPrice } = useLocation();
  const { language } = useLanguage();
  const isEn = language === "English";

  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<"name" | "price" | "stock" | "brand" | "category" | "status" | "createdAt">("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Inspection & Moderation Modals
  const [inspectingProduct, setInspectingProduct] = useState<AdminProduct | null>(null);
  const [rejectingProduct, setRejectingProduct] = useState<AdminProduct | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const pendingCount = products.filter((p) => p.status === "PENDING").length;
  const approvedCount = products.filter((p) => p.status === "APPROVED").length;
  const rejectedCount = products.filter((p) => p.status === "REJECTED").length;

  // Micro Sparklines
  const sparklinePending = useMemo(() => [
    { date: new Date("2026-08-10"), val: 1 },
    { date: new Date("2026-08-11"), val: 2 },
    { date: new Date("2026-08-12"), val: 1 },
    { date: new Date("2026-08-13"), val: 3 },
    { date: new Date("2026-08-14"), val: 2 },
    { date: new Date("2026-08-15"), val: 4 },
    { date: new Date("2026-08-16"), val: pendingCount },
  ], [pendingCount]);

  const sparklineApproved = useMemo(() => [
    { date: new Date("2026-08-10"), val: 4 },
    { date: new Date("2026-08-11"), val: 5 },
    { date: new Date("2026-08-12"), val: 6 },
    { date: new Date("2026-08-13"), val: 7 },
    { date: new Date("2026-08-14"), val: 7 },
    { date: new Date("2026-08-15"), val: 8 },
    { date: new Date("2026-08-16"), val: approvedCount },
  ], [approvedCount]);

  const sparklineRejected = useMemo(() => [
    { date: new Date("2026-08-10"), val: 0 },
    { date: new Date("2026-08-11"), val: 1 },
    { date: new Date("2026-08-12"), val: 1 },
    { date: new Date("2026-08-13"), val: 1 },
    { date: new Date("2026-08-14"), val: 2 },
    { date: new Date("2026-08-15"), val: 2 },
    { date: new Date("2026-08-16"), val: rejectedCount },
  ], [rejectedCount]);

  const processedProducts = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase();
    const filtered = products.filter((p) => {
      const matchSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.storeName.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query);

      const matchCat = categoryFilter === "ALL" || p.category === categoryFilter;
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter;

      return matchSearch && matchCat && matchStatus;
    });

    return filtered.sort((a, b) => {
      let aVal: any = a[sortField] || "";
      let bVal: any = b[sortField] || "";
      if (sortField === "price" || sortField === "stock") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [products, deferredSearchQuery, categoryFilter, statusFilter, sortField, sortDirection]);

  // Paginated products
  const totalPages = Math.max(1, Math.ceil(processedProducts.length / PAGE_SIZE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return processedProducts.slice(start, start + PAGE_SIZE);
  }, [processedProducts, currentPage]);

  const handleSortToggle = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const isAllSelected = processedProducts.length > 0 && selectedIds.length === processedProducts.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < processedProducts.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(processedProducts.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApprove = (id: string) => {
    updateProduct(id, { status: "APPROVED" });
  };

  const handleOpenReject = (prod: AdminProduct) => {
    setRejectingProduct(prod);
    setRejectionReason("");
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingProduct) return;
    updateProduct(rejectingProduct.id, { status: "REJECTED" });
    setRejectingProduct(null);
  };

  const handleBulkStatus = (status: AdminProduct["status"]) => {
    if (!selectedIds.length) return;
    bulkUpdateProductStatus(selectedIds, status);
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    exportToCSV(
      "Product_Moderation_Recap",
      processedProducts.map((p) => ({
        ID: p.id,
        Name: p.name,
        Brand: p.brand,
        Category: p.category,
        Price_USD: p.price,
        Stock: p.stock,
        SoundSignature: p.soundSignature,
        StoreName: p.storeName,
        Status: p.status,
        CreatedAt: p.createdAt,
      }))
    );
  };

  return (
    <div className="space-y-6 text-[#FAF9F6] selection:bg-white selection:text-black">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold bg-[#1C1C1C] text-[#FAF9F6] border border-[#2E2E2E] px-2 py-0.5 rounded uppercase tracking-wider">
              {isEn ? "Product Approvals" : "Persetujuan Produk"}
            </span>
            <span className="text-[11px] font-mono text-[#888]">
              {isEn ? "New Product Inspection Queue" : "Antrean Pemeriksaan Produk Baru"}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans">
            {isEn ? "Product Approval & Moderation" : "Persetujuan & Moderasi Produk"}
          </h1>
          <p className="text-xs text-[#888] font-sans mt-0.5">
            {isEn
              ? "Verify acoustic specs, high-res photos, driver configurations, and merchant retail prices."
              : "Periksa spesifikasi audio, foto barang, kelengkapan driver, dan harga produk dari penjual."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#141414] hover:bg-[#1f1f1f] border border-[#2a2a2a] hover:border-[#444] text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {isEn ? "Export Report (.CSV)" : "Unduh Laporan (.CSV)"}
          </button>
        </div>
      </div>

      {/* KPI Stats Cards with Micro-Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Pending Moderation */}
        <div className="bg-[#111] border border-[#222] hover:border-[#333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888] uppercase tracking-wider">
                {isEn ? "Pending Review" : "Menunggu Persetujuan"}
              </p>
              <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {pendingCount} {isEn ? "Products" : "Produk"}
              </p>
            </div>
            <div className="w-20 h-10 shrink-0 opacity-70">
              <AreaChart data={sparklinePending} aspectRatio="2 / 1" className="w-full h-full">
                <Area dataKey="val" stroke="#f59e0b" fill="#f59e0b" strokeWidth={1.5} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a] text-[11px] font-mono text-[#777]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>{isEn ? "Photos, price & spec audit" : "Pemeriksaan foto, harga & spesifikasi"}</span>
          </div>
        </div>

        {/* Card 2: Active Approved Gear */}
        <div className="bg-[#111] border border-[#222] hover:border-[#333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888] uppercase tracking-wider">
                {isEn ? "Active Verified Gear" : "Produk Aktif Terverifikasi"}
              </p>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {approvedCount} {isEn ? "Products" : "Produk"}
              </p>
            </div>
            <div className="w-20 h-10 shrink-0 opacity-70">
              <AreaChart data={sparklineApproved} aspectRatio="2 / 1" className="w-full h-full">
                <Area dataKey="val" stroke="#10b981" fill="#10b981" strokeWidth={1.5} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a] text-[11px] font-mono text-[#777]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{isEn ? "Live on catalog & ready to buy" : "Tayang di etalase toko & siap dibeli"}</span>
          </div>
        </div>

        {/* Card 3: Rejected Listings */}
        <div className="bg-[#111] border border-[#222] hover:border-[#333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888] uppercase tracking-wider">
                {isEn ? "Rejected / Needs Revision" : "Ditolak / Perlu Revisi"}
              </p>
              <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
                {rejectedCount} {isEn ? "Products" : "Produk"}
              </p>
            </div>
            <div className="w-20 h-10 shrink-0 opacity-70">
              <AreaChart data={sparklineRejected} aspectRatio="2 / 1" className="w-full h-full">
                <Area dataKey="val" stroke="#f43f5e" fill="#f43f5e" strokeWidth={1.5} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a] text-[11px] font-mono text-[#777]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>{isEn ? "Returned to merchant with feedback" : "Dikembalikan ke penjual dengan catatan"}</span>
          </div>
        </div>

      </div>

      {/* Controls & Filter Toolbar */}
      <div className="bg-[#111] border border-[#222] p-3.5 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder={isEn ? "Search gear, brand, store..." : "Cari produk, brand, toko..."}
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
                { id: "ALL", label: isEn ? "All Products" : "Semua Produk" },
                { id: "PENDING", label: isEn ? `Pending (${pendingCount})` : `Menunggu (${pendingCount})` },
                { id: "APPROVED", label: isEn ? "Approved" : "Disetujui" },
                { id: "REJECTED", label: isEn ? "Rejected" : "Ditolak" },
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

            {/* Custom Category Dropdown */}
            <CustomSelect
              variant="compact"
              value={categoryFilter}
              onChange={(val) => setCategoryFilter(val)}
              options={[
                { label: isEn ? "All Categories" : "Semua Kategori", value: "ALL" },
                { label: "In-Ear Monitors", value: "In-Ear Monitors" },
                { label: "DAC / Amp", value: "DAC / Amp" },
                { label: isEn ? "Upgrade Cables" : "Kabel Upgrade", value: "Upgrade Cables" },
                { label: isEn ? "Accessories" : "Aksesoris", value: "Accessories" },
              ]}
              buttonClassName="bg-[#161616] border border-[#2a2a2a] hover:border-[#444] text-xs font-mono text-white px-3 py-1.5 rounded-lg flex items-center justify-between gap-2 cursor-pointer"
            />

            {/* Sort Custom Dropdown */}
            <CustomSelect
              variant="compact"
              value={`${sortField}-${sortDirection}`}
              onChange={(val) => {
                const [field, dir] = val.split("-") as [typeof sortField, typeof sortDirection];
                setSortField(field);
                setSortDirection(dir);
              }}
              options={[
                { label: isEn ? "Newest Submission" : "Pendaftaran Terbaru", value: "createdAt-desc" },
                { label: isEn ? "Oldest Submission" : "Pendaftaran Terlama", value: "createdAt-asc" },
                { label: isEn ? "Price: High to Low" : "Harga: Tertinggi ke Terendah", value: "price-desc" },
                { label: isEn ? "Price: Low to High" : "Harga: Terendah ke Tertinggi", value: "price-asc" },
                { label: isEn ? "Stock Quantity" : "Jumlah Stok", value: "stock-desc" },
              ]}
              buttonClassName="bg-[#161616] border border-[#2a2a2a] hover:border-[#444] text-xs font-mono text-white px-3 py-1.5 rounded-lg flex items-center justify-between gap-2 cursor-pointer"
            />
          </div>
        </div>

        {/* Batch Moderation Bar */}
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between bg-[#181818] border border-[#333] px-3.5 py-2 rounded-lg text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="font-mono font-bold text-white">{selectedIds.length}</span>
              <span className="text-[#888]">{isEn ? "products selected" : "produk dipilih"}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatus("APPROVED")}
                className="px-3 py-1.5 bg-[#242424] hover:bg-[#333] border border-[#383838] text-white font-mono font-bold rounded cursor-pointer transition-colors"
              >
                {isEn ? "Approve All" : "Setujui Semua"}
              </button>
              <button
                onClick={() => handleBulkStatus("REJECTED")}
                className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#262626] text-white border border-[#2E2E2E] font-mono font-bold rounded cursor-pointer transition-colors"
              >
                {isEn ? "Reject All" : "Tolak Semua"}
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-2 py-1.5 text-[#888] hover:text-white font-mono cursor-pointer"
              >
                {isEn ? "Cancel" : "Batal"}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222] bg-[#141414] text-[10px] font-mono uppercase text-[#777] tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className="rounded border-[#333] bg-[#1e1e1e] text-white focus:ring-0 cursor-pointer"
                  />
                </th>
                <th
                  onClick={() => handleSortToggle("name")}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{isEn ? "Product & Brand" : "Nama Produk & Brand"}</span>
                    {sortField === "name" && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle("category")}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  {isEn ? "Category" : "Kategori"}
                </th>
                <th className="py-3 px-4">{isEn ? "Store" : "Toko Penjual"}</th>
                <th className="py-3 px-4">{isEn ? "Sound Signature" : "Karakter Suara"}</th>
                <th
                  onClick={() => handleSortToggle("price")}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  {isEn ? "Price" : "Harga"}
                </th>
                <th
                  onClick={() => handleSortToggle("stock")}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  {isEn ? "Stock" : "Stok"}
                </th>
                <th
                  onClick={() => handleSortToggle("status")}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  Status
                </th>
                <th className="py-3 px-4 text-right">{isEn ? "Actions" : "Tindakan"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e] text-xs font-sans">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-[#141414] transition-colors ${
                        isSelected ? "bg-[#161616]" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(p.id)}
                          className="rounded border-[#333] bg-[#1e1e1e] text-white focus:ring-0 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span
                            className="font-bold text-white hover:underline cursor-pointer"
                            onClick={() => setInspectingProduct(p)}
                          >
                            {p.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#888]">
                            {p.brand} • {p.id}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-white/80 font-mono text-[11px] bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#2a2a2a]">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#aaa]">
                        {p.storeName}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#888]">
                        {p.soundSignature || "Reference"}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {formatPrice(p.price)}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span
                          className={`font-semibold ${
                            p.stock < 5 ? "text-amber-400" : "text-white"
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#161616] text-[#D4D4D8] border border-[#27272A]">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            p.status === "APPROVED" ? "bg-emerald-400" : p.status === "PENDING" ? "bg-amber-400" : "bg-rose-400"
                          }`} />
                          {p.status === "APPROVED" ? (isEn ? "Approved" : "Disetujui") : p.status === "PENDING" ? (isEn ? "Pending" : "Menunggu") : (isEn ? "Rejected" : "Ditolak")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectingProduct(p)}
                            title={isEn ? "Inspect Product Details" : "Lihat Rincian Produk"}
                            className="p-1.5 hover:bg-[#222] rounded-lg text-[#aaa] hover:text-white transition-colors cursor-pointer border border-[#2a2a2a]"
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>

                          {p.status !== "APPROVED" && (
                            <button
                              onClick={() => handleApprove(p.id)}
                              title={isEn ? "Approve Product" : "Setujui Produk"}
                              className="p-1.5 hover:bg-[#2A2A2A] rounded-lg text-white transition-colors cursor-pointer border border-[#2E2E2E] hover:border-white"
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </button>
                          )}

                          {p.status !== "REJECTED" && (
                            <button
                              onClick={() => handleOpenReject(p)}
                              title={isEn ? "Reject Product" : "Tolak Produk"}
                              className="p-1.5 hover:bg-[#2A2A2A] rounded-lg text-white transition-colors cursor-pointer border border-[#2E2E2E] hover:border-white"
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#666] font-mono">
                    {isEn ? "No products matching the active filters." : "Tidak ada produk yang sesuai dengan filter pencarian."}
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
                ? `Showing ${processedProducts.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}-${Math.min(currentPage * PAGE_SIZE, processedProducts.length)} of ${processedProducts.length} products`
                : `Menampilkan ${processedProducts.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}-${Math.min(currentPage * PAGE_SIZE, processedProducts.length)} dari ${processedProducts.length} produk`}
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

      {/* INSPECT PRODUCT DOSSIER MODAL */}
      <AnimatePresence>
        {inspectingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectingProduct(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1, y: 0 }}
              className="relative w-full max-w-xl bg-[#141414] border border-[#333] rounded-2xl p-5 sm:p-6 shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
                    {isEn ? "Product Inspection Dossier" : "Rincian Pemeriksaan Produk"}
                  </span>
                  <h3 className="text-base font-bold text-white font-sans mt-0.5">
                    {inspectingProduct.name}
                  </h3>
                </div>
                <button
                  onClick={() => setInspectingProduct(null)}
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
                    {isEn ? "Store / Merchant" : "Toko Penjual"}
                  </span>
                  <p className="font-bold text-white">{inspectingProduct.storeName}</p>
                  <p className="text-[#aaa] text-[11px] font-mono">Brand: {inspectingProduct.brand}</p>
                </div>

                <div className="bg-[#191919] p-3 rounded-xl border border-[#282828] space-y-1">
                  <span className="font-mono text-[10px] text-[#777] uppercase">
                    {isEn ? "Price & Stock" : "Harga & Stok"}
                  </span>
                  <p className="font-bold font-mono text-white text-sm">{formatPrice(inspectingProduct.price)}</p>
                  <p className="text-[#aaa] text-[11px] font-mono">
                    {isEn ? `Stock: ${inspectingProduct.stock} units` : `Stok: ${inspectingProduct.stock} unit`}
                  </p>
                </div>

                <div className="bg-[#191919] p-3 rounded-xl border border-[#282828] space-y-1">
                  <span className="font-mono text-[10px] text-[#777] uppercase">
                    {isEn ? "Sound Signature" : "Karakter Suara (Sound Signature)"}
                  </span>
                  <p className="font-bold text-white">{inspectingProduct.soundSignature || "Harman Target / Netral"}</p>
                  <p className="text-[#aaa] text-[11px]">
                    {isEn ? "Acoustic profile classification" : "Tipe respons suara audio"}
                  </p>
                </div>

                <div className="bg-[#191919] p-3 rounded-xl border border-[#282828] space-y-1">
                  <span className="font-mono text-[10px] text-[#777] uppercase">
                    {isEn ? "Product Category" : "Kategori Produk"}
                  </span>
                  <p className="font-bold text-white">{inspectingProduct.category}</p>
                  <p className="text-[#aaa] text-[11px] font-mono">
                    {isEn ? `Created: ${inspectingProduct.createdAt}` : `Dibuat: ${inspectingProduct.createdAt}`}
                  </p>
                </div>
              </div>

              <div className="bg-[#191919] p-3.5 rounded-xl border border-[#282828] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#777] uppercase block mb-1">Status</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#161616] text-[#D4D4D8] border border-[#27272A]">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      inspectingProduct.status === "APPROVED" ? "bg-emerald-400" : inspectingProduct.status === "PENDING" ? "bg-amber-400" : "bg-rose-400"
                    }`} />
                    {inspectingProduct.status === "APPROVED" ? (isEn ? "Approved" : "Disetujui") : inspectingProduct.status === "PENDING" ? (isEn ? "Pending" : "Menunggu") : (isEn ? "Rejected" : "Ditolak")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleApprove(inspectingProduct.id);
                      setInspectingProduct({ ...inspectingProduct, status: "APPROVED" });
                    }}
                    className="px-3.5 py-1.5 bg-white hover:bg-[#e5e5e5] text-black font-mono font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    {isEn ? "Approve Product" : "Setujui Produk"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenReject(inspectingProduct);
                      setInspectingProduct(null);
                    }}
                    className="px-3.5 py-1.5 bg-[#1C1C1C] hover:bg-[#282828] text-white border border-[#2E2E2E] font-mono font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    {isEn ? "Reject Product" : "Tolak Produk"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REJECT PRODUCT MODAL */}
      <AnimatePresence>
        {rejectingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectingProduct(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1, y: 0 }}
              className="relative w-full max-w-md bg-[#141414] border border-[#333] rounded-2xl p-5 shadow-2xl z-10 space-y-4"
            >
              <div className="border-b border-[#262626] pb-3">
                <span className="text-[10px] font-mono font-bold uppercase text-rose-400">
                  {isEn ? "Reject Product Listing" : "Tolak Produk"}
                </span>
                <h3 className="text-base font-bold text-white font-sans mt-0.5">
                  {isEn ? `Reject ${rejectingProduct.name}?` : `Tolak ${rejectingProduct.name}?`}
                </h3>
              </div>

              <form onSubmit={handleConfirmReject} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-[#aaa]">
                    {isEn ? "Rejection Reason / Revision Notes:" : "Alasan Penolakan / Catatan Perbaikan:"}
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder={isEn ? "e.g., Driver configuration missing, unofficial watermarked photos..." : "Contoh: Deskripsi spesifikasi driver tidak lengkap, foto bukan unit asli..."}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333] focus:border-rose-400 rounded-xl p-2.5 text-xs text-white outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectingProduct(null)}
                    className="px-3.5 py-1.5 bg-[#222] hover:bg-[#333] text-white text-xs font-mono rounded-lg transition-colors cursor-pointer"
                  >
                    {isEn ? "Cancel" : "Batal"}
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    {isEn ? "Confirm Rejection" : "Konfirmasi Tolak"}
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
