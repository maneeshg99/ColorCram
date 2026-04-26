"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { getSupabase } from "@/lib/supabase";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { hsbToHex } from "@colorcram-v2/color-utils";

interface SharedResult {
  id: string;
  mode: string;
  difficulty: string;
  avg_score: number;
  total_score: number;
  rounds_played: number;
  rounds_data: any[];
}

function getScoreColor(score: number): string {
  if (score >= 90) return "#38d97a";
  if (score >= 70) return "#f5c64b";
  if (score >= 40) return "#ff8c42";
  return "#ff5a5a";
}

function getRankText(avgScore: number): string {
  if (avgScore >= 97) return "Chromatic Savant";
  if (avgScore >= 90) return "Color Master";
  if (avgScore >= 80) return "Sharp Eye";
  if (avgScore >= 70) return "Keen Observer";
  if (avgScore >= 50) return "Getting There";
  return "Keep Practicing";
}

export function ChallengeView({ id }: { id: string }) {
  const router = useRouter();
  const [result, setResult] = useState<SharedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    setNotFound(false);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("shared_results")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          setNotFound(true);
        } else {
          setFetchError(error.message ?? "Couldn't load challenge");
        }
      } else if (!data) {
        setNotFound(true);
      } else {
        setResult(data as SharedResult);
      }
    } catch (e: any) {
      setFetchError(e?.message ?? "Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100dvh",
          backgroundColor: "var(--bg)",
          display: "grid",
          placeItems: "center",
          padding: "clamp(24px, 5vw, 48px)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            display: "grid",
            gap: 16,
          }}
        >
          <div
            className="cc-pulse"
            style={{ height: 14, width: 120, borderRadius: 4, background: "var(--surface)" }}
          />
          <div
            className="cc-pulse"
            style={{ height: 40, width: "70%", borderRadius: 6, background: "var(--surface)" }}
          />
          <div
            className="cc-pulse"
            style={{ height: 180, borderRadius: 16, background: "var(--surface)" }}
          />
          <div
            className="cc-pulse"
            style={{ height: 44, width: 160, borderRadius: 999, background: "var(--surface)" }}
          />
        </div>
      </main>
    );
  }

  if (fetchError) {
    return (
      <main
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <ErrorState
          title="Couldn't load challenge"
          message="Check your connection and try again."
          onRetry={load}
        />
      </main>
    );
  }

  if (notFound || !result) {
    return (
      <main
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          gap: 16,
          padding: 32,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ display: "grid", gap: 14, justifyItems: "center", textAlign: "center" }}>
          <span className="cc-eyebrow">Challenge</span>
          <h1 className="cc-headline" style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}>
            This challenge doesn&apos;t exist
          </h1>
          <p style={{ fontSize: 14, color: "var(--fg-subtle)", maxWidth: "38ch" }}>
            It may have been removed, or the link was copied incorrectly.
          </p>
          <Button variant="primary" size="md" onClick={() => router.push("/")}>
            Back home
          </Button>
        </div>
      </main>
    );
  }

  const scoreColor = getScoreColor(result.avg_score);
  const rankText = getRankText(result.avg_score);

  return (
    <main
      style={{
        minHeight: "100dvh",
        padding: "clamp(24px, 5vw, 48px)",
        display: "grid",
        placeItems: "center",
        position: "relative",
        zIndex: 2,
      }}
    >
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "grid",
          gap: 24,
          maxWidth: 480,
          width: "100%",
        }}
      >
        {/* Eyebrow */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              height: 2,
              width: 22,
              background: "var(--rainbow)",
              borderRadius: 999,
            }}
          />
          <span className="cc-eyebrow">Challenge</span>
          <span
            style={{ width: 1, height: 10, background: "var(--border-strong)" }}
          />
          <span
            className="cc-eyebrow cc-mono"
            style={{ color: "var(--fg-faint)" }}
          >
            {result.mode} · {result.difficulty}
          </span>
        </div>

        {/* Headline */}
        <h1
          className="cc-display"
          style={{
            fontSize: "clamp(2rem, 5.5vw, 3.25rem)",
            margin: 0,
          }}
        >
          Someone thinks they can see color.
          <span style={{ color: "var(--fg-muted)" }}> Can you beat them?</span>
        </h1>

        {/* Score card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: "28px 28px 32px",
            position: "relative",
            boxShadow: "var(--shadow-md), var(--shadow-inset)",
          }}
        >
          <div
            className="cc-eyebrow"
            style={{ marginBottom: 8, color: "var(--fg-subtle)" }}
          >
            They scored
          </div>
          <div
            className="cc-display cc-tnum"
            style={{
              fontSize: "clamp(3rem, 7vw, 5rem)",
              color: scoreColor,
              textShadow: `0 0 40px ${scoreColor}33`,
              lineHeight: 0.95,
            }}
          >
            {result.avg_score}%
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--fg-muted)",
              marginTop: 6,
            }}
          >
            {rankText} · {result.rounds_played} round
            {result.rounds_played !== 1 ? "s" : ""}
          </div>

          {/* Round swatches */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 24,
              flexWrap: "wrap",
            }}
          >
            {result.rounds_data.map((round: any, i: number) => {
              const isGrad = round.targetStart;
              const rScore = round.score ?? 0;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: isGrad
                        ? `linear-gradient(135deg, ${hsbToHex(round.targetStart)}, ${hsbToHex(round.targetEnd)})`
                        : hsbToHex(round.target),
                      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
                    }}
                  />
                  <span
                    className="cc-mono cc-tnum"
                    style={{ fontSize: 10, color: "var(--fg-faint)" }}
                  >
                    {rScore}%
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/play/classic")}
          >
            Beat their score
          </Button>
          <Link
            href="/"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--fg-subtle)",
              transition: "color var(--duration-fast) var(--ease-out)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--fg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--fg-subtle)";
            }}
          >
            or just play for fun
          </Link>
        </motion.div>
      </motion.article>
    </main>
  );
}
