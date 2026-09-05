"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import CustomSelect from "@/components/ui/custom-select";

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

  useEffect(() => {
    const loadCurrency = () => {
      const saved = localStorage.getItem("tonalzone_seller_currency") as "IDR" | "USD" | null;
      if (saved) {
        setCurrency(saved);
      } else {
        const stored = localStorage.getItem("tonalzone_user");
        if (stored) {
          try {
            const u = JSON.parse(stored);
            if (u.storeCurrency) setCurrency(u.storeCurrency);
            else if (u.location === "Indonesia") setCurrency("IDR");
          } catch (e) {}
        }
      }
    };

    loadCurrency();
    window.addEventListener("storage", loadCurrency);
    return () => window.removeEventListener("storage", loadCurrency);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newProd = {
      id: `PRD-NEW-${Date.now()}`,
      name: formData.name,
      brand: formData.brand,
      category: formData.category,
      specsSummary: `${formData.driverType || "Audiophile Structure"} • ${formData.impedance || "16Ω"}`,
      priceUSD: formData.priceUSD,
      stock: formData.stock,
      condition: formData.condition,
      status: "APPROVED" as const,
      createdAt: new Date().toISOString().split("T")[0],
      images: productImages.length > 0 ? productImages : ["/model-iem-untuk-hero.webp"],
      image: productImages.length > 0 ? productImages[0] : "/model-iem-untuk-hero.webp",
      variants: variants.length > 0 ? variants : [
        { id: `var-1-${Date.now()}`, name: "Standard 3.5mm SE", priceUSD: formData.priceUSD, stock: Math.ceil(formData.stock / 2), sku: `${formData.sku}-35` },
        { id: `var-2-${Date.now()}`, name: "Balanced 4.4mm Pentaconn", priceUSD: formData.priceUSD, stock: Math.floor(formData.stock / 2), sku: `${formData.sku}-44` },
      ],
    };

    try {
      const existing = localStorage.getItem("tonalzone_custom_products");
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newProd);
      localStorage.setItem("tonalzone_custom_products", JSON.stringify(list));
      window.dispatchEvent(new Event("storage"));
    } catch (err) {}

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessBanner(true);
      setTimeout(() => {
        router.push("/seller/products");
      }, 1200);
    }, 600);
  };

  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    setFormData((prev) => ({ ...prev, category: cat }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header & Submit Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E1E1E]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold font-sans tracking-tight text-white">
              {isEn ? "Add New Audio Product" : "Tambah Produk Audio Baru"}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider bg-[#161616] text-[#D4D4D8] border border-[#27272A]">
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
            className="px-4 py-2 bg-[#141414] hover:bg-[#1C1C1C] border border-[#262626] hover:border-[#3E3E3E] text-white text-xs font-mono rounded-lg transition-colors cursor-pointer"
          >
            {isEn ? "Cancel" : "Batal"}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#FAF9F6] text-black hover:bg-[#E5E5E5] text-xs font-sans font-bold rounded-lg transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
                {isEn ? "Submit for QC Review" : "Kirim untuk Moderasi QC"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Master Catalog Shortcut Recommendation */}
      <div className="p-4 rounded-xl bg-[#141414] border border-[#2A2A2A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1F1F1F] border border-[#333] flex items-center justify-center text-white shrink-0">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 5.625a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.875 0a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm12 0a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white font-sans">
              {isEn ? "Selling official brand products (TANGZU, Moondrop, Sennheiser)?" : "Ingin menjual IEM dari brand resmi (TANGZU, Moondrop, Sennheiser)?"}
            </h4>
            <p className="text-[11px] font-mono text-[#888] mt-0.5">
              {isEn
                ? "You don't need to fill this custom form. Select directly from the Master Catalog for 0-minute instant listing."
                : "Anda tidak perlu mengisi formulir panjang ini dari nol. Pilih langsung dari Master Katalog untuk langsung aktif tanpa antre QC."}
            </p>
          </div>
        </div>

        <Link
          href="/seller/products"
          className="px-3.5 py-1.5 bg-[#FAF9F6] text-black hover:bg-[#E5E5E5] text-xs font-sans font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 text-center"
        >
          {isEn ? "Open Master Catalog →" : "Buka Master Katalog →"}
        </Link>
      </div>

      {successBanner && (
        <div className="p-4 rounded-xl bg-[#141414] border border-[#2A2A2A] text-white text-xs font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          {isEn
            ? "Product listing submitted successfully! Transferred to Admin QC Queue."
            : "Produk berhasil dikirim! Masuk ke antrean verifikasi QC tim Admin."}
        </div>
      )}

      {/* Main Form Sections (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: General Info & Dynamic Category Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: General Product Information & Category Picker */}
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1E1E1E]">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
                {isEn ? "1. General Product Information" : "1. Informasi Dasar Produk"}
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
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
                  className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-sans text-white placeholder:text-[#555] outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
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
                  <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                    {isEn ? "Authorized Brand *" : "Brand Terdaftar *"}
                  </label>
                  <CustomSelect
                    value={formData.brand}
                    onChange={(val) => setFormData({ ...formData, brand: val })}
                    options={[
                      { label: "Moondrop", value: "Moondrop" },
                      { label: "Sennheiser", value: "Sennheiser" },
                      { label: "64 Audio", value: "64 Audio" },
                      { label: "Hifiman", value: "Hifiman" },
                      { label: "FiiO", value: "FiiO" },
                      { label: "Topping", value: "Topping" },
                      { label: "Effect Audio", value: "Effect Audio" },
                      { label: "Tangzu", value: "Tangzu" },
                      { label: "Truthear", value: "Truthear" },
                      { label: "7Hz", value: "7Hz" },
                      { label: "Sony", value: "Sony" },
                      { label: "Final Audio", value: "Final Audio" },
                      { label: "Campfire Audio", value: "Campfire Audio" },
                      { label: "Astell&Kern", value: "Astell&Kern" },
                      { label: "Audio-Technica", value: "Audio-Technica" },
                      { label: "Genelec", value: "Genelec" },
                      { label: "Shure", value: "Shure" },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
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
                  <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                    {isEn ? "Official Warranty (Months)" : "Garansi Resmi (Bulan)"}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.warrantyMonths}
                    onChange={(e) => setFormData({ ...formData, warrantyMonths: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
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
                  className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg p-3 text-xs font-sans text-white placeholder:text-[#555] outline-none focus:border-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Dynamic Category-Specific Technical Specs */}
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1E1E1E]">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
                {isEn
                  ? `2. Technical Specifications (${category})`
                  : `2. Spesifikasi Teknis (${category})`}
              </h3>
            </div>

            {/* DYNAMIC FORM PER CATEGORY */}
            {category === "IN-EAR MONITORS" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                    {isEn ? "Driver Configuration *" : "Konfigurasi Driver *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1DD (10mm Carbon) + 4BA (Knowles)"
                    value={formData.driverType}
                    onChange={(e) => setFormData({ ...formData, driverType: e.target.value })}
                    className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
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
                  <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                    {isEn ? "Impedance (Ω)" : "Impedansi (Ω)"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 14.8 Ω @ 1kHz"
                    value={formData.impedance}
                    onChange={(e) => setFormData({ ...formData, impedance: e.target.value })}
                    className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                    {isEn ? "Sensitivity" : "Sensitivitas"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 120 dB/Vrms"
                    value={formData.sensitivity}
                    onChange={(e) => setFormData({ ...formData, sensitivity: e.target.value })}
                    className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
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
                  <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                    {isEn ? "Frequency Response Range" : "Rentang Frekuensi"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10Hz - 40,000Hz"
                    value={formData.frequencyRange}
                    onChange={(e) => setFormData({ ...formData, frequencyRange: e.target.value })}
                    className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-white"
                  />
                </div>
              </div>
            )}

            {category === "HEADPHONES" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
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
                  <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                    {isEn ? "Driver Tech & Size *" : "Tipe & Ukuran Driver *"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 50mm Beryllium Dynamic or Planar Magnetic"
                    value={formData.headphoneDriverSize}
                    onChange={(e) => setFormData({ ...formData, headphoneDriverSize: e.target.value })}
                    className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                    {isEn ? "Impedance & Sensitivity" : "Impedansi & Sensitivitas"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 300 Ω / 104 dB"
                    value={formData.impedance}
                    onChange={(e) => setFormData({ ...formData, impedance: e.target.value })}
                    className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                    {isEn ? "Weight (Grams)" : "Berat Headphone"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 380g (Without Cable)"
                    value={formData.weightGrams}
                    onChange={(e) => setFormData({ ...formData, weightGrams: e.target.value })}
                    className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-white"
                  />
                </div>
              </div>
            )}

            {category === "DAC/AMP" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                    {isEn ? "DAC Chipset Architecture *" : "Chipset DAC *"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dual ESS ES9038PRO or AK4499EX / R2R Ladder"
                    value={formData.dacChipset}
                    onChange={(e) => setFormData({ ...formData, dacChipset: e.target.value })}
                    className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                    {isEn ? "Output Power (mW) *" : "Daya Output Headphone *"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2000mW @ 32Ω (4.4mm Balanced)"
                    value={formData.outputPower}
                    onChange={(e) => setFormData({ ...formData, outputPower: e.target.value })}
                    className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                    {isEn ? "Audio Inputs" : "Input Audio"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. USB-C XMOS XU316, Optical, Coaxial, Bluetooth LDAC"
                    value={formData.inputs}
                    onChange={(e) => setFormData({ ...formData, inputs: e.target.value })}
                    className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                    {isEn ? "Audio Outputs" : "Output Audio"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3.5mm SE, 4.4mm Bal, 6.35mm, XLR Pre-Out"
                    value={formData.outputs}
                    onChange={(e) => setFormData({ ...formData, outputs: e.target.value })}
                    className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Pricing, Inventory, Variants & Photos */}
        <div className="space-y-6">
          {/* Section 3: Pricing, Stock & Product Variants */}
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1E1E1E]">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
                {isEn ? "3. Pricing & Variants" : "3. Harga & Varian Produk"}
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                  {isEn ? "Base Price (USD) *" : "Harga Dasar (USD) *"}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 text-sm font-mono font-bold">$</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.priceUSD}
                    onChange={(e) => setFormData({ ...formData, priceUSD: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg pl-8 pr-3.5 py-2 text-sm font-mono font-bold text-emerald-400 outline-none focus:border-white"
                  />
                </div>
                <p className="text-[10px] font-mono text-[#666] mt-1">
                  ≈ Rp {(formData.priceUSD * 15500).toLocaleString("id-ID")}
                </p>
              </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                  {isEn ? "Total Stock *" : "Stok Unit *"}
                </label>
                <div className="flex items-center bg-[#161616] border border-[#2A2A2A] rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, stock: Math.max(0, formData.stock - 1) })}
                    className="px-3 py-2 text-[#888] hover:text-white hover:bg-[#222] transition-colors font-mono"
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
                    className="px-3 py-2 text-[#888] hover:text-white hover:bg-[#222] transition-colors font-mono"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                  {isEn ? "Internal SKU" : "Kode SKU"}
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-white"
                />
              </div>
            </div>

            {/* Product Variants Builder */}
            <div className="pt-3 border-t border-[#1E1E1E] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-sans">
                  {isEn ? "Product Variants" : "Varian Produk"}
                </span>
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="px-2.5 py-1 bg-[#1C1C1C] hover:bg-[#282828] text-white border border-[#2E2E2E] hover:border-white text-[10px] font-mono font-bold rounded-lg transition-colors cursor-pointer"
                >
                  + {isEn ? "Add Option" : "Tambah Opsi"}
                </button>
              </div>

              {variants.length > 0 ? (
                <div className="space-y-2">
                  {variants.map((v) => (
                    <div key={v.id} className="p-2.5 rounded-lg bg-[#161616] border border-[#262626] space-y-2">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={v.name}
                          onChange={(e) => handleUpdateVariant(v.id, "name", e.target.value)}
                          placeholder={isEn ? "e.g. 4.4mm Balanced" : "e.g. Warna Hitam"}
                          className="bg-[#111] border border-[#333] rounded px-2 py-1 text-xs font-sans text-white outline-none flex-1 mr-2"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(v.id)}
                          className="text-[#666] hover:text-rose-400"
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-400">$</span>
                          <input
                            type="number"
                            value={v.priceUSD}
                            onChange={(e) => handleUpdateVariant(v.id, "priceUSD", parseFloat(e.target.value) || 0)}
                            placeholder="Price"
                            className="w-full bg-[#111] border border-[#333] rounded pl-5 pr-2 py-1 text-emerald-400 font-bold outline-none text-right"
                          />
                        </div>
                        <div className="flex items-center bg-[#111] border border-[#333] rounded overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleUpdateVariant(v.id, "stock", Math.max(0, (v.stock || 0) - 1))}
                            className="px-1.5 py-1 text-[#888] hover:text-white"
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
                            className="px-1.5 py-1 text-[#888] hover:text-white"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#666] font-mono">
                    {isEn ? "No variants added (single item SKU)." : "Tidak ada varian (produk tunggal)."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Multi-Image Product Gallery Upload */}
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E1E1E]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-400" />
                <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
                  {isEn ? "4. Photo Gallery" : "4. Galeri Foto Produk"}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#888]">
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
                <div className="relative rounded-xl overflow-hidden border border-[#2E2E2E] h-44 bg-[#141414] group">
                  <img src={productImages[0]} alt="Primary Cover" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-black/90 text-white text-[9px] font-mono font-medium tracking-wider px-2 py-0.5 rounded border border-[#333] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {isEn ? "MAIN COVER" : "SAMPUL UTAMA"}
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="px-2.5 py-1.5 bg-[#222] text-white text-[11px] font-mono rounded-lg border border-[#444] hover:bg-[#333]"
                    >
                      {isEn ? "Add More Photos" : "Tambah Foto Lagi"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(0)}
                      className="px-2.5 py-1.5 bg-[#1C1C1C] hover:bg-[#282828] text-white text-[11px] font-mono rounded-lg border border-[#2E2E2E] hover:border-white"
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
                      className={`relative rounded-lg overflow-hidden border h-16 bg-[#161616] group ${
                        idx === 0 ? "border-white/30" : "border-[#262626]"
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-black/90 text-white text-[8px] font-mono px-1 rounded border border-[#333]">
                          Cover
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity p-1">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className="w-full py-0.5 bg-emerald-500 text-black text-[8px] font-mono font-bold rounded"
                            title="Set as Main Cover"
                          >
                            {isEn ? "Set Main" : "Utama"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="w-full py-0.5 bg-[#1C1C1C] hover:bg-[#282828] text-white text-[8px] font-mono rounded border border-[#2E2E2E]"
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
                      className="rounded-lg border border-dashed border-[#444] hover:border-[#666] bg-[#141414] hover:bg-[#1A1A1A] h-16 flex flex-col items-center justify-center text-[#777] hover:text-white transition-colors cursor-pointer"
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
                className="border border-dashed border-[#333] hover:border-[#555] bg-[#141414] hover:bg-[#181818] rounded-xl p-6 text-center cursor-pointer transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-[#1E1E1E] border border-[#333] flex items-center justify-center text-[#888] mx-auto mb-2">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-white">
                  {isEn ? "Upload Multiple Product Photos" : "Upload Beberapa Foto Produk Sekaligus"}
                </p>
                <p className="text-[10px] font-mono text-[#777] mt-0.5">
                  {isEn ? "Select multiple images (PNG, JPG, WebP)" : "Pilih beberapa file sekaligus (PNG, JPG, WebP)"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
