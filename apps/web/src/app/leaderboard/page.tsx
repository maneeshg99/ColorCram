"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useAuth } from "@/lib/auth-context";
import {
  fetchLeaderboard,
  type LeaderboardRow,
} from "@/lib/leaderboard";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import type { GameMode } from "@colorcram-v2/types";

const TABS: { id: GameMode; label: string }[] = [
  { id: "classic", label: "Easy" },
  { id: "daily", label: "Daily" },
  { id: "blitz", label: "Blitz" },
  { id: "gradient", label: "Gradient" },
];

const RANK_COLORS: Record<number, string> = {
  1: "#d4a853",
  2: "#a8a8a8",
  3: "#b87333",
};

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [selectedMode, setSelectedMode] = useState<GameMode>("classic");
  const [entries, setEntries] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const load = useCallback((mode: GameMode) => {
    setLoading(true);
    setFetchError(null);
    fetchLeaderboard(mode).then(({ rows, error }) => {
      setEntries(rows);
      setFetchError(error);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    load(selectedMode);
  }, [selectedMode, load]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        maxWidth: 600,
        margin: "0 auto",
        padding: "0 clamp(24px, 5vw, 48px)",
      }}
    >
      {/* Nav bar — matches home page */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 0",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          marginBottom: 32,
        }}
      >
        <Link
          href="/"
          className="text-sm text-[#888] hover:text-white transition-colors duration-200"
        >
          &larr; Home
        </Link>
      </div>

      {/* Title */}
      <motion.h1
        className="font-[900] tracking-tighter leading-none text-white"
        style={{ fontSize: "clamp(2rem, 7vw, 3.5rem)", marginBottom: 24 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        Leaderboard
      </motion.h1>

      {/* Mode tabs */}
      <motion.div
        style={{ display: "flex", gap: 20, marginBottom: 28 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedMode(tab.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: selectedMode === tab.id ? 700 : 500,
              color: selectedMode === tab.id ? "#fff" : "#888",
              padding: "4px 0",
              borderBottom: selectedMode === tab.id ? "2px solid #fff" : "2px solid transparent",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              style={{
                height: 44,
                borderRadius: 10,
                background: "#1a1a1a",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      ) : fetchError ? (
        <ErrorState
          title="Couldn't load leaderboard"
          message="Check your connection and try again."
          onRetry={() => load(selectedMode)}
        />
      ) : entries.length === 0 ? (
        <EmptyState
          title="No scores yet"
          message={`Be the first to play ${selectedMode} mode.`}
        />
      ) : (
        <motion.div
          key={selectedMode}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.03 } },
          }}
          style={{ display: "flex", flexDirection: "column", gap: 4 }}
        >
          {entries.map((entry) => {
            const isCurrentUser = user?.id === entry.user_id;
            const rankColor = RANK_COLORS[entry.rank];
            const isTop3 = entry.rank <= 3;

            return (
              <motion.div
                key={entry.user_id}
                variants={{
                  hidden: { opacity: 0, x: -12 },
                  visible: { opacity: 1, x: 0 },
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: isCurrentUser
                    ? "rgba(255,255,255,0.04)"
                    : isTop3
                    ? "rgba(255,255,255,0.02)"
                    : "transparent",
                  border: isCurrentUser
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1px solid transparent",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = isCurrentUser ? "rgba(255,255,255,0.04)" : isTop3 ? "rgba(255,255,255,0.02)" : "transparent"; }}
              >
                {/* Rank */}
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: isTop3 ? 16 : 12,
                    fontWeight: isTop3 ? 800 : 500,
                    color: rankColor || "#555",
                    width: 28,
                    textAlign: "right",
                    flexShrink: 0,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {entry.rank}
                </span>

                {/* Username */}
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: isCurrentUser ? 700 : isTop3 ? 600 : 400,
                    color: rankColor || "#ccc",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {entry.username}
                  {isCurrentUser && (
                    <span style={{ color: "#666", fontSize: 11, marginLeft: 8 }}>you</span>
                  )}
                </span>

                {/* Score */}
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 14,
                    fontWeight: 800,
                    color: rankColor || "#fff",
                    fontVariantNumeric: "tabular-nums",
                    flexShrink: 0,
                  }}
                >
                  {Math.round(entry.best_avg_score)}%
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Bottom padding */}
      <div style={{ height: 48 }} />
    </div>
  );
}
