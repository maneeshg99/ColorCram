"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { getSupabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"form" | "loading" | "success" | "error">("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase sends the recovery token as a hash fragment
    // The client lib auto-handles the session from the URL
    const supabase = getSupabase();
    supabase.auth.onAuthStateChange((event: any) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }
    setStatus("loading");
    const supabase = getSupabase();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("success");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="font-[900] tracking-tight mb-3" style={{ fontSize: "var(--text-heading)" }}>
            Password updated
          </div>
          <p className="text-sm text-[var(--fg-muted)] mb-8">
            You can now sign in with your new password.
          </p>
          <Button onClick={() => (window.location.href = "/")}>
            Go Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-[900] tracking-tight mb-6" style={{ fontSize: "var(--text-heading)" }}>
          Reset Password
        </h1>

        {!ready && (
          <p className="text-sm text-[var(--fg-muted)] mb-4">
            Loading session...
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-[var(--fg-muted)] block mb-1">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm focus:outline-none focus:border-[var(--fg-muted)] transition-colors"
              placeholder="••••••••"
              minLength={6}
              required
              disabled={!ready}
            />
          </div>

          {(errorMsg || status === "error") && (
            <p className="text-xs text-[var(--score-poor)]">
              {errorMsg}
            </p>
          )}

          <Button size="md" className="w-full" disabled={!ready || status === "loading"}>
            {status === "loading" ? "Updating..." : "Set New Password"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
