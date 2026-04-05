"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ObsidianText } from "@/components/design-system/ObsidianText";
import { RainbowRing } from "@/components/design-system/RainbowRing";
import { AuthButton } from "@/components/auth/AuthButton";
import { playSound } from "@/lib/sounds";

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
  { id: "classic", label: "Classic", href: "/play/classic?difficulty=easy", hasSubmodes: true },
  { id: "daily", label: "Daily", href: "/play/daily", hasSubmodes: false },
  { id: "blitz", label: "Blitz", href: "/play/blitz", hasSubmodes: false },
  { id: "gradient", label: "Gradient", href: "/play/gradient", hasSubmodes: false },
];

function PlayIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="white"
      style={{ marginLeft: 2 }}
    >
      <polygon points="6,3 20,12 6,21" />
    </svg>
  );
}

function MuteToggle() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("cc-muted");
    if (stored === "true") setMuted(true);
  }, []);

  const toggle = () => {
    setMuted((prev) => {
      localStorage.setItem("cc-muted", String(!prev));
      return !prev;
    });
  };

  return (
    <button
      onClick={toggle}
      className="text-[#adadad] hover:text-white transition-colors duration-200"
      aria-label={muted ? "Unmute" : "Mute"}
    >
      {muted ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
    </button>
  );
}

function ClassicSubMenu({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [warningIdx, setWarningIdx] = useState(0);
  const [showExpertWarning, setShowExpertWarning] = useState(false);

  const handleExpertClick = () => {
    playSound("click");
    setShowExpertWarning(true);
    setWarningIdx((prev) => (prev + 1) % EXPERT_WARNINGS.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full mt-4 flex flex-col items-center gap-2"
    >
      <Link
        href="/play/classic?difficulty=easy"
        onClick={() => { playSound("click"); onClose(); }}
        className="text-xs font-bold text-white hover:text-[#adadad] transition-colors px-5 py-2 border border-white/20 rounded-full hover:border-white/50"
      >
        Easy
      </Link>
      <button
        onClick={handleExpertClick}
        className="text-xs font-bold text-white hover:text-[#adadad] transition-colors px-5 py-2 border border-white/20 rounded-full hover:border-white/50"
      >
        Expert
      </button>

      {/* Expert warning popup */}
      <AnimatePresence>
        {showExpertWarning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-64 p-4 bg-[#1a1a1a] border border-white/10 rounded-xl z-50"
          >
            <p className="text-sm font-semibold text-white mb-1">Expert Mode</p>
            <p className="text-xs text-[#adadad] mb-4 leading-relaxed italic">
              &ldquo;{EXPERT_WARNINGS[warningIdx]}&rdquo;
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  playSound("click");
                  router.push("/play/classic?difficulty=expert");
                  onClose();
                }}
                className="text-xs font-bold text-white px-3 py-1.5 border border-white/30 rounded-full hover:border-white/60 transition-colors"
              >
                Bring it on
              </button>
              <button
                onClick={() => {
                  playSound("click");
                  setShowExpertWarning(false);
                }}
                className="text-xs text-[#666] hover:text-[#adadad] transition-colors px-3 py-1.5"
              >
                Maybe not
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function HomePage() {
  const [classicOpen, setClassicOpen] = useState(false);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-8 select-none">
      {/* Top nav bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        <Link
          href="/leaderboard"
          className="text-sm font-black text-[#adadad] hover:text-white transition-colors duration-200 tracking-widest uppercase"
          style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
        >
          Leaderboard
        </Link>
        <AuthButton />
      </div>

      {/* Title */}
      <div className="flex flex-col items-center" style={{ gap: 0 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <ObsidianText aberration className="block leading-none font-[900] tracking-tighter text-white cursor-default">
            <span
              style={{
                fontSize: "clamp(4rem, 12vw, 10rem)",
                fontWeight: 900,
                display: "block",
                lineHeight: 0.9,
              }}
            >
              color
            </span>
          </ObsidianText>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="block leading-none font-[900] tracking-tighter text-[#adadad] cursor-default"
            style={{
              fontSize: "clamp(4rem, 12vw, 10rem)",
              lineHeight: 0.9,
            }}
          >
            cram
          </span>
        </motion.div>
      </div>

      {/* Subtitle */}
      <motion.p
        className="text-[#adadad] text-center mt-6"
        style={{ fontSize: 18 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        Memorize a color. Recreate it from memory.
      </motion.p>

      {/* Mode buttons */}
      <motion.div
        className="flex items-start gap-6 sm:gap-12 flex-wrap justify-center"
        style={{ marginTop: 60 }}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } },
        }}
      >
        {modes.map((mode) => {
          const isClassic = mode.id === "classic";
          return (
            <motion.div
              key={mode.id}
              className="flex flex-col items-center relative"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {isClassic ? (
                <button onClick={() => { playSound("click"); setClassicOpen((prev) => !prev); }}
                  onMouseEnter={() => playSound("hover")}>
                  <RainbowRing size={72}>
                    <PlayIcon />
                  </RainbowRing>
                </button>
              ) : (
                <Link href={mode.href} onClick={() => playSound("click")}
                  onMouseEnter={() => playSound("hover")}>
                  <RainbowRing size={72}>
                    <PlayIcon />
                  </RainbowRing>
                </Link>
              )}
              <span className="text-sm font-bold text-white mt-3 tracking-wide">
                {mode.label}
              </span>

              {/* Classic sub-options */}
              {isClassic && (
                <AnimatePresence>
                  {classicOpen && (
                    <ClassicSubMenu onClose={() => setClassicOpen(false)} />
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Version — bottom left */}
      <div className="fixed bottom-4 left-5 z-50">
        <span className="text-[10px] text-[#666]">v0.5.0</span>
      </div>

      {/* Mute — bottom right */}
      <div className="fixed bottom-4 right-5 z-50">
        <MuteToggle />
      </div>
    </div>
  );
}
