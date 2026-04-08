"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import type { HSB } from "@colorcram-v2/types";
import { hsbToHex, hsbToRgb } from "@colorcram-v2/color-utils";
import { NumberSlide } from "@/components/design-system/NumberSlide";
import { playSound } from "@/lib/sounds";

interface MemorizeScreenProps {
  color: HSB;
  round: number;
  totalRounds: number;
  timeMs: number;
  totalTimeMs: number;
  onComplete: () => void;
  /** For gradient mode */
  gradient?: { start: HSB; end: HSB };
}

function getLuminance(hsb: HSB): number {
  const rgb = hsbToRgb(hsb);
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getTextColor(hsb: HSB): string {
  return getLuminance(hsb) > 0.35 ? "#000000" : "#ffffff";
}

function getTextColorAlpha(hsb: HSB, alpha: number): string {
  const isLight = getLuminance(hsb) > 0.35;
  return isLight ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha})`;
}

export function MemorizeScreen({
  color,
  round,
  totalRounds,
  timeMs,
  totalTimeMs,
  onComplete,
  gradient,
}: MemorizeScreenProps) {
  const [remainingMs, setRemainingMs] = useState(totalTimeMs);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const lastTickSecRef = useRef(-1);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setRemainingMs(totalTimeMs);
    completedRef.current = false;
    lastTickSecRef.current = -1;

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, totalTimeMs - elapsed);
      setRemainingMs(remaining);

      // Tick sound on each second change
      const sec = Math.floor(remaining / 1000);
      if (sec !== lastTickSecRef.current && sec >= 0) {
        lastTickSecRef.current = sec;
        if (sec <= 3 && sec > 0) playSound("tick");
      }

      if (remaining <= 0 && !completedRef.current) {
        completedRef.current = true;
        clearInterval(interval);
        onCompleteRef.current();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [totalTimeMs]);

  const isGradient = !!gradient;
  const bgColor = isGradient
    ? `linear-gradient(135deg, ${hsbToHex(gradient!.start)}, ${hsbToHex(gradient!.end)})`
    : hsbToHex(color);

  // For contrast: use midpoint for gradients, or just the color
  const contrastRef = isGradient
    ? {
        h: (gradient!.start.h + gradient!.end.h) / 2,
        s: (gradient!.start.s + gradient!.end.s) / 2,
        b: (gradient!.start.b + gradient!.end.b) / 2,
      }
    : color;

  const textColor = getTextColor(contrastRef);
  const mutedColor = getTextColorAlpha(contrastRef, 0.5);

  const displaySec = Math.floor(remainingMs / 1000);
  const displayCenti = Math.floor((remainingMs % 1000) / 10);
  const timeStr = `${displaySec}.${displayCenti.toString().padStart(2, "0")}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        ...(isGradient
          ? { background: bgColor }
          : { backgroundColor: bgColor as string }),
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "clamp(24px, 4vw, 48px)",
          flex: "0 0 auto",
        }}
      >
        {/* Round indicator - top left */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: mutedColor,
            letterSpacing: "0.05em",
          }}
        >
          {round} / {totalRounds}
        </motion.div>

        {/* Timer - top right */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <div
            className="font-mono"
            style={{
              fontSize: "clamp(2.5rem, 7vw, 5rem)",
              fontWeight: 700,
              color: textColor,
              lineHeight: 1,
              minWidth: "4.5ch",
              textAlign: "right",
            }}
          >
            <NumberSlide value={timeStr} />
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.25em",
              color: mutedColor,
              textTransform: "uppercase" as const,
              marginTop: 8,
            }}
          >
            MEMORIZE
          </span>
        </motion.div>
      </div>

      {/* Center area - empty, just the color */}
      <div style={{ flex: 1 }} />
    </motion.div>
  );
}
