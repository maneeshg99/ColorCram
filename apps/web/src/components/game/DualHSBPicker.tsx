"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { HSB } from "@colorguesser/types";
import { HSBColorPicker } from "./HSBColorPicker";
import { GradientDisplay } from "./GradientDisplay";

interface DualHSBPickerProps {
  startValue: HSB;
  endValue: HSB;
  onStartChange: (hsb: HSB) => void;
  onEndChange: (hsb: HSB) => void;
  disabled?: boolean;
}

export function DualHSBPicker({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  disabled = false,
}: DualHSBPickerProps) {
  const [activeTab, setActiveTab] = useState<"start" | "end">("start");

  return (
    <motion.div
      className="flex flex-col items-center gap-5 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-lg bg-[var(--surface)]">
        <button
          className={`px-5 py-2 rounded-md text-sm font-semibold transition-colors ${
            activeTab === "start"
              ? "bg-[var(--accent)] text-[var(--bg)]"
              : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
          }`}
          onClick={() => setActiveTab("start")}
        >
          Start Color
        </button>
        <button
          className={`px-5 py-2 rounded-md text-sm font-semibold transition-colors ${
            activeTab === "end"
              ? "bg-[var(--accent)] text-[var(--bg)]"
              : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
          }`}
          onClick={() => setActiveTab("end")}
        >
          End Color
        </button>
      </div>

      {/* Active picker */}
      <div className="w-full flex justify-center">
        {activeTab === "start" ? (
          <HSBColorPicker
            key="start"
            value={startValue}
            onChange={onStartChange}
            disabled={disabled}
          />
        ) : (
          <HSBColorPicker
            key="end"
            value={endValue}
            onChange={onEndChange}
            disabled={disabled}
          />
        )}
      </div>

      {/* Live gradient preview */}
      <div className="w-full max-w-[360px]">
        <GradientDisplay
          startColor={startValue}
          endColor={endValue}
          variant="preview"
        />
      </div>
    </motion.div>
  );
}
