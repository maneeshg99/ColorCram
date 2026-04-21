"use client";

import { motion } from "motion/react";
import { Button } from "./Button";

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center px-8 py-16 gap-3 text-center"
    >
      <h3
        className="font-black tracking-tight"
        style={{ fontSize: "var(--text-title)", color: "var(--fg)" }}
      >
        {title}
      </h3>
      <p
        className="text-sm leading-relaxed max-w-sm"
        style={{ color: "var(--fg-muted)" }}
      >
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-4">
          Try Again
        </Button>
      )}
    </motion.div>
  );
}
