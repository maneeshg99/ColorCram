import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | ColorCram",
  description:
    "Privacy Policy for ColorCram - learn how we collect, use, and protect your data.",
};

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
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
        <h2 className="text-lg font-black tracking-tight">{title}</h2>
      </div>
      <div
        className="text-sm leading-loose space-y-3 pl-9"
        style={{ color: "var(--fg-muted)" }}
      >
        {children}
      </div>
    </div>
  );
}

export default function PrivacyPolicyPage() {
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
            className="font-black tracking-tight mb-2"
            style={{ fontSize: "var(--text-headline)" }}
          >
            Privacy Policy
          </h1>
          <p
            className="text-sm font-bold tracking-wide"
            style={{ color: "var(--fg-subtle)" }}
          >
            Effective April 9, 2026
          </p>
        </div>

        <div>
          <Section number="01" title="Introduction">
            <p>
              ColorCram is a color guessing game available at{" "}
              <a
                href="https://colorcram.app"
                className="underline underline-offset-2 transition-colors duration-200 hover:text-white"
                style={{ color: "var(--fg)" }}
              >
                colorcram.app
              </a>{" "}
              and on iOS. This policy explains how we handle your information.
            </p>
          </Section>

          <Section number="02" title="Information We Collect">
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/40 shrink-0" />
                <p>
                  <span className="text-white font-semibold">Account info</span>{" "}
                  &mdash; email address and username when you create an account.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/40 shrink-0" />
                <p>
                  <span className="text-white font-semibold">Game data</span>{" "}
                  &mdash; scores, statistics, and gameplay history.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/40 shrink-0" />
                <p>
                  <span className="text-white font-semibold">
                    Auth provider data
                  </span>{" "}
                  &mdash; limited profile info from Google or Apple when you sign
                  in.
                </p>
              </div>
            </div>
          </Section>

          <Section number="03" title="Authentication">
            <p>
              ColorCram supports sign-in via Google and Apple through Supabase
              Auth. We receive limited profile information as permitted by the
              provider. We never receive or store your passwords from these
              services.
            </p>
          </Section>

          <Section number="04" title="How We Use Your Information">
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/40 shrink-0" />
                <p>To provide and maintain the ColorCram service.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/40 shrink-0" />
                <p>To manage your account and authenticate your identity.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/40 shrink-0" />
                <p>To track and display scores and leaderboard standings.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/40 shrink-0" />
                <p>To improve and optimize the game experience.</p>
              </div>
            </div>
          </Section>

          <Section number="05" title="Data Sharing">
            <p>
              We do <span className="text-white font-bold">not</span> sell,
              rent, or trade your personal information to third parties. Your
              data is only used to operate ColorCram.
            </p>
          </Section>

          <Section number="06" title="Data Storage & Security">
            <p>
              Your data is stored securely using Supabase, which provides
              enterprise-grade security including encryption at rest and in
              transit. No method of electronic storage is 100% secure, but we
              take reasonable measures to protect your information.
            </p>
          </Section>

          <Section number="07" title="Cookies">
            <p>
              ColorCram uses minimal cookies limited to authentication tokens
              that keep you signed in. We do not use tracking, advertising, or
              third-party analytics cookies.
            </p>
          </Section>

          <Section number="08" title="Children's Privacy">
            <p>
              ColorCram is not directed at children under 13. We do not knowingly
              collect personal information from children under 13. If you believe
              a child has provided us with personal information, please contact
              us.
            </p>
          </Section>

          <Section number="09" title="Data Deletion">
            <p>
              You can delete your account and all associated data at any time
              using the &ldquo;delete account&rdquo; option available when signed
              in. Alternatively, you may email{" "}
              <a
                href="mailto:support@colorcram.app"
                className="underline underline-offset-2 transition-colors duration-200 hover:text-white"
                style={{ color: "var(--fg)" }}
              >
                support@colorcram.app
              </a>{" "}
              with the subject &ldquo;Account Deletion Request&rdquo; and we
              will process it within 30 days.
            </p>
          </Section>

          <Section number="10" title="Changes to This Policy">
            <p>
              We may update this policy from time to time. Changes will be posted
              on this page with an updated effective date. Continued use of
              ColorCram after changes constitutes acceptance.
            </p>
          </Section>

          <Section number="11" title="Contact">
            <p>Questions about this Privacy Policy? Reach out:</p>
            <div className="mt-2">
              <p>
                <a
                  href="mailto:support@colorcram.app"
                  className="underline underline-offset-2 transition-colors duration-200 hover:text-white"
                  style={{ color: "var(--fg)" }}
                >
                  support@colorcram.app
                </a>
              </p>
            </div>
          </Section>
        </div>

        <div
          className="pt-8 flex items-center gap-6 text-xs font-bold tracking-widest uppercase"
          style={{ color: "var(--fg-subtle)" }}
        >
          <Link
            href="/support"
            className="hover:text-[var(--fg-muted)] transition-colors duration-200"
          >
            Support
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
