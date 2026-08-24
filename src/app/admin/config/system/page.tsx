"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import CustomSelect from "@/components/ui/custom-select";

export default function SystemSettingsPage() {
  const { language } = useLanguage();
  const isEn = language === "English";

  const [settings, setSettings] = useState({
    escrowFeePercent: 1.5,
    inspectionWindowHours: 48,
    paymentGateway: "Midtrans (Snap Enterprise)",
    environment: "Production (Live)",
    autoDisburseEscrow: true,
    maintenanceMode: false,
    adminNotificationEmail: "security-ops@tonalzone.id",
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 text-[#FAF9F6] selection:bg-white selection:text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-medium bg-[#141414] text-[#A1A1AA] border border-[#27272A] px-2 py-0.5 rounded uppercase tracking-wider">
              {isEn ? "Platform Core" : "Konfigurasi Inti"}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans">
            {isEn ? "System & Escrow Gateway Settings" : "Pengaturan Sistem & Payment Gateway"}
          </h1>
          <p className="text-xs text-[#71717A] font-sans mt-0.5">
            {isEn
              ? "Configure marketplace escrow fee percentages, 2x24h inspection parameters, and payment gateway connectivity."
              : "Kelola potongan fee transaksi marketplace, masa garansi rekber 2x24 jam, dan integrasi Midtrans."}
          </p>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF9F6] hover:bg-[#E5E5E5] text-black text-xs font-sans font-bold rounded-lg transition-all shadow-sm cursor-pointer"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          {isEn ? "Save System Config" : "Simpan Pengaturan"}
        </button>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-[#141414] border border-[#2A2A2A] text-white text-xs font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {isEn ? "System configuration saved successfully." : "Konfigurasi sistem berhasil disimpan."}
        </div>
      )}

      {/* Configuration Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Escrow & Marketplace Platform Parameters */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 space-y-4 font-sans text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-[#1E1E1E]">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {isEn ? "1. Escrow & Inspection Rules" : "1. Parameter Rekening Bersama (Escrow)"}
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                {isEn ? "Marketplace Service Fee (%)" : "Biaya Layanan Rekber (%)"}
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.escrowFeePercent}
                onChange={(e) => setSettings({ ...settings, escrowFeePercent: parseFloat(e.target.value) || 0 })}
                className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                {isEn ? "Acoustic Inspection Window (Hours)" : "Masa Uji Coba Suara Pembeli (Jam)"}
              </label>
              <input
                type="number"
                value={settings.inspectionWindowHours}
                onChange={(e) => setSettings({ ...settings, inspectionWindowHours: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-white"
              />
              <p className="text-[10px] font-mono text-[#52525B] mt-1">
                Standard: 48 Hours (2x24 Jam) for IEM listening test & seal verification.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Payment Gateway & Security */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 space-y-4 font-sans text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-[#1E1E1E]">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {isEn ? "2. Gateway & Security Environment" : "2. Payment Gateway & Keamanan"}
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
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
              <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                {isEn ? "Security Ops Alert Email" : "Email Notifikasi Keamanan"}
              </label>
              <input
                type="email"
                value={settings.adminNotificationEmail}
                onChange={(e) => setSettings({ ...settings, adminNotificationEmail: e.target.value })}
                className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-white"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
