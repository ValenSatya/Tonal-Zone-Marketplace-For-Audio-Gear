"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { updateUserProfile } from "@/app/actions/profile";

// Types for Addresses
interface AddressItem {
  id: string;
  label: string;
  receiver: string;
  phone: string;
  fullAddress: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "addresses" | "preferences" | "seller">("profile");
  const [isSellerMode, setIsSellerMode] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // 0. PROFIL AKUN
  const [name, setName] = useState("Alex Rivera");
  const [avatar, setAvatar] = useState("/placeholder.svg");
  const [gear, setGear] = useState("Dedicated DAC/AMP");
  const [roleBadge, setRoleBadge] = useState("BUYER");

  // 1. KEAMANAN & AKUN
  const [email, setEmail] = useState("alex.rivera@audiophile.io");
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 2. NOTIFIKASI
  const [notifOrder, setNotifOrder] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);
  const [notifSystem, setNotifSystem] = useState(true);

  // 3. ALAMAT TERSIMPAN
  const [addresses, setAddresses] = useState<AddressItem[]>([
    {
      id: "addr-1",
      label: "Rumah Utama",
      receiver: "Alex Rivera",
      phone: "+62 812-3456-7890",
      fullAddress: "Jl. Audiophile No. 99, Kebayoran Baru, Jakarta Selatan",
      city: "Jakarta Selatan",
      postalCode: "12110",
      isDefault: true,
    },
    {
      id: "addr-2",
      label: "Kantor Studio",
      receiver: "Alex Rivera (Studio)",
      phone: "+62 811-9876-5432",
      fullAddress: "Gedung Cyber Acoustics Lt. 12, Jl. Jend. Sudirman, Jakarta Pusat",
      city: "Jakarta Pusat",
      postalCode: "10220",
      isDefault: false,
    },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState("");
  const [newAddrReceiver, setNewAddrReceiver] = useState("");
  const [newAddrPhone, setNewAddrPhone] = useState("");
  const [newAddrFull, setNewAddrFull] = useState("");
  const [newAddrCity, setNewAddrCity] = useState("");
  const [newAddrPostal, setNewAddrPostal] = useState("");

  // 4. PREFERENSI REKOMENDASI DEFAULT
  const [experienceLevel, setExperienceLevel] = useState("Intermediate / Audiophile");
  const [soundSignature, setSoundSignature] = useState("Reference / Neutral");
  const [language, setLanguage] = useState("English");

  // 5. SETTINGS SELLER
  const [bankName, setBankName] = useState("BCA (Bank Central Asia)");
  const [accountNumber, setAccountNumber] = useState("8765432109");
  const [accountHolder, setAccountHolder] = useState("ALEX RIVERA");
  const [sellerNotifNewOrder, setSellerNotifNewOrder] = useState(true);
  const [sellerNotifShippingDeadline, setSellerNotifShippingDeadline] = useState(true);
  const [sellerNotifPayout, setSellerNotifPayout] = useState(true);

  const { t, setLanguage: setGlobalLanguage } = useLanguage();

  useEffect(() => {
    const stored = localStorage.getItem("tonalzone_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u.name) setName(u.name);
        if (u.email) setEmail(u.email);
        if (u.avatar) setAvatar(u.avatar);
        if (u.gear) setGear(u.gear);
        if (u.tuning) setSoundSignature(u.tuning);
        if (u.experience) setExperienceLevel(u.experience);
        if (u.language) setLanguage(u.language);
        if (u.isSeller || u.sellerStatus === "APPROVED" || u.role === "SELLER") {
          setIsSellerMode(true);
          setRoleBadge("SELLER");
          setActiveTab("seller");
        } else {
          setRoleBadge(u.role || "BUYER");
        }
      } catch (e) {}
    }
  }, []);

  const triggerSaveNotification = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(""), 3500);
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran foto maksimal 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setAvatar(base64);
        triggerSaveNotification("Foto profil dipilih. Klik Simpan Perubahan.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await updateUserProfile({
        email,
        name,
        avatar,
        gear,
        tuningPreference: soundSignature,
        location: "Indonesia",
        language,
      });

      const updatedUser = res.user || {
        name,
        email,
        avatar,
        gear,
        role: roleBadge,
        tuning: soundSignature,
        experience: experienceLevel,
        language,
      };

      localStorage.setItem("tonalzone_user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("userLoginChange"));
      triggerSaveNotification("Profil dan foto akun berhasil diperbarui & disinkronkan.");
    } catch {
      const stored = localStorage.getItem("tonalzone_user");
      let u = stored ? JSON.parse(stored) : {};
      u.name = name;
      u.avatar = avatar;
      u.gear = gear;
      localStorage.setItem("tonalzone_user", JSON.stringify(u));
      window.dispatchEvent(new Event("userLoginChange"));
      triggerSaveNotification("Profil akun berhasil diperbarui.");
    }
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      alert("Password baru dan konfirmasi tidak cocok.");
      return;
    }
    const stored = localStorage.getItem("tonalzone_user");
    let u = stored ? JSON.parse(stored) : {};
    u.email = email;
    localStorage.setItem("tonalzone_user", JSON.stringify(u));
    window.dispatchEvent(new Event("userLoginChange"));

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    triggerSaveNotification("Pengaturan keamanan berhasil diperbarui.");
  };

  const handleSaveNotif = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSaveNotification("Preferensi notifikasi berhasil disimpan.");
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = localStorage.getItem("tonalzone_user");
    let u = stored ? JSON.parse(stored) : {};
    u.tuning = soundSignature;
    u.experience = experienceLevel;
    u.language = language;
    localStorage.setItem("tonalzone_user", JSON.stringify(u));
    window.dispatchEvent(new Event("userLoginChange"));
    setGlobalLanguage(language);
    triggerSaveNotification("Preferensi rekomendasi berhasil disimpan.");
  };

  const handleSaveSeller = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSaveNotification("Informasi rekening dan notifikasi penjual berhasil disimpan.");
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
    triggerSaveNotification("Alamat utama berhasil diubah.");
  };

  const handleDeleteAddress = (id: string) => {
    if (addresses.length <= 1) {
      alert("Anda harus memiliki setidaknya satu alamat pengiriman.");
      return;
    }
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    triggerSaveNotification("Alamat berhasil dihapus.");
  };

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr: AddressItem = {
      id: "addr-" + Date.now(),
      label: newAddrLabel || "Alamat Baru",
      receiver: newAddrReceiver,
      phone: newAddrPhone,
      fullAddress: newAddrFull,
      city: newAddrCity,
      postalCode: newAddrPostal,
      isDefault: addresses.length === 0,
    };
    setAddresses((prev) => [newAddr, ...prev]);
    setShowAddModal(false);
    setNewAddrLabel("");
    setNewAddrReceiver("");
    setNewAddrPhone("");
    setNewAddrFull("");
    setNewAddrCity("");
    setNewAddrPostal("");
    triggerSaveNotification("Alamat baru berhasil ditambahkan.");
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#e5e5e5] font-sans flex flex-col relative">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        
        {/* Top Header - Standard Professional Layout */}
        <div className="mb-8 pb-6 border-b border-[#222]">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            {t("nav.settings")}
          </h1>
          <p className="text-sm text-[#888] mt-1">
            {t("settings.subtitle")}
          </p>
        </div>

        {/* Clean Monochrome Notification Toast */}
        <AnimatePresence>
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed bottom-8 right-8 z-50 bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2.5 text-xs font-medium"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              <span>{saveMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard 2-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Navigation - Clean Standard SaaS Links */}
          <div className="md:col-span-3 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#666] px-3 py-2">
              {t("common.account")}
            </p>

            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                activeTab === "profile"
                  ? "bg-[#1f1f1f] text-white font-semibold"
                  : "text-[#888] hover:text-white hover:bg-[#161616]"
              }`}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              <span>{t("settings.accountProfile")}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                activeTab === "security"
                  ? "bg-[#1f1f1f] text-white font-semibold"
                  : "text-[#888] hover:text-white hover:bg-[#161616]"
              }`}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              <span>{t("settings.securityEmail")}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                activeTab === "notifications"
                  ? "bg-[#1f1f1f] text-white font-semibold"
                  : "text-[#888] hover:text-white hover:bg-[#161616]"
              }`}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              <span>{t("settings.notifications")}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("addresses")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                activeTab === "addresses"
                  ? "bg-[#1f1f1f] text-white font-semibold"
                  : "text-[#888] hover:text-white hover:bg-[#161616]"
              }`}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span>{t("settings.savedAddresses")}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("preferences")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                activeTab === "preferences"
                  ? "bg-[#1f1f1f] text-white font-semibold"
                  : "text-[#888] hover:text-white hover:bg-[#161616]"
              }`}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
              <span>{t("settings.preferences")}</span>
            </button>

            {isSellerMode && (
              <>
                <div className="pt-4 mt-4 border-t border-[#222]" />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#666] px-3 py-2">
                  {t("common.seller")}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("seller");
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                    activeTab === "seller"
                      ? "bg-[#1f1f1f] text-white font-semibold"
                      : "text-[#888] hover:text-white hover:bg-[#161616]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                    <span>{t("settings.payoutAlerts")}</span>
                  </div>
                </button>
              </>
            )}
          </div>

          {/* Main Content Area - Clean SaaS Cards */}
          <div className="md:col-span-9 space-y-8">
            
            <AnimatePresence mode="wait">
              {/* TAB 0: ACCOUNT PROFILE */}
              {activeTab === "profile" && (
                <motion.div
                  key="tab-profile-clean"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="bg-[#0e0e0e] border border-[#222] rounded-xl p-6 sm:p-8 space-y-8"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-white">{t("settings.accountProfile")}</h2>
                    <p className="text-xs text-[#888] mt-0.5">
                      {t("settings.profileDesc")}
                    </p>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    {/* Role Status Display */}
                    <div className="bg-[#181818] border border-[#262626] rounded-lg p-5 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-[#888] block mb-1">{t("settings.accountType")}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white bg-[#222] border border-[#333] px-2 py-0.5 rounded">
                            {roleBadge}
                          </span>
                          <span className="text-xs text-[#aaa]">
                            {roleBadge === "SELLER" ? t("settings.sellerStatusActive") : t("settings.buyerStatusActive")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AVATAR PROFILE PICTURE SECTION */}
                    <div className="bg-[#181818] border border-[#262626] rounded-lg p-5 space-y-4">
                      <label className="block text-xs font-medium text-[#ccc]">
                        Foto Profil Akun
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        <div className="w-20 h-20 rounded-full bg-[#222] border-2 border-[#333] overflow-hidden shrink-0 flex items-center justify-center shadow-md relative group/av">
                          {avatar && avatar !== "/placeholder.svg" ? (
                            <img src={avatar} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-mono text-xl font-bold text-white/50">
                              {(name || "AR").substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 space-y-2 text-center sm:text-left">
                          <input
                            type="file"
                            ref={avatarInputRef}
                            onChange={handleAvatarFileUpload}
                            accept="image/png, image/jpeg, image/webp"
                            className="hidden"
                          />
                          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                            <button
                              type="button"
                              onClick={() => avatarInputRef.current?.click()}
                              className="px-4 py-2 bg-[#222] hover:bg-[#333] border border-[#333] text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                            >
                              Upload Foto Baru
                            </button>
                            {avatar !== "/placeholder.svg" && (
                              <button
                                type="button"
                                onClick={() => setAvatar("/placeholder.svg")}
                                className="px-3 py-2 bg-transparent hover:bg-red-500/10 text-red-400 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                              >
                                Hapus Foto
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-[#777] font-mono">
                            Mendukung format PNG, JPG, WEBP maks. 5MB. Otomatis sinkron di semua halaman.
                          </p>
                        </div>
                      </div>

                      {/* Quick Presets */}
                      <div className="pt-2 border-t border-[#262626]">
                        <span className="text-[10px] font-mono text-[#888] uppercase tracking-wider block mb-2">
                          Atau Pilih Preset Avatar Audiophile:
                        </span>
                        <div className="flex gap-2">
                          {[
                            { name: "Studio", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80" },
                            { name: "Acoustic", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80" },
                            { name: "Vinyl", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80" },
                            { name: "Minimal", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80" },
                          ].map((p) => (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() => {
                                setAvatar(p.url);
                                triggerSaveNotification(`Preset ${p.name} dipilih.`);
                              }}
                              className={`w-9 h-9 rounded-full overflow-hidden border transition-all cursor-pointer ${
                                avatar === p.url ? "border-[#D4FF00] scale-105" : "border-[#333] hover:border-white"
                              }`}
                              title={p.name}
                            >
                              <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-[#ccc] mb-1.5">
                          {t("settings.displayName")}
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full bg-[#181818] border border-[#262626] focus:border-white text-white px-3.5 py-2.5 rounded-lg text-xs outline-none transition-colors"
                          placeholder="e.g. Alex Rivera"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#ccc] mb-1.5">
                          {t("settings.primaryGear")}
                        </label>
                        <input
                          type="text"
                          value={gear}
                          onChange={(e) => setGear(e.target.value)}
                          required
                          className="w-full bg-[#181818] border border-[#262626] focus:border-white text-white px-3.5 py-2.5 rounded-lg text-xs outline-none transition-colors"
                          placeholder="e.g. Dedicated DAC/AMP or Portable Dongle"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#222] flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-white text-black font-medium text-xs rounded-lg hover:bg-[#e0e0e0] transition-colors cursor-pointer"
                      >
                        {t("settings.save")}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* TAB 1: SECURITY & ACCOUNT */}
              {activeTab === "security" && (
                <motion.div
                  key="tab-security-clean"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="bg-[#0e0e0e] border border-[#222] rounded-xl p-6 sm:p-8 space-y-8"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-white">{t("settings.securityEmail")}</h2>
                    <p className="text-xs text-[#888] mt-0.5">
                      {t("settings.securityDesc")}
                    </p>
                  </div>

                  {/* Email Section */}
                  <div className="bg-[#181818] border border-[#262626] rounded-lg p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-xs text-[#888] block mb-1">{t("settings.email")}</span>
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-medium text-white">{email}</span>
                          <span className="inline-flex items-center gap-1.5 text-[11px] bg-[#161616] text-[#D4D4D8] border border-[#27272A] px-2 py-0.5 rounded font-medium">
                            <span className={`w-1.5 h-1.5 rounded-full ${isEmailVerified ? "bg-emerald-400" : "bg-amber-400"}`} />
                            {isEmailVerified ? "Verified" : "Pending Verification"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const newE = prompt("Enter new email address:", email);
                          if (newE && newE !== email) {
                            setEmail(newE);
                            setIsEmailVerified(false);
                            alert("Verification link sent to " + newE + ". Please check your inbox.");
                          }
                        }}
                        className="px-4 py-2 bg-[#222] hover:bg-[#2c2c2c] border border-[#333] rounded-lg text-xs font-medium text-white transition-colors self-start sm:self-auto cursor-pointer"
                      >
                        Change Email Address
                      </button>
                    </div>
                  </div>

                  {/* Password Section */}
                  <form onSubmit={handleSaveSecurity} className="space-y-5 pt-4 border-t border-[#222]">
                    <h3 className="text-sm font-semibold text-white">{t("settings.changePassword")}</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs text-[#888]">{t("settings.currentPassword")}</label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-[#181818] border border-[#262626] focus:border-white rounded-lg px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs text-[#888]">{t("settings.newPassword")}</label>
                        <input
                          type="password"
                          required
                          placeholder="Min. 8 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-[#181818] border border-[#262626] focus:border-white rounded-lg px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs text-[#888]">{t("settings.confirmPassword")}</label>
                        <input
                          type="password"
                          required
                          placeholder="Repeat new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-[#181818] border border-[#262626] focus:border-white rounded-lg px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-white hover:bg-[#e0e0e0] text-black font-medium text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        {t("settings.save")}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* TAB 2: NOTIFICATIONS */}
              {activeTab === "notifications" && (
                <motion.div
                  key="tab-notif-clean"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="bg-[#0e0e0e] border border-[#222] rounded-xl p-6 sm:p-8 space-y-6"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-white">{t("settings.notifications")}</h2>
                    <p className="text-xs text-[#888] mt-0.5">
                      {t("settings.notifDesc")}
                    </p>
                  </div>

                  <form onSubmit={handleSaveNotif} className="space-y-3">
                    
                    {/* Item 1: Order Status */}
                    <div className="flex items-center justify-between p-4 bg-[#181818] border border-[#262626] rounded-lg">
                      <div className="space-y-0.5 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{t("settings.notifOrder")}</span>
                          <span className="text-[10px] bg-[#222] text-[#aaa] border border-[#333] px-2 py-0.5 rounded font-medium">Required</span>
                        </div>
                        <p className="text-xs text-[#888]">
                          {t("settings.notifOrderDesc")}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifOrder}
                        onChange={(e) => setNotifOrder(e.target.checked)}
                        className="w-4 h-4 rounded bg-[#222] border-[#444] text-white focus:ring-0 cursor-pointer accent-white"
                      />
                    </div>

                    {/* Item 2: Promo */}
                    <div className="flex items-center justify-between p-4 bg-[#181818] border border-[#262626] rounded-lg">
                      <div className="space-y-0.5 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{t("settings.notifPromo")}</span>
                          <span className="text-[10px] bg-[#222] text-[#888] px-2 py-0.5 rounded font-medium">{t("common.optional")}</span>
                        </div>
                        <p className="text-xs text-[#888]">
                          {t("settings.notifPromoDesc")}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifPromo}
                        onChange={(e) => setNotifPromo(e.target.checked)}
                        className="w-4 h-4 rounded bg-[#222] border-[#444] text-white focus:ring-0 cursor-pointer accent-white"
                      />
                    </div>

                    {/* Item 3: System Approval */}
                    <div className="flex items-center justify-between p-4 bg-[#181818] border border-[#262626] rounded-lg">
                      <div className="space-y-0.5 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{t("settings.notifSystem")}</span>
                          <span className="text-[10px] bg-[#222] text-[#aaa] border border-[#333] px-2 py-0.5 rounded font-medium">Important</span>
                        </div>
                        <p className="text-xs text-[#888]">
                          {t("settings.notifSystemDesc")}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifSystem}
                        onChange={(e) => setNotifSystem(e.target.checked)}
                        className="w-4 h-4 rounded bg-[#222] border-[#444] text-white focus:ring-0 cursor-pointer accent-white"
                      />
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-white hover:bg-[#e0e0e0] text-black font-medium text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        {t("settings.save")}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* TAB 3: SAVED ADDRESSES */}
              {activeTab === "addresses" && (
                <motion.div
                  key="tab-addr-clean"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="bg-[#0e0e0e] border border-[#222] rounded-xl p-6 sm:p-8 space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-white">{t("settings.savedAddresses")}</h2>
                      <p className="text-xs text-[#888] mt-0.5">
                        {t("settings.addressesDesc")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddModal(true)}
                      className="px-4 py-2 bg-white hover:bg-[#e0e0e0] text-black font-medium text-xs rounded-lg transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14"/></svg>
                      <span>{t("settings.addNewAddress")}</span>
                    </button>
                  </div>

                  {/* Addresses List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-5 rounded-lg border transition-colors flex flex-col justify-between ${
                          addr.isDefault
                            ? "bg-[#181818] border-white/40"
                            : "bg-[#161616] border-[#262626]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-white bg-[#222] px-2.5 py-1 rounded border border-[#333]">
                                {addr.label}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[11px] bg-white text-black font-medium px-2 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-sm font-semibold text-white mb-0.5">{addr.receiver}</p>
                          <p className="text-xs text-[#888] mb-2">{addr.phone}</p>
                          <p className="text-xs text-[#aaa] leading-relaxed mb-4">
                            {addr.fullAddress}
                            <br />
                            <strong className="text-white">{addr.city}</strong> — {addr.postalCode}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-[#262626] flex items-center justify-between gap-2 text-xs">
                          {!addr.isDefault ? (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-white hover:underline font-medium cursor-pointer"
                            >
                              {t("settings.setDefault")}
                            </button>
                          ) : (
                            <span className="text-emerald-400 text-[11px]">{t("settings.selectedCheckout")}</span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-red-400 hover:text-red-300 transition-colors cursor-pointer font-medium"
                          >
                            {t("settings.remove")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 4: PREFERENCES */}
              {activeTab === "preferences" && (
                <motion.div
                  key="tab-pref-clean"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="bg-[#0e0e0e] border border-[#222] rounded-xl p-6 sm:p-8 space-y-8"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-white">{t("settings.audioDefaults")}</h2>
                      <span className="text-[10px] bg-[#222] text-[#888] px-2 py-0.5 rounded font-medium">Optional</span>
                    </div>
                    <p className="text-xs text-[#888] mt-0.5">
                      {t("settings.audioDefaultsDesc")}
                    </p>
                  </div>

                  <form onSubmit={handleSavePreferences} className="space-y-6">
                    
                    {/* Experience Level */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-semibold text-white uppercase tracking-wider">
                        {t("settings.experienceLevel")}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { name: "Beginner / Enthusiast", title: t("settings.expBeginner"), desc: t("settings.expBeginnerDesc") },
                          { name: "Intermediate / Audiophile", title: t("settings.expIntermediate"), desc: t("settings.expIntermediateDesc") },
                          { name: "Pro Studio / Engineer", title: t("settings.expPro"), desc: t("settings.expProDesc") },
                        ].map((lvl) => {
                          const isSel = experienceLevel === lvl.name;
                          return (
                            <button
                              key={lvl.name}
                              type="button"
                              onClick={() => setExperienceLevel(lvl.name)}
                              className={`p-4 rounded-lg border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                                isSel
                                  ? "bg-[#222] border-white text-white"
                                  : "bg-[#181818] border-[#262626] text-[#888] hover:border-[#444]"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1 w-full">
                                <span className={`text-xs font-semibold ${isSel ? "text-white" : "text-[#ccc]"}`}>
                                  {lvl.title}
                                </span>
                                {isSel && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                                )}
                              </div>
                              <span className="text-xs text-[#888] mt-1">{lvl.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sound Signature */}
                    <div className="space-y-2.5 pt-2">
                      <label className="block text-xs font-semibold text-white uppercase tracking-wider">
                        {t("settings.soundSignature")}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { name: "Reference / Neutral", title: t("settings.sigReference"), desc: t("settings.sigReferenceDesc") },
                          { name: "Basshead (V-Shape)", title: t("settings.sigBasshead"), desc: t("settings.sigBassheadDesc") },
                          { name: "Vocal & Mid Focus", title: t("settings.sigVocal"), desc: t("settings.sigVocalDesc") },
                          { name: "Treble & Soundstage", title: t("settings.sigTreble"), desc: t("settings.sigTrebleDesc") },
                        ].map((sig) => {
                          const isSel = soundSignature === sig.name;
                          return (
                            <button
                              key={sig.name}
                              type="button"
                              onClick={() => setSoundSignature(sig.name)}
                              className={`p-4 rounded-lg border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                                isSel
                                  ? "bg-[#222] border-white text-white"
                                  : "bg-[#181818] border-[#262626] text-[#888] hover:border-[#444]"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1 w-full">
                                <span className={`text-xs font-semibold ${isSel ? "text-white" : "text-[#ccc]"}`}>
                                  {sig.title}
                                </span>
                                {isSel && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                                )}
                              </div>
                              <span className="text-xs text-[#888] mt-1">{sig.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Language Setting */}
                    <div className="space-y-2.5 pt-2">
                      <label className="block text-xs font-semibold text-white uppercase tracking-wider">
                        {t("settings.language")}
                      </label>
                      <p className="text-xs text-[#888] -mt-1">
                        {t("settings.languageDesc")}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { code: "English", native: "English", flag: "US" },
                          { code: "Bahasa Indonesia", native: "Bahasa Indonesia", flag: "ID" },
                        ].map((lang) => {
                          const isSel = language === lang.code;
                          return (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => {
                                setLanguage(lang.code);
                                setGlobalLanguage(lang.code);
                              }}
                              className={`p-4 rounded-lg border text-left transition-colors cursor-pointer flex items-center gap-3 ${
                                isSel
                                  ? "bg-[#222] border-white text-white"
                                  : "bg-[#181818] border-[#262626] text-[#888] hover:border-[#444]"
                              }`}
                            >
                              <span className="text-xl leading-none">{lang.flag}</span>
                              <div className="flex flex-col">
                                <span className={`text-xs font-semibold ${isSel ? "text-white" : "text-[#ccc]"}`}>
                                  {lang.code}
                                </span>
                                <span className="text-[11px] text-[#888]">{lang.native}</span>
                              </div>
                              {isSel && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white ml-auto shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-[#222]">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-white hover:bg-[#e0e0e0] text-black font-medium text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        {t("settings.savePreferences")}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* TAB 5: SELLER SETTINGS */}
              {activeTab === "seller" && (
                <motion.div
                  key="tab-seller-clean"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="bg-[#0e0e0e] border border-[#222] rounded-xl p-6 sm:p-8 space-y-8"
                >
                  <div className="flex items-center justify-between border-b border-[#222] pb-5">
                    <div>
                      <h2 className="text-lg font-semibold text-white">{t("settings.sellerSettings")}</h2>
                      <p className="text-xs text-[#888] mt-0.5">
                        {t("settings.sellerSettingsDesc")}
                      </p>
                    </div>
                    <span className="text-[11px] bg-[#222] text-white border border-[#333] px-2.5 py-1 rounded font-medium">
                      {t("settings.sellerModeActive")}
                    </span>
                  </div>

                  <form onSubmit={handleSaveSeller} className="space-y-8">
                    
                    {/* Bank Info Section */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-white">{t("settings.bankPayoutInfo")}</h3>
                        <p className="text-xs text-[#888] mt-0.5">
                          {t("settings.bankPayoutDesc")}
                        </p>
                      </div>

                      <div className="p-4 bg-[#181818] border border-[#2a2a2a] rounded-lg text-xs text-[#aaa] leading-relaxed">
                        <strong className="text-white">{t("settings.mvpNote")}</strong> {t("settings.mvpNoteDesc")}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className="space-y-1.5">
                          <label className="block text-xs text-[#888]">{t("settings.bankName")}</label>
                          <select
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full bg-[#181818] border border-[#262626] focus:border-white rounded-lg px-3.5 py-2.5 text-sm text-white outline-none cursor-pointer"
                          >
                            <option value="BCA (Bank Central Asia)">BCA (Bank Central Asia)</option>
                            <option value="Mandiri (Bank Mandiri)">Mandiri (Bank Mandiri)</option>
                            <option value="BNI (Bank Negara Indonesia)">BNI (Bank Negara Indonesia)</option>
                            <option value="BRI (Bank Rakyat Indonesia)">BRI (Bank Rakyat Indonesia)</option>
                            <option value="BSI (Bank Syariah Indonesia)">BSI (Bank Syariah Indonesia)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs text-[#888]">{t("settings.accountNumber")}</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 8765432109"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className="w-full bg-[#181818] border border-[#262626] focus:border-white rounded-lg px-3.5 py-2.5 text-sm text-white outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs text-[#888]">{t("settings.accountHolder")}</label>
                          <input
                            type="text"
                            required
                            placeholder="Exact name on account"
                            value={accountHolder}
                            onChange={(e) => setAccountHolder(e.target.value)}
                            className="w-full bg-[#181818] border border-[#262626] focus:border-white rounded-lg px-3.5 py-2.5 text-sm text-white uppercase outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Urgent Seller Notifs Section */}
                    <div className="space-y-4 pt-6 border-t border-[#222]">
                      <div>
                        <h3 className="text-sm font-semibold text-white">{t("settings.urgentAlerts")}</h3>
                        <p className="text-xs text-[#888] mt-0.5">
                          {t("settings.urgentAlertsDesc")}
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between p-4 bg-[#181818] border border-[#262626] rounded-lg">
                          <div className="pr-4">
                            <span className="text-sm font-medium text-white block">{t("New Order Notifications")}</span>
                            <span className="text-xs text-[#888]">Immediate alert when a buyer completes payment for your item.</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={sellerNotifNewOrder}
                            onChange={(e) => setSellerNotifNewOrder(e.target.checked)}
                            className="w-4 h-4 rounded bg-[#222] border-[#444] text-white focus:ring-0 cursor-pointer accent-white"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-[#181818] border border-[#262626] rounded-lg">
                          <div className="pr-4">
                            <span className="text-sm font-medium text-white block">{t("Shipping SLA Deadline Warnings")}</span>
                            <span className="text-xs text-[#888]">Alert 6 hours before the required tracking number input deadline.</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={sellerNotifShippingDeadline}
                            onChange={(e) => setSellerNotifShippingDeadline(e.target.checked)}
                            className="w-4 h-4 rounded bg-[#222] border-[#444] text-white focus:ring-0 cursor-pointer accent-white"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-[#181818] border border-[#262626] rounded-lg">
                          <div className="pr-4">
                            <span className="text-sm font-medium text-white block">{t("Payout Disbursement Confirmation")}</span>
                            <span className="text-xs text-[#888]">Email notification when admin transfers funds to your bank account.</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={sellerNotifPayout}
                            onChange={(e) => setSellerNotifPayout(e.target.checked)}
                            className="w-4 h-4 rounded bg-[#222] border-[#444] text-white focus:ring-0 cursor-pointer accent-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-[#222]">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-white hover:bg-[#e0e0e0] text-black font-medium text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        {t("settings.save")}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* SECTION: DEFERRED FEATURES INFO BOX - Clean Neutral Style */}
            <div className="bg-[#141414] border border-[#222] rounded-xl p-6 text-xs text-[#888] space-y-3">
              <h4 className="font-semibold text-white text-sm">Security &amp; Post-MVP Roadmap Notes</h4>
              <ul className="space-y-2 list-disc list-inside leading-relaxed text-[#aaa]">
                <li>
                  <strong className="text-white">Payment Methods (Credit/Debit Cards):</strong> We do not store credit card details on Tonalzone servers to ensure full PCI-DSS compliance. Transactions are processed securely via <strong>Midtrans Payment Gateway</strong>.
                </li>
                <li>
                  <strong className="text-white">Two-Factor Authentication (2FA):</strong> Multi-factor authentication via OTP or authenticator apps is scheduled for post-MVP releases.
                </li>
                <li>
                  <strong className="text-white">Account Deletion &amp; Data Export (GDPR):</strong> During the MVP launch, account deletion requests and personal transaction history exports are handled manually by contacting our <Link href="/support" className="text-white underline font-medium">Support team</Link>.
                </li>
              </ul>
            </div>

          </div>
        </div>
      </main>

      {/* MODAL: ADD NEW ADDRESS - Clean Minimal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-lg bg-[#141414] border border-[#262626] rounded-xl p-6 sm:p-8 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#222] mb-6">
                <h3 className="text-lg font-semibold text-white">
                  Add Shipping Address
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-[#888] hover:text-white text-base cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>

              <form onSubmit={handleAddNewAddress} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs text-[#888]">Address Label</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Home, Office, Studio"
                      value={newAddrLabel}
                      onChange={(e) => setNewAddrLabel(e.target.value)}
                      className="w-full bg-[#181818] border border-[#262626] focus:border-white rounded-lg px-3.5 py-2.5 text-sm text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs text-[#888]">Receiver Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={newAddrReceiver}
                      onChange={(e) => setNewAddrReceiver(e.target.value)}
                      className="w-full bg-[#181818] border border-[#262626] focus:border-white rounded-lg px-3.5 py-2.5 text-sm text-white outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs text-[#888]">Phone Number / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    placeholder="+62 812-3456-7890"
                    value={newAddrPhone}
                    onChange={(e) => setNewAddrPhone(e.target.value)}
                    className="w-full bg-[#181818] border border-[#262626] focus:border-white rounded-lg px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs text-[#888]">Full Street Address</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Jl. Audiophile No. 99, Kebayoran Baru"
                    value={newAddrFull}
                    onChange={(e) => setNewAddrFull(e.target.value)}
                    className="w-full bg-[#181818] border border-[#262626] focus:border-white rounded-lg px-3.5 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs text-[#888]">City</label>
                    <input
                      type="text"
                      required
                      placeholder="Jakarta Selatan"
                      value={newAddrCity}
                      onChange={(e) => setNewAddrCity(e.target.value)}
                      className="w-full bg-[#181818] border border-[#262626] focus:border-white rounded-lg px-3.5 py-2.5 text-sm text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs text-[#888]">Postal Code</label>
                    <input
                      type="text"
                      required
                      placeholder="12110"
                      value={newAddrPostal}
                      onChange={(e) => setNewAddrPostal(e.target.value)}
                      className="w-full bg-[#181818] border border-[#262626] focus:border-white rounded-lg px-3.5 py-2.5 text-sm text-white outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#222] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 bg-[#181818] hover:bg-[#222] border border-[#333] rounded-lg text-xs font-medium text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-white hover:bg-[#e0e0e0] text-black font-medium text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
