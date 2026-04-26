"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";

import { RainbowRing } from "@/components/design-system/RainbowRing";
import { playSound } from "@/lib/sounds";

function PlayIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
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
      style={{
        width: 34,
        height: 34,
        display: "grid",
        placeItems: "center",
        borderRadius: 999,
        color: "var(--fg-subtle)",
        transition: "color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--fg)";
        e.currentTarget.style.background = "var(--surface)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--fg-subtle)";
        e.currentTarget.style.background = "transparent";
      }}
      aria-label={muted ? "Unmute" : "Mute"}
    >
      {muted ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
    </button>
  );
}

interface Mode {
  id: string;
  label: string;
  href: string;
  description: string;
  meta: string;
}

const modes: Mode[] = [
  {
    id: "classic",
    label: "Classic",
    href: "/play/classic",
    description: "Memorize. Guess. Repeat.",
    meta: "5 rounds",
  },
  {
    id: "daily",
    label: "Daily",
    href: "/play/daily",
    description: "Same colors. Everyone. Every day.",
    meta: "One shot",
  },
  {
    id: "blitz",
    label: "Blitz",
    href: "/play/blitz",
    description: "60 seconds. As many as you can.",
    meta: "Timed",
  },
  {
    id: "gradient",
    label: "Gradient",
    href: "/play/gradient",
    description: "Two colors. One smooth blend.",
    meta: "Start & end",
  },
];

export function HomeContent() {
  return (
    <>
      {/* Ambient radial wash — gently lifts the hero without a harsh gradient */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background:
            "radial-gradient(70% 50% at 50% 30%, rgba(255,255,255,0.04), transparent 60%)",
        }}
      />

      {/* Hero — asymmetric, left-aligned content on wide screens, centered on small */}
      <section
        style={{
          position: "relative",
          zIndex: 2,
          flex: 1,
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          padding: "clamp(96px, 14vh, 140px) clamp(24px, 5vw, 56px) 80px",
          display: "grid",
          gap: "clamp(32px, 6vh, 64px)",
        }}
      >
        {/* Eyebrow + wordmark */}
        <div style={{ display: "grid", gap: 16 }}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <span
              style={{
                height: 2,
                width: 28,
                background: "var(--rainbow)",
                borderRadius: 999,
                display: "inline-block",
              }}
            />
            <span className="cc-eyebrow">A color memory game</span>
          </motion.div>

          <div style={{ position: "relative" }}>
            <motion.h1
              className="cc-display"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: "clamp(3.5rem, 11vw, 9rem)",
                margin: 0,
              }}
            >
              <span className="cc-rainbow-text" style={{ display: "block" }}>
                color
              </span>
              <motion.span
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: "block",
                  color: "var(--fg)",
                }}
              >
                cram
              </motion.span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            style={{
              fontSize: "clamp(1rem, 1.4vw, 1.15rem)",
              color: "var(--fg-muted)",
              maxWidth: "42ch",
              lineHeight: 1.55,
            }}
          >
            Study a color for a few seconds. Recreate it from memory with hue,
            saturation, and brightness. Find out how good your eye really is.
          </motion.p>
        </div>

        {/* Mode list — indexed rows, hairline-separated, no clown gradients */}
        <motion.ul
          role="list"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.07, delayChildren: 0.35 } },
          }}
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            borderTop: "1px solid var(--border)",
          }}
        >
          {modes.map((mode, index) => (
            <motion.li
              key={mode.id}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              style={{
                borderBottom: "1px solid var(--border)",
              }}
            >
              <Link
                href={mode.href}
                onClick={() => playSound("click")}
                onMouseEnter={() => playSound("hover")}
                className="cc-mode-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto auto 1fr auto",
                  alignItems: "center",
                  gap: "clamp(14px, 2vw, 24px)",
                  padding: "clamp(18px, 2.4vw, 26px) 4px",
                  position: "relative",
                  transition: "padding-left var(--duration-normal) var(--ease-out)",
                }}
              >
                {/* Index number (monospace, subtle) */}
                <span
                  className="cc-mono cc-tnum"
                  style={{
                    fontSize: 12,
                    color: "var(--fg-faint)",
                    letterSpacing: "0.05em",
                    width: 20,
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Ring */}
                <RainbowRing size={44}>
                  <PlayIcon size={12} />
                </RainbowRing>

                {/* Label + description */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
                      fontWeight: 800,
                      color: "var(--fg)",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.1,
                    }}
                  >
                    {mode.label}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--fg-subtle)",
                      lineHeight: 1.4,
                    }}
                  >
                    {mode.description}
                  </span>
                </div>

                {/* Meta tag + arrow (hidden on narrow) */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    flexShrink: 0,
                  }}
                >
                  <span
                    className="hidden sm:inline cc-eyebrow"
                    style={{ color: "var(--fg-faint)" }}
                  >
                    {mode.meta}
                  </span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--fg-subtle)"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="cc-mode-arrow"
                    style={{ transition: "transform var(--duration-normal) var(--ease-out), stroke var(--duration-fast) var(--ease-out)" }}
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="13 6 19 12 13 18" />
                  </svg>
                </div>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </section>

      {/* Bottom chrome — version, hairline rainbow, mute */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "12px clamp(20px, 4vw, 48px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 40,
          background:
            "linear-gradient(to top, rgba(15,15,17,0.9), rgba(15,15,17,0))",
          pointerEvents: "none",
        }}
      >
        <span
          className="cc-mono"
          style={{ fontSize: 10, color: "var(--fg-faint)", pointerEvents: "auto" }}
        >
          v1.0
        </span>
        <div style={{ pointerEvents: "auto" }}>
          <MuteToggle />
        </div>
      </div>

      {/* Row hover effect: arrow slides right, indent, eyebrow brightens */}
      <style>{`
        .cc-mode-row:hover { padding-left: 10px; background: linear-gradient(90deg, rgba(255,255,255,0.025), transparent 60%); }
        .cc-mode-row:hover .cc-mode-arrow { transform: translateX(6px); stroke: var(--fg); }
      `}</style>
    </>
  );
}
