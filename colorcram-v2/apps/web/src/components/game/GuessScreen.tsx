"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { HSB } from "@colorcram-v2/types";
import { hsbToHex } from "@colorcram-v2/color-utils";
import { HSBColorPicker } from "./HSBColorPicker";
import { DualHSBPicker } from "./DualHSBPicker";
import { RainbowRing } from "@/components/design-system/RainbowRing";

interface GuessScreenProps {
  round: number;
  totalRounds: number;
  guess: HSB;
  onGuessChange: (hsb: HSB) => void;
  onSubmit: () => void;
  isGradient?: boolean;
  guessStart?: HSB;
  guessEnd?: HSB;
  onGuessStartChange?: (hsb: HSB) => void;
  onGuessEndChange?: (hsb: HSB) => void;
}

export function GuessScreen({
  round,
  totalRounds,
  guess,
  onGuessChange,
  onSubmit,
  isGradient = false,
  guessStart,
  guessEnd,
  onGuessStartChange,
  onGuessEndChange,
}: GuessScreenProps) {
  const [goHovered, setGoHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        height: "100dvh",
        backgroundColor: "#131313",
        display: "flex",
        flexDirection: "column",
        padding: "clamp(12px, 2vw, 32px)",
        overflow: "hidden",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "clamp(4px, 1.5vw, 16px)",
          flexShrink: 0,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ fontSize: 13, fontWeight: 500, color: "#adadad", letterSpacing: "0.05em" }}
        >
          {round} / {totalRounds}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}
        >
          GUESS
        </motion.div>
      </div>

      {/* Main content — picker + preview + GO */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(16px, 3vw, 32px)",
          }}
        >
          {/* Picker strips */}
          {isGradient && guessStart && guessEnd && onGuessStartChange && onGuessEndChange ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <DualHSBPicker
                startValue={guessStart}
                endValue={guessEnd}
                onStartChange={onGuessStartChange}
                onEndChange={onGuessEndChange}
              />
              <motion.button
                onHoverStart={() => setGoHovered(true)}
                onHoverEnd={() => setGoHovered(false)}
                onClick={onSubmit}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                whileTap={{ scale: 0.95 }}
              >
                <RainbowRing size={64} spinning={goHovered}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#ffffff", letterSpacing: "0.1em" }}>
                    GO
                  </span>
                </RainbowRing>
              </motion.button>
            </div>
          ) : (
            <HSBColorPicker value={guess} onChange={onGuessChange} submitButton={
              <motion.button
                onHoverStart={() => setGoHovered(true)}
                onHoverEnd={() => setGoHovered(false)}
                onClick={onSubmit}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                whileTap={{ scale: 0.95 }}
              >
                <RainbowRing size={64} spinning={goHovered}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#ffffff", letterSpacing: "0.1em" }}>
                    GO
                  </span>
                </RainbowRing>
              </motion.button>
            } />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
