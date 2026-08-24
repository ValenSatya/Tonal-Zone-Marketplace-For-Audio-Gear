"use client";

import React, { useState, useMemo } from "react";
import { useAdminData, AdminStore } from "@/context/AdminDataContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart } from "@/components/charts/area-chart";
import { Area } from "@/components/charts/area";
import CustomSelect from "@/components/ui/custom-select";

export default function SellerApprovalsPage() {
  const { stores, updateStoreStatus, bulkUpdateStoreStatus, exportToCSV } = useAdminData();
  const { language } = useLanguage();
  const isEn = language === "English";

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"storeName" | "ownerName" | "brandFocus" | "status" | "submittedAt">("submittedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal State
  const [viewingStore, setViewingStore] = useState<AdminStore | null>(null);
  const [rejectingStore, setRejectingStore] = useState<AdminStore | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const pendingCount = stores.filter((s) => s.status === "PENDING").length;
  const approvedCount = stores.filter((s) => s.status === "APPROVED").length;
  const suspendedCount = stores.filter((s) => s.status === "SUSPENDED" || s.status === "REJECTED").length;

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
    { date: new Date("2026-08-10"), val: 2 },
    { date: new Date("2026-08-11"), val: 2 },
    { date: new Date("2026-08-12"), val: 3 },
    { date: new Date("2026-08-13"), val: 3 },
    { date: new Date("2026-08-14"), val: 4 },
    { date: new Date("2026-08-15"), val: 4 },
    { date: new Date("2026-08-16"), val: approvedCount },
  ], [approvedCount]);

  const sparklineSuspended = useMemo(() => [
    { date: new Date("2026-08-10"), val: 0 },
    { date: new Date("2026-08-11"), val: 0 },
    { date: new Date("2026-08-12"), val: 0 },
    { date: new Date("2026-08-13"), val: 1 },
    { date: new Date("2026-08-14"), val: 1 },
    { date: new Date("2026-08-15"), val: 1 },
    { date: new Date("2026-08-16"), val: suspendedCount },
  ], [suspendedCount]);

  const processedStores = useMemo(() => {
    const filtered = stores.filter((s) => {
      const matchSearch =
        s.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nik.includes(searchQuery) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === "ALL" || s.status === statusFilter;
      return matchSearch && matchStatus;
    });

    return filtered.sort((a, b) => {
      let aVal = a[sortField] || "";
      let bVal = b[sortField] || "";
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [stores, searchQuery, statusFilter, sortField, sortDirection]);

  const handleSortToggle = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const isAllSelected = processedStores.length > 0 && selectedIds.length === processedStores.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < processedStores.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(processedStores.map((s) => s.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApprove = (id: string) => {
    updateStoreStatus(id, "APPROVED");
  };

  const handleOpenReject = (store: AdminStore) => {
    setRejectingStore(store);
    setRejectionReason("");
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingStore) return;
    updateStoreStatus(rejectingStore.id, "REJECTED", rejectionReason.trim() || "Dokumen belum memenuhi syarat.");
    setRejectingStore(null);
  };

  const handleSuspend = (id: string) => {
    updateStoreStatus(id, "SUSPENDED", "Ditangguhkan oleh Super Admin (Indikasi Pelanggaran).");
  };

  const handleBulkApprove = () => {
    if (!selectedIds.length) return;
    bulkUpdateStoreStatus(selectedIds, "APPROVED");
    setSelectedIds([]);
  };

  const handleBulkReject = () => {
    if (!selectedIds.length) return;
    bulkUpdateStoreStatus(selectedIds, "REJECTED");
    setSelectedIds([]);
  };

  const handleBulkSuspend = () => {
    if (!selectedIds.length) return;
    bulkUpdateStoreStatus(selectedIds, "SUSPENDED");
    setSelectedIds([]);
  };

  const handleExport = () => {
    const dataToExport = processedStores.map((s) => ({
      ID: s.id,
      StoreName: s.storeName,
      OwnerName: s.ownerName,
      Email: s.email,
      BrandFocus: s.brandFocus,
      NIK: s.nik,
      BankName: s.bankName,
      BankAccount: s.bankAccount,
      Status: s.status,
      SubmittedAt: s.submittedAt,
    }));
    exportToCSV("tonalzone_seller_applications", dataToExport);
  };

  return (
    <div className="space-y-6 text-[#FAF9F6] selection:bg-white selection:text-black">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold bg-[#1C1C1C] text-[#FAF9F6] border border-[#2E2E2E] px-2 py-0.5 rounded uppercase tracking-wider">
              {isEn ? "Store Verification" : "Verifikasi Toko"}
            </span>
            <span className="text-[11px] font-mono text-[#888]">
              {isEn ? "Merchant KYC & Financial Auditing" : "Pemeriksaan Data Calon Penjual"}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans">
            {isEn ? "Merchant & Store Verification" : "Verifikasi Penjual & Toko Baru"}
          </h1>
          <p className="text-xs text-[#888] font-sans mt-0.5">
            {isEn
              ? "Verify national identity records, bank disbursement details, and brand authorization credentials."
              : "Periksa data KTP pemilik toko, nomor rekening bank, dan izin berjualan di marketplace."}
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

      {/* KPI Stats Cards with Micro-Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Pending Verification */}
        <div className="bg-[#111] border border-[#222] hover:border-[#333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888] uppercase tracking-wider">
                {isEn ? "Pending Verification" : "Menunggu Verifikasi"}
              </p>
              <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {pendingCount} {isEn ? "Applicants" : "Pendaftar"}
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
            <span>{isEn ? "ID & bank account audits" : "Pemeriksaan KTP & nomor rekening"}</span>
          </div>
        </div>

        {/* Card 2: Verified Merchant Stores */}
        <div className="bg-[#111] border border-[#222] hover:border-[#333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888] uppercase tracking-wider">
                {isEn ? "Active Verified Stores" : "Toko Aktif Terverifikasi"}
              </p>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {approvedCount} {isEn ? "Active Stores" : "Toko Aktif"}
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
            <span>{isEn ? "Authorized to sell & disburse" : "Diizinkan jualan & cairkan dana"}</span>
          </div>
        </div>

        {/* Card 3: Suspended / Inactive */}
        <div className="bg-[#111] border border-[#222] hover:border-[#333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888] uppercase tracking-wider">
                {isEn ? "Rejected / Suspended" : "Ditolak / Dinonaktifkan"}
              </p>
              <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
                {suspendedCount} {isEn ? "Stores" : "Toko"}
              </p>
            </div>
            <div className="w-20 h-10 shrink-0 opacity-70">
              <AreaChart data={sparklineSuspended} aspectRatio="2 / 1" className="w-full h-full">
                <Area dataKey="val" stroke="#f43f5e" fill="#f43f5e" strokeWidth={1.5} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a] text-[11px] font-mono text-[#777]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>{isEn ? "Store access restricted" : "Akses toko dibatasi sementara"}</span>
          </div>
        </div>

      </div>

      {/* Toolbar & Filters */}
      <div className="bg-[#111] border border-[#222] p-3.5 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder={isEn ? "Search store, owner, email, NIK..." : "Cari toko, pemilik, email, NIK..."}
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
            {/* Status Tabs */}
            <div className="flex items-center bg-[#161616] p-1 rounded-lg border border-[#262626]">
              {[
                { id: "ALL", label: isEn ? "All Applicants" : "Semua Pendaftar" },
                { id: "PENDING", label: isEn ? `Pending (${pendingCount})` : `Menunggu (${pendingCount})` },
                { id: "APPROVED", label: isEn ? "Approved" : "Disetujui" },
                { id: "SUSPENDED", label: isEn ? "Suspended" : "Dinonaktifkan" },
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

            {/* Sort Control */}
            <CustomSelect
              variant="compact"
              value={`${sortField}-${sortDirection}`}
              onChange={(val) => {
                const [field, dir] = val.split("-") as [typeof sortField, typeof sortDirection];
                setSortField(field);
                setSortDirection(dir);
              }}
              options={[
                { label: isEn ? "Newest Submission" : "Pendaftaran Terbaru", value: "submittedAt-desc" },
                { label: isEn ? "Oldest Submission" : "Pendaftaran Terlama", value: "submittedAt-asc" },
                { label: isEn ? "Store Name (A-Z)" : "Nama Toko (A-Z)", value: "storeName-asc" },
                { label: isEn ? "Owner Name (A-Z)" : "Nama Pemilik (A-Z)", value: "ownerName-asc" },
              ]}
              buttonClassName="bg-[#161616] border border-[#2a2a2a] hover:border-[#444] text-xs font-mono text-white px-3 py-1.5 rounded-lg flex items-center justify-between gap-2 cursor-pointer"
            />
          </div>
        </div>

        {/* Multi-Select Floating Bulk Action Bar */}
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
              <span className="text-[#888]">{isEn ? "selected" : "toko dipilih"}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkApprove}
                className="px-3 py-1.5 bg-[#242424] hover:bg-[#333] border border-[#383838] text-white font-mono font-bold rounded cursor-pointer transition-colors"
              >
                {isEn ? "Approve All" : "Setujui Semua"}
              </button>
              <button
                onClick={handleBulkReject}
                className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#262626] text-white border border-[#2E2E2E] font-mono font-bold rounded cursor-pointer transition-colors"
              >
                {isEn ? "Reject All" : "Tolak Semua"}
              </button>
              <button
                onClick={handleBulkSuspend}
                className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#262626] text-white border border-[#2E2E2E] font-mono font-bold rounded cursor-pointer transition-colors"
              >
                {isEn ? "Suspend" : "Nonaktifkan"}
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
                  onClick={() => handleSortToggle("storeName")}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{isEn ? "Store & Owner Name" : "Nama Toko & Pemilik"}</span>
                    {sortField === "storeName" && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle("brandFocus")}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  {isEn ? "Brand Focus" : "Fokus Brand"}
                </th>
                <th className="py-3 px-4">{isEn ? "National ID & Bank Account" : "NIK & Rekening Bank"}</th>
                <th
                  onClick={() => handleSortToggle("status")}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  Status
                </th>
                <th
                  onClick={() => handleSortToggle("submittedAt")}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  {isEn ? "Submission Date" : "Tgl Pengajuan"}
                </th>
                <th className="py-3 px-4 text-right">{isEn ? "Actions" : "Tindakan"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e] text-xs font-sans">
              {processedStores.length > 0 ? (
                processedStores.map((store) => {
                  const isSelected = selectedIds.includes(store.id);
                  return (
                    <tr
                      key={store.id}
                      className={`hover:bg-[#141414] transition-colors ${
                        isSelected ? "bg-[#161616]" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(store.id)}
                          className="rounded border-[#333] bg-[#1e1e1e] text-white focus:ring-0 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#1c1c1c] border border-[#2e2e2e] flex items-center justify-center font-mono font-bold text-xs text-white shrink-0">
                            {store.storeName.charAt(0)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span
                              className="font-bold text-white hover:underline cursor-pointer truncate"
                              onClick={() => setViewingStore(store)}
                            >
                              {store.storeName}
                            </span>
                            <span className="text-[11px] text-[#777] font-mono truncate">{store.ownerName}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-mono text-[#aaa]">
                          {store.brandFocus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col font-mono text-[11px]">
                          <span className="text-white">{store.bankName} - {store.bankAccount}</span>
                          <span className="text-[#666]">NIK: {store.nik}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#161616] text-[#D4D4D8] border border-[#27272A]">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            store.status === "APPROVED" ? "bg-emerald-400" : store.status === "PENDING" ? "bg-amber-400" : "bg-rose-400"
                          }`} />
                          {store.status === "APPROVED" ? (isEn ? "Approved" : "Disetujui") : store.status === "PENDING" ? (isEn ? "Pending" : "Menunggu") : (isEn ? "Rejected" : "Ditolak")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[#888] text-[11px]">
                        {store.submittedAt}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingStore(store)}
                            title={isEn ? "View Details" : "Lihat Rincian"}
                            className="p-1.5 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2e2e2e] text-[#aaa] hover:text-white rounded-lg transition-colors cursor-pointer"
                          >
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                          {store.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApprove(store.id)}
                                title={isEn ? "Approve Store" : "Setujui Toko"}
                                className="p-1.5 bg-[#1C1C1C] hover:bg-[#2A2A2A] border border-[#2E2E2E] hover:border-white text-white rounded-lg transition-colors cursor-pointer"
                              >
                                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleOpenReject(store)}
                                title={isEn ? "Reject Applicant" : "Tolak Pendaftaran"}
                                className="p-1.5 bg-[#1C1C1C] hover:bg-[#2A2A2A] border border-[#2E2E2E] hover:border-white text-white rounded-lg transition-colors cursor-pointer"
                              >
                                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          )}
                          {store.status === "APPROVED" && (
                            <button
                              onClick={() => handleSuspend(store.id)}
                              className="px-2.5 py-1 bg-[#1C1C1C] hover:bg-[#282828] text-white border border-[#2E2E2E] text-xs font-mono rounded-lg transition-colors cursor-pointer"
                            >
                              {isEn ? "Suspend" : "Nonaktifkan"}
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
                    {isEn ? "No matching seller applicants found." : "Tidak ada data pendaftaran toko yang sesuai."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 border-t border-[#1e1e1e] bg-[#141414] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#777] gap-2">
          <span>
            {isEn ? `Showing ${processedStores.length} of ${stores.length} stores` : `Menampilkan ${processedStores.length} dari ${stores.length} toko`}
          </span>
          <span className="text-[11px]">{isEn ? "Tonal Zone Merchant Verification" : "Verifikasi Toko Tonal Zone"}</span>
        </div>
      </div>

      {/* Store KYC Detail Modal */}
      <AnimatePresence>
        {viewingStore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingStore(null)}
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
                    {isEn ? "Store Dossier Inspection" : "Rincian Pendaftaran Toko"}
                  </span>
                  <h3 className="text-base font-bold text-white font-sans mt-0.5">
                    {viewingStore.storeName}
                  </h3>
                </div>
                <button
                  onClick={() => setViewingStore(null)}
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
                    {isEn ? "Store Owner" : "Pemilik Toko"}
                  </span>
                  <p className="font-bold text-white">{viewingStore.ownerName}</p>
                  <p className="text-[#aaa] text-[11px] font-mono">{viewingStore.email}</p>
                </div>

                <div className="bg-[#191919] p-3 rounded-xl border border-[#282828] space-y-1">
                  <span className="font-mono text-[10px] text-[#777] uppercase">
                    {isEn ? "Brand Focus" : "Fokus Brand"}
                  </span>
                  <p className="font-bold text-white">{viewingStore.brandFocus}</p>
                  <p className="text-[#aaa] text-[11px]">{isEn ? "Primary Niche" : "Kategori Utama Toko"}</p>
                </div>

                <div className="bg-[#191919] p-3 rounded-xl border border-[#282828] space-y-1">
                  <span className="font-mono text-[10px] text-[#777] uppercase">
                    {isEn ? "National ID (NIK)" : "Nomor KTP (NIK)"}
                  </span>
                  <p className="font-bold font-mono text-white text-sm">{viewingStore.nik}</p>
                  <p className="text-emerald-400 text-[11px] font-mono">
                    {isEn ? "ID Record Verified" : "KTP Terverifikasi"}
                  </p>
                </div>

                <div className="bg-[#191919] p-3 rounded-xl border border-[#282828] space-y-1">
                  <span className="font-mono text-[10px] text-[#777] uppercase">
                    {isEn ? "Disbursement Bank" : "Rekening Pencairan Dana"}
                  </span>
                  <p className="font-bold text-white">{viewingStore.bankName}</p>
                  <p className="text-[#aaa] text-[11px] font-mono">{viewingStore.bankAccount}</p>
                </div>
              </div>

              <div className="bg-[#191919] p-3.5 rounded-xl border border-[#282828] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#777] uppercase block mb-1">Status</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#161616] text-[#D4D4D8] border border-[#27272A]">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      viewingStore.status === "APPROVED" ? "bg-emerald-400" : viewingStore.status === "PENDING" ? "bg-amber-400" : "bg-rose-400"
                    }`} />
                    {viewingStore.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleApprove(viewingStore.id);
                      setViewingStore({ ...viewingStore, status: "APPROVED" });
                    }}
                    className="px-3.5 py-1.5 bg-white hover:bg-[#e5e5e5] text-black font-mono font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    {isEn ? "Approve KYC" : "Setujui Toko"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenReject(viewingStore);
                      setViewingStore(null);
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

      {/* REJECT MODAL */}
      <AnimatePresence>
        {rejectingStore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectingStore(null)}
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
                  {isEn ? "KYC Rejection" : "Penolakan Pendaftaran"}
                </span>
                <h3 className="text-base font-bold text-white font-heading mt-0.5">
                  {isEn ? `Reject Applicant ${rejectingStore.storeName}?` : `Tolak Pengajuan ${rejectingStore.storeName}?`}
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
                    placeholder={isEn ? "e.g., Blurry ID photo, bank name does not match owner name..." : "Contoh: Foto KTP buram, nama rekening tidak cocok dengan nama pemilik..."}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-[#181818] border border-[#333] focus:border-rose-400 rounded-xl p-2.5 text-xs text-white outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectingStore(null)}
                    className="px-3.5 py-1.5 bg-[#222] hover:bg-[#333] text-white text-xs font-mono rounded-lg transition-colors cursor-pointer"
                  >
                    {isEn ? "Cancel" : "Batal"}
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-lg shadow-rose-900/40"
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
