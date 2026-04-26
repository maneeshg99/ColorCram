"use client";

import { useCallback, useState } from "react";
import { motion } from "motion/react";
import type { GameResults, GameMode, Difficulty } from "@colorcram-v2/types";
import { hsbToHex } from "@colorcram-v2/color-utils";
import { NumberSlide } from "@/components/design-system/NumberSlide";
import { FoldReveal } from "@/components/design-system/FoldReveal";
import { ScoreSubmitter } from "./ScoreSubmitter";
import { Button } from "@/components/ui/Button";

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
  if (score >= 90) return "var(--score-perfect)";
  if (score >= 70) return "var(--score-great)";
  if (score >= 40) return "var(--score-good)";
  return "var(--score-poor)";
}

// Resolve CSS var to usable rgba for textShadow glow
function getScoreGlowHex(score: number): string {
  if (score >= 90) return "#38d97a";
  if (score >= 70) return "#f5c64b";
  if (score >= 40) return "#ff8c42";
  return "#ff5a5a";
}

export function SummaryScreen({
  results,
  mode,
  onPlayAgain,
  onShare,
}: SummaryScreenProps) {
  const avgScore =
    results.rounds.length > 0
      ? Math.round(results.totalScore / results.rounds.length)
      : 0;
  const scoreColor = getScoreColor(avgScore);
  const scoreGlow = getScoreGlowHex(avgScore);
  const rankText = getRankText(avgScore);
  const isGradient = mode === "gradient";
  const isBlitz = mode === "blitz";

  const [shareStatus, setShareStatus] = useState<"idle" | "sharing" | "copied">("idle");

  const handleShare = useCallback(async () => {
    await navigator.clipboard.writeText("https://colorcram.app").catch(() => {});
    setShareStatus("copied");
    setTimeout(() => setShareStatus("idle"), 2500);
    onShare?.();
  }, [onShare]);

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
        backgroundColor: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        padding: "clamp(20px, 4vw, 48px)",
        overflow: "hidden",
      }}
    >
      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: "clamp(8px, 2vw, 16px)",
        }}
      >
        <span
          style={{
            height: 2,
            width: 24,
            background: "var(--rainbow)",
            borderRadius: 999,
          }}
        />
        <span className="cc-eyebrow">
          {isBlitz ? "Time's up" : "Game over"}
        </span>
        <span
          style={{
            width: 1,
            height: 10,
            background: "var(--border-strong)",
          }}
        />
        <span
          className="cc-mono cc-tnum"
          style={{ fontSize: 11, color: "var(--fg-faint)" }}
        >
          {results.rounds.length} round{results.rounds.length !== 1 ? "s" : ""}
        </span>
      </motion.div>

      {/* Main layout */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "minmax(260px, 1fr) minmax(260px, 1fr)",
          gap: "clamp(24px, 4vw, 56px)",
          alignItems: "start",
          minHeight: 0,
          overflow: "auto",
        }}
      >
        {/* Left — score + actions */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {/* Massive score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 280, damping: 24 }}
          >
            <div
              className="cc-display cc-tnum"
              style={{
                fontSize: "clamp(4rem, 11vw, 8rem)",
                color: scoreColor,
                lineHeight: 0.95,
                textShadow: `0 0 90px ${scoreGlow}40`,
              }}
            >
              <NumberSlide value={`${avgScore}%`} />
            </div>
            <div
              style={{
                fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
                fontWeight: 600,
                color: "var(--fg)",
                marginTop: 10,
                letterSpacing: "-0.015em",
              }}
            >
              {rankText}
            </div>
          </motion.div>

          {/* Blitz stats */}
          {isBlitz && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              style={{
                display: "flex",
                gap: 40,
                paddingTop: 4,
              }}
            >
              <StatBlock
                label="Best round"
                value={`${Math.max(...results.rounds.map((r) => r.score ?? 0))}%`}
              />
              <StatBlock
                label="Avg time"
                value={`${
                  results.rounds.length > 0
                    ? (
                        results.rounds.reduce((s, r) => s + (r.timeMs ?? 0), 0) /
                        results.rounds.length /
                        1000
                      ).toFixed(1)
                    : 0
                }s`}
              />
            </motion.div>
          )}

          {/* Score submitter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            <ScoreSubmitter results={results} />
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}
          >
            <Button variant="primary" size="md" onClick={onPlayAgain}>
              Play again
            </Button>
            <Button
              variant={shareStatus === "copied" ? "secondary" : "secondary"}
              size="md"
              onClick={handleShare}
              style={
                shareStatus === "copied"
                  ? {
                      color: "var(--score-perfect)",
                      borderColor: "rgba(56, 217, 122, 0.45)",
                    }
                  : undefined
              }
            >
              {shareStatus === "copied" ? "Link copied" : "Challenge a friend"}
            </Button>
          </motion.div>
        </div>

        {/* Right — round ledger */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto auto 1fr auto",
              gap: 14,
              alignItems: "center",
              paddingBottom: 10,
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span className="cc-eyebrow">#</span>
            <span className="cc-eyebrow">Target</span>
            <span />
            <span className="cc-eyebrow" style={{ textAlign: "right" }}>
              Score
            </span>
          </div>

          {rounds.map((round, i) => {
            const roundScore = round.score ?? 0;
            const rColor = getScoreColor(roundScore);

            return (
              <FoldReveal key={i} delay={0.35 + i * 0.06}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto auto 1fr auto",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 0",
                    borderBottom:
                      i < rounds.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  {/* Index */}
                  <span
                    className="cc-mono cc-tnum"
                    style={{
                      fontSize: 12,
                      color: "var(--fg-faint)",
                      width: 18,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Swatch */}
                  {isGradient && "targetStart" in round ? (
                    <div
                      style={{
                        width: 52,
                        height: 26,
                        borderRadius: 6,
                        background: `linear-gradient(to right, ${hsbToHex(
                          (round as any).targetStart
                        )}, ${hsbToHex((round as any).targetEnd)})`,
                        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          backgroundColor: hsbToHex((round as any).target),
                          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                        }}
                      />
                      {"guess" in round && (round as any).guess && (
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            backgroundColor: hsbToHex((round as any).guess),
                            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                          }}
                        />
                      )}
                    </div>
                  )}

                  <span />

                  {/* Score */}
                  <span
                    className="cc-tnum"
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: rColor,
                      textAlign: "right",
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

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        className="cc-tnum"
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: "var(--fg)",
          letterSpacing: "-0.015em",
        }}
      >
        {value}
      </div>
      <div className="cc-eyebrow" style={{ marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}
