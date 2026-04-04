"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { getSupabase } from "@/lib/supabase";
import type { GameResults } from "@colorcram/types";

interface ScoreSubmitterProps {
  results: GameResults;
}

export function ScoreSubmitter({ results }: ScoreSubmitterProps) {
  const { user, profile, setShowAuthModal } = useAuth();
  const [status, setStatus] = useState<
    "idle" | "submitting" | "submitted" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const pendingRef = useRef(true);

  const submitScore = async (userId: string) => {
    if (!pendingRef.current) return;
    pendingRef.current = false;
    setStatus("submitting");

    const supabase = getSupabase();
    const avgScore =
      results.rounds.length > 0
        ? Math.round(results.totalScore / results.rounds.length)
        : 0;

    const { error } = await supabase.from("game_scores").insert({
      user_id: userId,
      mode: results.mode,
      difficulty: results.difficulty,
      total_score: results.totalScore,
      avg_delta_e: results.avgDeltaE,
      rounds_played: results.rounds.length,
      avg_score: avgScore,
      total_time_ms: results.totalTimeMs,
      daily_challenge_id:
        results.mode === "daily"
          ? new Date().toISOString().split("T")[0]
          : null,
    });

    if (error) {
      // Unique constraint violation = already submitted daily
      if (error.code === "23505") {
        setStatus("submitted");
      } else {
        setErrorMsg(error.message);
        setStatus("error");
        pendingRef.current = true;
      }
    } else {
      setStatus("submitted");
    }
  };

  // Auto-submit when user signs in with pending results
  useEffect(() => {
    if (user && pendingRef.current && status === "idle") {
      submitScore(user.id);
    }
  }, [user]);

  if (status === "submitted") {
    return (
      <motion.div
        className="text-sm text-[var(--fg-muted)] text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Saved to leaderboard
      </motion.div>
    );
  }

  if (status === "submitting") {
    return (
      <div className="text-sm text-[var(--fg-muted)] text-center">
        Saving...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-xs text-[var(--score-poor)] text-center">
        {errorMsg}
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm text-[var(--fg-muted)]">
          Sign in to save your score
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAuthModal(true)}
        >
          Sign In
        </Button>
      </motion.div>
    );
  }

  return null;
}
