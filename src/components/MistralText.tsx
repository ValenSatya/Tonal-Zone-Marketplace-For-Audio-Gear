"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";

interface MistralTextProps {
  text: string;
  className?: string;
  speed?: number;
}

const CYBER_SYMBOLS = "01#$%&@*+=-/\\|░▒▓█~!?<>[]{}";

export default function MistralText({ text, className = "", speed = 20 }: MistralTextProps) {
  const [displayText, setDisplayText] = useState<string[]>(Array(text.length).fill(""));
  const [isDecoding, setIsDecoding] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const triggerDecode = () => {
    if (isDecoding) return;
    setIsDecoding(true);
    let iteration = 0;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(
        text.split("").map((char, index) => {
          if (char === " " || char === "\n") return char;
          if (index < iteration) {
            return text[index];
          }
          return CYBER_SYMBOLS[Math.floor(Math.random() * CYBER_SYMBOLS.length)];
        })
      );

      if (iteration >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsDecoding(false);
      }

      iteration += 1 / 1.5; // Fast, clean, professional symbol resolution
    }, speed);
  };

  useEffect(() => {
    triggerDecode();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]);

  return (
    <span className={`inline-flex flex-wrap select-none ${className}`}>
      {displayText.map((char, index) => {
        const isResolved = char === text[index];
        const isSpace = char === " ";
        if (isSpace) return <span key={index} className="inline-block w-3 md:w-6">&nbsp;</span>;

        return (
          <motion.span
            key={index}
            initial={{ opacity: 0, filter: "blur(6px)", y: 8 }}
            animate={{
              opacity: 1,
              filter: "blur(0px)",
              y: 0,
              color: isResolved ? "#FAF9F6" : "#D4FF00",
            }}
            transition={{ duration: 0.2, delay: index * 0.015, ease: [0.16, 1, 0.3, 1] }}
            className={`inline-block transition-colors duration-200 ${
              isResolved ? "text-[#FAF9F6]" : "text-[#D4FF00] font-mono"
            }`}
          >
            {char}
          </motion.span>
        );
      })}
    </span>
  );
}
