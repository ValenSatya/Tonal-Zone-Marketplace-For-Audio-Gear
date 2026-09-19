"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import CustomSelect from "@/components/ui/custom-select";
import {
  Clock,
  MessageSquare,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Settings,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function SellerSettingsPage() {
  const { language } = useLanguage();
  const isEn = language === "English";
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"profile" | "chat">("profile");

  // Store profile data
  const [storeData, setStoreData] = useState({
    storeName: "MOONDROP Official Flagship Store",
    storeType: "OFFICIAL_BRAND" as "RETAIL_MERCHANT" | "OFFICIAL_BRAND",
    brandName: "MOONDROP",
    storeCurrency: "IDR" as "IDR" | "USD",
    tagline: "Official Flagship Store for MOONDROP Technology Co., Ltd. - Reference Acoustic Laboratory",
    email: "valenandrasatya@gmail.com",
    phone: "+62 812-8899-7711",
    originAddress: "Chengdu High-Tech Zone / Jakarta Distribution Center, Indonesia",
    bankName: "BCA (Bank Central Asia)",
    bankAccount: "8830192841",
    accountHolder: "Valen Satya",
    storeAvatar: "",
    storeBanner: "",
    brandAcousticPhilosophy:
      "Moondrop Acoustic Laboratory adheres to scientific electroacoustic design based on the VDSF (Virtual Diffuse Sound Field) Target Curve, combining high-resolution beryllium, planar, and balanced armature driver topologies with studio-grade tonal neutrality.",
    tuningTargetCurve: "Moondrop VDSF Target 2024 / Harman Neutral IE",
    squiglinkUrl: "https://crinacle.com/graphs/iems/graphtool/",
    authorizedResellers: [
      { name: "Bass Audio Official Store", city: "Jakarta Pusat", verified: true },
      { name: "Kuping Sensi", city: "Bandung", verified: true },
      { name: "Inti Pratama Audio", city: "Surabaya", verified: true },
    ],
  });

  const [isSaved, setIsSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");

  // Chat & Operating Hours settings state
  const [chatSettings, setChatSettings] = useState<any>(null);
  const [liveStatus, setLiveStatus] = useState<any>(null);
  const [newTplTitle, setNewTplTitle] = useState("");
  const [newTplContent, setNewTplContent] = useState("");
  const [newTplShortcut, setNewTplShortcut] = useState("");
  const [isSavingChatSettings, setIsSavingChatSettings] = useState(false);
  const [chatSuccessMessage, setChatSuccessMessage] = useState("");

  useEffect(() => {
    const loadStore = async () => {
      const stored = localStorage.getItem("tonalzone_user");
      const savedCurrency = localStorage.getItem("tonalzone_seller_currency") as "IDR" | "USD" | null;

      if (stored) {
        try {
          const u = JSON.parse(stored);
          setStoreData((prev) => ({
            ...prev,
            storeName: u.storeName || prev.storeName,
            storeType: u.storeType || prev.storeType,
            brandName: u.brandName || prev.brandName,
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

      // Fetch verified store profile from backend Supabase API
      try {
        const res = await fetch("/api/seller/store");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.store) {
            const s = json.store;
            setStoreData((prev) => ({
              ...prev,
              storeName: s.storeName || prev.storeName,
              storeType: s.storeType || prev.storeType,
              brandName: s.brandName || prev.brandName,
              originAddress: s.address || prev.originAddress,
              bankName: s.bankName || prev.bankName,
              bankAccount: s.bankAccount || prev.bankAccount,
              brandAcousticPhilosophy: s.brandAcousticPhilosophy || prev.brandAcousticPhilosophy,
              tuningTargetCurve: s.tuningTargetCurve || prev.tuningTargetCurve,
              squiglinkUrl: s.squiglinkUrl || prev.squiglinkUrl,
              authorizedResellers: s.authorizedResellers || prev.authorizedResellers,
            }));
          }
        }
      } catch (err) {
        console.warn("Could not load /api/seller/store:", err);
      }
    };

    loadStore();
    loadChatSettings();
  }, []);

  const loadChatSettings = async () => {
    try {
      const stored = localStorage.getItem("tonalzone_user");
      let storeIdToUse = "store-official";
      if (stored) {
        try {
          const u = JSON.parse(stored);
          if (u.storeId) storeIdToUse = u.storeId;
        } catch (e) {}
      }

      const res = await fetch(`/api/seller/chat-settings?storeId=${encodeURIComponent(storeIdToUse)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setChatSettings(data.settings);
          if (data.liveStatus) setLiveStatus(data.liveStatus);
        }
      }
    } catch (e) {
      console.warn("Failed to load chat settings in seller settings:", e);
    }
  };

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplTitle.trim() || !newTplContent.trim() || !chatSettings) return;

    setIsSavingChatSettings(true);
    const newTpl = {
      id: `tpl-${Date.now()}`,
      title: newTplTitle.trim(),
      content: newTplContent.trim(),
      shortcut: newTplShortcut.trim() ? newTplShortcut.trim() : undefined,
    };

    const updated = [...chatSettings.templates, newTpl];

    try {
      const res = await fetch("/api/seller/chat-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: chatSettings.storeId,
          templates: updated,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setChatSettings(data.settings);
          setNewTplTitle("");
          setNewTplContent("");
          setNewTplShortcut("");
          setChatSuccessMessage("Template pesan cepat berhasil ditambahkan!");
          setTimeout(() => setChatSuccessMessage(""), 3000);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingChatSettings(false);
    }
  };

  const handleDeleteTemplate = async (tplId: string) => {
    if (!chatSettings) return;
    setIsSavingChatSettings(true);
    const updated = chatSettings.templates.filter((t: any) => t.id !== tplId);

    try {
      const res = await fetch("/api/seller/chat-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: chatSettings.storeId,
          templates: updated,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setChatSettings(data.settings);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingChatSettings(false);
    }
  };

  const handleSaveChatSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatSettings) return;
    setIsSavingChatSettings(true);

    try {
      const res = await fetch("/api/seller/chat-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: chatSettings.storeId,
          operatingHours: chatSettings.operatingHours,
          autoReplyOutOfHours: chatSettings.autoReplyOutOfHours,
          outOfHoursMessage: chatSettings.outOfHoursMessage,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setChatSettings(data.settings);
          if (data.liveStatus) setLiveStatus(data.liveStatus);
          setChatSuccessMessage("Pengaturan chat & jam operasional berhasil disimpan!");
          setTimeout(() => setChatSuccessMessage(""), 3000);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingChatSettings(false);
    }
  };

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/seller/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: storeData.storeName,
          address: storeData.originAddress,
          bankName: storeData.bankName,
          bankAccount: storeData.bankAccount,
          description: storeData.tagline,
        }),
      });

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
      window.dispatchEvent(new Event("storage"));
    } catch (e) {}

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-white">
              {isEn ? "Store Settings & Operations" : "Pengaturan Toko & Operasional"}
            </h1>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-medium bg-[#141414] text-[#D4D4D8] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BFDD25] shadow-[0_0_8px_rgba(191,221,37,0.6)]" />
              {storeData.storeType === "OFFICIAL_BRAND" ? "OFFICIAL BRAND" : "VERIFIED MERCHANT"}
            </span>
          </div>
          <p className="text-xs font-mono text-[#8E8E93] mt-1">
            {isEn
              ? "Manage store identity, chat templates, operating hours, and payout credentials."
              : "Kelola identitas toko, template pesan cepat, jam operasional, dan rekening bank pencairan."}
          </p>
        </div>

        <Link
          href="/seller/chat"
          className="px-5 py-2.5 rounded-full bg-[#161616] hover:bg-[#202020] text-xs font-semibold text-white flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <MessageSquare className="w-4 h-4 text-[#BFDD25]" />
          <span>Buka Portal Chat Seller</span>
        </Link>
      </div>

      {/* Settings Tab Switcher */}
      <div className="flex rounded-full bg-[#121212] p-1 gap-1 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex-1 py-2 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-[#242424] text-white"
              : "text-[#71717A] hover:text-white"
          }`}
        >
          {isEn ? "Store Profile & Payout" : "Profil Toko & Rekening"}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-2 px-4 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "chat"
              ? "bg-[#242424] text-white"
              : "text-[#71717A] hover:text-white"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#BFDD25]" />
          <span>{isEn ? "Chat & Operating Hours" : "Chat & Jam Operasional"}</span>
        </button>
      </div>

      {activeTab === "profile" && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-[#E5E5E5] text-xs font-sans font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span>{isEn ? "Save Changes" : "Simpan Pengaturan"}</span>
            </button>
          </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-[#141F17] text-[#BFDD25] text-xs font-sans flex items-center gap-2.5">
          <span>{isEn ? "Store settings and preferences saved successfully!" : "Pengaturan profil toko berhasil diperbarui!"}</span>
        </div>
      )}

      {/* Store Banner & Avatar Section (Rounded-2xl, Zero Stroke) */}
      <div className="bg-[#0A0A0A] rounded-2xl overflow-hidden">
        {/* Cover Banner */}
        <div className="relative h-44 bg-[#080808]">
          {bannerPreview ? (
            <img src={bannerPreview} alt="Cover Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-mono text-[#52525B]">
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
            className="absolute top-3.5 right-3.5 px-4 py-2 bg-black/70 hover:bg-black backdrop-blur-md text-white text-xs font-mono rounded-full transition-all cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            </svg>
            <span>{isEn ? "Change Banner" : "Ganti Banner"}</span>
          </button>
        </div>

        {/* Store Avatar & Quick Info Header */}
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 bg-[#0A0A0A]">
          <div className="relative -mt-14 group">
            <div className="w-20 h-20 rounded-2xl bg-[#141414] overflow-hidden flex items-center justify-center font-mono font-bold text-xl text-white shadow-2xl">
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
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-mono transition-opacity rounded-2xl cursor-pointer"
            >
              {isEn ? "Upload" : "Ganti"}
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-sans">{storeData.storeName}</h2>
              <span className={`w-2 h-2 rounded-full ${storeData.storeType === "OFFICIAL_BRAND" ? "bg-[#BFDD25] shadow-[0_0_8px_rgba(191,221,37,0.6)]" : "bg-emerald-400"}`} />
            </div>
            <p className="text-xs font-mono text-[#71717A] mt-0.5">{storeData.tagline}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="px-4 py-2 bg-[#141414] hover:bg-[#1E1E1E] text-white text-xs font-mono rounded-full transition-colors cursor-pointer"
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
                className="px-3 py-1.5 text-rose-400 hover:text-rose-300 text-[10px] font-mono transition-colors cursor-pointer"
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
        <div className="bg-[#0A0A0A] rounded-2xl p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 pb-1">
            <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
              {isEn ? "Store Currency & Operating Type" : "Mata Uang & Tipe Akun Toko"}
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
                {isEn ? "Store Operating Account Type" : "Tipe Akun Operasional Toko"}
              </label>
              <div className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-mono text-white flex items-center justify-between">
                <span className="flex items-center gap-2.5 font-semibold">
                  <span className={`w-2 h-2 rounded-full ${storeData.storeType === "OFFICIAL_BRAND" ? "bg-[#BFDD25] shadow-[0_0_8px_rgba(191,221,37,0.8)]" : "bg-emerald-400"}`} />
                  {storeData.storeType === "OFFICIAL_BRAND" ? "OFFICIAL BRAND MANUFACTURER (Pabrikan Resmi)" : "RETAIL MERCHANT (Toko Retail Audio)"}
                </span>
                <span className="text-[10px] text-[#BFDD25] bg-[#141F17] px-2.5 py-0.5 rounded-full font-mono">
                  {storeData.storeType === "OFFICIAL_BRAND" ? "VERIFIED BRAND" : "VERIFIED STORE"}
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#71717A] mt-1.5">
                {storeData.storeType === "OFFICIAL_BRAND"
                  ? isEn
                    ? "Official Brand Account: Direct master catalog publishing, acoustic tuning curves & reseller network management."
                    : "Akun Brand Resmi: Hak rilis instan Master Catalog, manajemen kurva tuning akustik & jaringan reseller resmi."
                  : isEn
                  ? "Standard retail merchant selling authorized multi-brand audiophile gear."
                  : "Toko ritel standar yang menjual berbagai produk audio bergaransi resmi."}
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
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
              <p className="text-[10px] font-mono text-[#71717A] mt-1.5">
                {isEn
                  ? "Products, catalog prices, and bank payouts will be processed in this selected currency."
                  : "Input harga produk, katalog, dan pencairan saldo bank akan dihitung dalam mata uang ini."}
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
                {isEn ? "Store Display Name *" : "Nama Toko *" }
              </label>
              <input
                type="text"
                required
                value={storeData.storeName}
                onChange={(e) => setStoreData({ ...storeData, storeName: e.target.value })}
                className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-sans text-white outline-none border-0 focus:ring-1 focus:ring-white/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
                {isEn ? "Store Slogan / Bio" : "Slogan / Bio Toko"}
              </label>
              <input
                type="text"
                value={storeData.tagline}
                onChange={(e) => setStoreData({ ...storeData, tagline: e.target.value })}
                className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-sans text-white outline-none border-0 focus:ring-1 focus:ring-white/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Bank Payout & Warehouse Address */}
        <div className="space-y-6">
          {/* Bank Account */}
          <div className="bg-[#0A0A0A] rounded-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center gap-2.5 pb-1">
              <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
                {isEn ? "Bank Payout Account" : "Rekening Bank Pencairan Dana"}
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
                    {isEn ? "Account Number *" : "Nomor Rekening *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={storeData.bankAccount}
                    onChange={(e) => setStoreData({ ...storeData, bankAccount: e.target.value })}
                    className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border-0 focus:ring-1 focus:ring-white/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
                    {isEn ? "Account Holder Name *" : "Nama Pemilik Rekening *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={storeData.accountHolder}
                    onChange={(e) => setStoreData({ ...storeData, accountHolder: e.target.value })}
                    className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-sans text-white outline-none border-0 focus:ring-1 focus:ring-white/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Warehouse Origin Shipping Address */}
          <div className="bg-[#0A0A0A] rounded-2xl p-6 sm:p-7 space-y-3">
            <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-1">
              {isEn ? "Warehouse Shipping Origin (Indonesia)" : "Alamat Asal Gudang Pengiriman (Indonesia)"}
            </label>
            <textarea
              rows={3}
              value={storeData.originAddress}
              onChange={(e) => setStoreData({ ...storeData, originAddress: e.target.value })}
              className="w-full bg-[#121212] rounded-xl p-4 text-xs font-sans text-white outline-none border-0 focus:ring-1 focus:ring-white/20 transition-all resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Card 3: Official Brand Suite (Acoustic Philosophy & Reseller Network) */}
      {storeData.storeType === "OFFICIAL_BRAND" && (
        <div className="bg-[#0A0A0A] rounded-2xl p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2.5">
              <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
                {isEn ? "Official Brand Suite: Acoustic Target & Reseller Licensing" : "Hub Brand Resmi: Target Kurva Suara & Jaringan Reseller"}
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono text-white bg-[#141414]">
              MOONDROP GLOBAL MASTER CATALOG
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Acoustic Philosophy & FR Target */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
                  {isEn ? "Brand Electroacoustic Philosophy" : "Filosofi Desain Akustik Brand"}
                </label>
                <textarea
                  rows={4}
                  value={storeData.brandAcousticPhilosophy}
                  onChange={(e) => setStoreData({ ...storeData, brandAcousticPhilosophy: e.target.value })}
                  className="w-full bg-[#121212] rounded-xl p-4 text-xs font-sans text-white outline-none border-0 focus:ring-1 focus:ring-white/20 transition-all resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
                  {isEn ? "Master Tuning Target Curve" : "Kurva Target Akustik Standar"}
                </label>
                <input
                  type="text"
                  value={storeData.tuningTargetCurve}
                  onChange={(e) => setStoreData({ ...storeData, tuningTargetCurve: e.target.value })}
                  className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-sans text-white outline-none border-0 focus:ring-1 focus:ring-white/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
                  {isEn ? "Interactive Squiglink Tool URL" : "URL Alat Squiglink Resmi"}
                </label>
                <input
                  type="text"
                  value={storeData.squiglinkUrl}
                  onChange={(e) => setStoreData({ ...storeData, squiglinkUrl: e.target.value })}
                  className="w-full bg-[#121212] rounded-xl px-4 py-3 text-xs font-mono text-white outline-none border-0 focus:ring-1 focus:ring-white/20 transition-all"
                />
              </div>
            </div>

            {/* Authorized Resellers */}
            <div className="space-y-3">
              <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider mb-2">
                {isEn ? "Authorized Retailers Network (Indonesia)" : "Jaringan Reseller & Distributor Resmi (Indonesia)"}
              </label>
              <div className="space-y-2.5">
                {storeData.authorizedResellers?.map((reseller, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#121212]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#181818] flex items-center justify-center text-[10px] font-mono font-bold text-white">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white">{reseller.name}</p>
                        <p className="text-[10px] font-mono text-[#71717A]">{reseller.city}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[#BFDD25] bg-[#141F17] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#BFDD25]" />
                      Authorized
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-mono text-[#71717A] mt-1.5">
                {isEn
                  ? "Authorized merchants are licensed to fulfill Moondrop regional warranty and genuine supply."
                  : "Merchant resmi memiliki izin mendistribusikan produk original dan garansi resmi Moondrop."}
              </p>
            </div>
          </div>
        </div>
      )}
        </form>
      )}

      {/* Tab 2: Chat Templates & Operating Hours */}
      {activeTab === "chat" && (
        <div className="space-y-6">
          {/* Header Info Banner */}
          <div className="p-6 rounded-2xl bg-[#0E0E0E] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#2e2e2e] text-white text-[11px] font-bold uppercase tracking-wider">
                  Pengaturan Chat & Operasional
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium ${
                    liveStatus?.isOpen
                      ? "bg-[#112416] text-[#4ADE80]"
                      : "bg-[#271414] text-[#F87171]"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      liveStatus?.isOpen ? "bg-[#4ADE80]" : "bg-[#F87171]"
                    }`}
                  />
                  {liveStatus?.isOpen ? "Toko Sedang Buka" : "Di Luar Jam Operasional"}
                </span>
              </div>
              <h2 className="text-base font-bold text-white font-heading">
                Template Pesan Cepat & Jam Kerja Toko
              </h2>
              <p className="text-xs text-[#8E8E93]">
                Kelola pesan instan untuk membalas pembeli lebih cepat dan jadwalkan jam kerja toko Anda.
              </p>
            </div>

            <Link
              href="/seller/chat"
              className="px-5 py-2.5 rounded-full bg-[#BFDD25] hover:bg-white text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Buka Chat Seller</span>
            </Link>
          </div>

          {chatSuccessMessage && (
            <div className="p-4 rounded-2xl bg-[#112416] text-[#4ADE80] text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{chatSuccessMessage}</span>
            </div>
          )}

          {/* Section 1: Template Pesan Cepat (Quick Replies) */}
          <div className="rounded-2xl bg-[#0E0E0E] p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block">
                Pesan Cepat (Quick Replies)
              </span>
              <h3 className="text-base font-semibold text-white font-heading mt-0.5">
                Kelola Template Jawaban Pesan
              </h3>
              <p className="text-xs text-[#8E8E93] mt-1">
                Template ini akan muncul sebagai tombol pintasan langsung di atas kotak chat saat Anda membalas calon pembeli di portal chat.
              </p>
            </div>

            {/* Form Tambah Template */}
            <form onSubmit={handleAddTemplate} className="p-5 rounded-2xl bg-[#141414] space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#BFDD25]" />
                <span>Buat Template Baru</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                    Judul Template *
                  </label>
                  <input
                    type="text"
                    value={newTplTitle}
                    onChange={(e) => setNewTplTitle(e.target.value)}
                    placeholder="Contoh: Stok Ready & Kirim Cepat"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1C1C] text-xs text-white placeholder:text-[#52525B] outline-none border-0 focus:ring-1 focus:ring-[#BFDD25]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                    Shortcut / Kode Cepat
                  </label>
                  <input
                    type="text"
                    value={newTplShortcut}
                    onChange={(e) => setNewTplShortcut(e.target.value)}
                    placeholder="Contoh: /ready"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1C1C] text-xs font-mono text-white placeholder:text-[#52525B] outline-none border-0 focus:ring-1 focus:ring-[#BFDD25]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                  Isi Pesan Balasan *
                </label>
                <textarea
                  rows={3}
                  value={newTplContent}
                  onChange={(e) => setNewTplContent(e.target.value)}
                  placeholder="Ketik kalimat balasan lengkap yang ramah dan informatif..."
                  className="w-full p-3.5 rounded-xl bg-[#1C1C1C] text-xs text-white placeholder:text-[#52525B] outline-none border-0 focus:ring-1 focus:ring-[#BFDD25] leading-relaxed"
                  required
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSavingChatSettings || !newTplTitle.trim() || !newTplContent.trim()}
                  className="px-6 py-2.5 rounded-full bg-[#BFDD25] hover:bg-white text-black text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer"
                >
                  {isSavingChatSettings ? "Menyimpan..." : "Tambah Template"}
                </button>
              </div>
            </form>

            {/* List Template Tersimpan */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider font-mono">
                Template Tersimpan ({chatSettings?.templates?.length || 0})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {chatSettings?.templates?.map((tpl: any) => (
                  <div
                    key={tpl.id}
                    className="p-4 rounded-xl bg-[#141414] flex flex-col justify-between gap-2.5 border border-[#1F1F1F]"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-white truncate">
                          {tpl.title}
                        </span>
                        {tpl.shortcut && (
                          <span className="px-2 py-0.5 rounded-md bg-[#1E1E1E] text-[10px] font-mono text-[#BFDD25] shrink-0">
                            {tpl.shortcut}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8E8E93] leading-relaxed line-clamp-3">
                        {tpl.content}
                      </p>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleDeleteTemplate(tpl.id)}
                        className="px-3 py-1 rounded-lg bg-[#1E1E1E] hover:bg-red-900/50 text-[#71717A] hover:text-red-400 text-[11px] font-mono transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Jam Operasional & Auto-Reply */}
          {chatSettings && (
            <form
              onSubmit={handleSaveChatSettings}
              className="rounded-2xl bg-[#0E0E0E] p-6 sm:p-8 space-y-6"
            >
              <div>
                <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block">
                  Jadwal Operasional Toko
                </span>
                <h3 className="text-base font-semibold text-white font-heading mt-0.5">
                  Jam Kerja & Balasan Otomatis
                </h3>
                <p className="text-xs text-[#8E8E93] mt-1">
                  Atur jam buka operasional toko Anda dan pesan balasan otomatis saat toko sedang tutup.
                </p>
              </div>

              {/* Operating Hours Table */}
              <div className="p-5 rounded-2xl bg-[#141414] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Status Jam Operasional Toko
                    </h4>
                    <p className="text-[11px] text-[#8E8E93] mt-0.5">
                      Bila dinonaktifkan, toko akan berstatus Buka 24 Jam.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chatSettings.operatingHours?.enabled}
                      onChange={(e) =>
                        setChatSettings({
                          ...chatSettings,
                          operatingHours: {
                            ...chatSettings.operatingHours,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#242424] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BFDD25]"></div>
                  </label>
                </div>

                {chatSettings.operatingHours?.enabled && (
                  <div className="space-y-2 pt-2 divide-y divide-[#1C1C1C]">
                    {chatSettings.operatingHours?.schedule?.map((sched: any, idx: number) => (
                      <div
                        key={sched.day}
                        className="pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-3 w-32">
                          <input
                            type="checkbox"
                            checked={sched.isOpen}
                            onChange={(e) => {
                              const copy = [...chatSettings.operatingHours.schedule];
                              copy[idx].isOpen = e.target.checked;
                              setChatSettings({
                                ...chatSettings,
                                operatingHours: {
                                  ...chatSettings.operatingHours,
                                  schedule: copy,
                                },
                              });
                            }}
                            className="rounded accent-[#BFDD25] cursor-pointer"
                          />
                          <span
                            className={`text-xs font-semibold ${
                              sched.isOpen ? "text-white" : "text-[#71717A]"
                            }`}
                          >
                            {sched.day}
                          </span>
                        </div>

                        {sched.isOpen ? (
                          <div className="flex items-center gap-2 text-xs font-mono text-white">
                            <input
                              type="time"
                              value={sched.openTime}
                              onChange={(e) => {
                                const copy = [...chatSettings.operatingHours.schedule];
                                copy[idx].openTime = e.target.value;
                                setChatSettings({
                                  ...chatSettings,
                                  operatingHours: {
                                    ...chatSettings.operatingHours,
                                    schedule: copy,
                                  },
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#1C1C1C] text-xs text-white border-0 outline-none"
                            />
                            <span className="text-[#71717A]">s/d</span>
                            <input
                              type="time"
                              value={sched.closeTime}
                              onChange={(e) => {
                                const copy = [...chatSettings.operatingHours.schedule];
                                copy[idx].closeTime = e.target.value;
                                setChatSettings({
                                  ...chatSettings,
                                  operatingHours: {
                                    ...chatSettings.operatingHours,
                                    schedule: copy,
                                  },
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#1C1C1C] text-xs text-white border-0 outline-none"
                            />
                            <span className="text-[10px] text-[#71717A]">WIB</span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#71717A] italic">Tutup / Libur</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Out-of-Hours Auto-Reply Configuration */}
              <div className="p-5 rounded-2xl bg-[#141414] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Balas Otomatis di Luar Jam Operasional
                    </h4>
                    <p className="text-[11px] text-[#8E8E93] mt-0.5">
                      Kirim pesan otomatis saat pembeli menghubungi toko ketika toko sedang tutup/libur.
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={chatSettings.autoReplyOutOfHours}
                      onChange={(e) =>
                        setChatSettings({
                          ...chatSettings,
                          autoReplyOutOfHours: e.target.checked,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#242424] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#BFDD25]"></div>
                  </label>
                </div>

                {chatSettings.autoReplyOutOfHours && (
                  <div>
                    <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1.5">
                      Pesan Otomatis di Luar Jam Operasional
                    </label>
                    <textarea
                      rows={3}
                      value={chatSettings.outOfHoursMessage}
                      onChange={(e) =>
                        setChatSettings({
                          ...chatSettings,
                          outOfHoursMessage: e.target.value,
                        })
                      }
                      className="w-full p-3.5 rounded-xl bg-[#1C1C1C] text-xs text-white placeholder:text-[#52525B] outline-none border-0 focus:ring-1 focus:ring-[#BFDD25] leading-relaxed"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingChatSettings}
                  className="px-8 py-3 rounded-full bg-[#BFDD25] hover:bg-white text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  {isSavingChatSettings ? "Menyimpan..." : "Simpan Jam Operasional"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
