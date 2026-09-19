"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GraphComparator from "@/components/GraphComparator";
import { useLanguage } from "@/context/LanguageContext";
import { KeyboardArrowRight } from "@/components/ui/keyboard-arrow";

export default function GraphPage() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState(0);
  const [selectedSignatureIndex, setSelectedSignatureIndex] = useState(0);

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
    <div className="flex flex-col min-h-screen bg-[#080808] text-[#FAF9F6] font-sans selection:bg-white selection:text-black">
      <Navbar />

      <main className="relative w-full overflow-hidden flex-grow pt-24">
        {/* 1. HERO SECTION */}
        <section className="w-full max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 py-16 flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2">
            <span className="text-xs font-mono text-[#71717a] uppercase tracking-[0.25em] font-semibold block mb-3">
              Audio Measurement & Acoustics
            </span>
            <h1 className="font-heading text-6xl md:text-7xl lg:text-[96px] font-bold uppercase tracking-tight leading-[0.9] text-white mb-8">
              LEARN ABOUT<br />
              FREQUENCY<br />
              GRAPH
            </h1>
            <p className="text-sm font-sans text-[#a1a1aa] leading-relaxed max-w-sm">
              Sistem visualisasi respons frekuensi presisi untuk memahami tonalitas, timbre akustik, dan karakteristik setiap IEM sebelum Anda memutuskan.
            </p>
          </div>

          <div className="w-full md:w-1/2 flex justify-end">
            <div className="relative w-full max-w-[500px] aspect-[4/5] rounded-[24px] bg-[#141414] flex flex-col items-center justify-center group overflow-hidden shadow-2xl">
              <img 
                src="https://blogs.qsc.com/live-sound/wp-content/uploads/sites/3/2024/06/IEM-Hero-Image-copy.jpg" 
                alt="Audiophile listening with IEMs" 
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 rounded-[24px]" 
              />
              <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#080808] to-transparent z-10" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end gap-1.5 opacity-20 z-0">
                 {[40, 25, 60, 30, 80, 45, 90, 50, 70, 35, 65, 40, 75, 20, 55].map((h, i) => (
                   <div 
                     key={i} 
                     className="flex-1 bg-white rounded-full transition-all duration-700 group-hover:bg-neutral-300" 
                     style={{ height: `${h}px` }} 
                   />
                 ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2. HOW TO READ GRAPH SECTION */}
        <section className="w-full bg-[#080808] py-20">
          <div className="w-full max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12">
            <div className="flex justify-between items-end pb-4 mb-8">
              <div>
                <span className="text-xs font-mono text-[#71717a] tracking-[0.25em] uppercase block mb-2 font-semibold">
                  Acoustic Fundamentals
                </span>
                <h2 className="font-heading text-3xl font-bold uppercase tracking-wide text-white">
                  HOW TO READ GRAPH
                </h2>
              </div>
              <div className="flex gap-2 pb-1">
                {graphSections.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeSection === i ? "w-6 bg-white" : "w-2 bg-[#222222]"
                    }`} 
                  />
                ))}
              </div>
            </div>

            <div className="w-full bg-[#141414] rounded-[24px] overflow-hidden flex flex-col shadow-2xl">
              <div className="w-full h-[420px] relative p-6 sm:p-8 flex items-center justify-center overflow-hidden bg-[#141414]">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

                <div className="relative z-10 w-full h-full">
                  <svg viewBox="0 0 1000 400" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="fadeWhite" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="white" stopOpacity="0.35" />
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

                    <path d="M 0 180 C 40 181, 100 185, 150 195 C 200 205, 250 210, 300 210 C 350 210, 450 210, 500 205 C 530 202, 570 170, 600 140 C 620 120, 640 120, 650 120 C 670 120, 690 140, 700 140 C 720 140, 730 130, 750 130 C 770 130, 780 145, 800 145 C 820 145, 830 135, 850 135 C 870 135, 880 160, 900 160 C 940 160, 970 230, 1000 260" fill="none" stroke="#2a2a2a" strokeWidth="2.5" />
                    
                    <g clipPath="url(#highlightClip)">
                       <path d="M 0 180 C 40 181, 100 185, 150 195 C 200 205, 250 210, 300 210 C 350 210, 450 210, 500 205 C 530 202, 570 170, 600 140 C 620 120, 640 120, 650 120 C 670 120, 690 140, 700 140 C 720 140, 730 130, 750 130 C 770 130, 780 145, 800 145 C 820 145, 830 135, 850 135 C 870 135, 880 160, 900 160 C 940 160, 970 230, 1000 260 L 1000 400 L 0 400 Z" fill="url(#fadeWhite)" />
                       <path d="M 0 180 C 40 181, 100 185, 150 195 C 200 205, 250 210, 300 210 C 350 210, 450 210, 500 205 C 530 202, 570 170, 600 140 C 620 120, 640 120, 650 120 C 670 120, 690 140, 700 140 C 720 140, 730 130, 750 130 C 770 130, 780 145, 800 145 C 820 145, 830 135, 850 135 C 870 135, 880 160, 900 160 C 940 160, 970 230, 1000 260" fill="none" stroke="white" strokeWidth="4" />
                    </g>
                  </svg>
                </div>

                <div className="absolute bottom-3 left-8 right-8 flex justify-between text-[11px] text-[#71717a] font-mono pointer-events-none px-4">
                  <span>20Hz</span>
                  <span>100Hz</span>
                  <span>1kHz</span>
                  <span>10kHz</span>
                  <span>20kHz</span>
                </div>
              </div>

              {/* Bottom Control Bar: Concentric nested radius R_inner = R_outer - margin = 24px - 16px = 8px */}
              <div className="p-4 sm:p-6 bg-[#181818] rounded-[8px] m-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <button 
                    onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                    className="w-10 h-10 rounded-full bg-[#242424] hover:bg-[#2c2c2c] text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={activeSection === 0}
                    aria-label="Previous Section"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setActiveSection(Math.min(graphSections.length - 1, activeSection + 1))}
                    className="w-10 h-10 rounded-full bg-[#242424] hover:bg-[#2c2c2c] text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed sm:hidden"
                    disabled={activeSection === graphSections.length - 1}
                    aria-label="Next Section"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 px-2 sm:px-4 text-center sm:text-left">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeSection}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col"
                    >
                      <h3 className="text-base sm:text-lg font-heading font-bold text-white uppercase tracking-wider mb-1">
                        {graphSections[activeSection].title}
                      </h3>
                      <p className="text-xs sm:text-sm font-sans text-[#a1a1aa] leading-relaxed">
                        {graphSections[activeSection].desc}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <button 
                  onClick={() => setActiveSection(Math.min(graphSections.length - 1, activeSection + 1))}
                  className="hidden sm:flex items-center gap-2 rounded-full bg-white hover:bg-[#e8e8e8] text-[#131313] px-6 py-2.5 text-xs font-bold font-mono tracking-wider transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
                  disabled={activeSection === graphSections.length - 1}
                >
                  <span>NEXT SECTION</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SOUND SIGNATURES (MINIMALIST SWISS TYPOGRAPHY) */}
        <section id="sound-signatures-editorial" className="w-full bg-[#080808] py-28">
          <div className="w-full max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12">
            
            {/* Editorial Header */}
            <div className="max-w-2xl mb-16">
              <span className="text-xs font-mono text-[#71717a] tracking-[0.25em] uppercase block mb-3 font-semibold">
                SOUND SIGNATURES
              </span>
              <h2 className="font-heading text-4xl md:text-5xl font-light tracking-tight text-white leading-[1.1] mb-4">
                Eksplorasi karakter dan cita rasa audio.
              </h2>
              <p className="text-sm font-sans text-[#8e8e93] leading-relaxed">
                Setiap IEM dirancang dengan kurva respons frekuensi yang berbeda. Pilih profil di bawah untuk memahami karakteristik suaranya.
              </p>
            </div>

            {/* Asymmetrical 2-Column Typographic Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              
              {/* Left Column: Typographic Selector (5 cols) */}
              <div className="lg:col-span-5 flex flex-col space-y-3">
                {acousticProfiles.map((p, idx) => {
                  const isSelected = selectedSignatureIndex === idx;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedSignatureIndex(idx)}
                      className={`text-left group cursor-pointer transition-all duration-300 p-5 rounded-[16px] flex items-baseline gap-5 ${
                        isSelected
                          ? "bg-[#181818] shadow-lg"
                          : "bg-transparent hover:bg-[#121212]"
                      }`}
                    >
                      <span className={`font-mono text-sm font-semibold transition-colors ${isSelected ? 'text-white' : 'text-[#52525b]'}`}>
                        {p.number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className={`font-heading text-xl md:text-2xl tracking-tight transition-colors ${
                          isSelected ? 'text-white font-bold' : 'text-[#71717a] group-hover:text-[#d4d4d8]'
                        }`}>
                          {p.name}
                        </div>
                        <div className="text-xs font-mono text-[#888888] mt-1 truncate">
                          {p.subtitle}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white self-center" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Acoustic Curve & Details (7 cols) */}
              <div className="lg:col-span-7 flex flex-col space-y-6">
                
                {/* Minimalist Vector Curve Canvas Card */}
                <div className="w-full bg-[#141414] rounded-[24px] p-6 md:p-8 shadow-xl">
                  <div className="h-56 w-full relative flex items-center justify-center">
                    <svg viewBox="0 0 1000 200" className="w-full h-full" preserveAspectRatio="none">
                      {/* Faint reference baseline */}
                      <line x1="0" y1="100" x2="1000" y2="100" stroke="#222222" strokeWidth="1" strokeDasharray="4 4" />

                      {/* Smooth Response Curve Line */}
                      <motion.path
                        key={`curve-line-${selectedSignatureIndex}`}
                        initial={{ pathLength: 0, opacity: 0.3 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        d={activeProfile.curvePath}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                      />
                    </svg>
                  </div>

                  <div className="flex justify-between text-[11px] font-mono text-[#71717a] tracking-wider uppercase pt-4">
                    <span>20Hz Bass</span>
                    <span>1kHz Vokal</span>
                    <span>20kHz Treble</span>
                  </div>
                </div>

                {/* Editorial Description & Details Card */}
                <div className="bg-[#141414] rounded-[24px] p-6 md:p-8 space-y-6 shadow-xl">
                  <p className="text-sm md:text-base font-sans text-[#a1a1aa] leading-relaxed">
                    {activeProfile.desc}
                  </p>

                  <div className="space-y-3 text-xs font-mono">
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                      <span className="text-[#71717a] min-w-[140px]">Kesesuaian Musik</span>
                      <span className="text-white font-medium">{activeProfile.genres}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                      <span className="text-[#71717a] min-w-[140px]">Model Referensi</span>
                      <span className="text-white font-medium">{activeProfile.models}</span>
                    </div>
                  </div>

                  {/* Clean Action Pill CTA */}
                  <div className="pt-2">
                    <Link
                      href={`/collection?signature=${activeProfile.id}`}
                      className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#1e1e1e] hover:bg-[#282828] text-white text-xs font-semibold tracking-wide transition-all shadow cursor-pointer group"
                    >
                      <span>Jelajahi IEM {activeProfile.name}</span>
                      <KeyboardArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
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
        <section className="w-full relative py-36 flex items-center justify-center bg-[#080808]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

          <div className="relative z-10 w-full max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col items-center justify-center text-center space-y-7">
            <span className="font-mono text-xs text-[#a1a1aa] uppercase tracking-[0.25em] font-semibold">
              TONAL ZONE CURATED VAULT
            </span>

            <h2 className="font-heading text-4xl sm:text-6xl md:text-7xl font-bold uppercase tracking-tight text-white leading-tight">
              TEMUKAN IEM SESUAI<br />KARAKTER SUARA ANDA
            </h2>

            <p className="font-sans text-sm sm:text-base text-[#8e8e93] leading-relaxed max-w-xl">
              Jelajahi lebih dari 50+ IEM, DAC/AMP, dan kabel upgrade dari brand kelas dunia dengan jaminan keaslian dan proteksi transaksi escrow resmi.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/collection"
                className="rounded-full bg-white hover:bg-[#e8e8e8] text-[#131313] font-bold px-8 py-3.5 text-xs font-mono tracking-wider uppercase transition-all shadow-lg inline-flex items-center gap-2 cursor-pointer group"
              >
                <span>Buka Katalog Koleksi</span>
                <KeyboardArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("comparator");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="rounded-full bg-[#1e1e1e] hover:bg-[#282828] text-[#a0a0a0] hover:text-white px-8 py-3.5 text-xs font-mono font-semibold tracking-wider uppercase transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Bandingkan Grafik</span>
                <span>↑</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
