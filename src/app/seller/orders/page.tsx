"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { triggerAppNotification } from "@/context/NotificationContext";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  Download,
  AlertCircle,
  FileText,
  Sparkles,
  Printer,
  ExternalLink,
} from "lucide-react";

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
  status: "TO_SHIP" | "IN_TRANSIT" | "COMPLETED" | "DISPUTED" | "CANCELLED";
  escrowStatus: "HELD_IN_ESCROW" | "RELEASED" | "REFUNDED";
  isDelivered?: boolean;
  platformFee?: number;
  platformCommissionRate?: number;
  platformCommissionFee?: number;
  netSellerPayout?: number;
  cancelReason?: string;
  cancelledBy?: "BUYER" | "SELLER";
  cancelledAt?: string;
  shippingFee?: number;
  insuranceFee?: number;
}

const SELLER_CANCEL_REASONS = [
  "Stok produk habis / cacat produksi fisik",
  "Toko sedang tutup sementara / renovasi fasilitas",
  "Alamat pembeli di luar jangkauan kurir ekspedisi",
  "Permintaan pembeli langsung via obrolan",
  "Lainnya",
];

const COURIER_OPTIONS = [
  "JNE Express",
  "SiCepat Ekspres",
  "J&T Express",
  "AnterAja",
  "Lion Parcel",
  "FedEx Priority",
];

