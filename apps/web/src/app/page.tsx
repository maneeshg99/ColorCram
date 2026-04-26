import Link from "next/link";
import { AuthButton } from "@/components/auth/AuthButton";
import { HomeContent } from "@/components/home/HomeContent";

export default function HomePage() {
  return (
    <main className="relative flex flex-col min-h-[100dvh] select-none">
      {/* Top nav — translucent, hairline, small wordmark on the left */}
      <nav
        aria-label="Primary"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px clamp(20px, 4vw, 48px)",
          background: "rgba(15, 15, 17, 0.72)",
          backdropFilter: "blur(16px) saturate(140%)",
          WebkitBackdropFilter: "blur(16px) saturate(140%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* Tiny wordmark in nav — establishes brand at small scale */}
          <Link
            href="/"
            aria-label="ColorCram home"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: "-0.02em",
            }}
          >
            <span className="cc-rainbow-text">color</span>
            <span style={{ color: "var(--fg)" }}>cram</span>
          </Link>

          <span
            aria-hidden="true"
            style={{
              width: 1,
              height: 14,
              background: "var(--border-strong)",
              display: "inline-block",
            }}
          />

          <Link
            href="/leaderboard"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--fg-muted)",
              transition: "color var(--duration-fast) var(--ease-out)",
            }}
            className="hover:text-white"
          >
            Leaderboard
          </Link>
          <Link
            href="/support"
            className="hidden sm:inline"
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--fg-subtle)",
              transition: "color var(--duration-fast) var(--ease-out)",
            }}
          >
            Support
          </Link>
          <Link
            href="/privacy"
            className="hidden sm:inline"
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--fg-subtle)",
              transition: "color var(--duration-fast) var(--ease-out)",
            }}
          >
            Privacy
          </Link>
        </div>
        <AuthButton />
      </nav>

      <HomeContent />
    </main>
  );
}
