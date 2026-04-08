"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
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

  const submitScore = async () => {
    if (!pendingRef.current) return;
    pendingRef.current = false;
    setStatus("submitting");

    const supabase = getSupabase();
    const avgScore =
      results.rounds.length > 0
        ? Math.round(results.totalScore / results.rounds.length)
        : 0;

    // Client-side plausibility checks (server should also enforce these)
    if (
      avgScore < 0 || avgScore > 100 ||
      results.totalScore < 0 ||
      results.totalTimeMs <= 0 ||
      results.rounds.length <= 0 ||
      results.avgDeltaE < 0
    ) {
      setStatus("error");
      setErrorMsg("Invalid score data.");
      pendingRef.current = true;
      return;
    }

    const { error } = await supabase.rpc("submit_score", {
      p_mode: results.mode,
      p_difficulty: results.difficulty,
      p_total_score: results.totalScore,
      p_avg_delta_e: results.avgDeltaE,
      p_rounds_played: results.rounds.length,
      p_avg_score: avgScore,
      p_total_time_ms: results.totalTimeMs,
      p_daily_challenge_id:
        results.mode === "daily"
          ? new Date().toISOString().split("T")[0]
          : null,
    });

    if (error) {
      if (error.code === "23505") {
        setStatus("submitted");
      } else {
        setErrorMsg("Failed to save score. Please try again.");
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
      submitScore();
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
