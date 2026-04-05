"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { getSupabase } from "@/lib/supabase";
import type { GameResults } from "@colorcram-v2/types";

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
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: 13, color: "#adadad" }}
      >
        Saved to leaderboard
      </motion.div>
    );
  }

  if (status === "submitting") {
    return (
      <div style={{ fontSize: 13, color: "#adadad" }}>
        Saving...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{ fontSize: 12, color: "#ef4444" }}>
        {errorMsg}
      </div>
    );
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 13, color: "#adadad" }}>
          Sign in to save your score
        </span>
        <button
          onClick={() => setShowAuthModal(true)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            color: "#ffffff",
            padding: 0,
            textAlign: "left",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          Sign In
        </button>
      </motion.div>
    );
  }

  return null;
}
