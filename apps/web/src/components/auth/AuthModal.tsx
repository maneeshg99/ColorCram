"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/lib/auth-context";
import {
  validateUsername,
  validateEmail,
  validatePassword,
  sanitizeInput,
} from "@colorcram-v2/types";

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, signIn, signUp, resetPassword } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const reset = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setError(null);
    setSubmitting(false);
    setResetSent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setError(emailCheck.error!);
      return;
    }

    if (tab === "forgot") {
      setSubmitting(true);
      await resetPassword(sanitizeInput(email));
      setSubmitting(false);
      setResetSent(true);
      return;
    }

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      setError(pwCheck.error!);
      return;
    }

    if (tab === "signup") {
      const usernameCheck = validateUsername(username);
      if (!usernameCheck.valid) {
        setError(usernameCheck.error!);
        return;
      }
    }

    setSubmitting(true);

    let err: string | null;
    if (tab === "signin") {
      err = await signIn(sanitizeInput(email), password);
    } else {
      err = await signUp(
        sanitizeInput(email),
        password,
        sanitizeInput(username)
      );
    }

    if (err) {
      setError(err);
      setSubmitting(false);
    } else {
      reset();
    }
  };

  return (
    <AnimatePresence>
      {showAuthModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={() => {
              setShowAuthModal(false);
              reset();
            }}
          />

          {/* Close button */}
          <button
            onClick={() => {
              setShowAuthModal(false);
              reset();
            }}
            className="absolute top-6 right-6 text-[#666] hover:text-white transition-colors duration-200 z-10"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Form */}
          <motion.div
            className="relative w-full max-w-xs z-10"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {/* Tabs (hidden during forgot password flow) */}
            {tab !== "forgot" && (
              <div className="flex gap-6 mb-10 justify-center">
                <button
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    tab === "signin" ? "text-white" : "text-[#adadad] hover:text-white"
                  }`}
                  onClick={() => {
                    setTab("signin");
                    setError(null);
                  }}
                >
                  Sign In
                </button>
                <button
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    tab === "signup" ? "text-white" : "text-[#adadad] hover:text-white"
                  }`}
                  onClick={() => {
                    setTab("signup");
                    setError(null);
                  }}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Forgot password header with back button */}
            {tab === "forgot" && (
              <div className="mb-10">
                <button
                  type="button"
                  onClick={() => {
                    setTab("signin");
                    setError(null);
                    setResetSent(false);
                  }}
                  className="text-xs text-[#adadad] hover:text-white transition-colors duration-200 mb-4 inline-flex items-center gap-1"
                >
                  <span>←</span>
                  <span>Back to Sign In</span>
                </button>
                <h2 className="text-sm font-semibold text-white">Reset password</h2>
              </div>
            )}

            {/* Reset email sent confirmation */}
            {tab === "forgot" && resetSent ? (
              <div className="space-y-4">
                <p className="text-sm text-[#adadad]">
                  If an account exists for that email, we&apos;ve sent a reset link. Check your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTab("signin");
                    reset();
                  }}
                  className="w-full text-sm font-semibold text-white py-2 transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {tab === "signup" && (
                  <div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-white/20 focus:border-white outline-none py-2 text-sm text-white placeholder:text-[#666] transition-colors duration-200"
                      placeholder="Username"
                      maxLength={24}
                      autoComplete="username"
                      required
                    />
                    <p className="text-[10px] text-[#666] mt-2">
                      2-24 characters, letters, numbers, underscores
                    </p>
                  </div>
                )}

                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-white/20 focus:border-white outline-none py-2 text-sm text-white placeholder:text-[#666] transition-colors duration-200"
                    placeholder="Email"
                    maxLength={254}
                    autoComplete="email"
                    required
                  />
                </div>

                {tab !== "forgot" && (
                  <div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-white/20 focus:border-white outline-none py-2 text-sm text-white placeholder:text-[#666] transition-colors duration-200"
                      placeholder="Password"
                      minLength={8}
                      maxLength={128}
                      autoComplete={
                        tab === "signin" ? "current-password" : "new-password"
                      }
                      required
                    />
                  </div>
                )}

                {error && (
                  <p className="text-xs text-[#ff3b3b]">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full text-sm font-semibold text-white py-2 transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-40"
                >
                  {submitting
                    ? "..."
                    : tab === "signin"
                      ? "Sign In"
                      : tab === "signup"
                        ? "Create Account"
                        : "Send Reset Link"}
                </button>

                {tab === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setTab("forgot");
                      setError(null);
                      setPassword("");
                    }}
                    className="w-full text-xs text-[#666] hover:text-white transition-colors duration-200"
                  >
                    Forgot password?
                  </button>
                )}
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
