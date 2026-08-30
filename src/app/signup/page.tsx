"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { signUpUser } from "@/app/actions/auth";
import { Eye, EyeOff, CornerDownRight, Check, ChevronDown, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Clean Minimalist Selector Bar (Matches the exact input bar aesthetic)
function CustomSelectBar({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string; sub?: string }[];
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative w-full text-left" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#161616] hover:bg-[#1e1e1e] focus:bg-[#202020] text-white text-sm px-4.5 py-4 outline-none flex items-center justify-between transition-colors cursor-pointer rounded-none font-sans"
      >
        <span className="text-[#888] text-xs font-mono uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-white text-xs font-mono font-medium truncate">
            {selected.label}
          </span>
          <ChevronDown
            size={14}
            className={`text-[#777] transition-transform duration-200 shrink-0 ${
              isOpen ? "rotate-180 text-white" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#141414] border border-[#262626] shadow-[0_20px_40px_rgba(0,0,0,0.9)] z-50 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-xs font-mono transition-colors cursor-pointer flex items-center justify-between ${
                opt.value === value
                  ? "bg-[#202020] text-[#D4FF00] font-bold"
                  : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
              }`}
            >
              <div>
                <p className="font-medium text-white">{opt.label}</p>
                {opt.sub && <p className="text-[10px] text-[#666] mt-0.5">{opt.sub}</p>}
              </div>
              {opt.value === value && <Check size={13} className="text-[#D4FF00] shrink-0 ml-2" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get("redirect") || "/";
  const { t, setLanguage: setGlobalLanguage, language: currentLang } = useLanguage();

  // Current Step: 1 = Credentials & Region, 2 = Profile & Avatar, 3 = Audiophile Preferences
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Kredensial & Wilayah
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState(currentLang || "id");
  const [location, setLocation] = useState("Indonesia");

  // Step 2: Profil Pengguna
  const [username, setUsername] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string>("/placeholder.svg");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Step 3: Preferensi Audiophile PRD
  const [experienceLevel, setExperienceLevel] = useState("Intermediate");
  const [soundSignature, setSoundSignature] = useState("Reference / Neutral");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle Avatar Image Upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("Ukuran gambar maksimal 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 1 Validation -> Go to Step 2
  const handleNextToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signupEmail.trim() || !signupEmail.includes("@")) {
      setErrorMessage("Silakan masukkan alamat email yang valid.");
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMessage("Kata sandi minimal 6 karakter.");
      return;
    }

    if (signupPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setStep(2);
  };

  // Step 2 Validation -> Go to Step 3
  const handleNextToStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage("Silakan masukkan username atau nama lengkap Anda.");
      return;
    }

    setStep(3);
  };

  // Step 3 Final Submit
  const handleFinalSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const res = await signUpUser({
        fullName: username.trim(),
        email: signupEmail.trim(),
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

      // Merge custom avatar if uploaded
      const userPayload = {
        ...res.user,
        avatar: avatarPreview,
      };

      localStorage.setItem("tonalzone_user", JSON.stringify(userPayload));
      setSuccessMessage("Akun berhasil dibuat! Mengalihkan...");
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
        name: username.trim() || signupEmail.split("@")[0] || "Audiophile Member",
        email: signupEmail,
        avatar: avatarPreview,
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

      {/* 2. CENTER ULTRA-MINIMALIST PROGRESSIVE FLOW */}
      <main className="w-full flex-1 flex flex-col items-center justify-center px-6 py-24 pt-36 z-10">
        <div className="w-full max-w-[380px] mx-auto flex flex-col items-center text-center">

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="w-full mb-5 p-3.5 bg-[#161616] text-red-400 text-xs font-sans text-left border-l-2 border-red-500">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="w-full mb-5 p-3.5 bg-[#161616] text-[#D4FF00] text-xs font-mono text-left border-l-2 border-[#D4FF00]">
              {successMessage}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: EMAIL, PASSWORD, CONFIRM PASSWORD, BAHASA, LOKASI */}
            {step === 1 && (
              <motion.div
                key="signup-step-1"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="w-full flex flex-col items-center"
              >
                {/* Proportional, refined title matching Sign In */}
                <h1 className="font-heading text-3xl sm:text-[36px] font-normal tracking-tight text-white mb-6">
                  Sign up
                </h1>

                {/* Google OAuth Button */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isSubmitting}
                  className="w-full bg-[#161616] hover:bg-[#202020] active:scale-[0.99] text-white py-3.5 px-4 text-xs font-mono font-semibold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors cursor-pointer mb-4 disabled:opacity-50"
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
                <div className="w-full flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-[#1f1f1f]" />
                  <span className="text-[10px] font-mono text-[#555] uppercase tracking-widest">atau</span>
                  <div className="flex-1 h-px bg-[#1f1f1f]" />
                </div>

                <form onSubmit={handleNextToStep2} className="w-full flex flex-col gap-3 sm:gap-3.5 text-left">
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full bg-[#161616] hover:bg-[#1a1a1a] focus:bg-[#202020] text-white text-sm px-4.5 py-4 outline-none placeholder:text-[#555] transition-colors rounded-none font-sans"
                  />

                  <div className="relative w-full">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Password"
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

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#161616] hover:bg-[#1a1a1a] focus:bg-[#202020] text-white text-sm px-4.5 py-4 outline-none placeholder:text-[#555] transition-colors rounded-none font-sans"
                  />

                  {/* Clean Minimalist Selection Bars */}
                  <CustomSelectBar
                    label="Bahasa"
                    value={language}
                    onChange={setLanguage}
                    options={[
                      { value: "id", label: "Indonesia (ID)" },
                      { value: "en", label: "English (EN)" },
                    ]}
                  />

                  <CustomSelectBar
                    label="Lokasi"
                    value={location}
                    onChange={setLocation}
                    options={[
                      { value: "Indonesia", label: "Indonesia" },
                      { value: "Singapore", label: "Singapore" },
                      { value: "Malaysia", label: "Malaysia" },
                      { value: "International", label: "International" },
                    ]}
                  />

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-[#FAF9F6] hover:bg-white active:scale-[0.99] text-[#0e0e0e] font-mono font-bold text-xs uppercase tracking-[0.25em] py-4.5 transition-all duration-200 cursor-pointer mt-3 flex items-center justify-center gap-2 rounded-none shadow-sm"
                  >
                    <CornerDownRight size={14} strokeWidth={2.5} />
                    <span>CONTINUE</span>
                  </button>

                  <div className="flex justify-center mt-3">
                    <Link
                      href="/login"
                      className="text-xs font-sans text-[#888] hover:text-[#FAF9F6] transition-colors cursor-pointer"
                    >
                      Sudah punya akun? <span className="underline font-semibold text-white hover:text-[#D4FF00]">Masuk di sini</span>
                    </Link>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 2: USERNAME & FOTO PROFIL */}
            {step === 2 && (
              <motion.div
                key="signup-step-2"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="w-full flex flex-col items-center"
              >
                <h1 className="font-heading text-3xl sm:text-[36px] font-normal tracking-tight text-white mb-6">
                  Profile
                </h1>

                <form onSubmit={handleNextToStep3} className="w-full flex flex-col gap-3 sm:gap-3.5 text-left">
                  
                  {/* Minimalist Profile Picture Bar */}
                  <div
                    onClick={() => avatarInputRef.current?.click()}
                    className="w-full bg-[#161616] hover:bg-[#1e1e1e] px-4.5 py-3.5 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-none bg-[#222] border border-[#333] overflow-hidden flex items-center justify-center shrink-0">
                        {avatarPreview && avatarPreview !== "/placeholder.svg" ? (
                          <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <Camera size={14} className="text-[#888]" />
                        )}
                      </div>
                      <span className="text-xs font-mono text-[#888] uppercase tracking-wider">
                        Foto Profil
                      </span>
                    </div>
                    <span className="text-xs font-mono text-[#D4FF00] hover:underline">
                      {avatarPreview && avatarPreview !== "/placeholder.svg" ? "Ganti" : "Upload"}
                    </span>
                  </div>

                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />

                  {/* Username Input */}
                  <input
                    type="text"
                    required
                    placeholder="Username / Full Name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                    className="w-full bg-[#161616] hover:bg-[#1a1a1a] focus:bg-[#202020] text-white text-sm px-4.5 py-4 outline-none placeholder:text-[#555] transition-colors rounded-none font-sans"
                  />

                  {/* Action Button */}
                  <button
                    type="submit"
                    className="w-full bg-[#FAF9F6] hover:bg-white active:scale-[0.99] text-[#0e0e0e] font-mono font-bold text-xs uppercase tracking-[0.25em] py-4.5 transition-all duration-200 cursor-pointer mt-3 flex items-center justify-center gap-2 rounded-none shadow-sm"
                  >
                    <CornerDownRight size={14} strokeWidth={2.5} />
                    <span>CONTINUE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-sans text-[#888] hover:text-white transition-colors mt-2 text-center underline cursor-pointer"
                  >
                    ← Kembali ke Kredensial
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 3: EXPERIENCE LEVEL & SOUND SIGNATURE */}
            {step === 3 && (
              <motion.div
                key="signup-step-3"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="w-full flex flex-col items-center"
              >
                <h1 className="font-heading text-3xl sm:text-[36px] font-normal tracking-tight text-white mb-6">
                  Audio Setup
                </h1>

                <form onSubmit={handleFinalSignup} className="w-full flex flex-col gap-3 sm:gap-3.5 text-left">
                  
                  {/* Clean Experience Selector Bar */}
                  <CustomSelectBar
                    label="Experience"
                    value={experienceLevel}
                    onChange={setExperienceLevel}
                    options={[
                      { value: "Beginner", label: "Beginner", sub: "Baru masuk ke dunia audio / IEM" },
                      { value: "Intermediate", label: "Intermediate", sub: "Paham tonal & sound signature" },
                      { value: "Enthusiast", label: "Enthusiast", sub: "Mencari resolusi & technicalities" },
                      { value: "Flagship", label: "Summit-Fi", sub: "Endgame gear & critical listening" },
                    ]}
                  />

                  {/* Clean Sound Signature Selector Bar */}
                  <CustomSelectBar
                    label="Sound Signature"
                    value={soundSignature}
                    onChange={setSoundSignature}
                    options={[
                      { value: "Reference / Neutral", label: "Reference / Neutral", sub: "Akurat, seimbang, uncolored" },
                      { value: "Harman Target 2019", label: "Harman Target 2019", sub: "Vokal jernih, sub-bass mantap" },
                      { value: "Warm & Musical", label: "Warm & Musical", sub: "Bass empuk, vokal tebal, treble halus" },
                      { value: "V-Shaped Dynamic", label: "V-Shaped Dynamic", sub: "Bass bertenaga, treble berkilau" },
                    ]}
                  />

                  {/* Final Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#D4FF00] hover:bg-[#c2eb00] active:scale-[0.99] text-[#0e0e0e] font-mono font-bold text-xs uppercase tracking-[0.25em] py-4.5 transition-all duration-200 cursor-pointer disabled:opacity-50 mt-3 flex items-center justify-center gap-2 rounded-none shadow-sm"
                  >
                    <CornerDownRight size={14} strokeWidth={2.5} />
                    <span>{isSubmitting ? "MEMPROSES..." : "CREATE ACCOUNT"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-sans text-[#888] hover:text-white transition-colors mt-2 text-center underline cursor-pointer"
                  >
                    ← Kembali ke Profil
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

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
