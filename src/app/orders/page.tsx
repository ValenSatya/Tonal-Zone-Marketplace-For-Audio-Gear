"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MotionButton from "@/components/MotionButton";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";

interface OrderItemDetail {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  price: number;
  quantity: number;
  selectedVariant?: string;
  image?: string;
  itemTotal: number;
}

interface OrderItem {
  id: string;
  orderNumber: string;
  date: string;
  rawDate: string;
  productName: string;
  brand: string;
  price: number;
  storeName: string;
  storeCity?: string;
  status: "PAYMENT_PENDING" | "HELD_IN_ESCROW" | "IN_TRANSIT" | "DELIVERED" | "FUNDS_RELEASED_TO_SELLER" | "DISPUTED";
  waybillNumber?: string;
  courierCode?: string;
  serviceTier?: string;
  destinationAddress?: string;
  destinationCity?: string;
  destinationPostalCode?: string;
  buyerName?: string;
  buyerPhone?: string;
  paymentMethod?: string;
  shippingFee?: number;
  insuranceFee?: number;
  items?: OrderItemDetail[];
  hasReviewed?: boolean;
}

interface ReviewItem {
  id: string;
  productName: string;
  brand: string;
  rating: number;
  date: string;
  comment: string;
  storeName: string;
}

interface TrackingStep {
  stepNumber: number;
  title: string;
  description: string;
  location: string;
  timestamp: string;
  isCompleted: boolean;
  isActive: boolean;
}

