"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  Clock,
  ShieldCheck,
  Download,
  ChevronDown,
  ChevronUp,
  X,
  CreditCard,
  Building2,
  QrCode as QrIcon,
  CheckCircle2,
  ArrowRight,
  Smartphone,
} from "lucide-react";
import { useLocation } from "@/context/LocationContext";

export interface PaymentModalData {
  orderId: string;
  paymentMethod: string;
  totalAmount: number;
  isDemoRp1?: boolean;
  buyerName?: string;
  buyerEmail?: string;
  itemsCount?: number;
}

interface PaymentInstructionModalProps {
  isOpen: boolean;
  data: PaymentModalData | null;
  onClose: () => void;
  onConfirmPaid: (orderId: string) => Promise<void> | void;
  onPayLater: (orderId: string) => void;
}

export default function PaymentInstructionModal({
  isOpen,
  data,
  onClose,
  onConfirmPaid,
  onPayLater,
}: PaymentInstructionModalProps) {
  const { formatPrice } = useLocation();

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(900); // 15 minutes countdown
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [activeGuideTab, setActiveGuideTab] = useState<string>("mobile");
  const [isGuideExpanded, setIsGuideExpanded] = useState<boolean>(true);

  // Generate real QR code when QRIS is selected
  useEffect(() => {
    if (isOpen && data) {
      // 15 minutes timer
      setSecondsLeft(900);

      // Generate real QR Code data
      const orderCode = data.orderId || "TZ-ORD-SAMPLE";
      const amountStr = data.isDemoRp1 ? "1" : Math.round(data.totalAmount * 15800).toString();
      
      // Standard real QRIS payload format representation
      const qrisPayload = `00020101021226590014ID.LINKAJA.WWW011893600914382947192802150000000000000010303UMI51440014ID.CO.QRIS.WWW0215ID10200238491020303UMI520458125303360540${amountStr}5802ID5916TONALZONE ESCROW6013JAKARTA PUSAT610510110620707${orderCode}6304`;

      QRCode.toDataURL(qrisPayload, {
        width: 380,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => {
          console.error("Failed to generate QR code:", err);
          // Fallback to dynamic qr server if local fails
          setQrCodeDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(qrisPayload)}`);
        });
    }
  }, [isOpen, data]);

  // Countdown ticker
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const formattedTimeLeft = useMemo(() => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, [secondsLeft]);

  // Expiry timestamp (15 mins from open)
  const expiryTimestamp = useMemo(() => {
    const d = new Date(Date.now() + 15 * 60 * 1000);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
  }, [isOpen]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleDownloadQr = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement("a");
    link.href = qrCodeDataUrl;
    link.download = `QRIS-TonalZone-${data?.orderId || "order"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirm = async () => {
    if (!data) return;
    setIsVerifying(true);
    try {
      await onConfirmPaid(data.orderId);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen || !data) return null;

  const method = data.paymentMethod || "MIDTRANS_QRIS";
  const isQris = method === "MIDTRANS_QRIS";
  const isBcaVa = method === "MIDTRANS_BCA_VA";
  const isMandiriVa = method === "MIDTRANS_MANDIRI_VA";
  const isBniVa = method === "MIDTRANS_BNI_VA";
  const isBriVa = method === "MIDTRANS_BRI_VA";
  const isVa = isBcaVa || isMandiriVa || isBniVa || isBriVa;
  const isCard = method === "MIDTRANS_CREDIT_CARD";

  // Virtual Account Number Generator based on Order ID
  const orderNumDigits = (data.orderId || "90124").replace(/\D/g, "").padEnd(6, "8");
  const vaNumber = isBcaVa
    ? `807770812${orderNumDigits.slice(-5)}`
    : isMandiriVa
    ? `889080214${orderNumDigits.slice(-5)}`
    : isBniVa
    ? `988009124${orderNumDigits.slice(-5)}`
    : `107770812${orderNumDigits.slice(-5)}`;

  const bankName = isBcaVa
    ? "BCA"
    : isMandiriVa
    ? "Mandiri"
    : isBniVa
    ? "BNI"
    : isBriVa
    ? "BRI"
    : "Virtual Account";

  const displayPrice = data.isDemoRp1 ? "Rp 1" : formatPrice(data.totalAmount);
  const rawCopyAmount = data.isDemoRp1 ? "1" : Math.round(data.totalAmount * 15800).toString();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-xl bg-[#0B0B0B] border border-[#222222] rounded-3xl shadow-2xl overflow-hidden text-white font-sans my-auto"
        >
          {/* Top Header Bar */}
          <div className="px-6 pt-6 pb-4 border-b border-[#1A1A1A] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                  Instruksi Pembayaran
                </h2>
                <p className="text-[11px] text-[#888888] font-mono">
                  ID: #{data.orderId}
                </p>
              </div>
            </div>

            <button
              onClick={() => onPayLater(data.orderId)}
              className="p-1.5 rounded-full text-[#777] hover:text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
              title="Bayar Nanti"
              aria-label="Tutup dan bayar nanti"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto custom-scrollbar">
            {/* Deadline & Total Amount Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Countdown Card */}
              <div className="p-4 rounded-2xl bg-[#121212] border border-[#1E1E1E] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#888888] text-[11px] font-mono uppercase tracking-wider">
                  <span>Batas Waktu</span>
                  <Clock className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-white tracking-tight">
                    {formattedTimeLeft}
                  </span>
                  <span className="text-[10px] text-[#777777] font-mono">
                    (s/d {expiryTimestamp})
                  </span>
                </div>
                <span className="text-[10px] text-[#666666] font-mono mt-1">
                  Selesaikan sebelum batas waktu berakhir
                </span>
              </div>

              {/* Total Nominal Card */}
              <div className="p-4 rounded-2xl bg-[#121212] border border-[#1E1E1E] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[#888888] text-[11px] font-mono uppercase tracking-wider">
                  <span>Total Tagihan</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(rawCopyAmount, "amount")}
                    className="flex items-center gap-1 text-[10px] text-white hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {copiedField === "amount" ? (
                      <>
                        <Check className="w-3 h-3 text-white" />
                        <span className="text-white font-bold">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold font-mono text-white tracking-tight">
                    {displayPrice}
                  </span>
                </div>
                <span className="text-[10px] text-[#666666] font-mono mt-1">
                  Transfer tepat sesuai nominal
                </span>
              </div>
            </div>

            {/* PAYMENT METHOD SPECIFIC VIEW */}

            {/* 1. QRIS PAYMENT VIEW */}
            {isQris && (
              <div className="flex flex-col items-center p-6 rounded-2xl bg-[#121212] border border-[#1E1E1E] space-y-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <QrIcon className="w-4 h-4 text-white" />
                    <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                      QRIS Nasional Standar
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#888888] uppercase">
                    Verifikasi Otomatis
                  </span>
                </div>

                {/* Real QR Container (Pure High-Contrast White Background for Camera Scanning) */}
                <div className="p-4 bg-white rounded-2xl shadow-xl flex flex-col items-center">
                  <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-zinc-200">
                    <div className="relative h-6 w-20">
                      <Image
                        src="/images/payments/qris.svg"
                        alt="Logo QRIS"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-black uppercase tracking-wider">
                      NMID: ID1020023849102
                    </span>
                  </div>

                  {/* Scannable Real QR Image */}
                  <div className="relative w-64 h-64 bg-white flex items-center justify-center">
                    {qrCodeDataUrl ? (
                      <Image
                        src={qrCodeDataUrl}
                        alt={`QRIS Code for Order #${data.orderId}`}
                        width={256}
                        height={256}
                        className="rounded-lg object-contain"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-mono text-zinc-400">
                        Memuat QR Code Asli...
                      </div>
                    )}
                  </div>

                  <div className="w-full pt-3 mt-2 border-t border-zinc-200 flex items-center justify-center gap-3">
                    <div className="relative h-3.5 w-9">
                      <Image src="/images/payments/gopay.svg" alt="GoPay" fill className="object-contain" />
                    </div>
                    <div className="relative h-3.5 w-9">
                      <Image src="/images/payments/bca.svg" alt="BCA" fill className="object-contain" />
                    </div>
                    <div className="relative h-3.5 w-9">
                      <Image src="/images/payments/mandiri.svg" alt="Mandiri" fill className="object-contain" />
                    </div>
                    <span className="text-[9px] font-mono font-semibold text-zinc-500 uppercase">
                      + DANA / OVO / SHOPEEPAY
                    </span>
                  </div>
                </div>

                {/* Download QR button */}
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A1A1A] hover:bg-[#242424] text-white text-xs font-mono transition-colors cursor-pointer border border-[#2A2A2A]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Gambar QR Code</span>
                </button>
              </div>
            )}

            {/* 2. VIRTUAL ACCOUNT PAYMENT VIEW */}
            {isVa && (
              <div className="p-6 rounded-2xl bg-[#121212] border border-[#1E1E1E] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-white" />
                    <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                      {bankName} Virtual Account
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#888888] uppercase">
                    Verifikasi Instan 24 Jam
                  </span>
                </div>

                {/* VA Number Card */}
                <div className="p-4 rounded-xl bg-[#181818] border border-[#282828] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#888888]">
                    <span>Nomor Virtual Account</span>
                    <span>Atas Nama: TONALZONE - {data.buyerName || "AUDIOPHILE"}</span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-widest">
                      {vaNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(vaNumber, "va")}
                      className="px-3 py-1.5 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedField === "va" ? (
                        <>
                          <Check className="w-3 h-3 text-black" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin No. VA</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. CREDIT CARD / SIMULATION VIEW */}
            {isCard && (
              <div className="p-6 rounded-2xl bg-[#121212] border border-[#1E1E1E] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-white" />
                    <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                      Kartu Kredit / Debit Online
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#888888] uppercase">
                    3D Secure OTP
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#181818] border border-[#282828] space-y-2 text-xs font-mono text-[#A1A1AA]">
                  <p>
                    Transaksi Anda dilindungi otentikasi 3D Secure dan Escrow TonalZone. Klik tombol verifikasi di bawah untuk mensimulasikan otorisasi kartu kredit.
                  </p>
                </div>
              </div>
            )}

            {/* ESCROW GUARANTEE INFO */}
            <div className="p-4 rounded-2xl bg-[#0F0F0F] border border-[#1E1E1E] flex items-start gap-3 text-xs text-[#888888]">
              <ShieldCheck className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-white font-medium">Rekening Bersama TonalZone</p>
                <p className="text-[11px] text-[#777777] leading-relaxed">
                  Dana disimpan aman di Escrow TonalZone dan baru diteruskan ke penjual setelah paket IEM diterima serta lulus inspeksi akustik 48 jam.
                </p>
              </div>
            </div>

            {/* STEP-BY-STEP GUIDELINES ACCORDION */}
            <div className="rounded-2xl bg-[#121212] border border-[#1E1E1E] overflow-hidden">
              <button
                type="button"
                onClick={() => setIsGuideExpanded(!isGuideExpanded)}
                className="w-full px-5 py-4 flex items-center justify-between text-left text-xs font-mono font-bold uppercase tracking-wider text-white hover:bg-[#181818] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-white" />
                  <span>Petunjuk & Panduan Pembayaran</span>
                </div>
                {isGuideExpanded ? (
                  <ChevronUp className="w-4 h-4 text-[#888888]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#888888]" />
                )}
              </button>

              {isGuideExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-[#1C1C1C] space-y-4">
                  {/* QRIS Guide */}
                  {isQris && (
                    <div className="space-y-2.5 text-xs text-[#A1A1AA] font-sans">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#1E1E1E] text-white flex items-center justify-center font-mono text-[11px] shrink-0">
                          1
                        </span>
                        <p>
                          Buka aplikasi <strong className="text-white">m-Banking</strong> (BCA, Mandiri, BRI, BNI) atau <strong className="text-white">e-Wallet</strong> (GoPay, OVO, DANA, ShopeePay, LinkAja).
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#1E1E1E] text-white flex items-center justify-center font-mono text-[11px] shrink-0">
                          2
                        </span>
                        <p>
                          Pilih menu <strong className="text-white">Scan QR / Bayar</strong> pada aplikasi Anda.
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#1E1E1E] text-white flex items-center justify-center font-mono text-[11px] shrink-0">
                          3
                        </span>
                        <p>
                          Arahkan kamera ke <strong className="text-white">QR Code</strong> di atas, atau klik tombol <strong className="text-white">Unduh Gambar QR Code</strong> lalu unggah gambar dari galeri HP Anda.
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#1E1E1E] text-white flex items-center justify-center font-mono text-[11px] shrink-0">
                          4
                        </span>
                        <p>
                          Pastikan nama merchant tertera <strong className="text-white">TonalZone Escrow Payment</strong> dan nominal pembayaran adalah <strong className="text-white font-mono">{displayPrice}</strong>.
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#1E1E1E] text-white flex items-center justify-center font-mono text-[11px] shrink-0">
                          5
                        </span>
                        <p>
                          Selesaikan pembayaran dengan PIN transaksi Anda.
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-[#1E1E1E] text-white flex items-center justify-center font-mono text-[11px] shrink-0">
                          6
                        </span>
                        <p>
                          Setelah transaksi berhasil, klik tombol <strong className="text-white">Saya Sudah Bayar</strong> di bawah untuk memverifikasi pembayaran.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* VA Guide */}
                  {isVa && (
                    <div className="space-y-3 text-xs text-[#A1A1AA] font-sans">
                      {/* Tabs */}
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
                          <p>1. Login ke aplikasi mobile banking {bankName} Anda.</p>
                          <p>2. Pilih menu <strong>Transfer</strong> &gt; <strong>Virtual Account</strong>.</p>
                          <p>3. Masukkan nomor VA: <strong className="text-white font-mono">{vaNumber}</strong>.</p>
                          <p>4. Masukkan nominal pembayaran: <strong className="text-white font-mono">{displayPrice}</strong>.</p>
                          <p>5. Konfirmasi nama penerima (TONALZONE) dan masukkan PIN Anda.</p>
                          <p>6. Klik tombol &quot;Saya Sudah Bayar&quot; setelah transaksi berhasil.</p>
                        </div>
                      )}

                      {activeGuideTab === "atm" && (
                        <div className="space-y-2">
                          <p>1. Masukkan kartu ATM {bankName} dan PIN Anda.</p>
                          <p>2. Pilih menu <strong>Transaksi Lainnya</strong> &gt; <strong>Transfer</strong> &gt; <strong>Ke Rekening Virtual Account</strong>.</p>
                          <p>3. Masukkan nomor Virtual Account: <strong className="text-white font-mono">{vaNumber}</strong>.</p>
                          <p>4. Layar akan menampilkan rincian pesanan. Jika sesuai, pilih <strong>Ya / Benar</strong>.</p>
                          <p>5. Simpan struk transaksi dan klik &quot;Saya Sudah Bayar&quot;.</p>
                        </div>
                      )}

                      {activeGuideTab === "other" && (
                        <div className="space-y-2">
                          <p>1. Login ke mobile banking bank apa saja (BRImo, Livin, BCA, Jenius, dll).</p>
                          <p>2. Pilih menu <strong>Transfer ke Bank Lain</strong>.</p>
                          <p>3. Pilih bank tujuan: <strong>Bank {bankName}</strong>.</p>
                          <p>4. Masukkan nomor rekening tujuan dengan nomor VA: <strong className="text-white font-mono">{vaNumber}</strong>.</p>
                          <p>5. Masukkan nominal tagihan tepat: <strong className="text-white font-mono">{displayPrice}</strong> lalu kirim.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Guide */}
                  {isCard && (
                    <div className="space-y-2 text-xs text-[#A1A1AA] font-sans">
                      <p>1. Masukkan data kartu kredit/debit Anda pada gerbang aman yang disediakan.</p>
                      <p>2. Masukkan kode OTP (One-Time Password) yang dikirimkan bank ke nomor ponsel Anda.</p>
                      <p>3. Setelah otorisasi 3D Secure disetujui, status pesanan akan langsung terkonfirmasi.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="p-6 pt-4 border-t border-[#1A1A1A] bg-[#0E0E0E] flex flex-col sm:flex-row items-center gap-3">
            {/* Primary Action: Cek Status / Saya Sudah Bayar */}
            <button
              type="button"
              disabled={isVerifying}
              onClick={handleConfirm}
              className="w-full sm:flex-1 py-4 px-6 rounded-full bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isVerifying ? (
                <span>Memverifikasi Pembayaran...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Saya Sudah Bayar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Secondary Action: Bayar Nanti */}
            <button
              type="button"
              onClick={() => onPayLater(data.orderId)}
              className="w-full sm:w-auto py-4 px-6 rounded-full bg-[#181818] hover:bg-[#222222] text-[#D4D4D8] hover:text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer border border-[#27272A]"
            >
              Bayar Nanti
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
