import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support | ColorCram",
  description:
    "Get help with ColorCram - FAQs, account support, and contact information.",
};

function FaqItem({
  number,
  question,
  answer,
}: {
  number: string;
  question: string;
  answer: React.ReactNode;
}) {
  return (
    <div style={{ paddingTop: 12, paddingBottom: 12 }}>
      <div className="flex items-baseline gap-3 mb-4">
        <span
          className="text-xs font-black tracking-widest uppercase"
          style={{ color: "var(--fg-subtle)" }}
        >
          {number}
        </span>
        <h3 className="text-lg font-black tracking-tight">{question}</h3>
      </div>
      <div
        className="text-sm leading-loose pl-9"
        style={{ color: "var(--fg-muted)" }}
      >
        {answer}
      </div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--bg)",
        color: "var(--fg)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
        <div
          className="flex items-center justify-between mb-16"
          style={{
            borderBottom: "1px solid var(--border)",
            paddingBottom: 18,
          }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 transition-colors duration-200"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--fg-subtle)",
            }}
          >
            <span>&larr;</span>
            <span>Home</span>
          </Link>
          <Link
            href="/"
            aria-label="ColorCram home"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "-0.02em",
            }}
          >
            <span className="cc-rainbow-text">color</span>
            <span style={{ color: "var(--fg)" }}>cram</span>
          </Link>
        </div>

        <div className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <span
              style={{
                height: 2,
                width: 22,
                background: "var(--rainbow)",
                borderRadius: 999,
              }}
            />
            <span className="cc-eyebrow">Help</span>
          </div>
          <h1
            className="cc-display mb-3"
            style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
          >
            Support
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "var(--fg-muted)",
              maxWidth: "42ch",
              lineHeight: 1.55,
            }}
          >
            Need help with ColorCram? Check the FAQs below or reach out
            directly.
          </p>
        </div>

        <div>
          <FaqItem
            number="01"
            question="How do I play?"
            answer="You're shown a target color briefly, then recreate it from memory using the HSB color picker. The closer your guess, the higher your score. Choose from Classic, Blitz, Gradient, and Daily Challenge modes."
          />

          <FaqItem
            number="02"
            question="Do I need an account?"
            answer="No — you can play without an account. Creating one lets you save scores, appear on the leaderboard, and track your progress. Sign in with Google or Apple."
          />

          <FaqItem
            number="03"
            question="Trouble signing in?"
            answer={
              <>
                Try clearing your browser cookies and cache, make sure
                third-party cookies aren&apos;t blocked, or try a different
                browser. If the issue persists, contact us at the email below.
              </>
            }
          />

          <FaqItem
            number="04"
            question="How do I delete my account?"
            answer={
              <>
                When signed in, click &ldquo;delete account&rdquo; in the
                navigation bar. This will permanently remove your account and
                all associated data. You can also email{" "}
                <a
                  href="mailto:support@colorcram.app"
                  className="underline underline-offset-2 transition-colors duration-200 hover:text-white"
                  style={{ color: "var(--fg)" }}
                >
                  support@colorcram.app
                </a>{" "}
                with the subject &ldquo;Account Deletion Request&rdquo; and
                we&apos;ll process it within 30 days.
              </>
            }
          />

          <FaqItem
            number="05"
            question="My score didn't save"
            answer="Scores are only saved when you're signed in. Make sure you're logged in before starting a game to ensure your scores are recorded to the leaderboard."
          />
        </div>

        {/* Contact */}
        <div className="mt-16 mb-12">
          <h2
            className="text-xs font-black tracking-widest uppercase mb-6"
            style={{ color: "var(--fg-subtle)" }}
          >
            Contact
          </h2>
          <p
            className="text-sm leading-loose mb-6"
            style={{ color: "var(--fg-muted)" }}
          >
            If your question isn&apos;t answered above, reach out directly.
            We&apos;ll do our best to respond within 48 hours.
          </p>
          <a
            href="mailto:support@colorcram.app"
            className="inline-flex items-center gap-2 text-xs font-black tracking-widest uppercase transition-colors duration-200 hover:text-[var(--fg)]"
            style={{ color: "var(--fg-muted)" }}
          >
            <span>support@colorcram.app</span>
            <span>&rarr;</span>
          </a>
        </div>

        {/* Footer links */}
        <div
          className="pt-8 flex items-center gap-6 text-xs font-bold tracking-widest uppercase"
          style={{ color: "var(--fg-subtle)" }}
        >
          <Link
            href="/privacy"
            className="hover:text-[var(--fg-muted)] transition-colors duration-200"
          >
            Privacy
          </Link>
          <Link
            href="/"
            className="hover:text-[var(--fg-muted)] transition-colors duration-200"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
