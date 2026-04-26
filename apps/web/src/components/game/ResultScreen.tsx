"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
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
  if (score >= 90) return "#38d97a";
  if (score >= 70) return "#f5c64b";
  if (score >= 40) return "#ff8c42";
  return "#ff5a5a";
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
        height: "100dvh",
        backgroundColor: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        padding: "clamp(12px, 2vw, 24px)",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "clamp(8px, 1.5vw, 16px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Home */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Link
              href="/"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--fg-subtle)",
                transition: "color var(--duration-fast) var(--ease-out)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--fg)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--fg-subtle)"; }}
            >
              ← Home
            </Link>
          </motion.div>

          <span
            aria-hidden="true"
            style={{
              width: 1,
              height: 12,
              background: "var(--border-strong)",
            }}
          />

          {/* Round indicator */}
          <motion.span
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="cc-eyebrow cc-mono cc-tnum"
          >
            Round {round} / {totalRounds}
          </motion.span>
        </div>

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
              fontSize: "clamp(3rem, 7vw, 5rem)",
              fontWeight: 900,
              color: scoreColor,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              textShadow: `0 0 60px ${scoreColor}40`,
              minWidth: "4ch",
              textAlign: "right",
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

      {/* Color comparison */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 0,
        }}
      >
        {isGradient && targetStart && targetEnd && guessStart && guessEnd ? (
          <div
            style={{
              display: "flex",
              gap: "clamp(12px, 3vw, 24px)",
              alignItems: "center",
              justifyContent: "center",
              width: "min(92vw, 900px)",
              height: "min(70vh, 750px)",
            }}
          >
            {/* Target gradient */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flex: 1, height: "100%" }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#adadad",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Target
              </span>
              <div
                style={{
                  flex: 1,
                  width: "100%",
                  borderRadius: 20,
                  background: `linear-gradient(to bottom, ${hsbToHex(targetStart)}, ${hsbToHex(targetEnd)})`,
                  boxShadow: `0 8px 32px ${hsbToHex(targetStart)}30`,
                }}
              />
            </motion.div>
            {/* Guess gradient */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flex: 1, height: "100%" }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#adadad",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Yours
              </span>
              <div
                style={{
                  flex: 1,
                  width: "100%",
                  borderRadius: 20,
                  background: `linear-gradient(to bottom, ${hsbToHex(guessStart)}, ${hsbToHex(guessEnd)})`,
                  boxShadow: `0 8px 32px ${hsbToHex(guessStart)}30`,
                }}
              />
            </motion.div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: "min(92vw, 900px)",
                height: "min(68vh, 750px)",
                borderRadius: 24,
                overflow: "hidden",
              }}
            >
              <DiagonalReveal
                targetColor={targetHex}
                guessColor={guessHex}
              />
            </div>
            {/* HSB Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                display: "flex",
                gap: "clamp(24px, 4vw, 48px)",
                fontFamily: "monospace",
                fontSize: 13,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase" }}>Target</span>
                <span style={{ color: "#adadad" }}>H: {Math.round(target.h)}°</span>
                <span style={{ color: "#adadad" }}>S: {Math.round(target.s)}%</span>
                <span style={{ color: "#adadad" }}>B: {Math.round(target.b)}%</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase" }}>Guess</span>
                <span style={{ color: "#adadad" }}>H: {Math.round(guess.h)}°</span>
                <span style={{ color: "#adadad" }}>S: {Math.round(guess.s)}%</span>
                <span style={{ color: "#adadad" }}>B: {Math.round(guess.b)}%</span>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Bottom: Next button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingTop: "clamp(8px, 1.5vw, 16px)",
        }}
      >
        <button
          onClick={onNext}
          style={{
            background: "var(--accent)",
            color: "var(--accent-ink)",
            border: "1px solid var(--accent)",
            borderRadius: 999,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "-0.005em",
            padding: "10px 22px",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            transition: "transform var(--duration-fast) var(--ease-out)",
            boxShadow: "var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <span>{isLastRound ? "See results" : "Next round"}</span>
          <span aria-hidden="true">&rarr;</span>
        </button>
      </motion.div>
    </motion.div>
  );
}
