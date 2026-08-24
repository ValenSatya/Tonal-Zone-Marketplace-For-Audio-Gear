"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface PreOrderCampaign {
  id: string;
  title: string;
  modelCode: string;
  targetSlots: number;
  reservedSlots: number;
  discountPriceUSD: number;
  discountPriceIDR: number;
  retailMSRPUSD: number;
  retailMSRPIDR: number;
  currentStageIndex: number; // 0: Tooling, 1: Mass Prod, 2: Final QC, 3: Global Dispatch
  stageProgressPercent: number;
  daysRemaining: number;
  status: "ACTIVE" | "COMPLETED";
}

const STAGES = [
  { id: "01", nameEn: "Tooling", nameId: "Tooling" },
  { id: "02", nameEn: "Mass Production", nameId: "Produksi Masal" },
  { id: "03", nameEn: "Final QC", nameId: "Uji Kualitas" },
  { id: "04", nameEn: "Global Dispatch", nameId: "Pengiriman" },
];

const INITIAL_CAMPAIGNS: PreOrderCampaign[] = [
  {
    id: "CMP-001",
    title: "TANGZU x HBB Zetian Wu Heyday V2 (Collector Edition)",
    modelCode: "ZW-HEYDAY-V2",
    targetSlots: 500,
    reservedSlots: 418,
    discountPriceUSD: 179,
    discountPriceIDR: 2790000,
    retailMSRPUSD: 219,
    retailMSRPIDR: 3450000,
    currentStageIndex: 1,
    stageProgressPercent: 75,
    daysRemaining: 12,
    status: "ACTIVE",
  },
  {
    id: "CMP-002",
    title: "TANGZU Nezha Custom Shell Founders Edition",
    modelCode: "NEZHA-FOUNDERS",
    targetSlots: 100,
    reservedSlots: 100,
    discountPriceUSD: 349,
    discountPriceIDR: 5450000,
    retailMSRPUSD: 449,
    retailMSRPIDR: 7000000,
    currentStageIndex: 2,
    stageProgressPercent: 90,
    daysRemaining: 3,
    status: "ACTIVE",
  },
];

export default function BrandCampaignsPage() {
  const { language } = useLanguage();
  const isEn = language === "English";

  const [campaigns, setCampaigns] = useState<PreOrderCampaign[]>(INITIAL_CAMPAIGNS);
  const [currency, setCurrency] = useState<"IDR" | "USD">("IDR");

  React.useEffect(() => {
    const savedCurr = localStorage.getItem("tonalzone_seller_currency") as "IDR" | "USD" | null;
    if (savedCurr) setCurrency(savedCurr);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E1E1E]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold font-sans tracking-tight text-white">
              {isEn ? "Pre-Order & Group-Buy Campaigns" : "Kampanye Pre-Order & Peluncuran"}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#141414] text-[#A1A1AA] border border-[#27272A]">
              Direct-To-Consumer
            </span>
          </div>
          <p className="text-xs font-mono text-[#71717A] mt-1">
            {isEn
              ? "Manage flagship product launch tiers, track manufacturing milestones, and monitor backer fulfillment."
              : "Kelola rilis produk unggulan, pantau progres tahapan manufaktur, dan distribusi ke pembeli."}
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 bg-[#FAF9F6] text-black hover:bg-[#E5E5E5] px-3.5 py-1.5 rounded-lg text-xs font-sans font-bold transition-all shadow-sm cursor-pointer"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {isEn ? "New Campaign" : "Mulai Pre-Order Baru"}
        </button>
      </div>

      {/* Clean Industrial Campaign Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campaigns.map((camp) => {
          const percentFilled = Math.round((camp.reservedSlots / camp.targetSlots) * 100);

          return (
            <div key={camp.id} className="bg-[#111111] border border-[#222222] rounded-xl p-5 space-y-5">
              {/* Header: Model Code & Title */}
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#1C1C1C]">
                <div>
                  <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider block mb-1">
                    {camp.modelCode}
                  </span>
                  <h3 className="text-sm font-semibold text-white leading-snug">{camp.title}</h3>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-[#161616] border border-[#2A2A2A] text-[#D4D4D8]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {camp.daysRemaining} {isEn ? "days left" : "hari tersisa"}
                  </span>
                </div>
              </div>

              {/* Price & Target Telemetry */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-[#0E0E0E] border border-[#1E1E1E] font-mono text-xs">
                <div>
                  <span className="text-[10px] text-[#71717A] uppercase block">
                    {isEn ? "Early Bird" : "Harga Pre-Order"}
                  </span>
                  <span className="font-bold text-white text-sm mt-0.5 block">
                    {currency === "IDR"
                      ? `Rp ${camp.discountPriceIDR.toLocaleString("id-ID")}`
                      : `$${camp.discountPriceUSD}`}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#71717A] uppercase block">
                    {isEn ? "Retail MSRP" : "Harga Resmi"}
                  </span>
                  <span className="text-[#71717A] line-through text-xs mt-0.5 block">
                    {currency === "IDR"
                      ? `Rp ${camp.retailMSRPIDR.toLocaleString("id-ID")}`
                      : `$${camp.retailMSRPUSD}`}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-[#71717A] uppercase block">
                    {isEn ? "Backers" : "Slot Terisi"}
                  </span>
                  <span className="text-[#A1A1AA] text-xs mt-0.5 block">
                    <strong className="text-white">{camp.reservedSlots}</strong> / {camp.targetSlots} ({percentFilled}%)
                  </span>
                </div>
              </div>

              {/* Minimal Horizontal Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#71717A]">
                  <span>{isEn ? "Allocation Progress" : "Progres Kuota"}</span>
                  <span className="text-[#D4D4D8]">{percentFilled}%</span>
                </div>
                <div className="w-full bg-[#181818] h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-[#D4D4D8] h-full rounded-full transition-all duration-300"
                    style={{ width: `${percentFilled}%` }}
                  />
                </div>
              </div>

              {/* MINIMALIST LINEAR TIMELINE STEPPER (Clean, Industrial, Zero Slop) */}
              <div className="pt-3 border-t border-[#1C1C1C] space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A] uppercase tracking-wider">
                  <span>{isEn ? "Manufacturing Timeline" : "Tahapan Manufaktur"}</span>
                  <span className="text-[#D4D4D8]">
                    {isEn ? STAGES[camp.currentStageIndex].nameEn : STAGES[camp.currentStageIndex].nameId} ({camp.stageProgressPercent}%)
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {STAGES.map((stg, sIdx) => {
                    const isDone = sIdx < camp.currentStageIndex;
                    const isCurrent = sIdx === camp.currentStageIndex;

                    return (
                      <div key={stg.id} className="space-y-1.5">
                        {/* Step Line Indicator */}
                        <div
                          className={`h-1 rounded-full transition-colors ${
                            isDone
                              ? "bg-white"
                              : isCurrent
                              ? "bg-white"
                              : "bg-[#222222]"
                          }`}
                        />
                        {/* Step Label */}
                        <div className="text-[10px] font-mono leading-tight">
                          <span
                            className={`block text-[9px] ${
                              isDone
                                ? "text-[#A1A1AA]"
                                : isCurrent
                                ? "text-white font-semibold"
                                : "text-[#52525B]"
                            }`}
                          >
                            {stg.id}
                          </span>
                          <span
                            className={`truncate block ${
                              isCurrent
                                ? "text-white font-medium"
                                : isDone
                                ? "text-[#A1A1AA]"
                                : "text-[#52525B]"
                            }`}
                          >
                            {isEn ? stg.nameEn : stg.nameId}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
