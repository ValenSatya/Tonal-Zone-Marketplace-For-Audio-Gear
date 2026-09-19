"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { updateUserProfile } from "@/app/actions/profile";
import { getAuthSession } from "@/app/actions/auth";
import { motion, AnimatePresence } from "framer-motion";
import { KeyboardArrowRight } from "@/components/ui/keyboard-arrow";

const PRESET_AVATARS = [
  { id: "studio", name: "Studio Engineer", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80" },
  { id: "audiophile", name: "Acoustic Master", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80" },
  { id: "vinyl", name: "Vinyl Collector", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80" },
  { id: "minimal", name: "Monochrome Vault", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80" },
];

function compressImage(file: File, maxWidth = 400, maxHeight = 400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function ProfilePage() {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    tuning?: string;
    gear?: string;
    location?: string;
  } | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");

  const syncUserAcrossApp = (updatedUser: any) => {
    setUser(updatedUser);
    localStorage.setItem("tonalzone_user", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("userLoginChange"));
  };

  useEffect(() => {
    const loadUser = async () => {
      const stored = localStorage.getItem("tonalzone_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          // ignore
        }
      }

      // Always fetch live profile from Supabase database to ensure avatar from Google or DB is accurate
      try {
        const sessionRes = await getAuthSession();
        if (sessionRes.success && sessionRes.user) {
          syncUserAcrossApp(sessionRes.user);
        } else if (!stored) {
          setUser({
            name: "Member Audiophile",
            email: "audiophile@tonalzone.id",
            avatar: "/placeholder.svg",
            role: "BUYER",
          });
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    };

    loadUser();
    window.addEventListener("userLoginChange", loadUser);
    return () => window.removeEventListener("userLoginChange", loadUser);
  }, []);

  const handleAvatarSelect = async (avatarUrl: string) => {
    if (!user) return;
    setIsUploading(true);
    setStatusMessage(null);

    try {
      const res = await updateUserProfile({
        email: user.email,
        avatar: avatarUrl,
        name: user.name,
      });

      if (res.success && res.user) {
        syncUserAcrossApp(res.user);
        setStatusMessage({ type: "success", text: "Foto profil berhasil diperbarui & disinkronkan ke database!" });
        setIsModalOpen(false);
      } else {
        setStatusMessage({ type: "error", text: res.error || "Gagal memperbarui foto profil." });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah foto.";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setStatusMessage({ type: "error", text: "Ukuran foto maksimal 10MB." });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);
    try {
      // Compress to lightweight 400x400 JPEG (approx ~30KB) to ensure lightning-fast upload & safe server-action payload
      const compressedBase64 = await compressImage(file, 400, 400, 0.85);
      await handleAvatarSelect(compressedBase64);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "Gagal memproses gambar foto profil." });
      setIsUploading(false);
    }
  };

  const handleCustomUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    await handleAvatarSelect(customUrlInput.trim());
    setCustomUrlInput("");
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#FAF9F6] font-sans selection:bg-[#BFDD25] selection:text-[#030303] flex flex-col relative">
      <Navbar />

      <main className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 py-16 w-full flex-1">
        <div className="flex items-center gap-2 font-mono text-xs text-[#777777] uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-white transition-colors">
            HOME
          </Link>
          <span className="text-[#444]">/</span>
          <span className="text-[#BFDD25] font-semibold">{t("settings.accountProfile")}</span>
        </div>

        {/* Status Alert Notification */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-2xl text-xs font-mono flex items-center justify-between shadow-lg ${
                statusMessage.type === "success"
                  ? "bg-[#0A1A0A] text-[#BFDD25]"
                  : "bg-[#200A0A] text-red-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    statusMessage.type === "success"
                      ? "bg-[#BFDD25] shadow-[0_0_8px_rgba(191,221,37,0.8)]"
                      : "bg-red-400"
                  }`}
                />
                <span>{statusMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition-colors cursor-pointer ml-4"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Profile Bento Container (Zero Stroke) */}
        <div className="bg-[#0A0A0A] rounded-2xl p-8 lg:p-12 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8 pb-10">
            
            {/* AVATAR UPLOAD SECTION */}
            <div className="relative group/avatar shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#141414] overflow-hidden transition-all duration-300 shadow-xl relative flex items-center justify-center ring-2 ring-transparent group-hover/avatar:ring-[#BFDD25]">
                {user?.avatar && user.avatar !== "/placeholder.svg" ? (
                  <img
                    src={user.avatar}
                    alt={user.name || "Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-mono text-3xl font-bold text-white/40">
                    {(user?.name || "AR").substring(0, 2).toUpperCase()}
                  </span>
                )}

                {/* Upload Overlay */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  disabled={isUploading}
                  className="absolute inset-0 bg-black/75 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="mb-1 text-[#BFDD25]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#BFDD25]">
                    {isUploading ? "Syncing..." : "Ganti Foto"}
                  </span>
                </button>
              </div>

              {/* Quick Camera Trigger Badge */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="absolute bottom-0 right-0 p-2.5 bg-[#181818] hover:bg-[#BFDD25] text-white hover:text-black rounded-full transition-all cursor-pointer shadow-lg hover:scale-105"
                title="Ganti Foto Profil"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>

            {/* USER INFO */}
            <div className="space-y-3 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <div className="inline-block px-3.5 py-1 bg-[#141414] rounded-full text-[11px] font-mono uppercase tracking-wider text-[#BFDD25] font-bold">
                  {user?.role || "BUYER"}
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-3 py-1 bg-[#141414] hover:bg-[#1E1E1E] text-[11px] font-mono text-[#BFDD25] rounded-full transition-colors cursor-pointer"
                >
                  Ubah Foto Profil ↵
                </button>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-white">
                {user?.name || "Alex Rivera"}
              </h1>
              <p className="font-mono text-xs text-[#888888]">{user?.email || "alex.rivera@audiophile.io"}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-mono pt-1">
                <span className="px-3.5 py-1.5 bg-[#141414] rounded-full text-[#AAAAAA]">
                  Tuning: <strong className="text-white">{user?.tuning || "Reference / Neutral"}</strong>
                </span>
                <span className="px-3.5 py-1.5 bg-[#141414] rounded-full text-[#AAAAAA]">
                  Gear: <strong className="text-white">{user?.gear || "Dedicated DAC/AMP"}</strong>
                </span>
              </div>
            </div>

            <Link
              href="/settings"
              className="px-6 py-3 bg-[#BFDD25] hover:bg-[#aecd20] text-black font-mono font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-[0_0_12px_rgba(191,221,37,0.3)] shrink-0 inline-flex items-center gap-1.5 group"
            >
              <span>{t("settings.title")}</span>
              <KeyboardArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Telemetry Bento Grid (Zero-Stroke) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
            <div className="bg-[#121212] rounded-2xl p-6 shadow-sm">
              <span className="text-[10px] font-mono text-[#777777] uppercase tracking-widest block mb-2 font-bold">
                {t("orders.title")}
              </span>
              <h4 className="font-heading text-2xl font-bold text-white mb-1">2 ORDERS</h4>
              <p className="font-sans text-xs text-[#888888]">Sennheiser IE 900 & Effect Audio Ares S</p>
            </div>

            <div className="bg-[#121212] rounded-2xl p-6 shadow-sm">
              <span className="text-[10px] font-mono text-[#777777] uppercase tracking-widest block mb-2 font-bold">
                SAVED EQ PRESETS
              </span>
              <h4 className="font-heading text-2xl font-bold text-white mb-1">4 PRESETS</h4>
              <p className="font-sans text-xs text-[#888888]">Harman Target 2019, Diffuse Field, Custom V-Shape</p>
            </div>

            <div className="bg-[#121212] rounded-2xl p-6 shadow-sm">
              <span className="text-[10px] font-mono text-[#777777] uppercase tracking-widest block mb-2 font-bold">
                VIP STATUS
              </span>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#BFDD25] shadow-[0_0_8px_rgba(191,221,37,0.8)]" />
                <h4 className="font-heading text-2xl font-bold text-[#BFDD25]">ACTIVE</h4>
              </div>
              <p className="font-sans text-xs text-[#888888]">Free express worldwide shipping & 15% discount active</p>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL: CHOOSE & UPLOAD AVATAR (Zero-Stroke) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0A0A0A] rounded-2xl p-7 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] font-mono text-[#BFDD25] uppercase tracking-widest block font-bold">
                    Identity Customization
                  </span>
                  <h3 className="text-lg font-bold text-white">Pilih atau Unggah Foto Profil</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#141414] hover:bg-[#202020] text-[#888] hover:text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* SECTION A: DIRECT FILE UPLOAD (Zero-Stroke Well) */}
              <div className="mb-6">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full py-5 bg-[#141414] hover:bg-[#181818] rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer group shadow-inner focus:ring-1 focus:ring-[#BFDD25]"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1C1C1C] group-hover:bg-[#BFDD25] text-[#888] group-hover:text-black flex items-center justify-center mb-2.5 transition-all">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-[#BFDD25]">
                    Upload Foto dari Komputer / HP
                  </span>
                  <span className="text-[10px] text-[#777777] font-mono mt-0.5">
                    Mendukung JPG, PNG, WEBP (Maks 5MB)
                  </span>
                </button>
              </div>

              {/* SECTION B: CURATED AUDIOPHILE PRESETS */}
              <div className="mb-6">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#888888] mb-3">
                  Pilihan Avatar Kolektor Audiophile
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleAvatarSelect(preset.url)}
                      disabled={isUploading}
                      className="flex flex-col items-center gap-2 p-2.5 rounded-xl bg-[#141414] hover:bg-[#1A1A1A] transition-all cursor-pointer group hover:scale-105"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1E1E1E] ring-2 ring-transparent group-hover:ring-[#BFDD25] transition-all">
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-mono text-[#888888] group-hover:text-white truncate max-w-full text-center">
                        {preset.name.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION C: CUSTOM IMAGE URL */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#888888] mb-2">
                  Atau Tempel URL Gambar Web
                </label>
                <form onSubmit={handleCustomUrlSubmit} className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="flex-1 bg-[#141414] focus:bg-[#181818] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#555] outline-none font-mono focus:ring-1 focus:ring-[#BFDD25] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isUploading || !customUrlInput.trim()}
                    className="px-5 py-2.5 bg-[#BFDD25] hover:bg-[#aecd20] text-black rounded-full text-xs font-mono font-bold uppercase transition-all cursor-pointer disabled:opacity-40 shadow-[0_0_10px_rgba(191,221,37,0.25)]"
                  >
                    Terapkan
                  </button>
                </form>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
