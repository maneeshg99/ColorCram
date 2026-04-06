"use client";

import { motion } from "motion/react";
import { type ReactNode } from "react";

interface FoldRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FoldReveal({ children, delay = 0, className }: FoldRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{
        rotateX: -90,
        opacity: 0,
      }}
      animate={{
        rotateX: 0,
        opacity: 1,
      }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        perspective: "600px",
        transformOrigin: "top center",
      }}
    >
      {children}
    </motion.div>
  );
}
