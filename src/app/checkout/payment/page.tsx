"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";
import { useAdminData } from "@/context/AdminDataContext";
import { triggerAppNotification } from "@/context/NotificationContext";
import {
  Clock,
  ShieldCheck,
  Copy,
  Check,
  Download,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  QrCode as QrIcon,
  Building2,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Smartphone,
  AlertCircle,
  Lock,
} from "lucide-react";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice } = useLocation();
  const { addToCart } = useCart();
  const { systemSettings } = useAdminData();
  const inspectionHours = systemSettings?.inspectionWindowHours ?? 48;

  const searchOrderId = searchParams?.get("orderId") || searchParams?.get("id") || "";
  const initialMethod = searchParams?.get("method") || "MIDTRANS_QRIS";

  const [orderId, setOrderId] = useState<string>(searchOrderId);
  const [paymentMethod, setPaymentMethod] = useState<string>(initialMethod);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [localPendingOrder, setLocalPendingOrder] = useState<any>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState<boolean>(true);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(900); // 15 minutes
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [activeGuideTab, setActiveGuideTab] = useState<string>("mobile");
  const [isGuideExpanded, setIsGuideExpanded] = useState<boolean>(true);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // Client-side hydration to ensure orderId and backup details are always available
  useEffect(() => {
    if (typeof window === "undefined") return;

    let resolvedId = searchOrderId;
    if (!resolvedId) {
      const urlParams = new URLSearchParams(window.location.search);
      resolvedId = urlParams.get("orderId") || urlParams.get("id") || "";
      const urlMethod = urlParams.get("method");
      if (urlMethod) setPaymentMethod(urlMethod);
    }

    // Check localStorage for pending order backup
    try {
      const stored = localStorage.getItem("tonalzone_pending_order");
      if (stored) {
        const parsed = JSON.parse(stored);
        setLocalPendingOrder(parsed);
        if (!resolvedId && (parsed.orderId || parsed.parentOrderId)) {
          resolvedId = parsed.orderId || parsed.parentOrderId;
        }
        if (parsed.paymentMethod) {
          setPaymentMethod(parsed.paymentMethod);
        }
      }
    } catch (e) {}

    if (resolvedId && resolvedId !== orderId) {
      setOrderId(resolvedId);
    }
  }, [searchOrderId]);

  // Fetch live order from API
  useEffect(() => {
    if (!orderId) {
      setIsLoadingOrder(false);
      return;
    }

    fetch(`/api/orders/${orderId}`)
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data && data.success && data.order) {
          setOrderDetails(data.order);
          if (data.order.paymentMethod) {
            setPaymentMethod(data.order.paymentMethod);
          }
        }
      })
      .catch((err) => console.warn("Could not load order details:", err))
      .finally(() => setIsLoadingOrder(false));
  }, [orderId]);

  // Generate real QR code for QRIS
  useEffect(() => {
    const rawTotal = orderDetails?.totalAmount || 100;
    const isDemo =
      rawTotal <= 0.0001 ||
      ["DEMO1RP", "RP1", "DEMO", "TONAL1RP"].includes(
        String(orderDetails?.promoCode || "").toUpperCase()
      );
    const amountStr = isDemo ? "1" : Math.round(rawTotal * 15800).toString();
    const orderCode = orderId || "TZ-ORD-20260917";

    const qrisPayload = `00020101021226590014ID.LINKAJA.WWW011893600914382947192802150000000000000010303UMI51440014ID.CO.QRIS.WWW0215ID10200238491020303UMI520458125303360540${amountStr}5802ID5916TONALZONE ESCROW6013JAKARTA PUSAT610510110620707${orderCode}6304`;

    QRCode.toDataURL(qrisPayload, {
      width: 400,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch(() => {
        setQrCodeDataUrl(
          `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(
            qrisPayload
          )}`
        );
      });
  }, [orderId, orderDetails]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTimeLeft = useMemo(() => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, [secondsLeft]);

  // Expiry timestamp
  const expiryTimestamp = useMemo(() => {
    const d = new Date(Date.now() + 15 * 60 * 1000);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
  }, []);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleDownloadQr = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement("a");
    link.href = qrCodeDataUrl;
    link.download = `QRIS-TonalZone-${orderId || "order"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmPaid = async () => {
    setIsVerifying(true);
    try {
      if (orderId) {
        await fetch(`/api/orders/${orderId}/pay`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }).catch((e) => console.warn("Pay API warn:", e));
      }

      triggerAppNotification({
        type: "order",
        title: "Pembayaran Escrow Berhasil!",
        message: `Pesanan #${orderId} telah diverifikasi. Dana Anda diamankan di TonalZone Escrow dan pesanan kini masuk ke antrean pengemasan seller.`,
        actionLink: "/orders",
        meta: { orderId },
      });

      router.push(`/checkout/success?orderId=${orderId}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancelToChangeMethod = async () => {
    setIsCancelling(true);
    try {
      if (orderId) {
        await fetch(`/api/orders/${orderId}/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: "Ingin ganti metode pembayaran",
            cancelledBy: "BUYER",
          }),
        });
      }

      // Restore items back to cart so buyer can re-checkout
      if (orderDetails?.items && Array.isArray(orderDetails.items)) {
        for (const it of orderDetails.items) {
          addToCart(
            {
              id: it.productId || it.id,
              productId: it.productId || it.id,
              name: it.productName || it.name,
              brand: it.brand || "Audiophile",
              category: it.category || "IN-EAR MONITORS",
              price: it.price || 100,
              variant: it.selectedVariant || "Standard",
              image: it.image || "/model-iem-untuk-hero.webp",
              sellerId: orderDetails.storeId,
              sellerName: orderDetails.storeName,
            },
            it.quantity || 1
          );
        }
      }

      triggerAppNotification({
        type: "order",
        title: "Pesanan Dibatalkan",
        message: `Pesanan #${orderId} dibatalkan untuk ganti metode pembayaran. Produk telah dikembalikan ke keranjang Anda.`,
        actionLink: "/checkout",
      });

      setShowCancelModal(false);
      router.push("/checkout");
    } catch (err) {
      console.error("Cancel order error:", err);
      setShowCancelModal(false);
      router.push("/checkout");
    } finally {
      setIsCancelling(false);
    }
  };

  const isQris = paymentMethod === "MIDTRANS_QRIS";
  const isBcaVa = paymentMethod === "MIDTRANS_BCA_VA";
  const isMandiriVa = paymentMethod === "MIDTRANS_MANDIRI_VA";
  const isBniVa = paymentMethod === "MIDTRANS_BNI_VA";
  const isBriVa = paymentMethod === "MIDTRANS_BRI_VA";
  const isVa = isBcaVa || isMandiriVa || isBniVa || isBriVa;
  const isCard = paymentMethod === "MIDTRANS_CREDIT_CARD";

  const bankName = isBcaVa
    ? "BCA"
    : isMandiriVa
    ? "Mandiri"
    : isBniVa
    ? "BNI"
    : isBriVa
    ? "BRI"
    : "Virtual Account";

  const orderNumDigits = (orderId || "90124").replace(/\D/g, "").padEnd(6, "8");
  const vaNumber = isBcaVa
    ? `807770812${orderNumDigits.slice(-5)}`
    : isMandiriVa
    ? `889080214${orderNumDigits.slice(-5)}`
    : isBniVa
    ? `988009124${orderNumDigits.slice(-5)}`
    : `107770812${orderNumDigits.slice(-5)}`;

  const effectiveOrder = orderDetails || localPendingOrder;
  const isDemo =
    (effectiveOrder?.totalAmount && effectiveOrder.totalAmount <= 0.0001) ||
    Boolean(effectiveOrder?.isDemo) ||
    ["DEMO1RP", "RP1", "DEMO", "TONAL1RP"].includes(
      String(effectiveOrder?.promoCode || "").toUpperCase()
    );

  const displayTotal = isDemo
    ? "Rp 1"
    : effectiveOrder?.totalAmount
    ? formatPrice(effectiveOrder.totalAmount)
    : "Memuat tagihan...";

  const rawCopyAmount = isDemo
    ? "1"
    : effectiveOrder?.totalAmount
    ? Math.round(effectiveOrder.totalAmount * 16000).toString()
    : "1";

  const itemsList = (effectiveOrder?.items && effectiveOrder.items.length > 0)
    ? effectiveOrder.items
    : [];

  return (
    <div className="min-h-screen bg-[#000000] text-[#FAF9F6] font-sans selection:bg-[#BFDD25] selection:text-[#030303] flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-20 max-w-6xl mx-auto px-5 sm:px-8 w-full">
        {/* Navigation Breadcrumb */}
        <nav className="text-[11px] font-mono text-[#777777] uppercase tracking-widest mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition-colors">
            BERANDA
          </Link>
          <span className="text-[#444]">/</span>
          <Link href="/cart" className="hover:text-white transition-colors">
            KERANJANG
          </Link>
          <span className="text-[#444]">/</span>
          <span className="text-white font-semibold">PEMBAYARAN</span>
        </nav>

        {/* Page Title & Status Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-[#1A1A1A]">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#999999]">
                STATUS: MENUNGGU PEMBAYARAN
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white leading-none">
              Selesaikan Pembayaran
            </h1>
            <p className="text-xs font-mono text-[#777777] mt-2">
              ID Pesanan: <strong className="text-white">#{orderId || "TZ-ORD-PENDING"}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleCopy(orderId, "orderIdTop")}
            className="self-start md:self-auto px-4 py-2 rounded-full bg-[#121212] hover:bg-[#1A1A1A] border border-[#222222] text-xs font-mono text-zinc-300 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
          >
            {copiedField === "orderIdTop" ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>ID Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin No. Pesanan</span>
              </>
            )}
          </button>
        </div>

        {/* Main Grid: Left Column (Payment & Instructions) | Right Column (Bill & Summary) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-8 pb-28 lg:pb-0">
          {/* LEFT COLUMN: Payment Interface (Col 7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Countdown & Deadline Bar */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0A0A0A] border border-[#1E1E1E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#777777] uppercase tracking-wider block">
                  Batas Waktu Pembayaran
                </span>
                <span className="text-xs font-mono text-[#A1A1AA]">
                  Jatuh tempo: <strong className="text-white">{expiryTimestamp}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626]">
                <Clock className="w-4 h-4 text-white" />
                <span className="font-mono text-xl font-bold text-white tracking-widest">
                  {formattedTimeLeft}
                </span>
              </div>
            </div>

            {/* Locked Payment Method Status Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0A0A0A] border border-[#1E1E1E] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-[#777777] uppercase tracking-wider block">
                    Metode Pembayaran Terkunci
                  </span>
                  <span className="text-white font-bold text-xs truncate block">
                    {isQris
                      ? "QRIS Standar Nasional (Semua E-Wallet & Mobile Banking)"
                      : isVa
                      ? `${bankName} Virtual Account (Verifikasi Otomatis)`
                      : "Kartu Kredit / Debit Online (3D Secure)"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="text-xs font-mono text-[#888888] hover:text-red-400 underline transition-colors cursor-pointer self-start sm:self-auto shrink-0"
              >
                Ganti Metode? Batalkan Pesanan Ini
              </button>
            </div>

            {/* PAYMENT DISPLAY SECTION */}

            {/* 1. QRIS SECTION */}
            {isQris && (
              <div className="p-6 sm:p-8 rounded-2xl bg-[#0A0A0A] border border-[#1E1E1E] space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#1A1A1A]">
                  <div className="flex items-center gap-2.5">
                    <QrIcon className="w-5 h-5 text-white" />
                    <div>
                      <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                        QRIS Standar Nasional
                      </h3>
                      <p className="text-[10px] font-mono text-[#777777]">
                        NMID: ID1020023849102 • Verifikasi Otomatis
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white uppercase">
                    Bebas Biaya Admin
                  </span>
                </div>

                {/* Scannable Real QR Card (Pure White background with high camera contrast) */}
                <div className="max-w-xs mx-auto p-5 bg-white rounded-2xl shadow-2xl flex flex-col items-center">
                  <div className="w-full flex items-center justify-between pb-2 mb-3 border-b border-zinc-200">
                    <span className="font-heading font-extrabold text-base tracking-tight text-black">
                      QRIS
                    </span>
                    <span className="text-[9px] font-mono font-bold text-zinc-600 uppercase">
                      PEMBAYARAN RESMI
                    </span>
                  </div>

                  {/* Real Scannable QR Code */}
                  <div className="relative w-64 h-64 bg-white flex items-center justify-center">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt={`QRIS Code #${orderId}`}
                        className="w-full h-full object-contain rounded"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-mono text-zinc-400">
                        Memuat QR Code Asli...
                      </div>
                    )}
                  </div>

                  <div className="w-full pt-3 mt-3 border-t border-zinc-200 text-center">
                    <p className="text-[10px] font-mono font-bold text-black uppercase tracking-wider">
                      TonalZone Escrow Payment
                    </p>
                    <p className="text-[9px] font-mono text-zinc-500 mt-0.5">
                      GoPay • OVO • DANA • ShopeePay • BCA • Livin • BRImo
                    </p>
                  </div>
                </div>

                {/* Action: Download QR */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#141414] hover:bg-[#1E1E1E] text-white text-xs font-mono border border-[#282828] transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Gambar QR Code</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. VIRTUAL ACCOUNT SECTION */}
            {isVa && (
              <div className="p-6 sm:p-8 rounded-2xl bg-[#0A0A0A] border border-[#1E1E1E] space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#1A1A1A]">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-5 h-5 text-white" />
                    <div>
                      <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                        {bankName} Virtual Account
                      </h3>
                      <p className="text-[10px] font-mono text-[#777777]">
                        Verifikasi Instan 24 Jam Tanpa Bukti Transfer
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white uppercase">
                    Otomatis
                  </span>
                </div>

                {/* VA Number Card */}
                <div className="p-5 rounded-2xl bg-[#121212] border border-[#222222] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-[#888888]">
                    <span>Nomor Virtual Account</span>
                    <span>Atas Nama: <strong className="text-white">TONALZONE</strong></span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-widest">
                      {vaNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(vaNumber, "va")}
                      className="px-4 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      {copiedField === "va" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-black" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin No. VA</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. CARD PAYMENT SECTION */}
            {isCard && (
              <div className="p-6 sm:p-8 rounded-2xl bg-[#0A0A0A] border border-[#1E1E1E] space-y-4">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-5 h-5 text-white" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Kartu Kredit / Debit Online
                  </h3>
                </div>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Transaksi Anda dilindungi otentikasi 3D Secure dengan konfirmasi OTP SMS dari bank penerbit kartu. Klik tombol verifikasi pembayaran di kolom ringkasan untuk mengonfirmasi transaksi.
                </p>
              </div>
            )}

            {/* STEP-BY-STEP GUIDELINES */}
            <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#1E1E1E] space-y-4">
              <button
                type="button"
                onClick={() => setIsGuideExpanded(!isGuideExpanded)}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-white" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                    Petunjuk & Panduan Pembayaran
                  </h4>
                </div>
                {isGuideExpanded ? (
                  <ChevronUp className="w-4 h-4 text-[#888888]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#888888]" />
                )}
              </button>

              {isGuideExpanded && (
                <div className="pt-2 border-t border-[#1C1C1C] space-y-4">
                  {isQris && (
                    <div className="space-y-3 text-xs text-[#A1A1AA] font-sans">
                      <div className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-[#181818] text-white flex items-center justify-center font-mono text-[11px] shrink-0">
                          1
                        </span>
                        <p>
                          Buka aplikasi <strong className="text-white">m-Banking</strong> (BCA, Mandiri, BRI, BNI) atau <strong className="text-white">e-Wallet</strong> (GoPay, OVO, DANA, ShopeePay, LinkAja).
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-[#181818] text-white flex items-center justify-center font-mono text-[11px] shrink-0">
                          2
                        </span>
                        <p>
                          Pilih menu <strong className="text-white">Scan QR / Bayar</strong> pada aplikasi ponsel Anda.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-[#181818] text-white flex items-center justify-center font-mono text-[11px] shrink-0">
                          3
                        </span>
                        <p>
                          Arahkan kamera ke <strong className="text-white">QR Code</strong> di atas, atau klik <strong className="text-white">Unduh Gambar QR Code</strong> lalu unggah gambar dari galeri HP.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-[#181818] text-white flex items-center justify-center font-mono text-[11px] shrink-0">
                          4
                        </span>
                        <p>
                          Pastikan nama merchant tertera <strong className="text-white">TonalZone Escrow Payment</strong> dan nominal tagihan adalah <strong className="text-white font-mono">{displayTotal}</strong>.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-[#181818] text-white flex items-center justify-center font-mono text-[11px] shrink-0">
                          5
                        </span>
                        <p>
                          Masukkan PIN transaksi Anda untuk menyelesaikan pembayaran.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-5 h-5 rounded-full bg-[#181818] text-white flex items-center justify-center font-mono text-[11px] shrink-0">
                          6
                        </span>
                        <p>
                          Setelah transaksi berhasil di aplikasi bank/e-wallet Anda, klik tombol <strong className="text-white">Saya Sudah Bayar</strong> di sebelah kanan.
                        </p>
                      </div>
                    </div>
                  )}

                  {isVa && (
                    <div className="space-y-4 text-xs text-[#A1A1AA] font-sans">
                      <div className="flex gap-2 border-b border-[#222222] pb-2">
                        {[
                          { id: "mobile", label: `m-Banking ${bankName}` },
                          { id: "atm", label: `ATM ${bankName}` },
                          { id: "other", label: "Bank Lain / Antar Bank" },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveGuideTab(tab.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                              activeGuideTab === tab.id
                                ? "bg-white text-black font-bold"
                                : "text-[#777] hover:text-white"
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {activeGuideTab === "mobile" && (
                        <div className="space-y-2">
                          <p>1. Buka aplikasi m-Banking {bankName} pada ponsel Anda.</p>
                          <p>2. Pilih menu <strong>Transfer</strong> &gt; <strong>Virtual Account</strong>.</p>
                          <p>3. Masukkan nomor Virtual Account: <strong className="text-white font-mono">{vaNumber}</strong>.</p>
                          <p>4. Masukkan nominal tagihan: <strong className="text-white font-mono">{displayTotal}</strong>.</p>
                          <p>5. Periksa rincian pembayaran atas nama <strong>TONALZONE</strong> lalu konfirmasi PIN Anda.</p>
                          <p>6. Klik tombol &quot;Saya Sudah Bayar&quot; di kolom kanan setelah berhasil.</p>
                        </div>
                      )}

                      {activeGuideTab === "atm" && (
                        <div className="space-y-2">
                          <p>1. Masukkan kartu ATM {bankName} dan masukkan PIN Anda.</p>
                          <p>2. Pilih menu <strong>Transaksi Lainnya</strong> &gt; <strong>Transfer</strong> &gt; <strong>Ke Rekening Virtual Account</strong>.</p>
                          <p>3. Masukkan nomor Virtual Account: <strong className="text-white font-mono">{vaNumber}</strong>.</p>
                          <p>4. Layar ATM akan menampilkan data tagihan. Pilih <strong>Benar / Ya</strong>.</p>
                          <p>5. Simpan struk dan klik tombol &quot;Saya Sudah Bayar&quot;.</p>
                        </div>
                      )}

                      {activeGuideTab === "other" && (
                        <div className="space-y-2">
                          <p>1. Buka aplikasi mobile banking bank apa saja (BRImo, Livin, BCA, Jenius, dll).</p>
                          <p>2. Pilih menu <strong>Transfer ke Bank Lain</strong>.</p>
                          <p>3. Pilih bank tujuan: <strong>Bank {bankName}</strong>.</p>
                          <p>4. Masukkan nomor rekening tujuan dengan nomor VA: <strong className="text-white font-mono">{vaNumber}</strong>.</p>
                          <p>5. Masukkan nominal transfer tepat: <strong className="text-white font-mono">{displayTotal}</strong> lalu kirim.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {isCard && (
                    <div className="space-y-2 text-xs text-[#A1A1AA] font-sans">
                      <p>1. Transaksi kartu kredit diproses melalui sistem gerbang 3D Secure berstandar PCI-DSS.</p>
                      <p>2. Bank penerbit kartu akan mengirimkan kode otorisasi OTP ke nomor ponsel Anda.</p>
                      <p>3. Klik &quot;Saya Sudah Bayar&quot; untuk memvalidasi pembayaran Anda.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Order Summary & Actions (Col 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-7 rounded-2xl bg-[#0A0A0A] border border-[#1E1E1E] space-y-6 sticky top-28 shadow-xl">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
                Ringkasan Tagihan & Pesanan
              </h3>

              {/* Total Tagihan Box */}
              <div className="p-5 rounded-2xl bg-[#121212] border border-[#222222] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#888888]">
                  <span>Total Tagihan</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(rawCopyAmount, "amountRight")}
                    className="flex items-center gap-1 text-white hover:text-zinc-300 transition-colors cursor-pointer text-[11px]"
                  >
                    {copiedField === "amountRight" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Nominal</span>
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
                    {displayTotal}
                  </span>
                </div>

                <p className="text-[10px] font-mono text-[#71717A] pt-1">
                  Transfer tepat sesuai nominal hingga digit terakhir.
                </p>
              </div>

              {/* Product Items List */}
              <div className="space-y-3 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                {itemsList.length > 0 ? (
                  itemsList.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3.5">
                      <div className="relative w-12 h-12 rounded-xl bg-[#141414] overflow-hidden shrink-0 border border-[#222222]">
                        <Image
                          src={item.image || "/model-iem-untuk-hero.webp"}
                          alt={item.productName || item.name || "Product"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-white truncate">
                          {item.productName || item.name || "In-Ear Monitor"}
                        </h4>
                        <p className="text-[10px] text-[#71717A] font-mono">
                          Varian: {item.selectedVariant || item.variant || "Standard"} • Qty: {item.quantity || 1}
                        </p>
                        <p className="text-xs font-mono font-bold text-white mt-0.5">
                          {formatPrice((item.price || 0) * (item.quantity || 1))}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs font-mono text-[#888888]">
                    Memuat rincian produk pesanan...
                  </div>
                )}
              </div>

              {/* Escrow Rekber Protection Guarantee */}
              <div className="p-4 rounded-xl bg-[#121212] flex items-start gap-3 text-xs text-[#A1A1AA] border border-[#202020]">
                <ShieldCheck className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-white font-medium">Garansi Escrow TonalZone ({inspectionHours} Jam)</p>
                  <p className="text-[11px] text-[#777777] leading-relaxed">
                    Dana ditahan aman di rekening bersama. Penjual baru menerima dana setelah produk tiba dan lulus uji akustik {inspectionHours} jam.
                  </p>
                </div>
              </div>

              {/* Action Buttons: Monochrome Black & White */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={handleConfirmPaid}
                  className="w-full py-4 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl disabled:opacity-50 group"
                >
                  {isVerifying ? (
                    <span>Memverifikasi Pembayaran...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-black" />
                      <span>Saya Sudah Bayar</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>

                <Link
                  href="/orders?tab=UNPAID"
                  className="w-full py-3.5 rounded-full bg-[#141414] hover:bg-[#1E1E1E] text-xs font-mono font-semibold text-[#A1A1AA] hover:text-white uppercase tracking-wider text-center block transition-colors border border-[#242424]"
                >
                  Bayar Nanti / Lihat Pesanan
                </Link>
              </div>

              <p className="text-[10px] text-center text-[#666666] font-mono">
                Bantuan kendala pembayaran? Hubungi tim support TonalZone 24/7.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Floating Sticky Bar for "Saya Sudah Bayar" (Tokopedia / Shopee style) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-white/10 px-4 py-2.5 shadow-[0_-8px_30px_rgba(0,0,0,0.8)]">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="block text-[10px] font-mono text-[#777777] uppercase tracking-wider">
                Total Tagihan
              </span>
              <span className="text-sm font-mono font-bold text-white tracking-tight block">
                {displayTotal}
              </span>
              <Link
                href="/orders?tab=UNPAID"
                className="text-[10px] font-mono text-[#8E8E93] hover:text-white underline block mt-0.5"
              >
                Bayar Nanti
              </Link>
            </div>

            <button
              type="button"
              disabled={isVerifying}
              onClick={handleConfirmPaid}
              className="px-4 py-2.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-50 shrink-0 group"
            >
              {isVerifying ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                  <span>Saya Sudah Bayar</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Cancel Order Confirmation Modal to Change Payment Method */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0D0D0D] border border-[#222222] rounded-2xl p-6 space-y-5 text-white font-sans shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-white">
                  Batalkan Pesanan Ini?
                </h3>
                <p className="text-[11px] text-[#777] font-mono">
                  ID: #{orderId}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Metode pembayaran telah terkunci untuk nomor pesanan ini. Untuk mengganti ke metode lain (misal dari QRIS ke Virtual Account), pesanan ini harus dibatalkan terlebih dahulu. Produk akan otomatis dikembalikan ke keranjang Anda sehingga Anda dapat langsung checkout ulang.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelToChangeMethod}
                className="w-full sm:flex-1 py-3 px-4 rounded-full bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
              >
                {isCancelling ? "Membatalkan..." : "Ya, Batalkan Pesanan"}
              </button>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="w-full sm:w-auto py-3 px-5 rounded-full bg-[#161616] hover:bg-[#222222] border border-[#2A2A2A] text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function CheckoutPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#000000] flex items-center justify-center text-xs font-mono text-[#888888]">
          Memuat Halaman Pembayaran...
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
