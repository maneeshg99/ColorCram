"use client";

import { motion } from "framer-motion";
import type { HSB } from "@colorcram-v2/types";
import { hsbToHex } from "@colorcram-v2/color-utils";
import { getContrastColor } from "./ColorDisplay";

interface GradientDisplayProps {
  startColor: HSB;
  endColor: HSB;
  variant: "memorize" | "preview";
  children?: React.ReactNode;
}

export function GradientDisplay({
  startColor,
  endColor,
  variant,
  children,
}: GradientDisplayProps) {
  const startHex = hsbToHex(startColor);
  const endHex = hsbToHex(endColor);
  const gradient = `linear-gradient(to right, ${startHex}, ${endHex})`;

  // Use midpoint luminance for contrast
  const midColor: HSB = {
    h: (startColor.h + endColor.h) / 2,
    s: (startColor.s + endColor.s) / 2,
    b: (startColor.b + endColor.b) / 2,
  };
  const contrastColor = getContrastColor(midColor);

  if (variant === "memorize") {
    return (
      <div className="flex flex-col items-center gap-6 py-6 px-4">
        <motion.div
          className="relative w-[calc(100vw-2rem)] max-w-[720px] h-[60vh] rounded-3xl flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: gradient,
            boxShadow: `0 16px 64px ${startHex}30, 0 16px 64px ${endHex}30`,
          }}
          initial={{ scale: 0.8, opacity: 0, borderRadius: "50%" }}
          animate={{ scale: 1, opacity: 1, borderRadius: "24px" }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 250, damping: 22 }}
        >
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: contrastColor, opacity: 0.4 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.4, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            memorize
          </motion.p>
        </motion.div>
        {children}
      </div>
    );
  }

  // Preview variant - small bar
  return (
    <div
      className="w-full h-12 rounded-xl border border-[var(--border)]"
      style={{
        background: gradient,
        boxShadow: `0 4px 16px ${startHex}20, 0 4px 16px ${endHex}20`,
      }}
    />
  );
}
