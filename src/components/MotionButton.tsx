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
  const baseStyles =
    "relative inline-flex items-center justify-center font-mono font-bold text-xs uppercase tracking-[0.2em] py-4 px-6 overflow-hidden cursor-pointer select-none transition-colors duration-300";

  let defaultBg = "";
  let hoverOverlayBg = "";
  let textColorClass = "";

  if (variant === "neon") {
    defaultBg = "bg-[#BFDD25]";
    hoverOverlayBg = "bg-white";
    textColorClass = "text-[#030303]";
  } else if (variant === "neon-dark") {
    defaultBg = "bg-[#BFDD25]";
    hoverOverlayBg = "bg-[#030303]";
    textColorClass = "text-[#030303] group-hover:text-white";
  } else if (variant === "dark") {
    defaultBg = "bg-[#030303] border border-[#2a2a2a]";
    hoverOverlayBg = "bg-[#BFDD25]";
    textColorClass = "text-[#FAF9F6] group-hover:text-[#030303]";
  } else if (variant === "light") {
    defaultBg = "bg-[#FAF9F6]";
    hoverOverlayBg = "bg-[#BFDD25]";
    textColorClass = "text-[#030303]";
  } else if (variant === "white") {
    defaultBg = "bg-white";
    hoverOverlayBg = "bg-[#EAEAEA]";
    textColorClass = "text-[#030303]";
  }

  const content = (
    <>
      {/* BOUNDED INSET OVERLAY */}
      <span
        className={`absolute inset-0 ${hoverOverlayBg} transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-0`}
      />

      {/* Button text / content */}
      <span
        className={`relative z-10 flex items-center justify-center gap-2 transition-colors duration-300 ${textColorClass}`}
      >
        {children}
      </span>
    </>
  );

  const containerVariants: any = {
    initial: { scale: 1 },
    hover: { scale: 1 },
    tap: {
      scale: 0.97,
      transition: { type: "spring", stiffness: 400, damping: 25 },
    },
  };

  if (href) {
    return (
      <motion.div
        variants={containerVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className={`group inline-block ${className.includes("w-full") ? "w-full" : ""}`}
      >
        <Link
          href={href}
          onClick={onClick}
          className={`${baseStyles} ${defaultBg} ${className}`}
        >
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
