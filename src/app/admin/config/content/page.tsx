"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function ContentConfigPage() {
  const { language } = useLanguage();
  const isEn = language === "English";

  const [policies, setPolicies] = useState({
    autoProfanityFilter: true,
    requireQCForEveryListing: true,
    allowBuyerAudioSamples: true,
    maxListingPhotos: 8,
    prohibitedKeywords: "fake, replica, clone, 1:1, bootleg, kw super",
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
              {isEn ? "Content & Quality Control" : "Konten & Kontrol Kualitas"}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans">
            {isEn ? "Listing Policies & Moderation Rules" : "Aturan Konten & Kebijakan Listing"}
          </h1>
          <p className="text-xs text-[#71717A] font-sans mt-0.5">
            {isEn
              ? "Set marketplace anti-counterfeit filters, maximum upload parameters, and QC moderation thresholds."
              : "Atur filter anti-barang tiruan, batas jumlah foto produk, dan standar kelulusan moderasi listing."}
          </p>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF9F6] hover:bg-[#E5E5E5] text-black text-xs font-sans font-bold rounded-lg transition-all shadow-sm cursor-pointer"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          {isEn ? "Save Policies" : "Simpan Aturan"}
        </button>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-[#141414] border border-[#2A2A2A] text-white text-xs font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {isEn ? "Content policies saved successfully." : "Kebijakan konten berhasil disimpan."}
        </div>
      )}

      {/* Rules Box */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 space-y-4 font-sans text-xs">
        <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
          {isEn ? "Anti-Counterfeit & Listing Protection" : "Perlindungan Anti-Barang Tiruan (KW)"}
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
              {isEn ? "Prohibited Title / Description Keywords (Comma Separated)" : "Kata Kunci Terlarang (Dipisah Koma)"}
            </label>
            <input
              type="text"
              value={policies.prohibitedKeywords}
              onChange={(e) => setPolicies({ ...policies, prohibitedKeywords: e.target.value })}
              className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-white"
            />
            <p className="text-[10px] font-mono text-[#52525B] mt-1">
              Listings containing these terms will be auto-flagged and rejected before public display.
            </p>
          </div>

          <div className="pt-2 border-t border-[#1C1C1C] flex items-center justify-between text-xs font-mono">
            <span className="text-[#A1A1AA]">
              {isEn ? "Mandatory Admin QC Approval for New Products" : "Wajib Uji QC Admin Sebelum Produk Tampil"}
            </span>
            <span className="text-emerald-400 font-bold">Enabled</span>
          </div>
        </div>
      </div>
    </form>
  );
}
