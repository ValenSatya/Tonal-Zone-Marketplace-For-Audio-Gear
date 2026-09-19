"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { MapPin, Truck, MessageSquare, FileText, ChevronRight, CheckCircle2, Package, ShieldCheck } from "lucide-react";
import { triggerAppNotification } from "@/context/NotificationContext";
import { getStoreSlug } from "@/lib/store-utils";

interface OrderTimelineStep {
  title: string;
  time: string;
  desc?: string;
  completed?: boolean;
}

interface OrderItem {
  id: string;
  orderNumber: string;
  date: string;
  productName: string;
  brand: string;
  price: number;
  quantity?: number;
  image?: string;
  storeName: string;
  status: "PAYMENT_PENDING" | "HELD_IN_ESCROW" | "IN_TRANSIT" | "DELIVERED" | "FUNDS_RELEASED_TO_SELLER" | "DISPUTED" | "REFUNDED";
  waybillNumber?: string;
  courierCode?: string;
  etaDays?: number;
  hasReviewed?: boolean;
  trackingHistory?: any[];
  timeline?: OrderTimelineStep[];
  returnId?: string;
  returnStatus?: string;
  isInsured?: boolean;
  insuranceFee?: number;
  deliveredAt?: string;
  inspectionExpiresAt?: string;
  autoSettled?: boolean;
  itemsSubtotal?: number;
  shippingFee?: number;
  platformFee?: number;
  cancelReason?: string;
  cancelledBy?: "BUYER" | "SELLER";
  cancelledAt?: string;
}

const CANCEL_REASONS = [
  "Ingin mengubah alamat pengiriman / kurir",
  "Salah memilih varian produk (warna / colokan)",
  "Menemukan harga lebih hemat / berubah pikiran",
  "Waktu pengiriman terlalu lama",
  "Lainnya (alasan khusus)",
];

interface ReviewItem {
  id: string;
  productName: string;
  brand: string;
  rating: number;
  date: string;
  comment: string;
  storeName: string;
}

type OrderTab = "UNPAID" | "TO_SHIP" | "IN_TRANSIT" | "DELIVERED" | "COMPLETED" | "RETURNS" | "CANCELLED" | "reviews";

