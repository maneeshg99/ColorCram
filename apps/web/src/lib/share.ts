import { getSupabase } from "./supabase";
import type { GameResults } from "@colorcram-v2/types";

function generateShareId(): string {
  const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export async function createShareLink(
  results: GameResults,
  userId?: string
): Promise<string | null> {
  const supabase = getSupabase();
  const shareId = generateShareId();

  const avgScore =
    results.rounds.length > 0
      ? Math.round(results.totalScore / results.rounds.length)
      : 0;

  const roundsData =
    results.mode === "gradient" && results.gradientRounds
      ? results.gradientRounds.map((r) => ({
          targetStart: r.targetStart,
          targetEnd: r.targetEnd,
          guessStart: r.guessStart,
          guessEnd: r.guessEnd,
          score: r.score,
        }))
      : results.rounds.map((r) => ({
          target: r.target,
          guess: r.guess,
          score: r.score,
        }));

  const { error } = await supabase.from("shared_results").insert({
    id: shareId,
    user_id: userId ?? null,
    mode: results.mode,
    difficulty: results.difficulty,
    avg_score: avgScore,
    total_score: results.totalScore,
    rounds_played: results.rounds.length,
    rounds_data: roundsData,
  });

  if (error) {
    console.error("Share error:", error);
    return null;
  }

  return shareId;
}

export function getShareUrl(shareId: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "https://colorcram.app";
  return `${base}/challenge/${shareId}`;
}
