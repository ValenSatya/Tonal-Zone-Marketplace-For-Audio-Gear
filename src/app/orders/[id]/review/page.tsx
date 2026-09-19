"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Star,
  Camera,
  X,
  Store,
  ShieldCheck,
  Check,
  CheckCircle2,
} from "lucide-react";
import { triggerAppNotification } from "@/context/NotificationContext";

interface ImpressionCategory {
  category: string;
  tags: string[];
}

const IMPRESSION_GROUPS: ImpressionCategory[] = [
  {
    category: "Karakter Suara",
    tags: [
      "Vokal Jernih & Detail",
      "Bass Berbobot & Rapi",
      "Treble Halus & Airy",
      "Separasi Instrumen Luas",
      "Karakter Suara Natural",
    ],
  },
  {
    category: "Fisik & Kenyamanan",
    tags: [
      "Fitting Nyaman di Telinga",
      "Build Quality Solid",
      "Kabel Lembut & Tahan Kusut",
      "Isolasi Pasif Sangat Baik",
    ],
  },
  {
    category: "Layanan Toko",
    tags: [
      "Pengiriman Super Cepat",
      "Packing Tebal & Aman",
      "Respon Penjual Cepat",
    ],
  },
];

const RATING_DESCRIPTIONS: Record<number, { title: string; hint: string }> = {
  1: {
    title: "Sangat Mengecewakan",
    hint: "Kualitas audio atau fisik jauh di bawah ekspektasi",
  },
  2: {
    title: "Kurang Memuaskan",
    hint: "Ada beberapa kekurangan pada performa atau fitting",
  },
  3: {
    title: "Cukup Baik",
    hint: "Kualitas memenuhi standar pada rentang harganya",
  },
  4: {
    title: "Puas",
    hint: "Kualitas suara dan build quality memuaskan",
  },
  5: {
    title: "Sangat Puas",
    hint: "Kualitas audio luar biasa, sangat direkomendasikan",
  },
};

