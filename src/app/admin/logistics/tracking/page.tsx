"use client";

import React, { useState, useMemo } from "react";
import { useAdminData, AdminShipmentTracking } from "@/context/AdminDataContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart } from "@/components/charts/area-chart";
import { Area } from "@/components/charts/area";
import CustomSelect from "@/components/ui/custom-select";

const PAGE_SIZE = 6;

export default function LogisticsTrackingPage() {
  const { shipments, updateShipmentStatus, exportToCSV } = useAdminData();
  const { language } = useLanguage();
  const isEn = language === "English";

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [courierFilter, setCourierFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"orderNumber" | "currentStatus" | "lastUpdated">("lastUpdated");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal State
  const [inspectingShipment, setInspectingShipment] = useState<AdminShipmentTracking | null>(null);
  const [completingShipment, setCompletingShipment] = useState<AdminShipmentTracking | null>(null);

  // KPI telemetry
  const inTransitCount = shipments.filter((s) => s.currentStatus === "IN_TRANSIT" || s.currentStatus === "OUT_FOR_DELIVERY").length;
  const deliveredCount = shipments.filter((s) => s.currentStatus === "DELIVERED").length;
  const inspectionEligibleCount = shipments.filter((s) => s.escrowStatus === "RELEASE_ELIGIBLE").length;

  const sparklineInTransit = useMemo(() => [
    { date: new Date("2026-08-10"), val: 2 },
    { date: new Date("2026-08-11"), val: 3 },
    { date: new Date("2026-08-12"), val: 3 },
    { date: new Date("2026-08-13"), val: 4 },
    { date: new Date("2026-08-14"), val: 4 },
    { date: new Date("2026-08-15"), val: 5 },
    { date: new Date("2026-08-16"), val: inTransitCount },
  ], [inTransitCount]);

  const sparklineEligible = useMemo(() => [
    { date: new Date("2026-08-10"), val: 1 },
    { date: new Date("2026-08-11"), val: 1 },
    { date: new Date("2026-08-12"), val: 2 },
    { date: new Date("2026-08-13"), val: 2 },
    { date: new Date("2026-08-14"), val: 3 },
    { date: new Date("2026-08-15"), val: 3 },
    { date: new Date("2026-08-16"), val: inspectionEligibleCount },
  ], [inspectionEligibleCount]);

  const sparklineDelivered = useMemo(() => [
    { date: new Date("2026-08-10"), val: 4 },
    { date: new Date("2026-08-11"), val: 5 },
    { date: new Date("2026-08-12"), val: 6 },
    { date: new Date("2026-08-13"), val: 6 },
    { date: new Date("2026-08-14"), val: 7 },
    { date: new Date("2026-08-15"), val: 7 },
    { date: new Date("2026-08-16"), val: deliveredCount },
  ], [deliveredCount]);

  // Filtering & Sorting
  const processedShipments = useMemo(() => {
    const filtered = shipments.filter((s) => {
      const matchSearch =
        s.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.sellerStore.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.destinationCity.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === "ALL" || s.currentStatus === statusFilter;
      const matchCourier = courierFilter === "ALL" || s.courierName.toLowerCase().includes(courierFilter.toLowerCase());

      return matchSearch && matchStatus && matchCourier;
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
  }, [shipments, searchQuery, statusFilter, courierFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(processedShipments.length / PAGE_SIZE) || 1;
  const paginatedShipments = processedShipments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSortToggle = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleForceRelease = (id: string) => {
    updateShipmentStatus(id, "DELIVERED");
    setCompletingShipment(null);
  };

  const handleExport = () => {
    const dataToExport = processedShipments.map((s) => ({
      OrderNumber: s.orderNumber,
      WaybillAWB: s.trackingNumber,
      Courier: s.courierName,
      Buyer: s.buyerName,
      Destination: s.destinationCity,
      CurrentStatus: s.currentStatus,
      EscrowStatus: s.escrowStatus,
      InspectionExpiry: s.inspectionExpiry || "N/A",
      LatestMilestone: s.milestones[s.milestones.length - 1]?.description || "In transit",
      LastUpdate: s.lastUpdated,
    }));
    exportToCSV("tonalzone_logistics_tracking", dataToExport);
  };

  return (
    <div className="space-y-6 text-[#FAF9F6] selection:bg-[#BFDD25] selection:text-black">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold bg-[#141414] text-[#BFDD25] px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BFDD25] shadow-[0_0_6px_rgba(191,221,37,0.8)]" />
              {isEn ? "Package Logistics" : "Pengiriman Paket"}
            </span>
            <span className="text-[11px] font-mono text-[#777777]">
              {isEn ? "Live Telemetry & 2x24h Auditing" : "Lacak Paket & Garansi Uji Coba"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
            {isEn ? "Logistics & Delivery Fleet Tracking" : "Pantau Status Pengiriman Barang"}
          </h1>
          <p className="text-xs text-[#888888] font-sans mt-1">
            {isEn
              ? "Track courier waybills, live route checkpoints, and buyer 2x24h acoustic inspection trial windows."
              : "Pantau nomor resi paket ekspedisi, posisi paket di perjalanan, dan masa garansi uji coba 2x24 jam pembeli."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#141414] hover:bg-[#202020] text-xs font-mono font-medium rounded-full text-white transition-colors cursor-pointer"
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
        
        {/* Card 1: In-Transit */}
        <div className="bg-[#0A0A0A] hover:bg-[#0E0E0E] transition-all p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888888] uppercase tracking-wider">
                {isEn ? "In Transit" : "Dalam Perjalanan"}
              </p>
              <p className="text-2xl font-bold font-mono text-white mt-1">
                {inTransitCount} {isEn ? "Packages" : "Paket"}
              </p>
            </div>
            <div className="w-20 h-10 shrink-0 opacity-70">
              <AreaChart data={sparklineInTransit} aspectRatio="2 / 1" className="w-full h-full">
                <Area dataKey="val" stroke="#38bdf8" fill="#38bdf8" strokeWidth={1.5} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-[11px] font-mono text-[#777777]">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>{isEn ? "Shipments with active courier fleet" : "Paket sedang dibawa kurir ekspedisi"}</span>
          </div>
        </div>

        {/* Card 2: 2x24h Inspection Window */}
        <div className="bg-[#0A0A0A] hover:bg-[#0E0E0E] transition-all p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888888] uppercase tracking-wider">
                {isEn ? "2x24h Inspection Window" : "Garansi Uji Coba 2x24 Jam"}
              </p>
              <p className="text-2xl font-bold font-mono text-[#BFDD25] mt-1 drop-shadow-[0_0_8px_rgba(191,221,37,0.3)]">
                {inspectionEligibleCount} {isEn ? "Orders" : "Pesanan"}
              </p>
            </div>
            <div className="w-20 h-10 shrink-0 opacity-80">
              <AreaChart data={sparklineEligible} aspectRatio="2 / 1" className="w-full h-full">
                <Area dataKey="val" stroke="#BFDD25" fill="#BFDD25" strokeWidth={1.5} fillOpacity={0.2} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-[11px] font-mono text-[#777777]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#BFDD25] shadow-[0_0_6px_rgba(191,221,37,0.8)]" />
            <span>{isEn ? "Buyer testing audio profile" : "Pembeli sedang mencoba suara audio"}</span>
          </div>
        </div>

        {/* Card 3: Successfully Delivered */}
        <div className="bg-[#0A0A0A] hover:bg-[#0E0E0E] transition-all p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888888] uppercase tracking-wider">
                {isEn ? "Delivered to Destination" : "Telah Tiba di Pembeli"}
              </p>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {deliveredCount} {isEn ? "Packages" : "Paket"}
              </p>
            </div>
            <div className="w-20 h-10 shrink-0 opacity-70">
              <AreaChart data={sparklineDelivered} aspectRatio="2 / 1" className="w-full h-full">
                <Area dataKey="val" stroke="#10b981" fill="#10b981" strokeWidth={1.5} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-[11px] font-mono text-[#777777]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{isEn ? "Completed & escrow cleared" : "Pesanan selesai & dana dicairkan"}</span>
          </div>
        </div>

      </div>

      {/* Toolbar & Filters */}
      <div className="bg-[#0A0A0A] p-4 rounded-2xl space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder={isEn ? "Search AWB, buyer, store, city..." : "Cari resi, pembeli, toko, kota tujuan..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141414] focus:bg-[#181818] rounded-full pl-10 pr-4 py-2.5 text-xs font-sans text-white placeholder:text-[#666] outline-none focus:ring-1 focus:ring-[#BFDD25] transition-all"
            />
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777]"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Pills */}
            <div className="flex items-center bg-[#141414] p-1 rounded-full">
              {[
                { id: "ALL", label: isEn ? "All Packages" : "Semua Paket" },
                { id: "IN_TRANSIT", label: isEn ? "In Transit" : "Dalam Perjalanan" },
                { id: "OUT_FOR_DELIVERY", label: isEn ? "Out for Delivery" : "Kurir Menuju Lokasi" },
                { id: "DELIVERED", label: isEn ? "Delivered" : "Telah Diterima" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-4 py-1.5 text-xs font-mono rounded-full transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? "bg-white text-black font-bold shadow-sm"
                      : "text-[#888888] hover:text-white hover:bg-[#202020]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Courier Filter Dropdown */}
            <CustomSelect
              variant="compact"
              value={courierFilter}
              onChange={(val) => setCourierFilter(val)}
              options={[
                { label: isEn ? "All Couriers" : "Semua Kurir", value: "ALL" },
                { label: "JNE Express", value: "JNE" },
                { label: "SiCepat", value: "SiCepat" },
                { label: "J&T Express", value: "J&T" },
                { label: "DHL Express", value: "DHL" },
                { label: "FedEx", value: "FedEx" },
              ]}
              buttonClassName="bg-[#141414] hover:bg-[#1c1c1c] text-xs font-mono text-white px-4 py-2 rounded-full flex items-center justify-between gap-2 cursor-pointer transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Main Shipments Table */}
      <div className="bg-[#0A0A0A] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#121212] text-[10px] font-mono uppercase text-[#777] tracking-wider">
                <th
                  onClick={() => handleSortToggle("orderNumber")}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  {isEn ? "Order & Waybill AWB" : "No Pesanan & Resi"}
                </th>
                <th className="py-3 px-4">{isEn ? "Courier" : "Ekspedisi"}</th>
                <th className="py-3 px-4">{isEn ? "Seller Store" : "Toko Penjual"}</th>
                <th className="py-3 px-4">{isEn ? "Buyer & Destination" : "Pembeli & Tujuan"}</th>
                <th className="py-3 px-4">{isEn ? "Last Location" : "Posisi Terakhir"}</th>
                <th
                  onClick={() => handleSortToggle("currentStatus")}
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                >
                  {isEn ? "Package Status" : "Status Paket"}
                </th>
                <th className="py-3 px-4">{isEn ? "Escrow Status" : "Status Rekber"}</th>
                <th className="py-3 px-4 text-right">{isEn ? "Actions" : "Tindakan"}</th>
              </tr>
            </thead>
            <tbody className="text-xs font-sans">
              {paginatedShipments.length > 0 ? (
                paginatedShipments.map((ship) => (
                  <tr key={ship.id} className="hover:bg-[#121212] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span
                          className="font-bold text-white hover:text-[#BFDD25] transition-colors cursor-pointer font-mono"
                          onClick={() => setInspectingShipment(ship)}
                        >
                          {ship.orderNumber}
                        </span>
                        <span className="text-[10px] font-mono text-[#777777]">{ship.trackingNumber}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-white/90">
                      {ship.courierName}
                    </td>

                    <td className="py-3.5 px-4 text-white/80 font-medium">
                      {ship.sellerStore}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{ship.buyerName}</span>
                        <span className="text-[10px] font-mono text-[#777777]">{ship.destinationCity}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#AAAAAA]">
                      {ship.milestones[ship.milestones.length - 1]?.location || ship.destinationCity}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-[#141414] text-[#D4D4D8]">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          ship.currentStatus === "DELIVERED" ? "bg-emerald-400" : ship.currentStatus === "OUT_FOR_DELIVERY" ? "bg-white" : "bg-amber-400"
                        }`} />
                        {ship.currentStatus.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {ship.escrowStatus === "RELEASE_ELIGIBLE" ? (
                        <span className="inline-flex items-center gap-1.5 text-[#BFDD25] font-medium bg-[#BFDD25]/10 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#BFDD25] shadow-[0_0_6px_rgba(191,221,37,0.8)]" />
                          {ship.inspectionExpiry || (isEn ? "2x24h Active" : "2x24 Jam Aktif")}
                        </span>
                      ) : ship.escrowStatus === "RELEASED" ? (
                        <span className="text-emerald-400 font-medium">{isEn ? "Settled" : "Dicairkan"}</span>
                      ) : (
                        <span className="text-[#71717A]">{isEn ? "In Transit" : "Di Perjalanan"}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setInspectingShipment(ship)}
                          className="px-3.5 py-1.5 bg-[#141414] hover:bg-[#202020] text-xs font-mono font-semibold text-white rounded-full transition-colors cursor-pointer"
                        >
                          {isEn ? "Milestones" : "Posisi Paket"}
                        </button>
                        {ship.currentStatus === "DELIVERED" && ship.escrowStatus !== "RELEASED" && (
                          <button
                            onClick={() => setCompletingShipment(ship)}
                            title={isEn ? "Force Complete / Release Escrow" : "Paksa Selesai / Cairkan Rekber"}
                            className="p-2 bg-[#141414] hover:bg-[#BFDD25]/20 text-[#888888] hover:text-[#BFDD25] rounded-full transition-colors cursor-pointer"
                          >
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#666] font-mono">
                    {isEn ? "No shipment tracking telemetry found." : "Tidak ada data pengiriman yang ditemukan."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & Pagination */}
        <div className="p-4 bg-[#0A0A0A] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#777] gap-3">
          <div className="flex items-center gap-2">
            <span>
              {isEn
                ? `Showing ${processedShipments.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}-${Math.min(currentPage * PAGE_SIZE, processedShipments.length)} of ${processedShipments.length} tracked deliveries`
                : `Menampilkan ${processedShipments.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}-${Math.min(currentPage * PAGE_SIZE, processedShipments.length)} dari ${processedShipments.length} pengiriman`}
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-full bg-[#141414] hover:bg-[#202020] disabled:opacity-30 disabled:cursor-not-allowed text-white font-mono text-xs transition-colors cursor-pointer"
              >
                {isEn ? "Previous" : "Sebelumnya"}
              </button>
              <span className="px-2 text-white/60 font-mono text-xs">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-full bg-[#141414] hover:bg-[#202020] disabled:opacity-30 disabled:cursor-not-allowed text-white font-mono text-xs transition-colors cursor-pointer"
              >
                {isEn ? "Next" : "Selanjutnya"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MILESTONES JOURNEY MODAL */}
      <AnimatePresence>
        {inspectingShipment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectingShipment(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1, y: 0 }}
              className="relative w-full max-w-lg bg-[#0A0A0A] rounded-2xl p-6 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-[#BFDD25]">
                    {isEn ? "Live Telemetry Milestones" : "Riwayat Perjalanan Paket"}
                  </span>
                  <h3 className="text-base font-bold text-white uppercase font-heading mt-0.5">
                    AWB: {inspectingShipment.trackingNumber}
                  </h3>
                </div>
                <button
                  onClick={() => setInspectingShipment(null)}
                  className="w-8 h-8 rounded-full bg-[#141414] hover:bg-[#202020] flex items-center justify-center text-[#888] hover:text-white transition-colors cursor-pointer"
                >
                  <span className="text-base font-bold leading-none">×</span>
                </button>
              </div>

              {/* Vertical Checkpoint Timeline */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
                {inspectingShipment.milestones.map((m, idx) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    <div className="w-6 h-6 rounded-full bg-[#141414] text-[#BFDD25] flex items-center justify-center text-xs font-mono font-bold shrink-0 z-10">
                      {idx + 1}
                    </div>
                    <div className="space-y-1 flex-1 bg-[#141414] p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{m.stage.replace(/_/g, " ")}</span>
                        <span className="text-[10px] font-mono text-[#888888]">{m.timestamp}</span>
                      </div>
                      <p className="text-xs text-[#AAAAAA] font-sans">{m.description}</p>
                      <span className="text-[10px] font-mono text-[#BFDD25] block pt-1">
                        {isEn ? `Location: ${m.location}` : `Lokasi: ${m.location}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setInspectingShipment(null)}
                  className="px-5 py-2.5 bg-[#141414] hover:bg-[#202020] text-white text-xs font-mono rounded-full transition-colors cursor-pointer"
                >
                  {isEn ? "Close" : "Tutup"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FORCE COMPLETE MODAL */}
      <AnimatePresence>
        {completingShipment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCompletingShipment(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1, y: 0 }}
              className="relative w-full max-w-md bg-[#0A0A0A] rounded-2xl p-6 shadow-2xl z-10 space-y-4"
            >
              <h3 className="text-base font-bold text-white font-heading uppercase">
                {isEn
                  ? `Settle Escrow for Order #${completingShipment.orderNumber}?`
                  : `Selesaikan Escrow Order #${completingShipment.orderNumber}?`}
              </h3>
              <p className="text-xs text-[#888888] font-mono leading-relaxed">
                {isEn
                  ? `Package delivered to buyer (${completingShipment.buyerName}). This action closes the 2x24h trial period and releases the escrow payout to merchant `
                  : `Paket telah terkonfirmasi diterima oleh pembeli (${completingShipment.buyerName}). Tindakan ini akan menutup masa inspeksi dan mencairkan saldo payout ke rekening toko `}
                <strong className="text-white">{completingShipment.sellerStore}</strong>.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingShipment(null)}
                  className="px-5 py-2.5 bg-[#141414] hover:bg-[#202020] text-white text-xs font-mono rounded-full transition-colors cursor-pointer"
                >
                  {isEn ? "Cancel" : "Batal"}
                </button>
                <button
                  type="button"
                  onClick={() => handleForceRelease(completingShipment.id)}
                  className="px-5 py-2.5 bg-[#BFDD25] hover:bg-[#aecd20] text-black font-mono font-bold text-xs rounded-full transition-colors cursor-pointer shadow-[0_0_12px_rgba(191,221,37,0.3)]"
                >
                  {isEn ? "Disburse Escrow Payout" : "Cairkan Payout Escrow"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
