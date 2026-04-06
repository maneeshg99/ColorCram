"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { RainbowRing } from "@/components/design-system/RainbowRing";
import { playSound } from "@/lib/sounds";
import type { GameMode } from "@colorcram-v2/types";

const MODE_INFO: Record<string, { title: string; description: string; detail: string }> = {
  classic: {
    title: "Classic",
    description: "Memorize. Guess. Repeat.",
    detail: "You'll see a color for a few seconds, then recreate it from memory using the HSB picker. 5 rounds — accuracy is everything.",
  },
  daily: {
    title: "Daily Challenge",
    description: "Same colors. Everyone. Every day.",
    detail: "One attempt per day with the same 5 colors worldwide. Compare your score on the leaderboard.",
  },
  blitz: {
    title: "Blitz",
    description: "60 seconds. As many as you can.",
    detail: "Colors flash fast and you guess faster. Race the clock — every round counts toward your total score.",
  },
  gradient: {
    title: "Gradient",
    description: "Two colors. One smooth blend.",
    detail: "Memorize a gradient, then recreate both the start and end colors. Twice the challenge.",
  },
};

const EXPERT_WARNINGS = [
  "Your confidence is inspiring. Your accuracy? We'll see.",
  "Bold move. Hope your cones are warmed up.",
  "Expert mode doesn't grade on a curve. Just saying.",
  "5 rounds. 2 seconds each. No mercy.",
  "You sure? The colors don't get easier, the timer gets shorter.",
  "Most people regret this. Just so you know.",
  "The leaderboard remembers everything.",
  "Statistically, you will be humbled.",
];

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 2 }}>
      <polygon points="6,3 20,12 6,21" />
    </svg>
  );
}

interface PreGameScreenProps {
  mode: GameMode;
  difficulty?: string;
  onStart: (difficulty?: string) => void;
}

export function PreGameScreen({ mode, onStart }: PreGameScreenProps) {
  const info = MODE_INFO[mode] ?? MODE_INFO.classic;
  const isClassic = mode === "classic";
  const [warningIdx, setWarningIdx] = useState(0);
  const [showExpertWarning, setShowExpertWarning] = useState(false);

  const handleExpertClick = () => {
    playSound("click");
    setShowExpertWarning(true);
    setWarningIdx((prev) => (prev + 1) % EXPERT_WARNINGS.length);
  };

  return (
    <div style={{ height: "100dvh", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px", userSelect: "none" }}>
      {/* Back link */}
      <motion.div
        className="fixed top-4 left-8 sm:left-12 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Link
          href="/"
          onClick={() => playSound("click")}
          className="text-sm text-[#666] hover:text-white transition-colors"
        >
          &larr; Back
        </Link>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-4xl sm:text-5xl font-[900] tracking-tighter text-white mb-3"
      >
        {info.title}
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="text-lg text-[#adadad] mb-2"
      >
        {info.description}
      </motion.p>

      {/* Detail */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="text-sm text-[#666] max-w-sm text-center leading-relaxed mb-12"
      >
        {info.detail}
      </motion.p>

      {isClassic ? (
        /* Classic: Easy and Expert buttons side by side */
        <>
        <motion.div
          className="flex flex-col items-center gap-6 relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="flex items-center gap-8">
            <button
              onClick={() => { playSound("click"); onStart("easy"); }}
              onMouseEnter={() => playSound("hover")}
              className="flex flex-col items-center gap-2"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <RainbowRing size={72}>
                <PlayIcon />
              </RainbowRing>
              <span className="text-sm font-bold text-white tracking-wide">Easy</span>
            </button>

            <button
              onClick={handleExpertClick}
              onMouseEnter={() => playSound("hover")}
              className="flex flex-col items-center gap-2"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <RainbowRing size={72}>
                <PlayIcon />
              </RainbowRing>
              <span className="text-sm font-bold text-white tracking-wide">Expert</span>
            </button>
          </div>

        </motion.div>
      {/* Expert warning modal — fullscreen overlay */}
      <AnimatePresence>
        {showExpertWarning && (
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
            onClick={() => { playSound("click"); setShowExpertWarning(false); }}
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
                Expert Mode
              </p>
              <p style={{ fontSize: 13, color: "#888", marginBottom: 24, lineHeight: 1.5, fontStyle: "italic" }}>
                &ldquo;{EXPERT_WARNINGS[warningIdx]}&rdquo;
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button
                  onClick={() => { playSound("click"); onStart("expert"); }}
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
                  Bring it on
                </button>
                <button
                  onClick={() => { playSound("click"); setShowExpertWarning(false); }}
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
                  Maybe not
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      ) : (
        /* Other modes: single GO button */
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 25 }}
          onClick={() => { playSound("click"); onStart(); }}
          onMouseEnter={() => playSound("hover")}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <RainbowRing size={88} spinning>
            <span className="text-lg font-[800] text-white tracking-widest">GO</span>
          </RainbowRing>
        </motion.button>
      )}
    </div>
  );
}
