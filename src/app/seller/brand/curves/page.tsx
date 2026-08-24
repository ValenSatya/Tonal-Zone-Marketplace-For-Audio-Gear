"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface MasterBrandModel {
  id: string;
  name: string;
  driverConfig: string;
  couplerStandard: string;
  targetCompliance: string;
  impedance: string;
  sensitivity: string;
  msrpUSD: number;
  msrpIDR: number;
  frGraphAvailable: boolean;
  status: "ACTIVE_PRODUCTION" | "LEGACY_ARCHIVE" | "PROTOTYPE";
}

const TANGZU_MASTER_MODELS: MasterBrandModel[] = [
  {
    id: "TGZ-01",
    name: "TANGZU Wan'er S.G (Studio Green / Clear)",
    driverConfig: "10mm PET Dynamic Driver • N52 Magnet",
    couplerStandard: "IEC-60318-4 (711)",
    targetCompliance: "96.4% Harman Target Match",
    impedance: "20 Ω @ 1kHz",
    sensitivity: "107 dB/mW",
    msrpUSD: 24,
    msrpIDR: 380000,
    frGraphAvailable: true,
    status: "ACTIVE_PRODUCTION",
  },
  {
    id: "TGZ-02",
    name: "TANGZU x HBB Zetian Wu Heyday Edition",
    driverConfig: "14.5mm Planar Magnetic • CNC Aluminum",
    couplerStandard: "IEC-60318-4 (711)",
    targetCompliance: "94.8% Neutral Reference Target",
    impedance: "16 Ω @ 1kHz",
    sensitivity: "100 dB/mW",
    msrpUSD: 199,
    msrpIDR: 3100000,
    frGraphAvailable: true,
    status: "ACTIVE_PRODUCTION",
  },
  {
    id: "TGZ-03",
    name: "TANGZU Shimin Li (Gold Edition)",
    driverConfig: "10mm Dual-Cavity Dynamic Transducer",
    couplerStandard: "IEC-60318-4 (711)",
    targetCompliance: "91.2% Warm Balanced Target",
    impedance: "18 Ω @ 1kHz",
    sensitivity: "109 dB/mW",
    msrpUSD: 35,
    msrpIDR: 550000,
    frGraphAvailable: true,
    status: "ACTIVE_PRODUCTION",
  },
  {
    id: "TGZ-04",
    name: "TANGZU Nezha Flagship Tribrid",
    driverConfig: "6 Balanced Armatures + 1 PZT Piezoelectric",
    couplerStandard: "IEC-60318-4 & B&K 5128",
    targetCompliance: "98.2% Master Reference Target",
    impedance: "16 Ω @ 1kHz",
    sensitivity: "106 dB/mW",
    msrpUSD: 399,
    msrpIDR: 6200000,
    frGraphAvailable: true,
    status: "ACTIVE_PRODUCTION",
  },
  {
    id: "TGZ-05",
    name: "TANGZU YuXuanJi (Prototype)",
    driverConfig: "1DD + 2BA Hybrid Transducer",
    couplerStandard: "Acoustic Lab Alpha Stage",
    targetCompliance: "Tuning in Progress",
    impedance: "14 Ω @ 1kHz",
    sensitivity: "110 dB/mW",
    msrpUSD: 89,
    msrpIDR: 1390000,
    frGraphAvailable: false,
    status: "PROTOTYPE",
  },
];

