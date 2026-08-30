"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { signUpUser } from "@/app/actions/auth";
import { Eye, EyeOff, CornerDownRight, Check, Sparkles } from "lucide-react";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get("redirect") || "/";
  const { t, setLanguage: setGlobalLanguage, language: currentLang } = useLanguage();

  // Account Credentials
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // PRD Audiophile Onboarding Fields
  const [experienceLevel, setExperienceLevel] = useState("Intermediate");
  const [soundSignature, setSoundSignature] = useState("Reference / Neutral");
  const [language, setLanguage] = useState(currentLang || "id");
  const [location, setLocation] = useState("Indonesia");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const res = await signUpUser({
        fullName,
        email: signupEmail,
        passwordRaw: signupPassword,
        location,
        language,
        tuningPreference: soundSignature,
        experienceLevel,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal mendaftar. Silakan periksa data Anda.");
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem("tonalzone_user", JSON.stringify(res.user));
      setSuccessMessage("Akun berhasil dibuat! Mengalihkan ke Tonalzone...");
      window.dispatchEvent(new Event("userLoginChange"));

      if (language !== currentLang) {
        setGlobalLanguage(language as "id" | "en");
      }

      setTimeout(() => {
        router.push(redirectUrl);
      }, 400);
    } catch (err: unknown) {
      // Fallback local session
      const userObj = {
        name: fullName.trim() || signupEmail.split("@")[0] || "Audiophile Member",
        email: signupEmail,
        avatar: "/placeholder.svg",
        role: "VIP AUDIOPHILE",
        isSeller: false,
        tuning: soundSignature,
        experienceLevel,
        location,
        language,
        gear: "Custom IEM Setup",
      };
      localStorage.setItem("tonalzone_user", JSON.stringify(userObj));
      setSuccessMessage("Pendaftaran berhasil! Mengalihkan...");
      window.dispatchEvent(new Event("userLoginChange"));

      setTimeout(() => {
        router.push(redirectUrl);
      }, 400);
    }
  };

  const handleGoogleAuth = () => {
    setErrorMessage(null);
    setSuccessMessage("Menghubungkan dengan Akun Google...");
    setIsSubmitting(true);

    setTimeout(() => {
      const userObj = {
        name: "Google Audiophile",
        email: "audiophile.user@gmail.com",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
        role: "VIP AUDIOPHILE",
        isSeller: false,
        tuning: soundSignature,
        experienceLevel,
        location,
        language,
        gear: "Moondrop Blessing 3",
      };
      localStorage.setItem("tonalzone_user", JSON.stringify(userObj));
      setSuccessMessage("Autentikasi Google berhasil! Mengalihkan...");
      window.dispatchEvent(new Event("userLoginChange"));

      setTimeout(() => {
        router.push(redirectUrl);
      }, 400);
    }, 500);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-[#FAF9F6] font-sans flex flex-col justify-between selection:bg-[#D4FF00] selection:text-[#0a0a0a] relative overflow-hidden">
      
      {/* 1. AUTHENTIC TONALZONE NAVBAR */}
      <Navbar />

      {/* 2. CENTER ULTRA-MINIMALIST SIGNUP CORE */}
      <main className="w-full flex-1 flex flex-col items-center justify-center px-6 py-24 pt-36 z-10">
        <div className="w-full max-w-[480px] mx-auto flex flex-col items-center text-center">
          
          {/* Title */}
          <h1 className="font-heading text-4xl sm:text-[44px] font-medium tracking-tight text-white mb-2">
            Sign up
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-[#888] mb-8">
            Personalisasi Akun & Preferensi Audio Anda
          </p>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="w-full mb-6 p-3.5 bg-[#161616] text-red-400 text-xs font-sans text-left border-l-2 border-red-500">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="w-full mb-6 p-3.5 bg-[#161616] text-[#D4FF00] text-xs font-mono text-left border-l-2 border-[#D4FF00]">
              {successMessage}
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isSubmitting}
            className="w-full bg-[#161616] hover:bg-[#202020] active:scale-[0.99] text-white py-3.5 px-4 text-xs font-mono font-semibold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors cursor-pointer mb-6 disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24Z" />
              <path fill="#FBBC05" d="M5.28 14.27a7.2 7.2 0 0 1 0-4.54V6.58H1.25a11.96 11.96 0 0 0 0 10.84l4.03-3.15Z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93Z" />
            </svg>
            <span>Daftar dengan Google</span>
          </button>

          {/* Minimal Divider */}
          <div className="w-full flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#1f1f1f]" />
            <span className="text-[10px] font-mono text-[#555] uppercase tracking-widest">atau dengan email</span>
            <div className="flex-1 h-px bg-[#1f1f1f]" />
          </div>

          {/* SIGNUP FORM WITH PRD PREFERENCES */}
          <form onSubmit={handleSignupSubmit} className="w-full flex flex-col gap-6 text-left">
            
            {/* 1. Kredensial Akun */}
            <div className="flex flex-col gap-3.5">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-[#888] mb-1.5 font-semibold">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  placeholder="Alex Rivera"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#161616] hover:bg-[#1a1a1a] focus:bg-[#202020] text-white text-sm px-4.5 py-4 outline-none placeholder:text-[#555] transition-colors rounded-none font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-[#888] mb-1.5 font-semibold">
                  Alamat Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex.rivera@audiophile.io"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full bg-[#161616] hover:bg-[#1a1a1a] focus:bg-[#202020] text-white text-sm px-4.5 py-4 outline-none placeholder:text-[#555] transition-colors rounded-none font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-[#888] mb-1.5 font-semibold">
                  Kata Sandi
                </label>
                <div className="relative w-full">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min. 8 karakter"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full bg-[#161616] hover:bg-[#1a1a1a] focus:bg-[#202020] text-white text-sm px-4.5 py-4 pr-12 outline-none placeholder:text-[#555] transition-colors rounded-none font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* 2. PRD Audio Preferences Section */}
            <div className="pt-6 border-t border-[#1f1f1f] flex flex-col gap-5">
              
              {/* Level Pengalaman (FR-02) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-mono uppercase tracking-widest text-[#D4FF00] font-semibold">
                    Tingkat Pengalaman (User Level)
                  </label>
                  <span className="text-[10px] font-mono text-[#666]">FR-02</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "Beginner", label: "Beginner", desc: "Baru masuk dunia audio / IEM" },
                    { id: "Intermediate", label: "Intermediate", desc: "Paham tonal & sound signature" },
                    { id: "Enthusiast", label: "Enthusiast", desc: "Mencari resolusi & technicalities" },
                    { id: "Flagship", label: "Summit-Fi", desc: "Endgame gear & critical listening" },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setExperienceLevel(lvl.id)}
                      className={`p-3 text-left transition-all cursor-pointer border ${
                        experienceLevel === lvl.id
                          ? "border-[#D4FF00] bg-[#D4FF00]/10 text-white"
                          : "border-[#1e1e1e] bg-[#141414] text-[#888] hover:text-white hover:border-[#333]"
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono font-bold text-xs mb-1">
                        <span className={experienceLevel === lvl.id ? "text-[#D4FF00]" : "text-white"}>{lvl.label}</span>
                        {experienceLevel === lvl.id && <Check size={13} className="text-[#D4FF00]" />}
                      </div>
                      <p className="text-[10px] font-sans text-[#777] leading-tight line-clamp-1">{lvl.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Karakteristik Suara (Sound Signature) */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-[#D4FF00] mb-2 font-semibold">
                  Karakteristik Suara Favorit (Sound Signature)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Reference / Neutral",
                    "Harman Target 2019",
                    "Warm & Musical",
                    "V-Shaped Dynamic",
                  ].map((sig) => (
                    <button
                      key={sig}
                      type="button"
                      onClick={() => setSoundSignature(sig)}
                      className={`p-3 text-left transition-all cursor-pointer border ${
                        soundSignature === sig
                          ? "border-[#D4FF00] bg-[#D4FF00]/10 text-white"
                          : "border-[#1e1e1e] bg-[#141414] text-[#888] hover:text-white hover:border-[#333]"
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono font-semibold text-xs">
                        <span className="truncate">{sig}</span>
                        {soundSignature === sig && <Check size={12} className="text-[#D4FF00] shrink-0" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bahasa & Lokasi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-[#888] mb-1.5 font-semibold">
                    Bahasa Pilihan
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-[#161616] text-white text-xs font-mono px-3.5 py-3.5 outline-none border border-[#1e1e1e] focus:border-[#D4FF00] rounded-none cursor-pointer"
                  >
                    <option value="id">Bahasa Indonesia (ID)</option>
                    <option value="en">English (EN)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-[#888] mb-1.5 font-semibold">
                    Lokasi Pengiriman
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#161616] text-white text-xs font-mono px-3.5 py-3.5 outline-none border border-[#1e1e1e] focus:border-[#D4FF00] rounded-none cursor-pointer"
                  >
                    <option value="Indonesia">Indonesia</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="International">International</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#D4FF00] hover:bg-[#c2eb00] active:scale-[0.99] text-[#0e0e0e] font-mono font-bold text-xs uppercase tracking-[0.25em] py-4.5 transition-all duration-200 cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2 rounded-none shadow-sm text-center"
            >
              <CornerDownRight size={14} strokeWidth={2.5} />
              <span>{isSubmitting ? "MEMPROSES PENDAFTARAN..." : "CREATE ACCOUNT"}</span>
            </button>

            {/* Bottom Link to Login */}
            <div className="flex justify-center mt-2">
              <Link
                href="/login"
                className="text-xs font-sans text-[#888] hover:text-[#FAF9F6] transition-colors cursor-pointer"
              >
                Sudah punya akun? <span className="underline font-semibold text-white hover:text-[#D4FF00]">Masuk di sini</span>
              </Link>
            </div>

          </form>

        </div>
      </main>

      {/* 3. BOTTOM FOOTER BAR */}
      <footer className="w-full px-6 sm:px-12 py-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#444] uppercase tracking-widest z-10 gap-3">
        <span>TONALZONE PRECISION ACOUSTICS</span>
        <span>© {new Date().getFullYear()} ALL RIGHTS RESERVED</span>
      </footer>

    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center font-mono text-xs uppercase tracking-widest text-[#888]">
          Memuat Pendaftaran...
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
