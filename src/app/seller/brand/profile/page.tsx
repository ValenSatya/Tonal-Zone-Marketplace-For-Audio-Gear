"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import CustomSelect from "@/components/ui/custom-select";

export default function BrandProfilePage() {
  const { language } = useLanguage();
  const isEn = language === "English";

  const [brandData, setBrandData] = useState({
    brandName: "TANGZU Audio",
    headquarters: "Dongguan, Guangdong & Global Acoustic Lab",
    foundedYear: "2021",
    tagline: "Dynasty Heritage Meets High-Fidelity Acoustic Precision",
    biography:
      "TANGZU Audio is dedicated to merging historical craftsmanship with ultra-modern acoustic transducer engineering. Inspired by the golden aesthetics of ancient dynasties and tuned to precision target curves, TANGZU IEMs deliver rich, lifelike vocal timbres, articulate bass extension, and expansive micro-details for audiophiles and sound engineers worldwide.",
    houseSoundSignature: "Balanced Vocal Lushness (Smooth Upper-Mid Pinna Gain)",
    targetCurveStandard: "Harman In-Ear 2019 / TANGZU Studio Reference",
    officialWebsite: "https://tangzu.audio",
    supportEmail: "service@tangzu.audio",
    partnerInquiries: "partners@tangzu.audio",
    officialDistributorCount: 18,
    masterSKUCount: 14,
    brandBanner: "",
    brandLogo: "",
  });

  const [isSaved, setIsSaved] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top Header & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E1E1E]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold font-sans tracking-tight text-white">
              {isEn ? "Brand Profile & Acoustic Story" : "Profil & Filosofi Brand"}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#141414] text-[#A1A1AA] border border-[#27272A] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {isEn ? "Verified Manufacturer" : "Pabrikan Resmi"}
            </span>
          </div>
          <p className="text-xs font-mono text-[#71717A] mt-1">
            {isEn
              ? "Manage official brand identity, acoustic tuning philosophy, and global authorized distribution credentials."
              : "Kelola identitas resmi merek, filosofi tuning akustik, dan kredensial distribusi berlisensi."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2500);
          }}
          className="px-4 py-2 bg-[#FAF9F6] text-black hover:bg-[#E5E5E5] text-xs font-sans font-bold rounded-lg transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          {isEn ? "Save Changes" : "Simpan Perubahan"}
        </button>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-[#141414] border border-[#2A2A2A] text-white text-xs font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {isEn ? "Brand profile updated successfully." : "Profil brand berhasil disimpan."}
        </div>
      )}

      {/* Brand Hero Card (Clean Obsidian Noir) */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
          {/* Clean Logo Box */}
          <div className="w-16 h-16 rounded-xl bg-[#161616] border border-[#2A2A2A] flex items-center justify-center font-mono font-bold text-base text-white shrink-0">
            TANGZU
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-lg font-bold font-sans text-white">{brandData.brandName}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#181818] text-[#A1A1AA] border border-[#2A2A2A]">
                Official Flagship
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#181818] text-[#71717A] border border-[#262626]">
                Est. {brandData.foundedYear}
              </span>
            </div>
            <p className="text-xs font-mono text-[#8E8E93] mt-1">{brandData.tagline}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#71717A] mt-2.5">
              <span>{brandData.headquarters}</span>
              <span>•</span>
              <span>{brandData.officialDistributorCount} Global Dealers</span>
              <span>•</span>
              <span>{brandData.masterSKUCount} Master IEM Models</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Story & Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Brand Story & Tuning Standard */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Acoustic Heritage */}
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1E1E1E]">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
                {isEn ? "1. Acoustic Philosophy & Brand Story" : "1. Filosofi Akustik & Kisah Brand"}
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                  {isEn ? "Tagline" : "Slogan Brand"}
                </label>
                <input
                  type="text"
                  value={brandData.tagline}
                  onChange={(e) => setBrandData({ ...brandData, tagline: e.target.value })}
                  className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-sans text-white outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                  {isEn ? "Biography & Engineering Vision" : "Kisah & Visi Akustik"}
                </label>
                <textarea
                  rows={5}
                  value={brandData.biography}
                  onChange={(e) => setBrandData({ ...brandData, biography: e.target.value })}
                  className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg p-3 text-xs font-sans text-white leading-relaxed outline-none focus:border-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Tuning Standard */}
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1E1E1E]">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
                {isEn ? "2. Target Frequency Response Standard" : "2. Standar Target Respon Frekuensi"}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                  {isEn ? "House Sound Signature" : "Karakter House Sound"}
                </label>
                <input
                  type="text"
                  value={brandData.houseSoundSignature}
                  onChange={(e) => setBrandData({ ...brandData, houseSoundSignature: e.target.value })}
                  className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3.5 py-2 text-xs font-mono text-white outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#71717A] uppercase mb-1">
                  {isEn ? "Target Standard" : "Standar Kurva Baseline"}
                </label>
                <CustomSelect
                  value={brandData.targetCurveStandard}
                  onChange={(val) => setBrandData({ ...brandData, targetCurveStandard: val })}
                  options={[
                    { label: "Harman In-Ear 2019 / TANGZU Studio Reference", value: "Harman In-Ear 2019 / TANGZU Studio Reference" },
                    { label: "Diffuse Field Compensated", value: "Diffuse Field Compensated" },
                    { label: "JM-1 Target Curve", value: "JM-1 Target Curve" },
                    { label: "B&K 5128 Target", value: "B&K 5128 Target" },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Contact & Licensing Channels */}
        <div className="space-y-6">
          <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1E1E1E]">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <h3 className="text-xs font-bold font-sans text-white uppercase tracking-wider">
                {isEn ? "3. Official Channels" : "3. Saluran Kontak Resmi"}
              </h3>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[10px] uppercase text-[#71717A] mb-1">
                  {isEn ? "Website" : "Website Resmi"}
                </label>
                <input
                  type="text"
                  value={brandData.officialWebsite}
                  onChange={(e) => setBrandData({ ...brandData, officialWebsite: e.target.value })}
                  className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#71717A] mb-1">
                  {isEn ? "Support Email" : "Email CS Global"}
                </label>
                <input
                  type="email"
                  value={brandData.supportEmail}
                  onChange={(e) => setBrandData({ ...brandData, supportEmail: e.target.value })}
                  className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#71717A] mb-1">
                  {isEn ? "Dealer Inquiries" : "Kontak Distributor"}
                </label>
                <input
                  type="email"
                  value={brandData.partnerInquiries}
                  onChange={(e) => setBrandData({ ...brandData, partnerInquiries: e.target.value })}
                  className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg px-3 py-2 text-white outline-none focus:border-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
