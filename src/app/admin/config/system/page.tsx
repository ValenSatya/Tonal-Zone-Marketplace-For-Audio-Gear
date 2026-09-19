"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAdminData } from "@/context/AdminDataContext";
import CustomSelect from "@/components/ui/custom-select";

export default function SystemSettingsPage() {
  const { language } = useLanguage();
  const isEn = language === "English";
  const { systemSettings, updateSystemSettings } = useAdminData();

  const [settings, setSettings] = useState(systemSettings);

  useEffect(() => {
    if (systemSettings) {
      setSettings(systemSettings);
    }
  }, [systemSettings]);

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 text-[#FAF9F6] selection:bg-[#BFDD25] selection:text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold bg-[#141414] text-[#BFDD25] px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BFDD25] shadow-[0_0_6px_rgba(191,221,37,0.8)]" />
              {isEn ? "Platform Core" : "Konfigurasi Inti"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
            {isEn ? "System & Escrow Gateway Settings" : "Pengaturan Sistem & Payment Gateway"}
          </h1>
          <p className="text-xs text-[#888888] font-sans mt-1">
            {isEn
              ? "Configure marketplace escrow fee percentages, 2x24h inspection parameters, and payment gateway connectivity."
              : "Kelola potongan fee transaksi marketplace, masa garansi rekber 2x24 jam, dan integrasi Midtrans."}
          </p>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#BFDD25] hover:bg-[#aecd20] text-black text-xs font-mono font-bold rounded-full transition-all shadow-[0_0_14px_rgba(191,221,37,0.3)] cursor-pointer w-fit shrink-0"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          {isEn ? "Save System Config" : "Simpan Pengaturan"}
        </button>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-[#0A0A0A] text-white text-xs font-mono flex items-center gap-2.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#BFDD25] shadow-[0_0_8px_rgba(191,221,37,0.8)]" />
          {isEn ? "System configuration saved successfully." : "Konfigurasi sistem berhasil disimpan."}
        </div>
      )}

      {/* Configuration Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Escrow & Marketplace Platform Parameters */}
        <div className="bg-[#0A0A0A] rounded-2xl p-6 space-y-5 font-sans text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#BFDD25] shadow-[0_0_6px_rgba(191,221,37,0.8)]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              {isEn ? "1. Escrow & Inspection Rules" : "1. Parameter Rekening Bersama (Escrow)"}
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-[#888888] uppercase tracking-wider mb-1.5">
                {isEn ? "Marketplace Service Fee (%)" : "Biaya Layanan Rekber (%)"}
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.escrowFeePercent}
                onChange={(e) => setSettings({ ...settings, escrowFeePercent: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#141414] focus:bg-[#181818] rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none focus:ring-1 focus:ring-[#BFDD25] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#888888] uppercase tracking-wider mb-1.5">
                {isEn ? "Acoustic Inspection Window (Hours)" : "Masa Uji Coba Suara Pembeli (Jam)"}
              </label>
              <input
                type="number"
                value={settings.inspectionWindowHours}
                onChange={(e) => setSettings({ ...settings, inspectionWindowHours: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-[#141414] focus:bg-[#181818] rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none focus:ring-1 focus:ring-[#BFDD25] transition-all"
              />
              <p className="text-[10px] font-mono text-[#666666] mt-1.5">
                Standard: 48 Hours (2x24 Jam) for IEM listening test & seal verification.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Payment Gateway & Security */}
        <div className="bg-[#0A0A0A] rounded-2xl p-6 space-y-5 font-sans text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#BFDD25] shadow-[0_0_6px_rgba(191,221,37,0.8)]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              {isEn ? "2. Gateway & Security Environment" : "2. Payment Gateway & Keamanan"}
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-[#888888] uppercase tracking-wider mb-1.5">
                {isEn ? "Active Payment Gateway" : "Payment Gateway Aktif"}
              </label>
              <CustomSelect
                value={settings.paymentGateway}
                onChange={(val) => setSettings({ ...settings, paymentGateway: val })}
                options={[
                  { label: "Midtrans Snap (QRIS, BCA VA, Mandiri, Card)", value: "Midtrans (Snap Enterprise)" },
                  { label: "Xendit Multi-Rail VA", value: "Xendit Multi-Rail" },
                  { label: "Stripe International Checkout", value: "Stripe International" },
                ]}
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#888888] uppercase tracking-wider mb-1.5">
                {isEn ? "Security Ops Alert Email" : "Email Notifikasi Keamanan"}
              </label>
              <input
                type="email"
                value={settings.adminNotificationEmail}
                onChange={(e) => setSettings({ ...settings, adminNotificationEmail: e.target.value })}
                className="w-full bg-[#141414] focus:bg-[#181818] rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none focus:ring-1 focus:ring-[#BFDD25] transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
