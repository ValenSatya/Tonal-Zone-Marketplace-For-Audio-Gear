"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { signUpUser, signInUser } from "@/app/actions/auth";
import { Eye, EyeOff, CornerDownRight, Sparkles } from "lucide-react";

function LoginContent({ initialTab = "login" }: { initialTab?: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get("redirect") || "/";
  const { t } = useLanguage();

  const [tab, setTab] = useState<"login" | "signup">(initialTab);
  const [showPassword, setShowPassword] = useState(false);

  // Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [selectedTuning, setSelectedTuning] = useState("Reference / Neutral");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const res = await signInUser({
        email: loginEmail,
        passwordRaw: loginPassword,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Email atau kata sandi tidak cocok.");
        setIsSubmitting(false);
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
      setIsSubmitting(false);
    }
  };

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
        location: "Indonesia",
        language: "id",
        tuningPreference: selectedTuning,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal mendaftar. Silakan periksa data Anda.");
        setIsSubmitting(false);
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
      setIsSubmitting(false);
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
        tuning: "Harman Target 2019",
        gear: "Moondrop Blessing 3",
      };
      localStorage.setItem("tonalzone_user", JSON.stringify(userObj));
      setSuccessMessage("Autentikasi Google berhasil! Mengalihkan...");
      window.dispatchEvent(new Event("userLoginChange"));

      setTimeout(() => {
        router.push(redirectUrl);
      }, 400);
    }, 600);
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
    <div className="min-h-screen w-full bg-[#0a0a0a] text-[#FAF9F6] font-sans flex flex-col justify-between selection:bg-[#D4FF00] selection:text-[#0a0a0a] relative overflow-hidden">
      
      {/* 1. AUTHENTIC TONALZONE NAVBAR */}
      <Navbar />

      {/* 2. CENTER ULTRA-MINIMALIST AUTH CORE */}
      <main className="w-full flex-1 flex flex-col items-center justify-center px-6 py-24 pt-36 z-10">
        <div className="w-full max-w-[380px] mx-auto flex flex-col items-center text-center">
          
          {/* Main Title */}
          <h1 className="font-heading text-4xl sm:text-[44px] font-medium tracking-tight text-white mb-8">
            {tab === "login" ? "Sign in" : "Sign up"}
          </h1>

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

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isSubmitting}
            className="w-full bg-[#161616] hover:bg-[#202020] active:scale-[0.99] text-white py-3.5 px-4 text-xs font-mono font-semibold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors cursor-pointer mb-5 disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24Z" />
              <path fill="#FBBC05" d="M5.28 14.27a7.2 7.2 0 0 1 0-4.54V6.58H1.25a11.96 11.96 0 0 0 0 10.84l4.03-3.15Z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93Z" />
            </svg>
            <span>{tab === "login" ? "Masuk dengan Google" : "Daftar dengan Google"}</span>
          </button>

          {/* Minimal Divider */}
          <div className="w-full flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#1f1f1f]" />
            <span className="text-[10px] font-mono text-[#555] uppercase tracking-widest">atau</span>
            <div className="flex-1 h-px bg-[#1f1f1f]" />
          </div>

          {tab === "login" ? (
            /* LOGIN FORM STACK */
            <form onSubmit={handleLoginSubmit} className="w-full flex flex-col gap-2">
              <input
                type="email"
                required
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-[#161616] hover:bg-[#1a1a1a] focus:bg-[#202020] text-white text-sm px-4 py-3.5 outline-none placeholder:text-[#555] transition-colors rounded-none font-sans"
              />

              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#161616] hover:bg-[#1a1a1a] focus:bg-[#202020] text-white text-sm px-4 py-3.5 pr-11 outline-none placeholder:text-[#555] transition-colors rounded-none font-sans"
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

              {/* Submit Button with Corner Arrow Indicator */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#FAF9F6] hover:bg-white active:scale-[0.99] text-[#0e0e0e] font-mono font-bold text-xs uppercase tracking-[0.25em] py-4 transition-all duration-200 cursor-pointer disabled:opacity-50 mt-1 flex items-center justify-center gap-2 rounded-none"
              >
                <CornerDownRight size={14} strokeWidth={2.5} />
                <span>{isSubmitting ? "MEMPROSES..." : "SIGN IN"}</span>
              </button>

              {/* Forgot Password & Switch to Signup Links */}
              <div className="flex flex-col items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setSuccessMessage("Tautan pemulihan kata sandi telah dikirim ke email Anda.")}
                  className="text-xs font-sans text-[#666] hover:text-[#FAF9F6] transition-colors underline cursor-pointer"
                >
                  I can't remember my password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab("signup");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs font-sans text-[#888] hover:text-[#D4FF00] transition-colors cursor-pointer"
                >
                  Belum punya akun? <span className="underline font-semibold">Daftar sekarang</span>
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM STACK */
            <form onSubmit={handleSignupSubmit} className="w-full flex flex-col gap-2">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#161616] hover:bg-[#1a1a1a] focus:bg-[#202020] text-white text-sm px-4 py-3.5 outline-none placeholder:text-[#555] transition-colors rounded-none font-sans"
              />

              <input
                type="email"
                required
                placeholder="Email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full bg-[#161616] hover:bg-[#1a1a1a] focus:bg-[#202020] text-white text-sm px-4 py-3.5 outline-none placeholder:text-[#555] transition-colors rounded-none font-sans"
              />

              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Create Password (min. 8 characters)"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full bg-[#161616] hover:bg-[#1a1a1a] focus:bg-[#202020] text-white text-sm px-4 py-3.5 pr-11 outline-none placeholder:text-[#555] transition-colors rounded-none font-sans"
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

              {/* Submit Button with Corner Arrow Indicator */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#D4FF00] hover:bg-[#c2eb00] active:scale-[0.99] text-[#0e0e0e] font-mono font-bold text-xs uppercase tracking-[0.25em] py-4 transition-all duration-200 cursor-pointer disabled:opacity-50 mt-1 flex items-center justify-center gap-2 rounded-none"
              >
                <CornerDownRight size={14} strokeWidth={2.5} />
                <span>{isSubmitting ? "MEMPROSES..." : "SIGN UP"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab("login");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-xs font-sans text-[#888] hover:text-[#FAF9F6] transition-colors mt-4 cursor-pointer"
              >
                Sudah punya akun? <span className="underline font-semibold">Masuk di sini</span>
              </button>
            </form>
          )}

          {/* Demo Quick Access */}
          <div className="w-full pt-8 mt-6 border-t border-[#181818] flex items-center justify-center gap-3">
            <span className="text-[10px] font-mono text-[#555] uppercase tracking-wider">Demo Access:</span>
            <button
              type="button"
              onClick={() => handleDemoLogin("buyer")}
              className="text-[11px] font-mono text-[#888] hover:text-[#D4FF00] transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles size={11} className="text-[#D4FF00]" />
              <span>Buyer</span>
            </button>
            <span className="text-[#333]">/</span>
            <button
              type="button"
              onClick={() => handleDemoLogin("seller")}
              className="text-[11px] font-mono text-[#888] hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles size={11} className="text-emerald-400" />
              <span>Seller</span>
            </button>
          </div>

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
