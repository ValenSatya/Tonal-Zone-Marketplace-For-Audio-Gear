"use client";

import React from "react";
import { motion } from "framer-motion";

const BRANDS = [
  { name: "Sennheiser", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Sennheiser_logo.svg/1024px-Sennheiser_logo.svg.png" },
  { name: "Sony", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Sony_logo.svg/1024px-Sony_logo.svg.png" },
  { name: "Shure", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Shure_logo.svg/1024px-Shure_logo.svg.png" },
  { name: "Audio-Technica", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Audio-Technica_logo.svg/1024px-Audio-Technica_logo.svg.png" },
  { name: "JBL", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/JBL_logo.svg/1024px-JBL_logo.svg.png" },
  { name: "Bose", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Bose_logo.svg/1024px-Bose_logo.svg.png" },
  { name: "Harman Kardon", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Harman_Kardon_logo.svg/1024px-Harman_Kardon_logo.svg.png" },
  { name: "Pioneer", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Pioneer_logo.svg/1024px-Pioneer_logo.svg.png" }
];

export default function TrustedBrands() {
  return (
    <section className="w-full bg-[#0a0a0a] border-y border-[#222] py-16 overflow-hidden relative">
      {/* Fade Edges */}
      <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none"></div>
      
      <div className="max-w-[1400px] mx-auto px-6 mb-12 text-center z-20 relative">
        <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] text-[#666] font-bold">Trusted by Top Audiophile Brands</p>
      </div>

      <div className="flex whitespace-nowrap overflow-hidden relative items-center">
        <motion.div
          className="flex items-center gap-20 md:gap-32 px-10"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 35, // Adjust speed here
          }}
        >
          {/* Double the array for seamless infinite scroll */}
          {[...BRANDS, ...BRANDS].map((brand, idx) => (
            <div 
              key={idx} 
              className="group flex items-center justify-center cursor-default transition-all duration-300 w-32 md:w-48"
            >
              <img 
                src={brand.url} 
                alt={`${brand.name} Logo`} 
                className="w-full h-auto object-contain opacity-40 grayscale contrast-200 brightness-200 group-hover:opacity-100 group-hover:grayscale-0 group-hover:brightness-100 group-hover:contrast-100 transition-all duration-500"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
