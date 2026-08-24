"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Counter from "@/components/Counter";
import { ChevronDown, Truck, FileText, ShieldCheck, Package, RefreshCw, CreditCard, CheckCircle, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

const Step1Card = () => {
  const { t } = useLanguage();
  return (
  <div className="w-full max-w-[400px] bg-[#141414] border border-[#222] p-8 mx-auto shadow-2xl relative z-20">
    <h4 className="font-heading text-lg font-bold text-white mb-6 uppercase tracking-wider">{t("support.orderSummary")}</h4>
    <div className="border-t border-[#333] pt-6 flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-[#0e0e0e] border border-[#222] flex items-center justify-center shrink-0">
            <span className="text-[5px] text-[#444] text-center">Image Placeholder</span>
          </div>
          <div>
            <p className="text-[10px] text-[#888] uppercase mb-0.5 leading-none">Sennheiser</p>
            <p className="text-sm font-bold text-white leading-tight">Sennheiser IE 900</p>
            <p className="text-xs text-[#666] mt-0.5">4.4mm Pentaconn</p>
          </div>
        </div>
        <span className="text-sm font-bold text-white shrink-0">$1,299.00</span>
      </div>
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-[#0e0e0e] border border-[#222] flex items-center justify-center shrink-0">
            <span className="text-[5px] text-[#444] text-center">Image Placeholder</span>
          </div>
          <div>
            <p className="text-[10px] text-[#888] uppercase mb-0.5 leading-none">ProTech</p>
            <p className="text-sm font-bold text-white leading-tight">ProTech 8-Core Pure Silver Cable</p>
            <p className="text-xs text-[#666] mt-0.5">MMCX to 4.4mm</p>
          </div>
        </div>
        <span className="text-sm font-bold text-white shrink-0">$149.00</span>
      </div>
    </div>
    <div className="border-t border-[#333] mt-6 pt-6 flex flex-col gap-3">
      <div className="flex justify-between text-sm">
        <span className="text-[#888] uppercase">{t("cart.subtotal")}</span>
        <span className="text-white font-bold">$1,448.00</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-[#D4FF00] uppercase">{t("cart.discount")} (10%)</span>
        <span className="text-[#D4FF00] font-bold">-$144.80</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-[#888] uppercase">{t("checkout.shippingFeeLabel")} (Express)</span>
        <span className="text-white font-bold">$15.00</span>
      </div>
    </div>
    <div className="border-t border-[#333] mt-6 pt-6 flex justify-between items-center mb-8">
      <span className="font-heading text-lg font-bold text-white uppercase">{t("cart.total")}</span>
      <span className="font-heading text-2xl font-bold text-[#D4FF00]">$1,318.20</span>
    </div>
    <button className="w-full bg-[#D4FF00] text-black font-bold py-4 uppercase tracking-wider hover:bg-[#b3d600] transition-colors">
      {t("checkout.placeOrder")} &rarr;
    </button>
  </div>
)};

const Step2Card = () => {
  const { t } = useLanguage();
  return (
  <div className="w-full max-w-[400px] bg-[#141414] border border-[#222] p-8 mx-auto shadow-2xl relative z-20">
    <h4 className="font-heading text-lg font-bold text-white mb-6 uppercase tracking-wider">{t("support.paymentMethod")}</h4>
    <div className="flex flex-col gap-4">
      <div className="border border-[#D4FF00] bg-[#D4FF00]/5 p-4 flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-4">
          <CreditCard className="text-[#D4FF00] w-6 h-6" />
          <div>
            <p className="text-sm font-bold text-white">Credit Card</p>
            <p className="text-xs text-[#888]">Visa, Mastercard, Amex</p>
          </div>
        </div>
        <div className="w-4 h-4 rounded-full border-2 border-[#D4FF00] bg-[#D4FF00] flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#141414]"></div>
        </div>
      </div>
      <div className="border border-[#333] p-4 flex items-center justify-between cursor-pointer hover:border-[#444] bg-[#0e0e0e]">
        <div className="flex items-center gap-4">
          <CreditCard className="w-6 h-6 text-white" />
          <div>
            <p className="text-sm font-bold text-white">PayPal</p>
            <p className="text-xs text-[#888]">Pay with your balance</p>
          </div>
        </div>
        <div className="w-4 h-4 rounded-full border border-[#444]"></div>
      </div>
    </div>
    <div className="mt-8">
      <div className="w-full bg-[#1A1A1A] border border-[#333] p-4 text-white text-sm flex items-center justify-between mb-4">
        <span>**** **** **** 1234</span>
        <span className="text-[#888]">12/28</span>
      </div>
      <button className="w-full bg-[#D4FF00] text-black font-bold py-4 uppercase tracking-wider hover:bg-[#b3d600] transition-colors">
        Continue to Verification
      </button>
    </div>
  </div>
)};

const Step3Card = () => {
  const { t } = useLanguage();
  return (
  <div className="w-full max-w-[400px] bg-[#141414] border border-[#222] p-8 mx-auto shadow-2xl relative z-20 text-center">
    <ShieldCheck className="w-16 h-16 text-[#D4FF00] mx-auto mb-6" strokeWidth={1} />
    <h4 className="font-heading text-xl font-bold text-white mb-2 uppercase tracking-wider">{t("support.securityVerification")}</h4>
    <p className="text-sm text-[#888] mb-8 leading-relaxed">
      To protect your account, we've sent a 6-digit code to your registered mobile number.
    </p>
    <div className="flex justify-center gap-3 mb-8">
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className={`w-10 h-12 border-b-2 flex items-center justify-center text-2xl font-mono text-white ${i <= 3 ? 'border-[#D4FF00]' : 'border-[#444]'}`}>
          {i <= 3 ? "•" : ""}
        </div>
      ))}
    </div>
    <button className="w-full bg-[#333] text-white font-bold py-4 uppercase tracking-wider hover:bg-[#444] transition-colors">
      Verify Payment
    </button>
  </div>
)};

const Step4Card = () => {
  const { t } = useLanguage();
  return (
  <div className="w-full max-w-[400px] bg-[#141414] border border-[#222] p-8 mx-auto shadow-2xl relative z-20 text-center">
    <div className="w-20 h-20 rounded-full bg-[#D4FF00]/10 border border-[#D4FF00] flex items-center justify-center mx-auto mb-6">
      <CheckCircle className="w-10 h-10 text-[#D4FF00]" strokeWidth={2} />
    </div>
    <h4 className="font-heading text-2xl font-bold text-white mb-2 tracking-tight">{t("support.paymentSuccessful")}</h4>
    <p className="text-sm text-[#888] mb-8 leading-relaxed">
      Thank you for your order! Your payment of <span className="text-white font-bold">$1,318.20</span> has been processed.
    </p>
    <div className="bg-[#0e0e0e] border border-[#222] p-5 text-left flex flex-col gap-4 mb-8">
      <div className="flex justify-between text-sm">
        <span className="text-[#888]">Order ID</span>
        <span className="font-mono text-white font-bold">#TZ-98214</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-[#888]">Estimated Delivery</span>
        <span className="text-white font-bold">Aug 14 - Aug 16</span>
      </div>
    </div>
    <button className="w-full bg-[#D4FF00] text-black font-bold py-4 uppercase tracking-wider hover:bg-[#b3d600] transition-colors">
      View Order Status
    </button>
  </div>
)};

export default function SupportPage() {
  const [openAccordion, setOpenAccordion] = useState<string | null>("contact");
  const [activePaymentStep, setActivePaymentStep] = useState<number | null>(1);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { t } = useLanguage();

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#FAF9F6] font-sans selection:bg-[#D4FF00] selection:text-[#0e0e0e] flex flex-col relative overflow-hidden">
      <Navbar />

      <main className="flex-1 w-full pt-32 pb-24 max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col gap-48">
        
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
          <div className="relative w-full min-h-[500px] md:min-h-[700px] lg:min-h-[750px] bg-[#0e0e0e] overflow-hidden group">
            {/* Image Placeholder */}
            <div className="absolute inset-0 bg-[#0e0e0e] flex items-center justify-center overflow-hidden">
               <img src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=2000&auto=format&fit=crop" alt="Hero Support" className="absolute inset-0 w-full h-full object-cover opacity-60" />
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
            <div className="md:col-span-5 relative w-full aspect-[4/5] bg-[#0e0e0e] flex items-center justify-center overflow-hidden">
              <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1472&auto=format&fit=crop" alt="Earth from Space" className="absolute inset-0 w-full h-full object-cover opacity-90" />
            </div>
            
            {/* Right: Text Content */}
            <div className="md:col-span-7 flex flex-col justify-between h-full">
              <div className="flex flex-col gap-12">
                {/* Point 1 */}
                <div>
                  <h3 className="font-sans text-2xl font-bold text-white mb-3 flex items-center gap-3">
                    <span className="text-[#D4FF00]">/</span> {t("support.introPassionate")}
                  </h3>
                  <p className="font-sans text-[#FAF9F6]/70 text-base leading-relaxed">
                    {t("support.introPassionateDesc")}
                  </p>
                </div>
                {/* Point 2 */}
                <div>
                  <h3 className="font-sans text-2xl font-bold text-white mb-3 flex items-center gap-3">
                    <span className="text-[#D4FF00]">/</span> {t("support.introGlobal")}
                  </h3>
                  <p className="font-sans text-[#FAF9F6]/70 text-base leading-relaxed">
                    {t("support.introGlobalDesc")}
                  </p>
                </div>
                {/* Point 3 */}
                <div>
                  <h3 className="font-sans text-2xl font-bold text-white mb-3 flex items-center gap-3">
                    <span className="text-[#D4FF00]">/</span> {t("support.introAcoustic")}
                  </h3>
                  <p className="font-sans text-[#FAF9F6]/70 text-base leading-relaxed">
                    {t("support.introAcousticDesc")}
                  </p>
                </div>
              </div>

              {/* Bottom Quick Links */}
              <div className="mt-12 p-8 border border-[#222] bg-[#111] flex flex-col md:flex-row gap-6 justify-between items-center">
                <div>
                  <h4 className="font-sans text-lg font-bold text-white mb-1">{t("support.introNeedHelp")}</h4>
                  <p className="font-sans text-sm text-[#FAF9F6]/60">{t("support.introNeedHelpDesc")}</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <button className="flex-1 md:flex-none px-6 py-3 bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-[#D4FF00] transition-colors whitespace-nowrap">
                    {t("support.chatExpert")}
                  </button>
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
          <div className="group border-b border-[#222] py-10 flex items-center justify-between cursor-pointer relative overflow-hidden transition-colors hover:bg-[#0a0a0a]">
            {/* Hover Background Accent */}
            <div className="absolute left-0 top-0 bottom-0 w-0 bg-[#D4FF00] group-hover:w-2 transition-all duration-300"></div>
            
            <div className="flex items-center gap-8 md:gap-16 relative z-10 w-full pl-6 md:pl-12">
              <span className="font-mono text-sm text-[#555] group-hover:text-[#D4FF00] transition-colors">01</span>
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
              <div className="w-16 h-16 rounded-full bg-[#151515] border border-[#333] group-hover:border-[#D4FF00] flex items-center justify-center">
                <Truck className="w-6 h-6 text-[#D4FF00]" />
              </div>
            </div>
          </div>

          {/* Warranty */}
          <div className="group border-b border-[#222] py-10 flex items-center justify-between cursor-pointer relative overflow-hidden transition-colors hover:bg-[#0a0a0a]">
            {/* Hover Background Accent */}
            <div className="absolute left-0 top-0 bottom-0 w-0 bg-[#D4FF00] group-hover:w-2 transition-all duration-300"></div>
            
            <div className="flex items-center gap-8 md:gap-16 relative z-10 w-full pl-6 md:pl-12">
              <span className="font-mono text-sm text-[#555] group-hover:text-[#D4FF00] transition-colors">02</span>
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
              <div className="w-16 h-16 rounded-full bg-[#151515] border border-[#333] group-hover:border-[#D4FF00] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#D4FF00]" />
              </div>
            </div>
          </div>

          {/* Returns */}
          <div className="group border-b border-[#222] py-10 flex items-center justify-between cursor-pointer relative overflow-hidden transition-colors hover:bg-[#0a0a0a]">
            {/* Hover Background Accent */}
            <div className="absolute left-0 top-0 bottom-0 w-0 bg-[#D4FF00] group-hover:w-2 transition-all duration-300"></div>
            
            <div className="flex items-center gap-8 md:gap-16 relative z-10 w-full pl-6 md:pl-12">
              <span className="font-mono text-sm text-[#555] group-hover:text-[#D4FF00] transition-colors">03</span>
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
              <div className="w-16 h-16 rounded-full bg-[#151515] border border-[#333] group-hover:border-[#D4FF00] flex items-center justify-center">
                <Package className="w-6 h-6 text-[#D4FF00]" />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SPLIT SECTION (Text + Giant Numbers)
        ========================================= */}
        <section className="w-full bg-[#0a0a0a] border border-[#222] flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-[#222] p-12 lg:p-20 flex flex-col justify-center">
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
              {t("support.tech")}
            </h2>
            <p className="font-sans text-lg text-[#FAF9F6]/70 leading-relaxed mb-10">
              {t("support.techDesc")}
            </p>
            <button className="self-start px-8 py-4 bg-[#D4FF00] text-black font-bold uppercase tracking-wider text-sm hover:bg-white transition-colors">
              {t("support.chatExpert")}
            </button>
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
                  <div key={idx} className={`border-l-2 transition-colors duration-300 ${openFaq === idx ? 'border-[#D4FF00]' : 'border-[#333] hover:border-[#D4FF00]'}`}>
                    <button 
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between text-left pl-6 py-3 group focus:outline-none"
                    >
                      <h4 className={`font-bold transition-colors ${openFaq === idx ? 'text-[#D4FF00]' : 'text-white group-hover:text-[#D4FF00]'}`}>{faq.q}</h4>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openFaq === idx ? "rotate-180 text-[#D4FF00]" : "text-white"}`} />
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
              <div className="font-mono text-[#D4FF00] text-xs tracking-[0.2em] uppercase mb-4 md:mb-8 flex items-center gap-3 opacity-80">
                <span className="w-4 h-px bg-[#D4FF00]"></span>
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
              
              <div className="w-full h-px bg-[#2a2a2a]" />

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
              Built to Last, Guaranteed
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[250px]">
            {/* Step 1: Submit */}
            <div className="md:col-span-4 bg-[#0e0e0e] border border-[#222] p-8 flex flex-col justify-between group hover:border-[#444] transition-colors duration-300">
              <FileText className="w-10 h-10 text-[#D4FF00]" />
              <div>
                <span className="font-mono text-xs text-[#D4FF00] tracking-widest mb-2 block">STEP 01</span>
                <h3 className="font-sans text-xl font-bold text-white mb-2">Submit Claim</h3>
                <p className="font-sans text-[#FAF9F6]/60 text-sm leading-relaxed">
                  Fill out our warranty request form with your order details and a description of the issue.
                </p>
              </div>
            </div>

            {/* Step 2: Verification */}
            <div className="md:col-span-8 bg-[#0e0e0e] border border-[#222] p-8 flex flex-col justify-between group hover:border-[#444] transition-colors duration-300 relative overflow-hidden">
              <ShieldCheck className="w-10 h-10 text-[#D4FF00] relative z-10" />
              <ShieldCheck className="w-64 h-64 text-[#151515] absolute -bottom-10 -right-10 z-0 group-hover:text-[#1a1a1a] transition-colors duration-500" />
              <div className="relative z-10 md:w-1/2">
                <span className="font-mono text-xs text-[#D4FF00] tracking-widest mb-2 block">STEP 02</span>
                <h3 className="font-sans text-xl font-bold text-white mb-2">Verification</h3>
                <p className="font-sans text-[#FAF9F6]/60 text-sm leading-relaxed">
                  Our audio experts will review your request within 24-48 hours. If approved, you will receive an RMA number and return instructions.
                </p>
              </div>
            </div>

            {/* Step 3: Return Item */}
            <div className="md:col-span-8 bg-[#0e0e0e] border border-[#222] p-8 flex flex-col justify-between group hover:border-[#444] transition-colors duration-300 relative overflow-hidden">
              <Package className="w-10 h-10 text-[#D4FF00] relative z-10" />
              <Package className="w-64 h-64 text-[#151515] absolute -bottom-10 -right-10 z-0 group-hover:text-[#1a1a1a] transition-colors duration-500" />
              <div className="relative z-10 md:w-1/2">
                <span className="font-mono text-xs text-[#D4FF00] tracking-widest mb-2 block">STEP 03</span>
                <h3 className="font-sans text-xl font-bold text-white mb-2">Return Item</h3>
                <p className="font-sans text-[#FAF9F6]/60 text-sm leading-relaxed">
                  Securely pack your item with all original accessories and ship it to our designated service center using the provided label.
                </p>
              </div>
            </div>

            {/* Step 4: Resolution */}
            <div className="md:col-span-4 bg-[#0e0e0e] border border-[#222] p-8 flex flex-col justify-between group hover:border-[#444] transition-colors duration-300">
              <RefreshCw className="w-10 h-10 text-[#D4FF00]" />
              <div>
                <span className="font-mono text-xs text-[#D4FF00] tracking-widest mb-2 block">STEP 04</span>
                <h3 className="font-sans text-xl font-bold text-white mb-2">Resolution</h3>
                <p className="font-sans text-[#FAF9F6]/60 text-sm leading-relaxed">
                  Once received, we will repair or replace your unit and ship it back to you at no additional cost.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 03: PAYMENT GUIDE
        ========================================= */}
        <section className="w-full flex flex-col gap-10">
          <div className="flex items-end justify-between border-b border-[#222] pb-6">
            <div className="mb-4">
              <h2 className="font-sans text-4xl md:text-5xl font-bold text-white mb-2">
                {t("support.seamless")}
              </h2>
              <p className="font-sans text-lg text-[#FAF9F6]/70">{t("support.seamlessDesc")}</p>
            </div>
            <span className="font-heading text-8xl md:text-[120px] font-bold text-[#222] leading-none select-none">
              03
            </span>
          </div>

          <div className="w-full bg-[#0e0e0e] border border-[#222] p-8 md:p-12 flex flex-col gap-12">
            
            {/* Stepper Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative">
              {/* Connecting Line (Desktop only) */}
              <div className="hidden md:block absolute top-6 left-10 right-10 h-px bg-[#333] z-0"></div>

              {/* Step 1 */}
              <div 
                onClick={() => setActivePaymentStep(activePaymentStep === 1 ? null : 1)}
                className={`flex flex-col gap-4 relative z-10 cursor-pointer group transition-all duration-300 ${activePaymentStep === 1 ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
              >
                <div className={`w-12 h-12 rounded-full bg-[#151515] border flex items-center justify-center transition-colors duration-300 ${activePaymentStep === 1 ? 'border-[#D4FF00]' : 'border-[#333] group-hover:border-[#D4FF00]'}`}>
                  <ShoppingCart className={`w-5 h-5 transition-colors duration-300 ${activePaymentStep === 1 ? 'text-[#D4FF00]' : 'text-white group-hover:text-[#D4FF00]'}`} />
                </div>
                <div>
                  <h3 className="font-sans text-lg font-bold text-white mb-2">1. {t("support.stepCheckout")}</h3>
                  <p className="font-sans text-[#FAF9F6]/60 text-sm leading-relaxed pr-4">
                    {t("support.stepCheckoutDesc")}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div 
                onClick={() => setActivePaymentStep(activePaymentStep === 2 ? null : 2)}
                className={`flex flex-col gap-4 relative z-10 cursor-pointer group transition-all duration-300 ${activePaymentStep === 2 ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
              >
                <div className={`w-12 h-12 rounded-full bg-[#151515] border flex items-center justify-center transition-colors duration-300 ${activePaymentStep === 2 ? 'border-[#D4FF00]' : 'border-[#333] group-hover:border-[#D4FF00]'}`}>
                  <CreditCard className={`w-5 h-5 transition-colors duration-300 ${activePaymentStep === 2 ? 'text-[#D4FF00]' : 'text-white group-hover:text-[#D4FF00]'}`} />
                </div>
                <div>
                  <h3 className="font-sans text-lg font-bold text-white mb-2">2. {t("support.stepPayment")}</h3>
                  <p className="font-sans text-[#FAF9F6]/60 text-sm leading-relaxed pr-4">
                    {t("support.stepPaymentDesc")}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div 
                onClick={() => setActivePaymentStep(activePaymentStep === 3 ? null : 3)}
                className={`flex flex-col gap-4 relative z-10 cursor-pointer group transition-all duration-300 ${activePaymentStep === 3 ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
              >
                <div className={`w-12 h-12 rounded-full bg-[#151515] border flex items-center justify-center transition-colors duration-300 ${activePaymentStep === 3 ? 'border-[#D4FF00]' : 'border-[#333] group-hover:border-[#D4FF00]'}`}>
                  <ShieldCheck className={`w-5 h-5 transition-colors duration-300 ${activePaymentStep === 3 ? 'text-[#D4FF00]' : 'text-white group-hover:text-[#D4FF00]'}`} />
                </div>
                <div>
                  <h3 className="font-sans text-lg font-bold text-white mb-2">3. {t("support.stepVerification")}</h3>
                  <p className="font-sans text-[#FAF9F6]/60 text-sm leading-relaxed pr-4">
                    {t("support.stepVerificationDesc")}
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div 
                onClick={() => setActivePaymentStep(activePaymentStep === 4 ? null : 4)}
                className={`flex flex-col gap-4 relative z-10 cursor-pointer group transition-all duration-300 ${activePaymentStep === 4 ? 'opacity-100' : 'opacity-50 hover:opacity-100'}`}
              >
                <div className={`w-12 h-12 rounded-full bg-[#151515] border flex items-center justify-center transition-colors duration-300 ${activePaymentStep === 4 ? 'border-[#D4FF00]' : 'border-[#333] group-hover:border-[#D4FF00]'}`}>
                  <CheckCircle className={`w-5 h-5 transition-colors duration-300 ${activePaymentStep === 4 ? 'text-[#D4FF00]' : 'text-white group-hover:text-[#D4FF00]'}`} />
                </div>
                <div>
                  <h3 className="font-sans text-lg font-bold text-white mb-2">4. {t("support.stepConfirmation")}</h3>
                  <p className="font-sans text-[#FAF9F6]/60 text-sm leading-relaxed pr-4">
                    {t("support.stepConfirmationDesc")}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive UI Display */}
            <AnimatePresence initial={false}>
              {activePaymentStep !== null && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                  className="w-full relative overflow-hidden mt-4"
                >
                  <div className="w-full min-h-[500px] md:min-h-[600px] bg-[#0e0e0e] border border-[#222] relative flex items-center justify-center py-12 px-4">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#222] via-[#0e0e0e] to-[#0e0e0e] opacity-50 z-0"></div>
                    
                    {/* Conditional UI Cards with Crossfade */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activePaymentStep}
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -15, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative z-20 w-full flex justify-center"
                      >
                        {activePaymentStep === 1 && <Step1Card />}
                        {activePaymentStep === 2 && <Step2Card />}
                        {activePaymentStep === 3 && <Step3Card />}
                        {activePaymentStep === 4 && <Step4Card />}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </section>

        {/* =========================================
            SECTION 04: CONTACT & HELP CENTER
        ========================================= */}
        <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-start pb-20">
          
          {/* Accordions */}
          <div className="flex flex-col w-full">
            {/* Contact Us Accordion */}
            <div className="border-b border-[#333]">
              <button 
                onClick={() => toggleAccordion("contact")}
                className="w-full flex items-center justify-between py-6 text-left cursor-pointer group"
              >
                <h3 className="font-sans text-3xl font-bold text-white">{t("support.contactUs")}</h3>
                <ChevronDown className={`w-6 h-6 text-white transition-transform duration-300 ${openAccordion === "contact" ? "rotate-180" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openAccordion === "contact" ? "max-h-[500px] pb-8 opacity-100" : "max-h-0 opacity-0"}`}>
                <p className="font-sans text-[#FAF9F6]/70 text-base leading-relaxed">
                  {t("support.contactUsDesc")}
                </p>
              </div>
            </div>

            {/* Help Center Accordion */}
            <div className="border-b border-[#333]">
              <button 
                onClick={() => toggleAccordion("help")}
                className="w-full flex items-center justify-between py-6 text-left cursor-pointer group"
              >
                <h3 className="font-sans text-3xl font-bold text-white">{t("support.helpCenter")}</h3>
                <ChevronDown className={`w-6 h-6 text-white transition-transform duration-300 ${openAccordion === "help" ? "rotate-180" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openAccordion === "help" ? "max-h-[500px] pb-8 opacity-100" : "max-h-0 opacity-0"}`}>
                <p className="font-sans text-[#FAF9F6]/70 text-base leading-relaxed">
                  {t("support.helpCenterDesc")}
                </p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative w-full aspect-square md:aspect-[4/5] bg-[#0e0e0e] border border-[#222] flex items-center justify-center overflow-hidden">
            <img src="https://plus.unsplash.com/premium_photo-1663091684433-db98edd5d130?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Moody Contact Desk" className="absolute inset-0 w-full h-full object-cover grayscale-[0.3]" />
          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}
