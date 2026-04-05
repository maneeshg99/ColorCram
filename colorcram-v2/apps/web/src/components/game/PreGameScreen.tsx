"use client";

import { motion } from "framer-motion";
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

interface PreGameScreenProps {
  mode: GameMode;
  difficulty?: string;
  onStart: () => void;
}

export function PreGameScreen({ mode, onStart }: PreGameScreenProps) {
  const info = MODE_INFO[mode] ?? MODE_INFO.classic;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 select-none">
      {/* Back link */}
      <motion.div
        className="fixed top-4 left-5 z-50"
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

      {/* Start button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 25 }}
        onClick={() => {
          playSound("click");
          onStart();
        }}
        onMouseEnter={() => playSound("hover")}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <RainbowRing size={88} spinning>
          <span className="text-lg font-[800] text-white tracking-widest">GO</span>
        </RainbowRing>
      </motion.button>
    </div>
  );
}
