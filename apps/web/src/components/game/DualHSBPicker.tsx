"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { motion } from "motion/react";
import type { HSB } from "@colorcram-v2/types";
import { hsbToHex } from "@colorcram-v2/color-utils";
import { HSBStrip } from "./HSBStrip";

interface DualHSBPickerProps {
  startValue: HSB;
  endValue: HSB;
  onStartChange: (hsb: HSB) => void;
  onEndChange: (hsb: HSB) => void;
  disabled?: boolean;
  submitButton?: ReactNode;
}

interface TabPillProps {
  label: string;
  active: boolean;
  swatch: string;
  onClick: () => void;
}

function TabPill({ label, active, swatch, onClick }: TabPillProps) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 14px",
        borderRadius: 999,
        background: active ? "var(--surface-overlay)" : "transparent",
        color: active ? "var(--fg)" : "var(--fg-muted)",
        fontSize: 12,
        fontWeight: active ? 700 : 500,
        letterSpacing: "0.02em",
        cursor: "pointer",
        border: "none",
        transition:
          "background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: swatch,
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2)",
        }}
      />
      <span>{label}</span>
    </button>
  );
}

export function DualHSBPicker({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  disabled = false,
  submitButton,
}: DualHSBPickerProps) {
  const [activeTab, setActiveTab] = useState<"start" | "end">("start");
  const activeValue = activeTab === "start" ? startValue : endValue;
  const activeOnChange = activeTab === "start" ? onStartChange : onEndChange;
  const hex = hsbToHex(activeValue);
  const startHex = hsbToHex(startValue);
  const endHex = hsbToHex(endValue);

  const hueColors = [
    "hsl(0,100%,50%)",
    "hsl(60,100%,50%)",
    "hsl(120,100%,50%)",
    "hsl(180,100%,50%)",
    "hsl(240,100%,50%)",
    "hsl(300,100%,50%)",
    "hsl(360,100%,50%)",
  ];

  const satColors = [0, 25, 50, 75, 100].map(
    (s) => hsbToHex({ h: activeValue.h, s, b: activeValue.b })
  );

  const briColors = [100, 75, 50, 25, 0].map(
    (b) => hsbToHex({ h: activeValue.h, s: activeValue.s, b })
  );

  return (
    <motion.div
      className={disabled ? "opacity-30 pointer-events-none" : ""}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "clamp(8px, 1.5vw, 16px)",
      }}
    >
      {/* Tab switcher */}
      <div
        role="tablist"
        style={{
          display: "inline-flex",
          padding: 3,
          gap: 2,
          borderRadius: 999,
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <TabPill
          label="Start"
          active={activeTab === "start"}
          swatch={startHex}
          onClick={() => setActiveTab("start")}
        />
        <TabPill
          label="End"
          active={activeTab === "end"}
          swatch={endHex}
          onClick={() => setActiveTab("end")}
        />
      </div>

      {/* HSB strips + right column (color circle, gradient bar, GO) */}
      <div style={{ display: "flex", alignItems: "stretch", gap: "clamp(12px, 2vw, 24px)" }}>
        {/* Strips */}
        <div style={{ display: "flex", gap: "clamp(8px, 1.5vw, 16px)" }}>
          <HSBStrip
            label="H"
            colors={hueColors}
            position={activeValue.h / 360}
            onDrag={(y) => activeOnChange({ ...activeValue, h: Math.round(y * 360) })}
          />
          <HSBStrip
            label="S"
            colors={satColors}
            position={activeValue.s / 100}
            onDrag={(y) => activeOnChange({ ...activeValue, s: Math.round(y * 100) })}
          />
          <HSBStrip
            label="B"
            colors={briColors}
            position={1 - activeValue.b / 100}
            onDrag={(y) => activeOnChange({ ...activeValue, b: Math.round((1 - y) * 100) })}
          />
        </div>

        {/* Right column: color circle, hex, gradient bar, GO */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          {/* Active color preview */}
          <motion.div
            style={{
              width: "clamp(64px, 12vw, 100px)",
              height: "clamp(64px, 12vw, 100px)",
              borderRadius: "50%",
              backgroundColor: hex,
              boxShadow: `0 16px 40px ${hex}55, inset 0 0 0 1px rgba(255,255,255,0.08)`,
            }}
            animate={{ boxShadow: `0 16px 40px ${hex}55, inset 0 0 0 1px rgba(255,255,255,0.08)` }}
            transition={{ duration: 0.3 }}
          />
          <span
            className="cc-mono cc-tnum"
            style={{
              fontSize: 10.5,
              color: "var(--fg-muted)",
              letterSpacing: "0.08em",
              padding: "3px 9px",
              borderRadius: 999,
              border: "1px solid var(--border)",
              background: "var(--surface)",
            }}
          >
            {hex.toUpperCase()}
          </span>

          {/* Gradient preview bar (vertical) — matches strip height minus circle/hex/button */}
          <div
            style={{
              width: "clamp(56px, 12vw, 90px)",
              flex: 1,
              minHeight: 60,
              borderRadius: 12,
              background: `linear-gradient(to bottom, ${startHex}, ${endHex})`,
              boxShadow: `0 8px 24px ${startHex}25, 0 8px 24px ${endHex}25, inset 0 0 0 1px rgba(255,255,255,0.08)`,
            }}
          />

          {/* Submit button */}
          {submitButton && (
            <div style={{ marginTop: 4 }}>
              {submitButton}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
