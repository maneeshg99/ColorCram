"use client";

import { motion } from "framer-motion";
import type { HSB } from "@colorcram-v2/types";
import { hsbToHex, hsbToRgb } from "@colorcram-v2/color-utils";

interface ColorDisplayProps {
  color: HSB;
  variant?: "swatch" | "memorize";
  label?: string;
  showHex?: boolean;
  children?: React.ReactNode;
}

/** Relative luminance for auto-contrast text */
function getLuminance(hsb: HSB): number {
  const rgb = hsbToRgb(hsb);
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastColor(hsb: HSB): string {
  return getLuminance(hsb) > 0.35 ? "#000000" : "#ffffff";
}

export function ColorDisplay({
  color,
  variant = "swatch",
  label,
  showHex = false,
  children,
}: ColorDisplayProps) {
  const hex = hsbToHex(color);
  const contrastColor = getContrastColor(color);

  if (variant === "memorize") {
    return (
      <div className="flex flex-col items-center gap-6 py-6 px-4">
        {/* Large color swatch */}
        <motion.div
          className="relative w-[calc(100vw-2rem)] max-w-[720px] h-[60vh] rounded-3xl flex flex-col items-center justify-center overflow-hidden"
          style={{
            backgroundColor: hex,
            boxShadow: `0 16px 64px ${hex}50, 0 0 0 1px ${hex}20`,
          }}
          initial={{ scale: 0.8, opacity: 0, borderRadius: "50%" }}
          animate={{ scale: 1, opacity: 1, borderRadius: "24px" }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 250,
            damping: 22,
          }}
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

        {/* Timer and round info below the swatch */}
        {children}
      </div>
    );
  }

  // Swatch variant
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {label && (
        <span className="text-[10px] font-semibold tracking-[0.2em] text-[var(--fg-muted)] uppercase">
          {label}
        </span>
      )}
      <div
        className="w-24 h-24 rounded-xl border border-[var(--border)]"
        style={{
          backgroundColor: hex,
          boxShadow: `0 4px 20px ${hex}30`,
        }}
      />
      {showHex && (
        <span className="text-xs font-mono text-[var(--fg-muted)]">{hex}</span>
      )}
    </motion.div>
  );
}

export { getContrastColor };
