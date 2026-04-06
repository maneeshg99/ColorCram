"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

interface ScoreDisplayProps {
  score: number;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "#22c55e";
  if (score >= 70) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
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
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
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
        style={{
          fontWeight: 900,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
          fontSize: "clamp(3rem, 8vw, 6rem)",
          color,
          textShadow: `0 0 60px ${color}40`,
        }}
      >
        0%
      </motion.span>
      <span style={{ fontSize: 12, color: "#adadad", marginTop: 4 }}>
        match
      </span>
    </motion.div>
  );
}
