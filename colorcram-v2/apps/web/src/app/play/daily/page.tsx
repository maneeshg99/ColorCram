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

  useEffect(() => {
    setAlreadyPlayed(hasPlayedToday());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (alreadyPlayed) return;

    const unsubscribe = useGameStore.subscribe((state) => {
      if (state.state?.phase === "summary" && state.state?.mode === "daily") {
        const results = state.getGameResults();
        if (results) {
          saveDailyResult(results);
        }
      }
    });

    return unsubscribe;
  }, [alreadyPlayed]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[#adadad] text-sm">
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
    <div className="flex items-center justify-center min-h-screen">
      <GameBoard key={today} mode="daily" difficulty="medium" seed={today} />
    </div>
  );
}
