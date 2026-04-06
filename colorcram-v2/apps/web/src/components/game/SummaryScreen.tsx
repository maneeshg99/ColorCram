"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import type { GameResults, GameMode, Difficulty } from "@colorcram-v2/types";
import { hsbToHex } from "@colorcram-v2/color-utils";
import { NumberSlide } from "@/components/design-system/NumberSlide";
import { FoldReveal } from "@/components/design-system/FoldReveal";
import { ScoreSubmitter } from "./ScoreSubmitter";

interface SummaryScreenProps {
  results: GameResults;
  mode: GameMode;
  difficulty: Difficulty;
  onPlayAgain: () => void;
  onShare?: () => void;
}

function getRankText(avgScore: number): string {
  if (avgScore >= 97) return "Chromatic Savant";
  if (avgScore >= 90) return "Color Master";
  if (avgScore >= 80) return "Sharp Eye";
  if (avgScore >= 70) return "Keen Observer";
  if (avgScore >= 50) return "Getting There";
  return "Keep Practicing";
}

function getScoreColor(score: number): string {
  if (score >= 90) return "#22c55e";
  if (score >= 70) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

export function SummaryScreen({
  results,
  mode,
  difficulty,
  onPlayAgain,
  onShare,
}: SummaryScreenProps) {
  const avgScore =
    results.rounds.length > 0
      ? Math.round(results.totalScore / results.rounds.length)
      : 0;
  const scoreColor = getScoreColor(avgScore);
  const rankText = getRankText(avgScore);
  const isGradient = mode === "gradient";
  const isBlitz = mode === "blitz";

  const handleShare = useCallback(() => {
    const lines = [
      `ColorCram ${mode} (${difficulty})`,
      `Score: ${avgScore}%`,
      "",
      ...(isGradient && results.gradientRounds
        ? results.gradientRounds.map((r, i) => `R${i + 1}: ${r.score}%`)
        : results.rounds.map((r, i) => `R${i + 1}: ${r.score}%`)),
      "",
      "colorcram.com",
    ];
    const text = lines.join("\n");
    navigator.clipboard.writeText(text).catch(() => {});
    onShare?.();
  }, [results, mode, difficulty, avgScore, isGradient, onShare]);

  const rounds = isGradient && results.gradientRounds
    ? results.gradientRounds
    : results.rounds;

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
        padding: "clamp(24px, 4vw, 48px)",
        overflow: "hidden",
      }}
    >
      {/* Main layout */}
      <div
        style={{
          flex: 1,
          display: "flex",
          gap: "clamp(16px, 3vw, 40px)",
          flexWrap: "wrap",
          alignItems: "flex-start",
          minHeight: 0,
          overflow: "auto",
        }}
      >
        {/* Left side: score + actions */}
        <div
          style={{
            flex: "1 1 300px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#adadad",
              letterSpacing: "0.05em",
            }}
          >
            {isBlitz ? "Time's Up" : "Game Over"}
            {" \u00B7 "}
            {results.rounds.length} round{results.rounds.length !== 1 ? "s" : ""}
          </motion.div>

          {/* Massive score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
          >
            <div
              style={{
                fontSize: "clamp(3rem, 8vw, 6rem)",
                fontWeight: 900,
                color: scoreColor,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                textShadow: `0 0 80px ${scoreColor}30`,
              }}
            >
              <NumberSlide value={`${avgScore}%`} />
            </div>
            <div
              style={{
                fontSize: "clamp(1rem, 2vw, 1.5rem)",
                fontWeight: 600,
                color: "#adadad",
                marginTop: 8,
                letterSpacing: "-0.01em",
              }}
            >
              {rankText}
            </div>
          </motion.div>

          {/* Blitz stats */}
          {isBlitz && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              style={{
                display: "flex",
                gap: 32,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#ffffff",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {Math.max(...results.rounds.map((r) => r.score ?? 0))}%
                </div>
                <div style={{ fontSize: 12, color: "#adadad", marginTop: 2 }}>
                  best round
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#ffffff",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {results.rounds.length > 0
                    ? (
                        results.rounds.reduce((s, r) => s + (r.timeMs ?? 0), 0) /
                        results.rounds.length /
                        1000
                      ).toFixed(1)
                    : 0}
                  s
                </div>
                <div style={{ fontSize: 12, color: "#adadad", marginTop: 2 }}>
                  avg time
                </div>
              </div>
            </motion.div>
          )}

          {/* Score submitter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <ScoreSubmitter results={results} />
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ display: "flex", gap: 24, marginTop: 8 }}
          >
            <button
              onClick={onPlayAgain}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 600,
                color: "#ffffff",
                padding: 0,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              Play Again
            </button>
            <button
              onClick={handleShare}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 600,
                color: "#adadad",
                padding: 0,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              Share
            </button>
          </motion.div>
        </div>

        {/* Right side: round results */}
        <div
          style={{
            flex: "1 1 280px",
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {rounds.map((round, i) => {
            const roundScore = round.score ?? 0;
            const rColor = getScoreColor(roundScore);

            return (
              <FoldReveal key={i} delay={0.4 + i * 0.08}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "14px 0",
                    borderBottom: i < rounds.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  }}
                >
                  {/* Round number */}
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: "monospace",
                      color: "rgba(255,255,255,0.3)",
                      width: 20,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>

                  {/* Color circles */}
                  {isGradient && "targetStart" in round ? (
                    <div
                      style={{
                        width: 48,
                        height: 24,
                        borderRadius: 6,
                        background: `linear-gradient(to right, ${hsbToHex((round as any).targetStart)}, ${hsbToHex((round as any).targetEnd)})`,
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          backgroundColor: hsbToHex((round as any).target),
                        }}
                      />
                      {"guess" in round && (round as any).guess && (
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            backgroundColor: hsbToHex((round as any).guess),
                          }}
                        />
                      )}
                    </div>
                  )}

                  {/* Score */}
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: 15,
                      fontWeight: 800,
                      color: rColor,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {roundScore}%
                  </span>
                </div>
              </FoldReveal>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
