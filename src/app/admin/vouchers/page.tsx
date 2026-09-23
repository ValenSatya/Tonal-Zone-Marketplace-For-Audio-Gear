"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket,
  Plus,
  Search,
  Copy,
  Check,
  RotateCcw,
  Edit2,
  Trash2,
  X,
  Percent,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { useLocation } from "@/context/LocationContext";

interface VoucherItem {
  id: string;
  code: string;
  title: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "SPECIAL_RP1";
  discountValue: number;
  minSpend: number;
  maxDiscount?: number;
  quota: number;
  usedCount: number;
  startDate?: string;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminVouchersPage() {
  const { formatPrice } = useLocation();
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Notifications
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<VoucherItem | null>(null);
  const [deleteConfirmVoucher, setDeleteConfirmVoucher] = useState<VoucherItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT" | "SPECIAL_RP1",
    discountValue: 10,
    minSpend: 0,
    maxDiscount: "",
    quota: 100,
    expiryDate: "",
    isActive: true,
  });

  const triggerBanner = (type: "success" | "error", text: string) => {
    setBannerMessage({ type, text });
    setTimeout(() => setBannerMessage(null), 3500);
  };

  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/vouchers");
      const data = await res.json();
      if (data.success && Array.isArray(data.vouchers)) {
        setVouchers(data.vouchers);
      } else {
        triggerBanner("error", data.error || "Gagal memuat daftar voucher.");
      }
    } catch {
      triggerBanner("error", "Terjadi kesalahan saat memuat data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleGenerateRandomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "TZ-";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, code: result }));
  };

  const openCreateModal = () => {
    setEditingVoucher(null);
    setFormData({
      code: "",
      title: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minSpend: 0,
      maxDiscount: "",
      quota: 100,
      expiryDate: "",
      isActive: true,
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (v: VoucherItem) => {
    setEditingVoucher(v);
    setFormData({
      code: v.code,
      title: v.title,
      description: v.description || "",
      discountType: v.discountType,
      discountValue: v.discountValue,
      minSpend: v.minSpend,
      maxDiscount: v.maxDiscount !== undefined ? String(v.maxDiscount) : "",
      quota: v.quota,
      expiryDate: v.expiryDate ? v.expiryDate.split("T")[0] : "",
      isActive: v.isActive,
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      triggerBanner("error", "Kode voucher wajib diisi.");
      return;
    }
    if (!formData.title.trim()) {
      triggerBanner("error", "Judul voucher wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingVoucher
        ? `/api/admin/vouchers/${editingVoucher.id}`
        : "/api/admin/vouchers";
      const method = editingVoucher ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menyimpan voucher.");
      }

      setIsCreateModalOpen(false);
      triggerBanner(
        "success",
        editingVoucher ? "Voucher berhasil diperbarui." : "Voucher baru berhasil dibuat."
      );
      fetchVouchers();
    } catch (err: any) {
      triggerBanner("error", err.message || "Gagal menyimpan voucher.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (v: VoucherItem) => {
    try {
      const res = await fetch(`/api/admin/vouchers/${v.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !v.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setVouchers((prev) =>
          prev.map((item) => (item.id === v.id ? { ...item, isActive: !item.isActive } : item))
        );
        triggerBanner(
          "success",
          !v.isActive ? `Voucher ${v.code} diaktifkan.` : `Voucher ${v.code} dinonaktifkan.`
        );
      } else {
        triggerBanner("error", data.error || "Gagal memperbarui status.");
      }
    } catch {
      triggerBanner("error", "Terjadi kesalahan koneksi.");
    }
  };

  const handleDeleteVoucher = async () => {
    if (!deleteConfirmVoucher) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/vouchers/${deleteConfirmVoucher.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setVouchers((prev) => prev.filter((item) => item.id !== deleteConfirmVoucher.id));
        setDeleteConfirmVoucher(null);
        triggerBanner("success", `Voucher ${deleteConfirmVoucher.code} berhasil dihapus.`);
      } else {
        triggerBanner("error", data.error || "Gagal menghapus voucher.");
      }
    } catch {
      triggerBanner("error", "Gagal menghapus voucher.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered list
  const filtered = vouchers.filter((v) => {
    if (statusFilter === "ACTIVE" && !v.isActive) return false;
    if (statusFilter === "INACTIVE" && v.isActive) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.code.toLowerCase().includes(q) ||
        v.title.toLowerCase().includes(q) ||
        (v.description && v.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalVouchers = vouchers.length;
  const activeVouchers = vouchers.filter((v) => v.isActive).length;
  const totalUsed = vouchers.reduce((acc, v) => acc + (v.usedCount || 0), 0);

  return (
    <div className="flex-1 min-h-screen bg-[#030303] text-[#FAF9F6] p-6 sm:p-8 space-y-6">
      {/* Top Banner Alert */}
      <AnimatePresence>
        {bannerMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-2xl text-xs font-sans flex items-center gap-3 bg-[#181818] text-white border border-[#27272A]"
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
              Tampilan & Promosi
            </span>
            <span className="text-[#3F3F46]">/</span>
            <span className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider">
              Manajemen Voucher
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white font-heading">
            Kode Redeem & Voucher
          </h1>
          <p className="text-xs text-[#8E8E93] font-sans mt-1">
            Buat dan kelola kode promo diskon persentase, potongan nominal, maupun voucher demo transaksi.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchVouchers}
            className="px-4 py-2.5 rounded-full bg-[#111111] hover:bg-[#1A1A1A] text-xs font-mono text-[#A1A1AA] hover:text-white transition-all flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Segarkan</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-full bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Voucher Baru</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[#0A0A0A] p-5 space-y-2 border-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#71717A]">
              Total Kode Redeem
            </span>
            <Ticket className="w-4 h-4 text-[#A1A1AA]" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">{totalVouchers}</p>
          <span className="text-[11px] text-[#71717A] block">
            Semua voucher yang terdaftar di sistem
          </span>
        </div>

        <div className="rounded-2xl bg-[#0A0A0A] p-5 space-y-2 border-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#71717A]">
              Voucher Aktif
            </span>
            <Layers className="w-4 h-4 text-[#A1A1AA]" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">{activeVouchers}</p>
          <span className="text-[11px] text-[#71717A] block">
            Siap digunakan pembeli di keranjang
          </span>
        </div>

        <div className="rounded-2xl bg-[#0A0A0A] p-5 space-y-2 border-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#71717A]">
              Total Penggunaan
            </span>
            <CheckCircle2 className="w-4 h-4 text-[#A1A1AA]" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">{totalUsed}x</p>
          <span className="text-[11px] text-[#71717A] block">
            Frekuensi penebusan voucher transaksi
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { key: "ALL", label: "Semua" },
              { key: "ACTIVE", label: "Aktif" },
              { key: "INACTIVE", label: "Nonaktif" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-full text-xs font-sans whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.key
                  ? "bg-white text-black font-semibold"
                  : "bg-[#111111] text-[#8E8E93] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode promo atau judul..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#0E0E0E] text-xs text-white placeholder:text-[#52525B] outline-none border-0 focus:ring-1 focus:ring-white/30"
          />
        </div>
      </div>

      {/* Voucher Cards Grid */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#333333] border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-[#71717A] tracking-wider uppercase">
            Memuat Daftar Voucher...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-[#0A0A0A] p-10 space-y-2">
          <Ticket className="w-10 h-10 text-[#52525B] mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-white">Tidak Ada Voucher</h3>
          <p className="text-xs text-[#71717A] max-w-sm mx-auto">
            {searchQuery
              ? "Tidak ada voucher yang cocok dengan pencarian."
              : "Belum ada kode promo yang dibuat. Klik tombol di atas untuk membuat voucher baru."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((v) => {
            const isExpired = v.expiryDate && new Date(v.expiryDate).getTime() < Date.now();
            const isQuotaFull = v.quota > 0 && v.usedCount >= v.quota;

            return (
              <div
                key={v.id}
                className="rounded-2xl bg-[#0A0A0A] p-6 space-y-5 transition-all hover:bg-[#0C0C0C] flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Bar: Code Badge & Status */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-1.5 rounded-full bg-[#181818] text-xs font-mono font-bold text-white tracking-widest uppercase">
                        {v.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(v.code)}
                        className="w-7 h-7 rounded-full bg-[#141414] hover:bg-[#202020] text-[#A1A1AA] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Salin Kode Promo"
                      >
                        {copiedCode === v.code ? (
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                          !v.isActive
                            ? "bg-[#181818] text-[#71717A]"
                            : isExpired
                            ? "bg-[#201515] text-[#D4D4D8]"
                            : isQuotaFull
                            ? "bg-[#1E1E1E] text-[#A1A1AA]"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        {!v.isActive
                          ? "Nonaktif"
                          : isExpired
                          ? "Kedaluwarsa"
                          : isQuotaFull
                          ? "Kuota Habis"
                          : "Aktif"}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">{v.title}</h3>
                    {v.description && (
                      <p className="text-xs text-[#8E8E93] leading-relaxed mt-1 line-clamp-2">
                        {v.description}
                      </p>
                    )}
                  </div>

                  {/* Discount Details Pill */}
                  <div className="p-3.5 rounded-xl bg-[#121212] space-y-2 text-xs font-mono">
                    <div className="flex justify-between items-center text-white">
                      <span className="text-[#71717A]">Potongan:</span>
                      <span className="font-bold">
                        {v.discountType === "SPECIAL_RP1"
                          ? "Total Bayar Rp 1"
                          : v.discountType === "PERCENTAGE"
                          ? `Diskon ${v.discountValue}%`
                          : `Potongan ${formatPrice(v.discountValue)}`}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[#A1A1AA]">
                      <span className="text-[#71717A]">Min. Belanja:</span>
                      <span>{v.minSpend > 0 ? formatPrice(v.minSpend) : "Tanpa Minimal"}</span>
                    </div>

                    {v.maxDiscount && v.maxDiscount > 0 && (
                      <div className="flex justify-between items-center text-[#A1A1AA]">
                        <span className="text-[#71717A]">Maks. Diskon:</span>
                        <span>{formatPrice(v.maxDiscount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[#A1A1AA]">
                      <span className="text-[#71717A]">Penggunaan:</span>
                      <span>
                        {v.usedCount} / {v.quota > 0 ? `${v.quota} kuota` : "Tak Terbatas"}
                      </span>
                    </div>

                    {v.expiryDate && (
                      <div className="flex justify-between items-center text-[#A1A1AA] pt-1 border-t border-[#1C1C1C]">
                        <span className="text-[#71717A] flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Berlaku Hingga:
                        </span>
                        <span>
                          {new Date(v.expiryDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between gap-2 pt-4 border-t border-[#181818]">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(v)}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono transition-colors cursor-pointer ${
                      v.isActive
                        ? "bg-[#161616] text-[#A1A1AA] hover:text-white"
                        : "bg-white text-black font-semibold"
                    }`}
                  >
                    {v.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(v)}
                      className="w-8 h-8 rounded-full bg-[#141414] hover:bg-[#1E1E1E] text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Edit Voucher"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmVoucher(v)}
                      className="w-8 h-8 rounded-full bg-[#181818] hover:bg-red-950/80 text-[#A1A1AA] hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                      title="Hapus Voucher"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create & Edit Voucher */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl bg-[#0E0E0E] p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-1 border-b border-[#1C1C1C]">
                <div className="flex items-center gap-2 text-white">
                  <Ticket className="w-4 h-4" />
                  <h3 className="text-base font-bold uppercase tracking-wider font-mono">
                    {editingVoucher ? "Edit Kode Redeem / Voucher" : "Buat Kode Redeem Baru"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#1A1A1A] hover:bg-[#282828] text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveVoucher} className="space-y-4">
                {/* Kode Voucher & Generator */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717A] mb-1.5">
                    Kode Voucher *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value.toUpperCase() })
                      }
                      placeholder="Contoh: AUDIOPHILE2026"
                      className="w-full px-4 py-3 rounded-2xl bg-[#181818] text-xs font-mono uppercase text-white placeholder:text-[#52525B] outline-none border-0 focus:ring-1 focus:ring-white/30"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleGenerateRandomCode}
                      className="px-4 py-3 rounded-2xl bg-[#1C1C1C] hover:bg-[#262626] text-xs font-mono text-[#A1A1AA] hover:text-white whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Acak</span>
                    </button>
                  </div>
                </div>

                {/* Judul Promo */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717A] mb-1.5">
                    Judul Promo *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Contoh: Diskon Akhir Tahun 15%"
                    className="w-full px-4 py-3 rounded-2xl bg-[#181818] text-xs text-white placeholder:text-[#52525B] outline-none border-0 focus:ring-1 focus:ring-white/30"
                    required
                  />
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717A] mb-1.5">
                    Deskripsi / Catatan Promo (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Keterangan singkat tentang syarat atau kategori produk promo..."
                    className="w-full p-4 rounded-2xl bg-[#181818] text-xs text-white placeholder:text-[#52525B] outline-none border-0 focus:ring-1 focus:ring-white/30"
                  />
                </div>

                {/* Tipe Diskon Selection */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717A] mb-1.5">
                    Tipe Diskon *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, discountType: "PERCENTAGE", discountValue: 10 })}
                      className={`p-3 rounded-2xl text-xs font-mono transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        formData.discountType === "PERCENTAGE"
                          ? "bg-white text-black font-bold"
                          : "bg-[#181818] text-[#8E8E93] hover:text-white"
                      }`}
                    >
                      <Percent className="w-4 h-4" />
                      <span>Persentase (%)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, discountType: "FIXED_AMOUNT", discountValue: 5 })}
                      className={`p-3 rounded-2xl text-xs font-mono transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        formData.discountType === "FIXED_AMOUNT"
                          ? "bg-white text-black font-bold"
                          : "bg-[#181818] text-[#8E8E93] hover:text-white"
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Potongan Nominal</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, discountType: "SPECIAL_RP1", discountValue: 1 })}
                      className={`p-3 rounded-2xl text-xs font-mono transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        formData.discountType === "SPECIAL_RP1"
                          ? "bg-white text-black font-bold"
                          : "bg-[#181818] text-[#8E8E93] hover:text-white"
                      }`}
                    >
                      <Ticket className="w-4 h-4" />
                      <span>Demo Rp 1</span>
                    </button>
                  </div>
                </div>

                {/* Nilai Diskon Input */}
                {formData.discountType !== "SPECIAL_RP1" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717A] mb-1.5">
                        {formData.discountType === "PERCENTAGE" ? "Persentase Diskon (%) *" : "Nilai Potongan ($) *"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={formData.discountValue}
                        onChange={(e) =>
                          setFormData({ ...formData, discountValue: Number(e.target.value) })
                        }
                        className="w-full px-4 py-3 rounded-2xl bg-[#181818] text-xs font-mono text-white outline-none border-0 focus:ring-1 focus:ring-white/30"
                        required
                      />
                    </div>

                    {formData.discountType === "PERCENTAGE" && (
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717A] mb-1.5">
                          Maksimal Diskon ($ opsional)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={formData.maxDiscount}
                          onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                          placeholder="Tanpa batas"
                          className="w-full px-4 py-3 rounded-2xl bg-[#181818] text-xs font-mono text-white placeholder:text-[#52525B] outline-none border-0 focus:ring-1 focus:ring-white/30"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Minimal Belanja & Kuota */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717A] mb-1.5">
                      Minimal Belanja ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={formData.minSpend}
                      onChange={(e) => setFormData({ ...formData, minSpend: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#181818] text-xs font-mono text-white outline-none border-0 focus:ring-1 focus:ring-white/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717A] mb-1.5">
                      Batas Kuota Pemakaian
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quota}
                      onChange={(e) => setFormData({ ...formData, quota: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#181818] text-xs font-mono text-white outline-none border-0 focus:ring-1 focus:ring-white/30"
                      required
                    />
                  </div>
                </div>

                {/* Tanggal Kedaluwarsa */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#71717A] mb-1.5">
                    Tanggal Kedaluwarsa (Opsional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#181818] text-xs font-mono text-white outline-none border-0 focus:ring-1 focus:ring-white/30"
                  />
                </div>

                {/* Status Aktif Switch */}
                <label className="flex items-center gap-3 pt-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded accent-white text-white focus:ring-white/30 bg-[#1A1A1A] border-0 cursor-pointer"
                  />
                  <span className="text-xs text-[#D4D4D8]">
                    Aktifkan voucher ini agar dapat langsung digunakan oleh pembeli
                  </span>
                </label>

                {/* Submit Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1C1C1C]">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-5 py-2.5 rounded-full bg-[#181818] hover:bg-[#222222] text-xs font-semibold text-[#A1A1AA] transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-full bg-white hover:bg-[#E4E4E7] text-black text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {isSubmitting ? "Menyimpan..." : editingVoucher ? "Simpan Perubahan" : "Buat Voucher"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Confirm Delete */}
      <AnimatePresence>
        {deleteConfirmVoucher && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl bg-[#0E0E0E] p-6 space-y-4"
            >
              <h3 className="text-base font-bold text-white">Hapus Kode Voucher</h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Apakah Anda yakin ingin menghapus voucher{" "}
                <span className="font-mono text-white font-bold">
                  {deleteConfirmVoucher.code}
                </span>
                ? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmVoucher(null)}
                  className="px-5 py-2.5 rounded-full bg-[#181818] hover:bg-[#222222] text-xs font-semibold text-[#A1A1AA] transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteVoucher}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-[#2A2A2A] hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  {isSubmitting ? "Menghapus..." : "Hapus Voucher"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
