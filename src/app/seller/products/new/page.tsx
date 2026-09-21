"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import CustomSelect from "@/components/ui/custom-select";
import { KeyboardArrowRight } from "@/components/ui/keyboard-arrow";

export interface NewProductVariant {
  id: string;
  name: string;
  priceUSD: number;
  stock: number;
  sku?: string;
}

export default function AddNewProductPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const isEn = language === "English";
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState("IN-EAR MONITORS");
  const [currency, setCurrency] = useState<"IDR" | "USD">("IDR");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<NewProductVariant[]>([]);

  const [isOfficialBrand, setIsOfficialBrand] = useState(false);
  const [officialBrandName, setOfficialBrandName] = useState("MOONDROP");

  useEffect(() => {
    const loadCurrencyAndStore = async () => {
      const saved = localStorage.getItem("tonalzone_seller_currency") as "IDR" | "USD" | null;
      if (saved) {
        setCurrency(saved);
      }

      let userEmail = "";
      let userStoreId = "";
      const stored = localStorage.getItem("tonalzone_user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          userEmail = u.email || "";
          userStoreId = u.storeId || "";

          if (!saved) {
            if (u.storeCurrency) setCurrency(u.storeCurrency);
            else if (u.location === "Indonesia") setCurrency("IDR");
          }

          if (u.storeType === "OFFICIAL_BRAND" || u.brandName) {
            setIsOfficialBrand(true);
            const bName = u.brandName || "MOONDROP";
            setOfficialBrandName(bName);
            setFormData((prev) => ({ ...prev, brand: bName }));
          }
        } catch (e) {}
      }

      // Live check from /api/seller/store
      try {
        const query = userStoreId
          ? `?storeId=${encodeURIComponent(userStoreId)}`
          : userEmail
          ? `?email=${encodeURIComponent(userEmail)}`
          : "";
        const res = await fetch(`/api/seller/store${query}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.store?.storeType === "OFFICIAL_BRAND") {
            setIsOfficialBrand(true);
            const bName = json.store.brandName || "MOONDROP";
            setOfficialBrandName(bName);
            setFormData((prev) => ({ ...prev, brand: bName }));
          }
        }
      } catch (err) {}
    };

    loadCurrencyAndStore();
    window.addEventListener("storage", loadCurrencyAndStore);
    return () => window.removeEventListener("storage", loadCurrencyAndStore);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    brand: "Moondrop",
    category: "IN-EAR MONITORS",
    priceUSD: 299,
    stock: 10,
    sku: "PRD-NEW-01",
    description: "",
    condition: "Brand New Sealed",
    warrantyMonths: 12,
    badge: "New Release",

    // IEM & Headphone Specs
    driverType: "1 Dynamic Driver + 4 Balanced Armatures",
    soundSignature: "Harman Target 2019",
    impedance: "16 Ω",
    sensitivity: "112 dB/mW",
    frequencyRange: "10Hz - 40kHz",
    pinType: "0.78mm 2-Pin",
    headphoneDesign: "Over-Ear (Open-Back)",
    headphoneDriverSize: "50mm Beryllium-Coated Dynamic",
    weightGrams: "380g",

    // DAC/AMP Specs
    dacChipset: "Dual ESS ES9038Q2M",
    outputPower: "1200mW @ 32Ω (Balanced)",
    inputs: "USB-C, Optical, Coaxial, Bluetooth 5.2 (LDAC)",
    outputs: "3.5mm SE, 4.4mm Balanced, RCA Pre-Out",
    snrThd: "125dB SNR / 0.0002% THD+N",

    // DAP Specs
    dapOS: "Android 12 (Bit-Perfect DTA)",
    dapStorage: "64GB Internal + MicroSD up to 2TB",
    batteryLife: "14 Hours Continuous Playback",

    // Cable Specs
    conductorMaterial: "8-Core High-Purity Monocrystalline UP-OCC Copper",
    cableTermination: "4.4mm Balanced (Interchangeable 3.5mm/2.5mm)",
    cableLength: "1.25m",

    // Speaker Specs
    speakerSystem: "2-Way Bi-Amplified Active Studio Monitor",
    speakerPower: "150W RMS Class-D",

    // Accessory / Eartip Specs
    accessoryMaterial: "Medical-Grade Liquid Silicone (Wide Bore)",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);

  const handleMultipleImageUpload = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setProductImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setProductImages((prev) => {
      const selected = prev[index];
      const remaining = prev.filter((_, i) => i !== index);
      return [selected, ...remaining];
    });
  };

  const handleRemoveImage = (index: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    const newV: NewProductVariant = {
      id: `var-${Date.now()}`,
      name: isEn ? `Option ${variants.length + 1}` : `Varian ${variants.length + 1}`,
      priceUSD: formData.priceUSD,
      stock: 5,
      sku: `${formData.sku || "PRD"}-V${variants.length + 1}`,
    };
    setVariants([...variants, newV]);
  };

  const handleRemoveVariant = (varId: string) => {
    setVariants(variants.filter((v) => v.id !== varId));
  };

  const handleUpdateVariant = (varId: string, field: keyof NewProductVariant, value: any) => {
    setVariants(variants.map((v) => (v.id === varId ? { ...v, [field]: value } : v)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let userStored: any = null;
    try {
      const raw = localStorage.getItem("tonalzone_user");
      if (raw) userStored = JSON.parse(raw);
    } catch (e) {}

    const imgList = productImages.length > 0 ? productImages : ["/model-iem-untuk-hero.webp"];

    const initialStatus = isOfficialBrand ? "APPROVED" : "PENDING";

    const newProd = {
      id: `PRD-NEW-${Date.now()}`,
      name: formData.name,
      brand: formData.brand,
      category: formData.category,
      specsSummary: `${formData.driverType || "Audiophile Structure"} • ${formData.impedance || "16Ω"}`,
      priceUSD: formData.priceUSD,
      stock: formData.stock,
      condition: formData.condition,
      status: initialStatus as "APPROVED" | "PENDING",
      createdAt: new Date().toISOString().split("T")[0],
      images: imgList,
      image: imgList[0],
      variants: variants.length > 0 ? variants : [
        { id: `var-1-${Date.now()}`, name: "Standard 3.5mm SE", priceUSD: formData.priceUSD, stock: Math.ceil(formData.stock / 2), sku: `${formData.sku}-35` },
        { id: `var-2-${Date.now()}`, name: "Balanced 4.4mm Pentaconn", priceUSD: formData.priceUSD, stock: Math.floor(formData.stock / 2), sku: `${formData.sku}-44` },
      ],
    };

    // 1. Persist directly to Supabase via Backend API
    try {
      const res = await fetch("/api/seller/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          brand: formData.brand,
          category: formData.category,
          priceUSD: formData.priceUSD,
          stock: formData.stock,
          description: formData.description || `${formData.driverType || "Audiophile Driver"} • ${formData.impedance || "16Ω"}`,
          images: imgList,
          experienceLevel: "INTERMEDIATE",
          soundSignature: "NEUTRAL",
          sellerEmail: userStored?.email,
          storeId: userStored?.storeId,
          status: initialStatus,
        }),
      });
      const data = await res.json();
      if (data.product?.id) {
        newProd.id = data.product.id;
        newProd.status = data.product.status || initialStatus;
      }
    } catch (err) {
      console.warn("Failed to persist new product via /api/seller/products:", err);
    }

    // 2. Keep local storage fallback in sync
    try {
      const existing = localStorage.getItem("tonalzone_custom_products");
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newProd);
      localStorage.setItem("tonalzone_custom_products", JSON.stringify(list));
      window.dispatchEvent(new Event("productsUpdated"));
      window.dispatchEvent(new Event("storage"));
    } catch (err) {}

    setIsSubmitting(false);
    setSuccessBanner(true);
    setTimeout(() => {
      router.push("/seller/products");
    }, 1000);
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setFormData((prev) => ({ ...prev, category: cat }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header & Submit Bar (Zero border, clean modern elevation) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-white">
              {isEn ? "Add New Audio Product" : "Tambah Produk Audio Baru"}
            </h1>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider bg-[#141414] text-[#D4D4D8]">
              {isEn ? "Requires Admin QC" : "Wajib QC Admin"}
            </span>
          </div>
          <p className="text-xs font-mono text-[#8E8E93] mt-1">
            {isEn
              ? "Universal product listing: IEMs, Headphones, DAC/AMPs, DAPs, Custom Cables, Speakers & Studio Gear."
              : "Form penambahan universal: IEM, Headphone, DAC/AMP, DAP, Kabel Custom, Speaker & Aksesoris Studio."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/seller/products"
            className="px-5 py-2.5 rounded-full bg-[#141414] hover:bg-[#1E1E1E] text-[#D4D4D8] hover:text-white text-xs font-sans font-medium transition-colors cursor-pointer"
          >
            {isEn ? "Cancel" : "Batal"}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-[#E5E5E5] text-xs font-sans font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                {isEn ? "Submitting..." : "Mengirim..."}
              </>
            ) : (
              <>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {isOfficialBrand
                  ? isEn
                    ? "Publish to Master Catalog (Instant Live)"
                    : "Terbitkan ke Master Catalog (Instan Live)"
                  : isEn
                  ? "Submit for QC Review"
                  : "Kirim untuk Moderasi QC"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Master Catalog Shortcut Recommendation (Rounded-2xl, Zero Stroke) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0E0E0E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#181818] flex items-center justify-center text-[#BFDD25] shrink-0">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 5.625a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.875 0a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm12 0a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-sans">
              {isEn ? "Selling official brand products (TANGZU, Moondrop, Sennheiser)?" : "Ingin menjual IEM dari brand resmi (TANGZU, Moondrop, Sennheiser)?"}
            </h4>
            <p className="text-xs text-[#8E8E93] font-sans mt-0.5">
              {isEn
                ? "You don't need to fill this custom form. Select directly from the Master Catalog for 0-minute instant listing."
                : "Anda tidak perlu mengisi formulir panjang ini dari nol. Pilih langsung dari Master Katalog untuk langsung aktif tanpa antre QC."}
            </p>
          </div>
        </div>

        <Link
          href="/seller/products"
          className="px-5 py-2.5 bg-white text-black hover:bg-[#E5E5E5] text-xs font-sans font-bold rounded-full transition-all shadow-md whitespace-nowrap shrink-0 text-center inline-flex items-center justify-center gap-1.5 group"
        >
          <span>{isEn ? "Open Master Catalog" : "Buka Master Katalog"}</span>
          <KeyboardArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {successBanner && (
        <div className="p-4 rounded-2xl bg-[#141F17] text-[#BFDD25] text-xs font-sans flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#BFDD25] shadow-[0_0_8px_rgba(191,221,37,0.6)]" />
          <span>
            {isEn
              ? "Product listing submitted successfully! Transferred to Admin QC Queue."
              : "Produk berhasil dikirim! Masuk ke antrean verifikasi QC tim Admin."}
          </span>
        </div>
      )}

      {/* Main Form Sections (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: General Info & Dynamic Category Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: General Product Information & Category Picker */}
          <div className="bg-[#0A0A0A] rounded-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5 pb-1">
              <span className="w-2 h-2 rounded-full bg-[#BFDD25] shadow-[0_0_8px_rgba(191,221,37,0.6)]" />
              <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
                {isEn ? "1. General Product Information" : "1. Informasi Dasar Produk"}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider mb-2 font-semibold">
                  {isEn ? "Product Name / Model *" : "Nama Produk / Model *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    category === "IN-EAR MONITORS"
                      ? "e.g. Moondrop Blessing 3 Hybrid"
                      : category === "HEADPHONES"
                      ? "e.g. Sennheiser HD 660S2 Open-Back"
                      : category === "DAC/AMP"
                      ? "e.g. Topping DX3 Pro+ Desktop DAC/AMP"
                      : category === "CABLES & ADAPTERS"
                      ? "e.g. Effect Audio Ares S 8-Wire 4.4mm"
                      : "e.g. FiiO M15S Flagship Android DAP"
                  }
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl px-4 py-3 text-xs font-sans text-white placeholder:text-[#666] outline-none border-0 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
                    {isEn ? "Product Category *" : "Kategori Produk *"}
                  </label>
                  <CustomSelect
                    value={category}
                    onChange={handleCategoryChange}
                    options={[
                      { label: "IN-EAR MONITORS (IEM)", value: "IN-EAR MONITORS" },
                      { label: "HEADPHONES (OVER-EAR / ON-EAR)", value: "HEADPHONES" },
                      { label: "DAC / AMP & DONGLE", value: "DAC/AMP" },
                      { label: "DIGITAL AUDIO PLAYERS (DAP)", value: "DIGITAL AUDIO PLAYERS" },
                      { label: "AUDIO CABLES & ADAPTERS", value: "CABLES & ADAPTERS" },
                      { label: "SPEAKERS & STUDIO MONITORS", value: "SPEAKERS & MONITORS" },
                      { label: "EARTIPS & ACCESSORIES", value: "ACCESSORIES" },
                      { label: "MICROPHONES & RECORDING", value: "MICROPHONES" },
                    ]}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider">
                      {isEn ? "Authorized Brand *" : "Brand Terdaftar *"}
                    </label>
                    {isOfficialBrand && (
                      <span className="text-[10px] font-mono text-[#D4D4D8] bg-[#181818] px-2.5 py-0.5 rounded-full">
                        Master Catalog Lock
                      </span>
                    )}
                  </div>
                  {isOfficialBrand ? (
                    <div className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-mono font-bold text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#BFDD25] shadow-[0_0_6px_rgba(191,221,37,0.6)]" />
                        <span>{officialBrandName || "MOONDROP"}</span>
                      </div>
                      <span className="text-[10px] font-normal text-[#71717A]">Official Manufacturer</span>
                    </div>
                  ) : (
                    <CustomSelect
                      value={formData.brand}
                      onChange={(val) => setFormData({ ...formData, brand: val })}
                      options={[
                        { label: "64 Audio", value: "64 Audio" },
                        { label: "7Hz", value: "7Hz" },
                        { label: "Astell&Kern", value: "Astell&Kern" },
                        { label: "Audio-Technica", value: "Audio-Technica" },
                        { label: "Campfire Audio", value: "Campfire Audio" },
                        { label: "Dunu", value: "Dunu" },
                        { label: "Earfun", value: "Earfun" },
                        { label: "Effect Audio", value: "Effect Audio" },
                        { label: "EPZ", value: "EPZ" },
                        { label: "FiiO", value: "FiiO" },
                        { label: "Final Audio", value: "Final Audio" },
                        { label: "Genelec", value: "Genelec" },
                        { label: "Hifiman", value: "Hifiman" },
                        { label: "KBEAR", value: "KBEAR" },
                        { label: "Kinera Audio", value: "Kinera Audio" },
                        { label: "Kiwi Ears", value: "Kiwi Ears" },
                        { label: "Letshuoer", value: "Letshuoer" },
                        { label: "Meze Audio", value: "Meze Audio" },
                        { label: "Moondrop", value: "Moondrop" },
                        { label: "QDC", value: "QDC" },
                        { label: "SeeAudio", value: "SeeAudio" },
                        { label: "Sennheiser", value: "Sennheiser" },
                        { label: "Shure", value: "Shure" },
                        { label: "Sony", value: "Sony" },
                        { label: "Tanchjim", value: "Tanchjim" },
                        { label: "Tangzu", value: "Tangzu" },
                        { label: "THIEAUDIO", value: "THIEAUDIO" },
                        { label: "TinHiFi", value: "TinHiFi" },
                        { label: "Topping", value: "Topping" },
                        { label: "Truthear", value: "Truthear" },
                        { label: "Verus Audio", value: "Verus Audio" },
                        { label: "Xinhs", value: "Xinhs" },
                      ]}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
                    {isEn ? "Item Condition" : "Kondisi Barang"}
                  </label>
                  <CustomSelect
                    value={formData.condition}
                    onChange={(val) => setFormData({ ...formData, condition: val })}
                    options={[
                      { label: isEn ? "Brand New (Sealed in Box)" : "Baru Segel Resmi (BNIB)", value: "Brand New Sealed" },
                      { label: isEn ? "Like New (Open Box Demo)" : "Buka Segel Demo (Like New)", value: "Like New" },
                      { label: isEn ? "Refurbished / Certified" : "Rekondisi Resmi Pabrik", value: "Refurbished" },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider mb-2 font-semibold">
                    {isEn ? "Official Warranty (Months)" : "Garansi Resmi (Bulan)"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.warrantyMonths}
                    onChange={(e) => setFormData({ ...formData, warrantyMonths: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border-0 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider mb-2 font-semibold">
                  {isEn ? "Product Overview & Package Contents" : "Deskripsi Produk & Kelengkapan Box"}
                </label>
                <textarea
                  rows={4}
                  placeholder={
                    isEn
                      ? "Sound characteristics, technical architecture, package contents (cables, tips, cases), build quality..."
                      : "Karakteristik audio, komponen teknis, kelengkapan aksesoris dalam box, garansi distributor..."
                  }
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl p-4 text-xs font-sans text-white placeholder:text-[#666] outline-none border-0 transition-all resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Dynamic Category-Specific Technical Specs */}
          <div className="bg-[#0A0A0A] rounded-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5 pb-1">
              <span className="w-2 h-2 rounded-full bg-[#BFDD25] shadow-[0_0_8px_rgba(191,221,37,0.6)]" />
              <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
                {isEn
                  ? `2. Technical Specifications (${category})`
                  : `2. Spesifikasi Teknis (${category})`}
              </h3>
            </div>

            {/* DYNAMIC FORM PER CATEGORY */}
            {category === "IN-EAR MONITORS" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider mb-2 font-semibold">
                    {isEn ? "Driver Configuration *" : "Konfigurasi Driver *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1DD (10mm Carbon) + 4BA (Knowles)"
                    value={formData.driverType}
                    onChange={(e) => setFormData({ ...formData, driverType: e.target.value })}
                    className="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border-0 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider mb-2 font-semibold">
                    {isEn ? "Sound Signature *" : "Karakter Suara *"}
                  </label>
                  <CustomSelect
                    value={formData.soundSignature}
                    onChange={(val) => setFormData({ ...formData, soundSignature: val })}
                    options={[
                      { label: isEn ? "Harman Target 2019 (Engaging)" : "Target Harman 2019", value: "Harman Target 2019" },
                      { label: isEn ? "Diffuse Field / Neutral Reference" : "Netral Reference (DF)", value: "Neutral Reference" },
                      { label: isEn ? "Warm & Musical (Rich Vocals)" : "Warm & Musikal (Vokal Tebal)", value: "Warm Musical" },
                      { label: isEn ? "V-Shape Fun (Punchy Bass)" : "V-Shape Fun (Bass Nendang)", value: "V-Shape Fun" },
                      { label: isEn ? "Bright Analytical (Micro-Detail)" : "Bright Analitikal (Detail Tinggi)", value: "Bright Analytical" },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider mb-2 font-semibold">
                    {isEn ? "Impedance (Ω)" : "Impedansi (Ω)"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 14.8 Ω @ 1kHz"
                    value={formData.impedance}
                    onChange={(e) => setFormData({ ...formData, impedance: e.target.value })}
                    className="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border-0 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider mb-2 font-semibold">
                    {isEn ? "Sensitivity" : "Sensitivitas"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 120 dB/Vrms"
                    value={formData.sensitivity}
                    onChange={(e) => setFormData({ ...formData, sensitivity: e.target.value })}
                    className="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border-0 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider mb-2 font-semibold">
                    {isEn ? "Pin Connector Type" : "Tipe Pin Konektor"}
                  </label>
                  <CustomSelect
                    value={formData.pinType}
                    onChange={(val) => setFormData({ ...formData, pinType: val })}
                    options={[
                      { label: "0.78mm 2-Pin (Standard)", value: "0.78mm 2-Pin" },
                      { label: "MMCX Coaxial", value: "MMCX" },
                      { label: "Pentaconn Ear", value: "Pentaconn Ear" },
                      { label: "QDC / TFZ Covered 2-Pin", value: "QDC 2-Pin" },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider mb-2 font-semibold">
                    {isEn ? "Frequency Response Range" : "Rentang Frekuensi"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10Hz - 40,000Hz"
                    value={formData.frequencyRange}
                    onChange={(e) => setFormData({ ...formData, frequencyRange: e.target.value })}
                    className="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border-0 transition-all"
                  />
                </div>
              </div>
            )}

            {category === "HEADPHONES" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
                    {isEn ? "Acoustic Design *" : "Desain Akustik *"}
                  </label>
                  <CustomSelect
                    value={formData.headphoneDesign}
                    onChange={(val) => setFormData({ ...formData, headphoneDesign: val })}
                    options={[
                      { label: "Over-Ear (Open-Back)", value: "Over-Ear (Open-Back)" },
                      { label: "Over-Ear (Closed-Back)", value: "Over-Ear (Closed-Back)" },
                      { label: "On-Ear (Portable)", value: "On-Ear (Portable)" },
                      { label: "Wireless ANC Flagship", value: "Wireless ANC" },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
                    {isEn ? "Driver Tech & Size *" : "Tipe & Ukuran Driver *"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 50mm Beryllium Dynamic or Planar Magnetic"
                    value={formData.headphoneDriverSize}
                    onChange={(e) => setFormData({ ...formData, headphoneDriverSize: e.target.value })}
                    className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border-0 focus:ring-1 focus:ring-white/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
                    {isEn ? "Impedance & Sensitivity" : "Impedansi & Sensitivitas"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 300 Ω / 104 dB"
                    value={formData.impedance}
                    onChange={(e) => setFormData({ ...formData, impedance: e.target.value })}
                    className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border-0 focus:ring-1 focus:ring-white/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
                    {isEn ? "Weight (Grams)" : "Berat Headphone"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 380g (Without Cable)"
                    value={formData.weightGrams}
                    onChange={(e) => setFormData({ ...formData, weightGrams: e.target.value })}
                    className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border-0 focus:ring-1 focus:ring-white/20 transition-all"
                  />
                </div>
              </div>
            )}

            {category === "DAC/AMP" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
                    {isEn ? "DAC Chipset Architecture *" : "Chipset DAC *"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dual ESS ES9038PRO or AK4499EX / R2R Ladder"
                    value={formData.dacChipset}
                    onChange={(e) => setFormData({ ...formData, dacChipset: e.target.value })}
                    className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border-0 focus:ring-1 focus:ring-white/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
                    {isEn ? "Output Power (mW) *" : "Daya Output Headphone *"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2000mW @ 32Ω (4.4mm Balanced)"
                    value={formData.outputPower}
                    onChange={(e) => setFormData({ ...formData, outputPower: e.target.value })}
                    className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border-0 focus:ring-1 focus:ring-white/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
                    {isEn ? "Audio Inputs" : "Input Audio"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. USB-C XMOS XU316, Optical, Coaxial, Bluetooth LDAC"
                    value={formData.inputs}
                    onChange={(e) => setFormData({ ...formData, inputs: e.target.value })}
                    className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border-0 focus:ring-1 focus:ring-white/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
                    {isEn ? "Audio Outputs" : "Output Audio"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3.5mm SE, 4.4mm Bal, 6.35mm, XLR Pre-Out"
                    value={formData.outputs}
                    onChange={(e) => setFormData({ ...formData, outputs: e.target.value })}
                    className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border-0 focus:ring-1 focus:ring-white/20 transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Pricing, Inventory, Variants & Photos */}
        <div className="space-y-6">
          {/* Section 3: Pricing, Stock & Product Variants */}
          <div className="bg-[#0A0A0A] rounded-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5 pb-1">
              <span className="w-2 h-2 rounded-full bg-[#BFDD25] shadow-[0_0_8px_rgba(191,221,37,0.6)]" />
              <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
                {isEn ? "3. Pricing & Variants" : "3. Harga & Varian Produk"}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider mb-2 font-semibold">
                  {isEn ? "Base Price (USD) *" : "Harga Dasar (USD) *"}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BFDD25] text-sm font-mono font-bold">$</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.priceUSD}
                    onChange={(e) => setFormData({ ...formData, priceUSD: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl pl-9 pr-4 py-3 text-sm font-mono font-bold text-[#BFDD25] outline-none border-0 transition-all"
                  />
                </div>
                <p className="text-[10px] font-mono text-[#A1A1AA] mt-1.5">
                  ≈ Rp {(formData.priceUSD * 15500).toLocaleString("id-ID")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider mb-2 font-semibold">
                    {isEn ? "Total Stock *" : "Stok Unit *"}
                  </label>
                  <div className="flex items-center bg-[#161616] ring-1 ring-white/10 hover:ring-white/20 shadow-inner rounded-xl overflow-hidden transition-all">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, stock: Math.max(0, formData.stock - 1) })}
                      className="px-4 py-3 text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A] transition-colors font-mono cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-transparent text-xs font-mono text-white outline-none text-center"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, stock: formData.stock + 1 })}
                      className="px-4 py-3 text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A] transition-colors font-mono cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider mb-2 font-semibold">
                    {isEn ? "Internal SKU" : "Kode SKU"}
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-[#161616] hover:bg-[#1A1A1A] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-[#BFDD25] shadow-inner rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border-0 transition-all"
                  />
                </div>
              </div>

              {/* Product Variants Builder */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-sans">
                    {isEn ? "Product Variants" : "Varian Produk"}
                  </span>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-3 py-1.5 bg-[#141414] hover:bg-[#1E1E1E] text-white text-[10px] font-mono font-bold rounded-full transition-colors cursor-pointer"
                  >
                    + {isEn ? "Add Option" : "Tambah Opsi"}
                  </button>
                </div>

                {variants.length > 0 ? (
                  <div className="space-y-2.5">
                    {variants.map((v) => (
                      <div key={v.id} className="p-3.5 rounded-xl bg-[#121212] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={v.name}
                            onChange={(e) => handleUpdateVariant(v.id, "name", e.target.value)}
                            placeholder={isEn ? "e.g. 4.4mm Balanced" : "e.g. Warna Hitam"}
                            className="bg-[#181818] rounded-lg px-3 py-1.5 text-xs font-sans text-white outline-none flex-1 mr-2 border-0 focus:ring-1 focus:ring-white/20"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(v.id)}
                            className="text-[#71717A] hover:text-rose-400 p-1 cursor-pointer"
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#BFDD25]">$</span>
                            <input
                              type="number"
                              value={v.priceUSD}
                              onChange={(e) => handleUpdateVariant(v.id, "priceUSD", parseFloat(e.target.value) || 0)}
                              placeholder="Price"
                              className="w-full bg-[#181818] rounded-lg pl-6 pr-2 py-1.5 text-[#BFDD25] font-bold outline-none text-right border-0 focus:ring-1 focus:ring-white/20"
                            />
                          </div>
                          <div className="flex items-center bg-[#181818] rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleUpdateVariant(v.id, "stock", Math.max(0, (v.stock || 0) - 1))}
                              className="px-2 py-1.5 text-[#888] hover:text-white cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => handleUpdateVariant(v.id, "stock", parseInt(e.target.value, 10) || 0)}
                              placeholder="Stock"
                              className="w-full bg-transparent text-white outline-none text-center"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateVariant(v.id, "stock", (v.stock || 0) + 1)}
                              className="px-2 py-1.5 text-[#888] hover:text-white cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#71717A] font-mono">
                    {isEn ? "No variants added (single item SKU)." : "Tidak ada varian (produk tunggal)."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Multi-Image Product Gallery Upload */}
          <div className="bg-[#0A0A0A] rounded-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#BFDD25] shadow-[0_0_8px_rgba(191,221,37,0.6)]" />
                <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
                  {isEn ? "4. Photo Gallery" : "4. Galeri Foto Produk"}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#71717A]">
                {productImages.length} {isEn ? "Photos" : "Foto"} (Max 8)
              </span>
            </div>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleMultipleImageUpload(e.target.files);
                }
              }}
            />

            {productImages.length > 0 ? (
              <div className="space-y-3">
                {/* Primary Cover Image Preview */}
                <div className="relative rounded-2xl overflow-hidden h-48 bg-[#121212] group">
                  <img src={productImages[0]} alt="Primary Cover" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white text-[9px] font-mono font-medium tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#BFDD25]" />
                    {isEn ? "MAIN COVER" : "SAMPUL UTAMA"}
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="px-3 py-1.5 bg-[#181818] hover:bg-[#222] text-white text-[11px] font-mono rounded-full cursor-pointer transition-all"
                    >
                      {isEn ? "Add More Photos" : "Tambah Foto Lagi"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(0)}
                      className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-mono rounded-full cursor-pointer transition-all"
                    >
                      {isEn ? "Delete" : "Hapus"}
                    </button>
                  </div>
                </div>

                {/* Additional Thumbnails Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
                  {productImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden h-16 bg-[#121212] group"
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-black/80 text-white text-[8px] font-mono px-1.5 py-0.5 rounded-full">
                          Cover
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity p-1">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className="w-full py-0.5 bg-[#BFDD25] text-black text-[8px] font-mono font-bold rounded-full cursor-pointer"
                            title="Set as Main Cover"
                          >
                            {isEn ? "Set Main" : "Utama"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="w-full py-0.5 bg-rose-500/30 text-rose-200 text-[8px] font-mono rounded-full cursor-pointer"
                        >
                          {isEn ? "Delete" : "Hapus"}
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add More Thumbnail Box */}
                  {productImages.length < 8 && (
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="rounded-xl bg-[#121212] hover:bg-[#181818] h-16 flex flex-col items-center justify-center text-[#71717A] hover:text-white transition-all cursor-pointer"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      <span className="text-[9px] font-mono mt-0.5">{isEn ? "+ Add" : "+ Foto"}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div
                onClick={() => imageInputRef.current?.click()}
                className="bg-[#121212] hover:bg-[#161616] rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#181818] flex items-center justify-center text-[#BFDD25] mx-auto">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">
                    {isEn ? "Upload Multiple Product Photos" : "Upload Beberapa Foto Produk Sekaligus"}
                  </p>
                  <p className="text-[11px] font-mono text-[#71717A] mt-1">
                    {isEn ? "Select multiple images (PNG, JPG, WebP)" : "Pilih beberapa file sekaligus (PNG, JPG, WebP)"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
