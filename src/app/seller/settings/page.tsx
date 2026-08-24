"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import CustomSelect from "@/components/ui/custom-select";

export default function SellerSettingsPage() {
  const { language } = useLanguage();
  const isEn = language === "English";
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [storeData, setStoreData] = useState({
    storeName: "AudioZone Official",
    storeType: "RETAIL_MERCHANT" as "RETAIL_MERCHANT" | "OFFICIAL_BRAND",
    storeCurrency: "IDR" as "IDR" | "USD",
    tagline: "Curated Audiophile IEMs, Headphones, DAC/AMPs & Custom Cables",
    email: "support@audiozone.id",
    phone: "+62 812-8899-7711",
    originAddress: "Komplek Ruko Daan Mogot Permai Blok B2 No. 14, Grogol Petamburan, Jakarta Barat, DKI Jakarta, 11470",
    bankName: "BCA (Bank Central Asia)",
    bankAccount: "0123456789",
    accountHolder: "Alexander Rivera",
    authorizedBrands: ["Moondrop", "Sennheiser", "64 Audio", "Effect Audio", "Hifiman", "FiiO", "Topping", "TANGZU"],
    storeAvatar: "",
    storeBanner: "",
  });

  const [isSaved, setIsSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem("tonalzone_user");
    const savedCurrency = localStorage.getItem("tonalzone_seller_currency") as "IDR" | "USD" | null;
    const savedMode = localStorage.getItem("tonalzone_seller_mode") as "RETAIL_MERCHANT" | "OFFICIAL_BRAND" | null;

    if (stored) {
      try {
        const u = JSON.parse(stored);
        setStoreData((prev) => ({
          ...prev,
          storeName: u.storeName || prev.storeName,
          storeType: savedMode || u.storeType || prev.storeType,
          storeCurrency: savedCurrency || u.storeCurrency || (u.location === "Indonesia" ? "IDR" : prev.storeCurrency),
          email: u.email || prev.email,
          tagline: u.tagline || prev.tagline,
          phone: u.phone || prev.phone,
          originAddress: u.originAddress || prev.originAddress,
          bankName: u.bankName || prev.bankName,
          bankAccount: u.bankAccount || prev.bankAccount,
          accountHolder: u.accountHolder || (u.name || prev.accountHolder),
          storeAvatar: u.storeAvatar || "",
          storeBanner: u.storeBanner || "",
        }));
        if (u.storeAvatar) setAvatarPreview(u.storeAvatar);
        if (u.storeBanner) setBannerPreview(u.storeBanner);
      } catch (e) {}
    }
  }, []);

  const handleAvatarChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAvatarPreview(result);
      setStoreData((prev) => ({ ...prev, storeAvatar: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleBannerChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setBannerPreview(result);
      setStoreData((prev) => ({ ...prev, storeBanner: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stored = localStorage.getItem("tonalzone_user");
      const currentUser = stored ? JSON.parse(stored) : {};
      const updatedUser = {
        ...currentUser,
        ...storeData,
        storeAvatar: avatarPreview,
        storeBanner: bannerPreview,
      };
      localStorage.setItem("tonalzone_user", JSON.stringify(updatedUser));
      localStorage.setItem("tonalzone_seller_currency", storeData.storeCurrency);
      localStorage.setItem("tonalzone_seller_mode", storeData.storeType);

      // Notify other components and tabs
      window.dispatchEvent(new Event("storage"));
    } catch (e) {}

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Top Header & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E1E1E]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold font-sans tracking-tight text-white">
              {isEn ? "Store Profile & Payout Settings" : "Profil Toko & Pengaturan Pencairan"}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#141414] text-[#A1A1AA] border border-[#27272A] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {storeData.storeType === "OFFICIAL_BRAND" ? "OFFICIAL BRAND" : "VERIFIED MERCHANT"}
            </span>
          </div>
          <p className="text-xs font-mono text-[#8E8E93] mt-1">
            {isEn
              ? "Manage store identity, default currency (IDR / USD), account operating type, origin shipping address, and bank payout credentials."
              : "Kelola identitas toko, mata uang dasar (IDR / USD), tipe akun seller/brand, alamat asal pengiriman, dan rekening bank pencairan."}
          </p>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-[#FAF9F6] text-black hover:bg-[#E5E5E5] text-xs font-sans font-bold rounded-lg transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          {isEn ? "Save Changes" : "Simpan Pengaturan"}
        </button>
      </div>

      {isSaved && (
        <div className="p-4 rounded-xl bg-[#141414] border border-[#2A2A2A] text-white text-xs font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {isEn ? "Store settings and preferences saved successfully!" : "Pengaturan profil toko berhasil diperbarui!"}
        </div>
      )}

      {/* Store Banner & Avatar Section */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
        {/* Cover Banner */}
        <div className="relative h-40 bg-[#161616] border-b border-[#222]">
          {bannerPreview ? (
            <img src={bannerPreview} alt="Cover Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-mono text-[#666]">
              {isEn ? "No Store Cover Banner Uploaded (1200 x 300 Recommended)" : "Belum Ada Banner Toko (Ukuran Rekomendasi 1200 x 300)"}
            </div>
          )}

          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) handleBannerChange(e.target.files[0]);
            }}
          />
          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            className="absolute top-3 right-3 px-3 py-1.5 bg-[#0D0D0D]/80 hover:bg-[#0D0D0D] backdrop-blur-md text-white text-xs font-mono rounded-lg border border-[#333] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            </svg>
            {isEn ? "Change Banner" : "Ganti Banner"}
          </button>
        </div>

        {/* Store Avatar & Quick Info Header */}
        <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#141414]">
          <div className="relative -mt-12 group">
            <div className="w-20 h-20 rounded-xl bg-[#1E1E1E] border-2 border-[#333] overflow-hidden flex items-center justify-center font-mono font-bold text-xl text-white shadow-xl">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                storeData.storeName.slice(0, 2).toUpperCase()
              )}
            </div>

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) handleAvatarChange(e.target.files[0]);
              }}
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-mono transition-opacity rounded-xl cursor-pointer"
            >
              {isEn ? "Upload" : "Ganti"}
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-sans">{storeData.storeName}</h2>
              <span className={`w-2 h-2 rounded-full ${storeData.storeType === "OFFICIAL_BRAND" ? "bg-amber-400" : "bg-emerald-400"}`} />
            </div>
            <p className="text-xs font-mono text-[#888] mt-0.5">{storeData.tagline}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="px-3 py-1.5 bg-[#222] hover:bg-[#2A2A2A] text-white text-xs font-mono rounded-lg border border-[#333] transition-colors cursor-pointer"
            >
              {isEn ? "Upload Store Avatar" : "Upload Foto Profil"}
            </button>
            {avatarPreview && (
              <button
                type="button"
                onClick={() => {
                  setAvatarPreview("");
                  setStoreData((prev) => ({ ...prev, storeAvatar: "" }));
                }}
                className="px-2 py-1 text-rose-400 hover:text-rose-300 text-[10px] font-mono transition-colors cursor-pointer"
              >
                {isEn ? "Remove Photo" : "Hapus Foto"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Store Operating Mode & Currency Settings */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#1E1E1E]">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
              {isEn ? "Store Currency & Operating Type" : "Mata Uang & Tipe Akun Toko"}
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                {isEn ? "Store Operating Account Type *" : "Tipe Akun Operasional Toko *"}
              </label>
              <CustomSelect
                value={storeData.storeType}
                onChange={(val) => setStoreData({ ...storeData, storeType: val as any })}
                options={[
                  { label: "Retail Merchant Store (Multi-Brand Toko Retail Audio)", value: "RETAIL_MERCHANT" },
                  { label: "Official Brand Manufacturer (Flagship Hub - TANGZU Audio)", value: "OFFICIAL_BRAND" },
                ]}
              />
              <p className="text-[10px] font-mono text-[#666] mt-1">
                {storeData.storeType === "OFFICIAL_BRAND"
                  ? isEn
                    ? "Enables Official Brand Suite: Master FR Vault, Brand Story, Pre-Orders & Reseller Licensing."
                    : "Mengaktifkan menu Brand Resmi: Master FR Vault, Brand Story, Pre-Order & Sertifikasi Reseller."
                  : isEn
                  ? "Standard retail merchant selling authorized multi-brand audiophile gear."
                  : "Toko ritel standar yang menjual berbagai produk audio bergaransi resmi."}
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                {isEn ? "Base Store Currency (Default Pricing Unit) *" : "Mata Uang Dasar Toko (Standar Input Harga) *"}
              </label>
              <CustomSelect
                value={storeData.storeCurrency}
                onChange={(val) => setStoreData({ ...storeData, storeCurrency: val as any })}
                options={[
                  { label: "IDR (Indonesian Rupiah - Rp)", value: "IDR" },
                  { label: "USD (US Dollar - $)", value: "USD" },
                ]}
              />
              <p className="text-[10px] font-mono text-[#666] mt-1">
                {isEn
                  ? "Products, catalog prices, and bank payouts will be processed in this selected currency."
                  : "Input harga produk, katalog, dan pencairan saldo bank akan dihitung dalam mata uang ini."}
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                {isEn ? "Store Display Name *" : "Nama Toko *" }
              </label>
              <input
                type="text"
                required
                value={storeData.storeName}
                onChange={(e) => setStoreData({ ...storeData, storeName: e.target.value })}
                className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-sans text-white outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                {isEn ? "Store Slogan / Bio" : "Slogan / Bio Toko"}
              </label>
              <input
                type="text"
                value={storeData.tagline}
                onChange={(e) => setStoreData({ ...storeData, tagline: e.target.value })}
                className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-sans text-white outline-none focus:border-white"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Bank Payout & Warehouse Address */}
        <div className="space-y-6">
          {/* Bank Account */}
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1E1E1E]">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
                {isEn ? "Bank Payout Account" : "Rekening Bank Pencairan Dana"}
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                  {isEn ? "Bank Name *" : "Nama Bank *"}
                </label>
                <CustomSelect
                  value={storeData.bankName}
                  onChange={(val) => setStoreData({ ...storeData, bankName: val })}
                  options={[
                    { label: "BCA (Bank Central Asia)", value: "BCA (Bank Central Asia)" },
                    { label: "Bank Mandiri", value: "Bank Mandiri" },
                    { label: "BNI (Bank Negara Indonesia)", value: "BNI (Bank Negara Indonesia)" },
                    { label: "BRI (Bank Rakyat Indonesia)", value: "BRI (Bank Rakyat Indonesia)" },
                    { label: "Bank Jago", value: "Bank Jago" },
                    { label: "CIMB Niaga", value: "CIMB Niaga" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                    {isEn ? "Account Number *" : "Nomor Rekening *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={storeData.bankAccount}
                    onChange={(e) => setStoreData({ ...storeData, bankAccount: e.target.value })}
                    className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
                    {isEn ? "Account Holder Name *" : "Nama Pemilik Rekening *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={storeData.accountHolder}
                    onChange={(e) => setStoreData({ ...storeData, accountHolder: e.target.value })}
                    className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-sans text-white outline-none focus:border-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Warehouse Origin Shipping Address */}
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 space-y-3">
            <label className="block text-[11px] font-mono text-[#888] uppercase mb-1">
              {isEn ? "Warehouse Shipping Origin (Indonesia)" : "Alamat Asal Gudang Pengiriman (Indonesia)"}
            </label>
            <textarea
              rows={3}
              value={storeData.originAddress}
              onChange={(e) => setStoreData({ ...storeData, originAddress: e.target.value })}
              className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg p-3 text-xs font-sans text-white outline-none focus:border-white resize-none"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
