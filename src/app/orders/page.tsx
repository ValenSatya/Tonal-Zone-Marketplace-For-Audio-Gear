"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { MapPin, Truck, MessageSquare, FileText, ChevronRight, CheckCircle2 } from "lucide-react";

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
  status: "PAYMENT_PENDING" | "HELD_IN_ESCROW" | "IN_TRANSIT" | "DELIVERED" | "FUNDS_RELEASED_TO_SELLER" | "DISPUTED";
  waybillNumber?: string;
  courierCode?: string;
  etaDays?: number;
  hasReviewed?: boolean;
  timeline?: OrderTimelineStep[];
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

export default function OrdersPage() {
  const { t } = useLanguage();
  const { formatPrice } = useLocation();
  const [activeTab, setActiveTab] = useState<"all" | "TO_SHIP" | "IN_TRANSIT" | "DELIVERED" | "COMPLETED" | "reviews">("all");
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

  // Orders State (Includes default Figma model sample for live demo preview)
  const [orders, setOrders] = useState<OrderItem[]>([
    {
      id: "ord-blessing-3",
      orderNumber: "TZ-92841",
      date: "25 Agu 2026",
      productName: "MOONDROP BLESSING 3 Hybrid",
      brand: "MOONDROP",
      price: 333.10, // ~Rp 5.329.600
      quantity: 2,
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
      storeName: "Moondrop Official",
      status: "IN_TRANSIT",
      waybillNumber: "JNE882914029",
      courierCode: "JNE Express",
      etaDays: 3,
      timeline: [
        {
          title: "Paket Sedang Di Kemas",
          time: "16.10",
          desc: "Penjual telah memverifikasi produk dan mengemas paket sesuai standar proteksi audiophile.",
          completed: true,
        },
        {
          title: "Paket Telah Di jemput",
          time: "18.20",
          desc: "Kurir ekspedisi telah mengambil paket dari hub Jakarta Selatan menuju fasilitas sortir transit.",
          completed: true,
        },
      ],
    },
  ]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        const mapped: OrderItem[] = data.orders.map((o: any) => ({
          id: o.id,
          orderNumber: o.id,
          date: new Date(o.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          productName: o.items?.[0]?.productName || "MOONDROP BLESSING 3 Hybrid",
          brand: o.items?.[0]?.brand || "MOONDROP",
          price: o.totalAmount,
          quantity: o.items?.[0]?.quantity || 1,
          image: o.items?.[0]?.image || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
          storeName: o.storeName || "Moondrop Official",
          status: o.escrowStatus,
          waybillNumber: o.waybillNumber || "JNE882914029",
          courierCode: o.courierCode || "JNE Express",
          etaDays: 3,
          hasReviewed: o.escrowStatus === "FUNDS_RELEASED_TO_SELLER",
          timeline: [
            {
              title: "Paket Sedang Di Kemas",
              time: "16.10",
              desc: "Penjual telah memverifikasi produk dan mengemas paket sesuai standar proteksi audiophile.",
              completed: true,
            },
            {
              title: "Paket Telah Di jemput",
              time: "18.20",
              desc: "Kurir ekspedisi telah mengambil paket dari hub Jakarta Selatan menuju fasilitas sortir transit.",
              completed: true,
            },
          ],
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
    if (!disputeOrder || !disputeReason) return;

    try {
      const res = await fetch(`/api/orders/${disputeOrder.id}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: disputeReason }),
      });
      const data = await res.json();
      if (data.success) {
        triggerNotification("Komplain berhasil diajukan. Tim TonalZone Escrow akan menahan dana penjual untuk mediasi.");
        setDisputeOrder(null);
        setDisputeReason("");
        fetchOrders();
      }
    } catch (err) {
      console.error("Error creating dispute:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#FAF9F6] font-sans selection:bg-[#D4FF00] selection:text-[#0e0e0e] flex flex-col">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="mb-8 border-b border-[#1c1c1c] pb-6">
          <span className="text-xs font-mono text-[#888888] uppercase tracking-widest block mb-1">
            AKUN SAYA & PESANAN
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white">
            Riwayat Pesanan & Pengiriman
          </h1>
          <p className="text-xs text-[#888888] font-sans mt-2 max-w-2xl">
            Lacak status pengiriman kurir secara real-time, konfirmasi penerimaan barang, atau hubungi penjual mitra resmi TonalZone.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 sm:gap-6 border-b border-[#1c1c1c] mb-8 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`pb-3.5 px-2 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap relative cursor-pointer flex items-center gap-2 ${
              activeTab === "all" ? "text-white font-bold" : "text-[#666666] hover:text-[#FAF9F6]"
            }`}
          >
            Semua Pesanan
            <span className="bg-[#141414] border border-[#222222] text-[#888888] text-[10px] px-2 py-0.5 font-bold">
              {orders.length}
            </span>
            {activeTab === "all" && (
              <motion.div layoutId="orderTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
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
              <motion.div layoutId="orderTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
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
            <span className="bg-[#141414] border border-[#222222] text-[#888888] text-[10px] px-2 py-0.5 font-bold">
              {orders.filter(o => o.status === "IN_TRANSIT").length}
            </span>
            {activeTab === "IN_TRANSIT" && (
              <motion.div layoutId="orderTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
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
              <motion.div layoutId="orderTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
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
              <motion.div layoutId="orderTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
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
              <motion.div layoutId="orderTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
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
          <div className="space-y-6">
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
                // =========================================================================
                // 🎨 SPECIAL FIGMA GROUP 2 CARD (UNIFIED BG & CLEAN TIMELINE LAYOUT)
                // =========================================================================
                if (order.status === "IN_TRANSIT") {
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#0a0a0a] border border-[#1c1c1c] hover:border-[#2a2a2a] p-6 transition-colors space-y-5"
                    >
                      {/* Top Bar: Order ID & Date */}
                      <div className="flex items-center justify-between gap-4 pb-3.5 border-b border-[#1a1a1a]">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-white bg-[#141414] border border-[#222222] px-2.5 py-1">
                            #{order.orderNumber}
                          </span>
                          <span className="text-xs font-mono text-[#777777]">{order.date}</span>
                        </div>
                        {order.waybillNumber && (
                          <span className="text-[11px] font-mono text-[#888888] bg-[#121212] px-2.5 py-1 border border-[#222222]">
                            Resi: {order.waybillNumber} ({order.courierCode || "JNE Express"})
                          </span>
                        )}
                      </div>

                      {/* Product Row (Exact Figma Frame 7 & Frame 9 Layout) */}
                      <div className="flex items-start justify-between gap-4 pt-1">
                        <div className="flex items-start gap-4 sm:gap-5 min-w-0 flex-1">
                          {/* Thumbnail Image */}
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-[#141414] border border-[#222222] shrink-0 overflow-hidden">
                            <Image
                              src={order.image || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"}
                              alt={order.productName}
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* Product Info (Figma Frame 7: Store, Product, Price) */}
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#888888] block mb-1">
                              {order.storeName}
                            </span>
                            <h3 className="text-base sm:text-lg font-sans font-semibold text-[#FAF9F6] tracking-tight truncate leading-snug">
                              {order.productName}
                            </h3>
                            <p className="text-base sm:text-lg font-sans font-semibold text-white tracking-tight pt-1.5 font-mono">
                              {formatPrice(order.price)}
                            </p>
                          </div>
                        </div>

                        {/* Status & Quantity (Figma Frame 9: Dikirim & 2x) */}
                        <div className="text-right shrink-0 pt-0.5">
                          <span className="text-xs sm:text-sm font-sans font-medium text-white/80 block">
                            Dikirim
                          </span>
                          <span className="text-base sm:text-lg font-mono font-bold text-white block mt-1.5">
                            {order.quantity ? `${order.quantity}x` : "1x"}
                          </span>
                        </div>
                      </div>

                      {/* Logistics & Live Timeline (Seamless & Perfectly Spaced) */}
                      <div className="pt-4 space-y-4 border-t border-[#1a1a1a]">
                        {/* ETA & Courier Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#181818] text-xs">
                          <span className="text-white font-medium flex items-center gap-2 text-sm">
                            <Truck className="w-4 h-4 text-[#D4FF00]" />
                            <span>Akan Tiba Dalam {order.etaDays || 3} Hari</span>
                          </span>
                          <span className="text-xs font-mono text-[#888888]">
                            Ekspedisi: <span className="text-white font-medium">{order.courierCode || "JNE Express"}</span>
                          </span>
                        </div>

                        {/* Timeline Steps with Continuous Dashed Connector */}
                        <div className="relative pl-8 space-y-6 pt-2 pb-1">
                          {/* Continuous Vertical Dashed Line from Pin 1 to Pin 2 */}
                          <div className="absolute left-[10px] top-4 bottom-5 w-0 border-l border-dashed border-[#333333]" />

                          {/* Step 1: Di Kemas */}
                          <div className="relative">
                            {/* Pin Icon 1 */}
                            <div className="absolute -left-8 top-0.5 w-5 h-5 flex items-center justify-center text-[#777777] bg-[#0a0a0a]">
                              <MapPin className="w-4 h-4" />
                            </div>

                            <div className="flex items-center justify-between gap-4">
                              <span className="text-sm font-sans font-medium text-[#CCCCCC]">
                                Paket Sedang Di Kemas
                              </span>
                              <span className="text-xs font-mono text-[#777777]">
                                16.10
                              </span>
                            </div>
                            <p className="text-xs font-sans text-[#777777] mt-1 leading-relaxed max-w-xl">
                              Penjual sedang menyiapkan dan mengemas barang sesuai standar audiophile.
                            </p>
                          </div>

                          {/* Step 2: Di Jemput (Active) */}
                          <div className="relative">
                            {/* Pin Icon 2 (Active Highlight) */}
                            <div className="absolute -left-8 top-0.5 w-5 h-5 flex items-center justify-center text-[#D4FF00] bg-[#0a0a0a]">
                              <MapPin className="w-4 h-4" />
                            </div>

                            <div className="flex items-center justify-between gap-4">
                              <span className="text-sm font-sans font-semibold text-white">
                                Paket Telah Di jemput
                              </span>
                              <span className="text-xs font-mono text-[#D4FF00] font-bold">
                                18.20
                              </span>
                            </div>
                            <p className="text-xs font-sans text-[#A0A0A5] mt-1 leading-relaxed max-w-xl">
                              Kurir telah mengambil paket dan dalam proses pengiriman ke kota tujuan.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Single Prominent Action Button: Chat Penjual */}
                      <div className="flex items-center justify-end pt-3 border-t border-[#1a1a1a]">
                        <Link
                          href={`/messages?store=${encodeURIComponent(order.storeName)}`}
                          className="px-5 py-2.5 bg-[#FAF9F6] hover:bg-white text-[#0e0e0e] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Chat Penjual</span>
                        </Link>
                      </div>
                    </motion.div>
                  );
                }

                // =========================================================================
                // Standard Card for Other Statuses (Delivered, Completed, Processing)
                // =========================================================================
                return (
                  <div
                    key={order.id}
                    className="bg-[#0a0a0a] border border-[#1c1c1c] p-6 hover:border-[#2a2a2a] transition-colors"
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
                        
                        <span className="inline-flex items-center gap-2 text-xs font-mono text-[#CCCCCC] bg-[#121212] border border-[#222222] px-3 py-1 font-medium">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            order.status === "FUNDS_RELEASED_TO_SELLER"
                              ? "bg-white"
                              : order.status === "DELIVERED"
                              ? "bg-[#D4FF00]"
                              : order.status === "DISPUTED"
                              ? "bg-red-400"
                              : "bg-[#777777]"
                          }`} />
                          {order.status === "FUNDS_RELEASED_TO_SELLER"
                            ? "Selesai"
                            : order.status === "DELIVERED"
                            ? "Sudah Sampai"
                            : order.status === "DISPUTED"
                            ? "Dalam Komplain"
                            : "Sedang Diproses"}
                        </span>
                      </div>
                    </div>

                    {/* Body: Product Info & Actions */}
                    <div className="pt-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 bg-[#141414] border border-[#222222] shrink-0 overflow-hidden">
                          <Image src={order.image || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"} alt={order.productName} fill className="object-cover" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666] block mb-1">
                            {order.brand}
                          </span>
                          <h3 className="text-base font-sans font-medium text-[#FAF9F6] tracking-tight">
                            {order.productName}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
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
                        {order.status === "DELIVERED" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleConfirmDelivery(order.id)}
                              className="px-4 py-2.5 bg-[#D4FF00] hover:bg-white text-[#080808] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Konfirmasi Terima Barang
                            </button>
                            <button
                              type="button"
                              onClick={() => setDisputeOrder(order)}
                              className="px-4 py-2.5 bg-[#141414] hover:bg-[#222222] text-[#888888] hover:text-white border border-[#262626] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Ajukan Komplain
                            </button>
                          </>
                        )}

                        {order.status === "FUNDS_RELEASED_TO_SELLER" && (
                          <button
                            type="button"
                            onClick={() => handleOpenReviewModal(order)}
                            className="px-4 py-2 bg-white hover:bg-[#e0e0e0] text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Tulis Ulasan
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedOrderDetails(order)}
                          className="px-4 py-2 bg-[#141414] hover:bg-[#1c1c1c] text-[#888888] hover:text-white border border-[#222222] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Detail
                        </button>
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
              <div key={rev.id} className="bg-[#0a0a0a] border border-[#1c1c1c] p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666] block">
                      {rev.brand}
                    </span>
                    <h4 className="text-sm font-sans font-semibold text-white">{rev.productName}</h4>
                  </div>
                  <span className="text-xs font-mono text-[#666666]">{rev.date}</span>
                </div>
                <div className="flex gap-1 text-[#D4FF00] text-xs">
                  {"★".repeat(rev.rating)}
                </div>
                <p className="text-xs font-sans text-[#CCCCCC] bg-[#111111] p-3 border border-[#1c1c1c]">
                  &ldquo;{rev.comment}&rdquo;
                </p>
                <div className="text-[10px] font-mono text-[#666666]">
                  Penjual: <span className="text-[#888888]">{rev.storeName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrderDetails && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111111] border border-[#2a2a2a] p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative"
            >
              <div className="flex justify-between items-start border-b border-[#222222] pb-4">
                <div>
                  <span className="text-[10px] font-mono text-[#888888] uppercase tracking-widest block">
                    Rincian Pesanan #{selectedOrderDetails.orderNumber}
                  </span>
                  <h3 className="font-heading text-xl font-bold uppercase text-white mt-1">
                    {selectedOrderDetails.productName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrderDetails(null)}
                  className="text-[#888888] hover:text-white font-mono text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs font-mono text-[#888888]">
                <div className="flex justify-between py-1 border-b border-[#1c1c1c]">
                  <span>Penjual:</span>
                  <span className="text-white font-bold">{selectedOrderDetails.storeName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1c1c1c]">
                  <span>Status Transaksi:</span>
                  <span className="text-[#D4FF00] font-bold">{selectedOrderDetails.status}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1c1c1c]">
                  <span>Nomor Resi Pengiriman:</span>
                  <span className="text-white font-bold">{selectedOrderDetails.waybillNumber || "Belum diterbitkan"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1c1c1c]">
                  <span>Total Tagihan:</span>
                  <span className="text-white font-bold text-sm">{formatPrice(selectedOrderDetails.price)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-6 py-2.5 bg-white text-black font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
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
              className="bg-[#111111] border border-[#2a2a2a] p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative"
            >
              <div className="flex justify-between items-start border-b border-[#222222] pb-4">
                <div>
                  <span className="text-[10px] font-mono text-[#888888] uppercase tracking-widest block">
                    ULASAN AUDIOPHILE
                  </span>
                  <h3 className="font-heading text-xl font-bold uppercase text-white mt-1">
                    Beri Nilai & Ulasan
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewingOrder(null)}
                  className="text-[#888888] hover:text-white font-mono text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-[#888888] uppercase tracking-wider mb-2">
                    Rating Bintang:
                  </label>
                  <div className="flex gap-2 text-2xl text-[#D4FF00] cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setRatingInput(star)}
                        className={star <= ratingInput ? "opacity-100" : "opacity-30"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[#888888] uppercase tracking-wider mb-2">
                    Ulasan Pengalaman Mendengarkan:
                  </label>
                  <textarea
                    rows={4}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Ceritakan impresi suara (bass, mid, treble, soundstage)..."
                    className="w-full bg-[#141414] border border-[#222222] p-3 text-white focus:border-white outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewingOrder(null)}
                    className="px-4 py-2 text-[#888888] hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#D4FF00] text-black font-bold uppercase hover:bg-white transition-colors"
                  >
                    Kirim Ulasan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
