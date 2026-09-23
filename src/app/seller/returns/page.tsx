"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  ShieldCheck,
  AlertCircle,
  Package,
  MessageSquare,
  Eye,
  ExternalLink,
  MapPin,
  Video,
  Play,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { triggerAppNotification } from "@/context/NotificationContext";

export interface SellerReturnItem {
  id: string;
  orderId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  storeId: string;
  storeName: string;
  productId: string;
  productName: string;
  productImage?: string;
  productPrice: number;
  quantity: number;
  selectedVariant?: string;
  reason: string;
  description: string;
  evidenceImages: string[];
  unboxingVideoUrl?: string;
  unboxingVideoType?: "upload" | "link";
  requestedSolution?: "REFUND" | "REPLACEMENT";
  resolutionType?: "REFUND" | "REPLACEMENT";
  replacementWaybillNumber?: string;
  replacementCourier?: string;
  status:
    | "REQUESTED"
    | "APPROVED_WAITING_SHIPMENT"
    | "IN_TRANSIT_TO_SELLER"
    | "RECEIVED_INSPECTING"
    | "REFUNDED"
    | "REPLACED"
    | "REJECTED";
  storeReturnAddress?: string;
  returnWaybillNumber?: string;
  returnCourier?: string;
  sellerRejectReason?: string;
  shippingFeeBearer?: "SELLER" | "BUYER";
  returnShippingCost?: number;
  qcStage?: "STAGE_1_INITIAL_REVIEW" | "STAGE_2_ACOUSTIC_PHYSICAL_QC" | "COMPLETED";
  qcStatus?: "PENDING" | "PASSED" | "FAILED";
  qcNotes?: string;
  qcAcousticReport?: {
    channelBalancePassed: boolean;
    frequencyResponsePassed: boolean;
    shellIntegrityPassed: boolean;
    inspectorName?: string;
    inspectedAt?: string;
  };
  refundAmount: number;
  createdAt: string;
  updatedAt: string;
}

