"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { HSB } from "@colorcram-v2/types";
import { hsbToHex } from "@colorcram-v2/color-utils";
import { HSBColorPicker } from "./HSBColorPicker";
import { DualHSBPicker } from "./DualHSBPicker";
import { RainbowRing } from "@/components/design-system/RainbowRing";

const DEFAULT_GUESS: HSB = { h: 180, s: 50, b: 50 };

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
  const [showEndColorWarning, setShowEndColorWarning] = useState(false);

  const isEndColorDefault = guessEnd &&
    guessEnd.h === DEFAULT_GUESS.h &&
    guessEnd.s === DEFAULT_GUESS.s &&
    guessEnd.b === DEFAULT_GUESS.b;

  const handleGradientSubmit = () => {
    if (isGradient && isEndColorDefault) {
      setShowEndColorWarning(true);
      return;
    }
    onSubmit();
  };

  const submitButton = (
    <motion.button
      onHoverStart={() => setGoHovered(true)}
      onHoverEnd={() => setGoHovered(false)}
      onClick={isGradient ? handleGradientSubmit : onSubmit}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
      whileTap={{ scale: 0.95 }}
    >
      <RainbowRing size={64} spinning>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#ffffff", letterSpacing: "0.08em" }}>
          Submit
        </span>
      </RainbowRing>
    </motion.button>
  );

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

      {/* Main content — picker + preview + Submit */}
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
          {isGradient && guessStart && guessEnd && onGuessStartChange && onGuessEndChange ? (
            <DualHSBPicker
              startValue={guessStart}
              endValue={guessEnd}
              onStartChange={onGuessStartChange}
              onEndChange={onGuessEndChange}
              submitButton={submitButton}
            />
          ) : (
            <HSBColorPicker value={guess} onChange={onGuessChange} submitButton={submitButton} />
          )}
        </motion.div>
      </div>

      {/* End color warning modal */}
      <AnimatePresence>
        {showEndColorWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            onClick={() => setShowEndColorWarning(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#1a1a1a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 16,
                padding: "28px 32px",
                maxWidth: 320,
                width: "90%",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                Are you sure?
              </p>
              <p style={{ fontSize: 13, color: "#888", marginBottom: 24, lineHeight: 1.5 }}>
                You haven&apos;t chosen an End Color.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button
                  onClick={() => { setShowEndColorWarning(false); onSubmit(); }}
                  style={{
                    background: "none",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 20,
                    padding: "8px 20px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                >
                  Submit anyway
                </button>
                <button
                  onClick={() => setShowEndColorWarning(false)}
                  style={{
                    background: "none",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 20,
                    padding: "8px 20px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#adadad",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                >
                  Go back
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
