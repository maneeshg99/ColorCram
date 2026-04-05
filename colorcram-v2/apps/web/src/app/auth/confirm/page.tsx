"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { getSupabase } from "@/lib/supabase";

export default function ConfirmPage() {
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handleConfirm = async () => {
      const supabase = getSupabase();
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get("token_hash");
      const type = params.get("type");

      if (!tokenHash || !type) {
        // Check if there's a hash fragment (some Supabase flows use fragments)
        const hashParams = new URLSearchParams(
          window.location.hash.replace("#", "")
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            setErrorMsg(error.message);
            setStatus("error");
          } else {
            setStatus("success");
          }
          return;
        }

        setErrorMsg("Invalid confirmation link.");
        setStatus("error");
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as any,
      });

      if (error) {
        setErrorMsg(error.message);
        setStatus("error");
      } else {
        setStatus("success");
      }
    };

    handleConfirm();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      {status === "verifying" && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-[var(--text-heading)] font-[900] tracking-tight mb-2">
            Verifying...
          </div>
          <p className="text-sm text-[var(--fg-muted)]">
            Confirming your email address
          </p>
        </motion.div>
      )}

      {status === "success" && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div
            className="font-[900] tracking-tight mb-3"
            style={{ fontSize: "var(--text-heading)" }}
          >
            You&rsquo;re in.
          </div>
          <p className="text-sm text-[var(--fg-muted)] mb-8 max-w-sm">
            Email confirmed. Your scores will now be saved to the leaderboard.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => (window.location.href = "/play")}>
              Play Now
            </Button>
            <Button
              variant="secondary"
              onClick={() => (window.location.href = "/leaderboard")}
            >
              Leaderboard
            </Button>
          </div>
        </motion.div>
      )}

      {status === "error" && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            className="font-[900] tracking-tight mb-3"
            style={{ fontSize: "var(--text-heading)" }}
          >
            Something went wrong
          </div>
          <p className="text-sm text-[var(--fg-muted)] mb-2">
            {errorMsg || "Could not confirm your email."}
          </p>
          <p className="text-xs text-[var(--fg-muted)] mb-8">
            The link may have expired. Try signing in again.
          </p>
          <Button onClick={() => (window.location.href = "/")}>
            Go Home
          </Button>
        </motion.div>
      )}
    </div>
  );
}
