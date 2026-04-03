import { create } from "zustand";
import type { HSB, GameMode, Difficulty, GameState, GameResults } from "@colorguesser/types";
import {
  createGame,
  startMemorize,
  startGuess,
  submitGuess,
  submitGradientGuess,
  nextRound,
  updateBlitzTimer,
  getCurrentTarget,
  getCurrentGradientTarget,
  getResults,
} from "@colorguesser/game-logic";

interface GameStore {
  state: GameState | null;
  currentGuess: HSB;
  currentGuessStart: HSB;
  currentGuessEnd: HSB;
  newGame: (mode: GameMode, difficulty: Difficulty, seed?: string) => void;
  beginMemorize: () => void;
  beginGuess: () => void;
  setGuess: (hsb: HSB) => void;
  setGuessStart: (hsb: HSB) => void;
  setGuessEnd: (hsb: HSB) => void;
  confirmGuess: () => void;
  confirmGradientGuess: () => void;
  advance: () => void;
  tickBlitz: (elapsedMs: number) => void;
  getTarget: () => HSB | null;
  getGradientTarget: () => { start: HSB; end: HSB } | null;
  getGameResults: () => GameResults | null;
  reset: () => void;
}

const DEFAULT_GUESS: HSB = { h: 180, s: 50, b: 50 };

export const useGameStore = create<GameStore>((set, get) => ({
  state: null,
  currentGuess: { ...DEFAULT_GUESS },
  currentGuessStart: { ...DEFAULT_GUESS },
  currentGuessEnd: { ...DEFAULT_GUESS },

  newGame: (mode, difficulty, seed) => {
    set({
      state: createGame(mode, difficulty, seed),
      currentGuess: { ...DEFAULT_GUESS },
      currentGuessStart: { ...DEFAULT_GUESS },
      currentGuessEnd: { ...DEFAULT_GUESS },
    });
  },

  beginMemorize: () => {
    const { state } = get();
    if (!state) return;
    set({ state: startMemorize(state) });
  },

  beginGuess: () => {
    const { state } = get();
    if (!state) return;
    set({
      state: startGuess(state),
      currentGuess: { ...DEFAULT_GUESS },
      currentGuessStart: { ...DEFAULT_GUESS },
      currentGuessEnd: { ...DEFAULT_GUESS },
    });
  },

  setGuess: (hsb) => set({ currentGuess: hsb }),
  setGuessStart: (hsb) => set({ currentGuessStart: hsb }),
  setGuessEnd: (hsb) => set({ currentGuessEnd: hsb }),

  confirmGuess: () => {
    const { state, currentGuess } = get();
    if (!state) return;
    set({ state: submitGuess(state, currentGuess) });
  },

  confirmGradientGuess: () => {
    const { state, currentGuessStart, currentGuessEnd } = get();
    if (!state) return;
    set({ state: submitGradientGuess(state, currentGuessStart, currentGuessEnd) });
  },

  advance: () => {
    const { state } = get();
    if (!state) return;
    set({ state: nextRound(state) });
  },

  tickBlitz: (elapsedMs) => {
    const { state, currentGuess } = get();
    if (!state || state.mode !== "blitz") return;
    const updated = updateBlitzTimer(state, elapsedMs);
    if (updated.phase === "summary" && state.phase === "guess") {
      const submitted = submitGuess(state, currentGuess);
      set({ state: { ...submitted, phase: "summary", timeRemainingMs: 0 } });
    } else {
      set({ state: updated });
    }
  },

  getTarget: () => {
    const { state } = get();
    if (!state) return null;
    return getCurrentTarget(state);
  },

  getGradientTarget: () => {
    const { state } = get();
    if (!state) return null;
    return getCurrentGradientTarget(state);
  },

  getGameResults: () => {
    const { state } = get();
    if (!state || state.phase !== "summary") return null;
    return getResults(state);
  },

  reset: () => {
    set({
      state: null,
      currentGuess: { ...DEFAULT_GUESS },
      currentGuessStart: { ...DEFAULT_GUESS },
      currentGuessEnd: { ...DEFAULT_GUESS },
    });
  },
}));
