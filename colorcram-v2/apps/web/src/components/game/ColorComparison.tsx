"use client";

import { motion } from "framer-motion";
import type { HSB } from "@colorcram-v2/types";
import { hsbToHex } from "@colorcram-v2/color-utils";
import { getContrastColor } from "./ColorDisplay";

interface ColorComparisonProps {
  target: HSB;
  guess: HSB;
}

export function ColorComparison({ target, guess }: ColorComparisonProps) {
  const targetHex = hsbToHex(target);
  const guessHex = hsbToHex(guess);
  const targetContrast = getContrastColor(target);
  const guessContrast = getContrastColor(guess);

  return (
    <div className="relative w-[280px] h-[280px] rounded-2xl overflow-hidden border border-[var(--border)]">
      {/* Target - top-left triangle */}
      <motion.div
        className="absolute inset-0 flex items-start justify-start p-5"
        style={{
          backgroundColor: targetHex,
          clipPath: "polygon(0 0, 100% 0, 0 100%)",
        }}
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div style={{ color: targetContrast }}>
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase opacity-60">
            Target
          </div>
          <div className="text-xs font-mono mt-0.5 opacity-80">{targetHex}</div>
        </div>
      </motion.div>

      {/* Guess - bottom-right triangle */}
      <motion.div
        className="absolute inset-0 flex items-end justify-end p-5"
        style={{
          backgroundColor: guessHex,
          clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
        }}
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.15 }}
      >
        <div className="text-right" style={{ color: guessContrast }}>
          <div className="text-[10px] font-semibold tracking-[0.2em] uppercase opacity-60">
            Guess
          </div>
          <div className="text-xs font-mono mt-0.5 opacity-80">{guessHex}</div>
        </div>
      </motion.div>

      {/* Diagonal line */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, transparent calc(50% - 1px), var(--border) calc(50% - 1px), var(--border) calc(50% + 1px), transparent calc(50% + 1px))",
        }}
      />
    </div>
  );
}
