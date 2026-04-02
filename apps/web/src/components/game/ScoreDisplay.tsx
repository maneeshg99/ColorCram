"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface ScoreDisplayProps {
  score: number;
}

function getScoreColor(score: number): string {
  if (score >= 97) return "var(--score-perfect)";
  if (score >= 90) return "var(--score-great)";
  if (score >= 70) return "var(--score-good)";
  if (score >= 40) return "var(--score-fair)";
  return "var(--score-poor)";
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const displayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(count, score, {
      duration: 0.8,
      ease: "easeOut",
    });
    return () => controls.stop();
  }, [score, count]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => {
      if (displayRef.current) {
        displayRef.current.textContent = `${v}%`;
      }
    });
    return unsubscribe;
  }, [rounded]);

  const color = getScoreColor(score);

  return (
    <motion.div
      className="flex flex-col items-center gap-1"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={
        score < 30
          ? {
              scale: 1,
              opacity: 1,
              x: [0, -8, 8, -6, 6, -3, 3, 0],
            }
          : { scale: 1, opacity: 1 }
      }
      transition={
        score < 30
          ? {
              scale: { type: "spring", stiffness: 400, damping: 20 },
              opacity: { duration: 0.3 },
              x: { duration: 0.5, delay: 0.8, ease: "easeOut" },
            }
          : { type: "spring", stiffness: 400, damping: 20 }
      }
    >
      <motion.span
        ref={displayRef}
        className="font-[900] tabular-nums leading-none"
        style={{
          fontSize: "var(--text-display)",
          color,
          textShadow: `0 0 40px ${color}`,
        }}
      >
        0%
      </motion.span>
      <span className="text-xs text-[var(--fg-muted)] mt-1">match</span>
    </motion.div>
  );
}
