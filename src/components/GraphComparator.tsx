"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";

export interface IEMCurveData {
  id: string;
  name: string;
  brand: string;
  driverType: string;
  signature: "NEUTRAL" | "WARM" | "V_SHAPE" | "BRIGHT" | "BASSHEAD";
  priceUSD: number;
  color: string;
  image: string;
  description: string;
  // Key points [Hz, dB SPL]
  points: [number, number][];
}

export interface TargetCurveData {
  id: string;
  name: string;
  color: string;
  description: string;
  points: [number, number][];
}

// 7 Real Audiophile IEM acoustic frequency response signatures
export const COMPARATOR_IEMS: IEMCurveData[] = [
  {
    id: "tangzu-waner",
    name: "Tangzu Wan'er S.G",
    brand: "TANGZU",
    driverType: "10mm PET Diaphragm Dynamic Driver",
    signature: "WARM",
    priceUSD: 19.99,
    color: "#D4FF00", // Electric Lime
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    description: "Tuning warm-neutral dengan vokal intim, sub-bass bertekstur, dan treble halus non-fatiguing.",
    points: [
      [20, 86.5], [40, 87.0], [80, 86.2], [150, 83.5], [300, 80.5],
      [600, 79.5], [1000, 80.0], [1500, 82.5], [2500, 88.0], [3000, 89.5],
      [4000, 86.0], [6000, 82.0], [8000, 83.5], [10000, 79.0], [15000, 75.0], [20000, 68.0]
    ],
  },
  {
    id: "moondrop-blessing-3",
    name: "Moondrop Blessing 3",
    brand: "MOONDROP",
    driverType: "2DD (HODDCUS) + 4BA Hybrid",
    signature: "NEUTRAL",
    priceUSD: 319.99,
    color: "#38BDF8", // Sky Blue
    image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
    description: "Tuning Harman-neutral presisi tinggi dengan separasi vokal pinna gain kristal dan sub-bass punch cepat.",
    points: [
      [20, 87.0], [40, 86.5], [80, 84.0], [150, 81.0], [300, 79.2],
      [600, 79.8], [1000, 80.0], [1500, 83.0], [2500, 89.8], [3000, 91.5],
      [4000, 88.0], [6000, 83.5], [8000, 82.0], [10000, 81.5], [15000, 78.0], [20000, 71.0]
    ],
  },
  {
    id: "sennheiser-hd560s",
    name: "Sennheiser HD 560S",
    brand: "SENNHEISER",
    driverType: "38mm Angled Transducer (Open-Back)",
    signature: "NEUTRAL",
    priceUSD: 199.00,
    color: "#FB7185", // Rose
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800",
    description: "Referensi open-back analitikal dengan linearitas midrange alami dan soundstage difus ultra-lebar.",
    points: [
      [20, 76.0], [40, 78.5], [80, 80.0], [150, 80.0], [300, 80.0],
      [600, 80.0], [1000, 80.0], [1500, 81.5], [2500, 84.5], [3000, 87.0],
      [4000, 85.0], [6000, 81.0], [8000, 84.0], [10000, 80.0], [15000, 77.0], [20000, 70.0]
    ],
  },
  {
    id: "sony-ier-m9",
    name: "Sony IER-M9 Stage Monitor",
    brand: "SONY",
    driverType: "5 Balanced Armature (Magnesium Inner)",
    signature: "WARM",
    priceUSD: 999.00,
    color: "#FB923C", // Amber Orange
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    description: "Monitor panggung profesional dengan timbre hangat, bobot nada tebal, dan isolasi akustik tanpa distorsi.",
    points: [
      [20, 85.0], [40, 85.5], [80, 85.0], [150, 83.5], [300, 81.5],
      [600, 80.2], [1000, 80.0], [1500, 81.0], [2500, 85.5], [3000, 87.2],
      [4000, 84.0], [6000, 80.0], [8000, 81.0], [10000, 78.5], [15000, 73.0], [20000, 66.0]
    ],
  },
  {
    id: "thieaudio-monarch-mk3",
    name: "Thieaudio Monarch MKIII",
    brand: "THIEAUDIO",
    driverType: "2DD + 6BA + 2EST Tribrid",
    signature: "V_SHAPE",
    priceUSD: 999.00,
    color: "#C084FC", // Electric Violet
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800",
    description: "Endgame tribrid dengan sub-bass menggelegar IMPACT2 dan ekstensi ultra-treble elektrostatis micro-detail.",
    points: [
      [20, 91.0], [40, 90.0], [80, 86.0], [150, 81.5], [300, 78.5],
      [600, 79.5], [1000, 80.0], [1500, 83.5], [2500, 90.5], [3000, 92.5],
      [4000, 88.0], [6000, 82.5], [8000, 83.0], [10000, 84.5], [15000, 85.0], [20000, 78.0]
    ],
  },
  {
    id: "simgot-ea1000",
    name: "Simgot EA1000 Fermat",
    brand: "SIMGOT",
    driverType: "1DD Dual-Magnetic + 1 Passive Radiator",
    signature: "BRIGHT",
    priceUSD: 219.99,
    color: "#34D399", // Emerald
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    description: "Resolusi tinggi dengan treble berkilau, attack transien instan, dan nozzle kuningan yang dapat diganti.",
    points: [
      [20, 85.5], [40, 85.0], [80, 83.0], [150, 80.5], [300, 79.0],
      [600, 79.5], [1000, 80.0], [1500, 83.0], [2500, 90.0], [3000, 92.0],
      [4000, 89.0], [6000, 86.0], [8000, 87.0], [10000, 83.0], [15000, 79.0], [20000, 72.0]
    ],
  },
  {
    id: "kiwi-orchestra-lite",
    name: "Kiwi Ears Orchestra Lite",
    brand: "KIWI EARS",
    driverType: "8 Custom Balanced Armatures",
    signature: "NEUTRAL",
    priceUSD: 249.00,
    color: "#E2E8F0", // Silver Off-White
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    description: "8-BA all-reference monitor tanpa lubang angin (unvented), memberikan isolasi pasif masif dan kejernihan vokal murni.",
    points: [
      [20, 84.0], [40, 84.5], [80, 84.0], [150, 82.0], [300, 80.0],
      [600, 79.5], [1000, 80.0], [1500, 82.5], [2500, 88.0], [3000, 89.0],
      [4000, 85.0], [6000, 80.5], [8000, 80.0], [10000, 78.0], [15000, 72.0], [20000, 65.0]
    ],
  },
];

