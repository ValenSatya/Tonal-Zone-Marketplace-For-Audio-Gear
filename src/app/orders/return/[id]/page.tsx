"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  MessageSquare,
  UploadCloud,
  HelpCircle,
  CornerDownRight,
  ExternalLink,
  Camera,
  X,
  Copy,
  Check,
  MapPin,
  Info,
  ChevronDown,
  ChevronUp,
  Video,
  PackageCheck,
  Play,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation } from "@/context/LocationContext";
import { triggerAppNotification } from "@/context/NotificationContext";

interface ReturnData {
  id: string;
  orderId: string;
  buyerName: string;
  buyerEmail: string;
  storeName: string;
  storeId: string;
  productName: string;
  productImage: string;
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

const COMMON_REASONS = [
  { reason: "Cacat Suara / Driver Imbalance", bearer: "SELLER" as const, desc: "Volume beda sebelah / distorsi suara" },
  { reason: "Kerusakan Fisik / Shell Retak", bearer: "SELLER" as const, desc: "Housing retak / nozzle cacat pabrik" },
  { reason: "Kabel / Konektor Pin Rusak", bearer: "SELLER" as const, desc: "Pin 2-pin/MMCX longgar atau putus" },
  { reason: "Aksesoris / Eartips Tidak Lengkap", bearer: "SELLER" as const, desc: "Isi boks bawaan tidak lengkap" },
  { reason: "Barang Berbeda dari Deskripsi", bearer: "SELLER" as const, desc: "Tipe produk atau tuning tidak sesuai" },
  { reason: "Mati Total / Tidak Keluar Suara", bearer: "SELLER" as const, desc: "Unit tidak bersuara sama sekali" },
  { reason: "Berubah Pikiran / Salah Pilih Varian", bearer: "BUYER" as const, desc: "Ingin ganti model atau salah colokan (3.5mm vs 4.4mm)" },
];

const COURIER_OPTIONS = [
  "JNE Express",
  "SiCepat Ekspres",
  "J&T Express",
  "AnterAja",
  "Ninja Xpress",
  "Lion Parcel",
];

export default function OrderReturnPage() {
  const params = useParams();
  const router = useRouter();
  const { formatPrice } = useLocation();
  const rawId = (params?.id as string) || "";

  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [returnReq, setReturnReq] = useState<ReturnData | null>(null);

  // Form State for creating return
  const [selectedReason, setSelectedReason] = useState(COMMON_REASONS[0].reason);
  const [requestedSolution, setRequestedSolution] = useState<"REFUND" | "REPLACEMENT">("REFUND");
  const [description, setDescription] = useState("");
  const [evidenceImages, setEvidenceImages] = useState<string[]>([]);
  const [unboxingMethod, setUnboxingMethod] = useState<"upload" | "link">("upload");
  const [unboxingVideoUrl, setUnboxingVideoUrl] = useState("");
  const [unboxingVideoFileName, setUnboxingVideoFileName] = useState("");
  const [unboxingConfirmed, setUnboxingConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);

  // Cashless Drop-off & Shipment submission state
  const [copiedResi, setCopiedResi] = useState(false);
  const [showManualCourier, setShowManualCourier] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(COURIER_OPTIONS[0]);
  const [returnWaybillInput, setReturnWaybillInput] = useState("");
  const [isSubmittingWaybill, setIsSubmittingWaybill] = useState(false);

  // Fetch Order and Return status
  const loadData = async () => {
    if (!rawId) return;
    setIsLoading(true);
    setErrorMessage("");

    try {
      // 1. Check existing return request for this orderId or returnId
      const retRes = await fetch(`/api/returns/${encodeURIComponent(rawId)}`);
      if (retRes.ok) {
        const retData = await retRes.json();
        if (retData.success && retData.returnRequest) {
          setReturnReq(retData.returnRequest);
        }
      }

      // 2. Fetch order details
      const ordRes = await fetch(`/api/orders/${encodeURIComponent(rawId)}`);
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        if (ordData.success && ordData.order) {
          setOrder(ordData.order);
        }
      }
    } catch (err: any) {
      console.error("Error loading return details:", err);
      setErrorMessage("Gagal memuat informasi retur.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [rawId]);

  // Evidence photo selection
  const handleEvidencePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - evidenceImages.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    filesToAdd.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Ukuran file maksimal 5MB per foto.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEvidenceImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeEvidencePhoto = (index: number) => {
    setEvidenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 60 * 1024 * 1024) {
      setErrorMessage("Ukuran file video maksimal 60MB. Gunakan opsi Tautan Cloud untuk file lebih besar.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUnboxingVideoUrl(event.target.result as string);
        setUnboxingVideoFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  // Copy Waybill
  const handleCopyWaybill = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedResi(true);
    setTimeout(() => setCopiedResi(false), 2000);
  };

  // Confirm Cashless Drop-off at counter
  const handleConfirmDropoff = async (waybill: string, courier: string) => {
    if (!returnReq) return;
    setIsSubmittingWaybill(true);
    setErrorMessage("");

    try {
      const res = await fetch(`/api/returns/${returnReq.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnWaybillNumber: waybill,
          returnCourier: courier,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal memperbarui status pengiriman retur.");
      }

      setReturnReq(data.returnRequest);
      setSuccessMessage("Paket retur berhasil dikonfirmasi telah diserahkan!");
      triggerAppNotification({
        type: "order",
        title: "Paket Retur Diserahkan ke Ekspedisi",
        message: `Paket retur dengan resi ${waybill} (${courier}) telah diserahkan dan sedang menuju ke toko ${returnReq.storeName}.`,
        actionLink: `/orders/return/${returnReq.orderId}`,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal mengonfirmasi penyerahan paket.");
    } finally {
      setIsSubmittingWaybill(false);
    }
  };

  // Handle Form Submission
  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    if (!description.trim()) {
      setErrorMessage("Mohon berikan deskripsi kendala produk yang jelas.");
      return;
    }

    if (!unboxingVideoUrl.trim()) {
      setErrorMessage("Wajib menyertakan video unboxing (unggah file atau masukkan tautan cloud) sesuai SOP retur audio.");
      return;
    }

    if (!unboxingConfirmed) {
      setErrorMessage("Mohon centang pernyataan bahwa video unboxing diambil utuh tanpa jeda / edit.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        orderId: order.id,
        buyerEmail: order.buyerEmail,
        buyerName: order.buyerName,
        buyerPhone: order.buyerPhone,
        reason: selectedReason,
        description: description.trim(),
        evidenceImages:
          evidenceImages.length > 0
            ? evidenceImages
            : [order.items?.[0]?.image || "/model-iem-untuk-hero.webp"],
        unboxingVideoUrl: unboxingVideoUrl.trim(),
        unboxingVideoType: unboxingMethod,
        requestedSolution,
        shippingFeeBearer:
          COMMON_REASONS.find((r) => r.reason === selectedReason)?.bearer || "SELLER",
      };

      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengajukan retur.");
      }

      setReturnReq(data.returnRequest);
      setSuccessMessage("Pengajuan retur berhasil dikirim!");
      triggerAppNotification({
        type: "order",
        title: "Pengajuan Retur Berhasil Dikirim",
        message: `Pengajuan retur pesanan #${order.id} telah diteruskan ke toko ${order.storeName}. Dana escrow ditahan aman.`,
        actionLink: `/orders/return/${order.id}`,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan sistem saat mengirim retur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Return Waybill submission
  const handleSubmitReturnWaybill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnReq) return;
    if (!returnWaybillInput.trim()) {
      setErrorMessage("Mohon masukkan nomor resi pengembalian.");
      return;
    }

    setIsSubmittingWaybill(true);
    setErrorMessage("");

    try {
      const res = await fetch(`/api/returns/${returnReq.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnWaybillNumber: returnWaybillInput.trim(),
          returnCourier: selectedCourier,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal memperbarui nomor resi retur.");
      }

      setReturnReq(data.returnRequest);
      setSuccessMessage("Resi pengiriman retur berhasil disimpan!");
      triggerAppNotification({
        type: "order",
        title: "Resi Pengembalian Dikirim",
        message: `Resi ${returnWaybillInput.trim().toUpperCase()} (${selectedCourier}) telah diteruskan ke penjual.`,
        actionLink: `/orders/return/${returnReq.orderId}`,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menyimpan nomor resi.");
    } finally {
      setIsSubmittingWaybill(false);
    }
  };

  const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false);
  const handleConfirmReplacementDelivery = async () => {
    const targetOrderId = order?.id || returnReq?.orderId;
    if (!targetOrderId) return;
    setIsConfirmingDelivery(true);
    setErrorMessage("");
    try {
      const res = await fetch(`/api/orders/${targetOrderId}/accept`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal konfirmasi penerimaan unit pengganti.");
      }
      setSuccessMessage("Unit pengganti berhasil dikonfirmasi diterima! Transaksi tuntas.");
      if (returnReq) {
        setReturnReq({ ...returnReq, status: "COMPLETED" as any });
      }
      triggerAppNotification({
        type: "order",
        title: "Tukar Unit Selesai",
        message: `Penerimaan unit pengganti pesanan #${targetOrderId} telah dikonfirmasi. Pesanan tuntas.`,
        actionLink: `/orders?tab=COMPLETED`,
      });
      loadData();
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal konfirmasi penerimaan.");
    } finally {
      setIsConfirmingDelivery(false);
    }
  };

  const getStatusBadge = (status: ReturnData["status"] | "COMPLETED") => {
    switch (status) {
      case "REQUESTED":
        return {
          label: "Menunggu Persetujuan Penjual",
          bg: "bg-[#181818]",
          text: "text-white",
          icon: <Clock className="w-3.5 h-3.5" />,
        };
      case "APPROVED_WAITING_SHIPMENT":
        return {
          label: "Retur Disetujui • Mohon Kirimkan Barang",
          bg: "bg-[#181818]",
          text: "text-white",
          icon: <Truck className="w-3.5 h-3.5" />,
        };
      case "IN_TRANSIT_TO_SELLER":
        return {
          label: "Dalam Pengiriman ke Toko",
          bg: "bg-[#181818]",
          text: "text-white",
          icon: <Package className="w-3.5 h-3.5" />,
        };
      case "RECEIVED_INSPECTING":
        return {
          label: "Diterima Toko • Pengecekan Akustik & Fisik",
          bg: "bg-[#181818]",
          text: "text-white",
          icon: <ShieldCheck className="w-3.5 h-3.5" />,
        };
      case "REFUNDED":
        return {
          label: "Retur Selesai • Dana Berhasil Dikembalikan",
          bg: "bg-[#181818]",
          text: "text-white",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case "REPLACED":
        return {
          label: "Unit Pengganti Baru Sedang Dikirim",
          bg: "bg-[#181818]",
          text: "text-white",
          icon: <PackageCheck className="w-3.5 h-3.5" />,
        };
      case "COMPLETED" as any:
        return {
          label: "Tukar Unit Selesai • Pesanan Tuntas",
          bg: "bg-[#181818]",
          text: "text-white",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case "REJECTED":
        return {
          label: "Pengajuan Retur Ditolak",
          bg: "bg-[#1C0E0E]",
          text: "text-red-400",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
        };
      default:
        return {
          label: "Dalam Proses",
          bg: "bg-[#181818]",
          text: "text-white",
          icon: <Clock className="w-3.5 h-3.5" />,
        };
    }
  };

  const currentItem = order?.items?.[0] || {
    productName: returnReq?.productName || "Audiophile In-Ear Monitor",
    image: returnReq?.productImage || "/model-iem-untuk-hero.webp",
    price: returnReq?.productPrice || returnReq?.refundAmount || 0,
    selectedVariant: returnReq?.selectedVariant || "Default",
    quantity: returnReq?.quantity || 1,
  };

  const stepsList = [
    {
      key: "REQUESTED",
      title: "Pengajuan Dikirim",
      desc: "Komplain & detail kendala diterima sistem",
    },
    {
      key: "APPROVED_WAITING_SHIPMENT",
      title: "Persetujuan Toko",
      desc: "Penjual memberikan alamat pengembalian",
    },
    {
      key: "IN_TRANSIT_TO_SELLER",
      title: "Kirim Unit IEM",
      desc: "Paket dikirim dengan nomor resi terverifikasi",
    },
    {
      key: "RECEIVED_INSPECTING",
      title: "Inspeksi Teknis",
      desc: "QC Toko menguji fungsi akustik driver",
    },
    {
      key: "COMPLETED",
      title: returnReq?.status === "REPLACED" || returnReq?.requestedSolution === "REPLACEMENT" ? "Tukar Unit Baru" : "Refund Selesai",
      desc: returnReq?.status === "REPLACED" ? "Unit baru tersegel telah dikirim oleh toko" : "Escrow mencairkan pengembalian dana penuh",
    },
  ];

  const getStepIndex = (status: ReturnData["status"]) => {
    switch (status) {
      case "REQUESTED":
        return 0;
      case "APPROVED_WAITING_SHIPMENT":
        return 1;
      case "IN_TRANSIT_TO_SELLER":
        return 2;
      case "RECEIVED_INSPECTING":
        return 3;
      case "REFUNDED":
      case "REPLACED":
        return 4;
      case "REJECTED":
        return 0;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-[#FAF9F6] font-sans selection:bg-white selection:text-black flex flex-col">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 max-w-5xl mx-auto px-5 sm:px-8 w-full">
        {/* Navigation / Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#A1A1AA] hover:text-[#FAF9F6] transition-colors py-2 px-3 rounded-full bg-[#111111] hover:bg-[#1A1A1A]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Pesanan Saya</span>
          </Link>

          <span className="text-[11px] font-mono text-[#71717A] uppercase tracking-widest hidden sm:inline">
            TonalZone Escrow Protection
          </span>
        </div>

        {/* Banner Alert if messages exist */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 p-4 rounded-2xl bg-[#261212] text-[#FCA5A5] text-xs font-sans flex items-center gap-3"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-[#F87171]" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 p-4 rounded-2xl bg-[#181818] text-[#D4D4D8] text-xs font-sans flex items-center gap-3"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-2 border-[#333333] border-t-white rounded-full animate-spin" />
            <p className="text-xs font-mono text-[#71717A] tracking-wider uppercase">
              Memuat Data Retur & Escrow...
            </p>
          </div>
        ) : !order && !returnReq ? (
          <div className="py-20 text-center rounded-2xl bg-[#0A0A0A] p-10">
            <AlertCircle className="w-10 h-10 text-[#71717A] mx-auto mb-3" />
            <h2 className="text-lg font-bold text-white mb-1">Pesanan Tidak Ditemukan</h2>
            <p className="text-xs text-[#888888] max-w-sm mx-auto mb-6">
              ID pesanan atau tiket retur #{rawId} tidak tersedia dalam database kami.
            </p>
            <Link
              href="/orders"
              className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider inline-block hover:bg-[#E4E4E7] transition-all"
            >
              Lihat Semua Pesanan
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="rounded-2xl bg-[#0A0A0A] p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
                      Pusat Resolusi Retur & Pengembalian Dana
                    </span>
                    <span className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider">
                      • Garansi 100% Escrow
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white font-heading">
                    {returnReq ? "Status & Pantauan Retur" : "Pengajuan Retur Barang"}
                  </h1>
                  <p className="text-xs text-[#8E8E93] font-sans mt-1">
                    Pesanan #{order?.id || returnReq?.orderId} • Toko:{" "}
                    <span className="text-white font-medium">
                      {order?.storeName || returnReq?.storeName}
                    </span>
                  </p>
                </div>

                {returnReq && (
                  <div>
                    {(() => {
                      const b = getStatusBadge(returnReq.status);
                      return (
                        <div
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium ${b.bg} ${b.text}`}
                        >
                          {b.icon}
                          <span>{b.label}</span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Product Summary Card (Zero Border, Rounded-2xl) */}
            <div className="rounded-2xl bg-[#0C0C0C] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#141414] overflow-hidden shrink-0">
                  <Image
                    src={currentItem.image || "/model-iem-untuk-hero.webp"}
                    alt={currentItem.productName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block">
                    {order?.items?.[0]?.brand || "IEM Category"}
                  </span>
                  <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight truncate">
                    {currentItem.productName}
                  </h2>
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="text-[#A1A1AA] font-mono">
                      Varian: {currentItem.selectedVariant || "Standard"}
                    </span>
                    <span className="text-[#3F3F46]">•</span>
                    <span className="text-[#A1A1AA] font-mono">
                      Jumlah: {currentItem.quantity || 1} unit
                    </span>
                  </div>
                </div>
              </div>

              <div className="sm:text-right shrink-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block">
                  Nilai Dana Escrow
                </span>
                <span className="text-xl sm:text-2xl font-mono font-bold text-white block mt-0.5">
                  {formatPrice(order?.totalAmount || returnReq?.refundAmount || currentItem.price)}
                </span>
                <span className="text-[11px] text-[#4ADE80] font-sans flex items-center gap-1 sm:justify-end mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Dijamin Kembali Penuh</span>
                </span>
              </div>
            </div>

            {/* If return request is active: Show Stepper & Tracking Details */}
            {returnReq ? (
              <div className="space-y-6">
                {/* 5-Step Stepper (Rounded-2xl, Zero Border) */}
                <div className="rounded-2xl bg-[#0B0B0B] p-6 sm:p-8">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-[#71717A] mb-6">
                    Tahapan Mediasi & Pengembalian Dana
                  </h3>

                  <div className="relative">
                    {/* Mobile Stepper Vertical, Desktop Horizontal */}
                    <div className="hidden md:grid grid-cols-5 gap-3 relative">
                      {/* Line connector */}
                      <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#1C1C1C] -z-0" />
                      {stepsList.map((step, idx) => {
                        const currentIdx = getStepIndex(returnReq.status);
                        const isPast = idx < currentIdx;
                        const isCurrent = idx === currentIdx;
                        const isRejected = returnReq.status === "REJECTED";

                        return (
                          <div key={step.key} className="relative z-10 flex flex-col items-center text-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-colors ${
                                isRejected && idx === 0
                                  ? "bg-red-500 text-white"
                                  : isCurrent
                                  ? "bg-white text-black shadow-md"
                                  : isPast
                                  ? "bg-white text-black"
                                  : "bg-[#181818] text-[#71717A]"
                              }`}
                            >
                              {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span
                              className={`text-xs font-sans mt-3 font-semibold ${
                                isCurrent ? "text-white" : isPast ? "text-[#D4D4D8]" : "text-[#52525B]"
                              }`}
                            >
                              {step.title}
                            </span>
                            <span className="text-[10px] text-[#71717A] mt-1 line-clamp-2 max-w-[130px]">
                              {step.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Mobile Stepper List */}
                    <div className="md:hidden space-y-4">
                      {stepsList.map((step, idx) => {
                        const currentIdx = getStepIndex(returnReq.status);
                        const isPast = idx < currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div key={step.key} className="flex items-start gap-3.5">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                                isCurrent
                                  ? "bg-white text-black shadow-sm"
                                  : isPast
                                  ? "bg-white text-black"
                                  : "bg-[#1A1A1A] text-[#71717A]"
                              }`}
                            >
                              {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                            </div>
                            <div>
                              <span
                                className={`text-xs font-semibold block ${
                                  isCurrent ? "text-white" : isPast ? "text-[#D4D4D8]" : "text-[#71717A]"
                                }`}
                              >
                                {step.title}
                              </span>
                              <span className="text-[11px] text-[#71717A]">{step.desc}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Status-specific action boxes */}
                {returnReq.status === "REQUESTED" && (
                  <div className="rounded-2xl bg-[#121210] p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#211E10] text-[#E6B800] flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          Pengajuan Sedang Ditinjau Penjual
                        </h4>
                        <p className="text-xs text-[#A1A1AA] mt-1 max-w-xl leading-relaxed">
                          Penjual telah menerima notifikasi permohonan retur Anda. Dana transaksi sebesar{" "}
                          <span className="text-white font-mono font-medium">
                            {formatPrice(returnReq.refundAmount)}
                          </span>{" "}
                          tetap aman berada di Escrow TonalZone dan tidak akan dicairkan ke penjual selama proses retur berlangsung.
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/messages?seller=${encodeURIComponent(returnReq.storeName)}&orderId=${encodeURIComponent(returnReq.orderId)}`}
                      className="px-5 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#242424] text-white text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 shrink-0"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat Penjual</span>
                    </Link>
                  </div>
                )}

                {returnReq.status === "APPROVED_WAITING_SHIPMENT" && (() => {
                  const activeWaybill =
                    returnReq.returnWaybillNumber ||
                    `RTN-JNE-${(returnReq.orderId || "10293").replace(/\D/g, "").slice(-6) || "849201"}`;
                  const activeCourier = returnReq.returnCourier || "JNE Express";

                  return (
                    <div className="space-y-5">
                      {/* Drop-off Return Pass Card */}
                      <div className="rounded-2xl bg-[#0E0E0E] p-6 sm:p-8 space-y-6">
                        <div className="flex flex-wrap items-start sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#2e2e2e] text-white text-[11px] font-bold uppercase tracking-wider">
                                {returnReq.shippingFeeBearer === "BUYER" ? "Tiket Drop-Off Ekspedisi" : "Tiket Drop-Off Bebas Ongkir"}
                              </span>
                              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#181818] text-[#A1A1AA] text-[11px] font-mono font-medium">
                                {returnReq.shippingFeeBearer === "BUYER" ? "Biaya Mandiri" : "Cashless Toko"}
                              </span>
                            </div>
                            <h4 className="text-base font-semibold text-white font-heading">
                              Tiket Pengembalian Unit IEM
                            </h4>
                            <p className="text-xs text-[#8E8E93]">
                              {returnReq.shippingFeeBearer === "BUYER"
                                ? "Datangi agen ekspedisi dan tunjukkan tiket ini ke petugas loket untuk mengirimkan unit ke alamat toko."
                                : "Cukup datangi agen ekspedisi dan tunjukkan tiket ini ke petugas loket. Ongkos kirim Rp 0 (ditanggung garansi toko)."}
                            </p>
                          </div>

                          <div className="px-4 py-2 rounded-2xl bg-[#141414] text-right">
                            <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block">
                              Ekspedisi Rekanan
                            </span>
                            <span className="text-xs font-semibold text-white font-mono">
                              {activeCourier}
                            </span>
                          </div>
                        </div>

                        {/* Booking Code / Resi Banner */}
                        <div className="rounded-2xl bg-[#141414] p-5 sm:p-6 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A] block">
                                Nomor Resi / Booking Code Retur
                              </span>
                              <div className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wider pt-1">
                                {activeWaybill}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCopyWaybill(activeWaybill)}
                              className="px-4 py-2.5 rounded-full bg-[#1E1E1E] hover:bg-[#282828] text-xs font-mono font-semibold text-white flex items-center justify-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
                            >
                              {copiedResi ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-white" />
                                  <span className="text-white">Tersalin</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Salin Resi</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Scannable Barcode SVG for Counter Officer */}
                          <div className="bg-white rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center gap-1.5 shadow-inner">
                            <svg
                              className="w-full max-w-sm h-14"
                              viewBox="0 0 280 50"
                              fill="currentColor"
                              aria-label="Barcode Pengembalian"
                            >
                              <rect x="0" y="0" width="3" height="50" fill="#000" />
                              <rect x="5" y="0" width="1" height="50" fill="#000" />
                              <rect x="8" y="0" width="4" height="50" fill="#000" />
                              <rect x="15" y="0" width="2" height="50" fill="#000" />
                              <rect x="20" y="0" width="1" height="50" fill="#000" />
                              <rect x="23" y="0" width="5" height="50" fill="#000" />
                              <rect x="31" y="0" width="2" height="50" fill="#000" />
                              <rect x="36" y="0" width="3" height="50" fill="#000" />
                              <rect x="42" y="0" width="2" height="50" fill="#000" />
                              <rect x="47" y="0" width="4" height="50" fill="#000" />
                              <rect x="54" y="0" width="1" height="50" fill="#000" />
                              <rect x="58" y="0" width="3" height="50" fill="#000" />
                              <rect x="64" y="0" width="5" height="50" fill="#000" />
                              <rect x="72" y="0" width="2" height="50" fill="#000" />
                              <rect x="77" y="0" width="1" height="50" fill="#000" />
                              <rect x="81" y="0" width="4" height="50" fill="#000" />
                              <rect x="88" y="0" width="2" height="50" fill="#000" />
                              <rect x="93" y="0" width="3" height="50" fill="#000" />
                              <rect x="99" y="0" width="1" height="50" fill="#000" />
                              <rect x="103" y="0" width="4" height="50" fill="#000" />
                              <rect x="110" y="0" width="2" height="50" fill="#000" />
                              <rect x="115" y="0" width="5" height="50" fill="#000" />
                              <rect x="123" y="0" width="1" height="50" fill="#000" />
                              <rect x="127" y="0" width="3" height="50" fill="#000" />
                              <rect x="133" y="0" width="4" height="50" fill="#000" />
                              <rect x="140" y="0" width="2" height="50" fill="#000" />
                              <rect x="145" y="0" width="1" height="50" fill="#000" />
                              <rect x="149" y="0" width="5" height="50" fill="#000" />
                              <rect x="157" y="0" width="2" height="50" fill="#000" />
                              <rect x="162" y="0" width="3" height="50" fill="#000" />
                              <rect x="168" y="0" width="1" height="50" fill="#000" />
                              <rect x="172" y="0" width="4" height="50" fill="#000" />
                              <rect x="179" y="0" width="2" height="50" fill="#000" />
                              <rect x="184" y="0" width="5" height="50" fill="#000" />
                              <rect x="192" y="0" width="1" height="50" fill="#000" />
                              <rect x="196" y="0" width="3" height="50" fill="#000" />
                              <rect x="202" y="0" width="4" height="50" fill="#000" />
                              <rect x="209" y="0" width="2" height="50" fill="#000" />
                              <rect x="214" y="0" width="1" height="50" fill="#000" />
                              <rect x="218" y="0" width="5" height="50" fill="#000" />
                              <rect x="226" y="0" width="2" height="50" fill="#000" />
                              <rect x="231" y="0" width="3" height="50" fill="#000" />
                              <rect x="237" y="0" width="1" height="50" fill="#000" />
                              <rect x="241" y="0" width="4" height="50" fill="#000" />
                              <rect x="248" y="0" width="2" height="50" fill="#000" />
                              <rect x="253" y="0" width="5" height="50" fill="#000" />
                              <rect x="261" y="0" width="1" height="50" fill="#000" />
                              <rect x="265" y="0" width="3" height="50" fill="#000" />
                              <rect x="271" y="0" width="4" height="50" fill="#000" />
                              <rect x="278" y="0" width="2" height="50" fill="#000" />
                            </svg>
                            <span className="text-[11px] font-mono text-black font-bold tracking-[0.25em]">
                              {activeWaybill}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-[11px]">
                            <div className="p-3 rounded-xl bg-[#181818]">
                              <span className="text-[#71717A] block font-mono uppercase text-[10px]">Layanan</span>
                              <span className="text-white font-medium">Drop-off Counter</span>
                            </div>
                            <div className="p-3 rounded-xl bg-[#181818]">
                              <span className="text-[#71717A] block font-mono uppercase text-[10px]">Ongkir</span>
                              <span className="text-white font-medium">
                                {returnReq.shippingFeeBearer === "BUYER" ? "Ditanggung Pembeli" : "Rp 0 (Cashless)"}
                              </span>
                            </div>
                            <div className="p-3 rounded-xl bg-[#181818]">
                              <span className="text-[#71717A] block font-mono uppercase text-[10px]">Status Resi</span>
                              <span className="text-white font-medium">Siap Di-scan</span>
                            </div>
                            <div className="p-3 rounded-xl bg-[#181818]">
                              <span className="text-[#71717A] block font-mono uppercase text-[10px]">Batas Waktu</span>
                              <span className="text-white font-medium">3 Hari Kerja</span>
                            </div>
                          </div>
                        </div>

                        {/* Store Return Address */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#141414] space-y-2">
                          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                            <MapPin className="w-4 h-4 text-[#A1A1AA]" />
                            <span>Alamat Tujuan Pengembalian Toko</span>
                          </div>
                          <p className="text-xs text-[#E4E4E7] leading-relaxed font-sans pl-6">
                            {returnReq.storeReturnAddress ||
                              "Tonal Zone Official Return Center, Ruko Kebayoran Square Blok A-12, Bintaro Jaya, Tangerang Selatan 15224 (Attn: Audio QC Lab)"}
                          </p>
                          <p className="text-[11px] text-[#71717A] pl-6">
                            Petugas ekspedisi akan otomatis mencetak label tujuan ke alamat toko di atas saat nomor resi di-scan.
                          </p>
                        </div>
                      </div>

                      {/* Panduan Cara Retur (Langkah 1 - 4) */}
                      <div className="rounded-2xl bg-[#0E0E0E] p-6 sm:p-8 space-y-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-white text-xs font-mono uppercase tracking-wider">
                            <Info className="w-4 h-4 text-[#A1A1AA]" />
                            <span>Panduan Cara Pengembalian Unit</span>
                          </div>
                          <h4 className="text-base font-semibold text-white font-heading">
                            Langkah Menyerahkan Paket ke Agen Ekspedisi
                          </h4>
                          <p className="text-xs text-[#8E8E93]">
                            Ikuti 4 langkah berikut agar proses pengembalian dan pencairan refund berjalan lancar:
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                          {/* Step 1 */}
                          <div className="p-4 rounded-2xl bg-[#141414] space-y-2">
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-full bg-[#2e2e2e] text-white text-xs font-mono font-bold flex items-center justify-center shrink-0">
                                1
                              </span>
                              <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                                Kemas Unit & Aksesoris
                              </h5>
                            </div>
                            <p className="text-xs text-[#A1A1AA] leading-relaxed pl-8">
                              Masukkan kedua housing IEM, kabel bawaan, eartips cadangan, boks asli, dan kelengkapan lainnya. Lapisi paket dengan bubble wrap tebal agar terlindung dari benturan.
                            </p>
                          </div>

                          {/* Step 2 */}
                          <div className="p-4 rounded-2xl bg-[#141414] space-y-2">
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-full bg-[#2e2e2e] text-white text-xs font-mono font-bold flex items-center justify-center shrink-0">
                                2
                              </span>
                              <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                                Datangi Gerai {activeCourier}
                              </h5>
                            </div>
                            <p className="text-xs text-[#A1A1AA] leading-relaxed pl-8">
                              Bawa paket Anda ke kantor cabang atau agen {activeCourier} terdekat di kota Anda. Anda tidak perlu mencetak label atau alamat dari rumah.
                            </p>
                          </div>

                          {/* Step 3 */}
                          <div className="p-4 rounded-2xl bg-[#141414] space-y-2">
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-full bg-[#2e2e2e] text-white text-xs font-mono font-bold flex items-center justify-center shrink-0">
                                3
                              </span>
                              <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                                Tunjukkan Kode Resi / Barcode
                              </h5>
                            </div>
                            <p className="text-xs text-[#A1A1AA] leading-relaxed pl-8">
                              Tunjukkan barcode atau kode booking di atas kepada petugas konter. Petugas akan mencetak label resmi. <span className="text-white font-medium">Bebas Biaya</span> — Anda tidak perlu membayar ongkir di konter.
                            </p>
                          </div>

                          {/* Step 4 */}
                          <div className="p-4 rounded-2xl bg-[#141414] space-y-2">
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-full bg-[#2e2e2e] text-white text-xs font-mono font-bold flex items-center justify-center shrink-0">
                                4
                              </span>
                              <h5 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                                Terima Struk & Konfirmasi
                              </h5>
                            </div>
                            <p className="text-xs text-[#A1A1AA] leading-relaxed pl-8">
                              Simpan lembar bukti terima dari petugas loket, lalu klik tombol konfirmasi di bawah agar status pengiriman otomatis tercatat aktif di sistem escrow.
                            </p>
                          </div>
                        </div>

                        {/* Confirmation Actions */}
                        <div className="pt-3 border-t border-[#1C1C1C] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                          <button
                            type="button"
                            onClick={() => handleConfirmDropoff(activeWaybill, activeCourier)}
                            disabled={isSubmittingWaybill}
                            className="px-8 py-3.5 rounded-full bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-40"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              {isSubmittingWaybill
                                ? "Mengonfirmasi..."
                                : "Saya Sudah Menyerahkan Paket ke Konter"}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowManualCourier(!showManualCourier)}
                            className="text-xs text-[#8E8E93] hover:text-white transition-colors flex items-center justify-center sm:justify-end gap-1.5 cursor-pointer py-1"
                          >
                            <span>Kirim mandiri atau pakai ekspedisi lain?</span>
                            {showManualCourier ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Optional Manual Courier & Waybill Form */}
                      {showManualCourier && (
                        <form
                          onSubmit={handleSubmitReturnWaybill}
                          className="rounded-2xl bg-[#0E0E0E] p-6 sm:p-8 space-y-4 border border-[#1F1F1F]"
                        >
                          <h4 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                            Input Nomor Resi Mandiri (Ekspedisi Lain)
                          </h4>
                          <p className="text-xs text-[#8E8E93]">
                            Jika Anda memilih mengirim menggunakan jasa kurir lain di luar tiket cashless otomatis di atas, masukkan nomor resi manual Anda di sini.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                            <div>
                              <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
                                Pilih Ekspedisi
                              </label>
                              <select
                                value={selectedCourier}
                                onChange={(e) => setSelectedCourier(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl bg-[#181818] text-xs text-white outline-none border-0 focus:ring-1 focus:ring-white/20 cursor-pointer"
                              >
                                {COURIER_OPTIONS.map((c) => (
                                  <option key={c} value={c} className="bg-[#181818] text-white">
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
                                Nomor Resi Pengiriman
                              </label>
                              <div className="flex gap-3">
                                <input
                                  type="text"
                                  value={returnWaybillInput}
                                  onChange={(e) => setReturnWaybillInput(e.target.value)}
                                  placeholder="Contoh: SOCAG0192841920"
                                  className="flex-1 px-4 py-3 rounded-2xl bg-[#181818] text-xs font-mono uppercase text-white placeholder:text-[#52525B] outline-none border-0 focus:ring-1 focus:ring-white/20"
                                />
                                <button
                                  type="submit"
                                  disabled={isSubmittingWaybill || !returnWaybillInput.trim()}
                                  className="px-6 py-3 rounded-2xl bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
                                >
                                  {isSubmittingWaybill ? "Menyimpan..." : "Kirim Resi"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })()}

                {returnReq.status === "IN_TRANSIT_TO_SELLER" && (
                  <div className="rounded-2xl bg-[#0E1318] p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#162330] text-[#38BDF8] flex items-center justify-center shrink-0">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          Unit Retur Sedang Dalam Perjalanan ke Penjual
                        </h4>
                        <p className="text-xs text-[#A1A1AA] mt-1 max-w-xl leading-relaxed">
                          Kurir <span className="text-white font-medium">{returnReq.returnCourier}</span> dengan nomor resi{" "}
                          <span className="text-[#38BDF8] font-mono font-semibold">
                            {returnReq.returnWaybillNumber}
                          </span>{" "}
                          sedang mengantarkan paket ke alamat toko. Sistem akan memberi notifikasi saat paket tiba.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {returnReq.status === "RECEIVED_INSPECTING" && (
                  <div className="rounded-2xl bg-[#140F18] p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#23172E] text-[#C084FC] flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          Paket Telah Tiba • Dalam Pemeriksaan QC
                        </h4>
                        <p className="text-xs text-[#A1A1AA] mt-1 max-w-xl leading-relaxed">
                          Unit IEM telah diterima oleh penjual dan sedang dilakukan pengujian teknis audio (frequency response test & channel balance check). Dana escrow akan langsung dikembalikan setelah verifikasi selesai.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {returnReq.status === "REFUNDED" && (
                  <div className="rounded-2xl bg-[#0E0E0E] p-6 sm:p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#181818] text-white flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-white uppercase tracking-tight font-heading">
                      Pengembalian Dana Berhasil
                    </h4>
                    <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
                      Dana sebesar{" "}
                      <span className="text-white font-mono font-bold text-sm">
                        {formatPrice(returnReq.refundAmount)}
                      </span>{" "}
                      telah dikembalikan dari rekening bersama TonalZone Escrow ke rekening / saldo asal Anda.
                    </p>
                    <div className="pt-3">
                      <Link
                        href="/orders?tab=CANCELLED"
                        className="px-6 py-2.5 rounded-full bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all inline-block shadow-md"
                      >
                        Kembali ke Halaman Pesanan
                      </Link>
                    </div>
                  </div>
                )}

                {returnReq.status === "REPLACED" && (returnReq.status as string) !== "COMPLETED" && (
                  <div className="rounded-2xl bg-[#0E0E0E] p-6 sm:p-8 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-[#181818] text-white flex items-center justify-center mx-auto">
                      <PackageCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white uppercase tracking-tight font-heading">
                        Unit Baru Pengganti Dikirim
                      </h4>
                      <p className="text-xs text-[#A1A1AA] max-w-md mx-auto mt-1">
                        Toko telah menyetujui solusi tukar barang dan mengirimkan 1 unit IEM baru pengganti yang tersegel.
                      </p>
                    </div>
                    <div className="inline-flex flex-col sm:flex-row items-center gap-2 p-3 rounded-2xl bg-[#141414] text-xs font-mono text-[#D4D4D8]">
                      <span>Kurir: <strong className="text-white">{returnReq.replacementCourier || "JNE Express"}</strong></span>
                      <span className="hidden sm:inline">•</span>
                      <span>No. Resi Unit Baru: <strong className="text-white">{returnReq.replacementWaybillNumber || "JNE-REP-99281"}</strong></span>
                    </div>
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleConfirmReplacementDelivery}
                        disabled={isConfirmingDelivery}
                        className="px-6 py-2.5 rounded-full bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md"
                      >
                        {isConfirmingDelivery ? "Memproses..." : "Konfirmasi Terima Unit Pengganti"}
                      </button>
                      <Link
                        href="/orders?tab=IN_TRANSIT"
                        className="px-6 py-2.5 rounded-full bg-[#181818] hover:bg-[#222222] text-[#D4D4D8] hover:text-white text-xs font-bold uppercase tracking-wider transition-all inline-block"
                      >
                        Lacak di Tab Pengiriman
                      </Link>
                    </div>
                  </div>
                )}

                {(returnReq.status as string) === "COMPLETED" && (
                  <div className="rounded-2xl bg-[#0E0E0E] p-6 sm:p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#181818] text-white flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-white uppercase tracking-tight font-heading">
                      Tukar Unit Selesai • Pesanan Tuntas
                    </h4>
                    <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
                      Unit pengganti baru telah Anda terima dan transaksi telah tuntas. Dana escrow diteruskan ke toko penjual.
                    </p>
                    <div className="pt-3">
                      <Link
                        href="/orders?tab=COMPLETED"
                        className="px-6 py-2.5 rounded-full bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all inline-block shadow-md"
                      >
                        Lihat di Tab Selesai
                      </Link>
                    </div>
                  </div>
                )}

                {returnReq.status === "REJECTED" && (
                  <div className="rounded-2xl bg-[#1C0E0E] p-6 sm:p-8 space-y-3">
                    <div className="flex items-center gap-2 text-red-400 text-xs font-mono uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4" />
                      <span>Pengajuan Retur Ditolak Penjual</span>
                    </div>
                    <h4 className="text-base font-semibold text-white">
                      Alasan Penolakan dari Toko
                    </h4>
                    <div className="p-4 rounded-2xl bg-[#281313] text-xs text-red-200 leading-relaxed font-sans">
                      {returnReq.sellerRejectReason ||
                        "Tidak ditemukan kendala audio yang sesuai atau masa pengajuan garansi retur telah melewati ketentuan toko."}
                    </div>
                    <p className="text-xs text-[#8E8E93]">
                      Jika Anda merasa penolakan ini tidak sesuai dengan kondisi produk, Anda dapat menghubungi Customer Service Escrow TonalZone untuk mediasi lebih lanjut.
                    </p>
                  </div>
                )}

                {/* Dua Tahap Persetujuan Retur (Two-Step Inspection) */}
                <div className="rounded-2xl bg-[#0B0B0B] p-6 sm:p-7 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A] block">
                        Standar Verifikasi TonalZone
                      </span>
                      <h4 className="text-sm font-bold uppercase text-white font-heading mt-0.5">
                        Dua Tahap Persetujuan Retur (Two-Step Inspection)
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#181818] border border-white/20 text-white font-semibold">
                      {returnReq.status === "REQUESTED"
                        ? "Tahap 1: Verifikasi Awal"
                        : returnReq.status === "APPROVED_WAITING_SHIPMENT" ||
                          returnReq.status === "IN_TRANSIT_TO_SELLER" ||
                          returnReq.status === "RECEIVED_INSPECTING"
                        ? "Tahap 2: Pengujian QC Lab"
                        : "Verifikasi Selesai"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tahap 1 Card */}
                    <div className="p-4 rounded-2xl bg-[#121212] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] font-bold flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center text-[10px]">
                            1
                          </span>
                          Tahap 1: Verifikasi Dokumen & Bukti
                        </span>
                        {returnReq.status !== "REQUESTED" ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181818] text-white font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Lolos Validasi
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181818] text-[#A1A1AA] font-bold">
                            Dalam Review Toko
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#8E8E93] leading-relaxed">
                        Pemeriksaan kelengkapan video unboxing tanpa jeda, foto bukti fisik, dan kesesuaian nomor resi pesanan awal.
                      </p>
                      <div className="text-[10px] font-mono text-[#71717A] pt-1">
                        Ongkir Retur:{" "}
                        <span className="text-white font-semibold">
                          {returnReq.shippingFeeBearer === "BUYER"
                            ? "Ditanggung Pembeli"
                            : "Gratis Rp 0 (Ditanggung Toko)"}
                        </span>
                      </div>
                    </div>

                    {/* Tahap 2 Card */}
                    <div className="p-4 rounded-2xl bg-[#121212] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] font-bold flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center text-[10px]">
                            2
                          </span>
                          Tahap 2: Pengujian Akustik & QC Lab
                        </span>
                        {returnReq.qcStatus === "PASSED" ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181818] text-white font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Lolos Uji Lab
                          </span>
                        ) : returnReq.qcStatus === "FAILED" ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#261212] text-red-400 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Gagal QC
                          </span>
                        ) : returnReq.status === "RECEIVED_INSPECTING" ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181818] text-[#A1A1AA] font-bold">
                            Sedang Diuji Lab
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181818] text-[#71717A]">
                            Menunggu Unit Tiba
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#8E8E93] leading-relaxed">
                        Uji teknis fisik & kurva akustik (channel balance ±0.5dB, driver THD, integritas pin & housing) saat unit tiba di teknisi toko.
                      </p>

                      {/* If QC report exists */}
                      {returnReq.qcAcousticReport && (
                        <div className="pt-2 border-t border-[#1C1C1C] space-y-1.5">
                          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
                            <div
                              className={`p-1.5 rounded-lg ${
                                returnReq.qcAcousticReport.channelBalancePassed
                                  ? "bg-[#181818] text-white"
                                  : "bg-[#261212] text-red-400"
                              } text-center`}
                            >
                              {returnReq.qcAcousticReport.channelBalancePassed ? "✓" : "✗"} Balance
                            </div>
                            <div
                              className={`p-1.5 rounded-lg ${
                                returnReq.qcAcousticReport.frequencyResponsePassed
                                  ? "bg-[#181818] text-white"
                                  : "bg-[#261212] text-red-400"
                              } text-center`}
                            >
                              {returnReq.qcAcousticReport.frequencyResponsePassed ? "✓" : "✗"} Freq Resp
                            </div>
                            <div
                              className={`p-1.5 rounded-lg ${
                                returnReq.qcAcousticReport.shellIntegrityPassed
                                  ? "bg-[#181818] text-white"
                                  : "bg-[#261212] text-red-400"
                              } text-center`}
                            >
                              {returnReq.qcAcousticReport.shellIntegrityPassed ? "✓" : "✗"} Shell & Pin
                            </div>
                          </div>
                          {returnReq.qcNotes && (
                            <p className="text-[11px] text-[#A1A1AA] italic pt-1 font-sans">
                              Catatan Lab: &ldquo;{returnReq.qcNotes}&rdquo;
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details Section: Reason & Description & Evidence */}
                <div className="rounded-2xl bg-[#0A0A0A] p-6 sm:p-8 space-y-5">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-[#71717A]">
                    Detail Komplain Pembeli
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-[#121212]">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block mb-1">
                        Alasan Pengajuan
                      </span>
                      <span className="text-xs font-medium text-white block">
                        {returnReq.reason}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#121212]">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block mb-1">
                        Solusi yang Diminta
                      </span>
                      <span className="text-xs font-medium text-white block">
                        {returnReq.requestedSolution === "REPLACEMENT" ? "Tukar Unit Baru (Replacement)" : "Pengembalian Dana (Refund)"}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#121212]">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block mb-1">
                        Tanggal Diajukan
                      </span>
                      <span className="text-xs font-mono text-white block">
                        {new Date(returnReq.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#121212]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block mb-2">
                      Deskripsi Masalah / Catatan Pengujian Audio
                    </span>
                    <p className="text-xs text-[#D4D4D8] font-sans leading-relaxed">
                      {returnReq.description}
                    </p>
                  </div>

                  {/* Video Unboxing Display */}
                  {returnReq.unboxingVideoUrl && (
                    <div className="p-5 rounded-2xl bg-[#121212] space-y-3">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-[#A1A1AA]" />
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white font-bold">
                          Video Bukti Unboxing (SOP Audio Protection)
                        </span>
                      </div>
                      {returnReq.unboxingVideoUrl.startsWith("http") &&
                      (returnReq.unboxingVideoUrl.includes("drive.google.com") ||
                        returnReq.unboxingVideoUrl.includes("youtu")) ? (
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#181818]">
                          <div className="min-w-0 pr-3">
                            <p className="text-xs text-white font-medium truncate">
                              Tautan Cloud Video Unboxing
                            </p>
                            <p className="text-[10px] text-[#71717A] truncate font-mono">
                              {returnReq.unboxingVideoUrl}
                            </p>
                          </div>
                          <a
                            href={returnReq.unboxingVideoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-full bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Buka Video</span>
                          </a>
                        </div>
                      ) : (
                        <video
                          controls
                          src={returnReq.unboxingVideoUrl}
                          className="w-full max-h-64 rounded-2xl bg-black object-contain border-0"
                        />
                      )}
                    </div>
                  )}

                  {/* Evidence Photos */}
                  {returnReq.evidenceImages && returnReq.evidenceImages.length > 0 && (
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block mb-3">
                        Foto Bukti Fisik / Hasil Pengujian
                      </span>
                      <div className="flex flex-wrap gap-3">
                        {returnReq.evidenceImages.map((img, i) => (
                          <div
                            key={i}
                            className="relative w-24 h-24 rounded-2xl bg-[#161616] overflow-hidden"
                          >
                            <Image
                              src={img}
                              alt={`Evidence ${i + 1}`}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* If NO return request yet: Show Clean Filing Form */
              <form
                onSubmit={handleCreateReturn}
                className="rounded-2xl bg-[#0A0A0A] p-6 sm:p-8 space-y-6"
              >
                <div>
                  <h3 className="text-base font-bold text-white uppercase tracking-tight font-heading">
                    Formulir Pengajuan Retur & Pengembalian Dana
                  </h3>
                  <p className="text-xs text-[#8E8E93] mt-1">
                    Pilih alasan kendala yang Anda alami pada produk IEM ini. Penjual akan menanggapi dalam waktu 1x24 jam.
                  </p>
                </div>

                {/* Reason Pills Selection (Rounded-full, Zero border) */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717A] mb-3">
                    Pilih Alasan Kendala Produk *
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {COMMON_REASONS.map((item) => {
                      const isSelected = selectedReason === item.reason;
                      return (
                        <button
                          key={item.reason}
                          type="button"
                          onClick={() => setSelectedReason(item.reason)}
                          className={`px-4 py-2.5 rounded-full text-xs font-sans transition-all cursor-pointer ${
                            isSelected
                              ? "bg-white text-black font-bold shadow-md"
                              : "bg-[#141414] hover:bg-[#1E1E1E] text-[#A1A1AA]"
                          }`}
                        >
                          {item.reason}
                        </button>
                      );
                    })}
                  </div>

                  {/* Kartu Transparansi Ongkir Retur */}
                  {(() => {
                    const currentReasonObj =
                      COMMON_REASONS.find((r) => r.reason === selectedReason) || COMMON_REASONS[0];
                    const isSellerPaid = currentReasonObj.bearer === "SELLER";
                    return (
                      <div
                        className={`p-4 rounded-2xl ${
                          isSellerPaid ? "bg-[#112415] text-[#86EFAC]" : "bg-[#241A12] text-[#FDBA74]"
                        } flex items-start gap-3 mt-3`}
                      >
                        <Truck className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold uppercase font-mono tracking-wider">
                              {isSellerPaid
                                ? "Ongkos Kirim Retur: GRATIS (Rp 0)"
                                : "Ongkos Kirim Retur: Ditanggung Pembeli"}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                                isSellerPaid
                                  ? "bg-[#1B3E22] text-[#4ADE80]"
                                  : "bg-[#3D2816] text-[#FB923C]"
                              }`}
                            >
                              {isSellerPaid ? "Cashless / Bebas Biaya" : "Biaya Mandiri"}
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed opacity-90">
                            {isSellerPaid
                              ? "Karena kendala berasal dari cacat suara / fisik bawaan pabrik, ongkos kirim pengembalian ditanggung sepenuhnya oleh Toko melalui sistem drop-off Cashless TonalZone."
                              : "Untuk perubahan pikiran atau salah pilih varian/konektor, ongkos kirim pengembalian ditanggung oleh pembeli sesuai kebijakan standar marketplace."}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Solusi Retur yang Diinginkan */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717A] mb-2.5">
                    Pilih Opsi Solusi yang Anda Inginkan *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setRequestedSolution("REFUND")}
                      className={`p-4 rounded-2xl cursor-pointer transition-all ${
                        requestedSolution === "REFUND"
                          ? "bg-[#182618] ring-1 ring-[#4ADE80]"
                          : "bg-[#121212] hover:bg-[#171717]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white uppercase font-heading">
                          Pengembalian Dana Penuh (Refund)
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            requestedSolution === "REFUND"
                              ? "bg-white text-black"
                              : "bg-[#222222]"
                          }`}
                        >
                          {requestedSolution === "REFUND" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                        Dana escrow {formatPrice(order?.totalAmount || currentItem.price)} dikembalikan 100% ke saldo/rekening Anda setelah unit sampai di toko.
                      </p>
                    </div>

                    <div
                      onClick={() => setRequestedSolution("REPLACEMENT")}
                      className={`p-4 rounded-2xl cursor-pointer transition-all ${
                        requestedSolution === "REPLACEMENT"
                          ? "bg-[#181818] ring-1 ring-white/30"
                          : "bg-[#121212] hover:bg-[#171717]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white uppercase font-heading">
                          Tukar Unit Baru (Replacement)
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            requestedSolution === "REPLACEMENT"
                              ? "bg-white text-black"
                              : "bg-[#222222]"
                          }`}
                        >
                          {requestedSolution === "REPLACEMENT" && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                        Toko mengirimkan unit IEM baru pengganti yang tersegel dan lolos QC audio setelah unit kendala diterima.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description Textarea */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717A] mb-2">
                    Jelaskan Kendala Audio / Fisik Secara Rinci *
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Contoh: Unit sisi kiri tidak mengeluarkan bass / volume lebih kecil. Sudah dicoba dengan kabel lain dan DAC berbeda tetap mengalami channel imbalance."
                    className="w-full p-4 rounded-2xl bg-[#141414] text-xs text-white placeholder:text-[#52525B] leading-relaxed outline-none border-0 focus:ring-1 focus:ring-white/30"
                    required
                  />
                  <span className="text-[10px] text-[#71717A] mt-1 block">
                    Penjelasan yang detail membantu penjual menyetujui klaim Anda lebih cepat.
                  </span>
                </div>

                {/* Syarat Wajib Video Unboxing */}
                <div className="space-y-3 p-5 rounded-2xl bg-[#0E0E0E]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-white" />
                      <label className="text-[11px] font-mono uppercase tracking-wider text-white font-bold">
                        Video Unboxing (Wajib untuk Komplain IEM) *
                      </label>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/10 text-[#D4D4D8] font-mono font-medium">
                      SOP Audio Protection
                    </span>
                  </div>

                  <p className="text-xs text-[#8E8E93] leading-relaxed">
                    Untuk menjamin keaslian komplain cacat suara atau fisik IEM baru, pembeli wajib menyertakan video unboxing utuh tanpa jeda/editan memperlihatkan nomor resi dan unit saat pertama kali dibuka.
                  </p>

                  {/* Method Toggle: Unggah File vs Masukkan Link */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setUnboxingMethod("upload")}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                        unboxingMethod === "upload"
                          ? "bg-white text-black font-semibold"
                          : "bg-[#181818] text-[#8E8E93] hover:text-white"
                      }`}
                    >
                      Unggah File Video (MP4/WebM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnboxingMethod("link")}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                        unboxingMethod === "link"
                          ? "bg-white text-black font-semibold"
                          : "bg-[#181818] text-[#8E8E93] hover:text-white"
                      }`}
                    >
                      Tautan Cloud (Drive / YouTube / Cloud)
                    </button>
                  </div>

                  {unboxingMethod === "upload" ? (
                    <div>
                      {unboxingVideoUrl ? (
                        <div className="rounded-2xl bg-black p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[#1C1C1C] flex items-center justify-center text-white shrink-0">
                              <Video className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-white font-medium truncate max-w-xs">
                                {unboxingVideoFileName || "video_unboxing.mp4"}
                              </p>
                              <span className="text-[10px] text-[#A1A1AA] font-mono block">
                                ✓ Video unboxing terlampir
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setUnboxingVideoUrl("");
                              setUnboxingVideoFileName("");
                            }}
                            className="px-3 py-1.5 rounded-full bg-[#202020] hover:bg-red-600/80 text-xs text-white transition-colors cursor-pointer shrink-0"
                          >
                            Ganti Video
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => videoFileInputRef.current?.click()}
                          className="rounded-2xl border border-dashed border-[#282828] hover:border-[#404040] p-6 text-center cursor-pointer transition-colors bg-[#121212] hover:bg-[#161616]"
                        >
                          <Video className="w-6 h-6 text-[#71717A] mx-auto mb-2" />
                          <p className="text-xs text-white font-medium">
                            Klik di sini untuk mengunggah video unboxing
                          </p>
                          <p className="text-[11px] text-[#71717A] mt-0.5">
                            Mendukung MP4, MOV, WebM (Maksimal 60MB)
                          </p>
                        </div>
                      )}
                      <input
                        ref={videoFileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleVideoSelect}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div>
                      <input
                        type="url"
                        value={unboxingVideoUrl}
                        onChange={(e) => setUnboxingVideoUrl(e.target.value)}
                        placeholder="Contoh: https://drive.google.com/file/d/... atau https://youtu.be/..."
                        className="w-full px-4 py-3 rounded-2xl bg-[#141414] text-xs text-white placeholder:text-[#52525B] outline-none border-0 focus:ring-1 focus:ring-white/30"
                      />
                      <span className="text-[10px] text-[#71717A] mt-1 block">
                        Pastikan izin share Google Drive diset &quot;Anyone with the link can view&quot;.
                      </span>
                    </div>
                  )}

                  {/* Mandatory Unboxing Checklist */}
                  <label className="flex items-start gap-2.5 pt-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={unboxingConfirmed}
                      onChange={(e) => setUnboxingConfirmed(e.target.checked)}
                      className="mt-0.5 rounded accent-white text-white focus:ring-white/30 bg-[#1A1A1A] border-0 cursor-pointer"
                    />
                    <span className="text-xs text-[#A1A1AA] leading-relaxed">
                      Saya menyatakan video unboxing direkam secara utuh tanpa jeda (cut/edit), memperlihatkan resi ekspedisi dan kondisi fisik IEM saat pertama dibuka.
                    </span>
                  </label>
                </div>

                {/* Evidence Image Upload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717A]">
                      Foto Bukti Fisik / Kerusakan *
                    </label>
                    <span className="text-[11px] font-mono text-[#71717A]">
                      {evidenceImages.length} / 5 Foto
                    </span>
                  </div>

                  <p className="text-xs text-[#8E8E93] leading-relaxed">
                    Unggah foto jelas bagian unit yang bermasalah (housing IEM, pin konektor, kabel, kelengkapan eartips, atau kemasan boks). Foto yang jelas dan detail membantu penjual menyetujui klaim Anda lebih cepat.
                  </p>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                    {/* Add Photo Button */}
                    {evidenceImages.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-24 rounded-2xl bg-[#141414] hover:bg-[#1A1A1A] flex flex-col items-center justify-center gap-1.5 text-[#71717A] hover:text-white transition-all cursor-pointer border border-dashed border-[#262626] hover:border-[#3F3F46]"
                      >
                        <Camera className="w-5 h-5" />
                        <span className="text-[10px] font-mono uppercase tracking-wider">Tambah Foto</span>
                      </button>
                    )}

                    {/* Photo Thumbnails */}
                    {evidenceImages.map((src, index) => (
                      <div
                        key={index}
                        className="relative h-24 rounded-2xl overflow-hidden bg-[#141414] group"
                      >
                        <Image
                          src={src}
                          alt={`Foto bukti ${index + 1}`}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeEvidencePhoto(index)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Hapus foto"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleEvidencePhotoSelect}
                      className="hidden"
                    />
                  </div>

                  {evidenceImages.length === 0 && (
                    <div className="text-[11px] text-[#71717A] flex items-center gap-1.5 pt-1">
                      <Info className="w-3.5 h-3.5" />
                      <span>Jika belum ada foto yang diunggah, foto bawaan produk pesanan akan dipakai sebagai lampiran awal.</span>
                    </div>
                  )}
                </div>

                {/* Escrow Terms Notification (Rounded-2xl, Zero border) */}
                <div className="rounded-2xl bg-[#121212] p-4 flex items-start gap-3 text-xs text-[#A1A1AA]">
                  <ShieldCheck className="w-5 h-5 text-white shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-white font-medium">Perlindungan Rekening Bersama Escrow TonalZone</p>
                    <p className="leading-relaxed text-[#8E8E93]">
                      Dengan mengajukan retur, dana transaksi sebesar{" "}
                      <span className="text-white font-mono font-semibold">
                        {formatPrice(order.totalAmount)}
                      </span>{" "}
                      akan otomatis dikunci di rekening escrow hingga proses retur selesai atau kedua belah pihak mencapai kesepakatan.
                    </p>
                  </div>
                </div>

                {/* Submit Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                  <Link
                    href="/orders"
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#141414] hover:bg-[#1E1E1E] text-xs font-semibold text-[#A1A1AA] hover:text-white uppercase tracking-wider text-center transition-all"
                  >
                    Batal
                  </Link>

                  <button
                    type="submit"
                    disabled={isSubmitting || !description.trim()}
                    className="w-full sm:w-auto px-8 py-3 rounded-full bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? "Mengirim Pengajuan..." : "Kirim Pengajuan Retur"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
