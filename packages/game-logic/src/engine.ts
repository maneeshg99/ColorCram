import { generateColors, generateGradientPairs } from "@colorguesser/color-utils";
import type {
  GameState,
  GamePhase,
  GameMode,
  Difficulty,
  HSB,
  RoundData,
  GradientRoundData,
  GameResults,
} from "@colorguesser/types";
import { DIFFICULTY_CONFIGS, BLITZ_DURATION_MS, BLITZ_MEMORIZE_MS } from "./difficulty";
import { calculateDeltaE, deltaEToScore, calculateScoreWithSpeedBonus } from "./scoring";

/**
 * Create a new game in idle state.
 */
export function createGame(
  mode: GameMode,
  difficulty: Difficulty,
  seed?: string
): GameState {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const isBlitz = mode === "blitz";
  const isGradient = mode === "gradient";

  const totalRounds = isBlitz ? 999 : config.rounds;
  const memorizeTimeMs = isBlitz ? BLITZ_MEMORIZE_MS : config.memorizeTimeMs;

  const gameSeed = seed || `${mode}-${Date.now()}-${Math.random()}`;

  let rounds: RoundData[] = [];
  let gradientRounds: GradientRoundData[] = [];

  if (isGradient) {
    const pairs = generateGradientPairs(totalRounds, gameSeed);
    gradientRounds = pairs.map((pair) => ({
      targetStart: pair.start,
      targetEnd: pair.end,
      guessStart: null,
      guessEnd: null,
      deltaEStart: null,
      deltaEEnd: null,
      score: null,
      timeMs: null,
    }));
  } else {
    const colors = generateColors(totalRounds, gameSeed);
    rounds = colors.map((color) => ({
      target: color,
      guess: null,
      deltaE: null,
      score: null,
      timeMs: null,
    }));
  }

  return {
    phase: "idle",
    mode,
    difficulty,
    currentRound: 0,
    totalRounds,
    rounds,
    gradientRounds,
    memorizeTimeMs,
    guessStartTime: null,
    totalScore: 0,
    avgDeltaE: 0,
    timeRemainingMs: isBlitz ? BLITZ_DURATION_MS : null,
    blitzTotalTimeMs: isBlitz ? BLITZ_DURATION_MS : null,
  };
}

/**
 * Start the memorize phase for the current round.
 */
export function startMemorize(state: GameState): GameState {
  if (state.phase !== "idle" && state.phase !== "reveal") {
    return state;
  }
  return { ...state, phase: "memorize" };
}

/**
 * End memorize phase, start guessing.
 */
export function startGuess(state: GameState): GameState {
  if (state.phase !== "memorize") {
    return state;
  }
  return { ...state, phase: "guess", guessStartTime: Date.now() };
}

/**
 * Submit a guess for the current round (non-gradient modes).
 */
export function submitGuess(state: GameState, guess: HSB): GameState {
  if (state.phase !== "guess") return state;

  const round = state.rounds[state.currentRound];
  const deltaE = calculateDeltaE(round.target, guess);
  const timeMs = state.guessStartTime ? Date.now() - state.guessStartTime : 0;

  const score =
    state.mode === "blitz"
      ? calculateScoreWithSpeedBonus(deltaE, timeMs)
      : deltaEToScore(deltaE);

  const updatedRounds = [...state.rounds];
  updatedRounds[state.currentRound] = { ...round, guess, deltaE, score, timeMs };

  const completedRounds = updatedRounds.filter((r) => r.score !== null);
  const totalScore = completedRounds.reduce((sum, r) => sum + (r.score || 0), 0);
  const avgDeltaE =
    completedRounds.length > 0
      ? completedRounds.reduce((sum, r) => sum + (r.deltaE || 0), 0) / completedRounds.length
      : 0;

  return {
    ...state,
    phase: "reveal",
    rounds: updatedRounds,
    totalScore,
    avgDeltaE,
    guessStartTime: null,
  };
}

/**
 * Submit a guess for a gradient round.
 */
