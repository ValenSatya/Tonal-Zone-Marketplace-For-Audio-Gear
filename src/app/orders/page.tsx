"use client";

import React, { useState, useEffect } from "react";
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

export default function OrdersPage() {
  const { t } = useLanguage();
  const { formatPrice } = useLocation();
  const [activeTab, setActiveTab] = useState<"all" | "TO_SHIP" | "IN_TRANSIT" | "DELIVERED" | "COMPLETED" | "reviews">("all");
  const [saveMessage, setSaveMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Selected Order for Detail Drawer / Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

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
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => prev ? { ...prev, status: "FUNDS_RELEASED_TO_SELLER" } : null);
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

  // Helper for Stepping Stage (0 to 3)
  const getStageIndex = (status: string) => {
    if (status === "PAYMENT_PENDING" || status === "HELD_IN_ESCROW") return 0; // Diproses
    if (status === "IN_TRANSIT") return 2; // Sedang Dikirim / Out for delivery
    if (status === "DELIVERED" || status === "FUNDS_RELEASED_TO_SELLER") return 3; // Selesai
    return 1;
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#FAF9F6] font-sans flex flex-col relative selection:bg-[#D4FF00] selection:text-black">
      <Navbar />

      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full flex-1">
        {/* Top Minimalist Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1c1c1c] pb-6">
          <div>
            <span className="text-[10px] font-mono text-[#888888] uppercase tracking-[0.25em] font-bold block mb-1">
              PELACAKAN & TRANSAKSI
            </span>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight uppercase">
              Pesanan Saya
            </h1>
          </div>
          <p className="text-xs font-mono text-[#666666] sm:text-right">
            Semua transaksi dilindungi oleh <span className="text-[#D4FF00]">TonalZone Escrow</span>
          </p>
        </div>

        {/* Clean Monochrome Tabs */}
        <div className="flex items-center gap-2 sm:gap-6 border-b border-[#1c1c1c] mb-8 overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: "Semua", count: orders.length },
            { id: "TO_SHIP", label: "Diproses", count: orders.filter(o => o.status === "HELD_IN_ESCROW" || o.status === "PAYMENT_PENDING").length },
            { id: "IN_TRANSIT", label: "Dikirim", count: orders.filter(o => o.status === "IN_TRANSIT").length },
            { id: "DELIVERED", label: "Sampai", count: orders.filter(o => o.status === "DELIVERED").length },
            { id: "COMPLETED", label: "Selesai", count: orders.filter(o => o.status === "FUNDS_RELEASED_TO_SELLER").length },
            { id: "reviews", label: "Ulasan", count: reviews.length },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3.5 px-2 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap relative cursor-pointer flex items-center gap-2 ${
                  isActive ? "text-white font-bold" : "text-[#666666] hover:text-[#CCCCCC]"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 border ${
                  isActive ? "border-white bg-white text-black font-bold" : "border-[#222222] bg-[#121212] text-[#777777]"
                }`}>
                  {tab.count}
                </span>
                {isActive && (
                  <motion.div layoutId="orderTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4FF00]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed bottom-8 right-8 z-50 bg-[#121212] border border-[#333333] text-white px-5 py-3.5 shadow-2xl flex items-center gap-3 text-xs font-mono font-medium max-w-md"
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
              <div className="p-16 text-center border border-[#1c1c1c] bg-[#0a0a0a] font-mono text-xs text-[#666666]">
                Memuat riwayat transaksi...
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
                  <div className="bg-[#0a0a0a] border border-[#1c1c1c] p-16 text-center space-y-4">
                    <p className="text-xs font-mono text-[#666666] uppercase tracking-widest">
                      Tidak ada pesanan di kategori ini.
                    </p>
                    <Link
                      href="/collection"
                      className="inline-block px-6 py-3 bg-white hover:bg-[#D4FF00] text-black font-mono font-bold text-xs uppercase tracking-widest transition-colors"
                    >
                      Jelajahi Katalog IEM →
                    </Link>
                  </div>
                );
              }

              return filtered.map((order) => {
                const isShipping = order.status === "IN_TRANSIT";
                const stageIndex = getStageIndex(order.status);

                return (
                  <div
                    key={order.id}
                    className="bg-[#0d0d0d] border border-[#1c1c1c] hover:border-[#2a2a2a] transition-all p-6 relative overflow-hidden group"
                  >
                    {/* Header: Store, Date & Status Tag */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#171717]">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-white font-bold">
                          #{order.orderNumber}
                        </span>
                        <span className="text-xs font-mono text-[#555555]">/</span>
                        <span className="text-xs font-mono text-[#888888]">
                          {order.storeName}
                        </span>
                        <span className="text-xs font-mono text-[#555555]">•</span>
                        <span className="text-xs font-mono text-[#666666]">{order.date}</span>
                      </div>

                      {/* Status Tag */}
                      <span className={`inline-flex items-center gap-2 text-xs font-mono px-3 py-1 font-medium self-start sm:self-auto ${
                        isShipping
                          ? "bg-[#14180d] border border-[#D4FF00]/40 text-[#D4FF00]"
                          : order.status === "DELIVERED"
                          ? "bg-[#141414] border border-white/30 text-white"
                          : "bg-[#121212] border border-[#222222] text-[#888888]"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isShipping
                            ? "bg-[#D4FF00] animate-pulse"
                            : order.status === "DELIVERED" || order.status === "FUNDS_RELEASED_TO_SELLER"
                            ? "bg-white"
                            : "bg-[#666666]"
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

                    {/* Stepping Progress Bar on Card (Compact & Ultra-Clean) */}
                    <div className="py-4 border-b border-[#171717]">
                      <div className="relative flex items-center justify-between">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#1a1a1a] -translate-y-1/2 z-0" />
                        <div 
                          className="absolute top-1/2 left-0 h-[2px] bg-[#D4FF00] -translate-y-1/2 z-0 transition-all duration-500" 
                          style={{ width: `${(stageIndex / 3) * 100}%` }}
                        />

                        {[
                          { label: "Pesanan Dibuat", num: 1 },
                          { label: "Diproses Toko", num: 2 },
                          { label: "Dalam Pengiriman", num: 3 },
                          { label: "Tiba di Tujuan", num: 4 },
                        ].map((stage, idx) => {
                          const isPassed = idx <= stageIndex;
                          const isCurrent = idx === stageIndex;

                          return (
                            <div key={idx} className="relative z-10 flex flex-col items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px] font-bold transition-all ${
                                isPassed 
                                  ? "bg-[#D4FF00] text-black ring-4 ring-[#080808]" 
                                  : "bg-[#171717] border border-[#2a2a2a] text-[#555555]"
                              }`}>
                                {isPassed ? "✓" : stage.num}
                              </div>
                              <span className={`text-[10px] font-mono mt-1.5 uppercase tracking-wider hidden sm:block ${
                                isCurrent ? "text-[#D4FF00] font-bold" : isPassed ? "text-[#CCCCCC]" : "text-[#555555]"
                              }`}>
                                {stage.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Live Courier Subtext when IN_TRANSIT */}
                      {isShipping && (
                        <div className="mt-4 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono bg-[#11140c] border border-[#D4FF00]/20 p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[#D4FF00] font-bold">📍 POSISI KURIR:</span>
                            <span className="text-white">Sedang diantar oleh kurir {order.courierCode} menuju {order.destinationCity}</span>
                          </div>
                          {order.waybillNumber && (
                            <span className="text-[#888888] shrink-0 font-mono">
                              Resi: <strong className="text-white">{order.waybillNumber}</strong>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Product & Action Row */}
                    <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-5">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 bg-[#141414] border border-[#222222] shrink-0 overflow-hidden">
                          <Image
                            src={order.items?.[0]?.image || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"}
                            alt={order.productName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666] block">
                            {order.brand}
                          </span>
                          <h3 className="text-sm font-sans font-semibold text-white tracking-tight">
                            {order.productName}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-xs font-mono">
                            <span className="text-white font-bold">{formatPrice(order.price)}</span>
                            <span className="text-[#555555]">•</span>
                            <span className="text-[#888888]">{order.items?.[0]?.selectedVariant || "Standard"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 self-end md:self-auto">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2.5 bg-white hover:bg-[#D4FF00] text-black font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                        >
                          Detail & Lacak →
                        </button>

                        {order.status === "DELIVERED" && (
                          <button
                            type="button"
                            onClick={() => handleConfirmDelivery(order.id)}
                            className="px-4 py-2.5 bg-[#D4FF00] hover:bg-white text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Terima Barang
                          </button>
                        )}

                        {order.status === "FUNDS_RELEASED_TO_SELLER" && (
                          <button
                            type="button"
                            onClick={() => handleOpenReviewModal(order)}
                            className="px-4 py-2.5 bg-[#141414] hover:bg-[#222222] text-white border border-[#2c2c2c] font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Tulis Ulasan
                          </button>
                        )}
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
                className="bg-[#0d0d0d] border border-[#1c1c1c] p-6 space-y-3"
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

        {/* HIGH-TECH LOGISTICS HUD & ORDER DETAIL MODAL */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 10 }}
                className="bg-[#0a0a0a] border border-[#222222] max-w-2xl w-full max-h-[88vh] overflow-y-auto shadow-2xl relative"
              >
                {/* Header */}
                <div className="sticky top-0 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#1c1c1c] px-6 py-5 flex items-center justify-between z-20">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] font-bold block mb-0.5">
                      DETAIL PESANAN & PELACAKAN KURIR
                    </span>
                    <h2 className="text-xl font-heading font-bold text-white uppercase tracking-tight">
                      #{selectedOrder.orderNumber}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="w-8 h-8 flex items-center justify-center border border-[#2a2a2a] bg-[#141414] hover:bg-[#222222] text-[#888888] hover:text-white font-mono text-xs cursor-pointer transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* 1. Live Courier Highlight */}
                  <div className="bg-[#11140c] border border-[#D4FF00]/30 p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#1a2210] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#D4FF00] animate-ping" />
                        <span className="font-mono text-xs font-bold text-[#D4FF00] uppercase tracking-wider">
                          STATUS KURIR REAL-TIME
                        </span>
                      </div>
                      <span className="font-mono text-xs text-white">
                        {selectedOrder.courierCode || "JNE Express"}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-sans text-sm font-bold text-white">
                        {selectedOrder.status === "IN_TRANSIT"
                          ? "Kurir Sedang Mengantarkan Paket ke Alamat Anda"
                          : selectedOrder.status === "DELIVERED" || selectedOrder.status === "FUNDS_RELEASED_TO_SELLER"
                          ? "Paket Telah Berhasil Diterima"
                          : "Penjual Sedang Menyiapkan & Mengemas Pesanan"}
                      </h3>
                      <p className="font-mono text-xs text-[#A0A0A5] mt-1">
                        Tujuan: {selectedOrder.destinationAddress}, {selectedOrder.destinationCity}
                      </p>
                    </div>

                    {selectedOrder.waybillNumber && (
                      <div className="flex items-center justify-between pt-2 border-t border-[#1a2210] text-xs font-mono">
                        <span className="text-[#888888]">Nomor Resi: <strong className="text-white">{selectedOrder.waybillNumber}</strong></span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedOrder.waybillNumber || "");
                            triggerNotification("Nomor resi berhasil disalin!");
                          }}
                          className="text-[#D4FF00] hover:underline font-bold uppercase text-[11px]"
                        >
                          Salin Resi
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 2. Sleek Vertical Milestones */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono text-[#888888] uppercase tracking-widest font-bold">
                      LOG PERJALANAN PENGIRIMAN
                    </h3>

                    <div className="bg-[#111111] border border-[#1c1c1c] p-5 space-y-4">
                      {[
                        {
                          time: "Hari ini, 14:10 WIB",
                          title: "Kurir Sedang Bergerak Menuju Alamat",
                          desc: `Kurir sprinter ${selectedOrder.courierCode} sedang membawa barang audio gear Anda.`,
                          active: selectedOrder.status === "IN_TRANSIT",
                          done: selectedOrder.status === "DELIVERED" || selectedOrder.status === "FUNDS_RELEASED_TO_SELLER",
                        },
                        {
                          time: "Hari ini, 08:30 WIB",
                          title: "Tiba di Sorting Hub Kota Tujuan",
                          desc: `Paket tiba di fasilitas sortir logistik DC ${selectedOrder.destinationCity}.`,
                          active: false,
                          done: selectedOrder.status === "IN_TRANSIT" || selectedOrder.status === "DELIVERED" || selectedOrder.status === "FUNDS_RELEASED_TO_SELLER",
                        },
                        {
                          time: "Kemarin, 19:45 WIB",
                          title: "Diserahkan ke Kurir & Resi Terbit",
                          desc: `Paket di-pickup dari warehouse penjual (${selectedOrder.storeName}).`,
                          active: false,
                          done: true,
                        },
                        {
                          time: "Kemarin, 12:00 WIB",
                          title: "Pembayaran Divalidasi Escrow",
                          desc: "Dana aman tersimpan di Rekening Bersama TonalZone.",
                          active: false,
                          done: true,
                        },
                      ].map((log, i, arr) => (
                        <div key={i} className="flex gap-4 relative">
                          {i !== arr.length - 1 && (
                            <div className="absolute left-2.5 top-5 bottom-0 w-[1px] bg-[#222222]" />
                          )}
                          <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center font-mono text-[10px] z-10 ${
                            log.active 
                              ? "bg-[#D4FF00] text-black font-bold ring-4 ring-[#D4FF00]/20 animate-pulse" 
                              : log.done 
                              ? "bg-white text-black font-bold" 
                              : "bg-[#1c1c1c] border border-[#2a2a2a] text-[#555555]"
                          }`}>
                            {log.done ? "✓" : "•"}
                          </div>
                          <div className="flex-grow min-w-0 pb-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                              <h4 className={`text-xs font-mono font-bold uppercase ${
                                log.active ? "text-[#D4FF00]" : "text-white"
                              }`}>
                                {log.title}
                              </h4>
                              <span className="text-[10px] font-mono text-[#666666]">{log.time}</span>
                            </div>
                            <p className="text-[11px] font-sans text-[#888888] mt-0.5">{log.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Product & Cost Breakdown */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono text-[#888888] uppercase tracking-widest font-bold">
                      RINCIAN BARANG & PEMBAYARAN
                    </h3>

                    <div className="bg-[#111111] border border-[#1c1c1c] p-4 space-y-3">
                      {(selectedOrder.items || []).map((it, idx) => (
                        <div key={idx} className="flex gap-3.5 items-center">
                          <div className="w-12 h-12 bg-[#171717] border border-[#222222] relative overflow-hidden shrink-0">
                            <Image src={it.image || "/placeholder.svg"} alt={it.productName} fill className="object-cover" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <span className="text-[9px] font-mono text-[#666666] uppercase block">{it.brand}</span>
                            <h4 className="text-xs font-sans font-semibold text-white truncate">{it.productName}</h4>
                            <span className="text-[10px] font-mono text-[#888888]">{it.selectedVariant} × {it.quantity}</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-white shrink-0">
                            {formatPrice(it.price * it.quantity)}
                          </span>
                        </div>
                      ))}

                      <div className="pt-3 border-t border-[#1c1c1c] space-y-1.5 text-xs font-mono text-[#888888]">
                        <div className="flex justify-between">
                          <span>Ongkir ({selectedOrder.courierCode}):</span>
                          <span className="text-white font-semibold">GRATIS</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Metode Pembayaran:</span>
                          <span className="text-[#D4FF00] font-bold">{selectedOrder.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-[#1c1c1c] pt-2 text-sm font-sans text-white font-bold">
                          <span>Total Tagihan:</span>
                          <span className="font-mono text-[#D4FF00]">{formatPrice(selectedOrder.price)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    {selectedOrder.status === "DELIVERED" && (
                      <button
                        type="button"
                        onClick={() => handleConfirmDelivery(selectedOrder.id)}
                        className="flex-1 py-3 bg-[#D4FF00] hover:bg-white text-black font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Konfirmasi Terima Barang ✓
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(null)}
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
