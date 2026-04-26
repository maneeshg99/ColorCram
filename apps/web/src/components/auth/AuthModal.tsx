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
import { Button } from "@/components/ui/Button";

type Tab = "signin" | "signup" | "forgot";

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, signIn, signUp, resetPassword } = useAuth();
  const [tab, setTab] = useState<Tab>("signin");
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

  const close = () => {
    setShowAuthModal(false);
    reset();
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
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          className="fixed inset-0 flex items-center justify-center"
          style={{
            padding: 24,
            zIndex: 100,
            background: "rgba(5, 5, 10, 0.72)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={close}
        >
          {/* Close */}
          <button
            onClick={close}
            aria-label="Close sign in"
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              width: 36,
              height: 36,
              display: "grid",
              placeItems: "center",
              borderRadius: 999,
              color: "var(--fg-subtle)",
              background: "transparent",
              cursor: "pointer",
              transition: "color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--fg)";
              e.currentTarget.style.background = "var(--surface)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--fg-subtle)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Panel */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            style={{
              width: "100%",
              maxWidth: 380,
              background: "var(--surface-elevated)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-lg)",
              padding: "32px 28px 28px",
              boxShadow: "var(--shadow-lg), var(--shadow-inset)",
              position: "relative",
            }}
          >
            {/* Rainbow hairline on top */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                left: 24,
                right: 24,
                height: 2,
                background: "var(--rainbow)",
                borderRadius: 999,
                transform: "translateY(-1px)",
              }}
            />

            {/* Header */}
            <div style={{ marginBottom: 22 }}>
              <span className="cc-eyebrow" style={{ color: "var(--fg-subtle)" }}>
                {tab === "forgot"
                  ? "Reset password"
                  : tab === "signin"
                    ? "Welcome back"
                    : "Create your account"}
              </span>
              <h2
                id="auth-modal-title"
                className="cc-headline"
                style={{
                  fontSize: 24,
                  marginTop: 6,
                  color: "var(--fg)",
                }}
              >
                {tab === "forgot"
                  ? "We'll email you a link"
                  : tab === "signin"
                    ? "Sign in to ColorCram"
                    : "Claim a username"}
              </h2>
            </div>

            {/* Tabs (hidden during forgot) */}
            {tab !== "forgot" && (
              <div
                role="tablist"
                style={{
                  display: "inline-flex",
                  padding: 3,
                  gap: 2,
                  borderRadius: 999,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  marginBottom: 22,
                }}
              >
                <TabPill
                  label="Sign in"
                  active={tab === "signin"}
                  onClick={() => {
                    setTab("signin");
                    setError(null);
                  }}
                />
                <TabPill
                  label="Sign up"
                  active={tab === "signup"}
                  onClick={() => {
                    setTab("signup");
                    setError(null);
                  }}
                />
              </div>
            )}

            {/* Forgot: back link */}
            {tab === "forgot" && (
              <button
                type="button"
                onClick={() => {
                  setTab("signin");
                  setError(null);
                  setResetSent(false);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--fg-subtle)",
                  marginBottom: 16,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <span aria-hidden="true">&larr;</span>
                <span>Back to sign in</span>
              </button>
            )}

            {/* Reset-sent confirmation */}
            {tab === "forgot" && resetSent ? (
              <div style={{ display: "grid", gap: 16 }}>
                <p style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.55 }}>
                  If an account exists for that email, we&apos;ve sent a reset
                  link. Check your inbox.
                </p>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setTab("signin");
                    reset();
                  }}
                >
                  Back to sign in
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{ display: "grid", gap: 18 }}
                noValidate
              >
                {tab === "signup" && (
                  <Field
                    label="Username"
                    helper="2-24 characters · letters, numbers, underscores"
                  >
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      style={inputStyle}
                      placeholder="chroma_fox"
                      maxLength={24}
                      autoComplete="username"
                      required
                    />
                  </Field>
                )}

                <Field label="Email">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    placeholder="you@example.com"
                    maxLength={254}
                    autoComplete="email"
                    required
                  />
                </Field>

                {tab !== "forgot" && (
                  <Field label="Password">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={inputStyle}
                      placeholder="At least 8 characters"
                      minLength={8}
                      maxLength={128}
                      autoComplete={
                        tab === "signin" ? "current-password" : "new-password"
                      }
                      required
                    />
                  </Field>
                )}

                {error && (
                  <p
                    role="alert"
                    style={{
                      fontSize: 12.5,
                      color: "#ff6a6a",
                      background: "rgba(255, 106, 106, 0.08)",
                      border: "1px solid rgba(255, 106, 106, 0.2)",
                      borderRadius: 10,
                      padding: "8px 12px",
                      lineHeight: 1.4,
                    }}
                  >
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={submitting}
                  style={{ width: "100%" }}
                >
                  {submitting
                    ? "Working…"
                    : tab === "signin"
                      ? "Sign in"
                      : tab === "signup"
                        ? "Create account"
                        : "Send reset link"}
                </Button>

                {tab === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setTab("forgot");
                      setError(null);
                      setPassword("");
                    }}
                    style={{
                      fontSize: 12,
                      color: "var(--fg-subtle)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px 0",
                      justifySelf: "center",
                      transition: "color var(--duration-fast) var(--ease-out)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--fg)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--fg-subtle)";
                    }}
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

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-inset)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  color: "var(--fg)",
  outline: "none",
  transition:
    "border-color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out)",
};

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span
        className="cc-eyebrow"
        style={{ color: "var(--fg-subtle)", fontSize: 10.5 }}
      >
        {label}
      </span>
      {children}
      {helper && (
        <span style={{ fontSize: 11, color: "var(--fg-faint)", marginTop: 2 }}>
          {helper}
        </span>
      )}
    </label>
  );
}

function TabPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        background: active ? "var(--surface-overlay)" : "transparent",
        color: active ? "var(--fg)" : "var(--fg-muted)",
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        padding: "7px 16px",
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        transition:
          "background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)",
      }}
    >
      {label}
    </button>
  );
}
