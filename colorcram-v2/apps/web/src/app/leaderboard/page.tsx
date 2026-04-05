"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import {
  fetchLeaderboard,
  type LeaderboardRow,
} from "@/lib/leaderboard";
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

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard(selectedMode).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [selectedMode]);

  return (
    <div className="min-h-screen px-6 sm:px-12 py-16 max-w-2xl mx-auto">
      {/* Back */}
      <Link
        href="/"
        className="text-xs text-[#666] hover:text-[#adadad] transition-colors duration-200 inline-block mb-12"
      >
        &larr; back
      </Link>

      {/* Title */}
      <motion.h1
        className="font-[900] tracking-tighter leading-none mb-12"
        style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)" }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        leaderboard
      </motion.h1>

      {/* Mode tabs */}
      <motion.div
        className="flex gap-6 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedMode(tab.id)}
            className={`text-sm font-semibold transition-colors duration-200 pb-1 ${
              selectedMode === tab.id
                ? "text-white"
                : "text-[#adadad] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="h-5 rounded bg-[#1f1f1f] animate-pulse"
              style={{ width: `${70 - i * 4}%` }}
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <motion.div
          className="py-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-[#adadad] text-sm">No scores yet.</p>
          <p className="text-[#666] text-xs mt-1">
            Be the first to play {selectedMode} mode.
          </p>
        </motion.div>
      ) : (
        <motion.div
          key={selectedMode}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.03 } },
          }}
        >
          {entries.map((entry) => {
            const isCurrentUser = user?.id === entry.user_id;
            const rankColor = RANK_COLORS[entry.rank];

            return (
              <motion.div
                key={entry.user_id}
                className="flex items-baseline gap-6 py-3 px-3 -mx-3 rounded-lg transition-colors duration-200 hover:bg-[#1f1f1f]"
                variants={{
                  hidden: { opacity: 0, x: -12 },
                  visible: { opacity: 1, x: 0 },
                }}
              >
                <span
                  className="text-xs font-mono tabular-nums w-6 text-right shrink-0"
                  style={{ color: rankColor || "#666" }}
                >
                  {entry.rank}
                </span>
                <span
                  className={`flex-1 text-sm truncate ${
                    isCurrentUser ? "font-bold" : "font-medium"
                  }`}
                  style={{ color: rankColor || "#ffffff" }}
                >
                  {entry.username}
                  {isCurrentUser && (
                    <span className="text-[#666] text-xs ml-2">you</span>
                  )}
                </span>
                <span
                  className="text-sm font-[800] tabular-nums font-mono"
                  style={{ color: rankColor || "#ffffff" }}
                >
                  {Math.round(entry.best_avg_score)}%
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
