"use client";

import { motion } from "motion/react";
import { NumberSlide } from "@/components/design-system/NumberSlide";

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
    ? "#ef4444"
    : isWarning
      ? "#eab308"
      : "#ffffff";

  const centi = ms.toString().padStart(2, "0");

  // SVG ring
  const size = 90;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <motion.div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      animate={isCritical ? { scale: [1, 1.04, 1] } : { scale: 1 }}
      transition={
        isCritical
          ? { repeat: Infinity, duration: 0.5, ease: "easeInOut" }
          : { duration: 0.2 }
      }
    >
      <div style={{ position: "relative", width: size, height: size }}>
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
            stroke="rgba(255,255,255,0.06)"
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
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="font-mono"
            style={{
              fontSize: 20,
              fontWeight: 800,
              color,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              <NumberSlide value={seconds.toString()} />
              <span style={{ lineHeight: "1.15em" }}>.{centi}</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
