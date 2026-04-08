"use client";

import { AnimatePresence, motion } from "motion/react";

interface NumberSlideProps {
  value: string;
  className?: string;
}

function SlideChar({ char, index }: { char: string; index: number }) {
  return (
    <span
      style={{
        position: "relative",
        width: char === "%" ? "0.75em" : char === "." ? "0.35em" : "0.6em",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={`${index}-${char}`}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function NumberSlide({ value, className }: NumberSlideProps) {
  const chars = value.split("");

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "stretch",
        fontVariantNumeric: "tabular-nums",
        height: "1.15em",
        lineHeight: 1,
        overflow: "hidden",
      }}
      aria-label={value}
    >
      {chars.map((char, i) => (
        <SlideChar key={i} char={char} index={i} />
      ))}
    </span>
  );
}
