"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { updateUserProfile } from "@/app/actions/profile";
import { motion, AnimatePresence } from "framer-motion";

const PRESET_AVATARS = [
  { id: "studio", name: "Studio Engineer", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80" },
  { id: "audiophile", name: "Acoustic Master", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80" },
  { id: "vinyl", name: "Vinyl Collector", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80" },
  { id: "minimal", name: "Monochrome Vault", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80" },
];

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
    const loadUser = () => {
      const stored = localStorage.getItem("tonalzone_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser({
            name: "Alex Rivera",
            email: "alex.rivera@audiophile.io",
            avatar: "/placeholder.svg",
            role: "VIP AUDIOPHILE",
          });
        }
      } else {
        setUser({
          name: "Alex Rivera",
          email: "alex.rivera@audiophile.io",
          avatar: "/placeholder.svg",
          role: "VIP AUDIOPHILE",
        });
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
        setStatusMessage({ type: "success", text: "Foto profil berhasil diperbarui & disinkronkan!" });
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({ type: "error", text: "Ukuran foto maksimal 5MB." });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        await handleAvatarSelect(base64Url);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCustomUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    await handleAvatarSelect(customUrlInput.trim());
    setCustomUrlInput("");
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#FAF9F6] font-sans selection:bg-[#D4FF00] selection:text-[#0e0e0e] flex flex-col relative">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-6 lg:px-12 py-16 w-full flex-1">
        <div className="flex items-center gap-2 font-mono text-xs text-[#FAF9F6]/50 uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-white transition-colors">
            HOME
          </Link>
          <span>/</span>
          <span className="text-[#D4FF00]">{t("settings.accountProfile")}</span>
        </div>

        {/* Status Alert Notification */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-2xl border text-xs font-mono flex items-center justify-between ${
                statusMessage.type === "success"
                  ? "bg-[#161616] border-[#D4FF00]/40 text-[#D4FF00]"
                  : "bg-[#161616] border-red-500/40 text-red-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    statusMessage.type === "success" ? "bg-[#D4FF00]" : "bg-red-400"
                  }`}
                />
                <span>{statusMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="text-xs text-[#FAF9F6]/40 hover:text-white cursor-pointer ml-4"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-[#141414] border border-[#262626] rounded-3xl p-8 lg:p-12 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8 pb-10 border-b border-[#222]">
            
            {/* AVATAR UPLOAD SECTION */}
            <div className="relative group/avatar shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#181818] border-2 border-[#333] group-hover/avatar:border-[#D4FF00] overflow-hidden transition-all duration-300 shadow-xl relative flex items-center justify-center">
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
                  className="absolute inset-0 bg-black/70 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="mb-1 text-[#D4FF00]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                    {isUploading ? "Syncing..." : "Ganti Foto"}
                  </span>
                </button>
              </div>

              {/* Quick Camera Trigger Badge */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="absolute bottom-1 right-1 p-2 bg-[#222] hover:bg-[#D4FF00] text-white hover:text-black rounded-full border border-[#444] transition-colors cursor-pointer shadow-lg"
                title="Ganti Foto Profil"
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>

            {/* USER INFO */}
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <div className="inline-block px-3 py-1 bg-[#222] border border-[#333] rounded-md text-[11px] font-mono uppercase tracking-wider text-white font-semibold">
                  {user?.role || "BUYER"}
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="text-[11px] font-mono text-[#D4FF00] hover:underline cursor-pointer ml-1"
                >
                  [ Ubah Foto Profil ]
                </button>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight text-white">
                {user?.name || "Alex Rivera"}
              </h1>
              <p className="font-mono text-xs text-[#888]">{user?.email || "alex.rivera@audiophile.io"}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs font-mono pt-2">
                <span className="px-3 py-1.5 bg-[#181818] border border-[#262626] rounded-lg text-[#aaa]">
                  Tuning: <strong className="text-white">{user?.tuning || "Reference / Neutral"}</strong>
                </span>
                <span className="px-3 py-1.5 bg-[#181818] border border-[#262626] rounded-lg text-[#aaa]">
                  Gear: <strong className="text-white">{user?.gear || "Dedicated DAC/AMP"}</strong>
                </span>
              </div>
            </div>

            <Link
              href="/settings"
              className="px-5 py-2.5 bg-white hover:bg-[#e0e0e0] text-black rounded-xl font-medium text-xs transition-colors shrink-0"
            >
              {t("settings.title")} →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
            <div className="bg-[#181818] border border-[#262626] rounded-2xl p-6">
              <span className="text-[10px] font-mono text-[#FAF9F6]/40 uppercase tracking-widest block mb-2 font-bold">
                {t("orders.title")}
              </span>
              <h4 className="font-heading text-2xl font-bold text-white mb-1">2 ORDERS</h4>
              <p className="font-sans text-xs text-[#FAF9F6]/60">Sennheiser IE 900 & Effect Audio Ares S</p>
            </div>

            <div className="bg-[#181818] border border-[#262626] rounded-2xl p-6">
              <span className="text-[10px] font-mono text-[#FAF9F6]/40 uppercase tracking-widest block mb-2 font-bold">
                SAVED EQ PRESETS
              </span>
              <h4 className="font-heading text-2xl font-bold text-white mb-1">4 PRESETS</h4>
              <p className="font-sans text-xs text-[#FAF9F6]/60">Harman Target 2019, Diffuse Field, Custom V-Shape</p>
            </div>

            <div className="bg-[#181818] border border-[#262626] rounded-2xl p-6">
              <span className="text-[10px] font-mono text-[#FAF9F6]/40 uppercase tracking-widest block mb-2 font-bold">
                VIP STATUS
              </span>
              <h4 className="font-heading text-2xl font-bold text-[#D4FF00] mb-1">ACTIVE</h4>
              <p className="font-sans text-xs text-[#FAF9F6]/60">Free express worldwide shipping & 15% discount active</p>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL: CHOOSE & UPLOAD AVATAR */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#141414] border border-[#262626] rounded-3xl p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#222] mb-6">
                <div>
                  <span className="text-[10px] font-mono text-[#D4FF00] uppercase tracking-widest block font-bold">
                    Identity Customization
                  </span>
                  <h3 className="text-lg font-bold text-white">Pilih atau Unggah Foto Profil</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-[#888] hover:text-white rounded-lg hover:bg-[#222] transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* SECTION A: DIRECT FILE UPLOAD */}
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
                  className="w-full py-4 border-2 border-dashed border-[#333] hover:border-[#D4FF00] bg-[#181818] rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                >
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-[#888] group-hover:text-[#D4FF00] mb-2 transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs font-bold text-white group-hover:text-[#D4FF00]">
                    Upload Foto dari Komputer / HP
                  </span>
                  <span className="text-[10px] text-[#777] font-mono mt-0.5">
                    Mendukung JPG, PNG, WEBP (Maks 5MB)
                  </span>
                </button>
              </div>

              {/* SECTION B: CURATED AUDIOPHILE PRESETS */}
              <div className="mb-6">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#888] mb-3">
                  Pilihan Avatar Kolektor Audiophile
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleAvatarSelect(preset.url)}
                      disabled={isUploading}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-[#262626] hover:border-[#D4FF00] bg-[#181818] hover:bg-[#202020] transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-[#333] group-hover:border-[#D4FF00]">
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[9px] font-mono text-[#888] group-hover:text-white truncate max-w-full text-center">
                        {preset.name.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION C: CUSTOM IMAGE URL */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#888] mb-2">
                  Atau Tempel URL Gambar Web
                </label>
                <form onSubmit={handleCustomUrlSubmit} className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="flex-1 bg-[#181818] border border-[#2b2b2b] focus:border-[#D4FF00] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#555] outline-none font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isUploading || !customUrlInput.trim()}
                    className="px-4 py-2 bg-white hover:bg-[#D4FF00] text-black rounded-xl text-xs font-mono font-bold uppercase transition-colors cursor-pointer disabled:opacity-40"
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
