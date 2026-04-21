import { supabase } from "./supabase";
import type { GameMode } from "@colorcram-v2/types";

export interface LeaderboardRow {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  best_avg_score: number;
  games_played: number;
}

export async function fetchLeaderboard(
  mode: GameMode,
  limit: number = 50
): Promise<{ rows: LeaderboardRow[]; error: string | null }> {
  try {
    const { data, error } = await supabase.rpc("get_leaderboard", {
      p_mode: mode,
      p_limit: limit,
    });
    if (error) {
      console.error("Leaderboard fetch error:", error);
      return { rows: [], error: error.message };
    }
    return { rows: (data ?? []) as LeaderboardRow[], error: null };
  } catch (e: any) {
    console.error("Leaderboard fetch error:", e);
    return { rows: [], error: e?.message ?? "Network error" };
  }
}
