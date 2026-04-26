"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("App error:", error);
    }
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "48px 24px",
        position: "relative",
        zIndex: 2,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "grid",
          gap: 16,
          justifyItems: "start",
          maxWidth: 520,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              height: 2,
              width: 24,
              background: "var(--rainbow)",
              borderRadius: 999,
            }}
          />
          <span className="cc-eyebrow">Error</span>
        </div>
        <h1 className="cc-display" style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", margin: 0 }}>
          Something broke
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "var(--fg-muted)",
            maxWidth: "48ch",
            lineHeight: 1.55,
          }}
        >
          An unexpected error occurred. Try refreshing — if it keeps happening,
          reach out at{" "}
          <a
            href="mailto:support@colorcram.app"
            style={{
              color: "var(--fg)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            support@colorcram.app
          </a>
          .
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
          <Link href="/">
            <Button variant="secondary">Back home</Button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
