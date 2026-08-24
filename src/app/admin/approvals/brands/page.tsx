"use client";

import React, { useState, useMemo } from "react";
import { useAdminData, AdminBrand } from "@/context/AdminDataContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart } from "@/components/charts/area-chart";
import { Area } from "@/components/charts/area";
import CustomSelect from "@/components/ui/custom-select";

export default function BrandApprovalsPage() {
  const { brands, updateBrand, bulkUpdateBrandStatus, exportToCSV } = useAdminData();
  const { language } = useLanguage();
  const isEn = language === "English";

  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"name" | "country" | "tier" | "status" | "productCount" | "createdAt">("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [inspectingBrand, setInspectingBrand] = useState<AdminBrand | null>(null);
  const [rejectingBrand, setRejectingBrand] = useState<AdminBrand | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const pendingCount = brands.filter((b) => b.status === "PENDING").length;
  const approvedCount = brands.filter((b) => b.status === "APPROVED").length;
  const rejectedCount = brands.filter((b) => b.status === "REJECTED").length;

  // Micro Sparklines
  const sparklinePending = useMemo(() => [
    { date: new Date("2026-08-10"), val: 1 },
    { date: new Date("2026-08-11"), val: 1 },
    { date: new Date("2026-08-12"), val: 2 },
    { date: new Date("2026-08-13"), val: 2 },
    { date: new Date("2026-08-14"), val: 3 },
    { date: new Date("2026-08-15"), val: 3 },
    { date: new Date("2026-08-16"), val: pendingCount },
  ], [pendingCount]);

  const sparklineApproved = useMemo(() => [
    { date: new Date("2026-08-10"), val: 3 },
    { date: new Date("2026-08-11"), val: 4 },
    { date: new Date("2026-08-12"), val: 4 },
    { date: new Date("2026-08-13"), val: 5 },
    { date: new Date("2026-08-14"), val: 5 },
    { date: new Date("2026-08-15"), val: 6 },
    { date: new Date("2026-08-16"), val: approvedCount },
  ], [approvedCount]);

  const sparklineRejected = useMemo(() => [
    { date: new Date("2026-08-10"), val: 0 },
    { date: new Date("2026-08-11"), val: 0 },
    { date: new Date("2026-08-12"), val: 1 },
    { date: new Date("2026-08-13"), val: 1 },
    { date: new Date("2026-08-14"), val: 1 },
    { date: new Date("2026-08-15"), val: 1 },
    { date: new Date("2026-08-16"), val: rejectedCount },
  ], [rejectedCount]);

  const processedBrands = useMemo(() => {
    const filtered = brands.filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTier = tierFilter === "ALL" || b.tier === tierFilter;
      const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
      return matchSearch && matchTier && matchStatus;
    });

    return filtered.sort((a, b) => {
      let aVal: any = a[sortField] || "";
      let bVal: any = b[sortField] || "";
      if (sortField === "productCount") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [brands, searchQuery, tierFilter, statusFilter, sortField, sortDirection]);

  const handleSortToggle = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const isAllSelected = processedBrands.length > 0 && selectedIds.length === processedBrands.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < processedBrands.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(processedBrands.map((b) => b.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApprove = (id: string) => {
    updateBrand(id, { status: "APPROVED" });
  };

  const handleOpenReject = (b: AdminBrand) => {
    setRejectingBrand(b);
    setRejectionReason("");
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingBrand) return;
    updateBrand(rejectingBrand.id, { status: "REJECTED" });
    setRejectingBrand(null);
  };

  const handleBulkStatus = (status: AdminBrand["status"]) => {
    if (!selectedIds.length) return;
    bulkUpdateBrandStatus(selectedIds, status);
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    const dataToExport = processedBrands.map((b) => ({
      ID: b.id,
      Name: b.name,
      Country: b.country,
      Tier: b.tier,
      Status: b.status,
      ProductCount: b.productCount,
      SubmittedBy: b.submittedBy || "Verified Partner",
      CreatedAt: b.createdAt,
    }));
    exportToCSV("tonalzone_brands_moderation", dataToExport);
  };

  return (
    <div className="space-y-6 text-[#FAF9F6] selection:bg-white selection:text-black">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold bg-[#1C1C1C] text-[#FAF9F6] border border-[#2E2E2E] px-2 py-0.5 rounded uppercase tracking-wider">
              {isEn ? "Brand Approvals" : "Persetujuan Brand"}
            </span>
            <span className="text-[11px] font-mono text-[#888]">
              {isEn ? "Audio Brand Licensing & Distributor Audit" : "Pemeriksaan Lisensi Brand Audio"}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans">
            {isEn ? "Brand Catalog Approvals" : "Persetujuan & Katalog Brand"}
          </h1>
          <p className="text-xs text-[#888] font-sans mt-0.5">
            {isEn
              ? "Audit new IEM brand submissions and authorized distributor certificates before catalog inclusion."
              : "Periksa pengajuan brand IEM baru dan izin distributor resmi sebelum didaftarkan di katalog."}
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
        
        {/* Card 1: Pending Brand Requests */}
        <div className="bg-[#111] border border-[#222] hover:border-[#333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888] uppercase tracking-wider">
                {isEn ? "Pending Requests" : "Menunggu Persetujuan"}
              </p>
              <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {pendingCount} {isEn ? "New Brands" : "Brand Baru"}
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
            <span>{isEn ? "Distribution rights audit" : "Pemeriksaan legalitas & hak distribusi"}</span>
          </div>
        </div>

        {/* Card 2: Approved Active Brands */}
        <div className="bg-[#111] border border-[#222] hover:border-[#333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888] uppercase tracking-wider">
                {isEn ? "Official Registered Brands" : "Brand Resmi Terdaftar"}
              </p>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {approvedCount} {isEn ? "Active Brands" : "Brand Aktif"}
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
            <span>{isEn ? "Active in filter & catalog search" : "Aktif di filter & pencarian katalog"}</span>
          </div>
        </div>

        {/* Card 3: Rejected Brands */}
        <div className="bg-[#111] border border-[#222] hover:border-[#333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888] uppercase tracking-wider">
                {isEn ? "Rejected" : "Ditolak"}
              </p>
              <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
                {rejectedCount} {isEn ? "Brands" : "Brand"}
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
            <span>{isEn ? "Invalid distributor authorization" : "Surat izin distributor tidak valid"}</span>
          </div>
        </div>

      </div>

      {/* Toolbar & Filters */}
      <div className="bg-[#111] border border-[#222] p-3.5 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder={isEn ? "Search brand, country..." : "Cari brand, negara..."}
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
                { id: "ALL", label: isEn ? "All Brands" : "Semua Brand" },
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

            {/* Custom Tier Dropdown */}
            <CustomSelect
              variant="compact"
              value={tierFilter}
              onChange={(val) => setTierFilter(val)}
              options={[
                { label: isEn ? "All Tiers" : "Semua Kategori", value: "ALL" },
                { label: isEn ? "Flagship Tier" : "Brand Flagship", value: "Flagship" },
                { label: isEn ? "Premium Tier" : "Brand Premium", value: "Premium" },
                { label: "Chi-Fi (Budget)", value: "Chi-Fi" },
                { label: isEn ? "Custom Artisan" : "Custom Artisan", value: "Custom IEM" },
              ]}
              buttonClassName="bg-[#161616] border border-[#2a2a2a] hover:border-[#444] text-xs font-mono text-white px-3 py-1.5 rounded-lg flex items-center justify-between gap-2 cursor-pointer"
            />

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
                { label: isEn ? "Newest" : "Paling Baru", value: "createdAt-desc" },
                { label: isEn ? "Oldest" : "Paling Lama", value: "createdAt-asc" },
                { label: isEn ? "Brand Name (A-Z)" : "Nama Brand (A-Z)", value: "name-asc" },
                { label: isEn ? "Brand Name (Z-A)" : "Nama Brand (Z-A)", value: "name-desc" },
                { label: isEn ? "Most Products" : "Produk Terbanyak", value: "productCount-desc" },
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
              <span className="text-[#888]">{isEn ? "brands selected" : "brand dipilih"}</span>
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
                    <span>{isEn ? "Brand Name" : "Nama Brand"}</span>
                    {sortField === "name" && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle("tier")}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{isEn ? "Tier Category" : "Kategori Tier"}</span>
                    {sortField === "tier" && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th className="py-3 px-4">{isEn ? "Origin Country" : "Negara Asal"}</th>
                <th className="py-3 px-4">{isEn ? "Submitted By" : "Diajukan Oleh"}</th>
                <th
                  onClick={() => handleSortToggle("status")}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {sortField === "status" && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th className="py-3 px-4 text-right">{isEn ? "Actions" : "Tindakan"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e] text-xs font-sans">
              {processedBrands.length > 0 ? (
                processedBrands.map((b) => {
                  const isSelected = selectedIds.includes(b.id);
                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-[#141414] transition-colors ${
                        isSelected ? "bg-[#161616]" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(b.id)}
                          className="rounded border-[#333] bg-[#1e1e1e] text-white focus:ring-0 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span
                            className="font-bold text-white hover:underline cursor-pointer"
                            onClick={() => setInspectingBrand(b)}
                          >
                            {b.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#888]">{b.id}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-white font-medium bg-[#1e1e1e] border border-[#333] px-2 py-0.5 rounded text-[11px] font-mono">
                          {b.tier}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#aaa]">
                        {b.country}
                      </td>

                      <td className="py-3.5 px-4 text-[#888]">
                        {b.submittedBy || (isEn ? "Official Catalog" : "Katalog Resmi")}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#161616] text-[#D4D4D8] border border-[#27272A]">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            b.status === "APPROVED" ? "bg-emerald-400" : b.status === "PENDING" ? "bg-amber-400" : "bg-rose-400"
                          }`} />
                          {b.status === "APPROVED" ? (isEn ? "Approved" : "Disetujui") : b.status === "PENDING" ? (isEn ? "Pending" : "Menunggu") : (isEn ? "Rejected" : "Ditolak")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectingBrand(b)}
                            title={isEn ? "Inspect Brand Dossier" : "Lihat Rincian Brand"}
                            className="p-1.5 hover:bg-[#222] rounded-lg text-[#aaa] hover:text-white transition-colors cursor-pointer border border-[#2a2a2a]"
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>

                          {b.status !== "APPROVED" && (
                            <button
                              onClick={() => handleApprove(b.id)}
                              title={isEn ? "Approve Brand" : "Setujui Brand"}
                              className="p-1.5 hover:bg-[#2A2A2A] rounded-lg text-white transition-colors cursor-pointer border border-[#2E2E2E] hover:border-white"
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </button>
                          )}

                          {b.status !== "REJECTED" && (
                            <button
                              onClick={() => handleOpenReject(b)}
                              title={isEn ? "Reject Brand" : "Tolak Brand"}
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
                  <td colSpan={7} className="py-12 text-center text-[#666] font-mono">
                    {isEn ? "No brands found matching the filter criteria." : "Tidak ada data brand yang sesuai."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 border-t border-[#1e1e1e] bg-[#141414] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#777] gap-2">
          <span>
            {isEn ? `Showing ${processedBrands.length} of ${brands.length} cataloged brands` : `Menampilkan ${processedBrands.length} dari ${brands.length} brand katalog`}
          </span>
          <span className="text-[11px]">{isEn ? "Strict Catalog Moderation Active" : "Moderasi Katalog Aktif"}</span>
        </div>
      </div>

      {/* INSPECT BRAND MODAL */}
      <AnimatePresence>
        {inspectingBrand && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectingBrand(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1, y: 0 }}
              className="relative w-full max-w-lg bg-[#141414] border border-[#333] rounded-2xl p-5 sm:p-6 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
                    {isEn ? "Brand Catalog Dossier" : "Rincian Berkas Brand"}
                  </span>
                  <h3 className="text-base font-bold text-white uppercase font-heading mt-0.5">
                    {inspectingBrand.name}
                  </h3>
                </div>
                <button
                  onClick={() => setInspectingBrand(null)}
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
                    {isEn ? "Classification Tier" : "Kategori Tier"}
                  </span>
                  <p className="font-bold text-white">{inspectingBrand.tier}</p>
                  <p className="text-[#aaa] text-[11px]">{isEn ? "Authorized Audio Lineup" : "Klasifikasi Portofolio IEM"}</p>
                </div>

                <div className="bg-[#191919] p-3 rounded-xl border border-[#282828] space-y-1">
                  <span className="font-mono text-[10px] text-[#777] uppercase">
                    {isEn ? "Origin Country" : "Negara Asal"}
                  </span>
                  <p className="font-bold text-white">{inspectingBrand.country}</p>
                  <p className="text-[#aaa] text-[11px]">{isEn ? "Headquarters / Assembly" : "Pusat Riset & Pabrik"}</p>
                </div>

                <div className="bg-[#191919] p-3 rounded-xl border border-[#282828] space-y-1">
                  <span className="font-mono text-[10px] text-[#777] uppercase">
                    {isEn ? "Submitted By" : "Diajukan Oleh"}
                  </span>
                  <p className="font-bold text-white">{inspectingBrand.submittedBy || (isEn ? "Official Tonal Zone Registry" : "Katalog Resmi Tonal Zone")}</p>
                  <p className="text-[#aaa] text-[11px] font-mono">{isEn ? `Date: ${inspectingBrand.createdAt}` : `Tanggal: ${inspectingBrand.createdAt}`}</p>
                </div>

                <div className="bg-[#191919] p-3 rounded-xl border border-[#282828] space-y-1">
                  <span className="font-mono text-[10px] text-[#777] uppercase">
                    {isEn ? "Linked Listings" : "Produk Terhubung"}
                  </span>
                  <p className="font-bold font-mono text-white text-sm">
                    {inspectingBrand.productCount} {isEn ? "Items" : "Produk"}
                  </p>
                  <p className="text-[#aaa] text-[11px]">{isEn ? "Active Marketplace Listings" : "Katalog aktif di toko"}</p>
                </div>
              </div>

              <div className="bg-[#191919] p-3.5 rounded-xl border border-[#282828] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#777] uppercase block mb-1">Status</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#161616] text-[#D4D4D8] border border-[#27272A]">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      inspectingBrand.status === "APPROVED" ? "bg-emerald-400" : inspectingBrand.status === "PENDING" ? "bg-amber-400" : "bg-rose-400"
                    }`} />
                    {inspectingBrand.status === "APPROVED" ? (isEn ? "Approved" : "Disetujui") : inspectingBrand.status === "PENDING" ? (isEn ? "Pending" : "Menunggu") : (isEn ? "Rejected" : "Ditolak")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleApprove(inspectingBrand.id);
                      setInspectingBrand({ ...inspectingBrand, status: "APPROVED" });
                    }}
                    className="px-3.5 py-1.5 bg-white hover:bg-[#e5e5e5] text-black font-mono font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    {isEn ? "Approve Brand" : "Setujui Brand"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenReject(inspectingBrand);
                      setInspectingBrand(null);
                    }}
                    className="px-3.5 py-1.5 bg-[#1C1C1C] hover:bg-[#282828] text-white border border-[#2E2E2E] font-mono font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    {isEn ? "Reject" : "Tolak"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REJECT BRAND MODAL */}
      <AnimatePresence>
        {rejectingBrand && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectingBrand(null)}
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
                  {isEn ? "Brand Rejection" : "Penolakan Brand"}
                </span>
                <h3 className="text-base font-bold text-white font-heading mt-0.5">
                  {isEn ? `Reject ${rejectingBrand.name}?` : `Tolak ${rejectingBrand.name}?`}
                </h3>
              </div>

              <form onSubmit={handleConfirmReject} className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-[#aaa]">
                    {isEn ? "Rejection Reason / Notes:" : "Alasan Penolakan / Catatan:"}
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder={isEn ? "e.g., Distributor licensing documents are invalid..." : "Contoh: Dokumen lisensi distributor tidak valid..."}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333] focus:border-rose-400 rounded-xl p-2.5 text-xs text-white outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectingBrand(null)}
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