// Target Reference Standards
export const TARGET_CURVES: TargetCurveData[] = [
  {
    id: "harman-2019",
    name: "Harman In-Ear 2019 Target",
    color: "#64748B",
    description: "Standar preferensi akustik global dengan elevasi sub-bass +8dB dan pinna gain 3kHz yang disukai 80%+ pendengar.",
    points: [
      [20, 88.0], [40, 87.5], [80, 84.5], [150, 81.0], [300, 79.0],
      [600, 79.5], [1000, 80.0], [1500, 83.5], [2500, 90.0], [3000, 92.5],
      [4000, 88.0], [6000, 82.0], [8000, 80.0], [10000, 78.0], [15000, 75.0], [20000, 68.0]
    ],
  },
  {
    id: "df-neutral",
    name: "Diffuse-Field (DF) Target",
    color: "#94A3B8",
    description: "Kompensasi medan baur teoritis tanpa bass boost buatan, cocok untuk monitoring ruang studio.",
    points: [
      [20, 80.0], [40, 80.0], [80, 80.0], [150, 80.0], [300, 80.0],
      [600, 80.0], [1000, 80.0], [1500, 82.0], [2500, 87.0], [3000, 91.0],
      [4000, 86.0], [6000, 83.0], [8000, 85.0], [10000, 80.0], [15000, 78.0], [20000, 72.0]
    ],
  },
  {
    id: "ief-neutral",
    name: "IEF Neutral Target (Crinacle)",
    color: "#A1A1AA",
    description: "Standar netral tonal dengan bass datar hingga 200Hz dan transisi pinna halus untuk akurasi timbre vokal murni.",
    points: [
      [20, 80.0], [40, 80.0], [80, 80.0], [150, 80.0], [300, 79.5],
      [600, 79.8], [1000, 80.0], [1500, 82.5], [2500, 87.5], [3000, 89.0],
      [4000, 85.5], [6000, 81.0], [8000, 80.0], [10000, 77.0], [15000, 73.0], [20000, 65.0]
    ],
  },
];

