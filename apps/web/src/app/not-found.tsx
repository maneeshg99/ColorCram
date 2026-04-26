import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Not Found",
};

export default function NotFound() {
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
      <div
        style={{
          display: "grid",
          gap: 18,
          justifyItems: "start",
          maxWidth: 480,
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
          <span className="cc-eyebrow">Page not found</span>
        </div>
        <h1
          className="cc-display cc-tnum"
          style={{ fontSize: "clamp(4rem, 12vw, 8rem)", margin: 0 }}
        >
          <span className="cc-rainbow-text">4</span>
          <span style={{ color: "var(--fg)" }}>04</span>
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "var(--fg-muted)",
            maxWidth: "42ch",
            lineHeight: 1.55,
          }}
        >
          We couldn&apos;t find the page you were looking for. It may have
          moved, or the link was copied incorrectly.
        </p>
        <Link href="/" style={{ marginTop: 8 }}>
          <Button variant="primary" size="md">
            Back home
          </Button>
        </Link>
      </div>
    </main>
  );
}
