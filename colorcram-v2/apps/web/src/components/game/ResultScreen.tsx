"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import type { HSB } from "@colorcram-v2/types";
import { hsbToHex } from "@colorcram-v2/color-utils";
import { DiagonalReveal } from "@/components/design-system/DiagonalReveal";
import { NumberSlide } from "@/components/design-system/NumberSlide";
import { playSound } from "@/lib/sounds";

interface ResultScreenProps {
  target: HSB;
  guess: HSB;
  score: number;
  round: number;
  totalRounds: number;
  onNext: () => void;
  /** For gradient mode */
  isGradient?: boolean;
  targetStart?: HSB;
  targetEnd?: HSB;
  guessStart?: HSB;
  guessEnd?: HSB;
  isLastRound?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "#22c55e";
  if (score >= 70) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function getFeedback(score: number): string {
  if (score >= 97) return "Perfect";
  if (score >= 90) return "Almost perfect";
  if (score >= 70) return "Good eye";
  if (score >= 40) return "Keep practicing";
  return "Way off";
}

export function ResultScreen({
  target,
  guess,
  score,
  round,
  totalRounds,
  onNext,
  isGradient = false,
  targetStart,
  targetEnd,
  guessStart,
  guessEnd,
  isLastRound = false,
}: ResultScreenProps) {
  const scoreColor = getScoreColor(score);
  const feedback = getFeedback(score);
  const targetHex = hsbToHex(target);
  const guessHex = hsbToHex(guess);

  useEffect(() => {
    playSound("reveal");
    const timer = setTimeout(() => {
      playSound(score >= 70 ? "success" : "fail");
    }, 400);
    return () => clearTimeout(timer);
  }, [score]);

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

        {/* Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, type: "spring", stiffness: 300, damping: 25 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              fontSize: "clamp(3rem, 8vw, 6rem)",
              fontWeight: 900,
              color: scoreColor,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              textShadow: `0 0 60px ${scoreColor}40`,
            }}
          >
            <NumberSlide value={`${Math.round(score)}%`} />
          </div>
          <motion.span
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#adadad",
              marginTop: 4,
            }}
          >
            {feedback}
          </motion.span>
        </motion.div>
      </div>

      {/* Diagonal color comparison */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
        }}
      >
        <div
          style={{
            width: "min(80vw, 500px)",
            height: "min(50vh, 400px)",
            borderRadius: 24,
            overflow: "hidden",
          }}
        >
          {isGradient && targetStart && targetEnd && guessStart && guessEnd ? (
            <DiagonalReveal
              targetColor={`linear-gradient(135deg, ${hsbToHex(targetStart)}, ${hsbToHex(targetEnd)})`}
              guessColor={`linear-gradient(135deg, ${hsbToHex(guessStart)}, ${hsbToHex(guessEnd)})`}
            />
          ) : (
            <DiagonalReveal
              targetColor={targetHex}
              guessColor={guessHex}
            />
          )}
        </div>
      </div>

      {/* Bottom: Next button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingTop: "clamp(16px, 3vw, 32px)",
        }}
      >
        <button
          onClick={onNext}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 600,
            color: "#ffffff",
            letterSpacing: "0.02em",
            padding: "12px 0",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          {isLastRound ? "See Results" : "Next"} &rarr;
        </button>
      </motion.div>
    </motion.div>
  );
}
