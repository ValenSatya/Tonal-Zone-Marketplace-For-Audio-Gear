"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface MotionButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: "neon" | "neon-dark" | "dark" | "light" | "white";
  type?: "button" | "submit" | "reset";
}

export default function MotionButton({
  children,
  href,
  onClick,
  className = "",
  variant = "neon",
  type = "button",
}: MotionButtonProps) {
  // Base styling depending on variant - NO glow, NO position shift, clean typography
  const baseStyles = "relative inline-flex items-center justify-center font-mono font-bold text-xs uppercase tracking-[0.2em] py-4 px-6 overflow-hidden cursor-pointer select-none";
  
  let defaultBg = "";
  let hoverOverlayBg = "";
  let textColorClass = "";

  // Exactly imitating the clean diagonal wipe from motion.dev
  if (variant === "neon") {
    defaultBg = "bg-[#D4FF00]";
    hoverOverlayBg = "bg-white";
    textColorClass = "text-[#0e0e0e] group-hover:text-[#0e0e0e]";
  } else if (variant === "neon-dark") {
    defaultBg = "bg-[#D4FF00]";
    hoverOverlayBg = "bg-[#0e0e0e]";
    textColorClass = "text-[#0e0e0e] group-hover:text-white";
  } else if (variant === "dark") {
    defaultBg = "bg-[#0e0e0e] border border-[#2a2a2a] group-hover:border-white";
    hoverOverlayBg = "bg-[#D4FF00]";
    textColorClass = "text-[#FAF9F6] group-hover:text-[#0e0e0e]";
  } else if (variant === "light") {
    defaultBg = "bg-[#FAF9F6]";
    hoverOverlayBg = "bg-[#D4FF00]";
    textColorClass = "text-[#0e0e0e]";
  } else if (variant === "white") {
    defaultBg = "bg-[#FAF9F6]";
    hoverOverlayBg = "bg-white";
    textColorClass = "text-[#0e0e0e]";
  }

  const content = (
    <>
      {/* DIAGONAL WIPE TRANSITION OVERLAY */}
      <motion.span
        className={`absolute -top-[200px] -left-[400px] w-[1200px] h-[500px] ${hoverOverlayBg} pointer-events-none -rotate-12 z-0`}
        variants={{
          initial: { y: "100%" },
          hover: { 
            y: "0%", 
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } // Smooth, unhurried premium wipe
          },
          tap: { y: "0%" }
        }}
      />

      {/* Button text / content */}
      <span className={`relative z-10 flex items-center justify-center gap-2 transition-colors duration-300 ${textColorClass}`}>
        {children}
      </span>
    </>
  );

  const containerVariants: any = {
    initial: { scale: 1 },
    hover: { 
      scale: 1, // Zero size change, zero position shift on hover!
    },
    tap: { 
      scale: 0.97, // Subtle press physics
      transition: { type: "spring", stiffness: 400, damping: 25 }
    }
  };

  if (href) {
    return (
      <motion.div
        variants={containerVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className={`group ${className.includes("w-full") ? "block w-full" : "inline-block"}`}
      >
        <Link href={href} onClick={onClick} className={`${baseStyles} ${defaultBg} ${className}`}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      variants={containerVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      className={`${baseStyles} ${defaultBg} ${className} group`}
    >
      {content}
    </motion.button>
  );
}
