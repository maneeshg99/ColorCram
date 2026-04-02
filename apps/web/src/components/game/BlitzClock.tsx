"use client";

import { motion } from "framer-motion";

interface BlitzClockProps {
  timeRemainingMs: number;
  totalTimeMs: number;
}

export function BlitzClock({ timeRemainingMs, totalTimeMs }: BlitzClockProps) {
  const progress = timeRemainingMs / totalTimeMs;
  const seconds = Math.floor(timeRemainingMs / 1000);
  const ms = Math.floor((timeRemainingMs % 1000) / 10);
  const isWarning = timeRemainingMs < 10000;
  const isCritical = timeRemainingMs < 5000;

  const color = isCritical
    ? "var(--score-poor)"
    : isWarning
      ? "var(--score-good)"
      : "var(--fg)";

  // SVG ring
  const size = 100;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <motion.div
      className="flex flex-col items-center"
      animate={isCritical ? { scale: [1, 1.04, 1] } : { scale: 1 }}
      transition={
        isCritical
          ? { repeat: Infinity, duration: 0.5, ease: "easeInOut" }
          : { duration: 0.2 }
      }
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--surface-elevated)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.1s linear, stroke 0.3s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-2xl font-[800] tabular-nums leading-none"
            style={{ color }}
          >
            {seconds}
          </span>
          <span
            className="text-xs font-mono tabular-nums opacity-60"
            style={{ color }}
          >
            .{ms.toString().padStart(2, "0")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
