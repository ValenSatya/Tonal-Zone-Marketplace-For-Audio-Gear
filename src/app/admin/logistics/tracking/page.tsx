"use client";

import React, { useState, useMemo, useDeferredValue } from "react";
import { useAdminData, AdminShipmentTracking } from "@/context/AdminDataContext";
import { useLocation } from "@/context/LocationContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart } from "@/components/charts/area-chart";
import { Area } from "@/components/charts/area";
import CustomSelect from "@/components/ui/custom-select";

const PAGE_SIZE = 10;

export default function ShipmentTrackingAdminPage() {
  const { shipments, updateShipmentStatus, forceCompleteEscrow, exportToCSV } = useAdminData();
  const { formatPrice } = useLocation();
  const { language } = useLanguage();
  const isEn = language === "English";

  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [courierFilter, setCourierFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<"orderNumber" | "courierName" | "currentStatus" | "lastUpdated">("lastUpdated");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Inspection & Milestone Journey Modals
  const [inspectingShipment, setInspectingShipment] = useState<AdminShipmentTracking | null>(null);
  const [completingShipment, setCompletingShipment] = useState<AdminShipmentTracking | null>(null);

  const inTransitCount = shipments.filter((s) => s.currentStatus === "IN_TRANSIT" || s.currentStatus === "OUT_FOR_DELIVERY" || s.currentStatus === "PICKED_UP").length;
  const deliveredCount = shipments.filter((s) => s.currentStatus === "DELIVERED").length;
  const inspectionEligibleCount = shipments.filter((s) => s.escrowStatus === "RELEASE_ELIGIBLE" || s.currentStatus === "DELIVERED").length;

  // Micro Sparklines
  const sparklineInTransit = useMemo(() => [
    { date: new Date("2026-08-10"), val: 2 },
    { date: new Date("2026-08-11"), val: 3 },
    { date: new Date("2026-08-12"), val: 3 },
    { date: new Date("2026-08-13"), val: 5 },
    { date: new Date("2026-08-14"), val: 4 },
    { date: new Date("2026-08-15"), val: 6 },
    { date: new Date("2026-08-16"), val: inTransitCount },
  ], [inTransitCount]);

  const sparklineDelivered = useMemo(() => [
    { date: new Date("2026-08-10"), val: 1 },
    { date: new Date("2026-08-11"), val: 2 },
    { date: new Date("2026-08-12"), val: 4 },
    { date: new Date("2026-08-13"), val: 5 },
    { date: new Date("2026-08-14"), val: 6 },
    { date: new Date("2026-08-15"), val: 8 },
    { date: new Date("2026-08-16"), val: deliveredCount },
  ], [deliveredCount]);

  const sparklineEligible = useMemo(() => [
    { date: new Date("2026-08-10"), val: 0 },
    { date: new Date("2026-08-11"), val: 1 },
    { date: new Date("2026-08-12"), val: 1 },
    { date: new Date("2026-08-13"), val: 2 },
    { date: new Date("2026-08-14"), val: 2 },
    { date: new Date("2026-08-15"), val: 3 },
    { date: new Date("2026-08-16"), val: inspectionEligibleCount },
  ], [inspectionEligibleCount]);

  const processedShipments = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase();
    const filtered = shipments.filter((s) => {
      const matchSearch =
        !query ||
        s.orderNumber.toLowerCase().includes(query) ||
        s.trackingNumber.toLowerCase().includes(query) ||
        s.buyerName.toLowerCase().includes(query) ||
        s.sellerStore.toLowerCase().includes(query) ||
        s.destinationCity.toLowerCase().includes(query);

      const matchStatus = statusFilter === "ALL" || s.currentStatus === statusFilter;
      const matchCourier = courierFilter === "ALL" || s.courierName.toLowerCase().includes(courierFilter.toLowerCase());
      return matchSearch && matchStatus && matchCourier;
    });

    return filtered.sort((a, b) => {
      let aVal: any = a[sortField] || "";
      let bVal: any = b[sortField] || "";
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [shipments, deferredSearchQuery, statusFilter, courierFilter, sortField, sortDirection]);

  // Paginated shipments
  const totalPages = Math.max(1, Math.ceil(processedShipments.length / PAGE_SIZE));
  const paginatedShipments = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return processedShipments.slice(start, start + PAGE_SIZE);
  }, [processedShipments, currentPage]);

  const handleSortToggle = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleForceRelease = (id: string) => {
    forceCompleteEscrow(id);
    setCompletingShipment(null);
  };

  const handleExport = () => {
    const dataToExport = processedShipments.map((s) => ({
      OrderNumber: s.orderNumber,
      AWB: s.trackingNumber,
      Courier: s.courierName,
      Buyer: s.buyerName,
      Seller: s.sellerStore,
      Destination: s.destinationCity,
      CurrentStatus: s.currentStatus,
      EscrowState: s.escrowStatus,
      LastUpdated: s.lastUpdated,
    }));
    exportToCSV("tonalzone_shipment_telemetry", dataToExport);
  };

  return (
    <div className="space-y-6 text-[#FAF9F6] selection:bg-white selection:text-black">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold bg-[#1C1C1C] text-[#FAF9F6] border border-[#2E2E2E] px-2 py-0.5 rounded uppercase tracking-wider">
              {isEn ? "Package Logistics" : "Pengiriman Paket"}
            </span>
            <span className="text-[11px] font-mono text-[#888]">
              {isEn ? "Live Telemetry & 2x24h Auditing" : "Lacak Paket & Garansi Uji Coba"}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans">
            {isEn ? "Logistics & Delivery Fleet Tracking" : "Pantau Status Pengiriman Barang"}
          </h1>
          <p className="text-xs text-[#888] font-sans mt-0.5">
            {isEn
              ? "Track courier waybills, live route checkpoints, and buyer 2x24h acoustic inspection trial windows."
              : "Pantau nomor resi paket ekspedisi, posisi paket di perjalanan, dan masa garansi uji coba 2x24 jam pembeli."}
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
        
        {/* Card 1: In-Transit */}
        <div className="bg-[#111] border border-[#222] hover:border-[#333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888] uppercase tracking-wider">
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
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a] text-[11px] font-mono text-[#777]">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>{isEn ? "Shipments with active courier fleet" : "Paket sedang dibawa kurir ekspedisi"}</span>
          </div>
        </div>

        {/* Card 2: 2x24h Inspection Window */}
        <div className="bg-[#111] border border-[#222] hover:border-[#333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888] uppercase tracking-wider">
                {isEn ? "2x24h Inspection Window" : "Garansi Uji Coba 2x24 Jam"}
              </p>
              <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {inspectionEligibleCount} {isEn ? "Orders" : "Pesanan"}
              </p>
            </div>
            <div className="w-20 h-10 shrink-0 opacity-70">
              <AreaChart data={sparklineEligible} aspectRatio="2 / 1" className="w-full h-full">
                <Area dataKey="val" stroke="#f59e0b" fill="#f59e0b" strokeWidth={1.5} fillOpacity={0.15} />
              </AreaChart>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a] text-[11px] font-mono text-[#777]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>{isEn ? "Buyer testing audio profile" : "Pembeli sedang mencoba suara audio"}</span>
          </div>
        </div>

        {/* Card 3: Successfully Delivered */}
        <div className="bg-[#111] border border-[#222] hover:border-[#333] transition-colors p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-[#888] uppercase tracking-wider">
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
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a1a1a] text-[11px] font-mono text-[#777]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{isEn ? "Completed & escrow cleared" : "Pesanan selesai & dana dicairkan"}</span>
          </div>
        </div>

      </div>

      {/* Toolbar & Filters */}
      <div className="bg-[#111] border border-[#222] p-3.5 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder={isEn ? "Search AWB, buyer, store, city..." : "Cari resi, pembeli, toko, kota tujuan..."}
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
                { id: "ALL", label: isEn ? "All Packages" : "Semua Paket" },
                { id: "IN_TRANSIT", label: isEn ? "In Transit" : "Dalam Perjalanan" },
                { id: "OUT_FOR_DELIVERY", label: isEn ? "Out for Delivery" : "Kurir Menuju Lokasi" },
                { id: "DELIVERED", label: isEn ? "Delivered" : "Telah Diterima" },
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
              buttonClassName="bg-[#161616] border border-[#2a2a2a] hover:border-[#444] text-xs font-mono text-white px-3 py-1.5 rounded-lg flex items-center justify-between gap-2 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Shipments Table */}
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222] bg-[#141414] text-[10px] font-mono uppercase text-[#777] tracking-wider">
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
            <tbody className="divide-y divide-[#1e1e1e] text-xs font-sans">
              {paginatedShipments.length > 0 ? (
                paginatedShipments.map((ship) => (
                  <tr key={ship.id} className="hover:bg-[#141414] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span
                          className="font-bold text-white hover:underline cursor-pointer font-mono"
                          onClick={() => setInspectingShipment(ship)}
                        >
                          {ship.orderNumber}
                        </span>
                        <span className="text-[10px] font-mono text-[#888]">{ship.trackingNumber}</span>
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
                        <span className="text-[10px] font-mono text-[#888]">{ship.destinationCity}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#aaa]">
                      {ship.milestones[ship.milestones.length - 1]?.location || ship.destinationCity}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#161616] text-[#D4D4D8] border border-[#27272A]">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          ship.currentStatus === "DELIVERED" ? "bg-emerald-400" : ship.currentStatus === "OUT_FOR_DELIVERY" ? "bg-white" : "bg-amber-400"
                        }`} />
                        {ship.currentStatus.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {ship.escrowStatus === "RELEASE_ELIGIBLE" ? (
                        <span className="inline-flex items-center gap-1.5 text-[#D4D4D8] font-medium bg-[#161616] px-2 py-0.5 rounded border border-[#27272A]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          {ship.inspectionExpiry || (isEn ? "2x24h Active" : "2x24 Jam Aktif")}
                        </span>
                      ) : ship.escrowStatus === "RELEASED" ? (
                        <span className="text-emerald-400 font-medium">{isEn ? "Settled" : "Dicairkan"}</span>
                      ) : (
                        <span className="text-[#71717A]">{isEn ? "In Transit" : "Di Perjalanan"}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectingShipment(ship)}
                          className="px-2.5 py-1 bg-[#1c1c1c] hover:bg-[#282828] border border-[#333] hover:border-white text-xs font-mono font-semibold text-white rounded-lg transition-colors cursor-pointer"
                        >
                          {isEn ? "Milestones" : "Posisi Paket"}
                        </button>
                        {ship.currentStatus === "DELIVERED" && ship.escrowStatus !== "RELEASED" && (
                          <button
                            onClick={() => setCompletingShipment(ship)}
                            title={isEn ? "Force Complete / Release Escrow" : "Paksa Selesai / Cairkan Rekber"}
                            className="p-1.5 bg-[#181818] hover:bg-[#262626] border border-[#2E2E2E] hover:border-white text-white rounded-lg transition-colors cursor-pointer"
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
        <div className="p-3.5 border-t border-[#1e1e1e] bg-[#141414] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#777] gap-3">
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
              className="relative w-full max-w-lg bg-[#141414] border border-[#333] rounded-2xl p-5 sm:p-6 shadow-2xl z-10 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-sky-400">
                    {isEn ? "Live Telemetry Milestones" : "Riwayat Perjalanan Paket"}
                  </span>
                  <h3 className="text-base font-bold text-white uppercase font-heading mt-0.5">
                    AWB: {inspectingShipment.trackingNumber}
                  </h3>
                </div>
                <button
                  onClick={() => setInspectingShipment(null)}
                  className="text-[#888] hover:text-white p-1 cursor-pointer"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Vertical Checkpoint Timeline */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {inspectingShipment.milestones.map((m, idx) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    {idx !== inspectingShipment.milestones.length - 1 && (
                      <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-[#262626] -translate-x-1/2" />
                    )}
                    <div className="w-6 h-6 rounded-full bg-[#1e1e1e] border border-[#333] flex items-center justify-center text-xs font-mono font-bold text-white shrink-0 z-10">
                      {idx + 1}
                    </div>
                    <div className="space-y-0.5 flex-1 bg-[#191919] p-3 rounded-xl border border-[#282828]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{m.stage.replace(/_/g, " ")}</span>
                        <span className="text-[10px] font-mono text-[#888]">{m.timestamp}</span>
                      </div>
                      <p className="text-xs text-[#aaa] font-sans">{m.description}</p>
                      <span className="text-[10px] font-mono text-sky-400 block pt-1">
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
                  className="px-3.5 py-1.5 bg-[#222] hover:bg-[#333] text-white text-xs font-mono rounded-lg transition-colors cursor-pointer"
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
              className="relative w-full max-w-md bg-[#141414] border border-[#333] rounded-2xl p-5 shadow-2xl z-10 space-y-4"
            >
              <h3 className="text-sm font-bold text-white font-heading uppercase">
                {isEn
                  ? `Settle Escrow for Order #${completingShipment.orderNumber}?`
                  : `Selesaikan Escrow Order #${completingShipment.orderNumber}?`}
              </h3>
              <p className="text-xs text-[#888] font-sans">
                {isEn
                  ? `Package delivered to buyer (${completingShipment.buyerName}). This action closes the 2x24h trial period and releases the escrow payout to merchant `
                  : `Paket telah terkonfirmasi diterima oleh pembeli (${completingShipment.buyerName}). Tindakan ini akan menutup masa inspeksi dan mencairkan saldo payout ke rekening toko `}
                <strong className="text-white">{completingShipment.sellerStore}</strong>.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingShipment(null)}
                  className="px-3.5 py-1.5 bg-[#222] hover:bg-[#333] text-white text-xs font-mono rounded-lg transition-colors cursor-pointer"
                >
                  {isEn ? "Cancel" : "Batal"}
                </button>
                <button
                  type="button"
                  onClick={() => handleForceRelease(completingShipment.id)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-lg shadow-emerald-900/40"
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
