"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import type { HSB } from "@colorcram-v2/types";
import { hsbToHex } from "@colorcram-v2/color-utils";
import { HSBStrip } from "./HSBStrip";

interface HSBColorPickerProps {
  value: HSB;
  onChange: (hsb: HSB) => void;
  disabled?: boolean;
  submitButton?: ReactNode;
}

export function HSBColorPicker({ value, onChange, disabled = false, submitButton }: HSBColorPickerProps) {
  const hex = hsbToHex(value);

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
    (s) => hsbToHex({ h: value.h, s, b: value.b })
  );

  const briColors = [100, 75, 50, 25, 0].map(
    (b) => hsbToHex({ h: value.h, s: value.s, b })
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
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "clamp(12px, 2vw, 24px)" }}>
        {/* Strips */}
        <div style={{ display: "flex", gap: "clamp(8px, 1.5vw, 16px)" }}>
          <HSBStrip
            label="H"
            colors={hueColors}
            position={value.h / 360}
            onDrag={(y) => onChange({ ...value, h: Math.round(y * 360) })}
          />
          <HSBStrip
            label="S"
            colors={satColors}
            position={value.s / 100}
            onDrag={(y) => onChange({ ...value, s: Math.round(y * 100) })}
          />
          <HSBStrip
            label="B"
            colors={briColors}
            position={1 - value.b / 100}
            onDrag={(y) => onChange({ ...value, b: Math.round((1 - y) * 100) })}
          />
        </div>

        {/* Color preview + submit button */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <motion.div
            style={{
              width: "clamp(76px, 14vw, 124px)",
              height: "clamp(76px, 14vw, 124px)",
              borderRadius: "50%",
              backgroundColor: hex,
              boxShadow: `0 16px 48px ${hex}55, inset 0 0 0 1px rgba(255,255,255,0.08)`,
            }}
            animate={{ boxShadow: `0 16px 48px ${hex}55, inset 0 0 0 1px rgba(255,255,255,0.08)` }}
            transition={{ duration: 0.3 }}
          />
          <span
            className="cc-mono cc-tnum"
            style={{
              fontSize: 11,
              color: "var(--fg-muted)",
              letterSpacing: "0.08em",
              padding: "3px 10px",
              borderRadius: 999,
              border: "1px solid var(--border)",
              background: "var(--surface)",
            }}
          >
            {hex.toUpperCase()}
          </span>
          {submitButton && (
            <div style={{ marginTop: 6 }}>
              {submitButton}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
