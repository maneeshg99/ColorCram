"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";

import { RainbowRing } from "@/components/design-system/RainbowRing";
import { playSound } from "@/lib/sounds";

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
    setMuted((prev: boolean) => {
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

const modes = [
  {
    id: "classic",
    label: "Classic",
    href: "/play/classic",
    description: "Memorize. Guess. Repeat.",
  },
  {
    id: "daily",
    label: "Daily",
    href: "/play/daily",
    description: "Same colors. Everyone. Every day.",
  },
  {
    id: "blitz",
    label: "Blitz",
    href: "/play/blitz",
    description: "60 seconds. As many as you can.",
  },
  {
    id: "gradient",
    label: "Gradient",
    href: "/play/gradient",
    description: "Two colors. One smooth blend.",
  },
];

export function HomeContent() {
  return (
    <>
      {/* Main content — centered vertically */}
      <div
        className="flex flex-col items-center justify-center flex-1 w-full"
        style={{ maxWidth: 576, margin: "0 auto", paddingTop: 88, paddingLeft: "clamp(24px, 5vw, 48px)", paddingRight: "clamp(24px, 5vw, 48px)" }}
      >
        {/* Title — centered */}
        <div className="flex flex-col items-center" style={{ gap: 0 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              style={{
                fontSize: "clamp(3.5rem, 10vw, 8rem)",
                fontWeight: 900,
                display: "block",
                lineHeight: 0.9,
                background: "linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff0088)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                cursor: "default",
              }}
            >
              color
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="block leading-none font-[900] tracking-tighter text-[#adadad] cursor-default"
              style={{
                fontSize: "clamp(3.5rem, 10vw, 8rem)",
                lineHeight: 0.9,
              }}
            >
              cram
            </span>
          </motion.div>
        </div>

        {/* Mode list */}
        <motion.div
          className="flex flex-col gap-5 w-full"
          style={{ marginTop: 48 }}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } },
          }}
        >
          {modes.map((mode) => (
            <motion.div
              key={mode.id}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <Link
                href={mode.href}
                onClick={() => playSound("click")}
                onMouseEnter={() => playSound("hover")}
                className="flex items-center gap-5 group"
              >
                <RainbowRing size={56} spinning>
                  <PlayIcon />
                </RainbowRing>
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4">
                  <span className="text-lg font-bold text-white tracking-wide group-hover:text-[#adadad] transition-colors">
                    {mode.label}
                  </span>
                  <span className="text-sm text-[#666] group-hover:text-[#888] transition-colors">
                    {mode.description}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Version — bottom left */}
      <div className="fixed bottom-4 left-5 z-50">
        <span className="text-[10px] text-[#666]">v1.0</span>
      </div>

      {/* Mute — bottom right */}
      <div className="fixed bottom-4 right-5 z-50">
        <MuteToggle />
      </div>
    </>
  );
}
