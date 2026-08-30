"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import PixelTransition from "@/components/PixelTransition";
import MotionButton from "@/components/MotionButton";
import AcousticBlueprint from "@/components/AcousticBlueprint";
import BestSellers from "@/components/BestSellers";
import TrustedBrands from "@/components/TrustedBrands";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  FloatingIemModel,
  RevealCard,
} from "@/components/InteractiveLandingVisuals";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { motion, useScroll, useTransform } from "motion/react";

export default function Home() {
  const { t } = useLanguage();
  const { formatPrice } = useLocation();
  
  // Parallax fade effect for hero
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 600], [1, 0.95]);

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-[#0e0e0e] text-[#FAF9F6] font-sans selection:bg-[#D4FF00] selection:text-[#0e0e0e]">
      {/* GLOBAL HEADER */}
      <Navbar />

      <main className="relative w-full overflow-x-hidden">

      {/* HERO SECTION - ENHANCED CLEAN LAYOUT */}
      <section id="hero" className="sticky top-0 z-0 w-full h-[100svh] min-h-[750px] flex flex-col justify-center overflow-hidden bg-[#FAF9F6] text-[#0e0e0e] border-b border-[#0e0e0e]/15">
        {/* Dynamic Clean Architectural Grid Background Component */}
        <AcousticBlueprint />

        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 w-full"
        >
          {/* Main 2-Column Hero Layout */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-12 min-h-[600px] md:min-h-0 py-12 md:py-0 pt-28">

            {/* Left Column: Title, Subtitle, Price, and Action Buttons */}
            <div className="flex flex-col items-start max-w-xl z-20 relative mt-10 md:mt-0">
              <span className="text-xs font-mono uppercase tracking-[0.3em] font-semibold text-[#0e0e0e]/60 block mb-4">
                CURATED AUDIOPHILE FLAGSHIP
              </span>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-heading text-4xl sm:text-6xl md:text-[85px] lg:text-[95px] leading-none mb-4 hover:tracking-wide transition-[letter-spacing] duration-500 cursor-default uppercase"
              >
                BLESSING 3
              </motion.h1>
              
              <div className="flex items-center gap-4 mb-8 w-full">
                <span className="w-16 md:w-24 h-[2px] bg-[#0e0e0e]"></span>
                <p className="text-xs sm:text-sm md:text-base font-mono uppercase tracking-[0.25em] font-bold text-[#0e0e0e]/75">
                  Moondrop 2DD + 4BA Hybrid Flagship
                </p>
              </div>

              {/* Price Display */}
              <div className="flex items-center gap-3 mb-10 group cursor-default w-full border-y border-[#0e0e0e]/10 py-5">
                <div className="w-1.5 h-10 bg-[#0e0e0e] group-hover:h-12 transition-[height] duration-300"></div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[#0e0e0e]/50 font-bold">{t("home.audiophilePrice")}</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-heading text-[#0e0e0e] group-hover:translate-x-1 transition-transform duration-300">{formatPrice(319.99)}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href="/collection" className="w-full sm:w-auto">
                  <MotionButton variant="dark" className="text-xs md:text-sm px-8 py-4 uppercase tracking-[0.2em] font-bold shadow-xl w-full sm:w-auto text-center">
                    {t("home.heroShopNow")}
                  </MotionButton>
                </Link>
                <Link href="/collection" className="w-full sm:w-auto">
                  <button className="border-2 border-[#0e0e0e] text-[#0e0e0e] px-8 py-4 text-xs md:text-sm uppercase tracking-[0.2em] hover:bg-[#0e0e0e] hover:text-[#FAF9F6] active:scale-95 transition-colors duration-300 touch-manipulation font-bold w-full sm:w-auto text-center backdrop-blur-sm cursor-pointer">
                    {t("home.heroExplore")}
                  </button>
                </Link>
              </div>
            </div>

            {/* Right/Bottom Column: Floating 3D IEM Image (Stacks cleanly at bottom on mobile) */}
            <div className="relative w-full max-w-[400px] md:max-w-[620px] aspect-square flex items-center justify-center pointer-events-auto">
              <FloatingIemModel src="/model-iem-herov2.svg" alt="QOA Flagship IEM v2" />
            </div>
          </div>
        </motion.div>
      </section>

      <div className="relative z-10 w-full bg-[#0e0e0e] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">

      {/* BEST SELLERS SECTION */}
      <BestSellers />

      {/* COLLAB SECTION */}
      <section id="collab" className="w-full bg-[#0a0a0a] py-32 border-b border-[#1c1c1c]">
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-80px" }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row gap-12 md:gap-16 items-center"
        >
          <div className="flex-1 flex flex-col items-start justify-center">
            <span className="text-xs sm:text-sm font-mono uppercase tracking-[0.3em] text-[#888888] block mb-4">
              {t("home.collabSeries")}
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-[56px] -tracking-[0.02em] mb-6 leading-[1.12] text-[#FAF9F6] cursor-default">
              Moondrop × Crinacle<br />Dusk
            </h2>
            <p className="text-[#999999] leading-relaxed text-base sm:text-[17px] max-w-lg mb-10">
              {t("home.duskDesc")}
            </p>
            <Link href="/collection" className="mb-12 inline-block">
              <MotionButton variant="light" className="px-8 py-4 text-xs sm:text-sm tracking-[0.25em]">
                {t("home.viewProduct")}
              </MotionButton>
            </Link>
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-[#1c1c1c] w-full max-w-lg">
              <div>
                <p className="text-[11px] font-mono text-[#888888] uppercase tracking-[0.2em] mb-1.5">{t("home.driver")}</p>
                <p className="font-sans font-medium text-white text-base sm:text-lg">2DD + 4BA + 2Planar</p>
              </div>
              <div>
                <p className="text-[11px] font-mono text-[#888888] uppercase tracking-[0.2em] mb-1.5">{t("home.signature")}</p>
                <p className="font-sans font-medium text-white text-base sm:text-lg">{t("home.neutralBass")}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Main DSP Collab Feature Card */}
            <div className="sm:col-span-2 relative aspect-[16/10] border border-[#1c1c1c] overflow-hidden bg-[#0a0a0a] group cursor-pointer hover:border-[#333333] transition-colors duration-300">
              <Image
                src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1000"
                alt="Moondrop x Crinacle Dusk"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 bg-black/90 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-white border border-[#222222] z-10 font-bold">
                {t("home.dspEnabled")}
              </div>
            </div>

            {/* 2. FreeDSP Cable Sub-card */}
            <div className="relative aspect-square border border-[#1c1c1c] overflow-hidden bg-[#0a0a0a] group cursor-pointer hover:border-[#333333] transition-colors duration-300">
              <Image
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"
                alt="Audiophile IEM Cable"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-[10px] font-mono text-white/90 uppercase tracking-wider bg-black/90 px-2.5 py-1 border border-[#222222] z-10 font-bold">
                TYPE-C FREEDSP CABLE
              </div>
            </div>

            {/* 3. Interactive Pixel Transition Card */}
            <Link
              href="/collection"
              className="border border-[#1c1c1c] bg-[#0a0a0a] group cursor-pointer hover:border-[#FAF9F6]/50 transition-colors duration-500 relative aspect-square block overflow-hidden"
            >
              <PixelTransition
                firstContent={
                  <div className="flex flex-col items-center justify-center w-full h-full p-4 text-center select-none">
                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      {t("home.exploreMore")}
                    </span>
                  </div>
                }
                secondContent={
                  <div className="w-full h-full bg-[#D4FF00] flex flex-col items-center justify-center relative p-4 text-center select-none">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#0e0e0e] rotate-45 mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                    <span className="text-xs font-mono uppercase tracking-widest text-[#0e0e0e] font-bold">
                      {t("home.exploreMore")}
                    </span>
                  </div>
                }
                gridSize={8}
                pixelColor="#D4FF00"
                animationStepDuration={0.3}
                className="w-full h-full absolute inset-0"
              />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* NEW ARRIVAL */}
      <section id="new-arrival" className="w-full bg-[#0e0e0e] py-40 border-b border-[#444748]">
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-100px" }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-[1400px] mx-auto px-6 lg:px-12"
        >
          <div className="flex justify-between items-end mb-12 border-b border-[#444748] pb-6">
            <h2 className="font-heading text-4xl tracking-tight text-[#FAF9F6]">{t("home.newArrivals")}</h2>
            <div className="hidden md:flex gap-8">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#D4FF00] border-b-2 border-[#D4FF00] pb-2 cursor-pointer font-bold">IEM</span>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#FAF9F6]/50 hover:text-[#FAF9F6] hover:border-b-2 hover:border-[#FAF9F6]/50 pb-2 cursor-pointer transition-colors">TWS</span>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#FAF9F6]/50 hover:text-[#FAF9F6] hover:border-b-2 hover:border-[#FAF9F6]/50 pb-2 cursor-pointer transition-colors">Headphone</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Simgot EA1000 Fermat */}
            <RevealCard delay={0.0}>
            <Link href="/collection" className="group cursor-pointer block">
              <div className="aspect-[4/5] border border-[#222222] bg-[#0c0c0c] mb-4 relative overflow-hidden flex items-center justify-center group-hover:border-[#555555] transition-colors duration-300">
                <img
                  src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"
                  alt="Simgot EA1000 Fermat"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Subtle Tag at top */}
                <div className="absolute top-3 left-3 bg-black/90 px-2.5 py-1 text-[10px] font-mono text-white border border-white/20 z-10 font-bold">
                  NEW ARRIVAL
                </div>
              </div>
              <div className="flex flex-col items-start mt-3 gap-1 w-full">
                <div className="flex items-center justify-between w-full gap-2">
                  <p className="font-sans text-base md:text-lg font-bold uppercase tracking-tight text-[#FAF9F6] group-hover:text-white transition-colors duration-300 truncate">SIMGOT EA1000 FERMAT</p>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#0e0e0e] border border-white/10 text-[9px] uppercase tracking-widest text-[#FAF9F6]/70 font-mono shrink-0">
                    BASS AUDIO
                  </div>
                </div>
                <p className="text-sm text-white font-sans font-bold">{formatPrice(219.99)}</p>
              </div>
            </Link>
            </RevealCard>

            {/* Card 2: Kiwi Ears Orchestra Lite */}
            <RevealCard delay={0.15}>
            <Link href="/collection" className="group cursor-pointer block">
              <div className="aspect-[4/5] border border-[#222222] bg-[#0c0c0c] mb-4 relative overflow-hidden flex items-center justify-center group-hover:border-[#555555] transition-colors duration-300">
                <img
                  src="https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800"
                  alt="Kiwi Ears Orchestra Lite"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Subtle Tag at top */}
                <div className="absolute top-3 left-3 bg-black/90 px-2.5 py-1 text-[10px] font-mono text-white border border-white/20 z-10 font-bold">
                  8-BA REFERENCE
                </div>
              </div>
              <div className="flex flex-col items-start mt-3 gap-1 w-full">
                <div className="flex items-center justify-between w-full gap-2">
                  <p className="font-sans text-base md:text-lg font-bold uppercase tracking-tight text-[#FAF9F6] group-hover:text-white transition-colors duration-300 truncate">KIWI EARS ORCHESTRA</p>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#0e0e0e] border border-white/10 text-[9px] uppercase tracking-widest text-[#FAF9F6]/70 font-mono shrink-0">
                    BASS AUDIO
                  </div>
                </div>
                <p className="text-sm text-white font-sans font-bold">{formatPrice(249.00)}</p>
              </div>
            </Link>
            </RevealCard>

            {/* Card 3: Tangzu Nezha */}
            <RevealCard delay={0.3}>
            <Link href="/collection" className="group cursor-pointer block">
              <div className="aspect-[4/5] border border-[#222222] bg-[#0c0c0c] mb-4 relative overflow-hidden flex items-center justify-center group-hover:border-[#555555] transition-colors duration-300">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"
                  alt="Tangzu Nezha Flagship"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Subtle Tag at top */}
                <div className="absolute top-3 left-3 bg-black/90 px-2.5 py-1 text-[10px] font-mono text-white border border-white/20 z-10 font-bold">
                  FLAGSHIP TRIBRID
                </div>
              </div>
              <div className="flex flex-col items-start mt-3 gap-1 w-full">
                <div className="flex items-center justify-between w-full gap-2">
                  <p className="font-sans text-base md:text-lg font-bold uppercase tracking-tight text-[#FAF9F6] group-hover:text-white transition-colors duration-300 truncate">TANGZU NEZHA</p>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#0e0e0e] border border-white/10 text-[9px] uppercase tracking-widest text-[#FAF9F6]/70 font-mono shrink-0">
                    TANGZU OFFICIAL
                  </div>
                </div>
                <p className="text-sm text-white font-sans font-bold">{formatPrice(399.00)}</p>
              </div>
            </Link>
            </RevealCard>
          </div>
        </motion.div>
      </section>

      {/* TRUSTED BRANDS SECTION */}
      <TrustedBrands />

      {/* FOOTER */}
      <section id="footer" className="w-full bg-[#0e0e0e] pt-20 overflow-hidden">
        <Footer />
      </section>
      </div>
      </main>
    </div>
  );
}
