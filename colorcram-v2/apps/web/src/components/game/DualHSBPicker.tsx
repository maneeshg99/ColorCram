"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { HSB } from "@colorcram-v2/types";
import { hsbToHex } from "@colorcram-v2/color-utils";
import { HSBColorPicker } from "./HSBColorPicker";

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
  const startHex = hsbToHex(startValue);
  const endHex = hsbToHex(endValue);

  return (
    <motion.div
      className={disabled ? "opacity-30 pointer-events-none" : ""}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        width: "100%",
      }}
    >
      {/* Tab switcher - minimal text tabs */}
      <div style={{ display: "flex", gap: 24 }}>
        <button
          onClick={() => setActiveTab("start")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: activeTab === "start" ? 700 : 500,
            color: activeTab === "start" ? "#ffffff" : "#adadad",
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            padding: "8px 0",
            borderBottom: activeTab === "start" ? "2px solid #ffffff" : "2px solid transparent",
            transition: "all 0.2s ease",
          }}
        >
          Start Color
        </button>
        <button
          onClick={() => setActiveTab("end")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: activeTab === "end" ? 700 : 500,
            color: activeTab === "end" ? "#ffffff" : "#adadad",
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            padding: "8px 0",
            borderBottom: activeTab === "end" ? "2px solid #ffffff" : "2px solid transparent",
            transition: "all 0.2s ease",
          }}
        >
          End Color
        </button>
      </div>

      {/* Active picker */}
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
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

      {/* Live gradient preview bar */}
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          height: 40,
          borderRadius: 12,
          background: `linear-gradient(to right, ${startHex}, ${endHex})`,
          boxShadow: `0 4px 24px ${startHex}20, 0 4px 24px ${endHex}20`,
        }}
      />
    </motion.div>
  );
}
