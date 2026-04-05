"use client";

import { motion } from "framer-motion";
import { type CSSProperties, type ReactNode } from "react";

type TextSize = "display" | "headline" | "title" | "body" | "label";

interface ObsidianTextProps {
  children: ReactNode;
  size?: TextSize;
  aberration?: boolean;
  className?: string;
}

const sizeMap: Record<TextSize, { fontSize: string; fontWeight: number; letterSpacing: string }> = {
  display: {
    fontSize: "var(--text-display)",
    fontWeight: 700,
    letterSpacing: "-0.03em",
  },
  headline: {
    fontSize: "var(--text-headline)",
    fontWeight: 600,
    letterSpacing: "-0.02em",
  },
  title: {
    fontSize: "var(--text-title)",
    fontWeight: 600,
    letterSpacing: "-0.01em",
  },
  body: {
    fontSize: "var(--text-body)",
    fontWeight: 400,
    letterSpacing: "0",
  },
  label: {
    fontSize: "var(--text-label)",
    fontWeight: 500,
    letterSpacing: "0.02em",
  },
};

function AberrationLayer({
  children,
  color,
  offset,
  hoverOffset,
}: {
  children: ReactNode;
  color: string;
  offset: { x: number; y: number };
  hoverOffset: { x: number; y: number };
}) {
  return (
    <motion.span
      initial={{
        x: offset.x,
        y: offset.y,
      }}
      whileHover={{
        x: hoverOffset.x,
        y: hoverOffset.y,
      }}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        color,
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    >
      {children}
    </motion.span>
  );
}

export function ObsidianText({
  children,
  size = "body",
  aberration = false,
  className,
}: ObsidianTextProps) {
  const styles = sizeMap[size];

  const baseStyle: CSSProperties = {
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    letterSpacing: styles.letterSpacing,
    lineHeight: 1.1,
  };

  if (!aberration) {
    return (
      <span className={className} style={baseStyle}>
        {children}
      </span>
    );
  }

  return (
    <motion.span
      className={className}
      style={{
        ...baseStyle,
        position: "relative",
        display: "inline-block",
      }}
      whileHover="hover"
    >
      <AberrationLayer
        color="#ff0040"
        offset={{ x: -1, y: 0 }}
        hoverOffset={{ x: -2, y: 0 }}
      >
        {children}
      </AberrationLayer>
      <AberrationLayer
        color="#00d4ff"
        offset={{ x: 1, y: 0 }}
        hoverOffset={{ x: 2, y: 0 }}
      >
        {children}
      </AberrationLayer>
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </motion.span>
  );
}
