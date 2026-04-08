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
        display: "inline-block",
        width: char === "%" ? "0.75em" : char === "." ? "0.35em" : "0.6em",
        height: "1.15em",
        overflow: "hidden",
        position: "relative",
        textAlign: "center",
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            inset: 0,
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
        alignItems: "center",
        fontVariantNumeric: "tabular-nums",
      }}
      aria-label={value}
    >
      {chars.map((char, i) => (
        <SlideChar key={i} char={char} index={i} />
      ))}
    </span>
  );
}
