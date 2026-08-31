"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import CustomSelect from "@/components/ui/custom-select";

export interface SellerOrder {
  id: string;
  createdAt: string;
  buyerName: string;
  buyerCity: string;
  buyerAddress: string;
  productName: string;
  productQty: number;
  totalPriceUSD: number;
  courier: string;
  waybill?: string;
  status: "TO_SHIP" | "IN_TRANSIT" | "COMPLETED" | "DISPUTED";
  escrowStatus: "HELD_IN_ESCROW" | "RELEASED" | "REFUNDED";
}

const INITIAL_ORDERS: SellerOrder[] = [
  {
    id: "ORD-9941",
    createdAt: "2026-08-16 15:42",
    buyerName: "Budi Santoso",
    buyerCity: "Surabaya, Jawa Timur",
    buyerAddress: "Jl. Pemuda No. 45, Gubeng",
    productName: "Sennheiser IE 900 Flagship",
    productQty: 1,
    totalPriceUSD: 1299,
    courier: "J&T Express",
    status: "TO_SHIP",
    escrowStatus: "HELD_IN_ESCROW",
  },
  {
    id: "ORD-9938",
    createdAt: "2026-08-16 11:20",
    buyerName: "Sarah Jenkins",
    buyerCity: "Singapore",
    buyerAddress: "12 Marina Boulevard, Tower 3",
    productName: "64 Audio U12t Reference",
    productQty: 1,
    totalPriceUSD: 2499,
    courier: "DHL Express",
    waybill: "DHL-88942109",
    status: "IN_TRANSIT",
    escrowStatus: "HELD_IN_ESCROW",
  },
  {
    id: "ORD-9935",
    createdAt: "2026-08-15 18:05",
    buyerName: "Reza Pratama",
    buyerCity: "Bandung, Jawa Barat",
    buyerAddress: "Jl. Dago No. 112, Coblong",
    productName: "Moondrop Blessing 3 Hybrid",
    productQty: 1,
    totalPriceUSD: 319,
    courier: "JNE YES",
    waybill: "JNE-01994821",
    status: "COMPLETED",
    escrowStatus: "RELEASED",
  },
  {
    id: "ORD-9930",
    createdAt: "2026-08-15 09:30",
    buyerName: "Kenji Tanaka",
    buyerCity: "Tokyo, Japan",
    buyerAddress: "Shibuya-ku, Jingumae 4-12",
    productName: "Effect Audio Ares S 4.4mm Cable",
    productQty: 1,
    totalPriceUSD: 249,
    courier: "FedEx Priority",
    waybill: "FDX-77401928",
    status: "COMPLETED",
    escrowStatus: "RELEASED",
  },
  {
    id: "ORD-9922",
    createdAt: "2026-08-14 14:10",
    buyerName: "Michael Chang",
    buyerCity: "Jakarta Selatan, DKI Jakarta",
    buyerAddress: "Senopati Suites Tower 2, Kebayoran Baru",
    productName: "Tangzu Wan'er S.G Studio Edition",
    productQty: 2,
    totalPriceUSD: 44,
    courier: "SiCepat REG",
    waybill: "SCP-66190241",
    status: "COMPLETED",
    escrowStatus: "RELEASED",
  },
];

