"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MotionButton from "@/components/MotionButton";
import OptionWheel from "@/components/OptionWheel";
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

  const iemSignatures = [
    {
      title: "V-SHAPE",
      image: "/placeholder.svg", // placeholder
    },
    {
      title: "U-SHAPE",
      image: "/placeholder.svg", // placeholder
    },
    {
      title: "NEUTRAL",
      image: "/placeholder.svg", // placeholder
    },
  ];

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
              
              {/* Image from User */}
              <img 
                src="https://blogs.qsc.com/live-sound/wp-content/uploads/sites/3/2024/06/IEM-Hero-Image-copy.jpg" 
                alt="Audiophile listening with IEMs" 
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700" 
              />

              {/* Decorative Audio Wave overlay at the bottom to connect to the graph theme */}
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0e0e0e] to-transparent z-10" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end gap-1.5 opacity-10 z-0">
                 {[40, 25, 60, 30, 80, 45, 90, 50, 70, 35, 65, 40, 75, 20, 55].map((h, i) => (
                   <div key={i} className="flex-1 bg-white transition-all duration-1000 group-hover:bg-[#D4FF00]" style={{ height: `${h}px` }} />
                 ))}
              </div>
              
              {/* Minimalist Accents */}
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
              {/* Graph Area */}
              <div className="w-full h-[450px] relative border-b border-[#222] p-8 flex items-center justify-center overflow-hidden">
                {/* Subtle Grid - White with low opacity */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>

                <div className="relative z-10 w-full h-full">
                  <svg viewBox="0 0 1000 400" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="fadeWhite" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="white" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                      </linearGradient>
                      {/* Define a clip path that moves based on activeSection */}
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

                    {/* Background curve to clip against (Realistic Neutral IEM curve mockup) */}
                    <path d="M 0 180 C 40 181, 100 185, 150 195 C 200 205, 250 210, 300 210 C 350 210, 450 210, 500 205 C 530 202, 570 170, 600 140 C 620 120, 640 120, 650 120 C 670 120, 690 140, 700 140 C 720 140, 730 130, 750 130 C 770 130, 780 145, 800 145 C 820 145, 830 135, 850 135 C 870 135, 880 160, 900 160 C 940 160, 970 230, 1000 260" fill="none" stroke="#444" strokeWidth="3" />
                    
                    {/* The highlight fade box, clipped to the region, bounded by the curve */}
                    <g clipPath="url(#highlightClip)">
                       <path d="M 0 180 C 40 181, 100 185, 150 195 C 200 205, 250 210, 300 210 C 350 210, 450 210, 500 205 C 530 202, 570 170, 600 140 C 620 120, 640 120, 650 120 C 670 120, 690 140, 700 140 C 720 140, 730 130, 750 130 C 770 130, 780 145, 800 145 C 820 145, 830 135, 850 135 C 870 135, 880 160, 900 160 C 940 160, 970 230, 1000 260 L 1000 400 L 0 400 Z" fill="url(#fadeWhite)" />
                       {/* The active portion of the line in white */}
                       <path d="M 0 180 C 40 181, 100 185, 150 195 C 200 205, 250 210, 300 210 C 350 210, 450 210, 500 205 C 530 202, 570 170, 600 140 C 620 120, 640 120, 650 120 C 670 120, 690 140, 700 140 C 720 140, 730 130, 750 130 C 770 130, 780 145, 800 145 C 820 145, 830 135, 850 135 C 870 135, 880 160, 900 160 C 940 160, 970 230, 1000 260" fill="none" stroke="white" strokeWidth="5" />
                    </g>
                  </svg>
                </div>

                {/* X-Axis labels inside the graph area */}
                <div className="absolute bottom-2 left-8 right-8 flex justify-between text-[10px] text-[#FAF9F6]/30 font-mono pointer-events-none px-4">
                  <span>20Hz</span>
                  <span>100Hz</span>
                  <span>1kHz</span>
                  <span>10kHz</span>
                  <span>20kHz</span>
                </div>
              </div>

              {/* Bottom Controls Area */}
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

        {/* 3. IEM SIGNATURE SECTION */}
        <section className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-20 border-t border-[#222]">
          <div className="border-b border-[#222] pb-4 mb-12">
            <h2 className="font-heading text-3xl font-bold uppercase tracking-widest text-[#FAF9F6]">
              IEM SIGNATURE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
            {iemSignatures.map((sig, idx) => (
              <div
                key={idx}
                className="relative w-full h-full overflow-hidden group cursor-pointer bg-[#0a0a0a]"
                onMouseEnter={() => setHoveredCard(idx)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Default State: Image */}
                <motion.div
                  className="absolute inset-0"
                  animate={{ opacity: hoveredCard === idx ? 0 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image src={sig.image} alt={sig.title} fill className="object-cover" />
                </motion.div>

                {/* Hover State: Yellow Background & Text */}
                <motion.div
                  className="absolute inset-0 bg-[#D4FF00] flex flex-col items-center justify-center text-[#0e0e0e]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredCard === idx ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="font-heading text-4xl font-bold uppercase tracking-widest mb-16">{sig.title}</h3>
                  <span className="font-mono font-bold uppercase tracking-widest text-xl">WHEN HOVER</span>
                </motion.div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. FIND YOUR SIGNATURE SECTION (CLEAN AESTHETIC) */}
        <section className="w-full bg-[#EEEEEE] pt-24 pb-32">
          <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">

            {/* Header Row */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-6">
              <h2 className="font-sans text-4xl lg:text-[46px] font-bold uppercase tracking-tight text-[#000] leading-none">
                FIND YOUR SIGNATURE
              </h2>

              {/* Tabs */}
              <div className="flex items-center gap-3 lg:gap-4 pb-1">
                {['Ear Phones', 'TWS', 'Cable', 'Headphones'].map((tab, i) => (
                  <button key={tab} className={`font-mono text-[10px] md:text-[11px] font-semibold tracking-wider uppercase px-4 py-2 border border-[#000] transition-colors ${i === 0 ? 'bg-[#000] text-[#FFF]' : 'bg-transparent text-[#000] hover:bg-[#F4F4F4]'}`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider Line (indented) */}
            <div className="w-full flex justify-end mb-16">
              <div className="w-[88%] lg:w-[90%] h-[1px] bg-[#000]"></div>
            </div>

            {/* Main Content Row */}
            <div className="flex flex-col lg:flex-row items-stretch justify-between relative gap-8 lg:gap-12">

              {/* Left Column: Image Box */}
              <div className="w-full lg:w-[45%] relative aspect-[4/3] lg:aspect-square">

                {/* Image Container */}
                <div className="relative w-full h-full overflow-hidden bg-[#F9F9F9]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedGenreIndex}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="absolute inset-0"
                    >
                      <Image src={genreImages[selectedGenreIndex] || genreImages[0]} alt="Signature IEM" fill className="object-cover" />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Neon Tech Marker */}
                <div className="absolute -top-6 -right-6 w-12 h-12 bg-[#D4FF00] z-10 hidden lg:block"></div>
              </div>

              {/* Right Column: Wheel Container */}
              <div className="w-full lg:w-[50%] bg-[#EEEEEE] relative mt-8 lg:mt-0">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-full h-full absolute inset-0 py-12">
                    <OptionWheel
                      className="font-mono tracking-widest uppercase"
                      items={['Balanced', 'Detail', 'Bass head', 'Vocal', 'Orchestra', 'Pop', 'Rock']}
                      defaultSelected={3}
                      fontSize={3.5}
                      spacing={1.3}
                      activeColor="#000000"
                      textColor="#A0A0A0"
                      side="left"
                      curve={0}
                      tilt={0}
                      onChange={(index: number, item: string) => setSelectedGenreIndex(index)}
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Row */}
            <div className="flex flex-col lg:flex-row justify-between items-end mt-12 gap-10 lg:gap-0">

              {/* Left Description */}
              <div className="w-full lg:w-[45%]">
                <p className="font-mono text-[11px] font-medium tracking-wide text-[#444] leading-[1.9] uppercase max-w-[420px]">
                  SELECT A MUSICAL GENRE TO REVEAL THE IDEAL TUNING PROFILE. EVERY IEM IS PRECISELY ENGINEERED TO HIGHLIGHT SPECIFIC FREQUENCY BANDS, ENSURING THE PERFECT MATCH FOR YOUR LISTENING PREFERENCES.
                </p>
              </div>

              {/* Right Bottom Line */}
              <div className="w-full lg:w-[50%] h-[1px] bg-[#000] mb-2"></div>

            </div>

          </div>
        </section>

        {/* 5. TRY FOR YOURSELF SECTION */}
        <section className="w-full relative border-t border-[#222] min-h-[900px] flex items-center justify-center bg-[#111]">
          {/* Subtle Grid Background with Deep Vignette for whitespace focus */}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#111_90%)] pointer-events-none"></div>

          <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 lg:px-12 py-48 flex flex-col items-center justify-center gap-16">

            {/* Clean, Golden Ratio Typography */}
            <div className="text-center">
              <h2 className="font-sans text-5xl md:text-[80px] font-semibold uppercase tracking-tight leading-[1] text-[#FAF9F6]">
                TRY FOR<br />
                YOURSELF
              </h2>
            </div>

            {/* Subtle Description & Action */}
            <div className="flex flex-col items-center gap-12 mt-8">
              <p className="font-sans text-sm text-[#FAF9F6]/50 leading-relaxed max-w-md text-center">
                Compare frequency responses, normalize targets, and analyze the exact sonic signature of your next IEM using our interactive measurement database.
              </p>

              <MotionButton variant="neon" className="group px-14 py-5 text-[11px] font-bold tracking-[0.25em] uppercase flex items-center justify-center gap-4">
                OPEN SQUIGLINK
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </MotionButton>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
