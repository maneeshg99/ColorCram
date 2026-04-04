import type { Difficulty, DifficultyConfig } from "@colorcram/types";

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: { rounds: 5, memorizeTimeMs: 6000, label: "Easy" },
  medium: { rounds: 5, memorizeTimeMs: 6000, label: "Medium" },
  hard: { rounds: 8, memorizeTimeMs: 3000, label: "Hard" },
  expert: { rounds: 5, memorizeTimeMs: 2000, label: "Expert" },
};

export const BLITZ_DURATION_MS = 60000;
export const BLITZ_MEMORIZE_MS = 2000;
