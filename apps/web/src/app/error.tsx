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
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center px-8 gap-4 text-center"
      style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4 max-w-md"
      >
        <h1
          className="font-black tracking-tighter leading-none"
          style={{ fontSize: "clamp(2.5rem, 7vw, 4rem)" }}
        >
          Something broke
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          An unexpected error occurred. Try refreshing — if it keeps happening,
          reach out at{" "}
          <a
            href="mailto:support@colorcram.app"
            className="underline underline-offset-2 hover:text-white transition-colors"
            style={{ color: "var(--fg)" }}
          >
            support@colorcram.app
          </a>
          .
        </p>
        <div className="flex gap-3 mt-4">
          <Button variant="primary" onClick={reset}>
            Try Again
          </Button>
          <Link href="/">
            <Button variant="secondary">Go Home</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
