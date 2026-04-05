"use client";

import { motion } from "framer-motion";
import type { HSB } from "@colorcram-v2/types";
import { hsbToHex } from "@colorcram-v2/color-utils";
import { HSBStrip } from "./HSBStrip";

interface HSBColorPickerProps {
  value: HSB;
  onChange: (hsb: HSB) => void;
  disabled?: boolean;
}

export function HSBColorPicker({ value, onChange, disabled = false }: HSBColorPickerProps) {
  const hex = hsbToHex(value);

  // Hue gradient: full spectrum
  const hueColors = [
    "hsl(0,100%,50%)",
    "hsl(60,100%,50%)",
    "hsl(120,100%,50%)",
    "hsl(180,100%,50%)",
    "hsl(240,100%,50%)",
    "hsl(300,100%,50%)",
    "hsl(360,100%,50%)",
  ];

  // Saturation gradient: desaturated to fully saturated
  const satColors = [0, 25, 50, 75, 100].map(
    (s) => hsbToHex({ h: value.h, s, b: value.b })
  );

  // Brightness gradient: bright at top, dark at bottom
  const briColors = [100, 75, 50, 25, 0].map(
    (b) => hsbToHex({ h: value.h, s: value.s, b })
  );

  return (
    <motion.div
      className={disabled ? "opacity-30 pointer-events-none" : ""}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        {/* Strips */}
        <div style={{ display: "flex", gap: 24 }}>
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

        {/* Color preview */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <motion.div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              backgroundColor: hex,
              boxShadow: `0 12px 40px ${hex}50`,
            }}
            animate={{ boxShadow: `0 12px 40px ${hex}50` }}
            transition={{ duration: 0.3 }}
          />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 14,
              color: "#adadad",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "0.05em",
            }}
          >
            {hex}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
