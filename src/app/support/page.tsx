"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Counter from "@/components/Counter";
import { ChevronDown, Truck, FileText, ShieldCheck, Package, RefreshCw, CreditCard, CheckCircle, ShoppingCart, Mail, Phone, Headset, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { KeyboardArrowRight } from "@/components/ui/keyboard-arrow";


export default function SupportPage() {
  const [openAccordion, setOpenAccordion] = useState<string | null>("contact");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { t } = useLanguage();

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-[#FAF9F6] font-sans selection:bg-white selection:text-[#030303] flex flex-col relative overflow-hidden">
      <Navbar />

      <main className="flex-1 w-full pt-32 pb-24 max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col gap-48">
        
        {/* =========================================
            HERO SECTION
        ========================================= */}
        <section className="w-full flex flex-col gap-12">
          {/* Top Text */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 w-full">
            <h1 
              className="font-heading text-4xl md:text-5xl lg:text-[54px] leading-[1.05] font-bold text-white max-w-2xl tracking-tight"
              dangerouslySetInnerHTML={{ __html: t("support.heroTitle") }}
            />
            <p className="font-sans text-lg md:text-xl text-[#FAF9F6]/70 max-w-md leading-snug pb-2">
              {t("support.heroDesc")}
            </p>
          </div>

          {/* Hero Image & Overlay */}
          <div className="relative w-full min-h-[500px] md:min-h-[700px] lg:min-h-[750px] bg-[#030303] rounded-2xl md:rounded-3xl border border-[#222] overflow-hidden group shadow-2xl">
            {/* Image Placeholder */}
            <div className="absolute inset-0 bg-[#030303] flex items-center justify-center overflow-hidden rounded-2xl md:rounded-3xl">
               <img src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=2000&auto=format&fit=crop" alt="Hero Support" className="absolute inset-0 w-full h-full object-cover opacity-60 rounded-2xl md:rounded-3xl" />
            </div>
            
            {/* Bottom Overlay Stats */}
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-12 md:gap-20">
              <div className="flex flex-col">
                <span className="font-sans text-[24px] font-bold text-white mb-1">{t("support.totalSellers")}</span>
                <div className="flex items-center text-white font-extrabold text-[24px] leading-none">
                  <Counter 
                    value={54} 
                    places={[10, 1]} 
                    fontSize={24} 
                    padding={2} 
                    gap={2} 
                    textColor="white" 
                    fontWeight={800} 
                    horizontalPadding={0}
                    gradientFrom="rgba(0,0,0,0.5)"
                    gradientHeight={6}
                  />
                  <span>+</span>
                </div>
              </div>
              <div className="w-px h-16 bg-white/30"></div>
              <div className="flex flex-col">
                <span className="font-sans text-[24px] font-bold text-white mb-1">{t("support.productsSold")}</span>
                <div className="flex items-center text-white font-extrabold text-[24px] leading-none">
                  <Counter 
                    value={892} 
                    places={[100, 10, 1]} 
                    fontSize={24} 
                    padding={2} 
                    gap={2} 
                    textColor="white" 
                    fontWeight={800} 
                    horizontalPadding={0}
                    gradientFrom="rgba(0,0,0,0.5)"
                    gradientHeight={6}
                  />
                  <span>+</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 01: INTRODUCE OURSELF
        ========================================= */}
        <section className="w-full flex flex-col gap-16 lg:gap-20">
          <div className="text-center mb-10">
            <h2 className="font-heading text-4xl md:text-[44px] font-bold text-white mb-4 tracking-tight">{t("support.introTitle")}</h2>
            <p className="font-sans text-base text-[#FAF9F6]/80">{t("support.introDesc")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 lg:gap-20">
            {/* Left: Image */}
            <div className="md:col-span-5 relative w-full aspect-[4/5] bg-[#030303] rounded-2xl border border-[#222] flex items-center justify-center overflow-hidden shadow-xl">
              <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1472&auto=format&fit=crop" alt="Earth from Space" className="absolute inset-0 w-full h-full object-cover opacity-90 rounded-2xl" />
            </div>
            
            {/* Right: Text Content */}
            <div className="md:col-span-7 flex flex-col justify-between h-full">
              <div className="flex flex-col gap-12">
                {/* Point 1 */}
                <div>
                  <h3 className="font-sans text-2xl font-bold text-white mb-3 flex items-center gap-3">
                    <span className="text-zinc-300">/</span> {t("support.introPassionate")}
                  </h3>
                  <p className="font-sans text-[#FAF9F6]/70 text-base leading-relaxed">
                    {t("support.introPassionateDesc")}
                  </p>
                </div>
                {/* Point 2 */}
                <div>
                  <h3 className="font-sans text-2xl font-bold text-white mb-3 flex items-center gap-3">
                    <span className="text-zinc-300">/</span> {t("support.introGlobal")}
                  </h3>
                  <p className="font-sans text-[#FAF9F6]/70 text-base leading-relaxed">
                    {t("support.introGlobalDesc")}
                  </p>
                </div>
                {/* Point 3 */}
                <div>
                  <h3 className="font-sans text-2xl font-bold text-white mb-3 flex items-center gap-3">
                    <span className="text-zinc-300">/</span> {t("support.introAcoustic")}
                  </h3>
                  <p className="font-sans text-[#FAF9F6]/70 text-base leading-relaxed">
                    {t("support.introAcousticDesc")}
                  </p>
                </div>
              </div>

              {/* Bottom Quick Links */}
              <div className="mt-12 p-8 border border-[#222] bg-[#050505] rounded-2xl flex flex-col md:flex-row gap-6 justify-between items-center shadow-lg">
                <div>
                  <h4 className="font-sans text-lg font-bold text-white mb-1">{t("support.introNeedHelp")}</h4>
                  <p className="font-sans text-sm text-[#FAF9F6]/60">{t("support.introNeedHelpDesc")}</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <a
                    href="https://wa.me/6285162968089?text=Halo%20Customer%20Service%20Tonal%20Zone,%20saya%20ingin%20berkonsultasi%20mengenai%20produk%20audiophile."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-none px-7 py-3.5 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-full hover:bg-white transition-colors whitespace-nowrap text-center"
                  >
                    {t("support.chatExpert")}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SLEEK HORIZONTAL LIST (Quick Links)
        ========================================= */}
        <section className="w-full flex flex-col border-t border-[#222]">
          {/* Tracking */}
          <div className="group border-b border-[#222] py-10 flex items-center justify-between cursor-pointer relative overflow-hidden transition-colors hover:bg-[#050505]">
            {/* Hover Background Accent */}
            <div className="absolute left-0 top-0 bottom-0 w-0 bg-white group-hover:w-2 transition-all duration-300"></div>
            
            <div className="flex items-center gap-8 md:gap-16 relative z-10 w-full pl-6 md:pl-12">
              <span className="font-mono text-sm text-[#555] group-hover:text-zinc-300 transition-colors">01</span>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-16 w-full">
                <h3 className="font-heading text-4xl md:text-5xl lg:text-[70px] font-bold text-white group-hover:translate-x-4 transition-transform duration-500 uppercase tracking-tighter leading-none m-0">
                  {t("support.tracking")}
                </h3>
                <p className="font-sans text-[#FAF9F6]/50 group-hover:text-[#FAF9F6]/80 text-sm md:text-base transition-colors max-w-sm mt-2 md:mt-0">
                  {t("support.trackingDesc")}
                </p>
              </div>
            </div>
            
            <div className="relative z-10 pr-6 md:pr-12 transform translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
              <div className="w-16 h-16 rounded-full bg-[#050505] border border-[#333] group-hover:border-white/40 flex items-center justify-center">
                <Truck className="w-6 h-6 text-zinc-300" />
              </div>
            </div>
          </div>

          {/* Warranty */}
          <div className="group border-b border-[#222] py-10 flex items-center justify-between cursor-pointer relative overflow-hidden transition-colors hover:bg-[#050505]">
            {/* Hover Background Accent */}
            <div className="absolute left-0 top-0 bottom-0 w-0 bg-white group-hover:w-2 transition-all duration-300"></div>
            
            <div className="flex items-center gap-8 md:gap-16 relative z-10 w-full pl-6 md:pl-12">
              <span className="font-mono text-sm text-[#555] group-hover:text-zinc-300 transition-colors">02</span>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-16 w-full">
                <h3 className="font-heading text-4xl md:text-5xl lg:text-[70px] font-bold text-white group-hover:translate-x-4 transition-transform duration-500 uppercase tracking-tighter leading-none m-0">
                  {t("support.warranty")}
                </h3>
                <p className="font-sans text-[#FAF9F6]/50 group-hover:text-[#FAF9F6]/80 text-sm md:text-base transition-colors max-w-sm mt-2 md:mt-0">
                  {t("support.warrantyDesc")}
                </p>
              </div>
            </div>
            
            <div className="relative z-10 pr-6 md:pr-12 transform translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
              <div className="w-16 h-16 rounded-full bg-[#050505] border border-[#333] group-hover:border-white/40 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-zinc-300" />
              </div>
            </div>
          </div>

          {/* Returns */}
          <div className="group border-b border-[#222] py-10 flex items-center justify-between cursor-pointer relative overflow-hidden transition-colors hover:bg-[#050505]">
            {/* Hover Background Accent */}
            <div className="absolute left-0 top-0 bottom-0 w-0 bg-white group-hover:w-2 transition-all duration-300"></div>
            
            <div className="flex items-center gap-8 md:gap-16 relative z-10 w-full pl-6 md:pl-12">
              <span className="font-mono text-sm text-[#555] group-hover:text-zinc-300 transition-colors">03</span>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-16 w-full">
                <h3 className="font-heading text-4xl md:text-5xl lg:text-[70px] font-bold text-white group-hover:translate-x-4 transition-transform duration-500 uppercase tracking-tighter leading-none m-0">
                  {t("support.return")}
                </h3>
                <p className="font-sans text-[#FAF9F6]/50 group-hover:text-[#FAF9F6]/80 text-sm md:text-base transition-colors max-w-sm mt-2 md:mt-0">
                  {t("support.returnDesc")}
                </p>
              </div>
            </div>
            
            <div className="relative z-10 pr-6 md:pr-12 transform translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
              <div className="w-16 h-16 rounded-full bg-[#050505] border border-[#333] group-hover:border-white/40 flex items-center justify-center">
                <Package className="w-6 h-6 text-zinc-300" />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SPLIT SECTION (Text + Giant Numbers)
        ========================================= */}
        <section className="w-full bg-[#030303] border border-[#222] rounded-2xl md:rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-2xl">
          <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-[#222] p-12 lg:p-20 flex flex-col justify-center">
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
              {t("support.tech")}
            </h2>
            <p className="font-sans text-lg text-[#FAF9F6]/70 leading-relaxed mb-10">
              {t("support.techDesc")}
            </p>
            <a
              href="https://wa.me/6285162968089?text=Halo%20Customer%20Service%20Tonal%20Zone,%20saya%20ingin%20konsultasi%20teknis%20audio."
              target="_blank"
              rel="noopener noreferrer"
              className="self-start px-8 py-4 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-full hover:bg-white transition-colors"
            >
              {t("support.chatExpert")}
            </a>
          </div>
          <div className="w-full lg:w-1/2 p-12 lg:p-20 relative overflow-hidden flex flex-col justify-center">
            {/* Massive background number */}
            <div className="absolute -right-10 -bottom-20 font-heading text-[250px] font-bold text-[#111] leading-none select-none z-0">
              24/7
            </div>
            <div className="relative z-10">
              <h3 className="font-sans text-3xl font-bold text-white mb-6">{t("support.faq")}</h3>
              <div className="flex flex-col gap-4">
                {[
                  { q: t("support.faq1Q"), a: t("support.faq1A") },
                  { q: t("support.faq2Q"), a: t("support.faq2A") },
                  { q: t("support.faq3Q"), a: t("support.faq3A") },
                  { q: t("support.faq4Q"), a: t("support.faq4A") }
                ].map((faq, idx) => (
                  <div key={idx} className={`border-l-2 transition-colors duration-300 ${openFaq === idx ? 'border-white/40' : 'border-[#333] hover:border-white/40'}`}>
                    <button 
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between text-left pl-6 py-3 group focus:outline-none"
                    >
                      <h4 className={`font-bold transition-colors ${openFaq === idx ? 'text-zinc-300' : 'text-white group-hover:text-zinc-300'}`}>{faq.q}</h4>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openFaq === idx ? "rotate-180 text-zinc-300" : "text-white"}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {openFaq === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm text-[#FAF9F6]/60 leading-relaxed pl-6 pb-4 pt-1">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            EDITORIAL TEXT BLOCK (Refined Grid)
        ========================================= */}
        <section className="w-full py-24 border-t border-[#222]">
          <div className="max-w-[1200px] mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 items-start">
            {/* Left Column: Number / Header */}
            <div className="md:col-span-4 flex flex-col justify-start">
              <div className="font-mono text-zinc-300 text-xs tracking-[0.2em] uppercase mb-4 md:mb-8 flex items-center gap-3 opacity-80">
                <span className="w-4 h-px bg-white"></span>
                {t("support.aboutTonalZone")}
              </div>
              <span className="font-heading text-[100px] md:text-[140px] font-bold text-[#1f1f1f] leading-[0.8] tracking-tighter select-none">
                01
              </span>
            </div>

            {/* Right Column: Content */}
            <div className="md:col-span-8 flex flex-col gap-8 md:gap-12 md:pt-2">
              <p className="font-sans text-[#FAF9F6]/90 text-lg md:text-xl lg:text-[22px] leading-[1.8] font-light tracking-tight w-full lg:w-[85%]">
                {t("support.welcomeText")}
              </p>
              
              <div className="w-full h-px bg-[#050505]" />

              <p className="font-sans text-[#FAF9F6]/60 text-base md:text-[17px] leading-[2] font-light w-full lg:w-[80%]">
                {t("support.missionText")}
              </p>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 02: WARRANTY GUIDE
        ========================================= */}
        <section className="w-full flex flex-col gap-10">
          <div className="flex items-end gap-6 border-b border-[#222] pb-6">
            <span className="font-heading text-8xl md:text-[120px] font-bold text-[#222] leading-none select-none">
              02
            </span>
            <h2 className="font-sans text-4xl md:text-5xl font-bold text-white mb-4">
              {t("support.warrantyTitle")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[250px]">
            {/* Step 1: Submit */}
            <div className="md:col-span-4 bg-[#030303] border border-[#222] rounded-2xl p-8 flex flex-col justify-between group hover:border-[#444] transition-colors duration-300 shadow-sm">
              <FileText className="w-10 h-10 text-zinc-300" />
              <div>
                <span className="font-mono text-xs text-zinc-300 tracking-widest mb-2 block">STEP 01</span>
                <h3 className="font-sans text-xl font-bold text-white mb-2">{t("support.warrantyStep1Title")}</h3>
                <p className="font-sans text-[#FAF9F6]/60 text-sm leading-relaxed">
                  {t("support.warrantyStep1Desc")}
                </p>
              </div>
            </div>

            {/* Step 2: Verification */}
            <div className="md:col-span-8 bg-[#030303] border border-[#222] rounded-2xl p-8 flex flex-col justify-between group hover:border-[#444] transition-colors duration-300 relative overflow-hidden shadow-sm">
              <ShieldCheck className="w-10 h-10 text-zinc-300 relative z-10" />
              <ShieldCheck className="w-64 h-64 text-[#151515] absolute -bottom-10 -right-10 z-0 group-hover:text-[#1a1a1a] transition-colors duration-500" />
              <div className="relative z-10 md:w-1/2">
                <span className="font-mono text-xs text-zinc-300 tracking-widest mb-2 block">STEP 02</span>
                <h3 className="font-sans text-xl font-bold text-white mb-2">{t("support.warrantyStep2Title")}</h3>
                <p className="font-sans text-[#FAF9F6]/60 text-sm leading-relaxed">
                  {t("support.warrantyStep2Desc")}
                </p>
              </div>
            </div>

            {/* Step 3: Return Item */}
            <div className="md:col-span-8 bg-[#030303] border border-[#222] rounded-2xl p-8 flex flex-col justify-between group hover:border-[#444] transition-colors duration-300 relative overflow-hidden shadow-sm">
              <Package className="w-10 h-10 text-zinc-300 relative z-10" />
              <Package className="w-64 h-64 text-[#151515] absolute -bottom-10 -right-10 z-0 group-hover:text-[#1a1a1a] transition-colors duration-500" />
              <div className="relative z-10 md:w-1/2">
                <span className="font-mono text-xs text-zinc-300 tracking-widest mb-2 block">STEP 03</span>
                <h3 className="font-sans text-xl font-bold text-white mb-2">{t("support.warrantyStep3Title")}</h3>
                <p className="font-sans text-[#FAF9F6]/60 text-sm leading-relaxed">
                  {t("support.warrantyStep3Desc")}
                </p>
              </div>
            </div>

            {/* Step 4: Resolution */}
            <div className="md:col-span-4 bg-[#030303] border border-[#222] rounded-2xl p-8 flex flex-col justify-between group hover:border-[#444] transition-colors duration-300 shadow-sm">
              <RefreshCw className="w-10 h-10 text-zinc-300" />
              <div>
                <span className="font-mono text-xs text-zinc-300 tracking-widest mb-2 block">STEP 04</span>
                <h3 className="font-sans text-xl font-bold text-white mb-2">{t("support.warrantyStep4Title")}</h3>
                <p className="font-sans text-[#FAF9F6]/60 text-sm leading-relaxed">
                  {t("support.warrantyStep4Desc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        
        {/* =========================================
            SECTION 04: CONTACT & HELP CENTER
        ========================================= */}
        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start pb-20">
          
          {/* Left: Accordions */}
          <div className="flex flex-col w-full gap-4">
            {/* Contact Us Accordion */}
            <div className="bg-[#050505] border border-[#222] rounded-2xl p-6 transition-colors">
              <button 
                onClick={() => toggleAccordion("contact")}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center text-zinc-300">
                    <Headset className="w-5 h-5" />
                  </div>
                  <h3 className="font-sans text-2xl font-bold text-white group-hover:text-zinc-300 transition-colors">{t("support.contactUs")}</h3>
                </div>
                <ChevronDown className={`w-5 h-5 text-white transition-transform duration-300 ${openAccordion === "contact" ? "rotate-180 text-zinc-300" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openAccordion === "contact" ? "max-h-[500px] pt-5 opacity-100" : "max-h-0 opacity-0"}`}>
                <p className="font-sans text-[#FAF9F6]/70 text-sm leading-relaxed mb-5">
                  {t("support.contactUsDesc")}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-[#1C1C1C]">
                  <a
                    href="mailto:tonalzone@gmail.com"
                    className="flex-1 p-3.5 bg-[#0C0C0C] hover:bg-[#141414] border border-[#222] rounded-xl flex items-center gap-3 transition-colors group"
                  >
                    <Mail className="w-4 h-4 text-zinc-300" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono text-[#777] uppercase">Email</p>
                      <p className="text-xs font-mono font-bold text-white group-hover:text-zinc-300 truncate">tonalzone@gmail.com</p>
                    </div>
                  </a>
                  <a
                    href="tel:085162968089"
                    className="flex-1 p-3.5 bg-[#0C0C0C] hover:bg-[#141414] border border-[#222] rounded-xl flex items-center gap-3 transition-colors group"
                  >
                    <Phone className="w-4 h-4 text-zinc-300" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono text-[#777] uppercase">Telepon / WA</p>
                      <p className="text-xs font-mono font-bold text-white group-hover:text-zinc-300 truncate">085162968089</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Help Center Accordion */}
            <div className="bg-[#050505] border border-[#222] rounded-2xl p-6 transition-colors">
              <button 
                onClick={() => toggleAccordion("help")}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center text-zinc-300">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-sans text-2xl font-bold text-white group-hover:text-zinc-300 transition-colors">{t("support.helpCenter")}</h3>
                </div>
                <ChevronDown className={`w-5 h-5 text-white transition-transform duration-300 ${openAccordion === "help" ? "rotate-180 text-zinc-300" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openAccordion === "help" ? "max-h-[500px] pt-5 opacity-100" : "max-h-0 opacity-0"}`}>
                <p className="font-sans text-[#FAF9F6]/70 text-sm leading-relaxed mb-4">
                  {t("support.helpCenterDesc")}
                </p>
                <div className="p-4 bg-[#0C0C0C] rounded-xl border border-[#1C1C1C] text-xs font-sans text-[#888] space-y-2">
                  <p className="text-white font-medium">Bantuan Cepat:</p>
                  <p>• Transaksi dilindungi 100% dengan Rekening Bersama Escrow Tonal Zone.</p>
                  <p>• Verifikasi barang & unboxing dalam 48 jam sebelum dana diteruskan ke penjual.</p>
                  <p>• Layanan retur & klaim garansi resmi dipandu langsung oleh audio engineer kami.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Official Customer Service Card (Tanpa Gambar Orang) */}
          <div className="w-full bg-[#080808] border border-[#222] rounded-2xl md:rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            {/* Ambient Background Accent */}
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-white/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141414] border border-[#222] mb-3">
                  <Headset className="w-3.5 h-3.5 text-zinc-300" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-300 font-bold">
                    Official Support Desk
                  </span>
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Hubungi Customer Service
                </h3>
                <p className="font-sans text-sm text-[#FAF9F6]/70 mt-2 leading-relaxed">
                  Punya pertanyaan seputar kurva suara IEM, kendala transaksi escrow, atau klaim garansi? Tim support kami siap melayani Anda secara responsif.
                </p>
              </div>

              {/* Direct Contact Cards */}
              <div className="space-y-3 pt-1">
                {/* Email Box */}
                <a
                  href="mailto:tonalzone@gmail.com"
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#0D0D0D] hover:bg-[#141414] border border-[#202020] transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#181818] border border-white/5 flex items-center justify-center text-zinc-300 shrink-0 group-hover:scale-105 transition-transform">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#777] block">
                        Email Resmi
                      </span>
                      <span className="text-sm font-mono font-bold text-white group-hover:text-zinc-300 transition-colors truncate block">
                        tonalzone@gmail.com
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[#888] group-hover:text-white shrink-0 hidden sm:inline-block">
                    Kirim Email &rarr;
                  </span>
                </a>

                {/* Phone & WhatsApp Box */}
                <a
                  href="https://wa.me/6285162968089?text=Halo%20Customer%20Service%20Tonal%20Zone,%20saya%20memerlukan%20bantuan."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#0D0D0D] hover:bg-[#141414] border border-[#202020] transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#181818] border border-white/5 flex items-center justify-center text-zinc-300 shrink-0 group-hover:scale-105 transition-transform">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#777] block">
                        Telepon & WhatsApp
                      </span>
                      <span className="text-sm font-mono font-bold text-white group-hover:text-zinc-300 transition-colors truncate block">
                        085162968089
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[#888] group-hover:text-white shrink-0 hidden sm:inline-block">
                    Chat WhatsApp &rarr;
                  </span>
                </a>
              </div>

              {/* Main Primary Action Button */}
              <div className="pt-2">
                <a
                  href="https://wa.me/6285162968089?text=Halo%20Customer%20Service%20Tonal%20Zone,%20saya%20memerlukan%20bantuan."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 bg-white hover:bg-white text-black font-sans font-bold text-xs uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(191,221,37,0.4)] cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Hubungi Customer Service</span>
                </a>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#181818] text-[11px] font-mono text-[#777]">
                <span>Setiap Hari (08.00 - 22.00 WIB)</span>
                <span className="text-zinc-300 font-semibold">Respon Cepat</span>
              </div>
            </div>
          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}
