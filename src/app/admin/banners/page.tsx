"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { fetchProductsFromDb, CatalogProduct } from "@/lib/products-db";
import {
  LandingConfig,
  DEFAULT_LANDING_CONFIG,
  fetchLandingConfigFromDb,
  saveLandingConfigToDb,
} from "@/lib/landing-config";

export default function LandingAndBannersCMSPage() {
  const { language } = useLanguage();
  const isEn = language === "English";

  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState<"HERO" | "COLLAB" | "BEST_SELLERS" | "JOURNEY">("HERO");

  // Database Products list for selection
  const [dbProducts, setDbProducts] = useState<CatalogProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Landing Configuration State
  const [config, setConfig] = useState<LandingConfig>(DEFAULT_LANDING_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // New Feature Input for Collaboration
  const [newFeatureInput, setNewFeatureInput] = useState("");

  // Load configuration from database
  useEffect(() => {
    let isMounted = true;
    async function init() {
      setIsLoadingProducts(true);
      try {
        const [loadedConfig, products] = await Promise.all([
          fetchLandingConfigFromDb(),
          fetchProductsFromDb(),
        ]);
        if (isMounted) {
          if (loadedConfig) setConfig(loadedConfig);
          if (products) setDbProducts(products);
          setIsLoadingProducts(false);
        }
      } catch (err) {
        console.error("Failed to load admin landing data:", err);
        if (isMounted) setIsLoadingProducts(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save changes to database
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    try {
      const res = await saveLandingConfigToDb(config);
      if (res.success) {
        setSaveSuccess(true);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("tonalzone_landing_updated"));
        }
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setSaveError(res.error || "Gagal menyimpan ke database");
      }
    } catch (e: any) {
      setSaveError(e?.message || "Terjadi kesalahan saat menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper: auto fill Hero from selected product
  const handleSelectHeroProduct = (productId: string) => {
    const selected = dbProducts.find((p) => p.id === productId);
    if (!selected) return;

    setConfig((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        productId: selected.id,
        productName: selected.name.toUpperCase(),
        description: selected.description || prev.hero.description,
        imageUrl: selected.image || selected.images?.[0] || prev.hero.imageUrl,
        ctaLink: `/product/${selected.id}`,
      },
    }));
  };

  // Helper: auto fill Collaboration from selected product
  const handleSelectCollabProduct = (productId: string) => {
    const selected = dbProducts.find((p) => p.id === productId);
    if (!selected) return;

    setConfig((prev) => ({
      ...prev,
      collaboration: {
        ...prev.collaboration,
        productId: selected.id,
        title: selected.name,
        description: selected.description || prev.collaboration.description,
        productImage2: selected.image || selected.images?.[0] || prev.collaboration.productImage2,
        price: `RP ${Number(selected.price * 16000).toLocaleString("id-ID")}`,
        ctaLink: `/product/${selected.id}`,
      },
    }));
  };

  // Collaboration Features Management
  const handleAddFeature = () => {
    if (!newFeatureInput.trim()) return;
    const current = config.collaboration.features || [];
    if (!current.includes(newFeatureInput.trim())) {
      setConfig((prev) => ({
        ...prev,
        collaboration: {
          ...prev.collaboration,
          features: [...current, newFeatureInput.trim()],
        },
      }));
    }
    setNewFeatureInput("");
  };

  const handleRemoveFeature = (feat: string) => {
    setConfig((prev) => ({
      ...prev,
      collaboration: {
        ...prev.collaboration,
        features: (prev.collaboration.features || []).filter((f) => f !== feat),
      },
    }));
  };

  return (
    <div className="space-y-6 text-[#FAF9F6] selection:bg-[#BFDD25] selection:text-black">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#181818]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono font-bold bg-[#141414] text-[#BFDD25] px-3 py-1 rounded-full uppercase tracking-wider">
              {isEn ? "Landing Page CMS" : "Kustomisasi Landing Page"}
            </span>
            <span className="text-[11px] font-mono text-[#888]">
              {isEn ? "Connected to Supabase DB • Live Sync" : "Terhubung Database Supabase • Sinkronisasi Langsung"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
            {isEn ? "Landing Page Products & Sections Customizer" : "Atur Produk & Konten Landing Page"}
          </h1>
          <p className="text-xs text-[#888] font-sans mt-1">
            {isEn
              ? "Customize hero product, collaboration showcase, best sellers, and starter bento catalog on the live homepage."
              : "Sesuaikan produk dan tampilan hero, section kolaborasi, best sellers, dan katalog pemula di halaman utama website."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#141414] hover:bg-[#1C1C1C] text-white text-xs font-sans font-medium rounded-full transition-colors border border-white/10"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            <span>{isEn ? "View Live Homepage" : "Lihat Halaman Utama"}</span>
          </Link>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#BFDD25] hover:bg-white text-black text-xs font-sans font-bold rounded-full transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-black" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>{isEn ? "Saving to Database..." : "Menyimpan ke DB..."}</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>{isEn ? "Save Changes" : "Simpan Perubahan"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success / Error Feedback Toast */}
      {saveSuccess && (
        <div className="p-3.5 bg-[#141F17] text-[#BFDD25] rounded-xl text-xs font-mono flex items-center justify-between">
          <span>
            {isEn
              ? "All landing page customizations have been saved to Supabase and published live!"
              : "Semua kustomisasi landing page berhasil disimpan ke Supabase dan langsung tampil di halaman depan!"}
          </span>
          <span className="text-[10px] uppercase font-bold bg-[#BFDD25]/20 px-2 py-0.5 rounded">Synced</span>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 bg-rose-950/40 text-rose-300 rounded-xl text-xs font-mono flex items-center justify-between">
          <span>{saveError}</span>
        </div>
      )}

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {[
          { id: "HERO", label: isEn ? "1. Hero Section" : "1. Hero Section (Utama)" },
          { id: "COLLAB", label: isEn ? "2. Collaboration Section" : "2. Section Kolaborasi" },
          { id: "BEST_SELLERS", label: isEn ? "3. Best Sellers" : "3. Best Sellers Showcase" },
          { id: "JOURNEY", label: isEn ? "4. Start Journey (Bento)" : "4. Katalog Pemula (Bento)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-sans font-medium rounded-full transition-all cursor-pointer shrink-0 ${
              activeTab === tab.id
                ? "bg-white text-black font-bold shadow-sm"
                : "text-[#888] hover:text-white bg-[#0E0E0E] hover:bg-[#161616]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: HERO SECTION */}
      {activeTab === "HERO" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: 7 Cols */}
          <div className="lg:col-span-7 bg-[#0A0A0A] rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#181818]">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  {isEn ? "Hero Section Customizer" : "Kustomisasi Hero Section"}
                </h2>
                <p className="text-xs text-[#777] mt-0.5">
                  {isEn
                    ? "Set the prominent flagship IEM, banner image, product title, and description text."
                    : "Atur gambar, nama produk, dan teks deskripsi hero sesuai tampilan landing page."}
                </p>
              </div>
              <span className="text-[10px] font-mono bg-[#141414] text-[#BFDD25] px-2.5 py-1 rounded-full">
                Hero Frame
              </span>
            </div>

            {/* Quick Pick from Database */}
            <div>
              <label className="block text-[11px] font-mono text-[#888] uppercase tracking-wider mb-2">
                {isEn ? "Auto-Fill from Database Product" : "Pilih dari Produk Database (Isi Otomatis)"}
              </label>
              <select
                value={config.hero.productId || ""}
                onChange={(e) => handleSelectHeroProduct(e.target.value)}
                className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-sans text-white outline-none border border-white/5 focus:border-[#BFDD25] transition-colors"
              >
                <option value="">-- {isEn ? "Select a product from database" : "Pilih produk dari database"} --</option>
                {dbProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.brand}) - ${p.price}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-[11px] font-mono text-[#888] uppercase tracking-wider mb-2">
                {isEn ? "Hero Product Name (Large Title) *" : "Nama Produk Hero (Judul Utama) *"}
              </label>
              <input
                type="text"
                value={config.hero.productName}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, productName: e.target.value },
                  }))
                }
                placeholder="e.g. CHU III, BLESSING 3, WAN'ER SG 2"
                className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border border-white/5 focus:border-[#BFDD25] transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-mono text-[#888] uppercase tracking-wider mb-2">
                {isEn ? "Product Description Text *" : "Teks Deskripsi Produk *"}
              </label>
              <textarea
                rows={4}
                value={config.hero.description}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, description: e.target.value },
                  }))
                }
                placeholder="Deskripsi karakter suara, driver, dan keunggulan akustik..."
                className="w-full bg-[#121212] rounded-xl p-4 text-xs font-sans text-white outline-none border border-white/5 focus:border-[#BFDD25] transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Hero Image URL */}
            <div>
              <label className="block text-[11px] font-mono text-[#888] uppercase tracking-wider mb-2">
                {isEn ? "Hero Banner / Product Image URL *" : "URL Gambar Produk / Banner Hero *"}
              </label>
              <input
                type="text"
                value={config.hero.imageUrl}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, imageUrl: e.target.value },
                  }))
                }
                placeholder="/images/... or https://..."
                className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border border-white/5 focus:border-[#BFDD25] transition-colors"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-[10px] font-mono text-[#666] self-center">Preset Cepat:</span>
                {[
                  { label: "Moondrop Chu III Banner", url: "/images/Headphone-Zone-Moondrop-Chu-III-Homepage-Desktop-Banner-02.webp" },
                  { label: "Moondrop Flagship Model", url: "/model-iem-untuk-hero.webp" },
                  { label: "Hero Banner Official", url: "/hero-banner.jpg" },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.url}
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        hero: { ...prev.hero, imageUrl: item.url },
                      }))
                    }
                    className="text-[10px] font-mono px-2.5 py-1 bg-[#161616] hover:bg-[#202020] text-[#A1A1AA] hover:text-white rounded-md transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Button Text & Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-[#888] uppercase tracking-wider mb-2">
                  {isEn ? "CTA Button Text" : "Teks Tombol CTA"}
                </label>
                <input
                  type="text"
                  value={config.hero.ctaText}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, ctaText: e.target.value },
                    }))
                  }
                  placeholder="SHOP NOW"
                  className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border border-white/5 focus:border-[#BFDD25] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#888] uppercase tracking-wider mb-2">
                  {isEn ? "CTA Target URL" : "Link Target CTA"}
                </label>
                <input
                  type="text"
                  value={config.hero.ctaLink}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      hero: { ...prev.hero, ctaLink: e.target.value },
                    }))
                  }
                  placeholder="/product/prod-chu3"
                  className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border border-white/5 focus:border-[#BFDD25] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Right: Live Preview: 5 Cols */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#777] font-semibold">
                {isEn ? "Hero Section Live Preview" : "Pratinjau Langsung Hero Section"}
              </span>
              <span className="text-[10px] font-mono text-[#BFDD25] bg-[#141F17] px-2.5 py-0.5 rounded-full">
                Interactive
              </span>
            </div>

            <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-[#030303] flex flex-col justify-between p-6 border border-[#222] shadow-2xl">
              {/* Background Image Preview */}
              <div className="absolute inset-0 z-0">
                <img
                  src={config.hero.imageUrl}
                  alt={config.hero.productName}
                  className="w-full h-full object-cover brightness-[0.95]"
                  onError={(e) => {
                    (e.target as any).src = "/images/Headphone-Zone-Moondrop-Chu-III-Homepage-Desktop-Banner-02.webp";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/40 to-transparent pointer-events-none" />
              </div>

              <div className="relative z-10 flex-1" />

              {/* Bottom Info Preview */}
              <div className="relative z-10 space-y-4">
                <p className="font-sans text-xs text-white/80 line-clamp-3 leading-relaxed max-w-xs">
                  {config.hero.description}
                </p>

                <h3 className="font-heading font-bold text-4xl sm:text-5xl text-white tracking-wide uppercase leading-none">
                  {config.hero.productName}
                </h3>

                <div className="pt-2">
                  <span className="inline-flex items-center justify-between w-48 h-11 px-3 bg-white text-black font-sans font-bold text-xs uppercase tracking-wider rounded-none shadow-md">
                    <span>{config.hero.ctaText || "SHOP NOW"}</span>
                    <span className="w-6 h-6 bg-[#131313] text-[#BFDD25] flex items-center justify-center text-xs">
                      &gt;
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COLLABORATION SECTION */}
      {activeTab === "COLLAB" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: 7 Cols */}
          <div className="lg:col-span-7 bg-[#0A0A0A] rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#181818]">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                  {isEn ? "Collaboration Section Customizer" : "Kustomisasi Section Kolaborasi"}
                </h2>
                <p className="text-xs text-[#777] mt-0.5">
                  {isEn
                    ? "Configure background art, product images (2 items), title, description, and feature tags."
                    : "Atur gambar latar, 2 gambar produk (case & earbuds), judul, deskripsi, dan tag fitur unggulan."}
                </p>
              </div>
              <span className="text-[10px] font-mono bg-[#141414] text-[#BFDD25] px-2.5 py-1 rounded-full">
                Frame 121
              </span>
            </div>

            {/* Quick Pick Collab Product */}
            <div>
              <label className="block text-[11px] font-mono text-[#888] uppercase tracking-wider mb-2">
                {isEn ? "Auto-Fill from Database Product" : "Pilih dari Produk Database (Isi Otomatis)"}
              </label>
              <select
                value={config.collaboration.productId || ""}
                onChange={(e) => handleSelectCollabProduct(e.target.value)}
                className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-sans text-white outline-none border border-white/5 focus:border-[#BFDD25] transition-colors"
              >
                <option value="">-- {isEn ? "Select collaboration product" : "Pilih produk kolaborasi"} --</option>
                {dbProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.brand})
                  </option>
                ))}
              </select>
            </div>

            {/* Background Image URL */}
            <div>
              <label className="block text-[11px] font-mono text-[#888] uppercase tracking-wider mb-2">
                {isEn ? "Section Background Image URL *" : "URL Gambar Background Section *"}
              </label>
              <input
                type="text"
                value={config.collaboration.bgImage}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    collaboration: { ...prev.collaboration, bgImage: e.target.value },
                  }))
                }
                placeholder="/images/collab-hsr-moondrop-bg.png"
                className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border border-white/5 focus:border-[#BFDD25] transition-colors"
              />
            </div>

            {/* 2 Product Images: Case & Earbuds */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-[#888] uppercase tracking-wider mb-2">
                  {isEn ? "Product Image 1 (Case) *" : "Gambar Produk 1 (Case / Item 1) *"}
                </label>
                <input
                  type="text"
                  value={config.collaboration.productImage1}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      collaboration: { ...prev.collaboration, productImage1: e.target.value },
                    }))
                  }
                  placeholder="/images/collab-sparxie-case.png"
                  className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border border-white/5 focus:border-[#BFDD25] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#888] uppercase tracking-wider mb-2">
                  {isEn ? "Product Image 2 (Earbuds) *" : "Gambar Produk 2 (Earbuds / Item 2) *"}
                </label>
                <input
                  type="text"
                  value={config.collaboration.productImage2}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      collaboration: { ...prev.collaboration, productImage2: e.target.value },
                    }))
                  }
                  placeholder="/images/collab-sparxie-earbuds.png"
                  className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border border-white/5 focus:border-[#BFDD25] transition-colors"
                />
              </div>
            </div>

            {/* Title & Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-[#888] uppercase tracking-wider mb-2">
                  {isEn ? "Collaboration Title *" : "Judul Kolaborasi *"}
                </label>
                <input
                  type="text"
                  value={config.collaboration.title}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      collaboration: { ...prev.collaboration, title: e.target.value },
                    }))
                  }
                  placeholder="Moondrop X HSR Sparxie TWS"
                  className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-sans text-white outline-none border border-white/5 focus:border-[#BFDD25] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#888] uppercase tracking-wider mb-2">
                  {isEn ? "Price Display Text" : "Teks Harga Produk"}
                </label>
                <input
                  type="text"
                  value={config.collaboration.price || ""}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      collaboration: { ...prev.collaboration, price: e.target.value },
                    }))
                  }
                  placeholder="RP 1.400.000"
                  className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border border-white/5 focus:border-[#BFDD25] transition-colors"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-mono text-[#888] uppercase tracking-wider mb-2">
                {isEn ? "Collaboration Description *" : "Deskripsi Kolaborasi *"}
              </label>
              <textarea
                rows={3}
                value={config.collaboration.description}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    collaboration: { ...prev.collaboration, description: e.target.value },
                  }))
                }
                placeholder="Deskripsi kolaborasi eksklusif..."
                className="w-full bg-[#121212] rounded-xl p-4 text-xs font-sans text-white outline-none border border-white/5 focus:border-[#BFDD25] transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Fitur Unggulan (Feature Chips) */}
            <div>
              <label className="block text-[11px] font-mono text-[#888] uppercase tracking-wider mb-2">
                {isEn ? "Featured Highlights (Tags/Chips) *" : "Fitur Unggulan (Pill / Chip) *"}
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {(config.collaboration.features || []).map((feat, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181818] text-xs font-mono text-white border border-white/10"
                  >
                    <span>{feat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(feat)}
                      className="text-red-400 hover:text-white font-bold ml-1 text-xs"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeatureInput}
                  onChange={(e) => setNewFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  placeholder={isEn ? "Add highlight e.g. 'RT-Adaptive ANC'..." : "Tambah fitur unggulan..."}
                  className="flex-1 bg-[#121212] rounded-xl px-4 py-2.5 text-xs font-sans text-white outline-none border border-white/5 focus:border-[#BFDD25] transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-4 py-2.5 bg-[#1E1E1E] hover:bg-white hover:text-black text-xs font-sans font-bold rounded-xl transition-colors"
                >
                  {isEn ? "Add Feature" : "Tambah"}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Live Preview: 5 Cols */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#777] font-semibold">
                {isEn ? "Collaboration Card Preview" : "Pratinjau Kartu Kolaborasi"}
              </span>
              <span className="text-[10px] font-mono text-[#BFDD25] bg-[#141F17] px-2.5 py-0.5 rounded-full">
                Card Frame
              </span>
            </div>

            {/* Showcase Container */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-[#0a0a0a] p-5 sm:p-6 border border-[#222] shadow-2xl">
              {/* Background Art */}
              <div className="absolute inset-0 z-0">
                <img
                  src={config.collaboration.bgImage}
                  alt="Background"
                  className="w-full h-full object-cover opacity-35"
                  onError={(e) => {
                    (e.target as any).src = "/images/collab-hsr-moondrop-bg.png";
                  }}
                />
                <div className="absolute inset-0 bg-black/60" />
              </div>

              {/* Floating White Card */}
              <div className="relative z-10 w-full bg-[#F3F3F3] text-[#131313] rounded-[20px] p-5 shadow-xl">
                {/* 2 Images */}
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  <div className="relative h-28 bg-white rounded-xl overflow-hidden p-2 flex items-center justify-center">
                    <img
                      src={config.collaboration.productImage1}
                      alt="Case"
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as any).src = "/images/collab-sparxie-case.png";
                      }}
                    />
                  </div>
                  <div className="relative h-28 bg-[#0a0a0a] rounded-xl overflow-hidden flex items-center justify-center">
                    <img
                      src={config.collaboration.productImage2}
                      alt="Earbuds"
                      className="max-h-full max-w-full object-cover"
                      onError={(e) => {
                        (e.target as any).src = "/images/collab-sparxie-earbuds.png";
                      }}
                    />
                  </div>
                </div>

                <h4 className="font-sans font-bold text-base text-[#131313] tracking-tight line-clamp-1">
                  {config.collaboration.title}
                </h4>
                <p className="font-sans text-xs text-[#505050] line-clamp-2 mt-1 leading-snug">
                  {config.collaboration.description}
                </p>

                <div className="flex items-baseline gap-2 my-3">
                  <span className="font-sans font-bold text-lg text-[#131313]">
                    {config.collaboration.price || "RP 1.400.000"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E2E2E2] text-zinc-700">
                    {config.collaboration.badge || "Official Collab"}
                  </span>
                </div>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(config.collaboration.features || []).map((f, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-[#E2E2E2] text-[10px] font-semibold text-zinc-800">
                      {f}
                    </span>
                  ))}
                </div>

                <span className="inline-flex items-center justify-center w-full py-2.5 rounded-full bg-black text-white font-sans font-bold text-xs uppercase tracking-wider">
                  SHOP NOW
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BEST SELLERS SHOWCASE */}
      {activeTab === "BEST_SELLERS" && (
        <div className="bg-[#0A0A0A] rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#181818]">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                {isEn ? "Best Sellers Editorial Showcase (4 Products)" : "Kustomisasi 4 Produk Best Sellers Showcase"}
              </h2>
              <p className="text-xs text-[#777] mt-0.5">
                {isEn
                  ? "Select the 4 audiophile IEMs featured in the cinematic horizontal editorial slider."
                  : "Pilih 4 produk IEM yang tampil di slider editorial showcase Best Sellers pada homepage."}
              </p>
            </div>
            <span className="text-[10px] font-mono bg-[#141414] text-[#BFDD25] px-2.5 py-1 rounded-full">
              Editorial Slider
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(config.best_sellers || DEFAULT_LANDING_CONFIG.best_sellers || []).map((item, index) => (
              <div key={index} className="bg-[#121212] p-5 rounded-2xl space-y-4 border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#BFDD25]">
                    Slot #{index + 1}
                  </span>
                  <select
                    value={item.id}
                    onChange={(e) => {
                      const selected = dbProducts.find((p) => p.id === e.target.value);
                      if (!selected) return;
                      const updated = [...(config.best_sellers || [])];
                      updated[index] = {
                        id: selected.id,
                        brand: selected.brand.toUpperCase(),
                        title: selected.name.toUpperCase(),
                        description: selected.description || updated[index].description,
                        image: selected.image || selected.images?.[0] || updated[index].image,
                        href: `/product/${selected.id}`,
                      };
                      setConfig((prev) => ({ ...prev, best_sellers: updated }));
                    }}
                    className="bg-[#1A1A1A] rounded-lg px-3 py-1 text-xs font-sans text-white border-0 outline-none"
                  >
                    <option value={item.id}>{item.title}</option>
                    {dbProducts
                      .filter((p) => p.id !== item.id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.brand})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#888] uppercase mb-1">
                    Title & Brand
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...(config.best_sellers || [])];
                      updated[index] = { ...updated[index], title: e.target.value };
                      setConfig((prev) => ({ ...prev, best_sellers: updated }));
                    }}
                    className="w-full bg-[#181818] rounded-lg px-3 py-2 text-xs font-mono text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#888] uppercase mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => {
                      const updated = [...(config.best_sellers || [])];
                      updated[index] = { ...updated[index], description: e.target.value };
                      setConfig((prev) => ({ ...prev, best_sellers: updated }));
                    }}
                    className="w-full bg-[#181818] rounded-lg p-3 text-xs font-sans text-white outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#888] uppercase mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={item.image}
                    onChange={(e) => {
                      const updated = [...(config.best_sellers || [])];
                      updated[index] = { ...updated[index], image: e.target.value };
                      setConfig((prev) => ({ ...prev, best_sellers: updated }));
                    }}
                    className="w-full bg-[#181818] rounded-lg px-3 py-2 text-xs font-mono text-white outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: START YOUR JOURNEY BENTO GRID */}
      {activeTab === "JOURNEY" && (
        <div className="bg-[#0A0A0A] rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#181818]">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                {isEn ? "Start Your Journey (Bento Grid 6 Slots)" : "Katalog Ramah Pemula: Bento Grid (6 Slot)"}
              </h2>
              <p className="text-xs text-[#777] mt-0.5">
                {isEn
                  ? "Customize the 6 starter IEMs featured in the beginner bento recommendation section."
                  : "Pilih produk IEM pemula yang ditampilkan di bento grid 'Start your journey here'."}
              </p>
            </div>
            <span className="text-[10px] font-mono bg-[#141414] text-[#BFDD25] px-2.5 py-1 rounded-full">
              Frame 125 Bento
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(config.start_journey || DEFAULT_LANDING_CONFIG.start_journey || []).map((slot, idx) => (
              <div key={idx} className="bg-[#121212] p-4 rounded-xl space-y-3 border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-[#BFDD25]">
                    Slot #{idx + 1} ({slot.layout})
                  </span>
                  <span className="text-[10px] font-mono text-[#888]">
                    ${slot.fallbackPrice}
                  </span>
                </div>

                <select
                  value={slot.id}
                  onChange={(e) => {
                    const selected = dbProducts.find((p) => p.id === e.target.value);
                    if (!selected) return;
                    const updated = [...(config.start_journey || [])];
                    updated[idx] = {
                      ...updated[idx],
                      id: selected.id,
                      name: selected.name,
                      fallbackPrice: selected.price,
                      image: selected.image || updated[idx].image,
                    };
                    setConfig((prev) => ({ ...prev, start_journey: updated }));
                  }}
                  className="w-full bg-[#181818] rounded-lg px-3 py-2 text-xs font-sans text-white border-0 outline-none"
                >
                  <option value={slot.id}>{slot.name}</option>
                  {dbProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.price})
                    </option>
                  ))}
                </select>

                <div>
                  <label className="block text-[10px] font-mono text-[#888] uppercase mb-1">
                    Image (Transparent Cutout)
                  </label>
                  <input
                    type="text"
                    value={slot.image}
                    onChange={(e) => {
                      const updated = [...(config.start_journey || [])];
                      updated[idx] = { ...updated[idx], image: e.target.value };
                      setConfig((prev) => ({ ...prev, start_journey: updated }));
                    }}
                    className="w-full bg-[#181818] rounded-lg px-3 py-1.5 text-xs font-mono text-white outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
