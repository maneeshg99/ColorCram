"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { getSupabase } from "@/lib/supabase";
import { RainbowRing } from "@/components/design-system/RainbowRing";
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
  if (score >= 90) return "#14b861";
  if (score >= 70) return "#ffe103";
  if (score >= 40) return "#ff9500";
  return "#ff3b3b";
}

function getRankText(avgScore: number): string {
  if (avgScore >= 97) return "Chromatic Savant";
  if (avgScore >= 90) return "Color Master";
  if (avgScore >= 80) return "Sharp Eye";
  if (avgScore >= 70) return "Keen Observer";
  if (avgScore >= 50) return "Getting There";
  return "Keep Practicing";
}

export default function ChallengePage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<SharedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("shared_results")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setResult(data as SharedResult);
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div
        style={{
          height: "100dvh",
          backgroundColor: "#131313",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <RainbowRing size={64} spinning>
          <span style={{ fontSize: 10, color: "#adadad" }}>...</span>
        </RainbowRing>
      </div>
    );
  }

  if (notFound || !result) {
    return (
      <div
        style={{
          height: "100dvh",
          backgroundColor: "#131313",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
          Challenge not found
        </span>
        <button
          onClick={() => router.push("/")}
          style={{
            background: "none",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 20,
            padding: "8px 24px",
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Go Home
        </button>
      </div>
    );
  }

  const scoreColor = getScoreColor(result.avg_score);
  const rankText = getRankText(result.avg_score);

  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "#131313",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(24px, 5vw, 48px)",
        textAlign: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          maxWidth: 440,
        }}
      >
        {/* Rainbow ring icon */}
        <RainbowRing size={80} spinning>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <polygon points="6,3 20,12 6,21" />
          </svg>
        </RainbowRing>

        {/* Challenge text */}
        <h1
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            fontWeight: 900,
            color: "#ffffff",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Someone challenged you
        </h1>

        <p
          style={{
            fontSize: 15,
            color: "#adadad",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          They scored{" "}
          <span style={{ color: scoreColor, fontWeight: 800 }}>
            {result.avg_score}%
          </span>{" "}
          on{" "}
          <span style={{ color: "#fff", fontWeight: 600 }}>
            {result.mode}
          </span>{" "}
          mode. Can you beat it?
        </p>

        {/* Score card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            backgroundColor: "#1f1f1f",
            border: "1px solid #2a2a2a",
            borderRadius: 16,
            padding: "24px 32px",
            width: "100%",
            marginTop: 8,
          }}
        >
          <div
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontWeight: 900,
              color: scoreColor,
              lineHeight: 1,
              textShadow: `0 0 40px ${scoreColor}30`,
            }}
          >
            {result.avg_score}%
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#adadad",
              marginTop: 8,
              fontWeight: 500,
            }}
          >
            {rankText} · {result.rounds_played} round
            {result.rounds_played !== 1 ? "s" : ""}
          </div>

          {/* Round swatches */}
          <div
            style={{
              display: "flex",
              gap: 6,
              justifyContent: "center",
              marginTop: 16,
              flexWrap: "wrap",
            }}
          >
            {result.rounds_data.map((round: any, i: number) => {
              const isGrad = round.targetStart;
              const targetColor = isGrad
                ? hsbToHex(round.targetStart)
                : hsbToHex(round.target);
              const rScore = round.score ?? 0;
              return (
                <div
                  key={i}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: targetColor,
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      bottom: -16,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: 10,
                      color: "#666",
                      fontFamily: "monospace",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rScore}%
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Play button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => router.push("/play/classic")}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            marginTop: 16,
            background: "#ffffff",
            border: "none",
            borderRadius: 12,
            padding: "14px 40px",
            fontSize: 16,
            fontWeight: 700,
            color: "#131313",
            cursor: "pointer",
          }}
        >
          Beat Their Score
        </motion.button>

        <button
          onClick={() => router.push("/")}
          style={{
            background: "none",
            border: "none",
            fontSize: 14,
            fontWeight: 500,
            color: "#adadad",
            cursor: "pointer",
            padding: "8px 0",
          }}
        >
          or just play for fun
        </button>
      </motion.div>
    </div>
  );
}
