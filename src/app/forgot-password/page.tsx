"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { resetPasswordDirect } from "@/app/actions/auth";
import { Eye, EyeOff, CornerDownRight, ArrowLeft, CheckCircle2 } from "lucide-react";

function ForgotPasswordContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage("Kata sandi baru minimal harus 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok. Mohon periksa kembali.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await resetPasswordDirect({
        email,
        newPassword,
        confirmPassword,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal memperbarui kata sandi.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(res.message || "Kata sandi berhasil diperbarui! Mengalihkan ke login...");
      setIsSubmitting(false);

      setTimeout(() => {
        router.push("/login?reset=success");
      }, 1500);
    } catch {
      setErrorMessage("Terjadi kesalahan teknis saat memperbarui kata sandi.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030303] text-[#FAF9F6] font-sans flex flex-col justify-between selection:bg-[#BFDD25] selection:text-[#030303] relative overflow-hidden">
      <Navbar />

      <main className="w-full flex-1 flex flex-col items-center justify-center px-6 py-24 pt-36 z-10">
        <div className="w-full max-w-[380px] mx-auto flex flex-col items-center text-center">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl sm:text-2xl font-sans font-bold tracking-tight text-[#FAF9F6] mb-2">
              Atur Ulang Kata Sandi
            </h1>
            <p className="text-xs text-[#888] font-sans">
              Masukkan email terdaftar dan kata sandi baru untuk akun Anda.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="w-full mb-5 p-3.5 bg-[#120505] text-red-400 text-xs font-sans text-left border-l-2 border-red-500 rounded-r-lg">
              {errorMessage}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="w-full mb-5 p-3.5 bg-[#0a140a] text-[#BFDD25] text-xs font-sans text-left border-l-2 border-[#BFDD25] rounded-r-lg flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-[#BFDD25]" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Reset Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5 sm:gap-4">
            <div>
              <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider text-left mb-1.5">
                Email Terdaftar *
              </label>
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#141414] hover:bg-[#181818] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-white/40 shadow-inner text-white text-sm px-4.5 py-3.5 outline-none placeholder:text-[#666] transition-all rounded-xl font-sans"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider text-left mb-1.5">
                Kata Sandi Baru * (Min. 6 Karakter)
              </label>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#141414] hover:bg-[#181818] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-white/40 shadow-inner text-white text-sm px-4.5 py-3.5 pr-12 outline-none placeholder:text-[#666] transition-all rounded-xl font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#71717A] uppercase tracking-wider text-left mb-1.5">
                Ulangi Kata Sandi Baru *
              </label>
              <div className="relative w-full">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#141414] hover:bg-[#181818] focus:bg-[#1C1C1C] ring-1 ring-white/10 hover:ring-white/20 focus:ring-1 focus:ring-white/40 shadow-inner text-white text-sm px-4.5 py-3.5 pr-12 outline-none placeholder:text-[#666] transition-all rounded-xl font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#BFDD25] hover:bg-[#cbf026] active:scale-[0.99] text-black font-mono font-bold text-xs uppercase tracking-[0.2em] py-3.5 transition-all duration-200 cursor-pointer disabled:opacity-50 mt-3 sm:mt-4 flex items-center justify-center gap-2 rounded-full shadow-lg"
            >
              <CornerDownRight size={14} strokeWidth={2.5} />
              <span>{isSubmitting ? "MEMPROSES..." : "SIMPAN PASSWORD BARU"}</span>
            </button>

            <div className="flex flex-col items-center gap-2.5 mt-5">
              <Link
                href="/login"
                className="text-xs font-sans text-[#888] hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <ArrowLeft size={13} />
                <span>Kembali ke Halaman Masuk</span>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030303]" />}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
