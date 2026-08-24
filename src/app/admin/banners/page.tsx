"use client";

import React, { useState, useMemo } from "react";
import { useAdminData, AdminBanner } from "@/context/AdminDataContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import CustomSelect from "@/components/ui/custom-select";
import Image from "next/image";

const IMAGE_PRESETS = [
  { label: "Hero IEM Model (Flagship)", value: "/model-iem-untuk-hero.webp" },
  { label: "Artisan Cable / Gear", value: "/placeholder.svg" },
  { label: "Logo & Brand Mark", value: "/logo.svg" },
];

export default function BannersCMSPage() {
  const { banners, addBanner, updateBanner, deleteBanner, toggleBannerStatus } = useAdminData();
  const { language } = useLanguage();
  const isEn = language === "English";

  const [searchQuery, setSearchQuery] = useState("");
  const [placementFilter, setPlacementFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdminBanner | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<AdminBanner | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    badge: "FLAGSHIP COLLECTION",
    placement: "HERO_HOME" as AdminBanner["placement"],
    imageUrl: "/model-iem-untuk-hero.webp",
    ctaText: "Explore Collection",
    ctaLink: "/collection",
    active: true,
    order: 1,
  });

  const processedBanners = useMemo(() => {
    return banners.filter((b) => {
      const matchSearch =
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchPlacement = placementFilter === "ALL" || b.placement === placementFilter;
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && b.active) ||
        (statusFilter === "INACTIVE" && !b.active);

      return matchSearch && matchPlacement && matchStatus;
    }).sort((a, b) => a.order - b.order);
  }, [banners, searchQuery, placementFilter, statusFilter]);

  const activeHeroBanners = banners.filter((b) => b.placement === "HERO_HOME" && b.active);
  const previewBanner = activeHeroBanners[0] || banners[0];

  const handleOpenAdd = () => {
    setFormData({
      title: "",
      subtitle: "",
      badge: "NEW RELEASE",
      placement: "HERO_HOME",
      imageUrl: "/model-iem-untuk-hero.webp",
      ctaText: "Explore Now",
      ctaLink: "/collection",
      active: true,
      order: banners.length + 1,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (b: AdminBanner) => {
    setEditingBanner(b);
    setFormData({
      title: b.title,
      subtitle: b.subtitle,
      badge: b.badge || "",
      placement: b.placement,
      imageUrl: b.imageUrl,
      ctaText: b.ctaText,
      ctaLink: b.ctaLink,
      active: b.active,
      order: b.order,
    });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    addBanner(formData);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    updateBanner(editingBanner.id, formData);
    setEditingBanner(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingBanner) return;
    deleteBanner(deletingBanner.id);
    setDeletingBanner(null);
  };

  return (
    <div className="space-y-6 text-[#FAF9F6] selection:bg-white selection:text-black">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold bg-[#1C1C1C] text-[#FAF9F6] border border-[#2E2E2E] px-2 py-0.5 rounded uppercase tracking-wider">
              {isEn ? "Banner & CMS" : "Banner & Promosi"}
            </span>
            <span className="text-[11px] font-mono text-[#888]">
              {isEn ? "Promotional Banners & Announcements" : "Tampilan Promo & Pengumuman"}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans">
            {isEn ? "Promotional Banners & Hero Slider CMS" : "Kelola Banner & Promosi Toko"}
          </h1>
          <p className="text-xs text-[#888] font-sans mt-0.5">
            {isEn
              ? "Configure showcase hero slider banners on the homepage and promotional announcements across the marketplace."
              : "Atur tayangan banner promosi di halaman utama (hero slider) dan halaman katalog toko."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#222222] hover:bg-[#333333] border border-[#3E3E3E] text-white text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {isEn ? "Add New Banner" : "Tambah Banner Baru"}
          </button>
        </div>
      </div>

      {/* LIVE HERO BANNER PREVIEW */}
      {previewBanner && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#777] font-semibold">
              {isEn ? "Homepage Hero Simulator Preview" : "Pratinjau Banner Halaman Utama"}
            </span>
            <span className="text-[10px] font-mono text-[#D4D4D8] font-medium bg-[#181818] border border-[#2E2E2E] px-2 py-0.5 rounded">
              {isEn ? `Placement: ${previewBanner.placement}` : `Posisi: ${previewBanner.placement}`}
            </span>
          </div>

          <div className="relative w-full rounded-2xl overflow-hidden border border-[#262626] bg-[#0c0c0c] min-h-[260px] sm:min-h-[300px] flex flex-col justify-center p-6 sm:p-10 shadow-xl">
            {/* Background Graphic Overlay */}
            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-1/2 opacity-25 sm:opacity-35 pointer-events-none flex items-center justify-center">
              <div className="relative w-full h-full">
                <Image
                  src={previewBanner.imageUrl}
                  alt={previewBanner.title}
                  fill
                  className="object-cover object-center"
                />
              </div>
            </div>

            <div className="relative z-10 max-w-xl space-y-3">
              {previewBanner.badge && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1e1e1e] border border-[#333] text-[9px] font-mono font-bold text-white tracking-widest uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {previewBanner.badge}
                </div>
              )}
              <h2 className="text-lg sm:text-2xl font-bold uppercase tracking-tight text-white leading-tight font-sans">
                {previewBanner.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#FAF9F6]/70 font-sans leading-relaxed">
                {previewBanner.subtitle}
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider rounded-lg shadow-md cursor-pointer hover:bg-[#e0e0e0] transition-colors">
                  {previewBanner.ctaText}
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Toolbar */}
      <div className="bg-[#111] border border-[#222] p-3.5 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder={isEn ? "Search banner title..." : "Cari judul banner..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161616] border border-[#2a2a2a] focus:border-white rounded-lg pl-9 pr-3.5 py-2 text-xs font-sans text-white placeholder:text-[#666] outline-none transition-colors"
            />
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777]"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Placement Tabs */}
            <div className="flex items-center bg-[#161616] p-1 rounded-lg border border-[#262626]">
              {[
                { id: "ALL", label: isEn ? "All Banners" : "Semua Banner" },
                { id: "HERO", label: isEn ? "Hero Slider" : "Halaman Utama (Hero)" },
                { id: "MID_PAGE", label: isEn ? "Mid Page" : "Tengah Halaman" },
                { id: "PROMO_STRIP", label: isEn ? "Promo Strip" : "Banner Promo" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPlacementFilter(tab.id)}
                  className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-all cursor-pointer border ${
                    placementFilter === tab.id
                      ? "bg-[#242424] text-[#FAF9F6] font-semibold border-[#383838] shadow-sm"
                      : "text-[#8E8E93] hover:text-[#FAF9F6] hover:bg-[#1A1A1A] border-transparent"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Status Filter Dropdown */}
            <CustomSelect
              variant="compact"
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { label: isEn ? "All Statuses" : "Semua Status", value: "ALL" },
                { label: isEn ? "Active Only" : "Hanya Aktif", value: "ACTIVE" },
                { label: isEn ? "Inactive Only" : "Hanya Nonaktif", value: "INACTIVE" },
              ]}
              buttonClassName="bg-[#161616] border border-[#2a2a2a] hover:border-[#444] text-xs font-mono text-white px-3 py-1.5 rounded-lg flex items-center justify-between gap-2 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Banner Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {processedBanners.length > 0 ? (
          processedBanners.map((banner) => (
            <div
              key={banner.id}
              className={`bg-[#121212] border rounded-xl p-4 flex flex-col justify-between transition-all duration-200 ${
                banner.active ? "border-[#333] shadow-md" : "border-[#202020] opacity-55"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#333] text-[#aaa]">
                      {isEn ? `Order #${banner.order}` : `Urutan #${banner.order}`}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-black font-semibold">
                      {banner.placement}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleBannerStatus(banner.id)}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase transition-colors cursor-pointer border bg-[#161616] text-[#D4D4D8] border-[#27272A]"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${banner.active ? "bg-emerald-400" : "bg-[#666]"}`} />
                    {banner.active ? (isEn ? "Active" : "Aktif") : (isEn ? "Inactive" : "Nonaktif")}
                  </button>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="w-16 h-16 rounded-lg bg-[#1a1a1a] border border-[#282828] shrink-0 overflow-hidden relative flex items-center justify-center">
                    <Image
                      src={banner.imageUrl}
                      alt={banner.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    {banner.badge && (
                      <span className="text-[9px] font-mono text-emerald-400 font-bold tracking-wider uppercase block">
                        {banner.badge}
                      </span>
                    )}
                    <h3 className="font-heading font-bold text-xs text-white uppercase tracking-wide truncate">
                      {banner.title}
                    </h3>
                    <p className="text-xs text-[#888] font-sans line-clamp-2 leading-relaxed">
                      {banner.subtitle}
                    </p>
                  </div>
                </div>

                <div className="bg-[#181818] p-2.5 rounded-lg border border-[#222] flex items-center justify-between text-xs font-mono text-[#888]">
                  <span className="truncate">CTA: <strong className="text-white">{banner.ctaText}</strong></span>
                  <span className="truncate max-w-[140px] text-[10px] text-[#666]">Link: {banner.ctaLink}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#222] pt-3 mt-3">
                <span className="text-[10px] font-mono text-[#666]">{banner.id} • {banner.createdAt}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(banner)}
                    className="px-2.5 py-1 bg-[#1c1c1c] hover:bg-[#282828] border border-[#333] hover:border-[#555] text-xs font-mono font-semibold text-white rounded-md transition-colors cursor-pointer"
                  >
                    {isEn ? "Edit" : "Ubah"}
                  </button>
                  <button
                    onClick={() => setDeletingBanner(banner)}
                    className="p-1 bg-[#1C1C1C] hover:bg-[#282828] text-[#A1A1AA] hover:text-white border border-[#2E2E2E] hover:border-white rounded-md transition-colors cursor-pointer"
                  >
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-12 text-center text-[#666] font-mono bg-[#111] rounded-xl border border-[#222]">
            {isEn ? "No banners found matching the filter criteria." : "Tidak ada banner yang sesuai dengan kriteria filter."}
          </div>
        )}
      </div>

      {/* ADD / EDIT BANNER MODAL */}
      <AnimatePresence>
        {(isAddModalOpen || editingBanner) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingBanner(null);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1, y: 0 }}
              className="relative w-full max-w-lg bg-[#141414] border border-[#333] rounded-2xl p-5 sm:p-6 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                <h3 className="text-sm font-bold text-white font-heading uppercase">
                  {editingBanner
                    ? (isEn ? "Edit Banner Details" : "Ubah Data Banner")
                    : (isEn ? "Create New Banner" : "Tambah Banner Baru")}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingBanner(null);
                  }}
                  className="text-[#888] hover:text-white p-1 cursor-pointer"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={editingBanner ? handleSaveEdit : handleSaveAdd} className="space-y-3.5 text-xs font-sans">
                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] text-[#aaa] uppercase">
                    {isEn ? "Banner Title / Headline *" : "Judul Utama Banner *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isEn ? "e.g. DISCOVER THE PINNACLE OF AUDIOPHILE SOUND" : "Contoh: RASAKAN DETAIL AUDIO TERBAIK"}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#181818] border border-[#333] focus:border-white rounded-lg px-3 py-2 text-white outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] text-[#aaa] uppercase">
                    {isEn ? "Subtitle / Description" : "Sub-judul / Deskripsi"}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={isEn ? "Brief description highlighting flagship IEMs or guarantee..." : "Deskripsi singkat mengenai promo produk flagship..."}
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full bg-[#181818] border border-[#333] focus:border-white rounded-lg p-2.5 text-white outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[11px] text-[#aaa] uppercase">
                      {isEn ? "Badge Text" : "Teks Label / Badge"}
                    </label>
                    <input
                      type="text"
                      placeholder={isEn ? "e.g. FLAGSHIP COLLECTION" : "Contoh: KOLEKSI FLAGSHIP"}
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full bg-[#181818] border border-[#333] focus:border-white rounded-lg px-3 py-2 text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-mono text-[11px] text-[#aaa] uppercase">
                      {isEn ? "Placement" : "Posisi Penempatan"}
                    </label>
                    <CustomSelect
                      value={formData.placement}
                      onChange={(val) => setFormData({ ...formData, placement: val as AdminBanner["placement"] })}
                      options={[
                        { label: isEn ? "Homepage Hero Slider" : "Hero Slider Halaman Utama", value: "HERO_HOME" },
                        { label: isEn ? "Promo Bar Strip" : "Strip Banner Promo", value: "PROMO_STRIP" },
                        { label: isEn ? "Event Popup" : "Popup Promo Event", value: "POPUP_EVENT" },
                        { label: isEn ? "Category Spotlight" : "Spotlight Kategori", value: "CATEGORY_SPOTLIGHT" },
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[11px] text-[#aaa] uppercase">
                      {isEn ? "CTA Button Text" : "Teks Tombol CTA"}
                    </label>
                    <input
                      type="text"
                      placeholder={isEn ? "e.g. Explore Collection" : "Contoh: Jelajahi Koleksi"}
                      value={formData.ctaText}
                      onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                      className="w-full bg-[#181818] border border-[#333] focus:border-white rounded-lg px-3 py-2 text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block font-mono text-[11px] text-[#aaa] uppercase">
                      {isEn ? "CTA Target URL" : "Link Tujuan CTA"}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. /collection or /support#escrow"
                      value={formData.ctaLink}
                      onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                      className="w-full bg-[#181818] border border-[#333] focus:border-white rounded-lg px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-[11px] text-[#aaa] uppercase">
                    {isEn ? "Banner Visual Asset" : "Gambar / Poster Banner"}
                  </label>
                  <CustomSelect
                    value={formData.imageUrl}
                    onChange={(val) => setFormData({ ...formData, imageUrl: val })}
                    options={IMAGE_PRESETS}
                  />
                  <input
                    type="text"
                    placeholder={isEn ? "Or custom image URL (e.g. /model-iem-untuk-hero.webp)" : "Atau URL gambar kustom (contoh: /model-iem-untuk-hero.webp)"}
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full bg-[#181818] border border-[#333] focus:border-white rounded-lg px-3 py-1.5 text-xs font-mono text-white outline-none mt-1.5"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded border-[#333] bg-[#1e1e1e] text-white focus:ring-0 cursor-pointer"
                    />
                    <span className="font-mono text-xs text-white">
                      {isEn ? "Enable / Publish Banner" : "Aktifkan & Publikasikan"}
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddModalOpen(false);
                        setEditingBanner(null);
                      }}
                      className="px-3 py-1.5 bg-[#222] hover:bg-[#333] text-white text-xs font-mono rounded-lg transition-colors cursor-pointer"
                    >
                      {isEn ? "Cancel" : "Batal"}
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-[#242424] hover:bg-[#333] border border-[#383838] text-white font-mono font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-sm"
                    >
                      {editingBanner
                        ? (isEn ? "Save Changes" : "Simpan Perubahan")
                        : (isEn ? "Create Banner" : "Buat Banner")}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingBanner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingBanner(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1, y: 0 }}
              className="relative w-full max-w-sm bg-[#141414] border border-[#333] rounded-2xl p-5 shadow-2xl z-10 space-y-4"
            >
              <h3 className="text-sm font-bold text-white font-heading uppercase">
                {isEn ? "Delete Banner?" : "Hapus Banner?"}
              </h3>
              <p className="text-xs text-[#888] font-sans">
                {isEn
                  ? `Are you sure you want to remove "${deletingBanner.title}"? This graphic will no longer appear on the website.`
                  : `Apakah Anda yakin ingin menghapus "${deletingBanner.title}"? Banner ini tidak akan muncul lagi di website.`}
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingBanner(null)}
                  className="px-3.5 py-1.5 bg-[#222] hover:bg-[#333] text-white text-xs font-mono rounded-lg transition-colors cursor-pointer"
                >
                  {isEn ? "Cancel" : "Batal"}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  {isEn ? "Delete" : "Hapus"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
