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
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "48px 0",
        gap: 12,
        maxWidth: 420,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            height: 2,
            width: 18,
            background: "var(--rainbow)",
            borderRadius: 999,
          }}
        />
        <span className="cc-eyebrow">Empty</span>
      </div>
      <h3
        className="cc-headline"
        style={{ fontSize: "var(--text-title)", color: "var(--fg)" }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 14,
          color: "var(--fg-muted)",
          lineHeight: 1.55,
        }}
      >
        {message}
      </p>
      {action && (
        <div style={{ marginTop: 8 }}>
          <Button variant="primary" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
