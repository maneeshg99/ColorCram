"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

const EXPERT_WARNINGS = [
  "Your confidence is inspiring. Your accuracy? We'll see.",
  "Bold move. Hope your cones are warmed up.",
  "Expert mode doesn't grade on a curve. Just saying.",
  "5 rounds. 2 seconds each. No mercy.",
  "You sure? The colors don't get easier, the timer gets shorter.",
  "Most people regret this. Just so you know.",
  "The leaderboard remembers everything.",
  "Statistically, you will be humbled.",
];

const modes = [
  {
    id: "classic",
    title: "Classic",
    description:
      "Memorize colors one at a time, then recreate them from memory.",
    hasdifficulty: true,
    ready: true,
  },
  {
    id: "daily",
    title: "Daily Challenge",
    description:
      "Everyone gets the same 5 colors. One attempt per day. Compete globally.",
    hasdifficulty: false,
    ready: true,
  },
  {
    id: "blitz",
    title: "Blitz",
    description: "60 seconds on the clock. How many colors can you nail?",
    hasdifficulty: false,
    ready: true,
  },
  {
    id: "gradient",
    title: "Gradient",
    description: "Memorize a two-color gradient, then recreate both endpoints.",
    hasdifficulty: false,
    ready: true,
  },
];

export default function PlayPage() {
  const router = useRouter();
  const [showExpertConfirm, setShowExpertConfirm] = useState(false);
  const [warningIndex, setWarningIndex] = useState(0);

  const openExpertConfirm = useCallback(() => {
    setWarningIndex((prev) => (prev + 1) % EXPERT_WARNINGS.length);
    setShowExpertConfirm(true);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <motion.h1
        className="font-[900] tracking-tight mb-12"
        style={{ fontSize: "var(--text-heading)" }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        Choose a mode
      </motion.h1>

      <motion.div
        className="space-y-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {modes.map((mode) => (
          <motion.div
            key={mode.id}
            className={`p-6 rounded-xl border border-[var(--border)] transition-colors ${
              mode.ready
                ? "hover:border-[var(--fg-muted)]"
                : "opacity-40 pointer-events-none"
            }`}
            variants={{
              hidden: { opacity: 0, x: -30 },
              visible: { opacity: mode.ready ? 1 : 0.4, x: 0 },
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-[800] tracking-tight">
                    {mode.title}
                  </h2>
                  {!mode.ready && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--fg-muted)]">
                      Coming soon
                    </span>
                  )}
                </div>
                <p className="text-[var(--text-caption)] text-[var(--fg-muted)] mt-1 max-w-sm">
                  {mode.description}
                </p>
              </div>

              {mode.hasdifficulty && mode.ready ? (
                <div className="flex gap-2 shrink-0">
                  <Link href={`/play/${mode.id}?difficulty=easy`}>
                    <Button variant="secondary" size="sm">
                      Easy
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={openExpertConfirm}
                  >
                    Expert
                  </Button>
                </div>
              ) : mode.ready ? (
                <Link href={`/play/${mode.id}`} className="shrink-0">
                  <Button size="sm">Play</Button>
                </Link>
              ) : null}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Expert confirmation popup */}
      <AnimatePresence>
        {showExpertConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0 bg-[var(--bg)]/80 backdrop-blur-sm"
              onClick={() => setShowExpertConfirm(false)}
            />
            <motion.div
              className="relative w-full max-w-sm p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <h3 className="text-lg font-[800] tracking-tight mb-2">
                Expert Mode
              </h3>
              <p className="text-sm text-[var(--fg-muted)] italic mb-6">
                &ldquo;{EXPERT_WARNINGS[warningIndex]}&rdquo;
              </p>
              <div className="flex gap-3">
                <Button
                  size="sm"
                  onClick={() => router.push("/play/classic?difficulty=expert")}
                >
                  Bring it on
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExpertConfirm(false)}
                >
                  Maybe not
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
