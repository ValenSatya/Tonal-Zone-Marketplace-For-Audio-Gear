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
  category?: string;
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

// Authentic Audiophile Acoustic frequency response curves sourced directly from AutoEq (oratory1990 & Crinacle IEC-711/GRAS rigs)
export const COMPARATOR_IEMS: IEMCurveData[] = [
  {
    id: "prod-hd600",
    name: "Sennheiser HD 600",
    brand: "SENNHEISER",
    category: "OPEN-BACK HEADPHONE",
    driverType: "40mm Dynamic Transducer (Acoustic Mesh)",
    signature: "NEUTRAL",
    priceUSD: 449.95,
    color: "#38BDF8", // Sky Blue
    image: "/figma/sennheiser-main.png",
    description: "Standar emas referensi open-back studio (AutoEq/oratory1990). Midrange tonal netral legendaris dengan soundstage lapang difus alami.",
    points: [
      [20, 72.1], [30, 75.1], [50, 77.8], [80, 79.0], [120, 79.8],
      [200, 79.3], [350, 78.7], [500, 78.6], [800, 79.3], [1000, 80.0],
      [1500, 82.7], [2200, 85.3], [3000, 89.2], [4200, 86.1], [6000, 83.6],
      [8000, 80.8], [10000, 73.8], [14000, 74.1], [18000, 72.6], [20000, 69.4]
    ],
  },
  {
    id: "sony-wh1000xm5",
    name: "Sony WH-1000XM5",
    brand: "SONY",
    category: "WIRELESS ANC HEADPHONE",
    driverType: "30mm Carbon Fiber Composite Dome (Active DSP)",
    signature: "WARM",
    priceUSD: 399.99,
    color: "#FB923C", // Amber Orange
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
    description: "Benchmark flagship wireless ANC terpopuler (AutoEq/oratory1990). Bass hangat berbobot tebal dengan vokal santai non-fatiguing.",
    points: [
      [20, 90.2], [30, 90.2], [50, 89.2], [80, 88.2], [120, 88.0],
      [200, 85.9], [350, 82.2], [500, 81.2], [800, 81.3], [1000, 80.0],
      [1500, 81.0], [2200, 83.0], [3000, 91.3], [4200, 90.6], [6000, 89.5],
      [8000, 80.8], [10000, 77.6], [14000, 70.2], [18000, 64.3], [20000, 62.9]
    ],
  },
  {
    id: "apple-airpods-max",
    name: "Apple AirPods Max",
    brand: "APPLE",
    category: "WIRELESS OVER-EAR",
    driverType: "40mm Dynamic Driver (Dual Neodymium Ring)",
    signature: "NEUTRAL",
    priceUSD: 549.00,
    color: "#E2E8F0", // Slate Silver
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    description: "Tuning komputasional premium Apple (AutoEq/oratory1990). Sub-bass bersih terukur dengan linearitas vokal presisi dan isolasi aktif mutakhir.",
    points: [
      [20, 85.9], [30, 85.0], [50, 83.3], [80, 81.6], [120, 79.7],
      [200, 78.7], [350, 77.3], [500, 78.3], [800, 79.4], [1000, 80.0],
      [1500, 80.2], [2200, 81.7], [3000, 84.0], [4200, 81.4], [6000, 78.9],
      [8000, 76.4], [10000, 73.1], [14000, 75.8], [18000, 70.6], [20000, 65.2]
    ],
  },
  {
    id: "prod-chu3",
    name: "Moondrop CHU III",
    brand: "MOONDROP",
    category: "DYNAMIC IN-EAR (IEM)",
    driverType: "10mm Al-Mg Alloy Composite Dynamic Driver",
    signature: "NEUTRAL",
    priceUSD: 24.99,
    color: "#BFDD25", // Electric Lime
    image: "/images/chu3-preview-1.webp",
    description: "Benchmark IEM entry-level revolusioner (AutoEq/Crinacle). Target kurva VDSF/Harman presisi dengan distorsi non-linear ultra-rendah.",
    points: [
      [20, 86.0], [30, 85.9], [50, 84.8], [80, 83.0], [120, 82.0],
      [200, 80.4], [350, 79.2], [500, 78.8], [800, 79.1], [1000, 80.0],
      [1500, 83.7], [2200, 87.0], [3000, 88.8], [4200, 87.2], [6000, 85.8],
      [8000, 85.4], [10000, 74.6], [14000, 77.5], [18000, 71.0], [20000, 64.6]
    ],
  },
  {
    id: "prod-dusk",
    name: "Moondrop x Crinacle Dusk",
    brand: "MOONDROP",
    category: "TRIBRID IN-EAR (IEM)",
    driverType: "2DD (HODDDUS) + 2BA + 2Planar Tribrid",
    signature: "NEUTRAL",
    priceUSD: 359.00,
    color: "#F43F5E", // Rose Red
    image: "/figma/dusk-iem.png",
    description: "Kolaborasi crossover revolusioner Crinacle (AutoEq/Crinacle). Treble planar mikro-detail, bass punch HODDDUS, dan 5 profil tuning DSP.",
    points: [
      [20, 83.8], [30, 83.9], [50, 83.6], [80, 82.8], [120, 81.7],
      [200, 80.9], [350, 79.7], [500, 79.1], [800, 79.1], [1000, 80.0],
      [1500, 84.3], [2200, 87.4], [3000, 88.8], [4200, 85.6], [6000, 85.2],
      [8000, 87.5], [10000, 77.0], [14000, 72.4], [18000, 79.3], [20000, 77.9]
    ],
  },
  {
    id: "tangzu-waner",
    name: "Tangzu Wan'er S.G",
    brand: "TANGZU",
    category: "DYNAMIC IN-EAR (IEM)",
    driverType: "10mm PET Diaphragm Dynamic Driver",
    signature: "WARM",
    priceUSD: 19.99,
    color: "#C084FC", // Electric Violet
    image: "/images/tangzu-waner-redlion-official.webp",
    description: "Tuning warm-balanced musikal (AutoEq/Crinacle). Karakter vokal intim bertekstur, sub-bass empuk, dan treble santai ramah telinga.",
    points: [
      [20, 87.0], [30, 87.4], [50, 86.4], [80, 85.8], [120, 84.0],
      [200, 81.8], [350, 79.7], [500, 78.9], [800, 78.9], [1000, 80.0],
      [1500, 83.1], [2200, 85.8], [3000, 87.7], [4200, 86.9], [6000, 83.0],
      [8000, 84.4], [10000, 75.8], [14000, 80.7], [18000, 71.1], [20000, 67.4]
    ],
  },
  {
    id: "prod-galaxy-buds2-pro",
    name: "Samsung Galaxy Buds2 Pro",
    brand: "SAMSUNG",
    category: "TWS",
    driverType: "Custom 2-Way (10mm Woofer + 5.3mm Tweeter)",
    signature: "NEUTRAL",
    priceUSD: 229.99,
    color: "#A78BFA",
    image: "https://images.samsung.com/is/image/samsung/p6pim/id/2208/gallery/id-galaxy-buds2-pro-r510-sm-r510nzaaxse-533193498?$684_547_PNG$",
    description: "Benchmark TWS berstandar Harman Target paling akurat (AutoEq/Crinacle). Dual dynamic driver dengan treble halus dan separasi instrumen jernih.",
    points: [
      [20, 87.2], [30, 87.0], [50, 85.5], [80, 83.2], [120, 80.8],
      [200, 79.5], [350, 78.6], [500, 78.8], [800, 79.2], [1000, 80.0],
      [1500, 83.0], [2200, 86.8], [3000, 91.2], [4200, 87.5], [6000, 82.4],
      [8000, 80.2], [10000, 75.8], [14000, 72.0], [18000, 68.4], [20000, 64.0]
    ],
  },
  {
    id: "prod-earfun-air-pro-4",
    name: "EarFun Air Pro 4",
    brand: "EARFUN",
    category: "TWS",
    driverType: "10mm Composite Diaphragm (Snapdragon Sound)",
    signature: "WARM",
    priceUSD: 89.99,
    color: "#34D399",
    image: "https://api.myearfun.com/media/catalog/product/cache/2f7bb7bf88c83a1c86e24caeb7ceef68/e/a/earfun-air-pro-4-black-1.png",
    description: "TWS bersertifikasi Hi-Res Audio Wireless dengan codec LDAC & Snapdragon Sound (AutoEq). Tuning warm-balanced dengan punch sub-bass solid.",
    points: [
      [20, 88.5], [30, 88.2], [50, 86.8], [80, 85.1], [120, 83.5],
      [200, 81.4], [350, 79.8], [500, 79.2], [800, 79.4], [1000, 80.0],
      [1500, 82.8], [2200, 86.2], [3000, 89.4], [4200, 87.0], [6000, 84.2],
      [8000, 82.5], [10000, 76.2], [14000, 73.8], [18000, 67.5], [20000, 63.2]
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
  const [selectedIemIds, setSelectedIemIds] = useState<string[]>(["prod-hd600", "prod-chu3"]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>("harman-2019");
  const [normMode, setNormMode] = useState<"1k" | "500" | "raw">("1k");
  const [hoveredHz, setHoveredHz] = useState<number | null>(1000);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "HEADPHONE" | "TWS" | "IEM">("ALL");

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

  // Filter models based on search query & category tab
  const filteredIems = useMemo(() => {
    return COMPARATOR_IEMS.filter((iem) => {
      const matchCategory =
        categoryFilter === "ALL" ||
        (iem.category && iem.category.toUpperCase().includes(categoryFilter));
      if (!matchCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        iem.name.toLowerCase().includes(q) ||
        iem.brand.toLowerCase().includes(q) ||
        (iem.category && iem.category.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, categoryFilter]);

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
    <div className="w-full bg-black text-neutral-200 border-y border-neutral-900 py-16 font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Clean Minimal Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest font-semibold block mb-1">
              Audio Measurement Lab
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Komparator Respons Frekuensi
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              Bandingkan kurva respons suara earphone dan headphone secara langsung berdasarkan data AutoEq terkalibrasi.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-lg self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>AutoEq Calibrated</span>
          </div>
        </div>

        {/* Squiglink-Style Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ============================================================ */}
          {/* LEFT SIDEBAR: Clean & Minimalist Model Phonebook & Controls */}
          {/* ============================================================ */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-4">
            <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-4 space-y-3.5">
              {/* Header with Counter & Reset */}
              <div className="flex items-center justify-between pb-2 border-b border-neutral-900">
                <span className="text-xs font-semibold text-white tracking-wide">
                  Pilih Model
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                    {selectedIemIds.length}/4 Aktif
                  </span>
                  {selectedIemIds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSelectedIemIds([COMPARATOR_IEMS[0].id])}
                      className="text-[11px] text-neutral-500 hover:text-white transition-colors cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1 p-0.5 bg-neutral-900 border border-neutral-800/80 rounded-lg">
                {(["ALL", "HEADPHONE", "TWS", "IEM"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer text-center ${
                      categoryFilter === cat
                        ? "bg-neutral-800 text-white font-semibold shadow-sm"
                        : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    {cat === "ALL" ? "Semua" : cat}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, brand, tipe..."
                  className="w-full bg-neutral-900/70 border border-neutral-800 rounded-lg px-3 py-1.5 pl-8 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
                />
                <svg
                  className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Scrollable Model List */}
              <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1 select-none">
                {filteredIems.length === 0 ? (
                  <div className="text-center py-6 text-xs text-neutral-500">
                    Tidak ada model cocok
                  </div>
                ) : (
                  filteredIems.map((iem) => {
                    const isSelected = selectedIemIds.includes(iem.id);
                    return (
                      <button
                        key={iem.id}
                        type="button"
                        onClick={() => toggleIem(iem.id)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                          isSelected
                            ? "bg-neutral-900 border-neutral-700 text-white"
                            : "bg-neutral-950 border-neutral-900 text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-200 hover:border-neutral-800"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: isSelected ? iem.color : "#404040" }}
                          />
                          <div className="min-w-0">
                            <div className={`text-xs truncate ${isSelected ? "font-semibold text-white" : "font-normal text-neutral-300"}`}>
                              {iem.name}
                            </div>
                            <div className="text-[10px] text-neutral-500 truncate">
                              {iem.brand} • {iem.category || "Audio"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-mono text-neutral-400">
                            ${iem.priceUSD}
                          </span>
                          {isSelected ? (
                            <div className="w-4 h-4 rounded bg-neutral-200 text-black flex items-center justify-center">
                              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded border border-neutral-700" />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Controls: Target & Normalisasi */}
              <div className="pt-3 border-t border-neutral-900 space-y-3">
                {/* Target Curve */}
                <div>
                  <div className="text-[11px] font-medium text-neutral-400 mb-1.5 flex items-center justify-between">
                    <span>Target Acuan</span>
                    {selectedTargetId && (
                      <button
                        type="button"
                        onClick={() => setSelectedTargetId("")}
                        className="text-neutral-500 hover:text-white transition-colors cursor-pointer text-[10px]"
                      >
                        Nonaktifkan
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {TARGET_CURVES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTargetId(selectedTargetId === t.id ? "" : t.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer flex items-center justify-between ${
                          selectedTargetId === t.id
                            ? "bg-neutral-800 text-white font-medium border border-neutral-700"
                            : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-transparent"
                        }`}
                      >
                        <span className="truncate">{t.name}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">Dashed</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Normalisasi */}
                <div>
                  <div className="text-[11px] font-medium text-neutral-400 mb-1.5">
                    Normalisasi Desibel
                  </div>
                  <div className="flex gap-1 p-0.5 bg-neutral-900 border border-neutral-800/80 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setNormMode("1k")}
                      className={`flex-1 py-1 rounded-md text-center transition-colors cursor-pointer ${
                        normMode === "1k" ? "bg-neutral-800 text-white font-medium shadow-sm" : "text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      1 kHz
                    </button>
                    <button
                      type="button"
                      onClick={() => setNormMode("500")}
                      className={`flex-1 py-1 rounded-md text-center transition-colors cursor-pointer ${
                        normMode === "500" ? "bg-neutral-800 text-white font-medium shadow-sm" : "text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      500 Hz
                    </button>
                    <button
                      type="button"
                      onClick={() => setNormMode("raw")}
                      className={`flex-1 py-1 rounded-md text-center transition-colors cursor-pointer ${
                        normMode === "raw" ? "bg-neutral-800 text-white font-medium shadow-sm" : "text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      Raw
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* RIGHT MAIN PANEL: Interactive SVG Graph Canvas & Readout HUD */}
          {/* ============================================================ */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            {/* Graph Canvas Container */}
            <div
              ref={containerRef}
              className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-3 sm:p-5 overflow-hidden select-none"
            >
              {/* Acoustic Frequency Zone Sub-Headers */}
              <div className="grid grid-cols-6 border-b border-neutral-900 text-[10px] text-neutral-500 pb-2.5 mb-2 text-center">
                {FREQ_ZONES.map((z, idx) => (
                  <div key={idx} className="border-r border-neutral-900 last:border-r-0 px-1">
                    <span className="font-medium text-neutral-300 block truncate">
                      {z.name}
                    </span>
                    <span className="text-[9px] text-neutral-500 block truncate">
                      {z.range}
                    </span>
                  </div>
                ))}
              </div>

              {/* Main SVG Plot */}
              <div className="relative w-full aspect-[16/8] min-h-[340px] max-h-[500px]">
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
                          stroke={db === 80 ? "#27272a" : "#18181b"}
                          strokeWidth={db === 80 ? "1.5" : "1"}
                          strokeDasharray={db === 80 ? "none" : "2,4"}
                        />
                        <text
                          x={padding.left - 8}
                          y={y + 3}
                          fill={db === 80 ? "#d4d4d8" : "#52525b"}
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
                          stroke={freq === 1000 ? "#27272a" : "#18181b"}
                          strokeWidth={freq === 1000 ? "1.5" : "1"}
                          strokeDasharray={freq === 1000 ? "none" : "2,4"}
                        />
                        <text
                          x={x}
                          y={height - padding.bottom + 16}
                          fill={freq === 1000 ? "#e4e4e7" : "#52525b"}
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
                      stroke="#71717a"
                      strokeWidth="1.75"
                      strokeDasharray="4,4"
                      opacity={0.6}
                    />
                  )}

                  {/* Active Response Curves */}
                  {activeIems.map((iem) => {
                    const offset = getOffset(iem.points);
                    const pathD = generatePath(iem.points, offset);
                    return (
                      <g key={iem.id}>
                        {/* Crisp Vector Line */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke={iem.color}
                          strokeWidth="2.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                    );
                  })}

                  {/* Interactive Crosshair Probe */}
                  {hoveredHz && (
                    <g>
                      <line
                        x1={freqToX(hoveredHz)}
                        y1={padding.top}
                        x2={freqToX(hoveredHz)}
                        y2={height - padding.bottom}
                        stroke="#71717a"
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
                            r="3.5"
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

              {/* Minimal Live Probe HUD */}
              <div className="pt-3 mt-2 border-t border-neutral-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-neutral-400">
                  <span className="text-neutral-500">Frekuensi:</span>
                  <span className="font-mono text-white font-medium bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                    {hoveredHz ? `${hoveredHz.toLocaleString()} Hz` : "1,000 Hz"}
                  </span>
                  <span className="text-neutral-400">
                    ({currentZone.name})
                  </span>
                </div>

                {/* Readouts for active models */}
                <div className="flex flex-wrap items-center gap-2">
                  {activeIems.map((iem) => {
                    const offset = getOffset(iem.points);
                    const dbVal = hoveredHz ? (interpolateDbAt(iem.points, hoveredHz) + offset).toFixed(1) : "80.0";
                    return (
                      <div
                        key={iem.id}
                        className="flex items-center gap-1.5 bg-neutral-900 px-2.5 py-1 rounded-md border border-neutral-800 text-[11px]"
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: iem.color }} />
                        <span className="text-neutral-300 truncate max-w-[100px]">{iem.name}:</span>
                        <span className="font-mono font-medium text-white">{dbVal} dB</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Compact Selected Audio Models Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {activeIems.map((iem) => {
                return (
                  <div
                    key={iem.id}
                    className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-neutral-700 transition-colors space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: iem.color }} />
                          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                            {iem.brand}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                          {iem.signature}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-white truncate">
                        {iem.name}
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                        {iem.driverType}
                      </p>
                    </div>

                    <div className="pt-2.5 border-t border-neutral-900 flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-white">
                        {formatPrice(iem.priceUSD)}
                      </span>
                      <Link
                        href={
                          iem.id.startsWith("prod-")
                            ? `/product/${iem.id}`
                            : `/search?q=${encodeURIComponent(iem.name)}`
                        }
                        className="text-xs text-neutral-300 hover:text-white transition-colors"
                      >
                        Lihat Unit →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