export default function SellerOrdersPage() {
  const { language } = useLanguage();
  const isEn = language === "English";

  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [currency, setCurrency] = useState<"IDR" | "USD">("IDR");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "TO_SHIP" | "IN_TRANSIT" | "COMPLETED" | "DISPUTED" | "CANCELLED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadCurrency = () => {
      const saved = localStorage.getItem("tonalzone_seller_currency") as "IDR" | "USD" | null;
      setCurrency(saved || "IDR");
    };
    loadCurrency();
    window.addEventListener("storage", loadCurrency);
    return () => window.removeEventListener("storage", loadCurrency);
  }, []);

  const formatPrice = (usd: number) => {
    if (currency === "IDR") {
      return `Rp ${Math.round(usd * 15500).toLocaleString("id-ID")}`;
    }
    return `$${usd.toLocaleString()}`;
  };

  // Waybill Dispatch Modal State
  const [dispatchOrder, setDispatchOrder] = useState<SellerOrder | null>(null);
  const [selectedCourier, setSelectedCourier] = useState(COURIER_OPTIONS[0]);
  const [waybillInput, setWaybillInput] = useState("");
  const [isSubmittingDispatch, setIsSubmittingDispatch] = useState(false);

  // Seller Cancel Modal State
  const [sellerCancelOrder, setSellerCancelOrder] = useState<SellerOrder | null>(null);
  const [sellerCancelReason, setSellerCancelReason] = useState(SELLER_CANCEL_REASONS[0]);
  const [sellerCancelNotes, setSellerCancelNotes] = useState("");
  const [isSubmittingSellerCancel, setIsSubmittingSellerCancel] = useState(false);

  // Packing Slip Modal State
  const [slipOrder, setSlipOrder] = useState<SellerOrder | null>(null);

  // Alert toast
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Fetch live orders
  const loadSellerOrders = async () => {
    setIsLoading(true);
    try {
      let storeIdParam = "";
      let emailParam = "";
      const savedMode = localStorage.getItem("tonalzone_seller_mode");
      const stored = localStorage.getItem("tonalzone_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u.storeId) storeIdParam = u.storeId;
          if (u.email) emailParam = u.email;
        } catch (e) {}
      }
      if (!storeIdParam) {
        if (emailParam.includes("bass") || (stored && stored.toLowerCase().includes("bass audio"))) {
          storeIdParam = "04595ba3-8657-4aa6-95da-941f6e1717f8";
        } else if (emailParam.includes("csi") || (stored && stored.toLowerCase().includes("csi zone"))) {
          storeIdParam = "store-csi-zone";
        } else if (savedMode === "OFFICIAL_BRAND" || !stored) {
          storeIdParam = "store-moondrop-official";
        }
      }

      const query = new URLSearchParams();
      if (storeIdParam) query.set("storeId", storeIdParam);
      if (emailParam) query.set("email", emailParam);

      const res = await fetch(`/api/seller/orders${query.toString() ? `?${query.toString()}` : ""}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
          localStorage.setItem("tonalzone_seller_orders", JSON.stringify(data.orders));
          return;
        }
      }
      setOrders([]);
    } catch (err) {
      console.error("Failed to load /api/seller/orders:", err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSellerOrders();
  }, []);

  const triggerToast = (msg: string) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(null), 4000);
  };

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
    if (!dispatchOrder || !waybillInput.trim()) return;

    setIsSubmittingDispatch(true);
    const waybillClean = waybillInput.trim().toUpperCase();
    const orderIdToShip = dispatchOrder.id;
    const productName = dispatchOrder.productName;

    // 1. Optimistic local state update (INSTANT feedback)
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderIdToShip
          ? {
              ...o,
              status: "IN_TRANSIT",
              waybill: waybillClean,
              courier: selectedCourier,
              isDelivered: false,
            }
          : o
      )
    );
    setActiveTab("IN_TRANSIT");

    try {
      const res = await fetch(`/api/orders/${orderIdToShip}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waybillNumber: waybillClean, courierCode: selectedCourier }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengonfirmasi pengiriman.");
      }

      triggerToast(`Paket #${orderIdToShip} berhasil dikirim! Status langsung berubah ke Sedang Dikirim. Paket otomatis tiba dalam 3 detik untuk ulasan pembeli.`);
      triggerAppNotification({
        type: "order",
        title: "Pesanan Dikirim ke Pembeli",
        message: `Pesanan #${orderIdToShip} (${productName}) telah di-dispatch via ${selectedCourier} (${waybillClean}).`,
        actionLink: "/orders",
        meta: {
          orderId: orderIdToShip,
          productName: productName,
        },
      });

      setDispatchOrder(null);
      setWaybillInput("");
      await loadSellerOrders();

      // Otomatis refresh kembali setelah 3.5 detik saat paket tiba di tujuan
      setTimeout(() => {
        loadSellerOrders();
      }, 3500);
    } catch (err: any) {
      triggerToast(err.message || "Gagal menyimpan nomor resi.");
      loadSellerOrders();
    } finally {
      setIsSubmittingDispatch(false);
    }
  };

  const handleConfirmSellerCancel = async () => {
    if (!sellerCancelOrder) return;
    setIsSubmittingSellerCancel(true);
    const orderIdToCancel = sellerCancelOrder.id;
    const prodName = sellerCancelOrder.productName;
    const finalReason = sellerCancelNotes.trim()
      ? `${sellerCancelReason}: ${sellerCancelNotes.trim()}`
      : sellerCancelReason;

    try {
      const res = await fetch(`/api/orders/${orderIdToCancel}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: finalReason,
          cancelledBy: "SELLER",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal membatalkan pesanan.");
      }

      triggerToast(`Pesanan #${orderIdToCancel} berhasil dibatalkan. Pembeli telah menerima pengembalian dana 100%.`);
      triggerAppNotification({
        type: "order",
        title: "Pesanan Dibatalkan oleh Penjual",
        message: `Pesanan #${orderIdToCancel} (${prodName}) telah dibatalkan oleh pihak toko. Alasan: ${finalReason}`,
        actionLink: "/orders",
      });

      setSellerCancelOrder(null);
      setSellerCancelNotes("");
      await loadSellerOrders();
    } catch (err: any) {
      triggerToast(err.message || "Gagal membatalkan pesanan.");
    } finally {
      setIsSubmittingSellerCancel(false);
    }
  };

  // Auto-generate realistic test waybill
  const generateRandomWaybill = () => {
    const prefix = selectedCourier.includes("SiCepat")
      ? "SCP"
      : selectedCourier.includes("J&T")
      ? "JNT"
      : selectedCourier.includes("Lion")
      ? "LP"
      : "JNE";
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
    setWaybillInput(`${prefix}-${randomDigits}`);
  };

  const getStatusBadge = (order: SellerOrder) => {
    switch (order.status) {
      case "TO_SHIP":
        return {
          label: "Perlu Dikemas",
          bg: "bg-[#181818]",
          text: "text-[#D4D4D8]",
          icon: <Clock className="w-3.5 h-3.5" />,
        };
      case "IN_TRANSIT":
        return {
          label: order.isDelivered ? "Tiba di Pembeli" : "Sedang Dikirim",
          bg: order.isDelivered ? "bg-[#141F17]" : "bg-[#181818]",
          text: order.isDelivered ? "text-emerald-400" : "text-white",
          icon: order.isDelivered ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Truck className="w-3.5 h-3.5 text-white" />,
        };
      case "COMPLETED":
        return {
          label: "Selesai",
          bg: "bg-[#141F17]",
          text: "text-emerald-400",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case "DISPUTED":
        return {
          label: "Dalam Retur / Komplain",
          bg: "bg-[#241414]",
          text: "text-red-400",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
        };
      case "CANCELLED":
        return {
          label: "Dibatalkan",
          bg: "bg-[#241414]",
          text: "text-red-400",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
        };
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[#030303] text-[#FAF9F6] p-6 sm:p-8 space-y-6">
      {/* Toast Alert */}
      <AnimatePresence>
        {alertMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-2xl bg-[#141414] text-white text-xs font-sans flex items-center gap-3"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{alertMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono text-[#BFDD25] uppercase tracking-widest font-semibold">
              Pusat Pemenuhan Pesanan Toko • Escrow Verified
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white font-heading">
            Pesanan Masuk & Pengiriman Paket
          </h1>
          <p className="text-xs text-[#8E8E93] font-sans mt-1 max-w-2xl">
            Kemas pesanan pembeli, input nomor resi kurir, dan pantau pencairan otomatis saldo escrow toko Anda.
          </p>
        </div>

        <div className="flex items-center gap-3">
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
            className="px-4 py-2.5 rounded-full bg-[#111111] hover:bg-[#1A1A1A] text-xs font-mono text-[#A1A1AA] hover:text-white transition-all flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Toolbar (Rounded-full, Zero Border) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: "ALL", label: "Semua Pesanan", count: orders.length },
            {
              id: "TO_SHIP",
              label: "Perlu Dikemas",
              count: orders.filter((o) => o.status === "TO_SHIP").length,
            },
            {
              id: "IN_TRANSIT",
              label: "Dalam Pengiriman",
              count: orders.filter((o) => o.status === "IN_TRANSIT").length,
            },
            {
              id: "COMPLETED",
              label: "Selesai",
              count: orders.filter((o) => o.status === "COMPLETED").length,
            },
            {
              id: "DISPUTED",
              label: "Retur / Komplain",
              count: orders.filter((o) => o.status === "DISPUTED").length,
            },
            {
              id: "CANCELLED",
              label: "Dibatalkan",
              count: orders.filter((o) => o.status === "CANCELLED").length,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-sans whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-white text-black font-bold shadow-md"
                    : "bg-[#0E0E0E] hover:bg-[#181818] text-[#A1A1AA]"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? "bg-black text-white" : "bg-[#27272A] text-white"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID pesanan, pembeli, resi..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#0E0E0E] text-xs text-white placeholder:text-[#52525B] outline-none border-0 focus:ring-1 focus:ring-white/30"
          />
        </div>
      </div>

      {/* Orders List Container */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#333333] border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-[#71717A] tracking-wider uppercase">
            Memuat Daftar Pesanan Toko...
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-[#0A0A0A] p-10 space-y-2">
          <Package className="w-10 h-10 text-[#52525B] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-white">Tidak Ada Pesanan Ditemukan</h3>
          <p className="text-xs text-[#71717A] max-w-sm mx-auto">
            {activeTab === "ALL"
              ? "Belum ada pesanan yang masuk ke toko Anda."
              : "Tidak ada pesanan di kategori status ini."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            const badge = getStatusBadge(ord);

            return (
              <div
                key={ord.id}
                className="rounded-2xl bg-[#0A0A0A] p-6 sm:p-7 space-y-5 transition-all hover:bg-[#0C0C0C]"
              >
                {/* Card Top: Order ID, Date, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-[#181818] text-xs font-mono font-bold text-white">
                      #{ord.id}
                    </span>
                    <span className="text-xs font-mono text-[#71717A]">{ord.createdAt}</span>
                    <span className="text-[#3F3F46]">•</span>
                    <span className="text-xs font-mono text-[#A1A1AA]">{ord.buyerCity}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                    </div>
                  </div>
                </div>

                {/* Card Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Product & Qty (Col 5) */}
                  <div className="lg:col-span-5 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block">
                      Produk Pesanan
                    </span>
                    <h4 className="text-sm font-semibold text-white tracking-tight">
                      {ord.productName}
                    </h4>
                    <p className="text-xs font-mono text-[#8E8E93]">
                      Jumlah: {ord.productQty} unit
                    </p>
                    <p className="text-xs font-mono font-bold text-white mt-1">
                      Total: ${ord.totalPriceUSD.toLocaleString()}
                    </p>
                  </div>

                  {/* Buyer & Address (Col 4) */}
                  <div className="lg:col-span-4 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block">
                      Tujuan Pengiriman
                    </span>
                    <p className="text-xs font-semibold text-white">{ord.buyerName}</p>
                    <p className="text-xs text-[#8E8E93] leading-relaxed line-clamp-2">
                      {ord.buyerAddress || ord.buyerCity}
                    </p>
                  </div>

                  {/* Logistics & Resi (Col 3) */}
                  <div className="lg:col-span-3 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block">
                      Ekspedisi & Resi
                    </span>
                    <p className="text-xs font-medium text-white">{ord.courier}</p>
                    {ord.waybill ? (
                      <span className="inline-block px-2.5 py-1 rounded-full bg-[#181818] text-white text-xs font-mono font-bold mt-1">
                        {ord.waybill}
                      </span>
                    ) : (
                      <p className="text-xs text-[#71717A] italic mt-0.5">
                        Menunggu input resi toko
                      </p>
                    )}
                  </div>
                </div>

                {/* Cancellation Banner */}
                {ord.status === "CANCELLED" && (
                  <div className="p-3.5 bg-red-500/10 rounded-xl text-xs font-mono text-red-300 border-0">
                    <span className="font-bold text-red-400 uppercase tracking-wider block">
                      Pesanan Dibatalkan oleh {ord.cancelledBy === "SELLER" ? "Penjual" : "Pembeli"}
                    </span>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Alasan: {ord.cancelReason || "Dibatalkan sebelum pengiriman"}
                    </p>
                    <span className="text-[10px] text-zinc-500 mt-0.5 block">
                      Dana escrow telah dikembalikan 100% ke pembeli.
                    </span>
                  </div>
                )}

                {/* Financial Breakdown (Platform Commission & Net Payout) */}
                {(() => {
                  const commVal = (ord.platformCommissionFee && ord.platformCommissionFee > 0)
                    ? ord.platformCommissionFee
                    : Math.round(ord.totalPriceUSD * 0.03 * 100) / 100;
                  const netVal = (ord.netSellerPayout && ord.netSellerPayout > 0)
                    ? ord.netSellerPayout
                    : Math.round((ord.totalPriceUSD - commVal) * 100) / 100;

                  return (
                    <div className="p-4 rounded-xl bg-[#141414] border-0 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                      <div className="flex flex-wrap items-center gap-5 text-[#A1A1AA]">
                        <div>
                          <span className="text-[10px] text-[#71717A] uppercase block">Nilai Transaksi</span>
                          <span className="text-white font-medium">{formatPrice(ord.totalPriceUSD)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#71717A] uppercase block">Komisi Platform (3.0%)</span>
                          <span className="text-amber-400 font-medium">
                            -{formatPrice(commVal)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#71717A] uppercase block">Pendapatan Bersih Toko</span>
                          <span className="text-emerald-400 font-bold">
                            {formatPrice(netVal)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#71717A] uppercase block">Proteksi Escrow</span>
                        <span
                          className={`text-[11px] font-bold ${
                            ord.status === "COMPLETED"
                              ? "text-emerald-400"
                              : ord.status === "CANCELLED"
                              ? "text-red-400"
                              : "text-[#BFDD25]"
                          }`}
                        >
                          {ord.status === "COMPLETED"
                            ? "Dana Cair ke Toko"
                            : ord.status === "CANCELLED"
                            ? "Dibatalkan (Refunded)"
                            : "Tersimpan di Escrow"}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Card Action Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSlipOrder(ord)}
                      className="px-4 py-2 rounded-full bg-[#141414] hover:bg-[#1E1E1E] text-xs font-semibold text-[#D4D4D8] hover:text-white flex items-center gap-1.5 transition-all cursor-pointer border-0"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Cetak Label Pengiriman</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {ord.status === "TO_SHIP" && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setSellerCancelOrder(ord);
                            setSellerCancelReason(SELLER_CANCEL_REASONS[0]);
                            setSellerCancelNotes("");
                          }}
                          className="px-4 py-2.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono font-medium transition-all cursor-pointer border-0"
                        >
                          Batalkan
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDispatchOrder(ord);
                            setSelectedCourier(ord.courier || COURIER_OPTIONS[0]);
                            setWaybillInput("");
                          }}
                          className="px-6 py-2.5 rounded-full bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2 border-0"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Kemas & Input Resi</span>
                        </button>
                      </>
                    )}

                    {ord.status === "IN_TRANSIT" && (
                      <span className="text-xs text-[#D4D4D8] font-medium py-1 flex items-center gap-1.5">
                        {ord.isDelivered ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-white">Paket telah tiba di penerima • Menunggu ulasan pembeli</span>
                          </>
                        ) : (
                          <>
                            <Truck className="w-3.5 h-3.5 text-white" />
                            <span>Paket dalam perjalanan via kurir</span>
                          </>
                        )}
                      </span>
                    )}

                    {ord.status === "COMPLETED" && (
                      <span className="text-xs text-emerald-400 font-medium py-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Barang telah sampai & dana diterima</span>
                      </span>
                    )}

                    {ord.status === "CANCELLED" && (
                      <span className="text-xs text-red-400 font-mono font-medium py-1">
                        Pesanan Telah Dibatalkan
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: INPUT WAYBILL / RESI PENGIRIMAN (Rounded-2xl, Zero Border) */}
      <AnimatePresence>
        {dispatchOrder && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl bg-[#0E0E0E] p-6 sm:p-8 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white text-xs font-mono uppercase tracking-wider font-semibold">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>Kemas & Kirimkan Pesanan</span>
                </div>
                <span className="text-xs font-mono text-white font-bold">
                  #{dispatchOrder.id}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  Konfirmasi Pengiriman Kurir
                </h3>
                <p className="text-xs text-[#8E8E93] mt-1">
                  Masukkan nomor resi ekspedisi setelah paket di-pick up kurir. Pembeli akan langsung menerima notifikasi pelacakan real-time.
                </p>
              </div>

              {/* Order Info Snippet */}
              <div className="p-4 rounded-xl bg-[#141414] space-y-1">
                <p className="text-xs font-semibold text-white">{dispatchOrder.productName}</p>
                <p className="text-[11px] text-[#71717A]">
                  Tujuan: {dispatchOrder.buyerName} • {dispatchOrder.buyerCity}
                </p>
              </div>

              <form onSubmit={handleConfirmDispatch} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717A] mb-2">
                    Pilih Ekspedisi Kurir
                  </label>
                  <select
                    value={selectedCourier}
                    onChange={(e) => setSelectedCourier(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] text-xs text-white outline-none border-0 focus:ring-1 focus:ring-white/30 cursor-pointer"
                  >
                    {COURIER_OPTIONS.map((c) => (
                      <option key={c} value={c} className="bg-[#181818] text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717A]">
                      Nomor Resi Pengiriman *
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomWaybill}
                      className="text-[10px] font-mono text-[#A1A1AA] hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>Generate Resi Otomatis</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={waybillInput}
                    onChange={(e) => setWaybillInput(e.target.value)}
                    placeholder="Contoh: JNE-88491024"
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] text-xs font-mono uppercase text-white placeholder:text-[#52525B] outline-none border-0 focus:ring-1 focus:ring-white/30"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setDispatchOrder(null)}
                    className="px-5 py-2.5 rounded-full bg-[#181818] hover:bg-[#222222] text-xs font-semibold text-[#A1A1AA] transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingDispatch || !waybillInput.trim()}
                    className="px-6 py-2.5 rounded-full bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {isSubmittingDispatch ? "Menyimpan..." : "Konfirmasi & Kirim Paket"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: PACKING SLIP & SHIPPING LABEL */}
      <AnimatePresence>
        {slipOrder && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-[#0E0E0E] p-6 sm:p-8 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white text-xs font-mono uppercase tracking-wider font-bold">
                  <FileText className="w-4 h-4 text-white" />
                  <span>Label Pengiriman Toko</span>
                </div>
                <span className="text-xs font-mono text-white font-bold">#{slipOrder.id}</span>
              </div>

              {/* Printable Label Box */}
              <div className="p-5 rounded-2xl bg-white text-black space-y-3 font-sans text-xs shadow-lg">
                <div className="bg-black/[0.04] p-3 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold uppercase tracking-wider text-xs font-mono">
                      TONAL ZONE ESCROW
                    </h4>
                    <p className="text-[10px] text-gray-500 font-mono">Official Audiophile Logistics</p>
                  </div>
                  <div className="text-right font-mono text-xs font-bold">
                    {slipOrder.courier}
                  </div>
                </div>

                <div className="bg-black/[0.02] p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-gray-400 uppercase block">
                    Penerima Paket:
                  </span>
                  <p className="font-bold text-sm">{slipOrder.buyerName}</p>
                  <p className="text-xs text-gray-600 leading-snug">
                    {slipOrder.buyerAddress || slipOrder.buyerCity}
                  </p>
                </div>

                <div className="bg-black/[0.02] p-3 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-gray-400 uppercase block">
                    Isi Paket:
                  </span>
                  <p className="font-semibold text-xs">{slipOrder.productName}</p>
                  <p className="text-[11px] text-gray-500 font-mono">
                    Qty: {slipOrder.productQty}x • Total: {formatPrice(slipOrder.totalPriceUSD)}
                  </p>
                </div>

                {slipOrder.waybill && (
                  <div className="bg-black/[0.04] p-3 rounded-xl text-center">
                    <p className="font-mono font-bold text-sm tracking-widest">{slipOrder.waybill}</p>
                    <div className="h-6 bg-black/10 rounded-lg mt-1.5 flex items-center justify-center text-[9px] font-mono text-gray-400">
                      ||| | |||| | ||| |||| | || | |||
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSlipOrder(null)}
                  className="px-5 py-2.5 rounded-full bg-[#181818] hover:bg-[#222222] text-xs font-semibold text-[#A1A1AA] transition-all cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-6 py-2.5 rounded-full bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Label</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: SELLER CANCEL ORDER (Rounded-2xl, Zero Border) */}
      <AnimatePresence>
        {sellerCancelOrder && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl bg-[#0E0E0E] p-6 sm:p-8 space-y-5 border-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-red-400 uppercase tracking-wider font-bold">
                  PEMBATALAN OLEH PENJUAL
                </span>
                <span className="text-xs font-mono text-zinc-400 font-bold">
                  #{sellerCancelOrder.id}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  Batalkan Pesanan Ini?
                </h3>
                <p className="text-xs text-[#8E8E93] mt-1">
                  Jika toko membatalkan pesanan, dana escrow akan dikembalikan 100% ke pembeli dan stok otomatis dipulihkan ke etalase.
                </p>
              </div>

              <div className="p-3.5 bg-[#141414] rounded-xl text-xs font-mono text-zinc-300 space-y-1 border-0">
                <div className="font-semibold text-white">{sellerCancelOrder.productName}</div>
                <div className="text-[11px] text-zinc-400">
                  Pembeli: {sellerCancelOrder.buyerName} ({sellerCancelOrder.buyerCity}) • Total: {formatPrice(sellerCancelOrder.totalPriceUSD)}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-zinc-400 block font-semibold">
                  Alasan Pembatalan:
                </label>
                <div className="space-y-2">
                  {SELLER_CANCEL_REASONS.map((r) => (
                    <label
                      key={r}
                      onClick={() => setSellerCancelReason(r)}
                      className={`flex items-center gap-3.5 p-3 rounded-xl cursor-pointer transition-all text-xs font-mono border ${
                        sellerCancelReason === r
                          ? "bg-[#181818] border-white/50 text-white shadow-sm ring-1 ring-white/20"
                          : "bg-[#121212] border-[#222222] text-zinc-400 hover:text-zinc-200 hover:bg-[#161616] hover:border-[#2A2A2A]"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        sellerCancelReason === r
                          ? "border-white bg-transparent"
                          : "border-zinc-600 bg-transparent"
                      }`}>
                        {sellerCancelReason === r && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="leading-snug">{r}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-zinc-400 block mb-1.5">
                  Catatan Tambahan untuk Pembeli (Opsional):
                </label>
                <textarea
                  rows={2}
                  value={sellerCancelNotes}
                  onChange={(e) => setSellerCancelNotes(e.target.value)}
                  placeholder="Beri alasan spesifik jika perlu..."
                  className="w-full bg-[#141414] p-3 text-white text-xs font-mono placeholder:text-zinc-600 focus:ring-1 focus:ring-white/30 outline-none rounded-xl border-0"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmittingSellerCancel}
                  onClick={() => setSellerCancelOrder(null)}
                  className="px-5 py-2.5 rounded-full bg-[#141414] hover:bg-[#1E1E1E] text-xs font-mono text-[#D4D4D8] transition-colors cursor-pointer border-0"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  disabled={isSubmittingSellerCancel}
                  onClick={handleConfirmSellerCancel}
                  className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 border-0"
                >
                  {isSubmittingSellerCancel ? "Memproses..." : "Konfirmasi Batal"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
