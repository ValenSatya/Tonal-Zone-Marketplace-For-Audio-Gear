"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  overlay?: boolean;
}

export default function ParallaxImage({ src, alt, className = "", overlay = false }: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Reveal animation
  const isInView = useInView(containerRef, { once: true, margin: "-10% 0px" });
  
  // Parallax scroll effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  // Move image from -10% to 10% on Y axis as user scrolls past it
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden bg-[#0e0e0e] ${className}`}
    >
      <motion.div
        initial={{ scale: 1.2, opacity: 0 }}
        animate={isInView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 w-full h-full"
      >
        <motion.img
          style={{ y, scale: 1.15 }} // Extra scale to accommodate parallax Y movement
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {overlay && <div className="absolute inset-0 bg-black/40 z-10" />}
      </motion.div>
    </div>
  );
}
