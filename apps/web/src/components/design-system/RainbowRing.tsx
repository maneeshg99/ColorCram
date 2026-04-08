"use client";

import { motion } from "motion/react";
import { type ReactNode, useState } from "react";

interface RainbowRingProps {
  children: ReactNode;
  size: number;
  spinning?: boolean;
}

export function RainbowRing({
  children,
  size,
  spinning = false,
}: RainbowRingProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isSpinning = spinning || isHovered;

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={{ scale: isHovered ? 1.08 : 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <style>{`
        @keyframes rainbow-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      {/* Gradient ring */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "conic-gradient(from 0deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff0000)",
          animation: isSpinning ? "rainbow-spin 2s linear infinite" : "none",
        }}
      />
      {/* Inner disc — fades to reveal gradient on hover */}
      <motion.div
        animate={{ backgroundColor: isHovered ? "rgba(19, 19, 19, 0.25)" : "rgba(19, 19, 19, 1)" }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          inset: 2,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
