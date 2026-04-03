import { describe, it, expect } from "vitest";
import {
  createGame,
  startMemorize,
  startGuess,
  submitGuess,
  nextRound,
  getCurrentTarget,
  getResults,
} from "../engine";

describe("createGame", () => {
  it("creates a game in idle phase", () => {
    const state = createGame("classic", "easy");
    expect(state.phase).toBe("idle");
    expect(state.mode).toBe("classic");
    expect(state.difficulty).toBe("easy");
    expect(state.currentRound).toBe(0);
  });

  it("uses correct round count for difficulty", () => {
    expect(createGame("classic", "easy").totalRounds).toBe(5);
    expect(createGame("classic", "medium").totalRounds).toBe(5);
    expect(createGame("classic", "hard").totalRounds).toBe(8);
    expect(createGame("classic", "expert").totalRounds).toBe(5);
  });

  it("generates target colors for each round", () => {
    const state = createGame("classic", "easy");
    expect(state.rounds).toHaveLength(5);
    state.rounds.forEach((r) => {
      expect(r.target.h).toBeGreaterThanOrEqual(0);
      expect(r.target.h).toBeLessThan(360);
      expect(r.guess).toBeNull();
    });
  });

  it("is deterministic with same seed", () => {
    const s1 = createGame("classic", "easy", "test-seed");
    const s2 = createGame("classic", "easy", "test-seed");
    expect(s1.rounds.map((r) => r.target)).toEqual(s2.rounds.map((r) => r.target));
  });
});

describe("game flow", () => {
  it("transitions idle -> memorize -> guess -> reveal -> summary", () => {
    let state = createGame("classic", "easy", "flow-test");
    expect(state.phase).toBe("idle");

    state = startMemorize(state);
    expect(state.phase).toBe("memorize");

    state = startGuess(state);
    expect(state.phase).toBe("guess");

    const target = getCurrentTarget(state)!;
    // Guess the exact target for a perfect score
    state = submitGuess(state, target);
    expect(state.phase).toBe("reveal");
    expect(state.rounds[0].score).toBe(100);
    expect(state.rounds[0].deltaE).toBeCloseTo(0, 1);

    // Advance through remaining rounds
    for (let i = 1; i < state.totalRounds; i++) {
      state = nextRound(state);
      expect(state.phase).toBe("memorize");
      state = startGuess(state);
      const t = getCurrentTarget(state)!;
      state = submitGuess(state, t);
    }

    state = nextRound(state);
    expect(state.phase).toBe("summary");
  });

  it("calculates score based on color accuracy", () => {
    let state = createGame("classic", "easy", "score-test");
    state = startMemorize(state);
    state = startGuess(state);

    // Submit a very different color
    state = submitGuess(state, { h: 0, s: 100, b: 100 });
    const round = state.rounds[0];
    expect(round.score).not.toBeNull();
    expect(round.deltaE).not.toBeNull();
    expect(round.score!).toBeGreaterThanOrEqual(0);
    expect(round.score!).toBeLessThanOrEqual(100);
  });
});

describe("getResults", () => {
  it("returns results at summary phase", () => {
    let state = createGame("classic", "easy", "results-test");
    state = startMemorize(state);
    state = startGuess(state);
    const t = getCurrentTarget(state)!;
    state = submitGuess(state, t);

    for (let i = 1; i < state.totalRounds; i++) {
      state = nextRound(state);
      state = startMemorize(state);
      state = startGuess(state);
      const target = getCurrentTarget(state)!;
      state = submitGuess(state, target);
    }
    state = nextRound(state);

    const results = getResults(state);
    expect(results.mode).toBe("classic");
    expect(results.rounds).toHaveLength(5);
    expect(results.totalScore).toBe(500);
    expect(results.avgDeltaE).toBeCloseTo(0, 1);
  });
});
