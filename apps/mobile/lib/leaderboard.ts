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
): Promise<LeaderboardRow[]> {
  const { data, error } = await supabase.rpc("get_leaderboard", {
    p_mode: mode,
    p_limit: limit,
  });
  if (error) {
    console.error("Leaderboard fetch error:", error);
    return [];
  }
  return (data ?? []) as LeaderboardRow[];
}