export default function SellerOrdersPage() {
  const { language } = useLanguage();
  const isEn = language === "English";

  const [orders, setOrders] = useState<SellerOrder[]>(INITIAL_ORDERS);
  const [activeTab, setActiveTab] = useState<"ALL" | "TO_SHIP" | "IN_TRANSIT" | "COMPLETED" | "DISPUTED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Waybill Dispatch Modal State
  const [dispatchOrder, setDispatchOrder] = useState<SellerOrder | null>(null);
  const [selectedCourier, setSelectedCourier] = useState("J&T Express");
  const [waybillInput, setWaybillInput] = useState("");

  // Packing Slip Modal State
  const [slipOrder, setSlipOrder] = useState<SellerOrder | null>(null);

  // Fetch live orders
  const loadSellerOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) return;
      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        return;
      }
      if (data && data.success && Array.isArray(data.orders)) {
        const mapped: SellerOrder[] = data.orders.map((o: any) => ({
          id: o.id,
          createdAt: new Date(o.createdAt).toISOString().replace("T", " ").substring(0, 16),
          buyerName: o.buyerName || "Audiophile Buyer",
          buyerCity: o.destinationCity || "Jakarta Selatan",
          buyerAddress: o.destinationAddress || "Jl. Sudirman",
          productName: o.items?.[0]?.productName || "Audiophile Gear",
          productQty: o.items?.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0) || 1,
          totalPriceUSD: o.totalAmount,
          courier: o.courierCode || "JNE Express",
          waybill: o.waybillNumber,
          status: o.escrowStatus === "PAYMENT_PENDING" || o.escrowStatus === "HELD_IN_ESCROW"
            ? "TO_SHIP"
            : o.escrowStatus === "IN_TRANSIT"
            ? "IN_TRANSIT"
            : o.escrowStatus === "DISPUTED"
            ? "DISPUTED"
            : "COMPLETED",
          escrowStatus: o.escrowStatus === "FUNDS_RELEASED_TO_SELLER" ? "RELEASED" : "HELD_IN_ESCROW",
        }));
        setOrders(mapped);
      }
    } catch (err) {
      console.error("Failed to load seller orders:", err);
    }
  };

  useEffect(() => {
    loadSellerOrders();
  }, []);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (activeTab !== "ALL" && o.status !== activeTab) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = o.id.toLowerCase().includes(q);
        const matchesBuyer = o.buyerName.toLowerCase().includes(q);
        const matchesProduct = o.productName.toLowerCase().includes(q);
        const matchesWaybill = o.waybill ? o.waybill.toLowerCase().includes(q) : false;
        return matchesId || matchesBuyer || matchesProduct || matchesWaybill;
      }
      return true;
    });
  }, [orders, activeTab, searchQuery]);

  // Handle waybill submission
  const handleConfirmDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dispatchOrder && waybillInput.trim()) {
      const waybillClean = waybillInput.trim().toUpperCase();
      try {
        await fetch(`/api/orders/${dispatchOrder.id}/ship`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ waybillNumber: waybillClean, courierCode: selectedCourier }),
        });
        loadSellerOrders();
      } catch (err) {
        console.error("Error submitting waybill:", err);
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === dispatchOrder.id
            ? {
                ...o,
                courier: selectedCourier,
                waybill: waybillClean,
                status: "IN_TRANSIT",
              }
            : o
        )
      );
      setDispatchOrder(null);
      setWaybillInput("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E1E1E]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold font-sans tracking-tight text-white">
              {isEn ? "Store Orders & Waybill Dispatch" : "Pesanan Toko & Pengiriman Resi"}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1A1A1A] text-[#FAF9F6] border border-[#2E2E2E]">
              {orders.length} {isEn ? "Total Orders" : "Total Pesanan"}
            </span>
          </div>
          <p className="text-xs font-mono text-[#8E8E93] mt-1">
            {isEn
              ? "Process buyer orders, input courier waybills, generate shipping labels, and track earnings settlement."
              : "Proses pesanan pembeli, input nomor resi kurir, cetak label pengiriman, dan pantau status penerimaan dana toko."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              const header = "OrderID,CreatedAt,Buyer,City,Product,Qty,TotalUSD,Courier,Waybill,Status\n";
              const rows = orders
                .map(
                  (o) =>
                    `"${o.id}","${o.createdAt}","${o.buyerName}","${o.buyerCity}","${o.productName}",${o.productQty},${o.totalPriceUSD},"${o.courier}","${o.waybill || ""}","${o.status}"`
                )
                .join("\n");
              const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", `tonalzone_orders_${new Date().toISOString().split("T")[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="inline-flex items-center gap-1.5 bg-[#141414] hover:bg-[#1C1C1C] text-[#FAF9F6] border border-[#262626] hover:border-[#3E3E3E] px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {isEn ? "Export Order List" : "Ekspor Pesanan"}
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden flex flex-col">
        {/* Toolbar: Status Tabs & Search */}
        <div className="p-4 border-b border-[#1E1E1E] bg-[#141414] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {[
              { id: "ALL", label: isEn ? "All Orders" : "Semua Pesanan", count: orders.length },
              { id: "TO_SHIP", label: isEn ? "To Ship" : "Perlu Kirim", count: orders.filter((o) => o.status === "TO_SHIP").length },
              { id: "IN_TRANSIT", label: isEn ? "In Transit" : "Dalam Pengiriman", count: orders.filter((o) => o.status === "IN_TRANSIT").length },
              { id: "COMPLETED", label: isEn ? "Delivered & Settled" : "Selesai", count: orders.filter((o) => o.status === "COMPLETED").length },
              { id: "DISPUTED", label: isEn ? "Disputes" : "Komplain", count: orders.filter((o) => o.status === "DISPUTED").length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all cursor-pointer whitespace-nowrap border ${
                  activeTab === tab.id
                    ? "bg-[#242424] text-[#FAF9F6] font-semibold border-[#383838] shadow-sm"
                    : "text-[#8E8E93] hover:text-[#FAF9F6] hover:bg-[#1A1A1A] border-transparent"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-[10px] font-mono text-[#777]">({tab.count})</span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <svg className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? "Search order, buyer, waybill..." : "Cari pesanan, pembeli, resi..."}
              className="w-full bg-[#111] border border-[#2A2A2A] rounded-lg pl-9 pr-8 py-1.5 text-xs font-sans text-white placeholder:text-[#666] focus:outline-none focus:border-[#555] transition-colors"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b border-[#1E1E1E] bg-[#0E0E0E] text-[10px] font-mono uppercase text-[#777] tracking-wider">
                <th className="px-5 py-3.5">{isEn ? "Order ID / Date" : "ID Pesanan / Waktu"}</th>
                <th className="px-5 py-3.5">{isEn ? "Product" : "Produk"}</th>
                <th className="px-5 py-3.5">{isEn ? "Buyer & Destination" : "Pembeli & Alamat"}</th>
                <th className="px-5 py-3.5">{isEn ? "Courier / Waybill" : "Ekspedisi / No Resi"}</th>
                <th className="px-5 py-3.5 text-right">{isEn ? "Amount" : "Total Bayar"}</th>
                <th className="px-5 py-3.5 text-center">{isEn ? "Payment Status" : "Status Pembayaran"}</th>
                <th className="px-5 py-3.5 text-right">{isEn ? "Actions" : "Aksi"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#161616] transition-colors">
                    {/* Order ID & Date */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-white text-xs">{ord.id}</span>
                        <span className="text-[10px] font-mono text-[#888] mt-0.5">{ord.createdAt}</span>
                      </div>
                    </td>

                    {/* Product Info */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col max-w-xs">
                        <span className="font-semibold text-white truncate">{ord.productName}</span>
                        <span className="text-[10px] font-mono text-[#888]">Qty: {ord.productQty}x</span>
                      </div>
                    </td>

                    {/* Buyer & Destination */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col max-w-xs">
                        <span className="font-medium text-white">{ord.buyerName}</span>
                        <span className="text-[11px] text-[#888] truncate">{ord.buyerCity}</span>
                      </div>
                    </td>

                    {/* Courier / Waybill */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-white">{ord.courier}</span>
                        {ord.waybill ? (
                          <span className="font-mono text-[10px] text-[#CCCCCC] font-bold tracking-wider">
                            {ord.waybill}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-[#777777]">
                            {isEn ? "Pending Waybill" : "Belum Ada Resi"}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap font-mono font-bold text-white text-xs">
                      ${ord.totalPriceUSD.toLocaleString()}
                    </td>

                    {/* Payment Status */}
                    <td className="px-5 py-3.5 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-2 px-2.5 py-1 text-xs font-mono font-medium bg-[#141414] text-[#CCCCCC] border border-[#222222]">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            ord.escrowStatus === "RELEASED" ? "bg-white" : "bg-[#777777]"
                          }`}
                        />
                        {ord.escrowStatus === "RELEASED"
                          ? isEn ? "Settled" : "Dana Diterima"
                          : isEn ? "Payment Verified" : "Sudah Dibayar"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {ord.status === "TO_SHIP" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setDispatchOrder(ord);
                              setSelectedCourier(ord.courier);
                              setWaybillInput("");
                            }}
                            className="px-3 py-1 bg-[#1C1C1C] hover:bg-[#282828] text-white border border-[#2E2E2E] hover:border-white text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
                          >
                            {isEn ? "Input Resi" : "Input Resi"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSlipOrder(ord)}
                            className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#262626] border border-[#2E2E2E] text-white text-[11px] font-mono rounded transition-colors cursor-pointer"
                          >
                            {isEn ? "Packing Slip" : "Cetak Resi"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs font-mono text-[#888]">
                    {isEn ? "No orders found matching tab filter." : "Tidak ada pesanan pada filter ini."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: INPUT WAYBILL / RESI PENGIRIMAN */}
      <AnimatePresence>
        {dispatchOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDispatchOrder(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#111111] border border-[#2A2A2A] rounded-2xl shadow-2xl p-6 font-sans z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#222]">
                <h3 className="text-sm font-bold text-white">
                  {isEn ? "Fulfill Order & Dispatch Waybill" : "Kirim Pesanan & Input Nomor Resi"}
                </h3>
                <button onClick={() => setDispatchOrder(null)} className="text-[#888] hover:text-white">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-[#161616] p-3 rounded-xl border border-[#262626] space-y-1 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-[#888]">Order ID:</span>
                  <span className="font-bold text-white">{dispatchOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">Buyer:</span>
                  <span className="text-white">{dispatchOrder.buyerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888]">Destination:</span>
                  <span className="text-white truncate max-w-[200px]">{dispatchOrder.buyerCity}</span>
                </div>
              </div>

              <form onSubmit={handleConfirmDispatch} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[10px] font-mono text-[#888] uppercase mb-1">
                    {isEn ? "Courier Fleet Partner" : "Kurir Ekspedisi"}
                  </label>
                  <CustomSelect
                    value={selectedCourier}
                    onChange={(val) => setSelectedCourier(val)}
                    options={[
                      { label: "J&T Express", value: "J&T Express" },
                      { label: "JNE Express (REG / YES)", value: "JNE Express" },
                      { label: "SiCepat Cargo / REG", value: "SiCepat" },
                      { label: "DHL Express Priority", value: "DHL Express" },
                      { label: "FedEx International", value: "FedEx" },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#888] uppercase mb-1">
                    {isEn ? "Air Waybill Number (Resi) *" : "Nomor Resi Pengiriman (No. AWB) *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isEn ? "e.g. JNT-88942109ID" : "Contoh: JNT-88942109ID"}
                    value={waybillInput}
                    onChange={(e) => setWaybillInput(e.target.value)}
                    className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs font-mono font-bold text-white uppercase placeholder:text-[#555] outline-none focus:border-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222]">
                  <button
                    type="button"
                    onClick={() => setDispatchOrder(null)}
                    className="px-3.5 py-1.5 bg-[#1A1A1A] hover:bg-[#242424] text-white text-xs font-mono rounded-lg transition-colors cursor-pointer"
                  >
                    {isEn ? "Cancel" : "Batal"}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs font-sans rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    {isEn ? "Confirm & Mark Dispatched" : "Konfirmasi Pengiriman"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: PACKING SLIP / LABEL */}
      <AnimatePresence>
        {slipOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSlipOrder(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#FAF9F6] text-black rounded-2xl shadow-2xl p-6 font-sans z-10 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-black/10">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-black text-white flex items-center justify-center font-bold text-[10px] rounded">
                    TZ
                  </div>
                  <span className="font-mono font-bold text-xs">TONAL ZONE SHIPPING SLIP</span>
                </div>
                <button onClick={() => setSlipOrder(null)} className="text-black/50 hover:text-black font-bold">
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono border-b border-black/10 pb-4">
                <div>
                  <span className="text-black/50 text-[10px] block">FROM (SELLER):</span>
                  <p className="font-bold">AudioZone Official Store</p>
                  <p className="text-[11px] text-black/70">Jakarta Barat, DKI Jakarta</p>
                </div>
                <div>
                  <span className="text-black/50 text-[10px] block">SHIP TO (BUYER):</span>
                  <p className="font-bold">{slipOrder.buyerName}</p>
                  <p className="text-[11px] text-black/70">{slipOrder.buyerAddress}</p>
                  <p className="text-[11px] text-black/70">{slipOrder.buyerCity}</p>
                </div>
              </div>

              <div className="space-y-2 py-2 border-b border-black/10 text-xs font-mono">
                <div className="flex justify-between">
                  <span>Courier: {slipOrder.courier}</span>
                  <span className="font-bold">AWB: {slipOrder.waybill || "N/A"}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>{slipOrder.productName} (x{slipOrder.productQty})</span>
                  <span>${slipOrder.totalPriceUSD}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] font-mono text-black/50">Audiophile Fragile Handling Required</span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-black text-white text-xs font-bold font-mono rounded-lg hover:bg-black/80 transition-colors"
                >
                  {isEn ? "Print Shipping Slip" : "Cetak Label Resi"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
