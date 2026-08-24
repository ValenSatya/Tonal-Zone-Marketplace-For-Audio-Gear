"use client";

import React from "react";
import { motion } from "motion/react";

export default function AcousticBlueprint() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* 1. Subtle Clean Architectural Grid Pattern */}
      <div className="absolute inset-0 opacity-35" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
      <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '25px 25px' }}></div>

      {/* 2. Ultra-Subtle, Slow Laser Scanner */}
      <motion.div
        className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#0e0e0e]/15 to-transparent pointer-events-none z-0"
        initial={{ left: "0%" }}
        animate={{ left: ["0%", "100%", "0%"] }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
      />

      {/* 3. Elegant, Slow Rotating Rings behind IEM (Pure Geometry, No Text) */}
      <div className="absolute top-1/2 right-[5%] lg:right-[10%] -translate-y-1/2 w-[460px] h-[460px] md:w-[580px] md:h-[580px] flex items-center justify-center z-0 opacity-30">
        <div className="absolute inset-0 border border-dashed border-[#0e0e0e]/25 rounded-full animate-[spin_80s_linear_infinite]"></div>
        <div className="absolute w-3/4 h-3/4 border border-dotted border-[#0e0e0e]/25 rounded-full animate-[spin_100s_linear_infinite_reverse]"></div>
        <div className="absolute w-1/2 h-1/2 border border-dashed border-[#0e0e0e]/20 rounded-full animate-[spin_60s_linear_infinite]"></div>
        <div className="absolute w-full h-[1px] bg-[#0e0e0e]/10"></div>
        <div className="absolute h-full w-[1px] bg-[#0e0e0e]/10"></div>
      </div>
    </div>
  );
}
