import type { GameResults } from "@colorguesser/types";

export interface DailyResult {
  date: string;
  totalScore: number;
  avgScore: number;
  rounds: Array<{ score: number; timeMs: number }>;
  completedAt: string;
}

function getTodayUTC(): string {
  return new Date().toISOString().split("T")[0];
}

function getKey(date?: string): string {
  return `colorguesser:daily:${date ?? getTodayUTC()}`;
}

export function hasPlayedToday(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(getKey()) !== null;
}

export function getDailyResult(date?: string): DailyResult | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(getKey(date));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DailyResult;
  } catch {
    return null;
  }
}

export function saveDailyResult(results: GameResults): void {
  if (typeof window === "undefined") return;
  const date = getTodayUTC();
  const data: DailyResult = {
    date,
    totalScore: results.totalScore,
    avgScore:
      results.rounds.length > 0
        ? Math.round(results.totalScore / results.rounds.length)
        : 0,
    rounds: results.rounds.map((r) => ({
      score: r.score ?? 0,
      timeMs: r.timeMs ?? 0,
    })),
    completedAt: new Date().toISOString(),
  };
  localStorage.setItem(getKey(date), JSON.stringify(data));
}

export function getTimeUntilNextChallenge(): number {
  const now = new Date();
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );
  return tomorrow.getTime() - now.getTime();
}
