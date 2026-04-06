"use client";

import { AnimatePresence, motion } from "motion/react";
import { type ReactNode } from "react";

interface ScreenTransitionProps {
  children: ReactNode;
  phase: string;
}

const transitionVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.65, 0, 0.35, 1] as [number, number, number, number],
    },
  },
};

export function ScreenTransition({ children, phase }: ScreenTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        variants={transitionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ width: "100%", height: "100%" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