export default function BrandCurvesPage() {
  const { language } = useLanguage();
  const isEn = language === "English";

  const [models, setModels] = useState<MasterBrandModel[]>(TANGZU_MASTER_MODELS);
  const [selectedModel, setSelectedModel] = useState<MasterBrandModel | null>(TANGZU_MASTER_MODELS[0]);
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
              {isEn ? "Master Catalog & Acoustic FR Vault" : "Master Katalog & Kurva Akustik FR"}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#141414] text-[#A1A1AA] border border-[#27272A]">
              IEC-711 Standard
            </span>
          </div>
          <p className="text-xs font-mono text-[#71717A] mt-1">
            {isEn
              ? "Official acoustic measurement database for verified TANGZU Audio products with raw & calibrated frequency response curves."
              : "Basis data pengukuran akustik resmi TANGZU Audio dengan kurva respon frekuensi terkalibrasi IEC-711."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/graph"
            target="_blank"
            className="inline-flex items-center gap-1.5 bg-[#141414] hover:bg-[#1C1C1C] text-[#FAF9F6] border border-[#262626] px-3.5 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            {isEn ? "Open Graph Tool" : "Buka Graph Tool"}
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 bg-[#FAF9F6] text-black hover:bg-[#E5E5E5] px-3.5 py-1.5 rounded-lg text-xs font-sans font-bold transition-all shadow-sm cursor-pointer"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {isEn ? "Upload FR Data" : "Upload File FR"}
          </button>
        </div>
      </div>

      {/* Selected Curve Visualizer Preview */}
      {selectedModel && (
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1E1E1E]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">{selectedModel.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#161616] text-[#D4D4D8] border border-[#2A2A2A]">
                  {selectedModel.targetCompliance}
                </span>
              </div>
              <p className="text-xs font-mono text-[#71717A] mt-0.5">{selectedModel.driverConfig}</p>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="text-[#71717A] block text-[10px] uppercase">Official MSRP</span>
              <span className="text-white font-semibold">
                {currency === "IDR"
                  ? `Rp ${selectedModel.msrpIDR.toLocaleString("id-ID")}`
                  : `$${selectedModel.msrpUSD}`}
              </span>
            </div>
          </div>

          {/* Clean FR Canvas */}
          <div className="h-48 bg-[#090909] border border-[#1E1E1E] rounded-lg p-4 relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-center text-[10px] font-mono text-[#52525B]">
              <span>20 Hz</span>
              <span>100 Hz</span>
              <span>1 kHz</span>
              <span>3 kHz</span>
              <span>10 kHz</span>
              <span>20 kHz</span>
            </div>

            {/* SVG Frequency Response Curve */}
            <div className="relative w-full h-28 my-auto">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 100">
                <line x1="0" y1="50" x2="500" y2="50" stroke="#1A1A1A" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="0" y1="25" x2="500" y2="25" stroke="#141414" strokeWidth="1" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#141414" strokeWidth="1" />
                
                {/* Target Baseline Curve */}
                <path
                  d="M0 65 Q50 35 100 50 T200 50 T300 20 T400 60 T500 70"
                  fill="none"
                  stroke="#3F3F46"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                
                {/* Official Model Curve */}
                <path
                  d="M0 60 Q50 30 100 48 T200 49 T300 18 T400 55 T500 65"
                  fill="none"
                  stroke="#FAF9F6"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-white">
                  <span className="w-2.5 h-0.5 bg-white inline-block" /> {selectedModel.name.split(" ")[1]} Measurement
                </span>
                <span className="flex items-center gap-1.5 text-[#71717A]">
                  <span className="w-2.5 h-0.5 bg-[#52525B] inline-block border-dashed" /> Harman Target
                </span>
              </div>
              <span>{selectedModel.couplerStandard} • 1/12 Oct Smoothed</span>
            </div>
          </div>
        </div>
      )}

      {/* Master Models Table */}
      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#1E1E1E] bg-[#141414] flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            {isEn ? "Master Acoustic Lineup" : "Daftar Model Master TANGZU"}
          </h3>
          <span className="text-xs font-mono text-[#71717A]">{models.length} Official Designs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b border-[#1E1E1E] bg-[#0E0E0E] text-[10px] font-mono uppercase text-[#71717A] tracking-wider">
                <th className="px-5 py-3.5">Model & Transducer</th>
                <th className="px-5 py-3.5">Coupler</th>
                <th className="px-5 py-3.5">Target Compliance</th>
                <th className="px-5 py-3.5 text-right">MSRP</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {models.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => setSelectedModel(m)}
                  className={`hover:bg-[#161616] cursor-pointer transition-colors ${
                    selectedModel?.id === m.id ? "bg-[#181818]" : ""
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{m.name}</span>
                      <span className="text-[11px] text-[#71717A] font-mono">{m.driverConfig}</span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 font-mono text-xs text-[#A1A1AA]">
                    {m.couplerStandard}
                  </td>

                  <td className="px-5 py-3.5 font-mono text-xs text-[#D4D4D8]">
                    {m.targetCompliance}
                  </td>

                  <td className="px-5 py-3.5 text-right font-mono font-medium text-white text-xs">
                    {currency === "IDR"
                      ? `Rp ${m.msrpIDR.toLocaleString("id-ID")}`
                      : `$${m.msrpUSD}`}
                  </td>

                  <td className="px-5 py-3.5 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#161616] text-[#A1A1AA] border border-[#27272A]">
                      {m.status === "ACTIVE_PRODUCTION" ? "Active" : "Prototype"}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModel(m);
                      }}
                      className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#242424] text-[#D4D4D8] text-[10px] font-mono rounded border border-[#2A2A2A] transition-colors"
                    >
                      View
                    </button>
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
