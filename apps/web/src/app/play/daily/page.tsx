"use client";

import { useState, useEffect } from "react";
import { GameBoard } from "@/components/game/GameBoard";
import { DailyAlreadyPlayed } from "@/components/game/DailyAlreadyPlayed";
import { useGameStore } from "@/hooks/useGame";
import {
  hasPlayedToday,
  getDailyResult,
  saveDailyResult,
} from "@/lib/daily-storage";

export default function DailyPage() {
  const today = new Date().toISOString().split("T")[0];
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check localStorage after mount (avoid SSR mismatch)
  useEffect(() => {
    setAlreadyPlayed(hasPlayedToday());
    setMounted(true);
  }, []);

  // Watch for game completion and save result
  useEffect(() => {
    if (alreadyPlayed) return;

    const unsubscribe = useGameStore.subscribe((state) => {
      if (state.state?.phase === "summary" && state.state?.mode === "daily") {
        const results = state.getGameResults();
        if (results) {
          saveDailyResult(results);
          // Don't setAlreadyPlayed here — let them see the summary naturally
        }
      }
    });

    return unsubscribe;
  }, [alreadyPlayed]);

  if (!mounted) {
    return (
      <div className="flex justify-center py-16 text-[var(--fg-muted)]">
        Loading...
      </div>
    );
  }

  if (alreadyPlayed) {
    const result = getDailyResult();
    if (result) {
      return <DailyAlreadyPlayed result={result} />;
    }
  }

  return (
    <div className="flex flex-col items-center py-8">
      <div className="text-center mb-4">
        <h1 className="text-lg font-[800] tracking-tight">Daily Challenge</h1>
        <p className="text-[var(--text-caption)] text-[var(--fg-muted)]">
          {today}
        </p>
      </div>
      <GameBoard key={today} mode="daily" difficulty="medium" seed={today} />
    </div>
  );
}
