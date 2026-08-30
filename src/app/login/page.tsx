"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { signUpUser, signInUser } from "@/app/actions/auth";
import { Eye, EyeOff, ArrowLeft, Check, Sparkles } from "lucide-react";

function LoginContent({ initialTab = "login" }: { initialTab?: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get("redirect") || "/";
  const { t } = useLanguage();

  const [tab, setTab] = useState<"login" | "signup">(initialTab);
  const [showPassword, setShowPassword] = useState(false);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sign Up Form States
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [selectedTuning, setSelectedTuning] = useState("Reference / Neutral");
  const [isSignupSubmitting, setIsSignupSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoginSubmitting(true);

    try {
      const res = await signInUser({
        email: loginEmail,
        passwordRaw: loginPassword,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Email atau kata sandi tidak cocok.");
        setIsLoginSubmitting(false);
        return;
      }

      localStorage.setItem("tonalzone_user", JSON.stringify(res.user));
      setSuccessMessage("Autentikasi berhasil! Mengalihkan...");
      window.dispatchEvent(new Event("userLoginChange"));

      setTimeout(() => {
        router.push(redirectUrl);
      }, 350);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat masuk.";
      setErrorMessage(msg);
      setIsLoginSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSignupSubmitting(true);

    try {
      const res = await signUpUser({
        fullName,
        email: signupEmail,
        passwordRaw: signupPassword,
        location: "Indonesia",
        language: "id",
        tuningPreference: selectedTuning,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal mendaftar. Silakan periksa data Anda.");
        setIsSignupSubmitting(false);
        return;
      }

      localStorage.setItem("tonalzone_user", JSON.stringify(res.user));
      setSuccessMessage("Akun berhasil dibuat! Mengalihkan...");
      window.dispatchEvent(new Event("userLoginChange"));

      setTimeout(() => {
        router.push(redirectUrl);
      }, 350);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat mendaftar.";
      setErrorMessage(msg);
      setIsSignupSubmitting(false);
    }
  };

  const handleDemoLogin = (role: "buyer" | "seller") => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const userObj = role === "seller"
      ? {
          name: "Soundstage ID",
          email: "seller@soundstage.id",
          avatar: "/placeholder.svg",
          role: "SELLER",
          isSeller: true,
          sellerStatus: "APPROVED",
          tuning: "Harman Target 2019",
          gear: "Topping DX7 Pro+",
        }
      : {
          name: "Alex Rivera",
          email: "alex.rivera@audiophile.io",
          avatar: "/placeholder.svg",
          role: "VIP AUDIOPHILE",
          isSeller: false,
          tuning: "Reference / Neutral",
          gear: "Moondrop Dawn Pro",
        };

    localStorage.setItem("tonalzone_user", JSON.stringify(userObj));
    setSuccessMessage(`Masuk sebagai ${role === "seller" ? "Seller Store" : "Audiophile Member"}! Mengalihkan...`);
    window.dispatchEvent(new Event("userLoginChange"));

    setTimeout(() => {
      router.push(role === "seller" ? "/seller" : redirectUrl);
    }, 350);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-[#FAF9F6] font-sans flex flex-col lg:flex-row selection:bg-[#D4FF00] selection:text-[#0a0a0a]">
      {/* LEFT PANEL: Editorial Brand Showcase */}
      <div className="w-full lg:w-[48%] bg-[#0e0e0e] p-8 sm:p-12 lg:p-20 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#1a1a1a]">
        {/* Subtle Ambient Depth */}
        <div className="absolute top-0 left-0 w-full h-full bg-radial from-[#D4FF00]/[0.03] via-transparent to-transparent pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 flex items-center justify-center">
              <Image
                src="/logo.svg"
                alt="Tonalzone Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain group-hover:rotate-90 transition-transform duration-500"
              />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight text-white">
              Tonalzone
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#888] hover:text-[#D4FF00] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>{t("nav.home")}</span>
          </Link>
        </div>

        {/* Center Editorial Focus */}
        <div className="relative z-10 py-16 lg:py-0 max-w-lg">
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#D4FF00] block mb-4 font-semibold">
            Audiophile Hub // Access Gateway
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08] mb-6">
            Presisi Akustik.<br />Kurasi Terpercaya.
          </h1>
          <p className="text-[#888] text-sm sm:text-base leading-relaxed font-sans mb-8">
            Masuk untuk mengakses koleksi gear audio pribadi Anda, membandingkan kurva frekuensi Squiglink, dan mengelola transaksi terverifikasi.
          </p>

          <div className="grid grid-cols-2 gap-6 pt-8 border-t border-[#1a1a1a]">
            <div>
              <p className="font-mono text-xs text-[#888] uppercase tracking-wider mb-1">Verifikasi Toko</p>
              <p className="font-sans text-sm font-semibold text-white">100% Original & Bergaransi</p>
            </div>
            <div>
              <p className="font-mono text-xs text-[#888] uppercase tracking-wider mb-1">Database IEM</p>
              <p className="font-sans text-sm font-semibold text-white">500+ Grafik Respon Frekuensi</p>
            </div>
          </div>
        </div>

        {/* Bottom System Tag */}
        <div className="relative z-10 hidden lg:flex items-center justify-between text-[11px] font-mono text-[#555] uppercase tracking-widest pt-6 border-t border-[#1a1a1a]">
          <span>TONALZONE CORE PLATFORM</span>
          <span>SYSTEM // v2.4</span>
        </div>
      </div>

      {/* RIGHT PANEL: Crisp UX-Focused Form */}
      <div className="w-full lg:w-[52%] bg-[#0a0a0a] p-6 sm:p-12 lg:p-20 flex flex-col justify-center items-center">
        <div className="w-full max-w-md my-auto">
          {/* Sharp Tab Navigation */}
          <div className="flex border-b border-[#222] mb-8 w-full">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-4 text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer text-center relative ${
                tab === "login"
                  ? "text-white"
                  : "text-[#666] hover:text-[#999]"
              }`}
            >
              <span>{t("auth.login")}</span>
              {tab === "login" && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#D4FF00]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setTab("signup");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-4 text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer text-center relative ${
                tab === "signup"
                  ? "text-white"
                  : "text-[#666] hover:text-[#999]"
              }`}
            >
              <span>{t("auth.createAccount")}</span>
              {tab === "signup" && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#D4FF00]" />
              )}
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-[#141414] border-l-2 border-red-500 text-red-300 text-xs font-sans leading-relaxed">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-[#141414] border-l-2 border-[#D4FF00] text-[#D4FF00] text-xs font-mono leading-relaxed">
              {successMessage}
            </div>
          )}

          {tab === "login" ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-widest text-[#888] font-semibold">
                  {t("auth.email")}
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex.rivera@audiophile.io"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-[#141414] hover:bg-[#181818] focus:bg-[#1c1c1c] text-white text-sm px-4 py-3.5 outline-none placeholder:text-[#444] transition-colors border-b border-[#222] focus:border-[#D4FF00]"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-[#888] font-semibold">
                    {t("auth.password")}
                  </label>
                  <button
                    type="button"
                    onClick={() => setSuccessMessage("Tautan reset kata sandi dikirim jika email terdaftar.")}
                    className="text-[11px] font-mono text-[#666] hover:text-[#FAF9F6] transition-colors cursor-pointer"
                  >
                    {t("auth.forgotPassword")}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-[#141414] hover:bg-[#181818] focus:bg-[#1c1c1c] text-white text-sm px-4 py-3.5 pr-11 outline-none placeholder:text-[#444] transition-colors border-b border-[#222] focus:border-[#D4FF00] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-none bg-[#141414] border-[#333] accent-[#D4FF00] cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs text-[#888] cursor-pointer select-none">
                  {t("auth.rememberMe")}
                </label>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={isLoginSubmitting}
                className="w-full bg-[#D4FF00] hover:bg-[#c6f000] active:scale-[0.99] text-[#0e0e0e] font-mono font-bold text-xs uppercase tracking-[0.25em] py-4 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-3 shadow-lg"
              >
                {isLoginSubmitting ? "MEMVERIFIKASI..." : t("auth.login")}
              </button>

              {/* Instant One-Click Demo Access */}
              <div className="pt-6 border-t border-[#1a1a1a] space-y-3">
                <p className="text-[10px] font-mono text-[#555] uppercase tracking-widest text-center">
                  Akses Cepat Pengujian (1-Klik)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("buyer")}
                    className="bg-[#141414] hover:bg-[#1c1c1c] active:scale-[0.98] text-[#FAF9F6] text-xs font-mono py-3 px-3 transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={13} className="text-[#D4FF00]" />
                    <span>Demo Buyer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin("seller")}
                    className="bg-[#141414] hover:bg-[#1c1c1c] active:scale-[0.98] text-[#FAF9F6] text-xs font-mono py-3 px-3 transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={13} className="text-emerald-400" />
                    <span>Demo Seller</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* SIGNUP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-widest text-[#888] font-semibold">
                  {t("auth.name")}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Alex Rivera"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#141414] hover:bg-[#181818] focus:bg-[#1c1c1c] text-white text-sm px-4 py-3 outline-none placeholder:text-[#444] transition-colors border-b border-[#222] focus:border-[#D4FF00]"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-widest text-[#888] font-semibold">
                  {t("auth.email")}
                </label>
                <input
                  type="email"
                  required
                  placeholder="alex.rivera@audiophile.io"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full bg-[#141414] hover:bg-[#181818] focus:bg-[#1c1c1c] text-white text-sm px-4 py-3 outline-none placeholder:text-[#444] transition-colors border-b border-[#222] focus:border-[#D4FF00]"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-widest text-[#888] font-semibold">
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min. 8 karakter"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full bg-[#141414] hover:bg-[#181818] focus:bg-[#1c1c1c] text-white text-sm px-4 py-3 pr-11 outline-none placeholder:text-[#444] transition-colors border-b border-[#222] focus:border-[#D4FF00] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Tuning Target Preference */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-widest text-[#888] font-semibold">
                  {t("auth.soundProfile")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Reference / Neutral", "Harman Target 2019", "V-Shaped Warm", "Basshead Dynamic"].map((tuning) => (
                    <button
                      key={tuning}
                      type="button"
                      onClick={() => setSelectedTuning(tuning)}
                      className={`text-left p-2.5 text-xs font-mono transition-all cursor-pointer border ${
                        selectedTuning === tuning
                          ? "border-[#D4FF00] bg-[#D4FF00]/10 text-white"
                          : "border-[#1a1a1a] bg-[#141414] text-[#888] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{tuning}</span>
                        {selectedTuning === tuning && <Check size={12} className="text-[#D4FF00] shrink-0" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSignupSubmitting}
                className="w-full bg-[#D4FF00] hover:bg-[#c6f000] active:scale-[0.99] text-[#0e0e0e] font-mono font-bold text-xs uppercase tracking-[0.25em] py-4 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg"
              >
                {isSignupSubmitting ? "MEMPROSES PENDAFTARAN..." : t("auth.createAccount")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage({ initialTab = "login" }: { initialTab?: "login" | "signup" }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center font-mono text-xs uppercase tracking-widest text-[#888]">
          Memuat Autentikasi...
        </div>
      }
    >
      <LoginContent initialTab={initialTab} />
    </Suspense>
  );
}