// Frequency Zones
const FREQ_ZONES = [
  { name: "Sub-Bass", range: "20 - 60 Hz", min: 20, max: 60, desc: "Rumble fisik & getaran sub-rendah" },
  { name: "Mid-Bass", range: "60 - 250 Hz", min: 60, max: 250, desc: "Punch kick drum & bassline" },
  { name: "Lower Mid", range: "250 - 1 kHz", min: 250, max: 1000, desc: "Bobot vokal pria & instrumen akustik" },
  { name: "Pinna Gain", range: "1k - 4 kHz", min: 1000, max: 4000, desc: "Kejelasan vokal wanita, snare, & artikulasi" },
  { name: "Presence", range: "4k - 10 kHz", min: 4000, max: 10000, desc: "Detail perkusi, cymbals, & kejernihan" },
  { name: "Air / Treble", range: "10k - 20 kHz", min: 10000, max: 20000, desc: "Separasi ruang & soundstage mikro" },
];

export default function GraphComparator() {
  const { formatPrice } = useLocation();
  const [selectedIemIds, setSelectedIemIds] = useState<string[]>(["tangzu-waner", "moondrop-blessing-3"]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>("harman-2019");
  const [normMode, setNormMode] = useState<"1k" | "500" | "raw">("1k");
  const [hoveredHz, setHoveredHz] = useState<number | null>(1000);

  const containerRef = useRef<HTMLDivElement>(null);

  // SVG Dimension Specs
  const width = 1000;
  const height = 450;
  const padding = { top: 30, right: 30, bottom: 50, left: 60 };

  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Logarithmic X scale: 20 Hz to 20,000 Hz (3 Decades: 20-200, 200-2000, 2000-20000)
  const minFreq = 20;
  const maxFreq = 20000;
  const logMin = Math.log10(minFreq);
  const logMax = Math.log10(maxFreq);

  const minDb = 55;
  const maxDb = 105;

  const freqToX = useCallback(
    (freq: number) => {
      const clamped = Math.max(minFreq, Math.min(maxFreq, freq));
      const logVal = Math.log10(clamped);
      const ratio = (logVal - logMin) / (logMax - logMin);
      return padding.left + ratio * graphWidth;
    },
    [logMin, logMax, graphWidth, padding.left]
  );

  const xToFreq = useCallback(
    (xCoord: number) => {
      const relX = Math.max(0, Math.min(graphWidth, xCoord - padding.left));
      const ratio = relX / graphWidth;
      const logVal = logMin + ratio * (logMax - logMin);
      return Math.round(Math.pow(10, logVal));
    },
    [graphWidth, padding.left, logMin, logMax]
  );

  const dbToY = useCallback(
    (db: number) => {
      const clamped = Math.max(minDb, Math.min(maxDb, db));
      const ratio = (clamped - minDb) / (maxDb - minDb);
      return height - padding.bottom - ratio * graphHeight;
    },
    [minDb, maxDb, height, padding.bottom, graphHeight]
  );

  // Interpolate dB at any exact Hz from points
  const interpolateDbAt = useCallback(
    (points: [number, number][], targetHz: number) => {
      if (targetHz <= points[0][0]) return points[0][1];
      if (targetHz >= points[points.length - 1][0]) return points[points.length - 1][1];

      for (let i = 0; i < points.length - 1; i++) {
        const [f0, d0] = points[i];
        const [f1, d1] = points[i + 1];
        if (targetHz >= f0 && targetHz <= f1) {
          const logF0 = Math.log10(f0);
          const logF1 = Math.log10(f1);
          const logTarget = Math.log10(targetHz);
          const t = (logTarget - logF0) / (logF1 - logF0);
          return d0 + t * (d1 - d0);
        }
      }
      return 80;
    },
    []
  );

  // Build SVG Path with Catmull-Rom or cubic spline
  const generatePath = useCallback(
    (points: [number, number][], offsetDb: number = 0) => {
      if (points.length < 2) return "";

      const coords = points.map(([f, db]) => ({
        x: freqToX(f),
        y: dbToY(db + offsetDb),
      }));

      // Monotonic cubic curve generator
      let d = `M ${coords[0].x} ${coords[0].y}`;
      for (let i = 0; i < coords.length - 1; i++) {
        const p0 = coords[Math.max(0, i - 1)];
        const p1 = coords[i];
        const p2 = coords[i + 1];
        const p3 = coords[Math.min(coords.length - 1, i + 2)];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
      }
      return d;
    },
    [freqToX, dbToY]
  );

  // Active IEM list
  const activeIems = useMemo(() => {
    return COMPARATOR_IEMS.filter((iem) => selectedIemIds.includes(iem.id));
  }, [selectedIemIds]);

  // Active Target curve
  const activeTarget = useMemo(() => {
    return TARGET_CURVES.find((t) => t.id === selectedTargetId) || null;
  }, [selectedTargetId]);

  // Compute Normalization Offset for each IEM
  const getOffset = useCallback(
    (points: [number, number][]) => {
      if (normMode === "raw") return 0;
      const normHz = normMode === "1k" ? 1000 : 500;
      const currentAtNorm = interpolateDbAt(points, normHz);
      return 80 - currentAtNorm;
    },
    [normMode, interpolateDbAt]
  );

  const toggleIem = (id: string) => {
    if (selectedIemIds.includes(id)) {
      if (selectedIemIds.length > 1) {
        setSelectedIemIds(selectedIemIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIemIds.length >= 4) {
        setSelectedIemIds([...selectedIemIds.slice(1), id]);
      } else {
        setSelectedIemIds([...selectedIemIds, id]);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - svgRect.left;
    const svgX = (clientX / svgRect.width) * width;
    const freq = xToFreq(svgX);
    setHoveredHz(freq);
  };

  const handleMouseLeave = () => {
    setHoveredHz(null);
  };

  // Find active zone for the current hovered Hz
  const currentZone = useMemo(() => {
    if (!hoveredHz) return FREQ_ZONES[2];
    return FREQ_ZONES.find((z) => hoveredHz >= z.min && hoveredHz < z.max) || FREQ_ZONES[5];
  }, [hoveredHz]);

  // Grid frequencies
  const gridFreqs = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
  const gridDbs = [60, 70, 80, 90, 100];

  return (
    <div className="w-full bg-[#0A0A0A] text-[#FAF9F6] border-y border-[#1c1c1c] py-24 font-sans selection:bg-[#D4FF00] selection:text-[#0e0e0e]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <span className="font-mono text-xs text-[#D4FF00] uppercase tracking-[0.25em] font-bold block mb-2">
              PRECISION SQUIGLINK ENGINE 2.0
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold uppercase tracking-tight text-white">
              INTERACTIVE GRAPH COMPARATOR
            </h2>
            <p className="text-sm font-sans text-[#8E8E93] max-w-2xl mt-2 leading-relaxed">
              Bandingkan respons frekuensi antar model IEM secara tumpang-tindih (*curve overlay*). Analisis elevasi sub-bass, linearitas midrange, dan ekstensi treble dengan akurasi pengukuran IEC-711.
            </p>
          </div>

          {/* Quick Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Normalization Selector */}
            <div className="flex items-center border border-[#222222] bg-[#121212] p-1 text-xs font-mono">
              <span className="text-[#666666] px-2 text-[10px] uppercase font-bold">NORMALIZE:</span>
              <button
                type="button"
                onClick={() => setNormMode("1k")}
                className={`px-2.5 py-1 transition-colors cursor-pointer ${
                  normMode === "1k" ? "bg-[#FAF9F6] text-black font-bold" : "text-[#888888] hover:text-white"
                }`}
              >
                1 kHz (80dB)
              </button>
              <button
                type="button"
                onClick={() => setNormMode("500")}
                className={`px-2.5 py-1 transition-colors cursor-pointer ${
                  normMode === "500" ? "bg-[#FAF9F6] text-black font-bold" : "text-[#888888] hover:text-white"
                }`}
              >
                500 Hz
              </button>
              <button
                type="button"
                onClick={() => setNormMode("raw")}
                className={`px-2.5 py-1 transition-colors cursor-pointer ${
                  normMode === "raw" ? "bg-[#FAF9F6] text-black font-bold" : "text-[#888888] hover:text-white"
                }`}
              >
                Raw (SPL)
              </button>
            </div>
          </div>
        </div>

        {/* IEM Selector Chips */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#71717A]">
            <span>PILIH IEM UNTUK DIBANDINGKAN (MAKSIMAL 4 MODEL AKTIF):</span>
            <span className="text-white font-bold">{selectedIemIds.length} / 4 Terpilih</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {COMPARATOR_IEMS.map((iem) => {
              const isSelected = selectedIemIds.includes(iem.id);
              return (
                <button
                  key={iem.id}
                  type="button"
                  onClick={() => toggleIem(iem.id)}
                  className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-2.5 ${
                    isSelected
                      ? "bg-[#141414] text-white font-bold shadow-sm"
                      : "bg-[#0c0c0c] text-[#71717A] border-[#222222] hover:border-[#444444] hover:text-white"
                  }`}
                  style={{
                    borderColor: isSelected ? iem.color : undefined,
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: isSelected ? iem.color : "#333333" }}
                  />
                  <span>{iem.name}</span>
                  <span className="text-[10px] text-[#888888]">(${iem.priceUSD})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Reference Selector */}
        <div className="mb-6 flex flex-wrap items-center gap-3 text-xs font-mono">
          <span className="text-[#71717A] uppercase">TARGET STANDAR:</span>
          {TARGET_CURVES.map((t) => {
            const isTargetActive = selectedTargetId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTargetId(isTargetActive ? "" : t.id)}
                className={`px-3 py-1.5 border transition-all cursor-pointer ${
                  isTargetActive
                    ? "bg-[#1c1c1c] text-white border-white font-bold"
                    : "bg-[#0e0e0e] text-[#666666] border-[#222222] hover:border-[#383838]"
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>

        {/* MAIN GRAPH CANVAS (SVG) */}
        <div
          ref={containerRef}
          className="relative bg-[#0d0d0d] border border-[#222222] p-2 sm:p-4 overflow-hidden select-none"
        >
          {/* Acoustic Zone Sub-Headers */}
          <div className="grid grid-cols-6 border-b border-[#1c1c1c] text-[10px] font-mono text-[#666666] py-2 px-6 uppercase tracking-wider text-center">
            {FREQ_ZONES.map((z, idx) => (
              <div key={idx} className="border-r border-[#1a1a1a] last:border-r-0">
                <span className="font-bold text-white block truncate">{z.name}</span>
                <span className="text-[9px] text-[#555555]">{z.range}</span>
              </div>
            ))}
          </div>

          <div className="relative w-full aspect-[16/8] min-h-[360px] max-h-[520px]">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Background Grid Lines (Horizontal / dB) */}
              {gridDbs.map((db) => {
                const y = dbToY(db);
                return (
                  <g key={`db-${db}`}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke="#1a1a1a"
                      strokeWidth={db === 80 ? "1.5" : "1"}
                      strokeDasharray={db === 80 ? "none" : "2,4"}
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 3}
                      fill={db === 80 ? "#FAF9F6" : "#666666"}
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {db} dB
                    </text>
                  </g>
                );
              })}

              {/* Background Grid Lines (Vertical / Frequency Hz) */}
              {gridFreqs.map((freq) => {
                const x = freqToX(freq);
                const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
                return (
                  <g key={`freq-${freq}`}>
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={height - padding.bottom}
                      stroke="#1a1a1a"
                      strokeWidth={freq === 1000 ? "1.5" : "1"}
                      strokeDasharray={freq === 1000 ? "none" : "2,4"}
                    />
                    <text
                      x={x}
                      y={height - padding.bottom + 18}
                      fill={freq === 1000 ? "#D4FF00" : "#666666"}
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {label}Hz
                    </text>
                  </g>
                );
              })}

              {/* Target Reference Curve (Dashed) */}
              {activeTarget && (
                <path
                  d={generatePath(activeTarget.points, 0)}
                  fill="none"
                  stroke={activeTarget.color}
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  opacity={0.65}
                />
              )}

              {/* Active IEM Response Curves */}
              {activeIems.map((iem) => {
                const offset = getOffset(iem.points);
                const pathD = generatePath(iem.points, offset);
                return (
                  <g key={iem.id}>
                    {/* Shadow Glow for Active Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={iem.color}
                      strokeWidth="5"
                      opacity="0.15"
                    />
                    {/* Crisp Vector Line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={iem.color}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                );
              })}

              {/* Interactive Laser Probe Line */}
              {hoveredHz && (
                <g>
                  <line
                    x1={freqToX(hoveredHz)}
                    y1={padding.top}
                    x2={freqToX(hoveredHz)}
                    y2={height - padding.bottom}
                    stroke="#FAF9F6"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                  {/* Point circles on active curves at hoveredHz */}
                  {activeIems.map((iem) => {
                    const offset = getOffset(iem.points);
                    const dbVal = interpolateDbAt(iem.points, hoveredHz) + offset;
                    const cx = freqToX(hoveredHz);
                    const cy = dbToY(dbVal);
                    return (
                      <circle
                        key={`pt-${iem.id}`}
                        cx={cx}
                        cy={cy}
                        r="4"
                        fill={iem.color}
                        stroke="#000000"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </g>
              )}
            </svg>
          </div>

          {/* Interactive Live Probe HUD */}
          <div className="mt-3 pt-3 border-t border-[#1c1c1c] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="text-[#888888] uppercase">PROBE FREKUENSI:</span>
              <span className="text-white font-bold text-sm bg-[#181818] px-2.5 py-1 border border-[#2a2a2a]">
                {hoveredHz ? `${hoveredHz.toLocaleString()} Hz` : "Arahkan Mouse"}
              </span>
              <span className="text-[#D4FF00] font-bold">
                [{currentZone.name} — {currentZone.desc}]
              </span>
            </div>

            {/* Readouts for active IEMs */}
            <div className="flex flex-wrap items-center gap-4">
              {activeIems.map((iem) => {
                const offset = getOffset(iem.points);
                const dbVal = hoveredHz ? (interpolateDbAt(iem.points, hoveredHz) + offset).toFixed(1) : "80.0";
                return (
                  <div key={iem.id} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: iem.color }} />
                    <span className="text-[#8E8E93] truncate max-w-[120px]">{iem.name}:</span>
                    <span className="text-white font-bold">{dbVal} dB</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Acoustic Comparison Breakdown Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeIems.map((iem) => {
            return (
              <div
                key={iem.id}
                className="bg-[#0e0e0e] border p-5 flex flex-col justify-between space-y-4 transition-all hover:bg-[#121212]"
                style={{ borderColor: iem.color + "44" }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-[#888888] uppercase tracking-wider">
                      {iem.brand}
                    </span>
                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5"
                      style={{ backgroundColor: iem.color + "22", color: iem.color }}
                    >
                      {iem.signature}
                    </span>
                  </div>

                  <h3 className="font-sans text-base font-bold text-white tracking-tight mb-1">
                    {iem.name}
                  </h3>
                  <p className="text-[11px] font-mono text-[#8E8E93] mb-3">
                    {iem.driverType}
                  </p>
                  <p className="text-xs font-sans text-[#A0A0A5] leading-relaxed line-clamp-3">
                    {iem.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1c1c1c] flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-white">
                    {formatPrice(iem.priceUSD)}
                  </span>
                  <Link
                    href={`/collection?search=${encodeURIComponent(iem.name)}`}
                    className="text-xs font-mono text-white hover:text-[#D4FF00] underline uppercase tracking-wider"
                  >
                    Beli Unit →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
