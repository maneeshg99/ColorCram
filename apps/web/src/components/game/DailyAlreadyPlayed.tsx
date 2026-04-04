"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import type { DailyResult } from "@/lib/daily-storage";
import { getTimeUntilNextChallenge } from "@/lib/daily-storage";

interface DailyAlreadyPlayedProps {
  result: DailyResult;
}

function formatCountdown(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function DailyAlreadyPlayed({ result }: DailyAlreadyPlayedProps) {
  const [countdown, setCountdown] = useState(getTimeUntilNextChallenge());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getTimeUntilNextChallenge());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleShare = () => {
    const lines = [
      `ColorCram Daily \u2014 ${result.date}`,
      `Average: ${result.avgScore}% match`,
      "",
      ...result.rounds.map(
        (r, i) =>
          `Round ${i + 1}: ${r.score >= 97 ? "\ud83d\udfe2" : r.score >= 90 ? "\ud83d\udfe1" : r.score >= 70 ? "\ud83d\udfe0" : r.score >= 40 ? "\ud83d\udfe0" : "\ud83d\udd34"} ${r.score}%`
      ),
      "",
      "colorcram.app",
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-8 py-16 px-6 max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="text-center">
        <h1 className="text-[var(--text-heading)] font-[900] tracking-tight mb-1">
          Daily Complete
        </h1>
        <p className="text-[var(--text-caption)] text-[var(--fg-muted)]">
          {formatDate(result.date)}
        </p>
      </div>

      {/* Score */}
      <div className="text-center">
        <div className="text-[var(--text-display)] font-[900] tabular-nums">
          {result.avgScore}%
        </div>
        <div className="text-[var(--text-caption)] text-[var(--fg-muted)] mt-1">
          average match
        </div>
      </div>

      {/* Round scores */}
      <div className="w-full space-y-2">
        {result.rounds.map((round, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface)]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
          >
            <span className="text-xs text-[var(--fg-subtle)] w-5 font-mono">
              {i + 1}
            </span>
            <span className="ml-auto text-sm font-[800] tabular-nums">
              {round.score}%
            </span>
          </motion.div>
        ))}
      </div>

      {/* Next challenge countdown */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="text-xs text-[var(--fg-muted)] uppercase tracking-[0.2em] mb-1">
          Next challenge in
        </div>
        <div className="text-2xl font-[800] font-mono tabular-nums">
          {formatCountdown(countdown)}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        className="flex gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Button onClick={handleShare} variant="secondary" size="sm">
          {copied ? "Copied!" : "Share Score"}
        </Button>
        <Button
          size="sm"
          onClick={() => (window.location.href = "/play/classic?difficulty=easy")}
        >
          Play Classic
        </Button>
      </motion.div>
    </motion.div>
  );
}
