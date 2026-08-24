"use client";

import React, { useEffect, useRef } from "react";
import anime from "animejs";

interface AnimeTextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function AnimeTextReveal({ text, className = "", delay = 0 }: AnimeTextRevealProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Reset opacity of all letters to 0 before animating
    const letters = containerRef.current.querySelectorAll(".anime-letter");
    anime.set(letters, { opacity: 0, translateY: 50, rotateX: -90 });

    const animation = anime({
      targets: letters,
      opacity: [0, 1],
      translateY: [50, 0],
      rotateX: [-90, 0],
      easing: "easeOutElastic(1, .6)",
      duration: 1200,
      delay: anime.stagger(50, { start: delay }), // Stagger with initial delay
    });

    return () => {
      // Cleanup running animations if component unmounts
      animation.pause();
    };
  }, [text, delay]);

  return (
    <h1 ref={containerRef} className={className} style={{ perspective: "1000px" }}>
      {text.split("").map((char, index) => (
        <span
          key={index}
          className="anime-letter inline-block"
          style={{ whiteSpace: char === " " ? "pre" : "normal" }}
        >
          {char}
        </span>
      ))}
    </h1>
  );
}
