"use client";

import { motion } from "motion/react";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
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
      {action && (
        <Button variant="primary" size="sm" onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
