import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support | ColorCram",
  description:
    "Get help with ColorCram - FAQs, account support, and contact information.",
};

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border border-[var(--border)] p-6 sm:p-8"
      style={{ backgroundColor: "var(--surface)" }}
    >
      <h3 className="text-sm font-black tracking-tight mb-3">{question}</h3>
      <p
        className="text-sm leading-relaxed"
        style={{ color: "var(--fg-muted)" }}
      >
        {answer}
      </p>
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
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-12 transition-colors duration-200"
          style={{ color: "var(--fg-subtle)" }}
        >
          <span>&larr;</span>
          <span>Home</span>
        </Link>

        <div className="mb-12">
          <h1
            className="font-black tracking-tight mb-3"
            style={{ fontSize: "var(--text-headline)" }}
          >
            Support
          </h1>
          <p
            className="text-sm leading-relaxed max-w-lg"
            style={{ color: "var(--fg-muted)" }}
          >
            Need help with ColorCram? Check the frequently asked questions below
            or reach out directly.
          </p>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2
            className="text-xs font-black tracking-widest uppercase mb-5"
            style={{ color: "var(--fg-subtle)" }}
          >
            FAQ
          </h2>

          <div className="space-y-3">
            <FaqItem
              question="How do I play ColorCram?"
              answer="You're shown a target color briefly, then recreate it from memory using the HSB color picker. The closer your guess, the higher your score. Choose from Classic, Blitz, Gradient, and Daily Challenge modes."
            />

            <FaqItem
              question="Do I need an account to play?"
              answer="No — you can play without an account. Creating one lets you save scores, appear on the leaderboard, and track your progress. Sign in with Google or Apple."
            />

            <FaqItem
              question="I'm having trouble signing in"
              answer={
                <>
                  Try clearing your browser cookies and cache, make sure
                  third-party cookies aren&apos;t blocked, or try a different
                  browser. If the issue persists, contact us at the email below.
                </>
              }
            />

            <FaqItem
              question="How do I delete my account?"
              answer={
                <>
                  Email{" "}
                  <a
                    href="mailto:maneesh.gogineni@gmail.com"
                    className="underline underline-offset-2 transition-colors duration-200 hover:text-white"
                    style={{ color: "var(--fg)" }}
                  >
                    maneesh.gogineni@gmail.com
                  </a>{" "}
                  with the subject &ldquo;Account Deletion Request&rdquo; and
                  include your account email. We&apos;ll process it within 30
                  days.
                </>
              }
            />

            <FaqItem
              question="My score didn't save"
              answer="Scores are only saved when you're signed in. Make sure you're logged in before starting a game to ensure your scores are recorded to the leaderboard."
            />
          </div>
        </div>

        {/* Contact */}
        <div
          className="rounded-2xl border border-[var(--border)] p-6 sm:p-8"
          style={{ backgroundColor: "var(--surface)" }}
        >
          <h2 className="text-lg font-black tracking-tight mb-2">
            Still need help?
          </h2>
          <p
            className="text-sm leading-relaxed mb-5"
            style={{ color: "var(--fg-muted)" }}
          >
            If your question isn&apos;t answered above, reach out directly.
            We&apos;ll do our best to respond within 48 hours.
          </p>
          <a
            href="mailto:maneesh.gogineni@gmail.com"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 hover:opacity-80"
            style={{
              backgroundColor: "var(--fg)",
              color: "var(--bg)",
            }}
          >
            Contact Support
          </a>
        </div>

        {/* Footer links */}
        <div
          className="mt-12 flex items-center gap-6 text-xs font-bold tracking-widest uppercase"
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
