"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { updateUserProfile } from "@/app/actions/profile";

// Types
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

type SubPageType = 
  | null 
  | "profile" 
  | "security" 
  | "addresses" 
  | "audio_preferences" 
  | "seller_payout" 
  | "language_currency"
  | "about";

export default function SettingsPage() {
  const { t, language: globalLanguage, setLanguage: setGlobalLanguage } = useLanguage();
  const [currency, setCurrency] = useState<"IDR" | "USD">("IDR");

  // Active sub-page in mobile OS settings flow
  const [activeSubPage, setActiveSubPage] = useState<SubPageType>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // 0. User Profile State
  const [name, setName] = useState("Alex Rivera");
  const [email, setEmail] = useState("alex.rivera@audiophile.io");
  const [avatar, setAvatar] = useState("/placeholder.svg");
  const [gear, setGear] = useState("Dedicated DAC/AMP");
  const [roleBadge, setRoleBadge] = useState("BUYER");
  const [isSellerMode, setIsSellerMode] = useState(false);

  // 1. Security State
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 2. Notification Switch Toggles
  const [notifOrder, setNotifOrder] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);
  const [notifSystem, setNotifSystem] = useState(true);

  // 3. Saved Addresses
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
  const [showAddAddrModal, setShowAddAddrModal] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState("");
  const [newAddrReceiver, setNewAddrReceiver] = useState("");
  const [newAddrPhone, setNewAddrPhone] = useState("");
  const [newAddrFull, setNewAddrFull] = useState("");
  const [newAddrCity, setNewAddrCity] = useState("");
  const [newAddrPostal, setNewAddrPostal] = useState("");

  // 4. Audio Preferences
  const [experienceLevel, setExperienceLevel] = useState("Intermediate / Audiophile");
  const [soundSignature, setSoundSignature] = useState("Reference / Neutral");

  // 5. Seller Payout
  const [bankName, setBankName] = useState("BCA (Bank Central Asia)");
  const [accountNumber, setAccountNumber] = useState("8765432109");
  const [accountHolder, setAccountHolder] = useState("ALEX RIVERA");

  // Load from local storage
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
        if (u.isSeller || u.sellerStatus === "APPROVED" || u.role === "SELLER") {
          setIsSellerMode(true);
          setRoleBadge("SELLER");
        } else if (u.role === "ADMIN" || u.email?.includes("valenandra")) {
          setRoleBadge("ADMIN");
        } else {
          setRoleBadge(u.role || "BUYER");
        }
      } catch (e) {}
    }
  }, []);

  const triggerToast = (msg: string) => {
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
        triggerToast("Foto profil dipilih. Klik Simpan.");
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
        language: globalLanguage,
      });

      const updatedUser = res.user || {
        name,
        email,
        avatar,
        gear,
        role: roleBadge,
        tuning: soundSignature,
        experience: experienceLevel,
        language: globalLanguage,
      };

      localStorage.setItem("tonalzone_user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("userLoginChange"));
      triggerToast("Profil akun berhasil diperbarui!");
      setActiveSubPage(null);
    } catch {
      const stored = localStorage.getItem("tonalzone_user");
      let u = stored ? JSON.parse(stored) : {};
      u.name = name;
      u.avatar = avatar;
      u.gear = gear;
      localStorage.setItem("tonalzone_user", JSON.stringify(u));
      window.dispatchEvent(new Event("userLoginChange"));
      triggerToast("Profil akun berhasil diperbarui.");
      setActiveSubPage(null);
    }
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      alert("Password baru dan konfirmasi password tidak cocok.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    triggerToast("Pengaturan keamanan berhasil disimpan.");
    setActiveSubPage(null);
  };

  const handleSaveAudioPreferences = (e: React.FormEvent) => {
    e.preventDefault();
    const stored = localStorage.getItem("tonalzone_user");
    let u = stored ? JSON.parse(stored) : {};
    u.tuning = soundSignature;
    u.experience = experienceLevel;
    localStorage.setItem("tonalzone_user", JSON.stringify(u));
    window.dispatchEvent(new Event("userLoginChange"));
    triggerToast("Preferensi sound signature disimpan.");
    setActiveSubPage(null);
  };

  const handleSaveSellerPayout = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast("Rekening pencairan saldo seller berhasil disimpan.");
    setActiveSubPage(null);
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
    setNewAddrLabel("");
    setNewAddrReceiver("");
    setNewAddrPhone("");
    setNewAddrFull("");
    setNewAddrCity("");
    setNewAddrPostal("");
    setShowAddAddrModal(false);
    triggerToast("Alamat baru berhasil ditambahkan.");
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
    triggerToast("Alamat utama berhasil diubah.");
  };

  const handleDeleteAddress = (id: string) => {
    if (addresses.length <= 1) {
      alert("Minimal harus ada satu alamat tersimpan.");
      return;
    }
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    triggerToast("Alamat berhasil dihapus.");
  };

  const handleConfirmLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem("tonalzone_user");
      window.dispatchEvent(new Event("userLoginChange"));
      window.location.href = "/";
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#e4e4e7] font-sans flex flex-col selection:bg-[#D4FF00] selection:text-black">
      <Navbar />

      <main className="max-w-[620px] mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full flex-1">
        
        {/* Floating Notification Toast */}
        <AnimatePresence>
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#18181b]/95 backdrop-blur-xl border border-[#27272a] text-white px-5 py-2.5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-2.5 text-xs font-mono font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-[#D4FF00] animate-pulse" />
              <span>{saveMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* ========================================================
              VIEW 1: MAIN SETTINGS MENU (MOBILE OS STYLE)
             ======================================================== */}
          {activeSubPage === null && (
            <motion.div
              key="main-settings-root"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 pb-12"
            >
              {/* Top Title */}
              <div className="px-1 pt-2">
                <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
                  Pengaturan
                </h1>
                <p className="text-xs text-zinc-500 mt-1 font-mono">
                  Kelola preferensi akun, audio tuning, dan sistem perangkat
                </p>
              </div>

              {/* 1. TOP PROFILE CARD (Apple ID / Account Card Style) */}
              <div
                onClick={() => setActiveSubPage("profile")}
                role="button"
                tabIndex={0}
                className="bg-[#121215] hover:bg-[#16161a] active:scale-[0.99] border border-[#222226] rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all duration-200 cursor-pointer shadow-sm group"
              >
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#D4FF00]/40 p-0.5 bg-[#18181b] shrink-0">
                  {avatar && avatar !== "/placeholder.svg" ? (
                    <img src={avatar} alt={name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full bg-[#222] rounded-full flex items-center justify-center font-mono font-bold text-white text-base">
                      {(name || "AR").substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-sans font-bold text-white truncate group-hover:text-[#D4FF00] transition-colors">
                      {name}
                    </h2>
                    <span className={`text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      roleBadge === "ADMIN"
                        ? "bg-[#D4FF00]/10 text-[#D4FF00] border-[#D4FF00]/30"
                        : roleBadge === "SELLER"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-zinc-800 text-zinc-300 border-zinc-700"
                    }`}>
                      {roleBadge === "ADMIN" ? "SUPER ADMIN" : roleBadge === "SELLER" ? "SELLER" : "BUYER"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono truncate mt-0.5">{email}</p>
                  <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1.5">
                    <span>🎧 {gear}</span>
                  </p>
                </div>

                <span className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all text-lg font-mono">
                  ›
                </span>
              </div>

              {/* 2. GROUP: AKUN & KEAMANAN */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-zinc-500 px-3">
                  AKUN & KEAMANAN
                </span>
                
                <div className="bg-[#121215] border border-[#222226] rounded-2xl overflow-hidden divide-y divide-[#1e1e24]">
                  {/* Security Cell */}
                  <button
                    type="button"
                    onClick={() => setActiveSubPage("security")}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-sm">
                        🛡️
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white block">Kata Sandi & Email</span>
                        <span className="text-[11px] text-zinc-500 font-mono">Verifikasi email & keamanan sandi</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-zinc-400">
                        {isEmailVerified ? "Terverifikasi" : "Belum Verif"}
                      </span>
                      <span className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all text-base font-mono">›</span>
                    </div>
                  </button>

                  {/* Saved Addresses Cell */}
                  <button
                    type="button"
                    onClick={() => setActiveSubPage("addresses")}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm">
                        📍
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white block">Alamat Pengiriman</span>
                        <span className="text-[11px] text-zinc-500 font-mono">Pengiriman kurir & lokasi default</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-zinc-400">{addresses.length} Tersimpan</span>
                      <span className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all text-base font-mono">›</span>
                    </div>
                  </button>

                  {/* Seller Payout Cell */}
                  {isSellerMode && (
                    <button
                      type="button"
                      onClick={() => setActiveSubPage("seller_payout")}
                      className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm">
                          💳
                        </div>
                        <div>
                          <span className="text-sm font-medium text-white block">Rekening Penarikan Dana</span>
                          <span className="text-[11px] text-zinc-500 font-mono">Rekening bank escrow toko seller</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-amber-400 font-bold">{bankName.split(" ")[0]}</span>
                        <span className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all text-base font-mono">›</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* 3. GROUP: PREFERENSI AUDIO */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-zinc-500 px-3">
                  PENGALAMAN AUDIOPHILE
                </span>
                
                <div className="bg-[#121215] border border-[#222226] rounded-2xl overflow-hidden divide-y divide-[#1e1e24]">
                  {/* Sound Signature & Gear Cell */}
                  <button
                    type="button"
                    onClick={() => setActiveSubPage("audio_preferences")}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 text-sm">
                        📈
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white block">Sound Signature & Tuning</span>
                        <span className="text-[11px] text-zinc-500 font-mono">Rekomendasi kurva Squiglink</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#D4FF00] max-w-[120px] truncate">{soundSignature}</span>
                      <span className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all text-base font-mono">›</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 4. GROUP: NOTIFIKASI */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-zinc-500 px-3">
                  NOTIFIKASI & PEMBERITAHUAN
                </span>
                
                <div className="bg-[#121215] border border-[#222226] rounded-2xl overflow-hidden divide-y divide-[#1e1e24]">
                  {/* Order Notification Switch */}
                  <div className="px-4 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm">
                        📦
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white block">Status Pesanan</span>
                        <span className="text-[11px] text-zinc-500 font-mono">Update resi & pengiriman escrow</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNotifOrder(!notifOrder);
                        triggerToast(!notifOrder ? "Notifikasi pesanan diaktifkan" : "Notifikasi pesanan dinonaktifkan");
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        notifOrder ? "bg-[#D4FF00]" : "bg-zinc-800"
                      }`}
                    >
                      <motion.div
                        animate={{ x: notifOrder ? 22 : 3 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`w-4 h-4 rounded-full top-1 absolute shadow-sm ${
                          notifOrder ? "bg-black" : "bg-zinc-400"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Promo Notification Switch */}
                  <div className="px-4 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm">
                        📢
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white block">Diskon & Promo Audiophile</span>
                        <span className="text-[11px] text-zinc-500 font-mono">Flash deals kabel & IEM flagship</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNotifPromo(!notifPromo);
                        triggerToast(!notifPromo ? "Promo diaktifkan" : "Promo dinonaktifkan");
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        notifPromo ? "bg-[#D4FF00]" : "bg-zinc-800"
                      }`}
                    >
                      <motion.div
                        animate={{ x: notifPromo ? 22 : 3 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`w-4 h-4 rounded-full top-1 absolute shadow-sm ${
                          notifPromo ? "bg-black" : "bg-zinc-400"
                        }`}
                      />
                    </button>
                  </div>

                  {/* System Security Switch */}
                  <div className="px-4 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm">
                        🔔
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white block">Keamanan & Sistem</span>
                        <span className="text-[11px] text-zinc-500 font-mono">Pemberitahuan login & password</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNotifSystem(!notifSystem);
                        triggerToast(!notifSystem ? "Notifikasi sistem aktif" : "Notifikasi sistem nonaktif");
                      }}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        notifSystem ? "bg-[#D4FF00]" : "bg-zinc-800"
                      }`}
                    >
                      <motion.div
                        animate={{ x: notifSystem ? 22 : 3 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`w-4 h-4 rounded-full top-1 absolute shadow-sm ${
                          notifSystem ? "bg-black" : "bg-zinc-400"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* 5. GROUP: PREFERENSI SISTEM */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-zinc-500 px-3">
                  SISTEM & TAMPILAN
                </span>
                
                <div className="bg-[#121215] border border-[#222226] rounded-2xl overflow-hidden divide-y divide-[#1e1e24]">
                  {/* Language & Currency */}
                  <button
                    type="button"
                    onClick={() => setActiveSubPage("language_currency")}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-sm">
                        🌐
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white block">Bahasa & Mata Uang</span>
                        <span className="text-[11px] text-zinc-500 font-mono">Format mata uang dan lokalisasi</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-zinc-400">
                        {globalLanguage.toUpperCase()} • {currency}
                      </span>
                      <span className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all text-base font-mono">›</span>
                    </div>
                  </button>

                  {/* About App */}
                  <button
                    type="button"
                    onClick={() => setActiveSubPage("about")}
                    className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm">
                        ℹ️
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white block">Tentang Tonalzone</span>
                        <span className="text-[11px] text-zinc-500 font-mono">Versi aplikasi & garansi escrow</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-zinc-500">v2.4.0</span>
                      <span className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all text-base font-mono">›</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 6. GROUP: LOGOUT BUTTON */}
              <div className="pt-2">
                <div className="bg-[#121215] border border-red-500/20 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="w-full px-4 py-4 flex items-center justify-center gap-2.5 text-sm font-mono font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-500/10 active:bg-red-500/20 transition-all cursor-pointer"
                  >
                    <span>🚪</span>
                    <span>Keluar dari Akun</span>
                  </button>
                </div>
              </div>

              {/* Footer text */}
              <div className="text-center pt-2">
                <p className="text-[11px] font-mono text-zinc-600">
                  Tonalzone Audiophile Engine • Build 2026.08.31
                </p>
              </div>
            </motion.div>
          )}

          {/* ========================================================
              SUB-PAGE 1: PROFILE & AVATAR EDIT
             ======================================================== */}
          {activeSubPage === "profile" && (
            <motion.div
              key="subpage-profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 pb-12"
            >
              {/* Back Bar */}
              <div className="flex items-center gap-3 pb-2 border-b border-[#1f1f24]">
                <button
                  type="button"
                  onClick={() => setActiveSubPage(null)}
                  className="px-3 py-1.5 rounded-xl bg-[#161619] hover:bg-[#202025] text-xs font-mono font-bold text-[#D4FF00] border border-[#27272a] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>‹</span>
                  <span>Pengaturan</span>
                </button>
                <h2 className="text-base font-heading font-bold text-white truncate">Profil & Foto Akun</h2>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Avatar Picker */}
                <div className="bg-[#121215] border border-[#222226] rounded-2xl p-5 space-y-4 text-center">
                  <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-[#D4FF00] p-1 bg-[#18181b] shadow-xl">
                    {avatar && avatar !== "/placeholder.svg" ? (
                      <img src={avatar} alt={name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full bg-[#222] rounded-full flex items-center justify-center font-mono font-bold text-white text-2xl">
                        {(name || "AR").substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleAvatarFileUpload}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                  />

                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-4 py-2 bg-[#D4FF00] hover:bg-[#bce600] text-black rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Unggah Foto Baru
                    </button>
                    {avatar !== "/placeholder.svg" && (
                      <button
                        type="button"
                        onClick={() => setAvatar("/placeholder.svg")}
                        className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-mono transition-colors cursor-pointer"
                      >
                        Hapus
                      </button>
                    )}
                  </div>

                  {/* Preset Avatars */}
                  <div className="pt-3 border-t border-[#1e1e24]">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">
                      Preset Avatar Audiophile:
                    </span>
                    <div className="flex justify-center gap-3">
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
                            triggerToast(`Preset ${p.name} dipilih`);
                          }}
                          className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                            avatar === p.url ? "border-[#D4FF00] scale-110" : "border-zinc-700 hover:border-zinc-400"
                          }`}
                        >
                          <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="bg-[#121215] border border-[#222226] rounded-2xl p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                      Nama Tampilan
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-[#18181c] border border-[#27272a] focus:border-[#D4FF00] text-white px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                      placeholder="e.g. Alex Rivera"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                      Perangkat Audio Utama (Gear)
                    </label>
                    <input
                      type="text"
                      value={gear}
                      onChange={(e) => setGear(e.target.value)}
                      required
                      className="w-full bg-[#18181c] border border-[#27272a] focus:border-[#D4FF00] text-white px-4 py-3 rounded-xl text-sm outline-none transition-colors"
                      placeholder="e.g. Dedicated DAC/AMP, Dongle, DAP"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#D4FF00] hover:bg-[#bce600] active:scale-[0.99] text-black font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(212,255,0,0.2)] cursor-pointer"
                  >
                    Simpan Perubahan Profil
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ========================================================
              SUB-PAGE 2: SECURITY & PASSWORD
             ======================================================== */}
          {activeSubPage === "security" && (
            <motion.div
              key="subpage-security"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 pb-12"
            >
              {/* Back Bar */}
              <div className="flex items-center gap-3 pb-2 border-b border-[#1f1f24]">
                <button
                  type="button"
                  onClick={() => setActiveSubPage(null)}
                  className="px-3 py-1.5 rounded-xl bg-[#161619] hover:bg-[#202025] text-xs font-mono font-bold text-[#D4FF00] border border-[#27272a] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>‹</span>
                  <span>Pengaturan</span>
                </button>
                <h2 className="text-base font-heading font-bold text-white truncate">Keamanan & Kata Sandi</h2>
              </div>

              {/* Email Card */}
              <div className="bg-[#121215] border border-[#222226] rounded-2xl p-5 space-y-3">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">Email Terdaftar</span>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-sans font-bold text-white truncate">{email}</p>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Email Utama Terverifikasi
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newE = prompt("Masukkan alamat email baru:", email);
                      if (newE && newE !== email) {
                        setEmail(newE);
                        triggerToast("Email berhasil diperbarui ke " + newE);
                      }
                    }}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-mono transition-colors shrink-0 cursor-pointer"
                  >
                    Ubah Email
                  </button>
                </div>
              </div>

              {/* Password Form */}
              <form onSubmit={handleSaveSecurity} className="bg-[#121215] border border-[#222226] rounded-2xl p-5 space-y-4">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">Ganti Kata Sandi</span>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">Kata Sandi Saat Ini</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#18181c] border border-[#27272a] focus:border-[#D4FF00] text-white px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">Kata Sandi Baru</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#18181c] border border-[#27272a] focus:border-[#D4FF00] text-white px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
                    placeholder="Minimal 8 karakter"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1.5">Konfirmasi Kata Sandi Baru</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#18181c] border border-[#27272a] focus:border-[#D4FF00] text-white px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
                    placeholder="Ketik ulang kata sandi baru"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#D4FF00] hover:bg-[#bce600] text-black font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Simpan Kata Sandi
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ========================================================
              SUB-PAGE 3: ADDRESSES LIST
             ======================================================== */}
          {activeSubPage === "addresses" && (
            <motion.div
              key="subpage-addresses"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 pb-12"
            >
              {/* Back Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-[#1f1f24]">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSubPage(null)}
                    className="px-3 py-1.5 rounded-xl bg-[#161619] hover:bg-[#202025] text-xs font-mono font-bold text-[#D4FF00] border border-[#27272a] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>‹</span>
                    <span>Pengaturan</span>
                  </button>
                  <h2 className="text-base font-heading font-bold text-white truncate">Alamat Pengiriman</h2>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddAddrModal(true)}
                  className="px-3 py-1.5 bg-[#D4FF00] hover:bg-[#bce600] text-black text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  + Tambah
                </button>
              </div>

              {/* Address Cards List */}
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`bg-[#121215] border rounded-2xl p-4.5 space-y-3 transition-all ${
                      addr.isDefault ? "border-[#D4FF00]/50 shadow-[0_0_20px_rgba(212,255,0,0.06)]" : "border-[#222226]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-sans font-bold text-white">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#D4FF00]/10 text-[#D4FF00] border border-[#D4FF00]/30">
                            UTAMA
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          >
                            Jadikan Utama
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-xs font-mono text-red-400 hover:text-red-300 transition-colors cursor-pointer ml-2"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-zinc-400 space-y-1 font-mono leading-relaxed">
                      <p className="text-white font-sans font-medium">{addr.receiver} ({addr.phone})</p>
                      <p>{addr.fullAddress}</p>
                      <p>{addr.city}, {addr.postalCode}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Address Modal */}
              <AnimatePresence>
                {showAddAddrModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowAddAddrModal(false)}
                      className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative w-full max-w-[440px] bg-[#121215] border border-[#27272a] rounded-2xl p-6 shadow-2xl z-10 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-[#222] pb-3">
                        <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">Tambah Alamat Baru</h3>
                        <button
                          type="button"
                          onClick={() => setShowAddAddrModal(false)}
                          className="text-zinc-400 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleAddNewAddress} className="space-y-3">
                        <div>
                          <label className="block text-xs font-mono text-zinc-400 mb-1">Label Alamat</label>
                          <input
                            type="text"
                            required
                            value={newAddrLabel}
                            onChange={(e) => setNewAddrLabel(e.target.value)}
                            placeholder="e.g. Rumah, Kantor, Studio"
                            className="w-full bg-[#18181c] border border-[#27272a] focus:border-[#D4FF00] text-white px-3.5 py-2.5 rounded-xl text-xs outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-mono text-zinc-400 mb-1">Nama Penerima</label>
                            <input
                              type="text"
                              required
                              value={newAddrReceiver}
                              onChange={(e) => setNewAddrReceiver(e.target.value)}
                              placeholder="Nama lengkap"
                              className="w-full bg-[#18181c] border border-[#27272a] focus:border-[#D4FF00] text-white px-3.5 py-2.5 rounded-xl text-xs outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-mono text-zinc-400 mb-1">No. WhatsApp</label>
                            <input
                              type="tel"
                              required
                              value={newAddrPhone}
                              onChange={(e) => setNewAddrPhone(e.target.value)}
                              placeholder="+62 8..."
                              className="w-full bg-[#18181c] border border-[#27272a] focus:border-[#D4FF00] text-white px-3.5 py-2.5 rounded-xl text-xs outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-mono text-zinc-400 mb-1">Alamat Lengkap</label>
                          <textarea
                            required
                            rows={2}
                            value={newAddrFull}
                            onChange={(e) => setNewAddrFull(e.target.value)}
                            placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan"
                            className="w-full bg-[#18181c] border border-[#27272a] focus:border-[#D4FF00] text-white px-3.5 py-2.5 rounded-xl text-xs outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-mono text-zinc-400 mb-1">Kota / Kabupaten</label>
                            <input
                              type="text"
                              required
                              value={newAddrCity}
                              onChange={(e) => setNewAddrCity(e.target.value)}
                              placeholder="e.g. Jakarta Selatan"
                              className="w-full bg-[#18181c] border border-[#27272a] focus:border-[#D4FF00] text-white px-3.5 py-2.5 rounded-xl text-xs outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-mono text-zinc-400 mb-1">Kode Pos</label>
                            <input
                              type="text"
                              required
                              value={newAddrPostal}
                              onChange={(e) => setNewAddrPostal(e.target.value)}
                              placeholder="12110"
                              className="w-full bg-[#18181c] border border-[#27272a] focus:border-[#D4FF00] text-white px-3.5 py-2.5 rounded-xl text-xs outline-none"
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            className="w-full py-3 bg-[#D4FF00] hover:bg-[#bce600] text-black font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                          >
                            Simpan Alamat
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ========================================================
              SUB-PAGE 4: AUDIO PREFERENCES & TUNING
             ======================================================== */}
          {activeSubPage === "audio_preferences" && (
            <motion.div
              key="subpage-audio"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 pb-12"
            >
              {/* Back Bar */}
              <div className="flex items-center gap-3 pb-2 border-b border-[#1f1f24]">
                <button
                  type="button"
                  onClick={() => setActiveSubPage(null)}
                  className="px-3 py-1.5 rounded-xl bg-[#161619] hover:bg-[#202025] text-xs font-mono font-bold text-[#D4FF00] border border-[#27272a] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>‹</span>
                  <span>Pengaturan</span>
                </button>
                <h2 className="text-base font-heading font-bold text-white truncate">Preferensi Sound Signature</h2>
              </div>

              <form onSubmit={handleSaveAudioPreferences} className="space-y-5">
                {/* Sound Signatures List */}
                <div className="space-y-2">
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block px-1">
                    Pilih Target Respon Frekuensi:
                  </span>
                  <div className="grid grid-cols-1 gap-2.5">
                    {[
                      { id: "Harman 2019 IE", title: "Harman Target 2019 IE", desc: "Sub-bass punchy, midrange jernih, dan treble luas seimbang." },
                      { id: "Reference / Neutral", title: "Reference / Neutral / Diffuse Field", desc: "Akurat untuk monitoring studio, vokal murni tanpa bass boost berlebih." },
                      { id: "Warm / Basshead", title: "Warm / V-Shape / Bass Boosted", desc: "Bass bertenaga, energi ritme tebal untuk EDM, Hip-Hop, dan Rock." },
                      { id: "Bright / Treble Oriented", title: "Bright / Mid-Centric / Airy", desc: "Detail instrumen akustik mikro dan artikulasi vokal tinggi." },
                    ].map((sig) => (
                      <div
                        key={sig.id}
                        onClick={() => setSoundSignature(sig.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          soundSignature === sig.id
                            ? "bg-[#16161a] border-[#D4FF00] shadow-[0_0_20px_rgba(212,255,0,0.1)]"
                            : "bg-[#121215] border-[#222226] hover:border-zinc-700"
                        }`}
                      >
                        <div className="pr-4">
                          <h4 className={`text-sm font-sans font-bold ${soundSignature === sig.id ? "text-[#D4FF00]" : "text-white"}`}>
                            {sig.title}
                          </h4>
                          <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{sig.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          soundSignature === sig.id ? "border-[#D4FF00] bg-[#D4FF00]" : "border-zinc-700"
                        }`}>
                          {soundSignature === sig.id && <div className="w-2 h-2 rounded-full bg-black" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience Level */}
                <div className="bg-[#121215] border border-[#222226] rounded-2xl p-5 space-y-3">
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
                    Tingkat Pengalaman Audiophile
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Beginner / Entry-Level",
                      "Intermediate / Audiophile",
                      "Hardcore / DIY Tuner",
                      "Sound Engineer / Producer",
                    ].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setExperienceLevel(lvl)}
                        className={`p-3 rounded-xl border text-xs font-mono text-left transition-all ${
                          experienceLevel === lvl
                            ? "bg-[#D4FF00]/10 border-[#D4FF00] text-[#D4FF00] font-bold"
                            : "bg-[#18181c] border-[#27272a] text-zinc-400 hover:text-white"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#D4FF00] hover:bg-[#bce600] text-black font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Simpan Preferensi Tuning
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ========================================================
              SUB-PAGE 5: SELLER PAYOUT SETTINGS
             ======================================================== */}
          {activeSubPage === "seller_payout" && (
            <motion.div
              key="subpage-seller"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 pb-12"
            >
              {/* Back Bar */}
              <div className="flex items-center gap-3 pb-2 border-b border-[#1f1f24]">
                <button
                  type="button"
                  onClick={() => setActiveSubPage(null)}
                  className="px-3 py-1.5 rounded-xl bg-[#161619] hover:bg-[#202025] text-xs font-mono font-bold text-[#D4FF00] border border-[#27272a] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>‹</span>
                  <span>Pengaturan</span>
                </button>
                <h2 className="text-base font-heading font-bold text-white truncate">Rekening Bank Seller</h2>
              </div>

              <form onSubmit={handleSaveSellerPayout} className="space-y-5">
                <div className="bg-[#121215] border border-[#222226] rounded-2xl p-5 space-y-4">
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
                    Informasi Rekening Pencairan Saldo
                  </span>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1.5">Nama Bank</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-[#18181c] border border-[#27272a] focus:border-[#D4FF00] text-white px-3.5 py-3 rounded-xl text-xs outline-none"
                    >
                      <option value="BCA (Bank Central Asia)">BCA (Bank Central Asia)</option>
                      <option value="Bank Mandiri">Bank Mandiri</option>
                      <option value="BRI (Bank Rakyat Indonesia)">BRI (Bank Rakyat Indonesia)</option>
                      <option value="BNI (Bank Negara Indonesia)">BNI (Bank Negara Indonesia)</option>
                      <option value="Bank Jago">Bank Jago</option>
                      <option value="SeBank">SeaBank</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1.5">Nomor Rekening</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                      className="w-full bg-[#18181c] border border-[#27272a] focus:border-[#D4FF00] text-white px-4 py-2.5 rounded-xl text-sm outline-none font-mono"
                      placeholder="e.g. 8765432109"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1.5">Nama Pemilik Rekening</label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      required
                      className="w-full bg-[#18181c] border border-[#27272a] focus:border-[#D4FF00] text-white px-4 py-2.5 rounded-xl text-sm outline-none uppercase font-mono"
                      placeholder="e.g. ALEX RIVERA"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#D4FF00] hover:bg-[#bce600] text-black font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                  >
                    Simpan Rekening Payout
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ========================================================
              SUB-PAGE 6: LANGUAGE & CURRENCY
             ======================================================== */}
          {activeSubPage === "language_currency" && (
            <motion.div
              key="subpage-lang"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 pb-12"
            >
              {/* Back Bar */}
              <div className="flex items-center gap-3 pb-2 border-b border-[#1f1f24]">
                <button
                  type="button"
                  onClick={() => setActiveSubPage(null)}
                  className="px-3 py-1.5 rounded-xl bg-[#161619] hover:bg-[#202025] text-xs font-mono font-bold text-[#D4FF00] border border-[#27272a] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>‹</span>
                  <span>Pengaturan</span>
                </button>
                <h2 className="text-base font-heading font-bold text-white truncate">Bahasa & Mata Uang</h2>
              </div>

              {/* Language Picker */}
              <div className="bg-[#121215] border border-[#222226] rounded-2xl p-5 space-y-3">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">Bahasa Aplikasi</span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setGlobalLanguage("Bahasa Indonesia");
                      triggerToast("Bahasa diubah ke Indonesia");
                    }}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      globalLanguage === "Bahasa Indonesia"
                        ? "bg-[#D4FF00]/10 border-[#D4FF00] text-[#D4FF00] font-bold"
                        : "bg-[#18181c] border-[#27272a] text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span>🇮🇩 Bahasa Indonesia</span>
                    {globalLanguage === "Bahasa Indonesia" && <span className="font-mono">✓</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGlobalLanguage("English");
                      triggerToast("Language changed to English");
                    }}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      globalLanguage === "English"
                        ? "bg-[#D4FF00]/10 border-[#D4FF00] text-[#D4FF00] font-bold"
                        : "bg-[#18181c] border-[#27272a] text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span>🇺🇸 English</span>
                    {globalLanguage === "English" && <span className="font-mono">✓</span>}
                  </button>
                </div>
              </div>

              {/* Currency Picker */}
              <div className="bg-[#121215] border border-[#222226] rounded-2xl p-5 space-y-3">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">Mata Uang Produk</span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrency("IDR");
                      triggerToast("Mata uang diubah ke Rupiah (IDR)");
                    }}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      currency === "IDR"
                        ? "bg-[#D4FF00]/10 border-[#D4FF00] text-[#D4FF00] font-bold"
                        : "bg-[#18181c] border-[#27272a] text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span>Rp Indonesian Rupiah</span>
                    {currency === "IDR" && <span className="font-mono">✓</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrency("USD");
                      triggerToast("Currency changed to US Dollar (USD)");
                    }}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      currency === "USD"
                        ? "bg-[#D4FF00]/10 border-[#D4FF00] text-[#D4FF00] font-bold"
                        : "bg-[#18181c] border-[#27272a] text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span>$ US Dollar</span>
                    {currency === "USD" && <span className="font-mono">✓</span>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================
              SUB-PAGE 7: ABOUT TONALZONE
             ======================================================== */}
          {activeSubPage === "about" && (
            <motion.div
              key="subpage-about"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 pb-12"
            >
              {/* Back Bar */}
              <div className="flex items-center gap-3 pb-2 border-b border-[#1f1f24]">
                <button
                  type="button"
                  onClick={() => setActiveSubPage(null)}
                  className="px-3 py-1.5 rounded-xl bg-[#161619] hover:bg-[#202025] text-xs font-mono font-bold text-[#D4FF00] border border-[#27272a] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>‹</span>
                  <span>Pengaturan</span>
                </button>
                <h2 className="text-base font-heading font-bold text-white truncate">Tentang Tonalzone</h2>
              </div>

              <div className="bg-[#121215] border border-[#222226] rounded-2xl p-6 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center shadow-lg">
                  <img src="/logo.svg" alt="Tonalzone" className="w-10 h-10 object-contain" />
                </div>

                <div>
                  <h3 className="text-lg font-heading font-bold text-white">TONALZONE MARKETPLACE</h3>
                  <p className="text-xs font-mono text-[#D4FF00] mt-0.5 font-bold">Curated Audiophile Gear & Squiglink Analyzer</p>
                  <p className="text-xs font-mono text-zinc-500 mt-1">Version 2.4.0 (Production Release)</p>
                </div>

                <div className="pt-4 border-t border-[#1e1e24] text-xs text-zinc-400 leading-relaxed font-sans text-left space-y-2">
                  <p>
                    Tonalzone adalah platform marketplace audio gear profesional yang menghubungkan audiophile dengan toko terverifikasi, didukung garansi rekening bersama (Escrow System) dan visualisasi kurva frekuensi.
                  </p>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  <Link
                    href="/support"
                    className="px-4 py-2 bg-[#18181c] hover:bg-[#27272a] border border-[#27272a] rounded-xl text-xs font-mono text-white transition-colors"
                  >
                    Pusat Bantuan
                  </Link>
                  <Link
                    href="/collection"
                    className="px-4 py-2 bg-[#D4FF00] text-black font-mono font-bold rounded-xl text-xs transition-colors"
                  >
                    Eksplor Produk
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isLoggingOut && setIsLogoutModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-[380px] bg-[#121215] border border-[#27272a] rounded-2xl p-6 shadow-2xl z-10 font-sans space-y-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-lg shrink-0">
                  🚪
                </div>
                <div>
                  <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
                    Konfirmasi Keluar
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Apakah Anda yakin ingin keluar dari akun Tonalzone?
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1f1f24]">
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="px-4 py-2 bg-[#18181c] hover:bg-[#27272a] text-zinc-300 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={handleConfirmLogout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isLoggingOut ? "Keluar..." : "Ya, Keluar"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
