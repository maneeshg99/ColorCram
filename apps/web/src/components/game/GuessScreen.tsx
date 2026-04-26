"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { HSB } from "@colorcram-v2/types";
import { HSBColorPicker } from "./HSBColorPicker";
import { DualHSBPicker } from "./DualHSBPicker";
import { RainbowRing } from "@/components/design-system/RainbowRing";
import { Modal, ModalHeader, ModalActions } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

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
      onClick={isGradient ? handleGradientSubmit : onSubmit}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Submit guess"
    >
      <RainbowRing size={64} spinning>
        <span style={{ fontSize: 11, fontWeight: 800, color: "#ffffff", letterSpacing: "0.12em", textTransform: "uppercase" }}>
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
        backgroundColor: "var(--bg)",
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
          alignItems: "center",
          marginBottom: "clamp(4px, 1.5vw, 16px)",
          flexShrink: 0,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <span
            style={{
              height: 2,
              width: 18,
              background: "var(--rainbow)",
              borderRadius: 999,
            }}
          />
          <span className="cc-eyebrow cc-mono cc-tnum">
            Round {round} / {totalRounds}
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="cc-headline"
          style={{ fontSize: "clamp(1.3rem, 3vw, 2.25rem)", color: "var(--fg)" }}
        >
          Recreate it
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

      {/* End color warning */}
      <Modal
        open={showEndColorWarning}
        onClose={() => setShowEndColorWarning(false)}
        labelledBy="end-color-warning-title"
      >
        <ModalHeader
          id="end-color-warning-title"
          title="Submit without an end color?"
          description="You haven't picked an end color for this gradient yet."
        />
        <ModalActions>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEndColorWarning(false)}
          >
            Go back
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setShowEndColorWarning(false);
              onSubmit();
            }}
          >
            Submit anyway
          </Button>
        </ModalActions>
      </Modal>
    </motion.div>
  );
}
