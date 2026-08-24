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
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold bg-[#1C1C1C] text-[#FAF9F6] border border-[#2E2E2E] px-2 py-0.5 rounded uppercase tracking-wider">
              {isEn ? "Taxonomy Configuration" : "Konfigurasi Taksonomi"}
            </span>
            <span className="text-[11px] font-mono text-[#888]">
              {isEn ? "Catalog Structure & Metadata" : "Struktur Katalog & Metadata"}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-3">
            {isEn ? "Product Categories & Tags" : "Kategori Produk & Tag Taksonomi"}
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-white/70">
              {categories.length} {isEn ? "Categories" : "Kategori"}
            </span>
          </h1>
          <p className="text-xs text-[#888] font-sans mt-0.5">
            {isEn
              ? "Configure audiophile product taxonomy categories, URL slugs, and metadata descriptions."
              : "Konfigurasi taksonomi kategori produk audio, slug URL, dan deskripsi metadata."}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-[#222222] hover:bg-[#333333] border border-[#3E3E3E] text-white text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer w-fit"
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
            className="p-5 bg-[#111] border border-[#222] hover:border-[#333] rounded-xl flex flex-col justify-between transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white text-base">{cat.name}</h3>
                <span className="text-[10px] font-mono bg-[#1c1c1c] border border-[#2e2e2e] px-2 py-0.5 rounded text-white/70">
                  {cat.itemCount} {isEn ? "items" : "produk"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/60 block mb-2">/{cat.slug}</span>
              <p className="text-xs text-[#888] leading-relaxed font-sans">{cat.description}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-[#1e1e1e]">
              <button
                onClick={() => handleOpenEdit(cat)}
                className="px-3 py-1 bg-[#181818] hover:bg-[#222] border border-[#2e2e2e] hover:border-[#444] text-white text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer"
              >
                {isEn ? "Edit" : "Ubah"}
              </button>
              <button
                onClick={() => setDeletingCat(cat)}
                className="px-3 py-1 bg-[#181818] hover:bg-[#262626] text-[#A1A1AA] hover:text-white border border-[#2E2E2E] hover:border-white rounded-lg text-xs font-mono transition-colors cursor-pointer"
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
              className="bg-[#141414] border border-[#333] rounded-2xl w-full max-w-md p-6 shadow-2xl text-white font-sans"
            >
              <h3 className="text-base font-bold mb-4 border-b border-[#262626] pb-3">
                {editingCat
                  ? (isEn ? "Edit Category" : "Ubah Data Kategori")
                  : (isEn ? "Add New Category" : "Tambah Kategori Baru")}
              </h3>

              <form onSubmit={editingCat ? handleSaveEdit : handleSaveAdd} className="space-y-4 text-xs">
                <div>
                  <label className="block text-white/70 font-semibold mb-1">
                    {isEn ? "Category Name" : "Nama Kategori"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={isEn ? "e.g. Wireless DAC, Planar IEMs..." : "cth: Wireless DAC, Planar IEMs..."}
                    className="w-full bg-[#181818] border border-[#333] rounded-lg p-2.5 text-white focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">
                    {isEn ? "URL Slug" : "URL Slug"}
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="cth: wireless-dac"
                    className="w-full bg-[#181818] border border-[#333] rounded-lg p-2.5 text-white focus:outline-none focus:border-white/40 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">
                    {isEn ? "Metadata Description" : "Deskripsi Metadata"}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={isEn ? "Brief metadata description about this category..." : "Deskripsi singkat seputar kategori ini..."}
                    className="w-full bg-[#181818] border border-[#333] rounded-lg p-2.5 text-white focus:outline-none focus:border-white/40 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-[#262626]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingCat(null);
                    }}
                    className="px-4 py-2 bg-[#222] hover:bg-[#333] text-white/70 rounded-lg font-mono text-xs cursor-pointer"
                  >
                    {isEn ? "Cancel" : "Batal"}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#242424] hover:bg-[#333] border border-[#383838] text-white font-bold font-mono text-xs rounded-lg shadow-sm cursor-pointer"
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
              className="bg-[#141414] border border-[#2E2E2E] rounded-2xl w-full max-w-sm p-6 shadow-2xl text-white font-sans"
            >
              <h3 className="text-base font-bold text-center mb-1">
                {isEn ? "Delete Category?" : "Hapus Kategori?"}
              </h3>
              <p className="text-xs text-white/60 text-center mb-5">
                {isEn
                  ? `Are you sure you want to remove ${deletingCat.name}?`
                  : `Anda akan menghapus kategori ${deletingCat.name}.`}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeletingCat(null)}
                  className="flex-1 py-2.5 bg-[#222] hover:bg-[#333] text-white/70 rounded-lg text-xs font-mono cursor-pointer"
                >
                  {isEn ? "Cancel" : "Batal"}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold font-mono cursor-pointer"
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
