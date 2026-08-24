"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";

// 1. Anti-Gravity Levitating 3D IEM Model
export function FloatingIemModel({ src, alt }: { src: string; alt: string }) {
  return (
    <motion.div
      className="relative w-full h-full flex items-center justify-center scale-[1.1] md:scale-[1.25] translate-y-6 md:translate-y-12 translate-x-2 md:translate-x-8 cursor-pointer"
    >
      <Image
        src={src}
        alt={alt}
        width={800}
        height={800}
        className="w-full h-full object-contain"
        priority
      />
    </motion.div>
  );
}

// 2. Scroll Reveal Card Wrapper with Hover Pulse
export function RevealCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
    >
      {children}
    </motion.div>
  );
}
