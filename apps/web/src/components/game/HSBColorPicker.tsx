"use client";

import { useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import type { HSB } from "@colorguesser/types";
import { hsbToHex } from "@colorguesser/color-utils";

interface HSBColorPickerProps {
  value: HSB;
  onChange: (hsb: HSB) => void;
  disabled?: boolean;
}

function hslString(h: number, s: number, l: number) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

interface StripProps {
  label: string;
  valueLabel: string;
  gradient: string;
  position: number; // 0-1
  onDrag: (position: number) => void;
  disabled: boolean;
}

function Strip({ label, valueLabel, gradient, position, onDrag, disabled }: StripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const handlePointer = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      const el = stripRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      onDrag(y);
    },
    [onDrag, disabled]
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] font-semibold tracking-[0.2em] text-[var(--fg-muted)] uppercase">
        {label}
      </span>
      <div
        ref={stripRef}
        className="relative w-10 h-[200px] sm:h-[280px] rounded-full overflow-hidden cursor-pointer select-none touch-none"
        style={{ background: gradient }}
        onPointerDown={(e) => {
          if (disabled) return;
          setDragging(true);
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          handlePointer(e);
        }}
        onPointerMove={(e) => dragging && handlePointer(e)}
        onPointerUp={() => setDragging(false)}
      >
        {/* Thumb */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-12 h-[6px] rounded-full bg-white border-2 border-[var(--bg)] pointer-events-none"
          style={{
            top: `calc(${position * 100}% - 3px)`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
            cursor: dragging ? "grabbing" : "grab",
          }}
          whileHover={{ scaleX: 1.15 }}
          animate={{ scaleX: dragging ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        />
      </div>
      <span className="text-xs font-mono text-[var(--fg-muted)] tabular-nums">
        {valueLabel}
      </span>
    </div>
  );
}

export function HSBColorPicker({ value, onChange, disabled = false }: HSBColorPickerProps) {
  const hex = hsbToHex(value);

  // Hue gradient: 7 stops for full spectrum (top to bottom)
  const hueGradient =
    "linear-gradient(to bottom, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))";

  // Saturation gradient: desaturated to fully saturated at current hue+brightness
  // Uses HSB-to-hex to show the actual resulting color at each saturation level
  const satStops = [0, 25, 50, 75, 100]
    .map((s) => hsbToHex({ h: value.h, s, b: value.b }))
    .map((hex, i) => `${hex} ${i * 25}%`)
    .join(", ");
  const satGradient = `linear-gradient(to bottom, ${satStops})`;

  // Brightness gradient: bright at top, dark at bottom (drag down = darker)
  const briStops = [100, 75, 50, 25, 0]
    .map((b) => hsbToHex({ h: value.h, s: value.s, b }))
    .map((hex, i) => `${hex} ${i * 25}%`)
    .join(", ");
  const briGradient = `linear-gradient(to bottom, ${briStops})`;

  return (
    <motion.div
      className={`flex flex-col items-center gap-3 sm:gap-6 ${disabled ? "opacity-30 pointer-events-none" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex gap-5 sm:gap-6">
        <Strip
          label="H"
          valueLabel={`${Math.round(value.h)}°`}
          gradient={hueGradient}
          position={value.h / 360}
          onDrag={(y) => onChange({ ...value, h: Math.round(y * 360) })}
          disabled={disabled}
        />
        <Strip
          label="S"
          valueLabel={`${Math.round(value.s)}%`}
          gradient={satGradient}
          position={value.s / 100}
          onDrag={(y) => onChange({ ...value, s: Math.round(y * 100) })}
          disabled={disabled}
        />
        <Strip
          label="B"
          valueLabel={`${Math.round(value.b)}%`}
          gradient={briGradient}
          position={1 - value.b / 100}
          onDrag={(y) => onChange({ ...value, b: Math.round((1 - y) * 100) })}
          disabled={disabled}
        />
      </div>

      {/* Color preview */}
      <div className="flex items-center gap-4">
        <motion.div
          className="w-[72px] h-[72px] sm:w-[100px] sm:h-[100px] rounded-2xl border border-[var(--border)]"
          style={{
            backgroundColor: hex,
            boxShadow: `0 8px 32px ${hex}40`,
          }}
          animate={{ boxShadow: `0 8px 32px ${hex}40` }}
          transition={{ duration: 0.3 }}
        />
        <div className="space-y-1">
          <div className="text-lg font-mono font-bold tracking-tight">{hex}</div>
          <div className="text-xs font-mono text-[var(--fg-muted)] tabular-nums space-y-0.5">
            <div>H {Math.round(value.h)}° &middot; S {Math.round(value.s)}% &middot; B {Math.round(value.b)}%</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
