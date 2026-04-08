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
        width: char === "%" ? "0.75em" : "0.6em",
        height: "1em",
        overflow: "hidden",
        position: "relative",
        textAlign: "center",
        verticalAlign: "bottom",
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={`${index}-${char}`}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            display: "block",
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "1em",
            lineHeight: "1em",
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
        alignItems: "flex-end",
        fontVariantNumeric: "tabular-nums",
        lineHeight: 1,
        height: "1em",
      }}
      aria-label={value}
    >
      {chars.map((char, i) => (
        <SlideChar key={i} char={char} index={i} />
      ))}
    </span>
  );
}