export default function OrderReviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = (params?.id as string) || searchParams.get("orderId") || "";
  const targetProductId = searchParams.get("productId") || "";

  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [sellerRating, setSellerRating] = useState<number>(5);
  const [shippingRating, setShippingRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>("");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch Order Context
  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setIsLoadingOrder(false);
        return;
      }

      try {
        setIsLoadingOrder(true);
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.order) {
            setOrderData(data.order);
            const foundProduct = targetProductId
              ? data.order.items?.find((it: any) => it.productId === targetProductId)
              : data.order.items?.[0];
            setSelectedProduct(foundProduct || data.order.items?.[0] || null);
          }
        }
      } catch (err) {
        console.error("Failed to load order for review:", err);
      } finally {
        setIsLoadingOrder(false);
      }
    }

    loadOrder();
  }, [orderId, targetProductId]);

  // Pseudonymized buyer name preview
  const maskedBuyerName = useMemo(() => {
    const rawName = orderData?.buyerName || "Valen Andrasatya";
    if (rawName.length <= 3) return rawName[0] + "***";
    return rawName.slice(0, 2) + "***" + rawName.slice(-1);
  }, [orderData?.buyerName]);

  // Toggle quick tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Handle local photo upload selection with automatic compression
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - uploadedPhotos.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    for (const file of filesToAdd) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const compressed = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            if (!result) return resolve("");
            const img = new window.Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              let { width, height } = img;
              const maxDim = 1200;
              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = Math.round((height * maxDim) / width);
                  width = maxDim;
                } else {
                  width = Math.round((width * maxDim) / height);
                  height = maxDim;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", 0.82));
              } else {
                resolve(result);
              }
            };
            img.onerror = () => resolve(result);
            img.src = result;
          };
          reader.onerror = () => resolve("");
          reader.readAsDataURL(file);
        });

        if (compressed) {
          setUploadedPhotos((prev) => [...prev, compressed].slice(0, 5));
        }
      } catch (err) {
        console.error("Error reading photo:", err);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Review Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || rating < 1) {
      setErrorMessage("Silakan tentukan rating bintang sebelum mengirim ulasan.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const productId = selectedProduct?.productId || "prod-blessing3";
      const productName = selectedProduct?.productName || "MOONDROP BLESSING 3 Hybrid";
      const productImage =
        selectedProduct?.image ||
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800";
      const variant = selectedProduct?.selectedVariant || "3.5mm Single-Ended";

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          productId,
          productName,
          productImage,
          variant,
          rating,
          comment,
          photos: uploadedPhotos,
          tags: selectedTags,
          isAnonymous,
          buyerName: isAnonymous ? maskedBuyerName : orderData?.buyerName || "Pembeli Terverifikasi",
        }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setIsSuccess(true);
        triggerAppNotification({
          type: "system",
          title: "Penilaian Berhasil Dipublikasikan",
          message: `Ulasan ${rating} bintang untuk ${productName} telah disimpan ke katalog komunitas.`,
          actionLink: `/product/${productId}`,
        });

        setTimeout(() => {
          router.push("/orders?tab=COMPLETED");
        }, 1200);
      } else {
        setErrorMessage(result.error || "Gagal mengirim penilaian. Silakan coba kembali.");
      }
    } catch (err: any) {
      console.error("Error submitting review:", err);
      setErrorMessage("Koneksi bermasalah saat mengirim ulasan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRating = hoverRating || rating;
  const activeRatingMeta = RATING_DESCRIPTIONS[activeRating] || RATING_DESCRIPTIONS[5];

  return (
    <div className="min-h-screen bg-[#050505] text-[#FAF9F6] selection:bg-[#BFDD25] selection:text-black">
      {/* 1. Header: Sleek Flow */}
      <header className="sticky top-0 z-40 bg-[#080808]/90 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/orders"
            className="flex items-center gap-2 text-xs font-mono text-[#8E8E93] hover:text-white transition-colors bg-[#121212] px-3 py-1.5 rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Kembali ke Pesanan</span>
          </Link>

          <span className="text-sm font-semibold tracking-tight text-white">
            Nilai Produk
          </span>

          <div className="text-[11px] font-mono text-[#888888] bg-[#121212] px-2.5 py-1 rounded-full">
            {orderId ? `#${orderId.replace("ORD-", "")}` : "ID Pesanan"}
          </div>
        </div>
      </header>

      {/* 2. Main Content Form */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Main Cohesive Review Card */}
          <div className="bg-[#0A0A0A] rounded-2xl shadow-2xl overflow-hidden border-0 space-y-px">
            {/* Section A: Product Identification Header */}
            <div className="p-5 sm:p-6 bg-[#0E0E0E]/80 flex items-start gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#141414] shrink-0 border-0">
                {selectedProduct?.image ? (
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct?.productName || "Product"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#555555] text-xs font-mono">
                    IEM
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8E8E93]">
                  <Store className="w-3.5 h-3.5 text-white" />
                  <span className="truncate font-medium">
                    {orderData?.storeName || "MOONDROP Official Flagship Store"}
                  </span>
                </div>

                <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight leading-snug line-clamp-2">
                  {selectedProduct?.productName || "MOONDROP BLESSING 3 Hybrid In-Ear Monitor"}
                </h1>

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="text-[11px] font-mono text-[#AAAAAA] bg-[#161616] px-2.5 py-1 rounded-full border-0">
                    {selectedProduct?.selectedVariant || "3.5mm Single-Ended"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-[#181818] px-2.5 py-1 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Terverifikasi</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Section B: Star Rating Assessment */}
            <div className="p-5 sm:p-6 text-center space-y-3">
              <div className="text-xs font-mono uppercase tracking-widest text-[#71717A]">
                Penilaian Kualitas Produk
              </div>

              {/* Star Rating Group */}
              <div className="flex items-center justify-center gap-2.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= activeRating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                      aria-label={`Nilai ${star} dari 5`}
                    >
                      <Star
                        className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                          isFilled
                            ? "fill-white text-white"
                            : "fill-transparent text-[#262626] hover:text-[#444444]"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Rating Meaning Label */}
              <div className="space-y-0.5 pt-1">
                <div className="text-sm font-semibold text-white tracking-tight">
                  {activeRatingMeta.title}
                </div>
                <div className="text-xs font-mono text-[#666666]">
                  {activeRatingMeta.hint}
                </div>
              </div>
            </div>

            {/* Section C: Impression Tags */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono uppercase tracking-wider text-[#71717A]">
                  Poin Impresi Pembeli
                </div>
                <div className="text-[11px] font-mono text-[#555555]">
                  Pilih yang mewakili pengalaman Anda
                </div>
              </div>

              <div className="space-y-3">
                {IMPRESSION_GROUPS.map((group) => (
                  <div key={group.category} className="space-y-2">
                    <div className="text-[11px] font-mono text-[#8E8E93]">
                      {group.category}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.tags.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all border-0 cursor-pointer ${
                              isSelected
                                ? "bg-white text-black font-semibold shadow-sm"
                                : "bg-[#141414] text-[#888888] hover:text-[#FAF9F6] hover:bg-[#1A1A1A]"
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section D: Written Review & Character Count */}
            <div className="p-5 sm:p-6 space-y-2.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="review-comment"
                  className="text-xs font-mono uppercase tracking-wider text-[#71717A]"
                >
                  Ulasan Tertulis
                </label>
                <span className="text-[11px] font-mono text-[#555555]">
                  {comment.length} / 500
                </span>
              </div>

              <textarea
                id="review-comment"
                rows={4}
                maxLength={500}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Bagikan impresi suara Anda (karakter bass, midrange vokal, treble), fitting eartips di telinga, serta kualitas packaging penjual..."
                className="w-full bg-[#121212] border-0 rounded-xl p-4 text-xs sm:text-sm text-[#FAF9F6] placeholder-[#484848] focus:bg-[#161616] focus:ring-1 focus:ring-white/30 outline-none resize-none transition-all leading-relaxed"
              />
            </div>

            {/* Section E: Media / Photo Upload (Shopee-Style) */}
            <div className="p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono uppercase tracking-wider text-[#71717A]">
                  Foto & Video Produk
                </div>
                <div className="text-[11px] font-mono text-[#555555]">
                  {uploadedPhotos.length} / 5 Foto
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {/* Upload Trigger Button */}
                {uploadedPhotos.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-20 sm:h-22 rounded-xl border-0 bg-[#121212] hover:bg-[#181818] flex flex-col items-center justify-center gap-1.5 text-[#71717A] hover:text-white transition-colors cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="text-[10px] font-mono">Tambah Foto</span>
                  </button>
                )}

                {/* Uploaded Photos Preview List */}
                {uploadedPhotos.map((src, index) => (
                  <div
                    key={index}
                    className="relative h-20 sm:h-22 rounded-xl overflow-hidden bg-[#121212] group border-0"
                  >
                    <img
                      src={src}
                      alt={`Foto ulasan ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer"
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
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Section F: Seller Service & Delivery Speed */}
            <div className="p-5 sm:p-6 space-y-4 bg-[#090909]/60">
              <div className="text-xs font-mono uppercase tracking-wider text-[#71717A]">
                Penilaian Pelayanan Toko
              </div>

              <div className="space-y-3">
                {/* Row 1: Seller Service */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans text-[#AAAAAA]">
                    Pelayanan Penjual & Komunikasi
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSellerRating(star)}
                        className="p-0.5 cursor-pointer text-[#333333] hover:text-white focus:outline-none"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= sellerRating
                              ? "fill-white text-white"
                              : "fill-transparent text-[#2A2A2A]"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row 2: Delivery Speed */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans text-[#AAAAAA]">
                    Kecepatan & Keamanan Pengiriman
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setShippingRating(star)}
                        className="p-0.5 cursor-pointer text-[#333333] hover:text-white focus:outline-none"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= shippingRating
                              ? "fill-white text-white"
                              : "fill-transparent text-[#2A2A2A]"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section G: Anonymity Setting */}
            <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-white">
                  Tampilkan Ulasan Secara Anonim
                </div>
                <div className="text-[11px] font-mono text-[#666666]">
                  {isAnonymous
                    ? `Nama Anda akan ditampilkan sebagai: ${maskedBuyerName}`
                    : `Ulasan akan mencantumkan nama akun Anda`}
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#222222] rounded-full peer peer-checked:bg-white transition-colors relative after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-5 peer-checked:after:bg-black" />
              </label>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-red-950/40 rounded-xl text-xs font-mono text-red-300 border-0">
              {errorMessage}
            </div>
          )}

          {/* Section H: Action Submit Bar */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="w-full py-4 px-6 rounded-full font-bold text-sm tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer bg-white text-black hover:bg-[#E4E4E7] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
            >
              {isSubmitting ? (
                <span className="font-mono text-xs uppercase tracking-wider">
                  Memproses Ulasan...
                </span>
              ) : isSuccess ? (
                <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
                  <Check className="w-4 h-4 stroke-[3]" />
                  Ulasan Berhasil Terkirim
                </span>
              ) : (
                <span>Kirim Penilaian</span>
              )}
            </button>
          </div>
        </form>

        {/* Minimal Bottom Trust Note */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#71717A] bg-[#0E0E0E] px-4 py-2 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ulasan terverifikasi otomatis memperbarui skor katalog produk</span>
          </div>
        </div>
      </main>

      {/* Subtle Notification Toast on Success */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 inset-x-0 mx-auto max-w-sm px-4 z-50 pointer-events-none"
          >
            <div className="bg-[#141414] rounded-2xl p-4 shadow-2xl flex items-center gap-3 border-0">
              <div className="w-9 h-9 rounded-full bg-[#181818] text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white">
                  Penilaian Tersimpan
                </div>
                <div className="text-[11px] font-mono text-[#8E8E93] truncate">
                  Mengarahkan kembali ke pesanan...
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