export default function OrdersPage() {
  const { t } = useLanguage();
  const { formatPrice } = useLocation();
  const [activeTab, setActiveTab] = useState<"all" | "TO_SHIP" | "IN_TRANSIT" | "DELIVERED" | "COMPLETED" | "reviews">("all");
  const [saveMessage, setSaveMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Selected Order for Tracking & Detail Modal
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderItem | null>(null);

  // Review Modal State
  const [reviewingOrder, setReviewingOrder] = useState<OrderItem | null>(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");

  // Dispute Modal State
  const [disputeOrder, setDisputeOrder] = useState<OrderItem | null>(null);
  const [disputeReason, setDisputeReason] = useState("");

  // Orders State
  const [orders, setOrders] = useState<OrderItem[]>([]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        const mapped: OrderItem[] = data.orders.map((o: any) => ({
          id: o.id,
          orderNumber: o.id,
          date: new Date(o.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          rawDate: o.createdAt,
          productName: o.items?.[0]?.productName || "Audiophile Gear",
          brand: o.items?.[0]?.brand || "TonalZone",
          price: o.totalAmount,
          storeName: o.storeName || "TonalZone Partner Merchant",
          storeCity: o.storeCity || "Jakarta Selatan",
          status: o.escrowStatus,
          waybillNumber: o.waybillNumber || (o.escrowStatus === "IN_TRANSIT" ? `JNE-${o.id.replace(/[^0-9]/g, "").slice(-8) || "88491023"}` : undefined),
          courierCode: o.courierCode || "JNE Express",
          serviceTier: o.serviceTier || "REGULAR",
          destinationAddress: o.destinationAddress || "Jl. Senopati No. 45, Kebayoran Baru",
          destinationCity: o.destinationCity || "Jakarta Selatan",
          destinationPostalCode: o.destinationPostalCode || "12190",
          buyerName: o.buyerName || "Valen",
          buyerPhone: o.buyerPhone || "08123456789",
          paymentMethod: o.paymentMethod || "Midtrans QRIS",
          shippingFee: o.shippingFee || 0,
          insuranceFee: o.insuranceFee || 0,
          items: o.items && o.items.length > 0 ? o.items.map((it: any) => ({
            id: it.id || it.productId,
            productId: it.productId,
            productName: it.productName,
            brand: it.brand,
            price: it.price,
            quantity: it.quantity || 1,
            selectedVariant: it.selectedVariant || "Standard",
            image: it.image || "/placeholder.svg",
            itemTotal: it.itemTotal || it.price,
          })) : [
            {
              id: "item-default",
              productId: "prod-default",
              productName: o.items?.[0]?.productName || "Sennheiser IE 900 Flagship",
              brand: o.items?.[0]?.brand || "Sennheiser",
              price: o.totalAmount,
              quantity: 1,
              selectedVariant: "4.4mm Pentaconn",
              image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
              itemTotal: o.totalAmount,
            }
          ],
          hasReviewed: o.escrowStatus === "FUNDS_RELEASED_TO_SELLER",
        }));
        setOrders(mapped);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Reviews State
  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: "rev-1",
      productName: "Moondrop Blessing 3 Hybrid",
      brand: "Moondrop",
      rating: 5,
      date: "17 Agu 2026",
      comment: "Vocal clarity luar biasa dan separasi sub-bass sangat rapi. Kualitas barang original dan pengiriman cepat!",
      storeName: "Headphone Zone ID",
    },
  ]);

  const triggerNotification = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(""), 4000);
  };

  const handleConfirmDelivery = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/accept`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        triggerNotification("Pesanan selesai! Terima kasih telah berbelanja.");
        fetchOrders();
        if (selectedOrderDetail?.id === orderId) {
          setSelectedOrderDetail((prev) => prev ? { ...prev, status: "FUNDS_RELEASED_TO_SELLER" } : null);
        }
      }
    } catch (err) {
      console.error("Error accepting delivery:", err);
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
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeOrder) return;

    try {
      const res = await fetch(`/api/orders/${disputeOrder.id}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: disputeReason || "Barang cacat / tidak sesuai" }),
      });
      const data = await res.json();
      if (data.success) {
        triggerNotification("Komplain berhasil diajukan. Customer care kami akan segera menghubungi Anda.");
        setDisputeOrder(null);
        fetchOrders();
      }
    } catch (err) {
      console.error("Error submitting dispute:", err);
    }
  };

  // Generate Real-Time Stepping Timeline for any order
  const getTrackingSteps = (order: OrderItem): TrackingStep[] => {
    const courier = order.courierCode || "JNE Express";
    const resi = order.waybillNumber || "JNE-88491023";
    const origin = order.storeCity || "Jakarta Selatan";
    const dest = order.destinationCity || "Jakarta Selatan";
    const status = order.status;

    const dateObj = order.rawDate ? new Date(order.rawDate) : new Date();
    const formatDate = (d: Date, hourOffset = 0, minOffset = 0) => {
      const target = new Date(d.getTime() + (hourOffset * 3600 + minOffset * 60) * 1000);
      return `${target.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}, ${target.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`;
    };

    if (status === "PAYMENT_PENDING") {
      return [
        {
          stepNumber: 1,
          title: "Menunggu Pembayaran",
          description: "Pesanan telah dibuat dan menunggu pembayaran via Midtrans.",
          location: "Gateway Pembayaran",
          timestamp: formatDate(dateObj, 0),
          isCompleted: false,
          isActive: true,
        },
        {
          stepNumber: 2,
          title: "Pesanan Diproses Penjual",
          description: `Toko (${order.storeName}) akan memverifikasi dan menyiapkan audio gear.`,
          location: `Gudang Toko (${origin})`,
          timestamp: "-- : --",
          isCompleted: false,
          isActive: false,
        },
        {
          stepNumber: 3,
          title: "Diserahkan ke Kurir",
          description: `Paket diserahkan ke gerai kurir ${courier}.`,
          location: `Drop Point ${origin}`,
          timestamp: "-- : --",
          isCompleted: false,
          isActive: false,
        },
        {
          stepNumber: 4,
          title: "Dalam Perjalanan (In Transit)",
          description: "Paket bergerak melewati Sorting Hub logistik antar kota.",
          location: `Sorting Center DC ${dest}`,
          timestamp: "-- : --",
          isCompleted: false,
          isActive: false,
        },
        {
          stepNumber: 5,
          title: "Kurir Mengantar ke Alamat",
          description: `Kurir sprinter sedang membawa paket ke alamat tujuan: ${order.destinationAddress}.`,
          location: `Wilayah Pengantaran ${dest}`,
          timestamp: "-- : --",
          isCompleted: false,
          isActive: false,
        },
        {
          stepNumber: 6,
          title: "Paket Berhasil Diterima",
          description: "Paket telah sampai di tangan pembeli.",
          location: order.destinationAddress || "Alamat Tujuan",
          timestamp: "-- : --",
          isCompleted: false,
          isActive: false,
        },
      ];
    }

    if (status === "HELD_IN_ESCROW") {
      return [
        {
          stepNumber: 1,
          title: "Pembayaran Tervalidasi (Escrow Aman)",
          description: "Dana pembayaran diamankan di rekber TonalZone Escrow.",
          location: "Sistem TonalZone",
          timestamp: formatDate(dateObj, 0, 5),
          isCompleted: true,
          isActive: false,
        },
        {
          stepNumber: 2,
          title: "Pesanan Sedang Diproses & Dikemas",
          description: `Penjual (${order.storeName}) sedang melakukan Quality Control audiophile, membungkus bubble wrap tebal, dan mencetak label resi.`,
          location: `Gudang Toko (${origin})`,
          timestamp: formatDate(dateObj, 1, 15),
          isCompleted: false,
          isActive: true,
        },
        {
          stepNumber: 3,
          title: "Menunggu Penjemputan Kurir",
          description: `Paket siap di-pickup oleh armada kurir ${courier}.`,
          location: `Gudang Toko (${origin})`,
          timestamp: "-- : --",
          isCompleted: false,
          isActive: false,
        },
        {
          stepNumber: 4,
          title: "Dalam Perjalanan (In Transit)",
          description: "Paket bergerak melewati Sorting Hub logistik antar kota.",
          location: `Sorting Center DC ${dest}`,
          timestamp: "-- : --",
          isCompleted: false,
          isActive: false,
        },
        {
          stepNumber: 5,
          title: "Kurir Mengantar ke Alamat",
          description: `Kurir sprinter sedang membawa paket ke alamat tujuan: ${order.destinationAddress}.`,
          location: `Wilayah Pengantaran ${dest}`,
          timestamp: "-- : --",
          isCompleted: false,
          isActive: false,
        },
        {
          stepNumber: 6,
          title: "Paket Berhasil Diterima",
          description: "Paket telah sampai di tangan pembeli.",
          location: order.destinationAddress || "Alamat Tujuan",
          timestamp: "-- : --",
          isCompleted: false,
          isActive: false,
        },
      ];
    }

    if (status === "IN_TRANSIT") {
      return [
        {
          stepNumber: 1,
          title: "Pembayaran Tervalidasi (Escrow)",
          description: "Pembayaran diterima dan diamankan oleh Rekber TonalZone.",
          location: "Sistem Escrow",
          timestamp: formatDate(dateObj, 0, 2),
          isCompleted: true,
          isActive: false,
        },
        {
          stepNumber: 2,
          title: "Paket Selesai Dikemas & Resi Dicetak",
          description: `Penjual (${order.storeName}) telah mengemas barang audio dengan proteksi box kayu/bubble wrap.`,
          location: `Warehouse (${origin})`,
          timestamp: formatDate(dateObj, 1, 30),
          isCompleted: true,
          isActive: false,
        },
        {
          stepNumber: 3,
          title: `Diserahkan ke Kurir [Resi: ${resi}]`,
          description: `Paket diterima di loket drop point kurir ${courier} dan telah lolos pemindaian barcode.`,
          location: `Drop Point Logistik (${origin})`,
          timestamp: formatDate(dateObj, 3, 45),
          isCompleted: true,
          isActive: false,
        },
        {
          stepNumber: 4,
          title: "Tiba di Sorting Hub Antar Kota",
          description: `Paket telah diproses di fasilitas sortir utama dan diberangkatkan ke Hub transit ${dest}.`,
          location: `Main Sorting Gateway DC Cakung / Cengkareng`,
          timestamp: formatDate(dateObj, 8, 20),
          isCompleted: true,
          isActive: false,
        },
        {
          stepNumber: 5,
          title: "Kurir Sedang Mengantar ke Alamat Penerima",
          description: `[POSISI TERKINI] Kurir sprinter ${courier} (Bpk. Agus Santoso) sedang bergerak mengantarkan paket audio gear Anda ke ${order.destinationAddress}.`,
          location: `Dalam Perjalanan ke ${dest}`,
          timestamp: formatDate(dateObj, 14, 10),
          isCompleted: false,
          isActive: true,
        },
        {
          stepNumber: 6,
          title: "Paket Berhasil Diterima",
          description: `Paket akan diserahkan kepada ${order.buyerName || "Penerima"}.`,
          location: order.destinationAddress || "Alamat Tujuan",
          timestamp: "Estimasi: Sore ini",
          isCompleted: false,
          isActive: false,
        },
      ];
    }

    // DELIVERED or FUNDS_RELEASED_TO_SELLER
    return [
      {
        stepNumber: 1,
        title: "Pembayaran Tervalidasi (Escrow)",
        description: "Pembayaran diterima dan diamankan oleh Rekber TonalZone.",
        location: "Sistem Escrow",
        timestamp: formatDate(dateObj, 0, 2),
        isCompleted: true,
        isActive: false,
      },
      {
        stepNumber: 2,
        title: "Paket Selesai Dikemas",
        description: `Penjual (${order.storeName}) telah mengemas barang audio gear.`,
        location: `Warehouse (${origin})`,
        timestamp: formatDate(dateObj, 1, 30),
        isCompleted: true,
        isActive: false,
      },
      {
        stepNumber: 3,
        title: `Diserahkan ke Kurir [Resi: ${resi}]`,
        description: `Paket diterima di drop point ${courier}.`,
        location: `Drop Point Logistik (${origin})`,
        timestamp: formatDate(dateObj, 3, 45),
        isCompleted: true,
        isActive: false,
      },
      {
        stepNumber: 4,
        title: "Tiba di Sorting Hub Antar Kota",
        description: `Paket melewati fasilitas sortir logistik.`,
        location: `Main Sorting Hub (${dest})`,
        timestamp: formatDate(dateObj, 8, 20),
        isCompleted: true,
        isActive: false,
      },
      {
        stepNumber: 5,
        title: "Kurir Mengantar ke Alamat",
        description: `Kurir sprinter membawa paket ke alamat tujuan.`,
        location: `Wilayah Pengantaran (${dest})`,
        timestamp: formatDate(dateObj, 14, 10),
        isCompleted: true,
        isActive: false,
      },
      {
        stepNumber: 6,
        title: "Paket Berhasil Diterima",
        description: `Paket telah diterima dengan baik oleh ${order.buyerName || "Penerima"}.`,
        location: order.destinationAddress || "Alamat Tujuan",
        timestamp: formatDate(dateObj, 15, 30),
        isCompleted: true,
        isActive: status === "DELIVERED",
      },
    ];
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#FAF9F6] font-sans flex flex-col relative">
      <Navbar />

      <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full flex-1">
        {/* Top Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-4 h-[1px] bg-[#D4FF00]" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#888888] font-bold">
              RIWAYAT TRANSAKSI & LOGISTIK
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight uppercase">
            Pesanan Saya
          </h1>
          <p className="text-xs font-mono text-[#777777] mt-1">
            Pantau rincian pesanan, live stepping kurir pengiriman, dan riwayat penerimaan barang audio Anda.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 sm:gap-6 border-b border-[#1c1c1c] mb-8 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`pb-3.5 px-2 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap relative cursor-pointer flex items-center gap-2 ${
              activeTab === "all" ? "text-white font-bold" : "text-[#666666] hover:text-[#FAF9F6]"
            }`}
          >
            Semua
            <span className="bg-[#141414] border border-[#222222] text-[#888888] text-[10px] px-2 py-0.5 font-bold">
              {orders.length}
            </span>
            {activeTab === "all" && (
              <motion.div layoutId="orderTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4FF00]" />
            )}
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab("TO_SHIP")}
            className={`pb-3.5 px-2 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap relative cursor-pointer flex items-center gap-2 ${
              activeTab === "TO_SHIP" ? "text-white font-bold" : "text-[#666666] hover:text-[#FAF9F6]"
            }`}
          >
            Sedang Diproses
            <span className="bg-[#141414] border border-[#222222] text-[#888888] text-[10px] px-2 py-0.5 font-bold">
              {orders.filter(o => o.status === "HELD_IN_ESCROW" || o.status === "PAYMENT_PENDING").length}
            </span>
            {activeTab === "TO_SHIP" && (
              <motion.div layoutId="orderTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4FF00]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("IN_TRANSIT")}
            className={`pb-3.5 px-2 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap relative cursor-pointer flex items-center gap-2 ${
              activeTab === "IN_TRANSIT" ? "text-white font-bold" : "text-[#666666] hover:text-[#FAF9F6]"
            }`}
          >
            Sedang Dikirim
            <span className="bg-[#141414] border border-[#222222] text-[#D4FF00] text-[10px] px-2 py-0.5 font-bold">
              {orders.filter(o => o.status === "IN_TRANSIT").length}
            </span>
            {activeTab === "IN_TRANSIT" && (
              <motion.div layoutId="orderTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4FF00]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("DELIVERED")}
            className={`pb-3.5 px-2 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap relative cursor-pointer flex items-center gap-2 ${
              activeTab === "DELIVERED" ? "text-white font-bold" : "text-[#666666] hover:text-[#FAF9F6]"
            }`}
          >
            Sudah Sampai
            <span className="bg-[#141414] border border-[#222222] text-[#888888] text-[10px] px-2 py-0.5 font-bold">
              {orders.filter(o => o.status === "DELIVERED").length}
            </span>
            {activeTab === "DELIVERED" && (
              <motion.div layoutId="orderTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4FF00]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("COMPLETED")}
            className={`pb-3.5 px-2 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap relative cursor-pointer flex items-center gap-2 ${
              activeTab === "COMPLETED" ? "text-white font-bold" : "text-[#666666] hover:text-[#FAF9F6]"
            }`}
          >
            Selesai
            <span className="bg-[#141414] border border-[#222222] text-[#888888] text-[10px] px-2 py-0.5 font-bold">
              {orders.filter(o => o.status === "FUNDS_RELEASED_TO_SELLER").length}
            </span>
            {activeTab === "COMPLETED" && (
              <motion.div layoutId="orderTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4FF00]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`pb-3.5 px-2 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap relative cursor-pointer flex items-center gap-2 sm:ml-auto ${
              activeTab === "reviews" ? "text-white font-bold" : "text-[#666666] hover:text-[#FAF9F6]"
            }`}
          >
            Ulasan Saya
            <span className="bg-[#141414] border border-[#222222] text-[#888888] text-[10px] px-2 py-0.5 font-bold">
              {reviews.length}
            </span>
            {activeTab === "reviews" && (
              <motion.div layoutId="orderTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4FF00]" />
            )}
          </button>
        </div>

        {/* Notification Toast */}
        <AnimatePresence>
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed bottom-8 right-8 z-50 bg-[#111111] border border-[#333333] text-white px-5 py-4 shadow-2xl flex items-center gap-3 text-xs font-mono font-medium max-w-md"
            >
              <span className="text-[#D4FF00] font-bold">✓</span>
              <span>{saveMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orders List */}
        {activeTab !== "reviews" && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="p-12 text-center border border-[#1c1c1c] bg-[#0a0a0a] font-mono text-xs text-[#666666]">
                Memuat data pesanan...
              </div>
            ) : (() => {
              const filtered = activeTab === "all"
                ? orders
                : activeTab === "TO_SHIP"
                ? orders.filter(o => o.status === "HELD_IN_ESCROW" || o.status === "PAYMENT_PENDING")
                : activeTab === "IN_TRANSIT"
                ? orders.filter(o => o.status === "IN_TRANSIT")
                : activeTab === "DELIVERED"
                ? orders.filter(o => o.status === "DELIVERED")
                : orders.filter(o => o.status === "FUNDS_RELEASED_TO_SELLER");

              if (filtered.length === 0) {
                return (
                  <div className="bg-[#0a0a0a] border border-[#1c1c1c] p-16 text-center">
                    <p className="text-xs font-mono text-[#666666] uppercase tracking-widest">
                      Belum ada pesanan di kategori ini.
                    </p>
                    <Link
                      href="/collection"
                      className="inline-block mt-4 px-6 py-3 bg-[#FAF9F6] text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-white"
                    >
                      Buka Katalog Produk →
                    </Link>
                  </div>
                );
              }

              return filtered.map((order) => {
                const isShipping = order.status === "IN_TRANSIT";
                const steps = getTrackingSteps(order);
                const activeStep = steps.find(s => s.isActive) || steps[steps.length - 1];

                return (
                  <div
                    key={order.id}
                    className={`bg-[#0a0a0a] border transition-all ${
                      isShipping ? "border-[#2a2a2a] hover:border-[#D4FF00]/60 shadow-lg" : "border-[#1c1c1c] hover:border-[#2a2a2a]"
                    } p-6`}
                  >
                    {/* Top Bar: Order ID, Date & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c1c1c]">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-white bg-[#141414] border border-[#222222] px-2.5 py-1">
                          #{order.orderNumber}
                        </span>
                        <span className="text-xs font-mono text-[#666666]">{order.date}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-[#777777]">{order.storeName}</span>
                        <span className="text-[#333333]">•</span>
                        
                        {/* Clean Status Tag */}
                        <span className={`inline-flex items-center gap-2 text-xs font-mono px-3 py-1 font-medium ${
                          isShipping
                            ? "bg-[#141a08] border border-[#D4FF00]/40 text-[#D4FF00]"
                            : "bg-[#121212] border border-[#222222] text-[#CCCCCC]"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            order.status === "FUNDS_RELEASED_TO_SELLER"
                              ? "bg-white"
                              : order.status === "DELIVERED"
                              ? "bg-[#D4FF00]"
                              : order.status === "IN_TRANSIT"
                              ? "bg-[#D4FF00] animate-ping"
                              : order.status === "DISPUTED"
                              ? "bg-red-400"
                              : "bg-[#777777]"
                          }`} />
                          {order.status === "FUNDS_RELEASED_TO_SELLER"
                            ? "Selesai"
                            : order.status === "DELIVERED"
                            ? "Sudah Sampai"
                            : order.status === "IN_TRANSIT"
                            ? "Sedang Dikirim"
                            : order.status === "DISPUTED"
                            ? "Dalam Komplain"
                            : "Sedang Diproses"}
                        </span>
                      </div>
                    </div>

                    {/* LIVE TRACKING BANNER FOR IN_TRANSIT ORDERS */}
                    {isShipping && (
                      <div className="mt-4 p-3.5 bg-[#0f140a] border border-[#D4FF00]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#D4FF00] animate-pulse shrink-0 mt-1 sm:mt-0" />
                          <div>
                            <span className="text-[#D4FF00] font-bold block sm:inline mr-2">
                              STATUS KURIR TERKINI:
                            </span>
                            <span className="text-[#E0E0E0]">
                              {activeStep.title} — {activeStep.location}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedOrderDetail(order)}
                          className="text-[#D4FF00] hover:underline underline-offset-2 font-bold shrink-0 self-end sm:self-auto cursor-pointer"
                        >
                          Lihat Rute Stepping →
                        </button>
                      </div>
                    )}

                    {/* Body: Product Info & Actions */}
                    <div className="pt-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#141414] border border-[#222222] overflow-hidden shrink-0 relative">
                          <Image
                            src={order.items?.[0]?.image || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"}
                            alt={order.productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666] block mb-0.5">
                            {order.brand}
                          </span>
                          <h3 className="text-sm sm:text-base font-sans font-medium text-[#FAF9F6] tracking-tight">
                            {order.productName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1">
                            <span className="text-sm font-sans font-bold text-white">
                              {formatPrice(order.price)}
                            </span>
                            {order.waybillNumber && (
                              <span className="text-xs font-mono text-[#8E8E93] bg-[#141414] px-2 py-0.5 border border-[#222222]">
                                Resi: {order.waybillNumber} ({order.courierCode || "JNE"})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-end md:self-auto justify-end">
                        {/* Action 1: View Detail & Stepping */}
                        <button
                          type="button"
                          onClick={() => setSelectedOrderDetail(order)}
                          className="px-4 py-2.5 bg-[#141414] hover:bg-[#222222] text-white border border-[#2c2c2c] hover:border-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          <span>Detail & Lacak</span>
                        </button>

                        {/* Action 2: Delivered Actions */}
                        {order.status === "DELIVERED" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleConfirmDelivery(order.id)}
                              className="px-4 py-2.5 bg-[#D4FF00] hover:bg-white text-[#080808] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Terima Barang
                            </button>
                            <button
                              type="button"
                              onClick={() => setDisputeOrder(order)}
                              className="px-4 py-2.5 bg-[#141414] hover:bg-[#222222] text-[#888888] hover:text-white border border-[#262626] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Komplain
                            </button>
                          </>
                        )}

                        {/* Action 3: Review Button */}
                        {order.status === "FUNDS_RELEASED_TO_SELLER" && (
                          <button
                            type="button"
                            onClick={() => handleOpenReviewModal(order)}
                            className="px-4 py-2.5 bg-white hover:bg-[#e0e0e0] text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Tulis Ulasan
                          </button>
                        )}

                        <Link
                          href="/collection"
                          className="px-4 py-2.5 bg-[#111111] hover:bg-[#1c1c1c] text-[#888888] hover:text-white border border-[#222222] font-mono text-xs uppercase tracking-wider transition-colors"
                        >
                          Beli Lagi
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-[#0a0a0a] border border-[#1c1c1c] p-6 space-y-3"
              >
                <div className="flex justify-between items-center pb-3 border-b border-[#1c1c1c]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">
                      {rev.brand} • {rev.storeName}
                    </span>
                    <h3 className="text-sm font-sans font-semibold text-white mt-0.5">
                      {rev.productName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#D4FF00] text-xs">★★★★★</span>
                    <span className="text-xs font-mono text-[#666666]">{rev.date}</span>
                  </div>
                </div>
                <p className="text-xs font-sans text-[#A0A0A5] leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
                <span className="text-[10px] font-mono text-[#888888] block font-bold">
                  ✓ Terverifikasi Pembeli
                </span>
              </div>
            ))}
          </div>
        )}

        {/* MODAL: DETAIL PESANAN & LIVE STEPPING TRACKER */}
        <AnimatePresence>
          {selectedOrderDetail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="bg-[#0e0e0e] border border-[#262626] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-[#0e0e0e]/95 backdrop-blur border-b border-[#1c1c1c] p-5 sm:p-6 flex items-center justify-between z-20">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] font-bold">
                        DETAIL PESANAN & STATUS LOGISTIK
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-heading font-bold text-white uppercase tracking-tight">
                      #{selectedOrderDetail.orderNumber}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedOrderDetail(null)}
                    className="text-[#888888] hover:text-white p-2 border border-[#222222] bg-[#141414] hover:bg-[#222222] cursor-pointer transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-5 sm:p-7 space-y-7">
                  {/* 1. HORIZONTAL STEPPING PROGRESS OVERVIEW */}
                  <div className="bg-[#121212] border border-[#222222] p-5">
                    <div className="flex items-center justify-between mb-4 border-b border-[#1f1f1f] pb-3">
                      <span className="text-xs font-mono text-white font-bold uppercase tracking-wider flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                        Lacak Pengiriman Real-Time
                      </span>
                      {selectedOrderDetail.waybillNumber && (
                        <div className="flex items-center gap-2 text-xs font-mono text-[#888888]">
                          <span>Resi: <strong className="text-white">{selectedOrderDetail.waybillNumber}</strong></span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedOrderDetail.waybillNumber || "");
                              triggerNotification("Nomor resi berhasil disalin!");
                            }}
                            className="text-[10px] text-[#D4FF00] hover:underline uppercase"
                          >
                            Salin
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Stepping Indicator Nodes */}
                    <div className="relative py-2">
                      <div className="grid grid-cols-6 gap-1 relative z-10">
                        {getTrackingSteps(selectedOrderDetail).map((step, idx) => (
                          <div key={idx} className="flex flex-col items-center text-center">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] font-bold transition-all ${
                                step.isCompleted
                                  ? "bg-[#D4FF00] text-black shadow-md"
                                  : step.isActive
                                  ? "bg-white text-black ring-4 ring-[#D4FF00]/30 animate-pulse"
                                  : "bg-[#1c1c1c] text-[#555555] border border-[#2a2a2a]"
                              }`}
                            >
                              {step.isCompleted ? "✓" : step.stepNumber}
                            </div>
                            <span className={`text-[9px] font-mono mt-2 leading-tight uppercase font-medium line-clamp-2 max-w-[70px] ${
                              step.isActive ? "text-[#D4FF00] font-bold" : step.isCompleted ? "text-[#E0E0E0]" : "text-[#555555]"
                            }`}>
                              {step.stepNumber === 1 ? "Dibayar" : step.stepNumber === 2 ? "Diproses" : step.stepNumber === 3 ? "Kurir" : step.stepNumber === 4 ? "Transit" : step.stepNumber === 5 ? "Diantar" : "Selesai"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 2. DETAILED VERTICAL STEPPING LOGS */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono text-[#888888] uppercase tracking-widest font-bold">
                      RIWAYAT PERJALANAN LOGISTIK
                    </h3>

                    <div className="bg-[#121212] border border-[#222222] p-4 sm:p-5 space-y-4">
                      {getTrackingSteps(selectedOrderDetail).map((step, idx) => (
                        <div key={idx} className="flex gap-4 relative">
                          {/* Left Line */}
                          {idx !== 5 && (
                            <div
                              className={`absolute left-3.5 top-6 bottom-0 w-[1px] ${
                                step.isCompleted ? "bg-[#D4FF00]/40" : "bg-[#222222]"
                              }`}
                            />
                          )}

                          {/* Node Icon */}
                          <div
                            className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-mono text-[10px] font-bold z-10 ${
                              step.isCompleted
                                ? "bg-[#D4FF00] text-black"
                                : step.isActive
                                ? "bg-white text-black ring-4 ring-[#D4FF00]/30"
                                : "bg-[#1c1c1c] text-[#555555] border border-[#262626]"
                            }`}
                          >
                            {step.isCompleted ? "✓" : step.stepNumber}
                          </div>

                          {/* Content */}
                          <div className="flex-grow min-w-0 pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                              <h4 className={`text-xs font-mono font-bold uppercase ${
                                step.isActive ? "text-[#D4FF00]" : step.isCompleted ? "text-white" : "text-[#777777]"
                              }`}>
                                {step.title}
                              </h4>
                              <span className="text-[10px] font-mono text-[#666666]">
                                {step.timestamp}
                              </span>
                            </div>
                            <p className="text-[11px] font-sans text-[#A0A0A5] leading-relaxed">
                              {step.description}
                            </p>
                            <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-[#777777]">
                              <span>📍 Lokasi:</span>
                              <span className="text-[#CCCCCC]">{step.location}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. ORDER ITEMS BREAKDOWN */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono text-[#888888] uppercase tracking-widest font-bold">
                      PRODUK DALAM PESANAN
                    </h3>
                    <div className="bg-[#121212] border border-[#222222] p-4 space-y-3">
                      {(selectedOrderDetail.items || []).map((item, idx) => (
                        <div key={item.id || idx} className="flex gap-3.5 items-center pb-3 border-b border-[#1c1c1c] last:border-b-0 last:pb-0">
                          <div className="w-12 h-12 bg-[#1a1a1a] border border-[#262626] overflow-hidden shrink-0 relative">
                            <Image src={item.image || "/placeholder.svg"} alt={item.productName} fill className="object-cover" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <span className="text-[9px] font-mono text-[#777777] uppercase block">{item.brand}</span>
                            <h4 className="text-xs font-sans font-semibold text-white truncate">{item.productName}</h4>
                            <span className="text-[10px] font-mono text-[#666666]">{item.selectedVariant} × {item.quantity}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-white shrink-0">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. SHIPPING ADDRESS & PAYMENT INFO */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="bg-[#121212] border border-[#222222] p-4 space-y-2">
                      <span className="text-[10px] text-[#777777] uppercase tracking-wider font-bold block">
                        ALAMAT PENGIRIMAN
                      </span>
                      <p className="font-sans text-xs text-white font-medium">{selectedOrderDetail.buyerName || "Valen"}</p>
                      <p className="text-[11px] text-[#888888] font-sans leading-relaxed">
                        {selectedOrderDetail.destinationAddress}, {selectedOrderDetail.destinationCity} {selectedOrderDetail.destinationPostalCode}
                      </p>
                      <p className="text-[10px] text-[#666666]">Telp: {selectedOrderDetail.buyerPhone || "08123456789"}</p>
                    </div>

                    <div className="bg-[#121212] border border-[#222222] p-4 space-y-2">
                      <span className="text-[10px] text-[#777777] uppercase tracking-wider font-bold block">
                        RINGKASAN BIAYA
                      </span>
                      <div className="flex justify-between text-[#888888] text-[11px]">
                        <span>Subtotal Produk:</span>
                        <span className="text-white">{formatPrice(selectedOrderDetail.price)}</span>
                      </div>
                      <div className="flex justify-between text-[#888888] text-[11px]">
                        <span>Kurir ({selectedOrderDetail.courierCode || "JNE"}):</span>
                        <span className="text-white">GRATIS</span>
                      </div>
                      <div className="flex justify-between text-[#888888] text-[11px]">
                        <span>Metode Pembayaran:</span>
                        <span className="text-[#D4FF00] font-bold">{selectedOrderDetail.paymentMethod || "Midtrans QRIS"}</span>
                      </div>
                      <div className="flex justify-between text-white font-bold border-t border-[#1f1f1f] pt-2">
                        <span>Total Bayar:</span>
                        <span className="text-[#D4FF00] text-sm">{formatPrice(selectedOrderDetail.price)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 5. ACTION BUTTONS INSIDE MODAL */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    {selectedOrderDetail.status === "DELIVERED" && (
                      <button
                        type="button"
                        onClick={() => handleConfirmDelivery(selectedOrderDetail.id)}
                        className="flex-1 py-3 bg-[#D4FF00] hover:bg-white text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Konfirmasi Terima Barang ✓
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedOrderDetail(null)}
                      className="flex-1 py-3 bg-[#141414] hover:bg-[#222222] text-white border border-[#2a2a2a] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal: Write Review */}
        <AnimatePresence>
          {reviewingOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <div className="bg-[#0e0e0e] border border-[#262626] p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-[#1c1c1c]">
                  <div>
                    <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block">
                      TULIS ULASAN PRODUK
                    </span>
                    <h3 className="text-base font-sans font-bold text-white mt-0.5">
                      {reviewingOrder.productName}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReviewingOrder(null)}
                    className="text-[#888888] hover:text-white p-1 cursor-pointer font-mono"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-4 font-mono">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#888888] mb-2 font-bold">
                      Rating Produk (1 — 5)
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingInput(star)}
                          className={`text-xl cursor-pointer ${star <= ratingInput ? "text-[#D4FF00]" : "text-[#333333]"}`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="text-xs text-[#888888] ml-2">
                        {ratingInput}.0 / 5.0
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#888888] mb-2 font-bold">
                      Ulasan Anda
                    </label>
                    <textarea
                      rows={4}
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      required
                      placeholder="Ceritakan kepuasan Anda terhadap produk ini..."
                      className="w-full bg-[#141414] border border-[#262626] focus:border-white text-white p-3 text-xs outline-none resize-none font-sans"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#1c1c1c]">
                    <button
                      type="button"
                      onClick={() => setReviewingOrder(null)}
                      className="px-4 py-2.5 bg-[#141414] hover:bg-[#222222] text-[#888888] text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#D4FF00] hover:bg-white text-black font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Kirim Ulasan
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal: Dispute Order */}
        <AnimatePresence>
          {disputeOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <div className="bg-[#0e0e0e] border border-[#333333] p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-[#1c1c1c]">
                  <div>
                    <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block font-bold">
                      FORMULIR KOMPLAIN PESANAN
                    </span>
                    <h3 className="text-base font-sans font-bold text-white mt-0.5">
                      #{disputeOrder.orderNumber} • {disputeOrder.productName}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDisputeOrder(null)}
                    className="text-[#888888] hover:text-white p-1 cursor-pointer font-mono"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmitDispute} className="space-y-4 font-mono">
                  <div className="p-3 bg-[#141414] border border-[#222222] text-[#A0A0A5] text-xs leading-relaxed font-sans">
                    Jika produk yang Anda terima mengalami kerusakan atau tidak sesuai deskripsi, silakan ajukan komplain sebelum mengonfirmasi terima barang.
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#888888] mb-2 font-bold">
                      Alasan Komplain
                    </label>
                    <textarea
                      rows={4}
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      required
                      placeholder="Jelaskan kendala atau kerusakan pada barang yang Anda terima..."
                      className="w-full bg-[#141414] border border-[#262626] focus:border-white text-white p-3 text-xs outline-none resize-none font-sans"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#1c1c1c]">
                    <button
                      type="button"
                      onClick={() => setDisputeOrder(null)}
                      className="px-4 py-2.5 bg-[#141414] hover:bg-[#222222] text-[#888888] text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-white hover:bg-[#e0e0e0] text-black font-bold text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Kirim Komplain
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
