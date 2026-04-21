import { getSupabase } from "./supabase";
import type { GameMode } from "@colorcram-v2/types";

export interface LeaderboardRow {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  best_avg_score: number;
  games_played: number;
}

export interface LeaderboardResult {
  rows: LeaderboardRow[];
  error: string | null;
}

export async function fetchLeaderboard(
  mode: GameMode,
  limit: number = 50
): Promise<LeaderboardResult> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("get_leaderboard", {
      p_mode: mode,
      p_limit: limit,
    });
    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Leaderboard fetch error:", error);
      }
      return { rows: [], error: error.message ?? "Failed to load leaderboard" };
    }
    return { rows: (data ?? []) as LeaderboardRow[], error: null };
  } catch (e: any) {
    return {
      rows: [],
      error: e?.message ?? "Network error. Check your connection.",
    };
  }
}
