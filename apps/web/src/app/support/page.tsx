import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support | ColorCram",
  description:
    "Get help with ColorCram - FAQs, account support, and contact information.",
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#131313] text-white">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#adadad] hover:text-white transition-colors duration-200 mb-10"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-4xl font-black tracking-tight mb-4">Support</h1>
        <p className="text-[#adadad] text-lg mb-12 leading-relaxed">
          Need help with ColorCram? Check the frequently asked questions below
          or reach out to us directly.
        </p>

        <div className="space-y-12">
          {/* FAQ Section */}
          <section>
            <h2 className="text-2xl font-bold mb-6">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-lg font-bold mb-2">
                  How do I play ColorCram?
                </h3>
                <p className="text-[#d4d4d4] leading-relaxed">
                  ColorCram tests your color memory. You are shown a target
                  color for a brief period, then you recreate it from memory
                  using the color picker. The closer your guess is to the
                  original color, the higher your score. Choose from multiple
                  game modes including Classic, Blitz, Gradient, and Daily
                  Challenge.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-lg font-bold mb-2">
                  Do I need an account to play?
                </h3>
                <p className="text-[#d4d4d4] leading-relaxed">
                  No, you can play ColorCram without an account. However,
                  creating an account allows you to save your scores, appear on
                  the leaderboard, and track your progress over time. You can
                  sign in with Google or Apple.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-lg font-bold mb-2">
                  I am having trouble signing in. What should I do?
                </h3>
                <p className="text-[#d4d4d4] leading-relaxed">
                  Try the following steps: clear your browser cookies and cache,
                  make sure third-party cookies are not blocked for our site, and
                  try signing in with a different browser. If the issue persists,
                  contact us at the email below with details about the problem.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-lg font-bold mb-2">
                  How do I delete my account and data?
                </h3>
                <p className="text-[#d4d4d4] leading-relaxed">
                  To request account deletion, send an email to{" "}
                  <a
                    href="mailto:maneesh.gogineni@gmail.com"
                    className="text-white underline underline-offset-2 hover:text-[#adadad] transition-colors"
                  >
                    maneesh.gogineni@gmail.com
                  </a>{" "}
                  with the subject line &quot;Account Deletion Request&quot; and
                  include the email address associated with your account. We will
                  process your request within 30 days.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-lg font-bold mb-2">
                  My score did not save. What happened?
                </h3>
                <p className="text-[#d4d4d4] leading-relaxed">
                  Scores are only saved when you are signed in. If you played as
                  a guest, your scores will not be recorded to the leaderboard.
                  Make sure you are signed in before starting a game to ensure
                  your scores are saved.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-8">
            <h2 className="text-2xl font-bold mb-3">Still Need Help?</h2>
            <p className="text-[#d4d4d4] leading-relaxed mb-4">
              If your question is not answered above, feel free to reach out
              directly. We will do our best to respond within 48 hours.
            </p>
            <a
              href="mailto:maneesh.gogineni@gmail.com"
              className="inline-flex items-center gap-2 rounded-lg bg-white text-[#131313] px-5 py-2.5 text-sm font-bold hover:bg-[#e0e0e0] transition-colors duration-200"
            >
              Contact Support
            </a>
          </section>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-[#adadad]">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors duration-200 underline underline-offset-2"
            >
              Privacy Policy
            </Link>
            <Link
              href="/"
              className="hover:text-white transition-colors duration-200 underline underline-offset-2"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