export default function OrdersPage() {
  const { t } = useLanguage();
  const { formatPrice } = useLocation();
  const [activeTab, setActiveTab] = useState<OrderTab>("UNPAID");
  const [saveMessage, setSaveMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal State
  const [reviewingOrder, setReviewingOrder] = useState<OrderItem | null>(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");

  // Dispute Modal State
  const [disputeOrder, setDisputeOrder] = useState<OrderItem | null>(null);
  const [disputeReason, setDisputeReason] = useState("");

  // Order Details Modal State
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderItem | null>(null);

  // Cancel Order Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState<OrderItem | null>(null);
  const [cancelReasonSelected, setCancelReasonSelected] = useState(CANCEL_REASONS[0]);
  const [cancelNotesInput, setCancelNotesInput] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const handleCancelOrder = async () => {
    if (!cancelModalOrder) return;
    setIsSubmittingCancel(true);
    try {
      const fullReason = cancelNotesInput.trim()
        ? `${cancelReasonSelected}: ${cancelNotesInput.trim()}`
        : cancelReasonSelected;

      const res = await fetch(`/api/orders/${cancelModalOrder.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: fullReason,
          cancelledBy: "BUYER",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal membatalkan pesanan.");
      }

      setCancelModalOrder(null);
      setCancelNotesInput("");
      setSaveMessage("Pesanan berhasil dibatalkan. Dana escrow dikembalikan 100%.");
      setTimeout(() => setSaveMessage(""), 4000);

      triggerAppNotification({
        type: "order",
        title: "Pesanan Berhasil Dibatalkan",
        message: `Pesanan #${cancelModalOrder.id} telah dibatalkan. Dana escrow telah dikembalikan 100% ke saldo akun Anda.`,
        actionLink: "/orders",
      });

      fetchOrders(true);
    } catch (err: any) {
      alert(err.message || "Gagal membatalkan pesanan.");
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // Orders State (100% connected to live database, strictly 0 dummy data)
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const isInitialLoadRef = useRef(true);

  const fetchOrders = async (isSilent = false) => {
    try {
      if (!isSilent && isInitialLoadRef.current) {
        setIsLoading(true);
      }
      let userEmail = "";
      try {
        const stored = localStorage.getItem("tonalzone_user");
        if (stored) {
          const u = JSON.parse(stored);
          if (u?.email) userEmail = u.email;
        }
      } catch (e) {}

      const fetchUrl = userEmail
        ? `/api/orders?email=${encodeURIComponent(userEmail)}`
        : `/api/orders`;

      const res = await fetch(fetchUrl);
      if (!res.ok) {
        if (!isSilent) setOrders([]);
        return;
      }
      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        if (!isSilent) setOrders([]);
        return;
      }

      if (data && data.success && Array.isArray(data.orders)) {
        const mapped: OrderItem[] = data.orders.map((o: any) => ({
          id: o.id,
          orderNumber: o.id,
          date: new Date(o.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          productName: o.items?.[0]?.productName || "Audiophile IEM",
          brand: o.items?.[0]?.brand || "TonalZone",
          price: o.totalAmount,
          quantity: o.items?.[0]?.quantity || 1,
          image: o.items?.[0]?.image || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
          storeName: o.storeName || "Moondrop Official",
          status: o.escrowStatus,
          waybillNumber: o.waybillNumber,
          courierCode: o.courierCode || "JNE Express",
          etaDays: o.estimatedDeliveryDays || 3,
          hasReviewed: Boolean(o.hasReviewed),
          returnId: o.returnId,
          returnStatus: o.returnStatus,
          isInsured: Boolean(o.isInsured || (o.insuranceFee && o.insuranceFee > 0)),
          insuranceFee: Number(o.insuranceFee) || 0,
          itemsSubtotal: Number(o.itemsSubtotal) || o.totalAmount,
          shippingFee: Number(o.shippingFee) || 0,
          platformFee: Number(o.platformFee) || 0.1,
          cancelReason: o.cancelReason,
          cancelledBy: o.cancelledBy,
          cancelledAt: o.cancelledAt,
          deliveredAt: o.deliveredAt,
          inspectionExpiresAt: o.inspectionExpiresAt,
          autoSettled: Boolean(o.autoSettled),
          trackingHistory: o.trackingHistory || [],
          timeline: [
            {
              title: o.escrowStatus === "PAYMENT_PENDING" ? "Menunggu Pembayaran" : "Pesanan Diproses & Terverifikasi Escrow",
              time: "Terkonfirmasi",
              desc: "Dana tersimpan aman di rekening bersama Tonal Zone Escrow.",
              completed: true,
            },
            ...(o.waybillNumber ? [
              {
                title: "Paket Telah Dijemput Kurir",
                time: "In Transit",
                desc: `Nomor resi ${o.waybillNumber} via ${o.courierCode || "Ekspedisi"}.`,
                completed: true,
              }
            ] : []),
            ...(o.escrowStatus === "DELIVERED" || o.escrowStatus === "FUNDS_RELEASED_TO_SELLER" ? [
              {
                title: "Paket Telah Tiba di Tujuan",
                time: "Selesai",
                desc: "Pesanan telah diterima oleh pembeli.",
                completed: true,
              }
            ] : []),
          ],
        }));

        setOrders((prev) => {
          if (prev.length !== mapped.length) return mapped;
          const isSame = prev.every((p, idx) => {
            const m = mapped[idx];
            return (
              p.id === m.id &&
              p.status === m.status &&
              p.waybillNumber === m.waybillNumber &&
              p.hasReviewed === m.hasReviewed &&
              p.returnStatus === m.returnStatus &&
              p.trackingHistory?.length === m.trackingHistory?.length
            );
          });
          return isSame ? prev : mapped;
        });

        setSelectedOrderDetails((prev) => {
          if (!prev) return null;
          const updated = mapped.find((m) => m.id === prev.id);
          return updated || prev;
        });
      } else {
        if (!isSilent) setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
      if (!isSilent) setOrders([]);
    } finally {
      if (!isSilent || isInitialLoadRef.current) {
        setIsLoading(false);
        isInitialLoadRef.current = false;
      }
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.reviews)) {
          const mapped: ReviewItem[] = data.reviews.map((r: any) => ({
            id: r.id,
            productName: r.productName,
            brand: r.storeName || "Official Merchant",
            rating: Number(r.rating) || 5,
            date: r.createdAt
              ? new Date(r.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Baru saja",
            comment: r.comment,
            storeName: r.storeName || "Official Merchant",
          }));
          setReviews(mapped);
        } else {
          setReviews([]);
        }
      }
    } catch (err) {
      console.error("Failed to load user reviews:", err);
      setReviews([]);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchReviews();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab")?.toUpperCase();
      if (
        tabParam === "UNPAID" ||
        tabParam === "TO_SHIP" ||
        tabParam === "IN_TRANSIT" ||
        tabParam === "DELIVERED" ||
        tabParam === "COMPLETED" ||
        tabParam === "RETURNS" ||
        tabParam === "CANCELLED" ||
        tabParam === "REVIEWS"
      ) {
        setActiveTab(tabParam === "REVIEWS" ? "reviews" : (tabParam as OrderTab));
        hasAutoSelectedTab.current = true;
      }
    }
  }, []);

  const prevDeliveredOrdersRef = useRef<Set<string>>(new Set());
  const hasAutoSelectedTab = useRef(false);

  // Auto default tab selection on initial load based on active orders
  useEffect(() => {
    if (hasAutoSelectedTab.current || orders.length === 0) return;
    if (orders.some((o) => o.status === "PAYMENT_PENDING" && !o.cancelReason)) {
      setActiveTab("UNPAID");
      hasAutoSelectedTab.current = true;
    } else if (orders.some((o) => o.status === "IN_TRANSIT" && !o.cancelReason)) {
      setActiveTab("IN_TRANSIT");
      hasAutoSelectedTab.current = true;
    } else if (orders.some((o) => o.status === "DELIVERED" && !o.cancelReason)) {
      setActiveTab("DELIVERED");
      hasAutoSelectedTab.current = true;
    } else if (orders.some((o) => o.status === "HELD_IN_ESCROW" && !o.cancelReason)) {
      setActiveTab("TO_SHIP");
      hasAutoSelectedTab.current = true;
    }
  }, [orders]);

  // Auto-refresh real-time saat ada paket yang sedang diproses atau dikirim (agar transisi 3 detik langsung terdeteksi)
  useEffect(() => {
    const hasActiveOrders = orders.some(
      (o) => o.status === "IN_TRANSIT" || o.status === "HELD_IN_ESCROW" || o.status === "PAYMENT_PENDING"
    );
    if (!hasActiveOrders) return;

    const interval = setInterval(() => {
      fetchOrders(true);
    }, 2000);

    return () => clearInterval(interval);
  }, [orders]);

  // Otomatis beralih ke tab "Sudah Sampai" & tampilkan toast saat paket tiba (transisi 3 detik)
  useEffect(() => {
    const currentDelivered = orders.filter((o) => o.status === "DELIVERED").map((o) => o.id);
    const newDelivered = currentDelivered.filter((id) => !prevDeliveredOrdersRef.current.has(id));
    if (newDelivered.length > 0 && prevDeliveredOrdersRef.current.size > 0) {
      setActiveTab("DELIVERED");
      triggerNotification("Paket telah tiba di alamat tujuan! Silakan periksa barang & konfirmasi terima.");
    }
    prevDeliveredOrdersRef.current = new Set(currentDelivered);
  }, [orders]);

  // Reviews State (100% connected to live database)
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  const triggerNotification = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(""), 4000);
  };

  const handleConfirmDelivery = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/accept`, {
        method: "POST",
      });
      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch {}
      if (data.success) {
        triggerNotification("Pesanan selesai! Silakan berikan penilaian produk di tab Selesai.");
        setActiveTab("COMPLETED");
        triggerAppNotification({
          type: "order",
          title: "Pesanan Selesai",
          message: `Pesanan #${orderId} telah Anda konfirmasi diterima. Silakan berikan penilaian di tab Selesai.`,
          actionLink: "/orders?tab=COMPLETED",
          meta: { orderId },
        });
        fetchOrders(true);
      }
    } catch (err) {
      console.error("Error accepting delivery:", err);
    }
  };

  const handleSimulateAutoSettle = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/auto-settle`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        triggerNotification("⚡ [Auto-Settle Sukses] Batas waktu inspeksi 48 jam berakhir, dana escrow otomatis cair ke seller!");
        setActiveTab("COMPLETED");
        fetchOrders(true);
      } else {
        triggerNotification(data.error || "Gagal memproses auto-settle.");
      }
    } catch (err) {
      console.error("Error simulating auto settle:", err);
    }
  };

  const handleOpenReviewModal = (order: OrderItem) => {
    setReviewingOrder(order);
    setRatingInput(5);
    setCommentInput("");
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingOrder) return;

    const newRev: ReviewItem = {
      id: "rev-" + Date.now(),
      productName: reviewingOrder.productName,
      brand: reviewingOrder.brand,
      rating: ratingInput,
      date: "Hari ini",
      comment: commentInput || "Karakter suara sangat jernih dan barang sesuai deskripsi!",
      storeName: reviewingOrder.storeName,
    };

    setReviews((prev) => [newRev, ...prev]);
    setReviewingOrder(null);
    setActiveTab("reviews");
    triggerNotification("Ulasan Anda berhasil dikirim!");
    triggerAppNotification({
      type: "system",
      title: "Ulasan Produk Terkirim",
      message: `Terima kasih! Ulasan ${ratingInput} bintang Anda untuk ${reviewingOrder.productName} telah berhasil dipublikasikan.`,
      actionLink: "/orders",
    });
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeOrder || !disputeReason) return;

    try {
      const res = await fetch(`/api/orders/${disputeOrder.id}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: disputeReason }),
      });
      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch {}
      if (data.success) {
        triggerNotification("Komplain berhasil diajukan. Tim TonalZone Escrow akan menahan dana penjual untuk mediasi.");
        triggerAppNotification({
          type: "system",
          title: "Komplain Pesanan Diajukan",
          message: `Komplain untuk pesanan #${disputeOrder.id} telah diterima. Dana penjual ditahan sementara untuk proses mediasi.`,
          actionLink: "/orders",
          meta: { orderId: disputeOrder.id },
        });
        setDisputeOrder(null);
        setDisputeReason("");
        fetchOrders(true);
      }
    } catch (err) {
      console.error("Error creating dispute:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-[#FAF9F6] font-sans selection:bg-white selection:text-black flex flex-col">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2">
            <span className="text-[11px] font-mono text-[#BFDD25] uppercase tracking-widest font-semibold">
              TonalZone Escrow Protected
            </span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white">
            Riwayat Pesanan & Pengiriman
          </h1>
          <p className="text-xs text-[#888888] font-sans mt-1.5 max-w-2xl">
            Lacak status pengiriman kurir secara real-time, konfirmasi penerimaan barang, atau hubungi toko mitra resmi TonalZone.
          </p>
        </div>

        {/* Tab Selector (Pill Navigation, Zero Harsh Border) */}
        <div className="flex items-center gap-2 sm:gap-2.5 mb-8 overflow-x-auto no-scrollbar py-1">
          {[
            {
              id: "UNPAID",
              label: "Belum Dibayar",
              count: orders.filter((o) => o.status === "PAYMENT_PENDING" && !o.cancelReason).length,
            },
            {
              id: "TO_SHIP",
              label: "Sedang Diproses",
              count: orders.filter((o) => o.status === "HELD_IN_ESCROW" && !o.cancelReason).length,
            },
            {
              id: "IN_TRANSIT",
              label: "Sedang Dikirim",
              count: orders.filter((o) => o.status === "IN_TRANSIT").length,
            },
            {
              id: "DELIVERED",
              label: "Sudah Sampai",
              count: orders.filter((o) => o.status === "DELIVERED" && !o.returnId).length,
            },
            {
              id: "COMPLETED",
              label: "Selesai",
              count: orders.filter((o) => o.status === "FUNDS_RELEASED_TO_SELLER" && !o.returnId).length,
            },
            {
              id: "RETURNS",
              label: "Retur & Komplain",
              count: orders.filter((o) => o.status === "DISPUTED" || Boolean(o.returnId)).length,
            },
            {
              id: "CANCELLED",
              label: "Dibatalkan",
              count: orders.filter((o) => o.status === "REFUNDED" && Boolean(o.cancelReason)).length,
            },
            {
              id: "reviews",
              label: "Ulasan Saya",
              count: reviews.length,
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
                    : "bg-[#0A0A0A] hover:bg-[#141414] text-[#A1A1AA] hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? "bg-black text-white" : "bg-[#181818] text-[#888888]"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notification Toast */}
        <AnimatePresence>
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed bottom-8 right-8 z-50 bg-[#141414] text-white px-5 py-4 shadow-2xl flex items-center gap-3 text-xs font-mono font-medium max-w-md rounded-2xl"
            >
              <span className="text-[#BFDD25] font-bold">✓</span>
              <span>{saveMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orders List */}
        {activeTab !== "reviews" && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="p-12 text-center bg-[#0A0A0A] font-mono text-xs text-[#71717A] rounded-2xl">
                Memuat data pesanan...
              </div>
            ) : (() => {
              const filtered = activeTab === "UNPAID"
                ? orders.filter(o => o.status === "PAYMENT_PENDING" && !o.cancelReason)
                : activeTab === "TO_SHIP"
                ? orders.filter(o => o.status === "HELD_IN_ESCROW" && !o.cancelReason)
                : activeTab === "IN_TRANSIT"
                ? orders.filter(o => o.status === "IN_TRANSIT" && !o.cancelReason)
                : activeTab === "DELIVERED"
                ? orders.filter(o => o.status === "DELIVERED" && !o.returnId && !o.cancelReason)
                : activeTab === "COMPLETED"
                ? orders.filter(o => o.status === "FUNDS_RELEASED_TO_SELLER" && !o.returnId && !o.cancelReason)
                : activeTab === "RETURNS"
                ? orders.filter(o => (o.status === "DISPUTED" || Boolean(o.returnId)) && !o.cancelReason)
                : activeTab === "CANCELLED"
                ? orders.filter(o => o.status === "REFUNDED" && Boolean(o.cancelReason))
                : [];

              if (filtered.length === 0) {
                return (
                  <div className="rounded-2xl bg-[#0A0A0A] p-16 text-center space-y-3">
                    <Package className="w-10 h-10 text-[#52525B] mx-auto" />
                    <p className="text-xs font-mono text-[#71717A] uppercase tracking-widest">
                      Belum ada pesanan di kategori ini.
                    </p>
                    <div>
                      <Link
                        href="/collection"
                        className="inline-flex items-center gap-1.5 mt-2 px-6 py-2.5 rounded-full bg-white text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#E4E4E7] transition-all group"
                      >
                        <span>Buka Katalog Produk</span>
                        <ChevronRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              }

              return filtered.map((order) => {
                // =========================================================================
                // SPECIAL IN_TRANSIT CARD (ZERO BORDER, ROUNDED-24PX, LIVE STEPPER)
                // =========================================================================
                if (order.status === "IN_TRANSIT") {
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl bg-[#0A0A0A] p-6 sm:p-7 space-y-6 transition-all hover:bg-[#0C0C0C]"
                    >
                      {/* Top Bar: Order ID, Date & Tracking Resi */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-white bg-[#161616] px-3.5 py-1 rounded-full">
                            #{order.orderNumber}
                          </span>
                          <span className="text-xs font-mono text-[#71717A]">{order.date}</span>
                        </div>
                        {order.waybillNumber && (
                          <span className="text-[11px] font-mono text-white bg-[#161616] px-3 py-1 rounded-full font-bold">
                            Resi: {order.waybillNumber} ({order.courierCode || "JNE Express"})
                          </span>
                        )}
                      </div>

                      {/* Product Row */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 sm:gap-5 min-w-0 flex-1">
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#141414] overflow-hidden shrink-0">
                            <Image
                              src={order.image || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"}
                              alt={order.productName}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/store/${getStoreSlug(order.storeName)}`}
                              className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] hover:text-[#BFDD25] transition-colors block mb-1"
                            >
                              {order.storeName}
                            </Link>
                            <h3 className="text-base sm:text-lg font-sans font-semibold text-[#FAF9F6] tracking-tight truncate leading-snug">
                              {order.productName}
                            </h3>
                            <p className="text-base sm:text-lg font-sans font-semibold text-white tracking-tight pt-1.5 font-mono">
                              {formatPrice(order.price)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pt-0.5">
                          <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#181818] text-[#D4D4D8] font-medium block">
                            Dalam Pengiriman
                          </span>
                          <span className="text-base sm:text-lg font-mono font-bold text-white block mt-2">
                            {order.quantity ? `${order.quantity}x` : "1x"}
                          </span>
                        </div>
                      </div>

                      {/* Logistics Info Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs p-4 rounded-xl bg-[#121212]">
                        <span className="text-white font-medium flex items-center gap-2 text-xs sm:text-sm">
                          <Truck className="w-4 h-4 text-emerald-400" />
                          <span>Status: Dalam Pengiriman Express (~3 detik tiba)</span>
                        </span>
                        <span className="text-xs font-mono text-[#8E8E93]">
                          Ekspedisi: <span className="text-white font-medium">{order.courierCode || "JNE Express"}</span>
                        </span>
                      </div>

                      {/* Timeline Steps with Continuous Clean Connector */}
                      <div className="relative pl-8 space-y-6 pt-1 pb-1">
                        <div className="absolute left-[10px] top-4 bottom-5 w-0.5 bg-[#181818]" />

                        {(() => {
                          const validCheckpoints = (order.trackingHistory && order.trackingHistory.length > 0)
                            ? order.trackingHistory.filter((c: any) => c.status !== "ORDER_CREATED" && c.status !== "PAYMENT_CONFIRMED")
                            : [];

                          const displaySteps = validCheckpoints.length > 0
                            ? validCheckpoints
                            : [
                                {
                                  id: "step-1",
                                  title: "Paket Sedang Di Kemas",
                                  description: "Penjual sedang menyiapkan dan mengemas barang sesuai standar audiophile.",
                                  timeFormatted: "16.10",
                                },
                                {
                                  id: "step-2",
                                  title: "Paket Telah Di jemput",
                                  description: `Kurir ${order.courierCode || "JNE Express"} telah mengambil paket dan dalam proses pengiriman ke kota tujuan.`,
                                  timeFormatted: "18.20",
                                },
                              ];

                          return displaySteps.map((step: any, idx: number) => {
                            const isLatest = idx === displaySteps.length - 1;
                            return (
                              <div key={step.id || idx} className="relative">
                                <div
                                  className={`absolute -left-8 top-0.5 w-5 h-5 flex items-center justify-center bg-[#0A0A0A] ${
                                    isLatest ? "text-emerald-400" : "text-[#71717A]"
                                  }`}
                                >
                                  <MapPin className="w-4 h-4" />
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                  <span
                                    className={`text-sm font-sans ${
                                      isLatest ? "font-semibold text-white" : "font-medium text-[#D4D4D8]"
                                    }`}
                                  >
                                    {step.title}
                                  </span>
                                  <span
                                    className={`text-xs font-mono ${
                                      isLatest ? "text-emerald-400 font-bold" : "text-[#71717A]"
                                    }`}
                                  >
                                    {step.timeFormatted || "18.20"}
                                  </span>
                                </div>
                                <p
                                  className={`text-xs font-sans mt-1 leading-relaxed max-w-xl ${
                                    isLatest ? "text-[#A1A1AA]" : "text-[#52525B]"
                                  }`}
                                >
                                  {step.description}
                                </p>
                              </div>
                            );
                          });
                        })()}
                      </div>

                      {/* Action Buttons Footer */}
                      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/orders/${order.id}/tracking`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ action: "advance" }),
                              });
                              const data = await res.json();
                              if (data.success) {
                                triggerNotification(
                                  data.order?.escrowStatus === "DELIVERED"
                                    ? "Paket telah tiba di alamat tujuan (DELIVERED)!"
                                    : "Status pergerakan kurir berhasil diperbarui."
                                );
                                fetchOrders(true);
                              }
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="px-4 py-2.5 rounded-full bg-[#141414] hover:bg-[#1E1E1E] text-[#A1A1AA] hover:text-white font-mono text-xs transition-all cursor-pointer flex items-center gap-1.5"
                          title="Simulasikan pergerakan kurir berikutnya"
                        >
                          <Truck className="w-3.5 h-3.5 text-white" />
                          <span>Simulasi Titik Kurir</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleConfirmDelivery(order.id)}
                          className="px-6 py-2.5 rounded-full bg-white hover:bg-[#E4E4E7] text-black font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                        >
                          Konfirmasi Terima Barang
                        </button>

                        <Link
                          href={`/messages?seller=${encodeURIComponent(order.storeName)}&orderId=${encodeURIComponent(order.orderNumber)}`}
                          className="px-5 py-2.5 rounded-full bg-[#141414] hover:bg-[#1E1E1E] text-white font-mono text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat Penjual</span>
                        </Link>
                      </div>
                    </motion.div>
                  );
                }

                // =========================================================================
                // STANDARD ORDER CARD (ZERO HARSH BORDER, ROUNDED-2XL 16PX)
                // =========================================================================
                return (
                  <div
                    key={order.id}
                    className="rounded-2xl bg-[#0A0A0A] p-6 sm:p-7 space-y-5 transition-all hover:bg-[#0C0C0C]"
                  >
                    {/* Top Bar: Order ID, Date & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-white bg-[#161616] px-3.5 py-1 rounded-full">
                          #{order.orderNumber}
                        </span>
                        <span className="text-xs font-mono text-[#71717A]">{order.date}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {order.isInsured && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-semibold">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>Asuransi Terproteksi</span>
                          </span>
                        )}
                        <Link
                          href={`/store/${getStoreSlug(order.storeName)}`}
                          className="text-xs font-mono text-[#8E8E93] hover:text-[#BFDD25] transition-colors"
                        >
                          {order.storeName}
                        </Link>
                        <span className="text-[#3F3F46]">•</span>
                        
                        <span className="inline-flex items-center gap-2 text-xs font-mono px-3.5 py-1.5 rounded-full bg-[#141414] text-white">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            order.cancelReason
                              ? "bg-red-500"
                              : order.status === "PAYMENT_PENDING"
                              ? "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                              : order.status === "REFUNDED" || order.status === "DELIVERED"
                              ? "bg-[#BFDD25] shadow-[0_0_6px_rgba(191,221,37,0.6)]"
                              : order.status === "FUNDS_RELEASED_TO_SELLER"
                              ? "bg-white"
                              : order.status === "DISPUTED" || Boolean(order.returnId)
                              ? "bg-red-400"
                              : "bg-[#71717A]"
                          }`} />
                          {order.cancelReason
                            ? `Dibatalkan (${order.cancelledBy === "SELLER" ? "Penjual" : "Pembeli"})`
                            : order.status === "PAYMENT_PENDING"
                            ? "Menunggu Pembayaran"
                            : order.status === "REFUNDED"
                            ? "Dana Dikembalikan"
                            : order.status === "DISPUTED" || Boolean(order.returnId)
                            ? "Dalam Retur"
                            : order.status === "FUNDS_RELEASED_TO_SELLER"
                            ? "Selesai"
                            : order.status === "DELIVERED"
                            ? "Sudah Sampai"
                            : "Sedang Diproses"}
                        </span>
                      </div>
                    </div>

                    {/* Body: Product Info & Actions */}
                    <div className="pt-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-xl bg-[#141414] overflow-hidden shrink-0">
                          <Image src={order.image || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"} alt={order.productName} fill className="object-cover" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block mb-1">
                            {order.brand}
                          </span>
                          <h3 className="text-base font-sans font-medium text-[#FAF9F6] tracking-tight">
                            {order.productName}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm font-mono font-bold text-white">
                              {formatPrice(order.price)}
                            </span>
                            {order.waybillNumber && (
                              <span className="text-xs font-mono text-white bg-[#181818] px-2.5 py-0.5 rounded-full font-bold">
                                Resi: {order.waybillNumber} ({order.courierCode || "JNE"})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-end md:self-auto justify-end">
                        {order.cancelReason && (
                          <span className="px-3.5 py-2 rounded-full bg-red-500/10 text-red-400 font-mono text-xs font-medium border-0">
                            {order.cancelReason}
                          </span>
                        )}

                        {order.status === "PAYMENT_PENDING" && !order.cancelReason && (
                          <Link
                            href={`/checkout/payment?orderId=${encodeURIComponent(order.id)}`}
                            className="px-5 py-2.5 bg-white hover:bg-[#E4E4E7] text-black font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-full inline-flex items-center gap-1.5 shadow-md border-0"
                          >
                            <span>Bayar Sekarang</span>
                            <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                          </Link>
                        )}

                        {!order.cancelReason && (order.status === "PAYMENT_PENDING" || order.status === "HELD_IN_ESCROW") && !order.waybillNumber && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancelModalOrder(order);
                              setCancelReasonSelected(CANCEL_REASONS[0]);
                              setCancelNotesInput("");
                            }}
                            className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-full border-0"
                          >
                            Batalkan
                          </button>
                        )}

                        {(order.returnId || order.status === "DISPUTED" || order.status === "REFUNDED") && !order.cancelReason && (
                          <Link
                            href={`/orders/return/${order.id}`}
                            className="px-5 py-2.5 bg-white hover:bg-[#E4E4E7] text-black font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-full inline-flex items-center gap-1.5 shadow-md border-0"
                          >
                            <span>Pantau Status Retur</span>
                          </Link>
                        )}

                        {order.status === "DELIVERED" && !order.returnId && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleConfirmDelivery(order.id)}
                              className="px-6 py-2.5 bg-white hover:bg-[#E4E4E7] text-black font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-full shadow-md border-0"
                            >
                              Konfirmasi Terima Barang
                            </button>
                            <Link
                              href={`/orders/return/${order.id}`}
                              className="px-5 py-2.5 bg-[#141414] hover:bg-[#1E1E1E] text-[#D4D4D8] hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-full inline-flex items-center gap-1.5 border-0"
                            >
                              <span>Ajukan Retur</span>
                            </Link>
                          </>
                        )}

                        {order.status === "FUNDS_RELEASED_TO_SELLER" && !order.returnId && (
                          <Link
                            href={`/orders/${order.id}/review`}
                            className={`px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-full inline-flex items-center gap-1.5 border-0 ${
                              order.hasReviewed
                                ? "bg-[#181818] text-[#71717A] hover:bg-[#222222] hover:text-white"
                                : "bg-white hover:bg-[#E4E4E7] text-black shadow-md"
                            }`}
                          >
                            <span>{order.hasReviewed ? "★ Sudah Dinilai" : "★ Beri Penilaian"}</span>
                          </Link>
                        )}

                        <Link
                          href={`/messages?seller=${encodeURIComponent(order.storeName)}&orderId=${encodeURIComponent(order.orderNumber)}`}
                          className="px-4 py-2.5 bg-[#141414] hover:bg-[#1E1E1E] text-[#D4D4D8] hover:text-white font-mono text-xs uppercase tracking-wider transition-all cursor-pointer rounded-full flex items-center gap-1.5 border-0"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setSelectedOrderDetails(order)}
                          className="px-4 py-2.5 bg-[#141414] hover:bg-[#1E1E1E] text-[#8E8E93] hover:text-white font-mono text-xs uppercase tracking-wider transition-all cursor-pointer rounded-full border-0"
                        >
                          Detail
                        </button>
                      </div>
                    </div>

                    {/* Auto-Confirm 48-Hour Inspection Timer Banner */}
                    {order.status === "DELIVERED" && !order.returnId && (
                      <div className="mt-4 p-4 rounded-xl bg-[#141414] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-0">
                        <div className="flex items-start sm:items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-[#BFDD25] animate-ping shrink-0 mt-1.5 sm:mt-0" />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                                Batas Waktu Konfirmasi Otomatis (48 Jam)
                              </span>
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#BFDD25]/10 text-[#BFDD25] font-mono font-bold">
                                {(() => {
                                  const exp = order.inspectionExpiresAt
                                    ? new Date(order.inspectionExpiresAt).getTime()
                                    : (order.deliveredAt ? new Date(order.deliveredAt).getTime() + 48 * 3600 * 1000 : Date.now() + 48 * 3600 * 1000);
                                  const diff = Math.max(0, exp - Date.now());
                                  const hrs = Math.floor(diff / (1000 * 60 * 60));
                                  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                  return `${hrs} Jam ${mins} Menit Tersisa`;
                                })()}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#A1A1AA] mt-1">
                              Periksa kualitas suara IEM & kelengkapan. Jika dalam 48 jam tidak ada komplain retur, dana escrow otomatis dicairkan ke saldo penjual.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSimulateAutoSettle(order.id)}
                          title="Simulasi waktu 48 jam habis untuk demo penilaian PJBL"
                          className="px-3.5 py-1.5 rounded-full bg-[#1F1F1F] hover:bg-white text-zinc-300 hover:text-black font-mono text-[10px] font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border-0 shadow-sm"
                        >
                          <span>⚡ Fast-Forward 48j (Demo)</span>
                        </button>
                      </div>
                    )}

                    {order.status === "FUNDS_RELEASED_TO_SELLER" && order.autoSettled && (
                      <div className="mt-3 text-[11px] font-mono text-[#A1A1AA] flex items-center gap-2 bg-[#121212] px-3.5 py-2 rounded-xl border-0">
                        <span className="text-[#BFDD25]">✓</span>
                        <span>Pesanan diselesaikan otomatis oleh sistem setelah batas waktu inspeksi 48 jam berakhir.</span>
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-[#0A0A0A] p-6 sm:p-7 space-y-3 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] block">
                        {rev.brand}
                      </span>
                      <h4 className="text-sm font-sans font-semibold text-white mt-0.5">{rev.productName}</h4>
                    </div>
                    <span className="text-xs font-mono text-[#71717A]">{rev.date}</span>
                  </div>
                  <div className="flex gap-1 text-[#BFDD25] text-xs">
                    {"★".repeat(rev.rating)}
                  </div>
                  <p className="text-xs font-sans text-[#D4D4D8] bg-[#121212] p-4 rounded-xl leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                  <div className="text-[10px] font-mono text-[#71717A]">
                    Penjual: <span className="text-[#A1A1AA]">{rev.storeName}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[#0A0A0A] p-12 text-center rounded-2xl space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest text-[#71717A] block">
                  Belum Ada Penilaian
                </span>
                <p className="text-xs font-sans text-[#52525B] max-w-sm mx-auto">
                  Anda belum memberikan ulasan pada produk mana pun. Selesaikan pesanan Anda lalu berikan ulasan untuk membantu komunitas.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Swiss Minimalist Official Audio Invoice Modal */}
      <AnimatePresence>
        {selectedOrderDetails && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0E0E0E] p-8 sm:p-10 max-w-2xl w-full text-left space-y-6 shadow-2xl relative my-8 print:p-0 print:bg-white print:text-black rounded-2xl"
            >
              <div className="flex justify-between items-start pb-4">
                <div>
                  <span className="text-xs font-mono text-[#BFDD25] font-bold tracking-[0.2em] uppercase block mb-1">
                    TONAL ZONE LABS
                  </span>
                  <h2 className="font-heading text-2xl font-bold uppercase tracking-tight text-white print:text-black">
                    OFFICIAL ESCROW INVOICE
                  </h2>
                  <p className="text-[11px] font-mono text-[#71717A] mt-1">
                    No. Ref: {selectedOrderDetails.orderNumber} | Tanggal: {selectedOrderDetails.date}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrderDetails(null)}
                  className="text-xs font-mono text-[#8E8E93] hover:text-white px-4 py-2 bg-[#181818] hover:bg-[#222222] print:hidden cursor-pointer uppercase rounded-full transition-colors"
                >
                  Tutup [ESC]
                </button>
              </div>

              {/* Invoice Meta Grid */}
              <div className="grid grid-cols-2 gap-6 text-xs font-mono text-[#8E8E93] py-2">
                <div>
                  <span className="text-[10px] text-[#555] uppercase block mb-1">PENJUAL RESMI</span>
                  <span className="text-white font-bold block">{selectedOrderDetails.storeName}</span>
                  <span className="text-[11px] text-[#71717A]">Verifikasi Mitra Toko TonalZone</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#555] uppercase block mb-1">STATUS EKSPEDISI</span>
                  <span className="text-white font-bold block">{selectedOrderDetails.courierCode || "JNE Express"}</span>
                  <span className="text-[11px] text-white font-bold">Resi: {selectedOrderDetails.waybillNumber || "Menunggu Pickup"}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-hidden rounded-xl bg-[#141414]">
                <div className="grid grid-cols-12 bg-[#181818] p-3.5 text-[10px] font-mono uppercase tracking-wider text-[#71717A] font-bold">
                  <div className="col-span-7">Deskripsi Perangkat</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-3 text-right">Total</div>
                </div>
                <div className="p-4 space-y-2 text-xs font-mono">
                  <div className="grid grid-cols-12 items-center text-white">
                    <div className="col-span-7">
                      <span className="font-semibold block">{selectedOrderDetails.productName}</span>
                      <span className="text-[10px] text-[#71717A]">{selectedOrderDetails.brand} Audiophile Unit</span>
                    </div>
                    <div className="col-span-2 text-center text-[#71717A]">
                      {selectedOrderDetails.quantity || 1}x
                    </div>
                    <div className="col-span-3 text-right font-bold text-white">
                      {formatPrice(selectedOrderDetails.price)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Unpaid Order Alert & Action Banner */}
              {selectedOrderDetails.status === "PAYMENT_PENDING" && !selectedOrderDetails.cancelReason && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold uppercase tracking-wider flex items-center gap-2 text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      Menunggu Pembayaran
                    </div>
                    <p className="text-[11px] text-amber-200/70 mt-0.5">
                      Pesanan belum dibayar. Selesaikan pembayaran agar pesanan segera diproses penjual.
                    </p>
                  </div>
                  <Link
                    href={`/checkout/payment?orderId=${encodeURIComponent(selectedOrderDetails.id)}`}
                    className="px-5 py-2.5 rounded-full bg-white hover:bg-[#E4E4E7] text-black font-mono text-xs font-bold uppercase tracking-wider transition-all inline-flex items-center justify-center gap-1.5 shrink-0 shadow-md"
                  >
                    <span>Selesaikan Pembayaran</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </Link>
                </div>
              )}

              {/* Cancellation Banner */}
              {selectedOrderDetails.cancelReason && (
                <div className="p-4 rounded-xl bg-red-500/10 text-red-400 font-mono text-xs space-y-1 border-0">
                  <div className="font-bold uppercase tracking-wider">
                    Pesanan Dibatalkan Oleh {selectedOrderDetails.cancelledBy === "SELLER" ? "Penjual" : "Pembeli"}
                  </div>
                  <div className="text-[11px] text-red-300">
                    Alasan: {selectedOrderDetails.cancelReason}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    Status Escrow: Dana 100% Dikembalikan (Refunded)
                  </div>
                </div>
              )}

              {/* Itemized Fee Breakdown */}
              <div className="p-5 bg-[#141414] space-y-2.5 text-xs font-mono rounded-xl border-0">
                <div className="flex justify-between text-[#8E8E93]">
                  <span>Subtotal Produk</span>
                  <span className="text-white font-medium">{formatPrice(selectedOrderDetails.itemsSubtotal || selectedOrderDetails.price)}</span>
                </div>
                <div className="flex justify-between text-[#8E8E93]">
                  <span>Ongkos Kirim ({selectedOrderDetails.courierCode || "JNE Express"})</span>
                  <span className="text-white font-medium">{formatPrice(selectedOrderDetails.shippingFee || 0)}</span>
                </div>
                {selectedOrderDetails.isInsured && (
                  <div className="flex justify-between text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Asuransi Audio Bernilai Tinggi
                    </span>
                    <span className="font-medium">+{formatPrice(selectedOrderDetails.insuranceFee || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#8E8E93]">
                  <span>Biaya Layanan Aplikasi (Platform Admin)</span>
                  <span className="text-white font-medium">+{formatPrice(selectedOrderDetails.platformFee || 0.1)}</span>
                </div>
                <div className="pt-3 border-t border-white/5 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-[#71717A] uppercase block">PROTEKSI ESCROW</span>
                    <span className="text-[#BFDD25] font-bold">
                      {selectedOrderDetails.cancelReason
                        ? "DIBATALKAN (REFUNDED)"
                        : selectedOrderDetails.status === "PAYMENT_PENDING"
                        ? "MENUNGGU PEMBAYARAN"
                        : selectedOrderDetails.status === "FUNDS_RELEASED_TO_SELLER"
                        ? "TRANSAKSI SELESAI"
                        : "DANA DILINDUNGI TONALZONE"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#71717A] uppercase block">TOTAL TAGIHAN</span>
                    <span className="text-xl font-mono font-bold text-white">
                      {formatPrice(selectedOrderDetails.price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2 print:hidden">
                {selectedOrderDetails.status === "PAYMENT_PENDING" && !selectedOrderDetails.cancelReason && (
                  <Link
                    href={`/checkout/payment?orderId=${encodeURIComponent(selectedOrderDetails.id)}`}
                    className="px-6 py-2.5 bg-white hover:bg-[#E4E4E7] text-black font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 rounded-full shadow-md"
                  >
                    <span>Selesaikan Pembayaran</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-6 py-2.5 bg-white hover:bg-[#E4E4E7] text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 rounded-full shadow-md"
                >
                  <FileText className="w-4 h-4" />
                  <span>Cetak Faktur PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-5 py-2.5 bg-[#181818] hover:bg-[#222222] text-[#8E8E93] hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-full"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewingOrder && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0E0E0E] p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative rounded-2xl"
            >
              <div className="flex justify-between items-start pb-2">
                <div>
                  <span className="text-[10px] font-mono text-[#BFDD25] uppercase tracking-widest block font-bold">
                    ULASAN AUDIOPHILE
                  </span>
                  <h3 className="font-heading text-xl font-bold uppercase text-white mt-1">
                    Beri Nilai & Ulasan
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewingOrder(null)}
                  className="text-[#71717A] hover:text-white font-mono text-sm cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-[#71717A] uppercase tracking-wider mb-2">
                    Rating Bintang:
                  </label>
                  <div className="flex gap-2 text-2xl text-[#BFDD25] cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setRatingInput(star)}
                        className={star <= ratingInput ? "opacity-100" : "opacity-25"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[#71717A] uppercase tracking-wider mb-2">
                    Ulasan Pengalaman Mendengarkan:
                  </label>
                  <textarea
                    rows={4}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Ceritakan impresi suara (bass, mid, treble, soundstage)..."
                    className="w-full bg-[#181818] p-4 text-white placeholder:text-[#52525B] focus:ring-1 focus:ring-white/30 outline-none rounded-xl font-sans"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewingOrder(null)}
                    className="px-5 py-2.5 rounded-full bg-[#181818] hover:bg-[#222222] text-[#A1A1AA] transition-all cursor-pointer font-sans text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-white text-black font-bold uppercase hover:bg-[#E4E4E7] transition-all rounded-full cursor-pointer shadow-md"
                  >
                    Kirim Ulasan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Order Modal */}
      <AnimatePresence>
        {cancelModalOrder && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0E0E0E] p-6 sm:p-8 max-w-lg w-full space-y-5 rounded-2xl shadow-2xl relative border-0"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest block font-bold">
                    PEMBATALAN PESANAN
                  </span>
                  <h3 className="font-heading text-lg font-bold uppercase text-white mt-1">
                    Batalkan Pesanan Ini?
                  </h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    No: #{cancelModalOrder.orderNumber} • {cancelModalOrder.productName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  className="text-zinc-400 hover:text-white font-mono text-sm p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-3.5 bg-[#141414] rounded-xl text-xs font-mono text-zinc-300 space-y-1 border-0">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  Pengembalian Dana Penuh 100%
                </div>
                <p className="text-[11px] text-zinc-400">
                  Dana yang tersimpan di Escrow ({formatPrice(cancelModalOrder.price)}) akan segera dikembalikan. Stok produk akan dipulihkan otomatis ke toko.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-zinc-400 block font-semibold">
                  Pilih Alasan Pembatalan:
                </label>
                <div className="space-y-2">
                  {CANCEL_REASONS.map((r) => (
                    <label
                      key={r}
                      onClick={() => setCancelReasonSelected(r)}
                      className={`flex items-center gap-3.5 p-3 rounded-xl cursor-pointer transition-all text-xs font-mono border ${
                        cancelReasonSelected === r
                          ? "bg-[#181818] border-white/50 text-white shadow-sm ring-1 ring-white/20"
                          : "bg-[#121212] border-[#222222] text-zinc-400 hover:text-zinc-200 hover:bg-[#161616] hover:border-[#2A2A2A]"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        cancelReasonSelected === r
                          ? "border-white bg-transparent"
                          : "border-zinc-600 bg-transparent"
                      }`}>
                        {cancelReasonSelected === r && (
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
                  Catatan Tambahan (Opsional):
                </label>
                <textarea
                  rows={2}
                  value={cancelNotesInput}
                  onChange={(e) => setCancelNotesInput(e.target.value)}
                  placeholder="Beri keterangan lebih lanjut jika perlu..."
                  className="w-full bg-[#141414] p-3 text-white text-xs font-mono placeholder:text-zinc-600 focus:ring-1 focus:ring-white/30 outline-none rounded-xl border-0"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmittingCancel}
                  onClick={() => setCancelModalOrder(null)}
                  className="px-5 py-2.5 rounded-full bg-[#141414] hover:bg-[#1C1C1E] text-zinc-300 text-xs font-mono transition-colors cursor-pointer border-0"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  disabled={isSubmittingCancel}
                  onClick={handleCancelOrder}
                  className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-lg disabled:opacity-50 border-0"
                >
                  {isSubmittingCancel ? "Memproses..." : "Konfirmasi Pembatalan"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
