"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface CountdownTimerProps {
  durationMs: number;
  onComplete: () => void;
  running: boolean;
}

export function CountdownTimer({
  durationMs,
  onComplete,
  running,
}: CountdownTimerProps) {
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setRemainingMs(durationMs);
    completedRef.current = false;
  }, [durationMs]);

  useEffect(() => {
    if (!running) return;
    completedRef.current = false;

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, durationMs - elapsed);
      setRemainingMs(remaining);

      if (remaining <= 0 && !completedRef.current) {
        completedRef.current = true;
        clearInterval(interval);
        onCompleteRef.current();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [durationMs, running]);

  const progress = remainingMs / durationMs;
  const totalSeconds = Math.ceil(durationMs / 1000);
  const isWarning = progress < 0.25;
  const isCritical = progress < 0.12;

  // Current second being depleted (0-indexed from left)
  const elapsedMs = durationMs - remainingMs;
  const currentSegIndex = Math.min(
    totalSeconds - 1,
    Math.floor(elapsedMs / 1000)
  );
  const segProgress = (elapsedMs % 1000) / 1000;

  const barColor = isCritical
    ? "var(--score-poor)"
    : isWarning
      ? "var(--score-good)"
      : "var(--fg)";

  const displaySec = Math.floor(remainingMs / 1000);
  const displayMs = Math.floor((remainingMs % 1000) / 10);

  return (
    <motion.div
      className="flex flex-col items-center gap-4 w-full max-w-[360px]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <div className="flex gap-1 w-full">
        {Array.from({ length: totalSeconds }, (_, i) => {
          const isFullyDepleted = i < currentSegIndex;
          const isDepleting = i === currentSegIndex;
          const isFull = i > currentSegIndex;

          const fillWidth = isFullyDepleted
            ? 0
            : isDepleting
              ? 1 - segProgress
              : 1;

          return (
            <div
              key={i}
              className="h-2 flex-1 rounded-full overflow-hidden flex justify-end"
              style={{ backgroundColor: "var(--surface-elevated)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${fillWidth * 100}%`,
                  backgroundColor: barColor,
                  transition: isFull ? "none" : "width 30ms linear",
                }}
              />
            </div>
          );
        })}
      </div>

      <motion.div
        className="font-mono tabular-nums text-[var(--fg-muted)] flex items-baseline gap-0.5"
        animate={isCritical ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={
          isCritical
            ? { repeat: Infinity, duration: 0.6, ease: "easeInOut" }
            : { duration: 0.2 }
        }
      >
        <span className="font-[700] text-lg" style={{ color: barColor }}>
          {displaySec}
        </span>
        <span className="text-xs opacity-60" style={{ color: barColor }}>
          .{displayMs.toString().padStart(2, "0")}
        </span>
      </motion.div>
    </motion.div>
  );
}
