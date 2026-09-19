"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface AuthorizedReseller {
  id: string;
  storeName: string;
  region: string;
  country: string;
  licenseNumber: string;
  licenseValidUntil: string;
  tier: "NATIONAL_DISTRIBUTOR" | "AUTHORIZED_PREMIUM" | "CERTIFIED_RETAILER";
  mapComplianceRate: number;
  status: "ACTIVE" | "SUSPENDED" | "PENDING_RENEWAL";
}

const INITIAL_RESELLERS: AuthorizedReseller[] = [
  {
    id: "RSL-01",
    storeName: "AudioZone Official (TonalZone)",
    region: "DKI Jakarta / West Java",
    country: "Indonesia",
    licenseNumber: "TGZ-ID-2026-0081",
    licenseValidUntil: "2027-12-31",
    tier: "NATIONAL_DISTRIBUTOR",
    mapComplianceRate: 100,
    status: "ACTIVE",
  },
  {
    id: "RSL-02",
    storeName: "Jaben Audio Singapore",
    region: "The Adelphi / Central",
    country: "Singapore",
    licenseNumber: "TGZ-SG-2026-0012",
    licenseValidUntil: "2027-06-30",
    tier: "AUTHORIZED_PREMIUM",
    mapComplianceRate: 98,
    status: "ACTIVE",
  },
  {
    id: "RSL-03",
    storeName: "Stars Picker Audio Library",
    region: "Petaling Jaya, Selangor",
    country: "Malaysia",
    licenseNumber: "TGZ-MY-2026-0044",
    licenseValidUntil: "2027-08-31",
    tier: "AUTHORIZED_PREMIUM",
    mapComplianceRate: 100,
    status: "ACTIVE",
  },
  {
    id: "RSL-04",
    storeName: "Head-Fi Tokyo Acoustic Hub",
    region: "Akihabara, Tokyo",
    country: "Japan",
    licenseNumber: "TGZ-JP-2026-0005",
    licenseValidUntil: "2026-12-31",
    tier: "CERTIFIED_RETAILER",
    mapComplianceRate: 95,
    status: "PENDING_RENEWAL",
  },
];

export default function BrandResellersPage() {
  const { language } = useLanguage();
  const isEn = language === "English";

  const [resellers, setResellers] = useState<AuthorizedReseller[]>(INITIAL_RESELLERS);

  return (
    <div className="space-y-6">
      {/* Top Header (Zero border, soft modern elevation) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-white">
              {isEn ? "Authorized Resellers & Global Dealers" : "Direktori Reseller & Distributor Resmi"}
            </h1>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-medium bg-[#141414] text-[#A1A1AA]">
              License Management
            </span>
          </div>
          <p className="text-xs font-mono text-[#71717A] mt-1">
            {isEn
              ? "Verify official TANGZU licensed retailers, monitor Minimum Advertised Price (MAP) compliance, and issue digital certificates."
              : "Verifikasi toko retail berlisensi resmi TANGZU, pantau kepatuhan harga pasar (MAP), dan terbitkan sertifikat dealer resmi."}
          </p>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 bg-white text-black hover:bg-[#E5E5E5] px-5 py-2.5 rounded-full text-xs font-sans font-bold transition-all shadow-md cursor-pointer shrink-0"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {isEn ? "Issue License" : "Terbitkan Izin Dealer"}
        </button>
      </div>

      {/* Reseller Directory Card (Rounded-2xl, Zero Stroke) */}
      <div className="bg-[#0A0A0A] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-[#0E0E0E] text-[10px] font-mono uppercase text-[#71717A] tracking-wider">
                <th className="px-5 py-4 font-semibold">{isEn ? "Partner Name" : "Nama Toko / Mitra"}</th>
                <th className="px-5 py-4 font-semibold">{isEn ? "Country & Region" : "Negara & Wilayah"}</th>
                <th className="px-5 py-4 font-semibold">{isEn ? "License" : "Nomor Lisensi"}</th>
                <th className="px-5 py-4 font-semibold">{isEn ? "Tier" : "Tingkat"}</th>
                <th className="px-5 py-4 text-center font-semibold">{isEn ? "MAP Compliance" : "Kepatuhan MAP"}</th>
                <th className="px-5 py-4 text-right font-semibold">{isEn ? "Status" : "Status"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/50">
              {resellers.map((rsl) => (
                <tr key={rsl.id} className="hover:bg-[#121212] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#141414] flex items-center justify-center font-mono font-bold text-xs text-white shrink-0">
                        {rsl.storeName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-white block">{rsl.storeName}</span>
                        <span className="text-[10px] font-mono text-[#71717A] block mt-0.5">Valid to: {rsl.licenseValidUntil}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 font-mono text-xs text-[#A1A1AA]">
                    {rsl.country} ({rsl.region})
                  </td>

                  <td className="px-5 py-4 font-mono text-xs text-white font-medium">
                    {rsl.licenseNumber}
                  </td>

                  <td className="px-5 py-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono bg-[#141414] text-[#A1A1AA]">
                      {rsl.tier.replace(/_/g, " ")}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[#BFDD25] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#BFDD25] shadow-[0_0_6px_rgba(191,221,37,0.8)]" />
                      {rsl.mapComplianceRate}%
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono bg-[#141414] text-[#D4D4D8]">
                      <span className={`w-1.5 h-1.5 rounded-full ${rsl.status === "ACTIVE" ? "bg-[#BFDD25] shadow-[0_0_6px_rgba(191,221,37,0.6)]" : "bg-amber-400"}`} />
                      {rsl.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
