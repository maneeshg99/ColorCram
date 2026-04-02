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

  it("is generous for close matches (~97% at deltaE 3.5)", () => {
    expect(deltaEToScore(3.5)).toBeGreaterThanOrEqual(95);
  });

  it("returns lower scores for higher deltaE", () => {
    expect(deltaEToScore(5)).toBeGreaterThan(deltaEToScore(10));
    expect(deltaEToScore(10)).toBeGreaterThan(deltaEToScore(20));
    expect(deltaEToScore(20)).toBeGreaterThan(deltaEToScore(50));
  });

  it("punishes opposite colors (< 15% at deltaE 50)", () => {
    expect(deltaEToScore(50)).toBeLessThan(15);
  });

  it("approaches 0 for very large deltaE", () => {
    expect(deltaEToScore(100)).toBeLessThan(2);
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
    expect(calculateScoreWithSpeedBonus(5, 0)).toBe(Math.round(base * 1.5));
  });
});
