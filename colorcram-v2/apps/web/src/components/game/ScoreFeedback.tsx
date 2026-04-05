"use client";

import { motion } from "framer-motion";

const FEEDBACK_POOLS: Record<string, string[]> = {
  perfect: [
    "Are you even human?",
    "Pixel-perfect. Literally.",
    "The color gods bow to you.",
    "Your cones are immaculate.",
  ],
  great: [
    "Almost creepy how close that is.",
    "Your cones are firing on all cylinders.",
    "Impressively dialed.",
    "Did you just... see that?",
  ],
  good: [
    "Not bad. Monitor calibrated?",
    "Getting warmer...",
    "Solid read on that one.",
    "You've got the eye.",
  ],
  fair: [
    "Points for confidence.",
    "That's... a color, alright.",
    "Close-ish.",
    "The vibes are there at least.",
  ],
  poor: [
    "Were your eyes open?",
    "Bold strategy, going for the opposite.",
    "That's a creative interpretation.",
    "The color wheel weeps.",
  ],
};

function getTier(score: number): string {
  if (score >= 97) return "perfect";
  if (score >= 90) return "great";
  if (score >= 70) return "good";
  if (score >= 40) return "fair";
  return "poor";
}

interface ScoreFeedbackProps {
  score: number;
  roundIndex: number;
}

export function ScoreFeedback({ score, roundIndex }: ScoreFeedbackProps) {
  const tier = getTier(score);
  const pool = FEEDBACK_POOLS[tier];
  const message = pool[roundIndex % pool.length];

  return (
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4, ease: "easeOut" }}
      style={{
        fontSize: 14,
        fontStyle: "italic",
        color: "#adadad",
        textAlign: "center",
        maxWidth: 300,
      }}
    >
      {message}
    </motion.p>
  );
}
