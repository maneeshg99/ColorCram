"use client";

import { motion } from "motion/react";
import type { HSB } from "@colorcram-v2/types";
import { hsbToHex } from "@colorcram-v2/color-utils";

interface GradientComparisonProps {
  targetStart: HSB;
  targetEnd: HSB;
  guessStart: HSB;
  guessEnd: HSB;
}

export function GradientComparison({
  targetStart,
  targetEnd,
  guessStart,
  guessEnd,
}: GradientComparisonProps) {
  const targetGradient = `linear-gradient(to right, ${hsbToHex(targetStart)}, ${hsbToHex(targetEnd)})`;
  const guessGradient = `linear-gradient(to right, ${hsbToHex(guessStart)}, ${hsbToHex(guessEnd)})`;

  return (
    <div className="flex flex-col gap-3 w-full max-w-[360px]">
      {/* Target */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="text-[10px] font-semibold tracking-[0.2em] text-[var(--fg-muted)] uppercase mb-1.5">
          Target
        </div>
        <div
          className="w-full h-20 rounded-xl border border-[var(--border)]"
          style={{ background: targetGradient }}
        />
        <div className="flex justify-between mt-1 text-xs font-mono text-[var(--fg-muted)]">
          <span>{hsbToHex(targetStart)}</span>
          <span>{hsbToHex(targetEnd)}</span>
        </div>
      </motion.div>

      {/* Guess */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.15 }}
      >
        <div className="text-[10px] font-semibold tracking-[0.2em] text-[var(--fg-muted)] uppercase mb-1.5">
          Your Guess
        </div>
        <div
          className="w-full h-20 rounded-xl border border-[var(--border)]"
          style={{ background: guessGradient }}
        />
        <div className="flex justify-between mt-1 text-xs font-mono text-[var(--fg-muted)]">
          <span>{hsbToHex(guessStart)}</span>
          <span>{hsbToHex(guessEnd)}</span>
        </div>
      </motion.div>
    </div>
  );
}