export default function SellerReturnsPage() {
  const { language } = useLanguage();
  const { formatPrice } = useLocation();
  const isEn = language === "English";

  const [returns, setReturns] = useState<SellerReturnItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    | "ALL"
    | "REQUESTED"
    | "APPROVED_WAITING_SHIPMENT"
    | "IN_TRANSIT_TO_SELLER"
    | "RECEIVED_INSPECTING"
    | "REFUNDED"
    | "REJECTED"
  >("ALL");

  // Notification / Alert message
  const [bannerMessage, setBannerMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  const [approveModalItem, setApproveModalItem] = useState<SellerReturnItem | null>(null);
  const [storeReturnAddressInput, setStoreReturnAddressInput] = useState(
    "Tonal Zone Official Return Center, Ruko Kebayoran Square Blok A-12, Bintaro Jaya, Tangerang Selatan 15224 (Attn: Audio QC Lab)"
  );
  const [rejectModalItem, setRejectModalItem] = useState<SellerReturnItem | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState("");
  const [replacementModalItem, setReplacementModalItem] = useState<SellerReturnItem | null>(null);
  const [replacementCourierInput, setReplacementCourierInput] = useState("JNE Express");
  const [replacementWaybillInput, setReplacementWaybillInput] = useState("");
  const [viewingVideoUrl, setViewingVideoUrl] = useState<string | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Two-Step QC Lab Modal state
  const [qcModalItem, setQcModalItem] = useState<SellerReturnItem | null>(null);
  const [qcChannelBalance, setQcChannelBalance] = useState(true);
  const [qcFreqResponse, setQcFreqResponse] = useState(true);
  const [qcShellIntegrity, setQcShellIntegrity] = useState(true);
  const [qcInspectorName, setQcInspectorName] = useState("Lab Tech - Rizal");
  const [qcNotesInput, setQcNotesInput] = useState("");

  const fetchReturns = async () => {
    setIsLoading(true);
    try {
      let storeIdParam = "";
      let emailParam = "";
      if (typeof window !== "undefined") {
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
      }

      const query = new URLSearchParams();
      if (storeIdParam) query.set("storeId", storeIdParam);
      if (emailParam) query.set("email", emailParam);

      const res = await fetch(`/api/seller/returns${query.toString() ? `?${query.toString()}` : ""}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.returns)) {
          setReturns(data.returns);
          return;
        }
      }
      setReturns([]);
    } catch (err) {
      console.error("Failed to load seller returns:", err);
      setReturns([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const triggerBanner = (type: "success" | "error", text: string) => {
    setBannerMessage({ type, text });
    setTimeout(() => setBannerMessage(null), 4000);
  };

  // Execute Seller Actions
  const handleSellerAction = async (
    returnId: string,
    action: "APPROVE" | "REJECT" | "CONFIRM_RECEIPT" | "ISSUE_REFUND" | "ISSUE_REPLACEMENT",
    payload?: {
      storeReturnAddress?: string;
      reason?: string;
      replacementWaybillNumber?: string;
      replacementCourier?: string;
    }
  ) => {
    setIsProcessingAction(true);
    try {
      const res = await fetch(`/api/seller/returns/${returnId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal memproses aksi.");
      }

      // Close modals
      setApproveModalItem(null);
      setRejectModalItem(null);
      setRejectReasonInput("");
      setReplacementModalItem(null);
      setReplacementWaybillInput("");

      triggerBanner(
        "success",
        action === "APPROVE"
          ? "Pengajuan retur berhasil disetujui. Pembeli diminta mengirim unit."
          : action === "REJECT"
          ? "Pengajuan retur berhasil ditolak."
          : action === "CONFIRM_RECEIPT"
          ? "Paket retur telah dikonfirmasi diterima di toko."
          : action === "ISSUE_REPLACEMENT"
          ? "Tukar unit baru berhasil diproses. Resi unit pengganti dikirim ke pembeli."
          : "Pengembalian dana (refund) berhasil diselesaikan."
      );

      triggerAppNotification({
        type: "order",
        title: "Pembaruan Status Retur Toko",
        message: `Status pengajuan retur #${returnId} telah berhasil diperbarui (${action}).`,
        actionLink: "/seller/returns",
      });

      // Optimistically update returns list and switch to appropriate tab
      if (action === "APPROVE") {
        setReturns((prev) =>
          prev.map((r) =>
            r.id === returnId
              ? {
                  ...r,
                  status: "APPROVED_WAITING_SHIPMENT",
                  storeReturnAddress: payload?.storeReturnAddress || r.storeReturnAddress,
                  qcStage: "STAGE_2_ACOUSTIC_PHYSICAL_QC",
                  returnWaybillNumber: data.returnRequest?.returnWaybillNumber || r.returnWaybillNumber || "RTN-JNE-Auto",
                  returnCourier: data.returnRequest?.returnCourier || r.returnCourier || "JNE Express",
                  updatedAt: new Date().toISOString(),
                }
              : r
          )
        );
        setActiveTab("APPROVED_WAITING_SHIPMENT");
      } else if (action === "REJECT") {
        setReturns((prev) =>
          prev.map((r) =>
            r.id === returnId
              ? {
                  ...r,
                  status: "REJECTED",
                  sellerRejectReason: payload?.reason || r.sellerRejectReason,
                  updatedAt: new Date().toISOString(),
                }
              : r
          )
        );
        setActiveTab("REJECTED");
      } else if (action === "CONFIRM_RECEIPT") {
        setReturns((prev) =>
          prev.map((r) =>
            r.id === returnId
              ? {
                  ...r,
                  status: "RECEIVED_INSPECTING",
                  updatedAt: new Date().toISOString(),
                }
              : r
          )
        );
        setActiveTab("RECEIVED_INSPECTING");
      } else if (action === "ISSUE_REFUND") {
        setReturns((prev) =>
          prev.map((r) =>
            r.id === returnId
              ? {
                  ...r,
                  status: "REFUNDED",
                  qcStage: "COMPLETED",
                  updatedAt: new Date().toISOString(),
                }
              : r
          )
        );
        setActiveTab("REFUNDED");
      } else if (action === "ISSUE_REPLACEMENT") {
        setReturns((prev) =>
          prev.map((r) =>
            r.id === returnId
              ? {
                  ...r,
                  status: "REPLACED",
                  qcStage: "COMPLETED",
                  replacementWaybillNumber: payload?.replacementWaybillNumber,
                  replacementCourier: payload?.replacementCourier,
                  updatedAt: new Date().toISOString(),
                }
              : r
          )
        );
        setActiveTab("ALL");
      }

      // Reload list from server
      fetchReturns();
    } catch (err: any) {
      triggerBanner("error", err.message || "Gagal memproses aksi retur.");
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Submit Two-Step Inspection QC Result
  const handleSubmitQc = async (passed: boolean) => {
    if (!qcModalItem) return;
    setIsProcessingAction(true);
    try {
      const res = await fetch(`/api/seller/returns/${qcModalItem.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUBMIT_QC",
          passed,
          notes:
            qcNotesInput.trim() ||
            (passed
              ? "Lolos seluruh pengujian akustik & integritas fisik standar lab."
              : "Ditemukan anomali / kerusakan fisik akibat kelalaian pemakaian."),
          report: {
            channelBalancePassed: qcChannelBalance,
            frequencyResponsePassed: qcFreqResponse,
            shellIntegrityPassed: qcShellIntegrity,
            inspectorName: qcInspectorName,
            inspectedAt: new Date().toISOString(),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menyimpan hasil uji QC.");
      }

      setQcModalItem(null);
      setQcNotesInput("");
      triggerBanner(
        "success",
        passed
          ? "Pengujian QC Lab selesai: Unit diverifikasi LOLOS pengujian akustik."
          : "Pengujian QC Lab selesai: Unit diverifikasi GAGAL pengujian."
      );
      fetchReturns();
    } catch (err: any) {
      triggerBanner("error", err.message || "Gagal menyimpan hasil uji QC.");
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Filtered Returns
  const filteredReturns = useMemo(() => {
    return returns.filter((r) => {
      if (activeTab !== "ALL" && r.status !== activeTab) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = r.id.toLowerCase().includes(q) || r.orderId.toLowerCase().includes(q);
        const matchBuyer = r.buyerName.toLowerCase().includes(q) || r.buyerEmail.toLowerCase().includes(q);
        const matchProduct = r.productName.toLowerCase().includes(q);
        return matchId || matchBuyer || matchProduct;
      }
      return true;
    });
  }, [returns, activeTab, searchQuery]);

  // Status counts for tabs
  const countRequested = useMemo(
    () => returns.filter((r) => r.status === "REQUESTED").length,
    [returns]
  );
  const countWaitingShipment = useMemo(
    () => returns.filter((r) => r.status === "APPROVED_WAITING_SHIPMENT").length,
    [returns]
  );
  const countInTransit = useMemo(
    () => returns.filter((r) => r.status === "IN_TRANSIT_TO_SELLER").length,
    [returns]
  );
  const countInspecting = useMemo(
    () => returns.filter((r) => r.status === "RECEIVED_INSPECTING").length,
    [returns]
  );
  const countRefunded = useMemo(
    () => returns.filter((r) => r.status === "REFUNDED").length,
    [returns]
  );
  const countRejected = useMemo(
    () => returns.filter((r) => r.status === "REJECTED").length,
    [returns]
  );

  const getStatusBadge = (status: SellerReturnItem["status"]) => {
    switch (status) {
      case "REQUESTED":
        return {
          label: "Perlu Tanggapan",
          bg: "bg-white/10",
          text: "text-white",
          icon: <Clock className="w-3.5 h-3.5" />,
        };
      case "APPROVED_WAITING_SHIPMENT":
        return {
          label: "Menunggu Pengiriman Pembeli",
          bg: "bg-[#181818]",
          text: "text-[#D4D4D8]",
          icon: <Package className="w-3.5 h-3.5" />,
        };
      case "IN_TRANSIT_TO_SELLER":
        return {
          label: "Sedang Dikirim Pembeli",
          bg: "bg-[#202020]",
          text: "text-white",
          icon: <Truck className="w-3.5 h-3.5" />,
        };
      case "RECEIVED_INSPECTING":
        return {
          label: "Diterima Toko (Pemeriksaan)",
          bg: "bg-white/10",
          text: "text-white",
          icon: <ShieldCheck className="w-3.5 h-3.5" />,
        };
      case "REFUNDED":
        return {
          label: "Refund Selesai",
          bg: "bg-[#181818]",
          text: "text-[#A1A1AA]",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case "REPLACED":
        return {
          label: "Tukar Unit Selesai",
          bg: "bg-[#181818]",
          text: "text-[#A1A1AA]",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case "REJECTED":
        return {
          label: "Retur Ditolak",
          bg: "bg-[#181818]",
          text: "text-[#71717A]",
          icon: <XCircle className="w-3.5 h-3.5" />,
        };
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[#030303] text-[#FAF9F6] p-6 sm:p-8 space-y-6">
      {/* Top Banner Alert */}
      <AnimatePresence>
        {bannerMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-2xl text-xs font-sans flex items-center gap-3 bg-[#181818] text-white"
          >
            {bannerMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-[#A1A1AA]" />
            )}
            <span>{bannerMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
              Pusat Manajemen Operasional Toko
            </span>
            <span className="text-[#3F3F46]">/</span>
            <span className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider">
              Escrow Protection
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white font-heading">
            Retur & Komplain Pembeli
          </h1>
          <p className="text-xs text-[#8E8E93] font-sans mt-1">
            Tinjau pengajuan komplain akustik/fisik, setujui pengembalian unit, dan pantau status barang hingga refund escrow.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchReturns}
            className="px-4 py-2.5 rounded-full bg-[#111111] hover:bg-[#1A1A1A] text-xs font-mono text-[#A1A1AA] hover:text-white transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Metric Quick Cards (Rounded-2xl, Zero Border) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0A0A0A] space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] flex items-center justify-between">
            <span>Perlu Respon Segera</span>
            <Clock className="w-4 h-4 text-[#E6B800]" />
          </span>
          <p className="text-2xl font-mono font-bold text-white">{countRequested}</p>
          <span className="text-[10px] text-[#71717A]">Menunggu persetujuan atau penolakan toko</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0A0A0A] space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] flex items-center justify-between">
            <span>Dalam Pengiriman Balik</span>
            <Truck className="w-4 h-4 text-[#38BDF8]" />
          </span>
          <p className="text-2xl font-mono font-bold text-white">{countInTransit}</p>
          <span className="text-[10px] text-[#71717A]">Nomor resi telah didaftarkan oleh pembeli</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0A0A0A] space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] flex items-center justify-between">
            <span>Pemeriksaan Lab / QC</span>
            <ShieldCheck className="w-4 h-4 text-[#C084FC]" />
          </span>
          <p className="text-2xl font-mono font-bold text-white">{countInspecting}</p>
          <span className="text-[10px] text-[#71717A]">Barang sampai di toko, menunggu release refund</span>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-2">
        {/* Tab Pills (Rounded-full, Zero Border) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: "ALL", label: "Semua Retur", count: returns.length },
            { id: "REQUESTED", label: "Perlu Respon", count: countRequested },
            { id: "APPROVED_WAITING_SHIPMENT", label: "Menunggu Kirim", count: countWaitingShipment },
            { id: "IN_TRANSIT_TO_SELLER", label: "Dalam Pengiriman", count: countInTransit },
            { id: "RECEIVED_INSPECTING", label: "Pemeriksaan Toko", count: countInspecting },
            { id: "REFUNDED", label: "Refund Selesai", count: countRefunded },
            { id: "REJECTED", label: "Ditolak", count: countRejected },
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
                {tab.count !== undefined && tab.count > 0 && (
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

        {/* Search Bar */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID retur, pesanan, atau pembeli..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#0E0E0E] text-xs text-white placeholder:text-[#52525B] outline-none border-0 focus:ring-1 focus:ring-white/30"
          />
        </div>
      </div>

      {/* Returns List */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#333333] border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-[#71717A] tracking-wider uppercase">
            Memuat Daftar Retur Toko...
          </p>
        </div>
      ) : filteredReturns.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-[#0A0A0A] p-10 space-y-2">
          <Package className="w-10 h-10 text-[#52525B] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-white">Tidak Ada Pengajuan Retur</h3>
          <p className="text-xs text-[#71717A] max-w-sm mx-auto">
            {activeTab === "ALL"
              ? "Toko Anda belum memiliki pengajuan retur barang dari pembeli."
              : "Tidak ada pengajuan retur dengan status ini."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReturns.map((item) => {
            const badge = getStatusBadge(item.status);

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-[#0A0A0A] p-6 sm:p-7 space-y-5 transition-all hover:bg-[#0C0C0C]"
              >
                {/* Header: ID, Date, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-[#181818] text-xs font-mono font-bold text-white">
                      #{item.id}
                    </span>
                    <span className="text-xs font-mono text-[#71717A]">
                      Pesanan: <span className="text-[#D4D4D8]">#{item.orderId}</span>
                    </span>
                    <span className="text-[#3F3F46]">•</span>
                    <span className="text-xs font-mono text-[#71717A]">
                      {new Date(item.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-[#181818] text-[#D4D4D8]">
                      {item.requestedSolution === "REPLACEMENT" ? "Solusi: Tukar Unit" : "Solusi: Refund Dana"}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-[#141414] text-[#A1A1AA]">
                      {item.shippingFeeBearer === "BUYER" ? "Ongkir: Pembeli" : "Ongkir: Toko (Cashless)"}
                    </span>
                    {item.qcStatus === "PASSED" && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-white/10 text-white flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> QC Lolos
                      </span>
                    )}
                    <div
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                    </div>
                  </div>
                </div>

                {/* Product & Buyer Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Product Info (Col 5) */}
                  <div className="lg:col-span-5 flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl bg-[#141414] overflow-hidden shrink-0">
                      <Image
                        src={item.productImage || "/model-iem-untuk-hero.webp"}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white tracking-tight truncate">
                        {item.productName}
                      </h4>
                      <p className="text-xs font-mono text-[#8E8E93] mt-0.5">
                        Varian: {item.selectedVariant || "Standard"} • {item.quantity}x
                      </p>
                      <p className="text-xs font-mono font-bold text-white mt-1">
                        Dana Ditahan: {formatPrice(item.refundAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Buyer details (Col 3) */}
                  <div className="lg:col-span-3 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block">
                      Informasi Pembeli
                    </span>
                    <p className="text-xs font-semibold text-white">{item.buyerName}</p>
                    <p className="text-xs text-[#8E8E93] font-mono">{item.buyerEmail}</p>
                    {item.buyerPhone && (
                      <p className="text-xs text-[#71717A] font-mono">{item.buyerPhone}</p>
                    )}
                  </div>

                  {/* Shipment tracking if available (Col 4) */}
                  <div className="lg:col-span-4 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block">
                      Logistik Pengembalian
                    </span>
                    {item.returnWaybillNumber ? (
                      <div className="p-3 rounded-2xl bg-[#141414] space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white font-medium flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-[#38BDF8]" />
                            <span>{item.returnCourier || "Kurir Pengembalian"}</span>
                          </span>
                          <span className="font-mono text-[#38BDF8] font-bold">
                            {item.returnWaybillNumber}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#71717A]">
                          Paket dikirimkan pembeli menuju alamat retur toko Anda.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-[#71717A] italic">
                        {item.status === "REQUESTED"
                          ? "Menunggu persetujuan toko sebelum pembeli mengirimkan resi."
                          : "Pembeli belum mengirimkan resi ekspedisi."}
                      </p>
                    )}
                  </div>
                </div>

                {/* Complaint Reason & Evidence Box (Rounded-2xl, Zero Border) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#121212] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">
                      Alasan: <span className="text-white font-mono">{item.reason}</span>
                    </span>
                    {item.evidenceImages && item.evidenceImages.length > 0 && (
                      <span className="text-[11px] text-[#8E8E93] font-mono">
                        {item.evidenceImages.length} Bukti Foto
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#D4D4D8] font-sans leading-relaxed">
                    &ldquo;{item.description}&rdquo;
                  </p>

                  {item.sellerRejectReason && (
                    <div className="p-3 rounded-xl bg-[#1A1A1A] text-xs text-[#D4D4D8]">
                      <span className="font-semibold text-white">Catatan Penolakan: </span>
                      {item.sellerRejectReason}
                    </div>
                  )}

                  {/* Video Unboxing Evidence */}
                  {item.unboxingVideoUrl && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#161616]">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#222222] flex items-center justify-center text-white shrink-0">
                          <Video className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-white block truncate">
                            Video Unboxing Pembeli (Wajib SOP)
                          </span>
                          <span className="text-[10px] text-[#A1A1AA] font-mono">
                            ✓ Telah Divalidasi & Siap Diperiksa
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewingVideoUrl(item.unboxingVideoUrl || null)}
                        className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Tonton Video</span>
                      </button>
                    </div>
                  )}

                  {/* QC Lab Acoustic Report Display */}
                  {item.qcAcousticReport && (
                    <div className="p-3.5 rounded-xl bg-[#161616] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white flex items-center gap-1.5 font-mono">
                          <ShieldCheck className="w-3.5 h-3.5 text-white" />
                          <span>Hasil Uji QC Lab (Stage 2)</span>
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                            item.qcStatus === "PASSED"
                              ? "bg-white/10 text-white"
                              : "bg-[#261212] text-red-400"
                          }`}
                        >
                          {item.qcStatus === "PASSED" ? "✓ Lolos QC Audio" : "✗ Gagal QC"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                        <div
                          className={`p-1.5 rounded text-center ${
                            item.qcAcousticReport.channelBalancePassed
                              ? "bg-[#202020] text-white"
                              : "bg-[#281313] text-red-400"
                          }`}
                        >
                          {item.qcAcousticReport.channelBalancePassed ? "✓" : "✗"} Balance ±0.5dB
                        </div>
                        <div
                          className={`p-1.5 rounded text-center ${
                            item.qcAcousticReport.frequencyResponsePassed
                              ? "bg-[#202020] text-white"
                              : "bg-[#281313] text-red-400"
                          }`}
                        >
                          {item.qcAcousticReport.frequencyResponsePassed ? "✓" : "✗"} Freq Response
                        </div>
                        <div
                          className={`p-1.5 rounded text-center ${
                            item.qcAcousticReport.shellIntegrityPassed
                              ? "bg-[#202020] text-white"
                              : "bg-[#281313] text-red-400"
                          }`}
                        >
                          {item.qcAcousticReport.shellIntegrityPassed ? "✓" : "✗"} Shell & Pin
                        </div>
                      </div>
                      {item.qcNotes && (
                        <p className="text-[11px] text-[#A1A1AA] italic font-sans pt-0.5">
                          Catatan Teknisi: &ldquo;{item.qcNotes}&rdquo;
                        </p>
                      )}
                    </div>
                  )}

                  {/* Evidence Thumbnails */}
                  {item.evidenceImages && item.evidenceImages.length > 0 && (
                    <div className="flex items-center gap-3 pt-1">
                      {item.evidenceImages.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedEvidence(img)}
                          className="relative w-14 h-14 rounded-xl bg-[#181818] overflow-hidden group cursor-pointer"
                        >
                          <Image src={img} alt="Bukti retur" fill unoptimized className="object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-4 h-4" />
                          </div>
                        </button>
                      ))}
                      <span className="text-[11px] text-[#71717A] font-sans">
                        Klik gambar untuk melihat resolusi penuh
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/messages?seller=${encodeURIComponent(item.storeName)}&orderId=${encodeURIComponent(item.orderId)}`}
                      className="px-4 py-2 rounded-full bg-[#161616] hover:bg-[#202020] text-xs font-semibold text-white flex items-center gap-1.5 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat Pembeli</span>
                    </Link>

                    <Link
                      href={`/orders/return/${item.orderId}`}
                      target="_blank"
                      className="px-4 py-2 rounded-full bg-[#161616] hover:bg-[#202020] text-xs font-semibold text-[#A1A1AA] hover:text-white flex items-center gap-1.5 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Halaman Pembeli</span>
                    </Link>
                  </div>

                  {/* Status-Driven Operational Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {item.status === "REQUESTED" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setRejectModalItem(item)}
                          disabled={isProcessingAction}
                          className="px-5 py-2 rounded-full bg-[#181818] hover:bg-[#222222] text-[#A1A1AA] hover:text-white text-xs font-semibold transition-all cursor-pointer"
                        >
                          Tolak Retur
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setApproveModalItem(item);
                            setStoreReturnAddressInput(
                              item.storeReturnAddress ||
                                "Tonal Zone Official Return Center, Ruko Kebayoran Square Blok A-12, Bintaro Jaya, Tangerang Selatan 15224 (Attn: Audio QC Lab)"
                            );
                          }}
                          disabled={isProcessingAction}
                          className="px-6 py-2 rounded-full bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                        >
                          Setujui Retur
                        </button>
                      </>
                    )}

                    {item.status === "IN_TRANSIT_TO_SELLER" && (
                      <button
                        type="button"
                        onClick={() => handleSellerAction(item.id, "CONFIRM_RECEIPT")}
                        disabled={isProcessingAction}
                        className="px-6 py-2 rounded-full bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                      >
                        Konfirmasi Paket Tiba di Toko
                      </button>
                    )}

                    {item.status === "RECEIVED_INSPECTING" && (
                      <>
                        {/* Two-Step QC Lab Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setQcModalItem(item);
                            setQcChannelBalance(item.qcAcousticReport?.channelBalancePassed ?? true);
                            setQcFreqResponse(item.qcAcousticReport?.frequencyResponsePassed ?? true);
                            setQcShellIntegrity(item.qcAcousticReport?.shellIntegrityPassed ?? true);
                            setQcNotesInput(item.qcNotes || "");
                          }}
                          disabled={isProcessingAction}
                          className="px-4 py-2 rounded-full bg-[#181818] hover:bg-[#242424] text-white text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-white" />
                          <span>{item.qcStatus === "PASSED" ? "Ubah QC Lab" : "Input Uji QC Lab"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRejectModalItem(item)}
                          disabled={isProcessingAction}
                          className="px-5 py-2 rounded-full bg-[#181818] hover:bg-[#222222] text-[#A1A1AA] hover:text-white text-xs font-semibold transition-all cursor-pointer"
                        >
                          Tolak (Cacat Fisik Pengguna)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReplacementModalItem(item);
                            setReplacementCourierInput("JNE Express");
                            setReplacementWaybillInput(`REP-JNE-${Math.floor(1000000000 + Math.random() * 9000000000)}`);
                          }}
                          disabled={isProcessingAction}
                          className="px-5 py-2 rounded-full bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                        >
                          Kirim Unit Baru (Tukar)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSellerAction(item.id, "ISSUE_REFUND")}
                          disabled={isProcessingAction}
                          className="px-6 py-2 rounded-full bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                        >
                          Selesai & Refund Dana
                        </button>
                      </>
                    )}

                    {item.status === "APPROVED_WAITING_SHIPMENT" && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <span className="text-xs text-[#A1A1AA]">
                          Resi Drop-off: <span className="font-mono text-white font-semibold">{item.returnWaybillNumber || "Diterbitkan"}</span> ({item.returnCourier || "JNE Express"})
                        </span>
                        <span className="text-[11px] text-[#71717A] italic">
                          (Menunggu pembeli menyerahkan unit ke konter)
                        </span>
                      </div>
                    )}

                    {item.status === "REPLACED" && (
                      <span className="text-xs text-white font-medium py-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Unit pengganti dikirim • Resi: <strong className="font-mono text-white">{item.replacementWaybillNumber}</strong> ({item.replacementCourier})</span>
                      </span>
                    )}

                    {item.status === "REFUNDED" && (
                      <span className="text-xs text-[#D4D4D8] font-medium py-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Escrow telah mengembalikan dana penuh ke pembeli</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Approve Return */}
      <AnimatePresence>
        {approveModalItem && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl bg-[#0E0E0E] p-6 sm:p-8 space-y-5"
            >
              <div className="flex items-center gap-2 text-white text-xs font-mono uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Persetujuan Retur Produk</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Konfirmasi Alamat Pengiriman Balik
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Unit IEM akan dikirimkan oleh pembeli ke alamat ini. Pastikan alamat bengkel/toko sudah lengkap agar kurir tidak tersasar.
              </p>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717A] mb-2">
                  Alamat Tujuan Pengembalian Toko
                </label>
                <textarea
                  rows={3}
                  value={storeReturnAddressInput}
                  onChange={(e) => setStoreReturnAddressInput(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-[#181818] text-xs text-white placeholder:text-[#52525B] leading-relaxed outline-none border-0 focus:ring-1 focus:ring-white/30"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApproveModalItem(null)}
                  className="px-5 py-2.5 rounded-full bg-[#181818] hover:bg-[#222222] text-xs font-semibold text-[#A1A1AA] transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSellerAction(approveModalItem.id, "APPROVE", {
                      storeReturnAddress: storeReturnAddressInput,
                    })
                  }
                  disabled={isProcessingAction || !storeReturnAddressInput.trim()}
                  className="px-6 py-2.5 rounded-full bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {isProcessingAction ? "Memproses..." : "Setujui & Kirim Alamat"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Reject Return */}
      <AnimatePresence>
        {rejectModalItem && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl bg-[#0E0E0E] p-6 sm:p-8 space-y-5"
            >
              <div className="flex items-center gap-2 text-[#D4D4D8] text-xs font-mono uppercase tracking-wider">
                <XCircle className="w-4 h-4 text-[#A1A1AA]" />
                <span>Penolakan Retur</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Alasan Penolakan Pengajuan
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Tuliskan alasan penolakan secara jelas. Keterangan ini akan dikirimkan ke pembeli dan tim Escrow TonalZone.
              </p>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717A] mb-2">
                  Alasan Penolakan Toko *
                </label>
                <textarea
                  rows={3}
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                  placeholder="Contoh: Kerusakan disebabkan oleh kelalaian pemakaian (water damage / nozzle patah), bukan cacat produksi pabrik."
                  className="w-full p-4 rounded-2xl bg-[#181818] text-xs text-white placeholder:text-[#52525B] leading-relaxed outline-none border-0 focus:ring-1 focus:ring-white/30"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalItem(null)}
                  className="px-5 py-2.5 rounded-full bg-[#181818] hover:bg-[#222222] text-xs font-semibold text-[#A1A1AA] transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSellerAction(rejectModalItem.id, "REJECT", {
                      reason: rejectReasonInput,
                    })
                  }
                  disabled={isProcessingAction || !rejectReasonInput.trim()}
                  className="px-6 py-2.5 rounded-full bg-[#262626] hover:bg-[#333333] text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {isProcessingAction ? "Memproses..." : "Tolak Retur"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Replacement Unit Dispatch */}
      <AnimatePresence>
        {replacementModalItem && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl bg-[#0E0E0E] p-6 sm:p-8 space-y-5"
            >
              <div className="flex items-center gap-2 text-white text-xs font-mono uppercase tracking-wider">
                <Truck className="w-4 h-4 text-white" />
                <span>Solusi Tukar Unit Baru</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Kirim Unit Baru Pengganti
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Kirimkan 1 unit IEM baru bersegel ke pembeli. Masukkan kurir ekspedisi dan nomor resi pengiriman unit pengganti di bawah ini.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717A] mb-2">
                    Pilih Ekspedisi Pengiriman *
                  </label>
                  <select
                    value={replacementCourierInput}
                    onChange={(e) => setReplacementCourierInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#181818] text-xs text-white outline-none border-0 focus:ring-1 focus:ring-white/30 cursor-pointer"
                  >
                    {[
                      "JNE Express",
                      "SiCepat Ekspres",
                      "J&T Express",
                      "AnterAja",
                      "Ninja Xpress",
                      "Lion Parcel",
                    ].map((c) => (
                      <option key={c} value={c} className="bg-[#181818] text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717A] mb-2">
                    Nomor Resi Unit Baru *
                  </label>
                  <input
                    type="text"
                    value={replacementWaybillInput}
                    onChange={(e) => setReplacementWaybillInput(e.target.value)}
                    placeholder="Contoh: REP-JNE-8192083102"
                    className="w-full px-4 py-3 rounded-2xl bg-[#181818] text-xs font-mono uppercase text-white placeholder:text-[#52525B] outline-none border-0 focus:ring-1 focus:ring-white/30"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReplacementModalItem(null)}
                  className="px-5 py-2.5 rounded-full bg-[#181818] hover:bg-[#222222] text-xs font-semibold text-[#A1A1AA] transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSellerAction(replacementModalItem.id, "ISSUE_REPLACEMENT", {
                      replacementWaybillNumber: replacementWaybillInput,
                      replacementCourier: replacementCourierInput,
                    })
                  }
                  disabled={isProcessingAction || !replacementWaybillInput.trim()}
                  className="px-6 py-2.5 rounded-full bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isProcessingAction ? "Memproses..." : "Kirim Resi Unit Pengganti"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Watch Unboxing Video */}
      <AnimatePresence>
        {viewingVideoUrl && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl rounded-2xl bg-[#0E0E0E] p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2 text-white">
                  <Video className="w-4 h-4 text-white" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Video Bukti Unboxing Pembeli
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingVideoUrl(null)}
                  className="px-3 py-1 rounded-full bg-[#1C1C1C] hover:bg-[#282828] text-xs text-white cursor-pointer"
                >
                  Tutup
                </button>
              </div>

              {viewingVideoUrl.startsWith("http") &&
              (viewingVideoUrl.includes("drive.google.com") ||
                viewingVideoUrl.includes("youtu")) ? (
                <div className="p-6 rounded-2xl bg-[#141414] text-center space-y-3">
                  <p className="text-xs text-[#A1A1AA]">
                    Video tersimpan pada tautan penyimpanan cloud pembeli:
                  </p>
                  <p className="text-xs font-mono text-white break-all bg-[#0A0A0A] p-3 rounded-xl">
                    {viewingVideoUrl}
                  </p>
                  <a
                    href={viewingVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Tautan Video di Tab Baru</span>
                  </a>
                </div>
              ) : (
                <video
                  controls
                  autoPlay
                  src={viewingVideoUrl}
                  className="w-full max-h-[60vh] rounded-2xl bg-black object-contain border-0"
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Two-Step Inspection (QC Lab) */}
      <AnimatePresence>
        {qcModalItem && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl rounded-2xl bg-[#0E0E0E] p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center gap-2 text-white text-xs font-mono uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>Pemeriksaan Lab Toko (Two-Step QC Stage 2)</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading">
                  Input Hasil Uji Akustik & Fisik IEM
                </h3>
                <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
                  Lakukan pengujian teknis pada unit #{qcModalItem.id} ({qcModalItem.productName}) sebelum mengembalikan dana atau mengirim unit pengganti.
                </p>
              </div>

              {/* QC Checklists */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#141414]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block">
                  Daftar Uji Verifikasi Akustik & Fisik
                </span>

                <label className="flex items-start gap-3 p-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#202020] cursor-pointer transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={qcChannelBalance}
                    onChange={(e) => setQcChannelBalance(e.target.checked)}
                    className="mt-1 rounded accent-white text-white focus:ring-white/30 bg-[#111111] border-0"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      1. Uji Channel Balance (L & R Matching)
                    </span>
                    <span className="text-[11px] text-[#A1A1AA]">
                      Kedua housing memiliki desibel output seimbang (toleransi maksimal ±0.5 dB SPL).
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#202020] cursor-pointer transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={qcFreqResponse}
                    onChange={(e) => setQcFreqResponse(e.target.checked)}
                    className="mt-1 rounded accent-white text-white focus:ring-white/30 bg-[#111111] border-0"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      2. Uji Respon Frekuensi & Distorsi Driver (THD)
                    </span>
                    <span className="text-[11px] text-[#A1A1AA]">
                      Driver berfungsi normal tanpa dengung, buzzing, rattling, atau distorsi harmonik.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-2.5 rounded-xl bg-[#1A1A1A] hover:bg-[#202020] cursor-pointer transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={qcShellIntegrity}
                    onChange={(e) => setQcShellIntegrity(e.target.checked)}
                    className="mt-1 rounded accent-white text-white focus:ring-white/30 bg-[#111111] border-0"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      3. Integritas Housing Shell, Nozzle & Pin Konektor
                    </span>
                    <span className="text-[11px] text-[#A1A1AA]">
                      Tidak ada bekas jatuh/benturan berat, nozzle bersih, dan soket 2-pin/MMCX tidak aus.
                    </span>
                  </div>
                </label>
              </div>

              {/* Inspector info & notes */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717A] mb-2">
                    Nama Teknisi / Audio Tester
                  </label>
                  <input
                    type="text"
                    value={qcInspectorName}
                    onChange={(e) => setQcInspectorName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#181818] text-xs text-white outline-none border-0 focus:ring-1 focus:ring-white/30"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717A] mb-2">
                    Catatan Diagnostik Teknisi
                  </label>
                  <textarea
                    rows={3}
                    value={qcNotesInput}
                    onChange={(e) => setQcNotesInput(e.target.value)}
                    placeholder="Contoh: Terkonfirmasi channel balance normal. Unit bersih dan lolos kriteria garansi retur toko."
                    className="w-full p-4 rounded-2xl bg-[#181818] text-xs text-white placeholder:text-[#52525B] leading-relaxed outline-none border-0 focus:ring-1 focus:ring-white/30"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setQcModalItem(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#181818] hover:bg-[#222222] text-xs font-semibold text-[#A1A1AA] transition-all cursor-pointer text-center"
                >
                  Batal
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => handleSubmitQc(false)}
                    disabled={isProcessingAction}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-full bg-[#262626] hover:bg-[#333333] text-[#A1A1AA] hover:text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Gagal QC
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmitQc(true)}
                    disabled={isProcessingAction}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-full bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {isProcessingAction ? "Menyimpan..." : "Lolos QC Audio"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Fullscreen Evidence Photo Preview */}
      <AnimatePresence>
        {selectedEvidence && (
          <div
            onClick={() => setSelectedEvidence(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-2xl w-full aspect-square rounded-3xl overflow-hidden bg-black"
            >
              <Image
                src={selectedEvidence}
                alt="Foto Bukti Retur"
                fill
                unoptimized
                className="object-contain"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
