"use client";

import { motion } from "motion/react";

interface DiagonalRevealProps {
  targetColor: string;
  guessColor: string;
}

export function DiagonalReveal({ targetColor, guessColor }: DiagonalRevealProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: "var(--radius-md)",
      }}
    >
      {/* Target — top-left triangle */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
          position: "absolute",
          inset: 0,
          background: targetColor,
          clipPath: "polygon(0 0, 100% 0, 0 100%)",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "12%",
            left: "10%",
            fontSize: "var(--text-label)",
            fontWeight: 600,
            color: "#fff",
            textShadow: "0 1px 3px rgba(0,0,0,0.4)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Target
        </span>
      </motion.div>

      {/* Guess — bottom-right triangle */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.1,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
          position: "absolute",
          inset: 0,
          background: guessColor,
          clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
        }}
      >
        <span
          style={{
            position: "absolute",
            bottom: "12%",
            right: "10%",
            fontSize: "var(--text-label)",
            fontWeight: 600,
            color: "#fff",
            textShadow: "0 1px 3px rgba(0,0,0,0.4)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Yours
        </span>
      </motion.div>
    </div>
  );
}
