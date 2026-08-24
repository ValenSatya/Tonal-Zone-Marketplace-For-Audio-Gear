"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { signUpUser, signInUser } from "@/app/actions/auth";
import { motion, AnimatePresence } from "framer-motion";
import PixelBlast from "@/components/PixelBlast";

function LoginContent({ initialTab = "login" }: { initialTab?: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get("redirect") || "/";
  const { t } = useLanguage();
  const [tab, setTab] = useState<"login" | "signup">(initialTab);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sign Up Stepping States
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("Indonesia");
  const [language, setLanguage] = useState("id");
  const [selectedTuning, setSelectedTuning] = useState("Reference / Neutral");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completeAuthAndRedirect = async (skipBackend = false) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!skipBackend && email && password) {
      setIsSubmitting(true);
      try {
        const res = await signUpUser({
          fullName,
          email,
          passwordRaw: password,
          location,
          language,
          tuningPreference: selectedTuning,
        });

        if (!res.success) {
          setErrorMessage(res.error || "Gagal mendaftar. Silakan periksa data Anda.");
          setIsSubmitting(false);
          return;
        }

        // Success
        localStorage.setItem("tonalzone_user", JSON.stringify(res.user));
        setSuccessMessage("Akun berhasil dibuat! Mengalihkan...");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat mendaftar.";
        setErrorMessage(msg);
        setIsSubmitting(false);
        return;
      }
    } else {
      const userObj = {
        name: fullName.trim() || "Alex Rivera",
        email: email.trim() || "alex.rivera@audiophile.io",
        avatar: "/placeholder.svg",
        role: "VIP AUDIOPHILE",
        tuning: selectedTuning,
        gear: "Dedicated DAC/AMP",
      };
      localStorage.setItem("tonalzone_user", JSON.stringify(userObj));
    }

    window.dispatchEvent(new Event("userLoginChange"));
    setTimeout(() => {
      router.push(redirectUrl);
    }, 250);
  };

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

      // Success
      localStorage.setItem("tonalzone_user", JSON.stringify(res.user));
      setSuccessMessage("Login berhasil! Mengalihkan...");
      window.dispatchEvent(new Event("userLoginChange"));

      setTimeout(() => {
        router.push(redirectUrl);
      }, 250);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan koneksi saat login.";
      setErrorMessage(msg);
      setIsLoginSubmitting(false);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email || !password) {
      setErrorMessage("Email dan kata sandi wajib diisi.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Kata sandi minimal 6 karakter.");
      return;
    }
    setStep(2);
  };

  return (
    <div className="w-full h-screen bg-[#0a0a0a] text-[#FAF9F6] font-sans selection:bg-[#D4FF00] selection:text-[#0e0e0e] flex flex-col lg:flex-row overflow-hidden relative">

      {/* 60% LEFT SIDE: ULTRA-CLEAN, MINIMAL & BREATHABLE */}
      <div className="w-full lg:w-[60%] h-1/3 lg:h-full bg-[#FAF9F6] relative overflow-hidden flex flex-col justify-between p-8 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-[#1a1a1a]">

        {/* PixelBlast Interactive Background */}
        <div className="absolute inset-x-0 bottom-0 top-32 z-0 bg-[#FAF9F6] [mask-image:linear-gradient(to_bottom,transparent,black_15%)]">
          <PixelBlast
            variant="square"
            pixelSize={3}
            color="#353839"
            patternScale={3}
            patternDensity={0.65}
            pixelSizeJitter={0.5}
            enableRipples={true}
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.5}
            liquid={false}
            liquidStrength={0.12}
            liquidRadius={1.2}
            liquidWobbleSpeed={5}
            speed={0.6}
            edgeFade={0.25}
            transparent={true}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Top Content */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-8 w-full">
          <div className="pointer-events-none">
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#0e0e0e] leading-[1.1] mb-2">
              Precision Acoustics.
            </h1>
            <p className="font-sans text-xs text-[#0e0e0e]/60 leading-relaxed max-w-xs hidden sm:block">
              Curated gear for discerning listeners.
            </p>
          </div>

          <Link
            href="/"
            className="text-xs font-mono text-[#0e0e0e]/40 hover:text-[#0e0e0e] uppercase tracking-wider flex items-center gap-2 transition-colors shrink-0 mt-2 sm:mt-0"
          >
            <span>←</span>
            <span>Back to store</span>
          </Link>
        </div>

        <div className="relative z-10 hidden lg:block" />
      </div>

      {/* 40% RIGHT SIDE: CLEAN Obsidian Form Panel */}
      <div className="w-full lg:w-[40%] h-2/3 lg:h-full bg-[#111111] p-8 sm:p-14 lg:p-20 flex flex-col justify-center relative z-10 overflow-y-auto no-scrollbar">

        <div className="max-w-sm w-full mx-auto flex flex-col justify-center my-auto">

          {/* Simple Clean Tab Selector */}
          <div className="flex bg-transparent border-b border-[#222] mb-8 shrink-0">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setStep(1);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-3.5 text-xs font-medium transition-all cursor-pointer relative ${
                tab === "login" ? "text-white" : "text-[#FAF9F6]/50 hover:text-[#FAF9F6]/80"
              }`}
            >
              {tab === "login" && (
                <motion.div
                  layoutId="authTabModal"
                  className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#D4FF00]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="font-mono font-bold uppercase tracking-widest">Log In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTab("signup");
                setStep(1);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-3.5 text-xs font-medium transition-all cursor-pointer relative ${
                tab === "signup" ? "text-white" : "text-[#FAF9F6]/50 hover:text-[#FAF9F6]/80"
              }`}
            >
              {tab === "signup" && (
                <motion.div
                  layoutId="authTabModal"
                  className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#D4FF00]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="font-mono font-bold uppercase tracking-widest">Sign Up</span>
            </button>
          </div>

          {/* Inline Alert / Feedback Badge */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-5 p-3 rounded-xl bg-[#1c1c1c] border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 shrink-0" />
                <span className="leading-relaxed font-sans">{errorMessage}</span>
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-5 p-3 rounded-xl bg-[#1c1c1c] border border-[#D4FF00]/40 text-[#D4FF00] text-xs flex items-start gap-2.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] mt-1 shrink-0" />
                <span className="leading-relaxed font-mono">{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {tab === "login" ? (
              /* LOGIN TAB FORM */
              <motion.form
                key="login-form-clean"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50 font-semibold">
                    {t("auth.email")}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-[#161616] border border-[#262626] focus:border-[#D4FF00] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#FAF9F6]/20 outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono uppercase tracking-widest text-[#FAF9F6]/50 font-semibold">
                      {t("auth.password")}
                    </label>
                    <button
                      type="button"
                      onClick={() => setSuccessMessage("Tautan reset kata sandi telah dikirim ke email Anda.")}
                      className="text-xs text-[#FAF9F6]/50 hover:text-white transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-[#161616] border border-[#262626] focus:border-[#D4FF00] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#FAF9F6]/20 outline-none transition-colors font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1 pb-2">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#333] bg-[#161616] text-[#D4FF00] focus:ring-0 cursor-pointer accent-[#D4FF00]"
                  />
                  <label htmlFor="remember-me" className="text-xs text-[#FAF9F6]/50 cursor-pointer select-none">
                    Remember me for 30 days
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoginSubmitting}
                  className="w-full py-3.5 bg-white hover:bg-[#D4FF00] text-[#0e0e0e] font-mono font-bold text-xs uppercase tracking-[0.2em] rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoginSubmitting ? "AUTHENTICATING..." : t("auth.signIn") + " →"}
                </button>
              </motion.form>
            ) : (
              /* SIGN UP TAB FORM */
              <motion.div
                key="signup-form-clean"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#222]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4FF00] font-bold block">
                      {t("auth.step1Of2")}
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      {step === 1 ? t("auth.createAccount") : t("auth.personalizeProfile")}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => completeAuthAndRedirect(true)}
                    className="text-xs text-[#FAF9F6]/60 hover:text-white underline cursor-pointer"
                  >
                    {t("auth.skipForNow")}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.form
                      key="step-1-clean"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      onSubmit={handleStep1Submit}
                      className="space-y-3"
                    >
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-[#FAF9F6]/80">
                          {t("auth.fullName")}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Alex Rivera"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-[#161616] border border-[#262626] focus:border-[#D4FF00] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#FAF9F6]/30 outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-[#FAF9F6]/80">
                          {t("auth.email")}
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#161616] border border-[#262626] focus:border-[#D4FF00] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#FAF9F6]/30 outline-none transition-colors"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-[#FAF9F6]/80">
                          {t("auth.password")}
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="Create a password (min. 6 chars)"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-[#161616] border border-[#262626] focus:border-[#D4FF00] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#FAF9F6]/30 outline-none transition-colors font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-[#FAF9F6]/80">
                            Location
                          </label>
                          <select
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full bg-[#161616] border border-[#262626] focus:border-[#D4FF00] rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors appearance-none cursor-pointer"
                          >
                            <option value="Indonesia">Indonesia</option>
                            <option value="Singapore">Singapore</option>
                            <option value="Malaysia">Malaysia</option>
                            <option value="United States">United States</option>
                            <option value="Japan">Japan</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-[#FAF9F6]/80">
                            Language
                          </label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full bg-[#161616] border border-[#262626] focus:border-[#D4FF00] rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors appearance-none cursor-pointer"
                          >
                            <option value="id">Bahasa Indonesia</option>
                            <option value="en">English</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 mt-1 bg-[#D4FF00] hover:bg-white text-[#0e0e0e] font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                      >
                        {t("auth.continueToStep2")}
                      </button>
                    </motion.form>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step-2-clean"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3"
                    >
                      <p className="text-xs text-[#FAF9F6]/70 leading-relaxed">
                        {t("auth.optionalTuning")}
                      </p>

                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { name: "Reference / Neutral", desc: "Flat studio monitor response" },
                          { name: "Basshead (V-Shape)", desc: "Elevated sub-bass slam & punch" },
                          { name: "Vocal & Mid Focus", desc: "Intimate organic vocal rendering" },
                          { name: "Treble & Soundstage", desc: "Airy details & holographic depth" },
                        ].map((opt) => {
                          const isSel = selectedTuning === opt.name;
                          return (
                            <button
                              key={opt.name}
                              type="button"
                              onClick={() => setSelectedTuning(opt.name)}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                                isSel
                                  ? "bg-[#222] border-[#D4FF00] text-white shadow-sm"
                                  : "bg-[#161616] border-[#262626] text-[#FAF9F6]/70 hover:border-[#444]"
                              }`}
                            >
                              <div>
                                <span className="text-xs font-bold block">{opt.name}</span>
                                <span className="text-[10px] text-[#FAF9F6]/50 block">{opt.desc}</span>
                              </div>
                              {isSel && (
                                <span className="text-[#D4FF00] font-bold text-xs">✓</span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="px-4 py-2.5 bg-[#181818] hover:bg-[#333] border border-[#2b2b2b] rounded-xl text-xs text-white cursor-pointer"
                        >
                          {t("auth.back")}
                        </button>
                        <button
                          type="button"
                          onClick={() => completeAuthAndRedirect(false)}
                          disabled={isSubmitting}
                          className="flex-1 py-3 bg-[#D4FF00] hover:bg-white text-[#0e0e0e] font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isSubmitting ? "CREATING..." : t("auth.completeSignUp")}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 pt-4 border-t border-[#222] text-center text-xs text-[#FAF9F6]/50">
            {tab === "login" ? (
              <>
                {t("auth.noAccount")}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setTab("signup");
                    setStep(1);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-white font-bold hover:underline cursor-pointer transition-colors"
                >
                  {t("auth.signUpHere")}
                </button>
              </>
            ) : (
              <>
                {t("auth.hasAccount")}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setTab("login");
                    setStep(1);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-white font-bold hover:underline cursor-pointer transition-colors"
                >
                  {t("auth.loginHere")}
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage({ initialTab = "login" }: { initialTab?: "login" | "signup" }) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white font-mono text-xs">
          Loading Authentication...
        </div>
      }
    >
      <LoginContent initialTab={initialTab} />
    </React.Suspense>
  );
}
