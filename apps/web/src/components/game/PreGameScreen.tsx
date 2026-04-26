"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { RainbowRing } from "@/components/design-system/RainbowRing";
import { Modal, ModalHeader, ModalActions } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { playSound } from "@/lib/sounds";
import type { GameMode } from "@colorcram-v2/types";

const MODE_INFO: Record<
  string,
  { title: string; tagline: string; detail: string; index: string }
> = {
  classic: {
    title: "Classic",
    tagline: "Memorize. Guess. Repeat.",
    detail:
      "Study one color, then recreate it from memory using the HSB picker. Five rounds. Accuracy is everything.",
    index: "01",
  },
  daily: {
    title: "Daily",
    tagline: "Same colors. Everyone. Every day.",
    detail:
      "One attempt per day with five colors shared worldwide. Compare where you land on the leaderboard.",
    index: "02",
  },
  blitz: {
    title: "Blitz",
    tagline: "60 seconds. As many as you can.",
    detail:
      "Colors flash fast and you guess faster. Race the clock. Every round counts toward your total.",
    index: "03",
  },
  gradient: {
    title: "Gradient",
    tagline: "Two colors. One smooth blend.",
    detail:
      "Memorize a gradient, then recreate both the start and end color. Twice the challenge.",
    index: "04",
  },
};

const EXPERT_WARNINGS = [
  "Your confidence is inspiring. Your accuracy? We'll see.",
  "Bold move. Hope your cones are warmed up.",
  "Expert mode doesn't grade on a curve.",
  "5 rounds. 2 seconds each. No mercy.",
  "The colors don't get easier. The timer gets shorter.",
  "Most people regret this.",
  "The leaderboard remembers everything.",
  "Statistically, you will be humbled.",
];

function PlayIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" style={{ marginLeft: 2 }}>
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
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        padding: "clamp(16px, 3vw, 28px) clamp(20px, 4vw, 48px)",
        userSelect: "none",
      }}
    >
      {/* Top bar — back link on the left, mode index on the right */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          onClick={() => playSound("click")}
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--fg-subtle)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            transition: "color var(--duration-fast) var(--ease-out)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--fg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--fg-subtle)";
          }}
        >
          <span aria-hidden="true">&larr;</span>
          <span>Home</span>
        </Link>

        <span className="cc-eyebrow cc-mono" style={{ color: "var(--fg-faint)" }}>
          Mode {info.index}
        </span>
      </div>

      {/* Hero — editorial, left-anchored, with a right-side detail on wide screens */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
        }}
        style={{
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: "clamp(32px, 6vh, 56px)",
          alignContent: "center",
          padding: "24px 0",
        }}
      >
        {/* Title block */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "grid",
            gap: 18,
            maxWidth: 820,
          }}
        >
          {/* Rainbow rule + eyebrow */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                height: 2,
                width: 28,
                background: "var(--rainbow)",
                borderRadius: 999,
              }}
            />
            <span className="cc-eyebrow">Ready?</span>
          </div>

          {/* Title */}
          <h1
            className="cc-display"
            style={{
              fontSize: "clamp(3rem, 9vw, 6.5rem)",
              margin: 0,
              color: "var(--fg)",
            }}
          >
            {info.title}
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontSize: "clamp(1.05rem, 1.8vw, 1.35rem)",
              fontWeight: 500,
              color: "var(--fg-muted)",
              maxWidth: "38ch",
              lineHeight: 1.4,
            }}
          >
            {info.tagline}
          </p>

          {/* Detail */}
          <p
            style={{
              fontSize: 14,
              color: "var(--fg-subtle)",
              maxWidth: "52ch",
              lineHeight: 1.65,
            }}
          >
            {info.detail}
          </p>
        </motion.div>

        {/* Start controls */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(16px, 3vw, 36px)",
            paddingTop: 8,
            borderTop: "1px solid var(--border)",
            flexWrap: "wrap",
          }}
        >
          {isClassic ? (
            <>
              <DifficultyButton
                label="Easy"
                hint="5 seconds to memorize"
                onClick={() => {
                  playSound("click");
                  onStart("easy");
                }}
              />
              <DifficultyButton
                label="Expert"
                hint="2 seconds. No mercy."
                onClick={handleExpertClick}
              />
            </>
          ) : (
            <DifficultyButton
              label="Start"
              hint="Let's see what you've got"
              big
              onClick={() => {
                playSound("click");
                onStart();
              }}
            />
          )}
        </motion.div>
      </motion.section>

      {/* Footer hairline */}
      <div
        style={{
          paddingTop: 20,
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 11,
          color: "var(--fg-faint)",
        }}
      >
        <span className="cc-eyebrow">ColorCram</span>
        <span className="cc-mono">v1.0</span>
      </div>

      {/* Expert warning modal */}
      <Modal
        open={showExpertWarning}
        onClose={() => {
          playSound("click");
          setShowExpertWarning(false);
        }}
        labelledBy="expert-warning-title"
      >
        <ModalHeader
          id="expert-warning-title"
          title="Expert mode"
          description={
            <span style={{ fontStyle: "italic" }}>
              &ldquo;{EXPERT_WARNINGS[warningIdx]}&rdquo;
            </span>
          }
        />
        <ModalActions>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              playSound("click");
              setShowExpertWarning(false);
            }}
          >
            Maybe not
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              playSound("click");
              onStart("expert");
            }}
          >
            Bring it on
          </Button>
        </ModalActions>
      </Modal>
    </div>
  );
}

interface DifficultyButtonProps {
  label: string;
  hint: string;
  onClick: () => void;
  big?: boolean;
}

function DifficultyButton({ label, hint, onClick, big }: DifficultyButtonProps) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => playSound("hover")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 16,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "8px 0",
      }}
    >
      <RainbowRing size={big ? 84 : 64}>
        <PlayIcon size={big ? 16 : 14} />
      </RainbowRing>
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          lineHeight: 1.2,
        }}
      >
        <span
          style={{
            fontSize: big ? 22 : 18,
            fontWeight: 800,
            color: "var(--fg)",
            letterSpacing: "-0.02em",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "var(--fg-subtle)",
            marginTop: 2,
          }}
        >
          {hint}
        </span>
      </span>
    </button>
  );
}
