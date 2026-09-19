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
    <form onSubmit={handleSave} className="space-y-6 text-[#FAF9F6] selection:bg-[#BFDD25] selection:text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold bg-[#141414] text-[#BFDD25] px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#BFDD25] shadow-[0_0_6px_rgba(191,221,37,0.8)]" />
              {isEn ? "Content & Quality Control" : "Konten & Kontrol Kualitas"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
            {isEn ? "Listing Policies & Moderation Rules" : "Aturan Konten & Kebijakan Listing"}
          </h1>
          <p className="text-xs text-[#888888] font-sans mt-1">
            {isEn
              ? "Set marketplace anti-counterfeit filters, maximum upload parameters, and QC moderation thresholds."
              : "Atur filter anti-barang tiruan, batas jumlah foto produk, dan standar kelulusan moderasi listing."}
          </p>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#BFDD25] hover:bg-[#aecd20] text-black text-xs font-mono font-bold rounded-full transition-all shadow-[0_0_14px_rgba(191,221,37,0.3)] cursor-pointer w-fit shrink-0"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          {isEn ? "Save Policies" : "Simpan Aturan"}
        </button>
      </div>

      {isSaved && (
        <div className="p-4 rounded-2xl bg-[#0A0A0A] text-white text-xs font-mono flex items-center gap-2.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#BFDD25] shadow-[0_0_8px_rgba(191,221,37,0.8)]" />
          {isEn ? "Content policies saved successfully." : "Kebijakan konten berhasil disimpan."}
        </div>
      )}

      {/* Rules Box */}
      <div className="bg-[#0A0A0A] rounded-2xl p-6 space-y-5 font-sans text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#BFDD25] shadow-[0_0_6px_rgba(191,221,37,0.8)]" />
          <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
            {isEn ? "Anti-Counterfeit & Listing Protection" : "Perlindungan Anti-Barang Tiruan (KW)"}
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-[#888888] uppercase tracking-wider mb-1.5">
              {isEn ? "Prohibited Title / Description Keywords (Comma Separated)" : "Kata Kunci Terlarang (Dipisah Koma)"}
            </label>
            <input
              type="text"
              value={policies.prohibitedKeywords}
              onChange={(e) => setPolicies({ ...policies, prohibitedKeywords: e.target.value })}
              className="w-full bg-[#141414] focus:bg-[#181818] rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none focus:ring-1 focus:ring-[#BFDD25] transition-all"
            />
            <p className="text-[10px] font-mono text-[#666666] mt-1.5">
              Listings containing these terms will be auto-flagged and rejected before public display.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#141414] flex items-center justify-between text-xs font-mono">
            <span className="text-[#AAAAAA]">
              {isEn ? "Mandatory Admin QC Approval for New Products" : "Wajib Uji QC Admin Sebelum Produk Tampil"}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#BFDD25]/10 text-[#BFDD25] font-bold text-[11px]">
              Enabled
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}
