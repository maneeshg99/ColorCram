import type { AchievementDefinition, GameResults } from "@colorcram-v2/types";

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: "first_game", name: "First Steps", description: "Complete your first game", icon: "🎮", category: "milestone" },
  { id: "ten_games", name: "Getting Started", description: "Complete 10 games", icon: "🔟", category: "milestone" },
  { id: "hundred_games", name: "Color Veteran", description: "Complete 100 games", icon: "💯", category: "milestone" },
  { id: "perfect_round", name: "Eagle Eye", description: "Score 100 on a single round", icon: "🦅", category: "skill" },
  { id: "perfect_game", name: "Pixel Perfect", description: "Score 100 on every round in a game", icon: "✨", category: "skill" },
  { id: "sub_1_delta", name: "Imperceptible", description: "Get a Delta E under 1.0", icon: "🔬", category: "skill" },
  { id: "streak_7", name: "Weekly Warrior", description: "Play 7 days in a row", icon: "🔥", category: "streak" },
  { id: "streak_30", name: "Monthly Master", description: "Play 30 days in a row", icon: "👑", category: "streak" },
  { id: "blitz_20", name: "Speed Demon", description: "Complete 20+ rounds in Blitz mode", icon: "⚡", category: "skill" },
  { id: "all_modes", name: "Jack of All Colors", description: "Complete a game in every mode", icon: "🃏", category: "milestone" },
  { id: "expert_clear", name: "Color Savant", description: "Complete an Expert difficulty game with 80+ average score", icon: "🧠", category: "skill" },
  { id: "gradient_master", name: "Gradient Guru", description: "Score 90+ average on Gradient mode", icon: "🌈", category: "skill" },
];

/**
 * Check which achievements a game result qualifies for.
 * Returns IDs of newly unlockable achievements.
 * The caller should check against already-unlocked achievements.
 */
export function checkGameAchievements(
  results: GameResults,
  totalGamesPlayed: number,
  currentStreak: number,
  modesPlayed: Set<string>
): string[] {
  const unlocked: string[] = [];

  // Milestone checks
  if (totalGamesPlayed === 1) unlocked.push("first_game");
  if (totalGamesPlayed === 10) unlocked.push("ten_games");
  if (totalGamesPlayed === 100) unlocked.push("hundred_games");

  // Skill checks
  if (results.rounds.some((r) => r.score === 100)) {
    unlocked.push("perfect_round");
  }
  if (results.rounds.every((r) => r.score === 100)) {
    unlocked.push("perfect_game");
  }
  if (results.rounds.some((r) => (r.deltaE ?? Infinity) < 1)) {
    unlocked.push("sub_1_delta");
  }

  // Streak checks
  if (currentStreak >= 7) unlocked.push("streak_7");
  if (currentStreak >= 30) unlocked.push("streak_30");

  // Mode-specific checks
  if (results.mode === "blitz" && results.rounds.length >= 20) {
    unlocked.push("blitz_20");
  }
  if (modesPlayed.size >= 4) {
    unlocked.push("all_modes");
  }
  if (
    results.difficulty === "expert" &&
    results.totalScore / results.rounds.length >= 80
  ) {
    unlocked.push("expert_clear");
  }
  if (
    results.mode === "gradient" &&
    results.totalScore / results.rounds.length >= 90
  ) {
    unlocked.push("gradient_master");
  }

  return unlocked;
}
