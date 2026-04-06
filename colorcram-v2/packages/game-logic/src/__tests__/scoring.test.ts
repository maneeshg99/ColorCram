import { describe, it, expect } from "vitest";
import { calculateDeltaE, deltaEToScore, calculateScoreWithSpeedBonus } from "../scoring";

describe("calculateDeltaE", () => {
  it("returns 0 for identical colors", () => {
    const color = { h: 180, s: 50, b: 50 };
    expect(calculateDeltaE(color, color)).toBeCloseTo(0, 1);
  });

  it("returns small value for similar colors", () => {
    const a = { h: 180, s: 50, b: 50 };
    const b = { h: 182, s: 51, b: 49 };
    expect(calculateDeltaE(a, b)).toBeLessThan(5);
  });

  it("returns large value for very different colors", () => {
    const red = { h: 0, s: 100, b: 100 };
    const blue = { h: 240, s: 100, b: 100 };
    expect(calculateDeltaE(red, blue)).toBeGreaterThan(30);
  });
});

describe("deltaEToScore", () => {
  it("returns 100 for deltaE = 0", () => {
    expect(deltaEToScore(0)).toBe(100);
  });

  it("is generous for close matches (~93% at deltaE 5)", () => {
    expect(deltaEToScore(5)).toBeGreaterThanOrEqual(90);
  });

  it("returns lower scores for higher deltaE", () => {
    expect(deltaEToScore(5)).toBeGreaterThan(deltaEToScore(10));
    expect(deltaEToScore(10)).toBeGreaterThan(deltaEToScore(20));
    expect(deltaEToScore(20)).toBeGreaterThan(deltaEToScore(50));
  });

  it("punishes bad guesses (< 30% at deltaE 50)", () => {
    expect(deltaEToScore(50)).toBeLessThan(30);
  });

  it("approaches low scores for very large deltaE", () => {
    expect(deltaEToScore(100)).toBeLessThan(15);
  });

  it("rewards correct hue on saturated colors (hue recovery)", () => {
    const target = { h: 0, s: 90, b: 80 };
    const guessRightHue = { h: 0, s: 90, b: 40 }; // right hue, wrong brightness
    const guessWrongHue = { h: 60, s: 90, b: 40 }; // wrong hue, wrong brightness

    const deltaERight = calculateDeltaE(target, guessRightHue);
    const deltaEWrong = calculateDeltaE(target, guessWrongHue);

    const scoreRight = deltaEToScore(deltaERight, target, guessRightHue);
    const scoreWrong = deltaEToScore(deltaEWrong, target, guessWrongHue);

    // Right hue should score higher even if deltaE is similar
    expect(scoreRight).toBeGreaterThan(scoreWrong);
  });

  it("applies hue penalty for very wrong hue on vivid colors", () => {
    const target = { h: 120, s: 90, b: 80 };
    const guess = { h: 240, s: 90, b: 80 }; // opposite hue

    const deltaE = calculateDeltaE(target, guess);
    const scoreWithHue = deltaEToScore(deltaE, target, guess);
    const scoreBase = deltaEToScore(deltaE); // no hue adjustment

    // Hue penalty should reduce score for very wrong hue
    expect(scoreWithHue).toBeLessThanOrEqual(scoreBase);
  });

  it("does not apply hue adjustments for desaturated colors", () => {
    const target = { h: 0, s: 5, b: 50 };
    const guess = { h: 180, s: 5, b: 50 }; // opposite hue but very desaturated

    const deltaE = calculateDeltaE(target, guess);
    const scoreWithHue = deltaEToScore(deltaE, target, guess);
    const scoreBase = deltaEToScore(deltaE);

    // For desaturated colors, hue adjustments should be minimal
    expect(Math.abs(scoreWithHue - scoreBase)).toBeLessThan(3);
  });
});

describe("calculateScoreWithSpeedBonus", () => {
  it("gives no bonus for slow guesses (>= 3s)", () => {
    const base = deltaEToScore(5);
    expect(calculateScoreWithSpeedBonus(5, 3000)).toBe(base);
    expect(calculateScoreWithSpeedBonus(5, 5000)).toBe(base);
  });

  it("gives bonus for fast guesses (< 3s)", () => {
    const base = deltaEToScore(5);
    expect(calculateScoreWithSpeedBonus(5, 1000)).toBeGreaterThan(base);
  });

  it("gives max 1.5x bonus for instant guess", () => {
    const base = deltaEToScore(5);
    expect(calculateScoreWithSpeedBonus(5, 0)).toBe(Math.min(100, Math.round(base * 1.5)));
  });
});
