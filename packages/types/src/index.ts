// Color types
export interface HSB {
  h: number; // 0-360
  s: number; // 0-100
  b: number; // 0-100
}

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface LAB {
  l: number; // 0-100
  a: number; // unbounded
  b: number; // unbounded
}

export interface XYZ {
  x: number;
  y: number;
  z: number;
}

// Game types
export type GameMode = "classic" | "daily" | "blitz" | "gradient";
export type Difficulty = "easy" | "medium" | "hard" | "expert";
export type GamePhase =
  | "idle"
  | "memorize"
  | "guess"
  | "reveal"
  | "summary"
  | "submitted";

export interface DifficultyConfig {
  rounds: number;
  memorizeTimeMs: number;
  label: string;
}

export interface RoundData {
  target: HSB;
  guess: HSB | null;
  deltaE: number | null;
  score: number | null;
  timeMs: number | null;
}

export interface GradientRoundData {
  targetStart: HSB;
  targetEnd: HSB;
  guessStart: HSB | null;
  guessEnd: HSB | null;
  deltaEStart: number | null;
  deltaEEnd: number | null;
  score: number | null;
  timeMs: number | null;
}

export interface GameState {
  phase: GamePhase;
  mode: GameMode;
  difficulty: Difficulty;
  currentRound: number;
  totalRounds: number;
  rounds: RoundData[];
  gradientRounds: GradientRoundData[];
  memorizeTimeMs: number;
  guessStartTime: number | null;
  totalScore: number;
  avgDeltaE: number;
  // Blitz-specific
  timeRemainingMs: number | null;
  blitzTotalTimeMs: number | null;
}

export interface GameResults {
  mode: GameMode;
  difficulty: Difficulty;
  rounds: RoundData[];
  gradientRounds?: GradientRoundData[];
  totalScore: number;
  avgDeltaE: number;
  totalTimeMs: number;
  dailyChallengeId?: string;
}

// Achievement types
export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "milestone" | "skill" | "streak";
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: string;
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  bestScore: number;
  avgDeltaE: number;
  gamesPlayed: number;
}

// Profile types
export interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  gamesPlayed: number;
  totalScore: number;
  bestScore: number;
  avgDeltaE: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
}
