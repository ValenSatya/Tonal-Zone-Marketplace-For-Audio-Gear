"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MotionButton from "@/components/MotionButton";
import OptionWheel from "@/components/OptionWheel";
import GraphComparator from "@/components/GraphComparator";
import { useLanguage } from "@/context/LanguageContext";

export default function GraphPage() {
  const { t } = useLanguage();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [selectedGenreIndex, setSelectedGenreIndex] = useState(3);
  const [activeSection, setActiveSection] = useState(0);

  const graphSections = [
    {
      title: "SUB-BASS (20 - 60 Hz)",
      desc: "Deep rumble, sub-harmonics, physical vibration. Crucial for EDM and cinematic scores.",
      startX: 0,
      endX: 150
    },
    {
      title: "MID-BASS (60 - 250 Hz)",
      desc: "Punch, kick drums, bass guitar fundamentals. Too much causes muddiness, too little sounds thin.",
      startX: 150,
      endX: 350
    },
    {
      title: "LOWER MIDS (250 - 1000 Hz)",
      desc: "Fundamental frequencies of most instruments and male vocals. The core of the sound signature.",
      startX: 350,
      endX: 550
    },
    {
      title: "UPPER MIDS (1k - 3k Hz)",
      desc: "Female vocals, electric guitars, snare attack. Human ear is most sensitive here. Can cause shoutiness if elevated.",
      startX: 550,
      endX: 700
    },
    {
      title: "PRESENCE (3k - 6k Hz)",
      desc: "Clarity, crispness, detail. Enhances intelligibility but can be fatiguing if too harsh.",
      startX: 700,
      endX: 800
    },
    {
      title: "TREBLE / SIBILANCE (6k - 10k Hz)",
      desc: "Cymbals, high-hats, 'S' and 'T' consonants. Defines the brightness and airiness.",
      startX: 800,
      endX: 900
    },
    {
      title: "AIR (10k - 20k Hz)",
      desc: "Harmonics, room acoustics, soundstage width. Provides a sense of openness.",
      startX: 900,
      endX: 1000
    }
  ];

  const genreImages = [
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/model-iem-untuk-hero.webp",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/model-iem-untuk-hero.webp"
  ];

  const [selectedSignatureIndex, setSelectedSignatureIndex] = useState(0);

  const acousticProfiles = [
    {
      id: "WARM",
      number: "01",
      name: "Harman Target",
      subtitle: "Balanced Natural Vocal",
      desc: "Target kurva paling populer dalam audio modern. Menghasilkan sub-bass empuk yang terpisah rapi dari mid-bass, dipadukan dengan vokal intim yang jernih dan bebas sibilance.",
      genres: "J-Pop, Acoustic, Indie Rock, R&B",
      models: "Tangzu Wan'er, Moondrop Variations",
      curvePath: "M 0 65 C 40 65, 80 85, 140 105 C 200 115, 300 115, 400 110 C 500 105, 580 50, 650 45 C 720 40, 780 75, 850 70 C 920 65, 960 75, 1000 80",
    },
    {
      id: "V_SHAPE",
      number: "02",
      name: "Dynamic V-Shape",
      subtitle: "High Energy Bass & Sparkle",
      desc: "Tuning bertenaga untuk hiburan dinamis. Rentang bass dan treble ditingkatkan secara bersamaan sehingga ketukan drum terasa mantap dan detail simbal terdengar gemerlap.",
      genres: "EDM, Hip-Hop, Gaming, Modern Pop",
      models: "Sennheiser IE 600, Letshuoer S12 Pro",
      curvePath: "M 0 45 C 50 45, 100 65, 180 95 C 260 120, 380 135, 480 135 C 580 135, 680 100, 750 55 C 820 25, 900 35, 1000 40",
    },
    {
      id: "NEUTRAL",
      number: "03",
      name: "Neutral Reference",
      subtitle: "Studio Uncoloured Precision",
      desc: "Akurasi mutlak tanpa pewarnaan frekuensi buatan. Dirancang untuk mixing engineer dan penikmat audio yang ingin mendengar rekaman persis seperti aslinya di studio.",
      genres: "Classical, Orchestral, Studio Mixing, Jazz",
      models: "64 Audio U12t, Truthear Zero:RED",
      curvePath: "M 0 95 C 80 95, 200 95, 350 95 C 450 95, 520 90, 600 68 C 680 50, 750 65, 820 80 C 890 90, 950 95, 1000 95",
    },
    {
      id: "WARM_LUSH",
      number: "04",
      name: "Warm & Lush",
      subtitle: "Smooth Analog Midrange",
      desc: "Menghadirkan kehangatan instrumen organik, vokal tebal berbobot, dan treble yang digulung halus untuk mendengarkan musik santai berjam-jam tanpa rasa lelah.",
      genres: "Vinyl Jazz, Blues, Lo-Fi, Soul",
      models: "Final Audio E3000, Meze 109 PRO",
      curvePath: "M 0 70 C 60 70, 120 75, 220 80 C 320 85, 450 90, 560 95 C 640 95, 720 75, 800 85 C 870 95, 940 115, 1000 120",
    },
  ];

  const activeProfile = acousticProfiles[selectedSignatureIndex];

  return (
    <div className="flex flex-col min-h-screen bg-[#0e0e0e] text-[#FAF9F6] font-sans selection:bg-[#D4FF00] selection:text-[#0e0e0e]">
      <Navbar />

      <main className="relative w-full overflow-hidden flex-grow pt-24">
        {/* 1. HERO SECTION */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-16 flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2">
            <h1 className="font-heading text-6xl md:text-7xl lg:text-[100px] font-bold uppercase tracking-tight leading-[0.9] text-[#FAF9F6] mb-8">
              LEARN ABOUT<br />
              FREQUENCY<br />
              GRAPH
            </h1>
            <p className="text-sm font-sans text-[#FAF9F6]/80 leading-relaxed max-w-sm">
              Professional in-ear monitoring system engineered for high-fidelity clinical environments and elite technical audio production.
            </p>
          </div>

          <div className="w-full md:w-1/2 flex justify-end">
            <div className="relative w-full max-w-[500px] aspect-[4/5] border border-[#222] bg-[#1a1a1a] flex flex-col items-center justify-center group overflow-hidden">
              <img 
                src="https://blogs.qsc.com/live-sound/wp-content/uploads/sites/3/2024/06/IEM-Hero-Image-copy.jpg" 
                alt="Audiophile listening with IEMs" 
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" 
              />
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0e0e0e] to-transparent z-10" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end gap-1.5 opacity-10 z-0">
                 {[40, 25, 60, 30, 80, 45, 90, 50, 70, 35, 65, 40, 75, 20, 55].map((h, i) => (
                   <div key={i} className="flex-1 bg-white transition-all duration-1000 group-hover:bg-[#D4FF00]" style={{ height: `${h}px` }} />
                 ))}
              </div>
              <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-[#D4FF00] opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-[#D4FF00] opacity-50 group-hover:opacity-100 transition-opacity z-20" />
            </div>
          </div>
        </section>

        {/* 2. HOW TO READ GRAPH SECTION */}
        <section className="w-full bg-[#0a0a0a] border-t border-[#222]">
          <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-20">
            <div className="flex justify-between items-end border-b border-[#222] pb-4 mb-8">
              <h2 className="font-heading text-3xl font-bold uppercase tracking-widest text-[#FAF9F6]">
                HOW TO READ GRAPH
              </h2>
              <div className="flex gap-3 pb-1">
                {graphSections.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-colors duration-500 ${activeSection === i ? 'bg-white' : 'bg-[#333]'}`} />
                ))}
              </div>
            </div>

            <div className="w-full border border-[#222] bg-[#0a0a0a] rounded-sm overflow-hidden flex flex-col shadow-lg">
              <div className="w-full h-[450px] relative border-b border-[#222] p-8 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>

                <div className="relative z-10 w-full h-full">
                  <svg viewBox="0 0 1000 400" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="fadeWhite" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="white" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                      </linearGradient>
                      <clipPath id="highlightClip">
                        <motion.rect
                          initial={false}
                          animate={{
                            x: graphSections[activeSection].startX,
                            width: graphSections[activeSection].endX - graphSections[activeSection].startX
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          y="0"
                          height="400"
                        />
                      </clipPath>
                    </defs>

                    <path d="M 0 180 C 40 181, 100 185, 150 195 C 200 205, 250 210, 300 210 C 350 210, 450 210, 500 205 C 530 202, 570 170, 600 140 C 620 120, 640 120, 650 120 C 670 120, 690 140, 700 140 C 720 140, 730 130, 750 130 C 770 130, 780 145, 800 145 C 820 145, 830 135, 850 135 C 870 135, 880 160, 900 160 C 940 160, 970 230, 1000 260" fill="none" stroke="#444" strokeWidth="3" />
                    
                    <g clipPath="url(#highlightClip)">
                       <path d="M 0 180 C 40 181, 100 185, 150 195 C 200 205, 250 210, 300 210 C 350 210, 450 210, 500 205 C 530 202, 570 170, 600 140 C 620 120, 640 120, 650 120 C 670 120, 690 140, 700 140 C 720 140, 730 130, 750 130 C 770 130, 780 145, 800 145 C 820 145, 830 135, 850 135 C 870 135, 880 160, 900 160 C 940 160, 970 230, 1000 260 L 1000 400 L 0 400 Z" fill="url(#fadeWhite)" />
                       <path d="M 0 180 C 40 181, 100 185, 150 195 C 200 205, 250 210, 300 210 C 350 210, 450 210, 500 205 C 530 202, 570 170, 600 140 C 620 120, 640 120, 650 120 C 670 120, 690 140, 700 140 C 720 140, 730 130, 750 130 C 770 130, 780 145, 800 145 C 820 145, 830 135, 850 135 C 870 135, 880 160, 900 160 C 940 160, 970 230, 1000 260" fill="none" stroke="white" strokeWidth="5" />
                    </g>
                  </svg>
                </div>

                <div className="absolute bottom-2 left-8 right-8 flex justify-between text-[10px] text-[#FAF9F6]/30 font-mono pointer-events-none px-4">
                  <span>20Hz</span>
                  <span>100Hz</span>
                  <span>1kHz</span>
                  <span>10kHz</span>
                  <span>20kHz</span>
                </div>
              </div>

              <div className="w-full flex h-32 relative bg-[#0e0e0e]">
                <button 
                  onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                  className={`w-16 flex items-center justify-center border-r border-[#222] transition-colors ${activeSection === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#111111] cursor-pointer'}`}
                  disabled={activeSection === 0}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FAF9F6" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex-1 p-6 md:p-8 flex flex-col justify-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSection}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col"
                    >
                      <h3 className="text-lg md:text-xl font-heading font-bold text-white uppercase tracking-wider mb-2">{graphSections[activeSection].title}</h3>
                      <p className="text-xs md:text-sm font-sans text-[#FAF9F6]/60 leading-relaxed truncate">{graphSections[activeSection].desc}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <button 
                  onClick={() => setActiveSection(Math.min(graphSections.length - 1, activeSection + 1))}
                  className={`w-1/4 max-w-[200px] border-l border-[#222] bg-[#0a0a0a] transition-colors flex flex-col items-center justify-center gap-2 group ${activeSection === graphSections.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#111111] cursor-pointer'}`}
                  disabled={activeSection === graphSections.length - 1}
                >
                  <span className="text-[10px] font-mono text-[#FAF9F6]/70 uppercase tracking-widest hidden sm:block">NEXT SECTION</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FAF9F6" strokeWidth="2" className={activeSection === graphSections.length - 1 ? "" : "group-hover:translate-x-2 transition-transform"}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SOUND SIGNATURES (MINIMALIST SWISS TYPOGRAPHY) */}
        <section id="sound-signatures-editorial" className="w-full bg-[#0e0e0e] border-t border-[#1a1a1a] py-32">
          <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
            
            {/* Editorial Header */}
            <div className="max-w-2xl mb-20">
              <span className="text-xs font-mono text-[#71717A] tracking-[0.25em] uppercase block mb-4">
                SOUND SIGNATURES
              </span>
              <h2 className="font-heading text-4xl md:text-6xl font-light tracking-tight text-[#FAF9F6] leading-[1.05] mb-6">
                Eksplorasi karakter dan cita rasa audio.
              </h2>
              <p className="text-sm font-sans text-[#8E8E93] leading-relaxed">
                Setiap IEM dirancang dengan kurva respons frekuensi yang berbeda. Pilih profil di bawah untuk memahami karakteristik suaranya.
              </p>
            </div>

            {/* Asymmetrical 2-Column Typographic Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
              
              {/* Left Column: Typographic Selector (5 cols) */}
              <div className="lg:col-span-5 flex flex-col space-y-8">
                {acousticProfiles.map((p, idx) => {
                  const isSelected = selectedSignatureIndex === idx;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedSignatureIndex(idx)}
                      className="text-left group cursor-pointer transition-all duration-300 pb-6 border-b border-[#1c1c1c]"
                    >
                      <div className="flex items-baseline gap-6">
                        <span className={`font-mono text-sm transition-colors ${isSelected ? 'text-[#FAF9F6]' : 'text-[#444444]'}`}>
                          {p.number}
                        </span>
                        <div>
                          <div className={`font-heading text-2xl md:text-3xl tracking-tight transition-colors ${
                            isSelected ? 'text-[#FAF9F6] font-bold' : 'text-[#555555] group-hover:text-[#999999]'
                          }`}>
                            {p.name}
                          </div>
                          <div className="text-xs font-mono text-[#666666] mt-1">
                            {p.subtitle}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Acoustic Curve & Details (7 cols) */}
              <div className="lg:col-span-7 flex flex-col space-y-10">
                
                {/* Minimalist Vector Curve Canvas */}
                <div className="w-full pb-8 border-b border-[#1c1c1c]">
                  <div className="h-56 w-full relative flex items-center justify-center">
                    <svg viewBox="0 0 1000 200" className="w-full h-full" preserveAspectRatio="none">
                      {/* Faint reference baseline */}
                      <line x1="0" y1="100" x2="1000" y2="100" stroke="#1f1f1f" strokeWidth="1" strokeDasharray="4 4" />

                      {/* Smooth Response Curve Line */}
                      <motion.path
                        key={`curve-line-${selectedSignatureIndex}`}
                        initial={{ pathLength: 0, opacity: 0.3 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        d={activeProfile.curvePath}
                        fill="none"
                        stroke="#FAF9F6"
                        strokeWidth="2.5"
                      />
                    </svg>
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-[#444444] tracking-wider uppercase pt-4">
                    <span>20Hz Bass</span>
                    <span>1kHz Vokal</span>
                    <span>20kHz Treble</span>
                  </div>
                </div>

                {/* Editorial Description & Details */}
                <div className="space-y-8">
                  <p className="text-base font-sans text-[#A1A1AA] leading-relaxed max-w-xl">
                    {activeProfile.desc}
                  </p>

                  <div className="space-y-3 text-xs font-mono">
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                      <span className="text-[#666666] min-w-[140px]">Kesesuaian Musik</span>
                      <span className="text-[#FAF9F6]">{activeProfile.genres}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                      <span className="text-[#666666] min-w-[140px]">Model Referensi</span>
                      <span className="text-[#FAF9F6]">{activeProfile.models}</span>
                    </div>
                  </div>

                  {/* Clean Action Link */}
                  <div className="pt-4">
                    <Link
                      href={`/collection?signature=${activeProfile.id}`}
                      className="inline-flex items-center gap-2 text-sm font-mono text-[#FAF9F6] hover:text-white group transition-colors"
                    >
                      <span className="border-b border-white pb-0.5">Jelajahi IEM {activeProfile.name}</span>
                      <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
                    </Link>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* 4. PRECISION SQUIGLINK GRAPH COMPARATOR (INTERACTIVE ENGINE) */}
        <section id="comparator" className="w-full">
          <GraphComparator />
        </section>

        {/* 5. EXPLORE COLLECTION CTA SECTION */}
        <section className="w-full relative border-t border-[#1c1c1c] py-40 flex items-center justify-center bg-[#0a0a0a]">
          {/* Subtle Grid Background with Deep Vignette */}
          <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: "linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0a0a0a_90%)] pointer-events-none"></div>

          <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 lg:px-12 flex flex-col items-center justify-center text-center space-y-8">
            <span className="font-mono text-xs text-[#D4FF00] uppercase tracking-[0.25em] font-bold">
              TONAL ZONE CURATED VAULT
            </span>

            <h2 className="font-heading text-4xl sm:text-6xl md:text-7xl font-bold uppercase tracking-tight text-white leading-tight">
              TEMUKAN IEM SESUAI<br />KARAKTER SUARA ANDA
            </h2>

            <p className="font-sans text-sm sm:text-base text-[#8E8E93] leading-relaxed max-w-xl">
              Jelajahi lebih dari 50+ IEM, DAC/AMP, dan kabel upgrade dari brand kelas dunia dengan jaminan keaslian dan proteksi transaksi escrow resmi.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link href="/collection">
                <MotionButton variant="neon" className="px-10 py-4 text-xs font-bold font-mono tracking-widest uppercase">
                  Buka Katalog Koleksi →
                </MotionButton>
              </Link>
              <Link href="#bestseller">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("comparator");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-8 py-4 bg-[#141414] hover:bg-[#1c1c1c] text-white border border-[#262626] font-mono text-xs font-bold tracking-widest uppercase transition-colors cursor-pointer"
                >
                  Bandingkan Grafik ↑
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
