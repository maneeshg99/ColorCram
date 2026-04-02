"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import {
  fetchLeaderboard,
  type LeaderboardRow,
} from "@/lib/leaderboard";
import type { GameMode } from "@colorguesser/types";

const MODES: { id: GameMode; label: string }[] = [
  { id: "classic", label: "Classic" },
  { id: "daily", label: "Daily" },
  { id: "blitz", label: "Blitz" },
  { id: "gradient", label: "Gradient" },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [selectedMode, setSelectedMode] = useState<GameMode>("classic");
  const [entries, setEntries] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard(selectedMode).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [selectedMode]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <motion.h1
        className="font-[900] tracking-tight mb-8"
        style={{ fontSize: "var(--text-heading)" }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Leaderboard
      </motion.h1>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-8">
        {MODES.map((mode) => (
          <Button
            key={mode.id}
            variant={selectedMode === mode.id ? "primary" : "secondary"}
            size="sm"
            onClick={() => setSelectedMode(mode.id)}
          >
            {mode.label}
          </Button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-[var(--surface)] animate-pulse"
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <motion.div
          className="text-center py-16 text-[var(--fg-muted)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-lg font-medium mb-2">No scores yet</p>
          <p className="text-sm">Be the first to play {selectedMode} mode!</p>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-2"
          key={selectedMode}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.04 },
            },
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-2 text-xs text-[var(--fg-muted)] uppercase tracking-wider">
            <span className="w-8">#</span>
            <span className="flex-1">Player</span>
            <span className="w-20 text-right">Best</span>
            <span className="w-16 text-right hidden sm:block">Games</span>
          </div>

          {entries.map((entry) => {
            const isCurrentUser = user?.id === entry.user_id;
            return (
              <motion.div
                key={entry.user_id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                  isCurrentUser
                    ? "bg-[var(--accent)]/10 border border-[var(--accent)]/30"
                    : "bg-[var(--surface)]"
                }`}
                variants={{
                  hidden: { opacity: 0, x: -16 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <span
                  className={`w-8 text-sm font-mono tabular-nums ${
                    entry.rank <= 3
                      ? "font-[800]"
                      : "text-[var(--fg-muted)]"
                  }`}
                >
                  {entry.rank <= 3
                    ? ["🥇", "🥈", "🥉"][entry.rank - 1]
                    : entry.rank}
                </span>
                <span
                  className={`flex-1 text-sm font-medium truncate ${
                    isCurrentUser ? "font-[700]" : ""
                  }`}
                >
                  {entry.username}
                  {isCurrentUser && (
                    <span className="text-xs text-[var(--fg-muted)] ml-1.5">
                      (you)
                    </span>
                  )}
                </span>
                <span className="w-20 text-right text-sm font-[800] tabular-nums">
                  {Math.round(entry.best_avg_score)}%
                </span>
                <span className="w-16 text-right text-xs text-[var(--fg-muted)] tabular-nums hidden sm:block">
                  {entry.games_played}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
