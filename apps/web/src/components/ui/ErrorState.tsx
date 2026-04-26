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
            background: "#ff5a5a",
            borderRadius: 999,
          }}
        />
        <span className="cc-eyebrow" style={{ color: "#ff5a5a" }}>
          Error
        </span>
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
      {onRetry && (
        <div style={{ marginTop: 8 }}>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </motion.div>
  );
}
