"use client";

import React, { useState, useMemo } from "react";
import { useAdminData, AdminCourier } from "@/context/AdminDataContext";
import { useLocation } from "@/context/LocationContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart } from "@/components/charts/area-chart";
import { Area } from "@/components/charts/area";
import CustomSelect from "@/components/ui/custom-select";

export default function CourierPartnersAdminPage() {
  const { couriers, addCourier, updateCourier, deleteCourier, toggleCourierStatus, exportToCSV } = useAdminData();
  const { formatPrice } = useLocation();
  const { language } = useLanguage();
  const isEn = language === "English";

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCourier, setEditingCourier] = useState<AdminCourier | null>(null);
  const [deletingCourier, setDeletingCourier] = useState<AdminCourier | null>(null);

  const [formData, setFormData] = useState<Omit<AdminCourier, "id">>({
    name: "",
    code: "",
    type: "Domestic Express",
    baseRateUSD: 5,
    estimatedDays: "1-2 Days",
    insuranceRequired: true,
    trackingApiAvailable: true,
    active: true,
    notes: "Integrated API Courier Line",
  });

  const activeCount = couriers.filter((c) => c.active).length;
  const domesticCount = couriers.filter((c) => c.type.includes("Domestic") || c.type.includes("Same Day")).length;
  const intlCount = couriers.filter((c) => c.type.includes("International") || c.type.includes("Cargo")).length;

  // Micro Sparklines
  const sparklineActive = useMemo(() => [
    { date: new Date("2026-08-10"), val: 3 },
    { date: new Date("2026-08-11"), val: 3 },
    { date: new Date("2026-08-12"), val: 4 },
    { date: new Date("2026-08-13"), val: 4 },
    { date: new Date("2026-08-14"), val: 5 },
    { date: new Date("2026-08-15"), val: 5 },
    { date: new Date("2026-08-16"), val: activeCount },
  ], [activeCount]);

  const sparklineDom = useMemo(() => [
    { date: new Date("2026-08-10"), val: 2 },
    { date: new Date("2026-08-11"), val: 3 },
    { date: new Date("2026-08-12"), val: 3 },
    { date: new Date("2026-08-13"), val: 4 },
    { date: new Date("2026-08-14"), val: 4 },
    { date: new Date("2026-08-15"), val: 4 },
    { date: new Date("2026-08-16"), val: domesticCount },
  ], [domesticCount]);

  const sparklineIntl = useMemo(() => [
    { date: new Date("2026-08-10"), val: 1 },
    { date: new Date("2026-08-11"), val: 1 },
    { date: new Date("2026-08-12"), val: 1 },
    { date: new Date("2026-08-13"), val: 2 },
    { date: new Date("2026-08-14"), val: 2 },
    { date: new Date("2026-08-15"), val: 2 },
    { date: new Date("2026-08-16"), val: intlCount },
  ], [intlCount]);

  const filteredCouriers = useMemo(() => {
    return couriers.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = typeFilter === "ALL" || c.type === typeFilter;
      const matchStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? c.active : !c.active);

      return matchSearch && matchType && matchStatus;
    });
  }, [couriers, searchQuery, typeFilter, statusFilter]);

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      code: "",
      type: "Domestic Express",
      baseRateUSD: 5,
      estimatedDays: "1-2 Days",
      insuranceRequired: true,
      trackingApiAvailable: true,
      active: true,
      notes: "Integrated API Courier Line",
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c: AdminCourier) => {
    setEditingCourier(c);
    setFormData({
      name: c.name,
      code: c.code,
      type: c.type,
      baseRateUSD: c.baseRateUSD,
      estimatedDays: c.estimatedDays,
      insuranceRequired: c.insuranceRequired,
      trackingApiAvailable: c.trackingApiAvailable,
      active: c.active,
      notes: c.notes || "",
    });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;
    addCourier({
      ...formData,
      code: formData.code.toUpperCase(),
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourier) return;
    updateCourier(editingCourier.id, {
      ...formData,
      code: formData.code.toUpperCase(),
    });
    setEditingCourier(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingCourier) return;
    deleteCourier(deletingCourier.id);
    setDeletingCourier(null);
  };

  const handleExport = () => {
    const dataToExport = filteredCouriers.map((c) => ({
      ID: c.id,
      Name: c.name,
      Code: c.code,
      ServiceType: c.type,
      BaseRate_USD: c.baseRateUSD,
      EstimatedSLA: c.estimatedDays,
      Status: c.active ? "ACTIVE" : "DISABLED",
      InsuranceMandatory: c.insuranceRequired ? "YES" : "NO",
      TrackingAPI: c.trackingApiAvailable ? "CONNECTED" : "MANUAL",
    }));
    exportToCSV("tonalzone_courier_partners", dataToExport);
  };

  return (
    <div className="space-y-6 text-[#FAF9F6] selection:bg-white selection:text-black">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold bg-[#1C1C1C] text-[#FAF9F6] border border-[#2E2E2E] px-2 py-0.5 rounded uppercase tracking-wider">
              {isEn ? "Courier Fleet" : "Daftar Ekspedisi"}
            </span>
            <span className="text-[11px] font-mono text-[#888]">
              {isEn ? "Fleet Integration & Base Rates" : "Integrasi Kurir & Tarif Ongkir"}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans">
            {isEn ? "Courier Fleet & Shipping Rates" : "Kelola Ekspedisi & Tarif Ongkir"}
          </h1>
          <p className="text-xs text-[#888] font-sans mt-0.5">
            {isEn
              ? "Configure supported courier partners, shipping base rates, delivery SLAs, and high-value IEM transit insurance."
              : "Atur pilihan kurir ekspedisi, tarif dasar ongkir, estimasi waktu tiba, dan asuransi pengiriman."}
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

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#222222] hover:bg-[#333333] border border-[#3E3E3E] text-white text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {isEn ? "Add Courier" : "Tambah Ekspedisi"}
          </button>
        </div>
      </div>

      {/* KPI Cards with Micro-Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Active Partners */}
        <div className="bg-[#111] border border-[#222] hover:border-[#333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888] uppercase tracking-wider">
                {isEn ? "Active Fleet Couriers" : "Ekspedisi Aktif"}
              </p>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {activeCount} {isEn ? "Couriers" : "Kurir"}
              </p>
            </div>
            <div className="w-20 h-10 shrink-0 opacity-70">
              <AreaChart data={sparklineActive} aspectRatio="2 / 1" className="w-full h-full">
                <Area dataKey="val" stroke="#10b981" fill="#10b981" strokeWidth={1.5} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a] text-[11px] font-mono text-[#777]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{isEn ? "Available for buyer checkout selection" : "Dapat dipilih saat checkout pesanan"}</span>
          </div>
        </div>

        {/* Card 2: Domestic Coverage */}
        <div className="bg-[#111] border border-[#222] hover:border-[#333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888] uppercase tracking-wider">
                {isEn ? "Domestic Logistics" : "Pengiriman Domestik"}
              </p>
              <p className="text-2xl font-bold font-mono text-white mt-1">
                {domesticCount} {isEn ? "Couriers" : "Kurir"}
              </p>
            </div>
            <div className="w-20 h-10 shrink-0 opacity-70">
              <AreaChart data={sparklineDom} aspectRatio="2 / 1" className="w-full h-full">
                <Area dataKey="val" stroke="#ffffff" fill="#ffffff" strokeWidth={1.5} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a] text-[11px] font-mono text-[#777]">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            <span>{isEn ? "Nationwide regional transit routes" : "Melayani pengiriman seluruh wilayah"}</span>
          </div>
        </div>

        {/* Card 3: International Priority */}
        <div className="bg-[#111] border border-[#222] hover:border-[#333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888] uppercase tracking-wider">
                {isEn ? "International & Cargo" : "Pengiriman Internasional"}
              </p>
              <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {intlCount} {isEn ? "Couriers" : "Kurir"}
              </p>
            </div>
            <div className="w-20 h-10 shrink-0 opacity-70">
              <AreaChart data={sparklineIntl} aspectRatio="2 / 1" className="w-full h-full">
                <Area dataKey="val" stroke="#f59e0b" fill="#f59e0b" strokeWidth={1.5} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a] text-[11px] font-mono text-[#777]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>{isEn ? "Cross-border & freight shipping" : "Ekspedisi paket luar negeri"}</span>
          </div>
        </div>

      </div>

      {/* Toolbar & Filter Bar */}
      <div className="bg-[#111] border border-[#222] p-3.5 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder={isEn ? "Search courier name, code, tier..." : "Cari nama ekspedisi, kode, layanan..."}
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
            {/* Type Filters */}
            <div className="flex items-center bg-[#161616] p-1 rounded-lg border border-[#262626]">
              {[
                { id: "ALL", label: isEn ? "All Couriers" : "Semua Ekspedisi" },
                { id: "DOMESTIC", label: isEn ? "Domestic" : "Domestik" },
                { id: "INTERNATIONAL", label: isEn ? "International" : "Internasional" },
                { id: "ACTIVE", label: isEn ? "Active Only" : "Hanya Aktif" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTypeFilter(tab.id)}
                  className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-all cursor-pointer border ${
                    typeFilter === tab.id
                      ? "bg-[#242424] text-[#FAF9F6] font-semibold border-[#383838] shadow-sm"
                      : "text-[#8E8E93] hover:text-[#FAF9F6] hover:bg-[#1A1A1A] border-transparent"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Service Type Dropdown */}
            <CustomSelect
              variant="compact"
              value={typeFilter}
              onChange={(val) => setTypeFilter(val)}
              options={[
                { label: isEn ? "All Fleet Tiers" : "Semua Kategori Layanan", value: "ALL" },
                { label: "Domestic Standard", value: "Domestic Standard" },
                { label: "Domestic Express", value: "Domestic Express" },
                { label: "Same Day / Instant", value: "Same Day / Instant" },
                { label: "International Express", value: "International Express" },
                { label: "Cargo Heavy", value: "Cargo Heavy" },
              ]}
              buttonClassName="bg-[#161616] border border-[#2a2a2a] hover:border-[#444] text-xs font-mono text-white px-3 py-1.5 rounded-lg flex items-center justify-between gap-2 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Grid of Courier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCouriers.map((c) => (
          <div
            key={c.id}
            className={`bg-[#111] border rounded-xl p-5 flex flex-col justify-between transition-all group ${
              c.active ? "border-[#222] hover:border-[#3a3a3a]" : "border-[#1e1e1e] opacity-60"
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#2e2e2e] flex items-center justify-center font-mono font-bold text-xs text-white">
                    {c.code.slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm group-hover:text-white transition-colors">
                      {c.name}
                    </h3>
                    <span className="text-[10px] font-mono text-[#888]">{c.type}</span>
                  </div>
                </div>

                {/* Active Toggle Switch */}
                <button
                  type="button"
                  onClick={() => toggleCourierStatus(c.id)}
                  title={c.active ? (isEn ? "Disable courier" : "Nonaktifkan kurir") : (isEn ? "Enable courier" : "Aktifkan kurir")}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer border ${
                    c.active ? "bg-white border-white" : "bg-[#222] border-[#333]"
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-black transition-transform ${
                      c.active ? "translate-x-4" : "translate-x-0 bg-[#888]"
                    }`}
                  />
                </button>
              </div>

              <div className="bg-[#161616] p-3 rounded-lg border border-[#222] space-y-2 text-xs font-sans mb-4">
                <div className="flex justify-between items-center text-[#aaa]">
                  <span className="font-mono text-[11px]">{isEn ? "Service Tier" : "Tipe Layanan"}</span>
                  <span className="font-medium text-white">{c.type}</span>
                </div>
                <div className="flex justify-between items-center text-[#aaa]">
                  <span className="font-mono text-[11px]">{isEn ? "Base Rate (1 kg)" : "Tarif Dasar (1 kg)"}</span>
                  <span className="font-mono font-bold text-white">
                    {formatPrice(c.baseRateUSD)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#aaa]">
                  <span className="font-mono text-[11px]">{isEn ? "Estimated SLA" : "Estimasi Tiba"}</span>
                  <span className="font-mono text-white/90">{c.estimatedDays}</span>
                </div>
                <div className="flex justify-between items-center text-[#aaa] pt-1 border-t border-[#222]">
                  <span className="font-mono text-[11px]">{isEn ? "Cargo Insurance" : "Asuransi Barang"}</span>
                  <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${c.insuranceRequired ? "bg-[#141414] text-[#D4D4D8] border border-[#27272A]" : "bg-[#222] text-[#888]"}`}>
                    {c.insuranceRequired ? (isEn ? "Mandatory Insurance" : "Wajib Asuransi") : (isEn ? "Optional" : "Opsional")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1e1e1e]">
              <button
                onClick={() => handleOpenEdit(c)}
                className="px-3 py-1.5 bg-[#181818] hover:bg-[#222] border border-[#2e2e2e] hover:border-[#444] text-xs font-mono font-bold text-white rounded-lg transition-colors cursor-pointer"
              >
                {isEn ? "Edit Rate" : "Ubah Tarif"}
              </button>
              <button
                onClick={() => setDeletingCourier(c)}
                className="p-1.5 bg-[#181818] hover:bg-[#262626] border border-[#2E2E2E] hover:border-white text-[#A1A1AA] hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT COURIER MODAL */}
      <AnimatePresence>
        {(isAddModalOpen || editingCourier) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingCourier(null);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1, y: 0 }}
              className="relative w-full max-w-md bg-[#141414] border border-[#333] rounded-2xl p-5 shadow-2xl z-10 space-y-4"
            >
              <div className="border-b border-[#262626] pb-3">
                <span className="text-[10px] font-mono font-bold uppercase text-white/60">
                  {editingCourier
                    ? (isEn ? "Edit Courier Partner" : "Ubah Data Ekspedisi")
                    : (isEn ? "Add New Courier" : "Tambah Ekspedisi Baru")}
                </span>
                <h3 className="text-base font-bold text-white font-sans mt-0.5">
                  {editingCourier ? editingCourier.name : (isEn ? "New Logistics Fleet" : "Penyedia Ekspedisi Baru")}
                </h3>
              </div>

              <form onSubmit={editingCourier ? handleSaveEdit : handleSaveAdd} className="space-y-3.5 text-xs font-sans">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-mono text-[11px] text-[#aaa] mb-1">
                      {isEn ? "Courier Name" : "Nama Ekspedisi"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isEn ? "e.g., J&T Cargo" : "Contoh: J&T Cargo"}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#181818] border border-[#333] focus:border-white rounded-lg p-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-mono text-[11px] text-[#aaa] mb-1">
                      {isEn ? "Code / Abbreviation" : "Kode Singkatan"}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isEn ? "e.g., JNT" : "Contoh: JNT"}
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full bg-[#181818] border border-[#333] focus:border-white rounded-lg p-2 text-white outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-mono text-[11px] text-[#aaa] mb-1">
                      {isEn ? "Service Territory" : "Cakupan Wilayah"}
                    </label>
                    <CustomSelect
                      value={formData.type}
                      onChange={(val) => setFormData({ ...formData, type: val as any })}
                      options={[
                        { label: isEn ? "Domestic" : "Domestik", value: "Domestic" },
                        { label: isEn ? "International" : "Internasional", value: "International" },
                        { label: isEn ? "Heavy Cargo" : "Kargo Berat", value: "Cargo" },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-mono text-[11px] text-[#aaa] mb-1">
                      {isEn ? "Base Rate (1 kg)" : "Tarif Dasar (1 kg)"}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.baseRateUSD}
                      onChange={(e) => setFormData({ ...formData, baseRateUSD: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#181818] border border-[#333] focus:border-white rounded-lg p-2 text-white outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-mono text-[11px] text-[#aaa] mb-1">
                    {isEn ? "Estimated Transit SLA" : "Estimasi Tiba"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isEn ? "e.g., 1-2 Business Days" : "Contoh: 1-2 Hari Kerja"}
                    value={formData.estimatedDays}
                    onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                    className="w-full bg-[#181818] border border-[#333] focus:border-white rounded-lg p-2 text-white outline-none font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="insReq"
                    checked={formData.insuranceRequired}
                    onChange={(e) => setFormData({ ...formData, insuranceRequired: e.target.checked })}
                    className="rounded border-[#333] bg-[#1e1e1e] text-white focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="insReq" className="text-xs text-[#aaa] cursor-pointer">
                    {isEn
                      ? "Require insurance protection for high-value audiophile IEMs"
                      : "Wajibkan asuransi proteksi untuk pesanan IEM bernilai tinggi"}
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#222]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingCourier(null);
                    }}
                    className="px-3.5 py-1.5 bg-[#222] hover:bg-[#333] text-white text-xs font-mono rounded-lg transition-colors cursor-pointer"
                  >
                    {isEn ? "Cancel" : "Batal"}
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-[#242424] hover:bg-[#333] border border-[#383838] text-white font-mono font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    {editingCourier
                      ? (isEn ? "Save Changes" : "Simpan Perubahan")
                      : (isEn ? "Add Courier" : "Tambah Ekspedisi")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM MODAL */}
      <AnimatePresence>
        {deletingCourier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingCourier(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1, y: 0 }}
              className="relative w-full max-w-sm bg-[#141414] border border-[#333] rounded-2xl p-5 shadow-2xl z-10 space-y-4"
            >
              <h3 className="text-sm font-bold text-white font-sans">
                {isEn ? `Delete ${deletingCourier.name}?` : `Hapus Ekspedisi ${deletingCourier.name}?`}
              </h3>
              <p className="text-xs text-[#888] font-sans">
                {isEn
                  ? "This courier will no longer be selectable by buyers during the checkout workflow."
                  : "Ekspedisi ini tidak akan lagi dapat dipilih oleh pembeli saat checkout belanja."}
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingCourier(null)}
                  className="px-3.5 py-1.5 bg-[#222] hover:bg-[#333] text-white text-xs font-mono rounded-lg transition-colors cursor-pointer"
                >
                  {isEn ? "Cancel" : "Batal"}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  {isEn ? "Confirm Delete" : "Konfirmasi Hapus"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
