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
  { id: "classic", label: "Classic" },
  { id: "daily", label: "Daily" },
  { id: "blitz", label: "Blitz" },
  { id: "gradient", label: "Gradient" },
];

const RANK_COLORS: Record<number, string> = {
  1: "#e9c767",
  2: "#b8b8c0",
  3: "#c07c4a",
};

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [selectedMode, setSelectedMode] = useState<GameMode>("classic");
  const [entries, setEntries] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

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
    <main
      style={{
        minHeight: "100dvh",
        maxWidth: 680,
        margin: "0 auto",
        padding: "0 clamp(20px, 5vw, 48px) 80px",
        position: "relative",
        zIndex: 2,
      }}
    >
      {/* Nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 0 16px",
          borderBottom: "1px solid var(--border)",
          marginBottom: 36,
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--fg-subtle)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            transition: "color var(--duration-fast) var(--ease-out)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--fg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--fg-subtle)";
          }}
        >
          <span aria-hidden="true">&larr;</span>
          <span>Home</span>
        </Link>

        <Link
          href="/"
          aria-label="ColorCram home"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: "-0.02em",
          }}
        >
          <span className="cc-rainbow-text">color</span>
          <span style={{ color: "var(--fg)" }}>cram</span>
        </Link>
      </div>

      {/* Title block */}
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "grid",
          gap: 14,
          marginBottom: 32,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              height: 2,
              width: 24,
              background: "var(--rainbow)",
              borderRadius: 999,
            }}
          />
          <span className="cc-eyebrow">Top scores</span>
        </div>
        <h1
          className="cc-display"
          style={{
            fontSize: "clamp(2.5rem, 7vw, 4.25rem)",
          }}
        >
          Leaderboard
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--fg-subtle)",
            maxWidth: "42ch",
          }}
        >
          The ten highest average scores across each mode. Sign in and play to
          land on the board.
        </p>
      </motion.header>

      {/* Mode tabs — pill group */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.4 }}
        role="tablist"
        style={{
          display: "inline-flex",
          padding: 3,
          gap: 2,
          borderRadius: 999,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          marginBottom: 28,
          overflowX: "auto",
          maxWidth: "100%",
        }}
      >
        {TABS.map((tab) => {
          const active = selectedMode === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedMode(tab.id)}
              style={{
                background: active ? "var(--surface-overlay)" : "transparent",
                color: active ? "var(--fg)" : "var(--fg-muted)",
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                padding: "7px 16px",
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition:
                  "background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* List header */}
      {!loading && !fetchError && entries.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "32px 1fr auto",
            gap: 14,
            padding: "0 12px 10px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span className="cc-eyebrow">#</span>
          <span className="cc-eyebrow">Player</span>
          <span className="cc-eyebrow" style={{ textAlign: "right" }}>
            Avg
          </span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="cc-pulse"
              style={{
                height: 46,
                borderRadius: 10,
                background: "var(--surface)",
                opacity: 0.6 - i * 0.05,
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
          message={`Be the first to post a score on ${selectedMode} mode.`}
        />
      ) : (
        <motion.ol
          key={selectedMode}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.03 } },
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          {entries.map((entry) => {
            const isCurrentUser = user?.id === entry.user_id;
            const rankColor = RANK_COLORS[entry.rank];
            const isTop3 = entry.rank <= 3;
            const isFirst = entry.rank === 1;

            return (
              <motion.li
                key={entry.user_id}
                variants={{
                  hidden: { opacity: 0, x: -12 },
                  visible: { opacity: 1, x: 0 },
                }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "32px 1fr auto",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 12px",
                  background: isCurrentUser
                    ? "rgba(255,255,255,0.04)"
                    : "transparent",
                  borderBottom: "1px solid var(--border)",
                  transition: "background var(--duration-fast) var(--ease-out)",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!isCurrentUser) {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(255,255,255,0.025)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCurrentUser) {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                  }
                }}
              >
                {/* First-place rainbow accent bar */}
                {isFirst && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 10,
                      bottom: 10,
                      width: 3,
                      borderRadius: 999,
                      background: "var(--rainbow)",
                    }}
                  />
                )}

                {/* Rank */}
                <span
                  className="cc-mono cc-tnum"
                  style={{
                    fontSize: isTop3 ? 16 : 13,
                    fontWeight: isTop3 ? 800 : 500,
                    color: rankColor || "var(--fg-faint)",
                    textAlign: "right",
                  }}
                >
                  {entry.rank}
                </span>

                {/* Username */}
                <div style={{ minWidth: 0, display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 14.5,
                      fontWeight: isCurrentUser ? 700 : isTop3 ? 600 : 500,
                      color: isTop3 ? "var(--fg)" : "var(--fg-muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {entry.username}
                  </span>
                  {isCurrentUser && (
                    <span
                      className="cc-eyebrow"
                      style={{
                        color: "var(--fg-subtle)",
                        fontSize: 10,
                      }}
                    >
                      you
                    </span>
                  )}
                </div>

                {/* Score */}
                <span
                  className="cc-tnum"
                  style={{
                    fontSize: isTop3 ? 16 : 14,
                    fontWeight: 800,
                    color: rankColor || "var(--fg)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {Math.round(entry.best_avg_score)}%
                </span>
              </motion.li>
            );
          })}
        </motion.ol>
      )}
    </main>
  );
}
