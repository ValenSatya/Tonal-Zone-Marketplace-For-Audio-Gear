"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  blur?: boolean;
  scale?: boolean;
  distance?: number;
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 1,
  blur = false,
  scale = false,
  distance = 80,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-15% 0px" });

  const getInitialState = () => {
    let state: any = { opacity: 0 };
    if (blur) state.filter = "blur(15px)";
    if (scale) state.scale = 0.95;

    switch (direction) {
      case "up":
        state.y = distance;
        break;
      case "down":
        state.y = -distance;
        break;
      case "left":
        state.x = distance;
        break;
      case "right":
        state.x = -distance;
        break;
      case "none":
        break;
      default:
        state.y = distance;
    }
    return state;
  };

  const getAnimateState = () => {
    let state: any = { opacity: 1, x: 0, y: 0 };
    if (blur) state.filter = "blur(0px)";
    if (scale) state.scale = 1;
    return state;
  };

  return (
    <motion.div
      ref={ref}
      initial={getInitialState()}
      animate={isInView ? getAnimateState() : getInitialState()}
      // Extremely smooth custom spring/easing mimicking high-end sites
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
