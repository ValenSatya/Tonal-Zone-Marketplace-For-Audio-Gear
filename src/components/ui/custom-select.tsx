"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface CustomSelectOption {
  label: string;
  value: string;
}

export interface CustomSelectProps {
  label?: string;
  value: string;
  options: (string | CustomSelectOption)[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  variant?: "default" | "compact";
  disabled?: boolean;
}

export default function CustomSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Pilih...",
  className = "",
  buttonClassName = "",
  menuClassName = "",
  variant = "default",
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to { label, value }
  const normalizedOptions: CustomSelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : value || placeholder;

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const isCompact = variant === "compact";

  return (
    <div
      ref={containerRef}
      className={`relative ${isCompact ? "inline-block" : "w-full"} ${className} ${
        isOpen ? "z-[100]" : "z-10"
      }`}
    >
      {label && (
        <label className="block text-[11px] font-mono text-[#FAF9F6]/70 uppercase mb-1">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={
          buttonClassName ||
          (isCompact
            ? `bg-[#141414] hover:bg-[#1C1C1C] border border-[#2A2A2A] hover:border-[#3E3E3E] text-[#FAF9F6] font-sans text-xs flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer select-none shadow-sm ${
                isOpen ? "bg-[#1C1C1C] border-[#555]" : ""
              }`
            : `w-full bg-[#111111] border border-[#262626] hover:border-[#3E3E3E] focus:border-[#555] rounded-xl px-3.5 py-2.5 text-xs font-sans text-[#FAF9F6] text-left flex items-center justify-between transition-all cursor-pointer shadow-sm select-none ${
                isOpen ? "border-[#555] bg-[#161616]" : ""
              }`)
        }
      >
        <span className="truncate mr-2 font-medium">{displayLabel}</span>
        <svg
          width={isCompact ? 12 : 14}
          height={isCompact ? 12 : 14}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          className={`shrink-0 text-[#8E8E93] transition-transform duration-200 ${
            isOpen ? "rotate-180 text-white" : ""
          }`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-0 top-full mt-1.5 bg-[#111111] border border-[#2A2A2A] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.98)] z-[100] max-h-60 overflow-y-auto p-1.5 space-y-0.5 min-w-[160px] ${
              isCompact ? "w-max" : "right-0"
            } ${menuClassName}`}
          >
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-sans transition-all flex items-center justify-between cursor-pointer select-none border ${
                    isSelected
                      ? "bg-[#242424] text-[#FAF9F6] font-semibold border-[#383838] shadow-sm"
                      : "text-[#8E8E93] hover:text-[#FAF9F6] hover:bg-[#1A1A1A] border-transparent"
                  }`}
                >
                  <span className="truncate mr-2">{opt.label}</span>
                  {isSelected && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white shrink-0"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
