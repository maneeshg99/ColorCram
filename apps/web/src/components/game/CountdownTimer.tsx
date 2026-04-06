"use client";

import { useEffect, useState, useRef } from "react";
import { NumberSlide } from "@/components/design-system/NumberSlide";

interface CountdownTimerProps {
  durationMs: number;
  onComplete: () => void;
  running: boolean;
  label?: string;
}

export function CountdownTimer({
  durationMs,
  onComplete,
  running,
  label,
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

  const displaySec = Math.floor(remainingMs / 1000);
  const displayCenti = Math.floor((remainingMs % 1000) / 10);
  const timeStr = `${displaySec}.${displayCenti.toString().padStart(2, "0")}`;

  const isWarning = remainingMs < 3000;
  const isCritical = remainingMs < 1000;
  const colorClass = isCritical
    ? "text-red-500"
    : isWarning
      ? "text-yellow-500"
      : "text-white";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div className={`font-mono transition-colors duration-300 ${colorClass}`}
        style={{ fontSize: "clamp(2rem, 6vw, 4rem)", fontWeight: 700 }}
      >
        <NumberSlide value={timeStr} />
      </div>
      {label && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.2em",
            color: "#adadad",
            textTransform: "uppercase" as const,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
