"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";

interface OrderItem {
  id: string;
  orderNumber: string;
  date: string;
  productName: string;
  brand: string;
  price: number;
  storeName: string;
  status: "PAYMENT_PENDING" | "HELD_IN_ESCROW" | "IN_TRANSIT" | "DELIVERED" | "FUNDS_RELEASED_TO_SELLER" | "DISPUTED";
  waybillNumber?: string;
  courierCode?: string;
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
          productName: o.items?.[0]?.productName || "Audiophile Gear",
          brand: o.items?.[0]?.brand || "TonalZone",
          price: o.totalAmount,
          storeName: o.storeName || "TonalZone Partner Merchant",
          status: o.escrowStatus,
          waybillNumber: o.waybillNumber,
          courierCode: o.courierCode,
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

  return (
    <div className="min-h-screen bg-[#080808] text-[#FAF9F6] font-sans flex flex-col relative">
      <Navbar />

      <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full flex-1">
        {/* Top Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-4 h-[1px] bg-white" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#888888] font-bold">
              RIWAYAT TRANSAKSI
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight uppercase">
            Pesanan Saya
          </h1>
          <p className="text-xs font-mono text-[#777777] mt-1">
            Pantau status pesanan, nomor resi pengiriman, dan riwayat pembelian Anda.
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

              return filtered.map((order) => (
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
                      
                      {/* Clean Industrial Status Tag (Monochrome with Subtle Dot) */}
                      <span className="inline-flex items-center gap-2 text-xs font-mono text-[#CCCCCC] bg-[#121212] border border-[#222222] px-3 py-1 font-medium">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          order.status === "FUNDS_RELEASED_TO_SELLER"
                            ? "bg-white"
                            : order.status === "DELIVERED"
                            ? "bg-[#D4FF00]"
                            : order.status === "IN_TRANSIT"
                            ? "bg-[#888888]"
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

                  {/* Body: Product Info & Actions */}
                  <div className="pt-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
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

                    <div className="flex flex-wrap items-center gap-2 self-end md:self-auto justify-end">
                      {/* Action 1: Delivered Actions */}
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

                      {/* Action 2: In Transit Tracking */}
                      {order.status === "IN_TRANSIT" && (
                        <button
                          type="button"
                          onClick={() => triggerNotification(`Paket #${order.orderNumber} dengan nomor resi ${order.waybillNumber} sedang dalam perjalanan via ${order.courierCode || "JNE"}.`)}
                          className="px-4 py-2 bg-[#141414] hover:bg-[#222222] text-white border border-[#262626] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Lacak Pengiriman
                        </button>
                      )}

                      {/* Action 3: Review Button */}
                      {order.status === "FUNDS_RELEASED_TO_SELLER" && (
                        <button
                          type="button"
                          onClick={() => handleOpenReviewModal(order)}
                          className="px-4 py-2 bg-white hover:bg-[#e0e0e0] text-black font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Tulis Ulasan
                        </button>
                      )}

                      <Link
                        href="/collection"
                        className="px-4 py-2 bg-[#111111] hover:bg-[#1c1c1c] text-[#888888] hover:text-white border border-[#222222] font-mono text-xs uppercase tracking-wider transition-colors"
                      >
                        Beli Lagi
                      </Link>
                    </div>
                  </div>
                </div>
              ));
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