export function submitGradientGuess(
  state: GameState,
  guessStart: HSB,
  guessEnd: HSB
): GameState {
  if (state.phase !== "guess") return state;

  const round = state.gradientRounds[state.currentRound];
  const deltaEStart = calculateDeltaE(round.targetStart, guessStart);
  const deltaEEnd = calculateDeltaE(round.targetEnd, guessEnd);
  const scoreStart = deltaEToScore(deltaEStart);
  const scoreEnd = deltaEToScore(deltaEEnd);
  const score = Math.round((scoreStart + scoreEnd) / 2);
  const timeMs = state.guessStartTime ? Date.now() - state.guessStartTime : 0;

  const updatedGradientRounds = [...state.gradientRounds];
  updatedGradientRounds[state.currentRound] = {
    ...round,
    guessStart,
    guessEnd,
    deltaEStart,
    deltaEEnd,
    score,
    timeMs,
  };

  const completed = updatedGradientRounds.filter((r) => r.score !== null);
  const totalScore = completed.reduce((sum, r) => sum + (r.score || 0), 0);
  const avgDeltaE =
    completed.length > 0
      ? completed.reduce((sum, r) => sum + ((r.deltaEStart || 0) + (r.deltaEEnd || 0)) / 2, 0) / completed.length
      : 0;

  return {
    ...state,
    phase: "reveal",
    gradientRounds: updatedGradientRounds,
    totalScore,
    avgDeltaE,
    guessStartTime: null,
  };
}

/**
 * Advance to next round or summary.
 */
export function nextRound(state: GameState): GameState {
  if (state.phase !== "reveal") return state;

  const nextRoundIndex = state.currentRound + 1;
  const isLastRound = nextRoundIndex >= state.totalRounds;

  if (state.mode === "blitz" && (state.timeRemainingMs ?? 0) <= 0) {
    return { ...state, phase: "summary" };
  }

  if (isLastRound) {
    return { ...state, phase: "summary" };
  }

  return { ...state, phase: "memorize", currentRound: nextRoundIndex };
}

/**
 * Update blitz timer.
 */
export function updateBlitzTimer(state: GameState, elapsedMs: number): GameState {
  if (state.mode !== "blitz" || state.blitzTotalTimeMs === null) return state;

  const remaining = state.blitzTotalTimeMs - elapsedMs;
  if (remaining <= 0) {
    return { ...state, timeRemainingMs: 0, phase: "summary" };
  }
  return { ...state, timeRemainingMs: remaining };
}

/**
 * Get the current target color (non-gradient).
 */
export function getCurrentTarget(state: GameState): HSB | null {
  if (state.currentRound >= state.rounds.length) return null;
  return state.rounds[state.currentRound].target;
}

/**
 * Get the current gradient target (gradient mode).
 */
export function getCurrentGradientTarget(
  state: GameState
): { start: HSB; end: HSB } | null {
  if (state.currentRound >= state.gradientRounds.length) return null;
  const round = state.gradientRounds[state.currentRound];
  return { start: round.targetStart, end: round.targetEnd };
}

/**
 * Serialize completed game for submission.
 */
export function getResults(state: GameState): GameResults {
  if (state.mode === "gradient") {
    const completed = state.gradientRounds.filter((r) => r.score !== null);
    const totalTimeMs = completed.reduce((sum, r) => sum + (r.timeMs || 0), 0);
    // Build compatible rounds array for summary display
    const rounds: RoundData[] = completed.map((r) => ({
      target: r.targetStart,
      guess: r.guessStart,
      deltaE: ((r.deltaEStart || 0) + (r.deltaEEnd || 0)) / 2,
      score: r.score,
      timeMs: r.timeMs,
    }));

    return {
      mode: state.mode,
      difficulty: state.difficulty,
      rounds,
      gradientRounds: completed,
      totalScore: state.totalScore,
      avgDeltaE: state.avgDeltaE,
      totalTimeMs,
    };
  }

  const completedRounds = state.rounds.filter((r) => r.score !== null);
  const totalTimeMs = completedRounds.reduce((sum, r) => sum + (r.timeMs || 0), 0);

  return {
    mode: state.mode,
    difficulty: state.difficulty,
    rounds: completedRounds,
    totalScore: state.totalScore,
    avgDeltaE: state.avgDeltaE,
    totalTimeMs,
  };
}
