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
  /** Gradient mode props */
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
  const previewColor = isGradient && guessStart && guessEnd
    ? `linear-gradient(135deg, ${hsbToHex(guessStart)}, ${hsbToHex(guessEnd)})`
    : hsbToHex(guess);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        minHeight: "100vh",
        backgroundColor: "#131313",
        display: "flex",
        flexDirection: "column",
        padding: "clamp(20px, 3vw, 40px)",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "clamp(16px, 3vw, 32px)",
        }}
      >
        {/* Round indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#adadad",
            letterSpacing: "0.05em",
          }}
        >
          {round} / {totalRounds}
        </motion.div>

        {/* GUESS label */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}
        >
          GUESS
        </motion.div>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "clamp(24px, 4vw, 64px)",
          flexWrap: "wrap",
        }}
      >
        {/* Picker */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {isGradient && guessStart && guessEnd && onGuessStartChange && onGuessEndChange ? (
            <DualHSBPicker
              startValue={guessStart}
              endValue={guessEnd}
              onStartChange={onGuessStartChange}
              onEndChange={onGuessEndChange}
            />
          ) : (
            <HSBColorPicker value={guess} onChange={onGuessChange} />
          )}
        </motion.div>

        {/* Preview area + GO button */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
          }}
        >
          {/* Large color preview */}
          <div
            style={{
              width: "clamp(120px, 20vw, 200px)",
              height: "clamp(120px, 20vw, 200px)",
              borderRadius: "50%",
              ...(isGradient
                ? { background: previewColor }
                : { backgroundColor: previewColor as string }),
              boxShadow: isGradient
                ? undefined
                : `0 16px 48px ${previewColor}40`,
              transition: "background-color 0.15s ease, box-shadow 0.3s ease",
            }}
          />

          {/* GO button with RainbowRing */}
          <motion.button
            onHoverStart={() => setGoHovered(true)}
            onHoverEnd={() => setGoHovered(false)}
            onClick={onSubmit}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            whileTap={{ scale: 0.95 }}
          >
            <RainbowRing size={72} spinning={goHovered}>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "0.1em",
                }}
              >
                GO
              </span>
            </RainbowRing>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
