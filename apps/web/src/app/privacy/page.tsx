import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | ColorCram",
  description:
    "Privacy Policy for ColorCram - learn how we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#131313] text-white">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#adadad] hover:text-white transition-colors duration-200 mb-10"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-4xl font-black tracking-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-[#adadad] text-sm mb-12">
          Effective Date: April 9, 2026
        </p>

        <div className="space-y-10 text-[#d4d4d4] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              1. Introduction
            </h2>
            <p>
              Welcome to ColorCram (&quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;). ColorCram is a color guessing game available at{" "}
              <a
                href="https://colorcram.app"
                className="text-white underline underline-offset-2 hover:text-[#adadad] transition-colors"
              >
                colorcram.app
              </a>
              . This Privacy Policy explains how we collect, use, and protect
              your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              2. Information We Collect
            </h2>
            <p className="mb-3">
              We collect minimal information necessary to provide our service:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>
                <span className="font-semibold text-white">
                  Account information:
                </span>{" "}
                Email address and username when you create an account.
              </li>
              <li>
                <span className="font-semibold text-white">Game data:</span>{" "}
                Your game scores, statistics, and gameplay history.
              </li>
              <li>
                <span className="font-semibold text-white">
                  Authentication data:
                </span>{" "}
                Information provided by Google or Apple when you sign in through
                those services.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              3. Authentication
            </h2>
            <p>
              ColorCram supports sign-in via Google and Apple through Supabase
              Auth. When you authenticate using these providers, we receive
              limited profile information (such as your name and email address)
              as permitted by the provider and your privacy settings. We do not
              receive or store your passwords from these services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              4. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>To provide and maintain the ColorCram service.</li>
              <li>To manage your account and authenticate your identity.</li>
              <li>
                To track and display game scores and leaderboard standings.
              </li>
              <li>To improve and optimize the game experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              5. Data Sharing and Selling
            </h2>
            <p>
              We do <span className="font-bold text-white">not</span> sell,
              rent, or trade your personal information to third parties. Your
              data is only used for operating ColorCram.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              6. Data Storage and Security
            </h2>
            <p>
              Your data is stored securely using Supabase, which provides
              enterprise-grade security including encryption at rest and in
              transit. We take reasonable measures to protect your information,
              but no method of electronic storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Cookies</h2>
            <p>
              ColorCram uses minimal cookies, limited to authentication tokens
              required to keep you signed in. We do not use tracking cookies,
              advertising cookies, or any third-party analytics cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              8. Children&apos;s Privacy
            </h2>
            <p>
              ColorCram is not directed at children under the age of 13. We do
              not knowingly collect personal information from children under 13.
              If you believe a child under 13 has provided us with personal
              information, please contact us and we will promptly delete it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              9. Data Deletion
            </h2>
            <p>
              You have the right to request deletion of your account and all
              associated data. To request account deletion, please contact us at{" "}
              <a
                href="mailto:maneesh.gogineni@gmail.com"
                className="text-white underline underline-offset-2 hover:text-[#adadad] transition-colors"
              >
                maneesh.gogineni@gmail.com
              </a>{" "}
              with the subject line &quot;Account Deletion Request.&quot; We
              will process your request within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              10. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes
              will be posted on this page with an updated effective date. Your
              continued use of ColorCram after changes are posted constitutes
              your acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">
              11. Contact Us
            </h2>
            <p>
              If you have any questions or concerns about this Privacy Policy,
              please contact:
            </p>
            <div className="mt-3 pl-2">
              <p className="text-white font-semibold">Maneesh Gogineni</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:maneesh.gogineni@gmail.com"
                  className="text-white underline underline-offset-2 hover:text-[#adadad] transition-colors"
                >
                  maneesh.gogineni@gmail.com
                </a>
              </p>
              <p>
                Website:{" "}
                <a
                  href="https://colorcram.app"
                  className="text-white underline underline-offset-2 hover:text-[#adadad] transition-colors"
                >
                  colorcram.app
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
