"use client";

import React, { useState } from "react";
import { useAdminData, AdminCategory } from "@/context/AdminDataContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

export default function CatalogConfigPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useAdminData();
  const { language } = useLanguage();
  const isEn = language === "English";

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<AdminCategory | null>(null);
  const [deletingCat, setDeletingCat] = useState<AdminCategory | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cat: AdminCategory) => {
    setEditingCat(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
    });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    addCategory({
      ...formData,
      slug: formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, "-"),
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;
    updateCategory(editingCat.id, formData);
    setEditingCat(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingCat) return;
    deleteCategory(deletingCat.id);
    setDeletingCat(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold bg-[#141414] text-[#BFDD25] px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BFDD25] shadow-[0_0_6px_rgba(191,221,37,0.8)]" />
              {isEn ? "Taxonomy Configuration" : "Konfigurasi Taksonomi"}
            </span>
            <span className="text-[11px] font-mono text-[#777777]">
              {isEn ? "Catalog Structure & Metadata" : "Struktur Katalog & Metadata"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-3">
            {isEn ? "Product Categories & Tags" : "Kategori Produk & Tag Taksonomi"}
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#141414] text-white/80">
              {categories.length} {isEn ? "Categories" : "Kategori"}
            </span>
          </h1>
          <p className="text-xs text-[#888888] font-sans mt-1">
            {isEn
              ? "Configure audiophile product taxonomy categories, URL slugs, and metadata descriptions."
              : "Konfigurasi taksonomi kategori produk audio, slug URL, dan deskripsi metadata."}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-[#BFDD25] hover:bg-[#aecd20] text-black text-xs font-mono font-bold rounded-full transition-all flex items-center gap-2 shadow-[0_0_14px_rgba(191,221,37,0.3)] cursor-pointer w-fit shrink-0"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>{isEn ? "Add Category" : "Tambah Kategori"}</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-6 bg-[#0A0A0A] hover:bg-[#0E0E0E] rounded-2xl flex flex-col justify-between transition-all group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white text-base tracking-tight">{cat.name}</h3>
                <span className="text-[10px] font-mono bg-[#141414] text-[#BFDD25] px-2.5 py-0.5 rounded-full font-bold">
                  {cat.itemCount} {isEn ? "items" : "produk"}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#BFDD25]/80 bg-[#121212] px-2.5 py-0.5 rounded-lg inline-block mb-3">
                /{cat.slug}
              </span>
              <p className="text-xs text-[#888888] leading-relaxed font-sans">{cat.description}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-6 mt-2">
              <button
                onClick={() => handleOpenEdit(cat)}
                className="px-4 py-1.5 bg-[#141414] hover:bg-[#202020] text-white text-xs font-mono font-medium rounded-full transition-colors cursor-pointer"
              >
                {isEn ? "Edit" : "Ubah"}
              </button>
              <button
                onClick={() => setDeletingCat(cat)}
                className="px-4 py-1.5 bg-[#141414] hover:bg-red-500/20 text-[#888888] hover:text-red-400 text-xs font-mono font-medium rounded-full transition-colors cursor-pointer"
              >
                {isEn ? "Delete" : "Hapus"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Add / Edit Category */}
      <AnimatePresence>
        {(isAddModalOpen || editingCat) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A0A0A] rounded-2xl w-full max-w-md p-6 shadow-2xl text-white font-sans"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-base font-bold text-white">
                  {editingCat
                    ? (isEn ? "Edit Category" : "Ubah Data Kategori")
                    : (isEn ? "Add New Category" : "Tambah Kategori Baru")}
                </h3>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCat(null);
                  }}
                  className="w-8 h-8 rounded-full bg-[#141414] hover:bg-[#202020] flex items-center justify-center text-[#888888] hover:text-white transition-colors cursor-pointer"
                >
                  <span className="text-base font-bold leading-none">×</span>
                </button>
              </div>

              <form onSubmit={editingCat ? handleSaveEdit : handleSaveAdd} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#888888] font-mono text-[11px] uppercase tracking-wider mb-1">
                    {isEn ? "Category Name" : "Nama Kategori"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={isEn ? "e.g. Wireless DAC, Planar IEMs..." : "cth: Wireless DAC, Planar IEMs..."}
                    className="w-full bg-[#141414] focus:bg-[#181818] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#555] focus:outline-none focus:ring-1 focus:ring-[#BFDD25] transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[#888888] font-mono text-[11px] uppercase tracking-wider mb-1">
                    {isEn ? "URL Slug" : "URL Slug"}
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="cth: wireless-dac"
                    className="w-full bg-[#141414] focus:bg-[#181818] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#555] focus:outline-none focus:ring-1 focus:ring-[#BFDD25] transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#888888] font-mono text-[11px] uppercase tracking-wider mb-1">
                    {isEn ? "Metadata Description" : "Deskripsi Metadata"}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={isEn ? "Brief metadata description about this category..." : "Deskripsi singkat seputar kategori ini..."}
                    className="w-full bg-[#141414] focus:bg-[#181818] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#555] focus:outline-none focus:ring-1 focus:ring-[#BFDD25] transition-all resize-none font-sans"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingCat(null);
                    }}
                    className="px-5 py-2.5 bg-[#141414] hover:bg-[#202020] text-white rounded-full font-mono text-xs cursor-pointer transition-colors"
                  >
                    {isEn ? "Cancel" : "Batal"}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#BFDD25] hover:bg-[#aecd20] text-black font-bold font-mono text-xs rounded-full shadow-[0_0_12px_rgba(191,221,37,0.3)] cursor-pointer transition-colors"
                  >
                    {editingCat
                      ? (isEn ? "Save Changes" : "Simpan Perubahan")
                      : (isEn ? "Add Category" : "Simpan")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Delete Category */}
      <AnimatePresence>
        {deletingCat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A0A0A] rounded-2xl w-full max-w-sm p-6 shadow-2xl text-white font-sans text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2.25 2.25 0 0116.138 21H7.862a2.25 2.25 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="font-heading text-base font-bold mb-1">
                {isEn ? "Delete Category?" : "Hapus Kategori?"}
              </h3>
              <p className="text-xs text-[#888888] font-mono mb-5">
                {isEn
                  ? `Are you sure you want to remove ${deletingCat.name}?`
                  : `Anda akan menghapus kategori ${deletingCat.name}.`}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeletingCat(null)}
                  className="flex-1 py-2.5 bg-[#141414] hover:bg-[#202020] text-white rounded-full text-xs font-mono font-medium transition-colors cursor-pointer"
                >
                  {isEn ? "Cancel" : "Batal"}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold font-mono transition-colors cursor-pointer shadow-sm"
                >
                  {isEn ? "Confirm Delete" : "Hapus"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
