"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, signIn, signUp } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setEmail("");
    setPassword("");
    setUsername("");
    setError(null);
    setSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    let err: string | null;
    if (tab === "signin") {
      err = await signIn(email, password);
    } else {
      if (!username.trim()) {
        setError("Username is required");
        setSubmitting(false);
        return;
      }
      err = await signUp(email, password, username.trim());
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
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-[var(--bg)]/80 backdrop-blur-sm"
            onClick={() => {
              setShowAuthModal(false);
              reset();
            }}
          />
          <motion.div
            className="relative w-full max-w-sm p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-lg bg-[var(--bg)] mb-6">
              <button
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                  tab === "signin"
                    ? "bg-[var(--accent)] text-[var(--bg)]"
                    : "text-[var(--fg-muted)]"
                }`}
                onClick={() => {
                  setTab("signin");
                  setError(null);
                }}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                  tab === "signup"
                    ? "bg-[var(--accent)] text-[var(--bg)]"
                    : "text-[var(--fg-muted)]"
                }`}
                onClick={() => {
                  setTab("signup");
                  setError(null);
                }}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === "signup" && (
                <div>
                  <label className="text-xs text-[var(--fg-muted)] block mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--fg-muted)] transition-colors"
                    placeholder="ChromaKing"
                    maxLength={24}
                    required
                  />
                </div>
              )}
              <div>
                <label className="text-xs text-[var(--fg-muted)] block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--fg-muted)] transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-[var(--fg-muted)] block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--fg-muted)] transition-colors"
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>

              {error && (
                <p className="text-xs text-[var(--score-poor)]">{error}</p>
              )}

              <Button
                size="md"
                className="w-full"
                disabled={submitting}
              >
                {submitting
                  ? "..."
                  : tab === "signin"
                    ? "Sign In"
                    : "Create Account"}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
