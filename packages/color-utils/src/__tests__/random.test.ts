import { describe, it, expect } from "vitest";
import { mulberry32, stringToSeed, generateColors } from "../random";

describe("mulberry32", () => {
  it("produces deterministic output for same seed", () => {
    const rng1 = mulberry32(42);
    const rng2 = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      expect(rng1()).toBe(rng2());
    }
  });

  it("produces different output for different seeds", () => {
    const rng1 = mulberry32(42);
    const rng2 = mulberry32(43);
    expect(rng1()).not.toBe(rng2());
  });

  it("produces values between 0 and 1", () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("generateColors", () => {
  it("generates the correct number of colors", () => {
    const colors = generateColors(5, "test");
    expect(colors).toHaveLength(5);
  });

  it("is deterministic for same seed", () => {
    const c1 = generateColors(5, "2026-04-01");
    const c2 = generateColors(5, "2026-04-01");
    expect(c1).toEqual(c2);
  });

  it("produces different colors for different seeds", () => {
    const c1 = generateColors(5, "2026-04-01");
    const c2 = generateColors(5, "2026-04-02");
    expect(c1).not.toEqual(c2);
  });

  it("generates valid HSB ranges", () => {
    const colors = generateColors(100, "range-test");
    for (const c of colors) {
      expect(c.h).toBeGreaterThanOrEqual(0);
      expect(c.h).toBeLessThan(360);
      expect(c.s).toBeGreaterThanOrEqual(30);
      expect(c.s).toBeLessThanOrEqual(90);
      expect(c.b).toBeGreaterThanOrEqual(30);
      expect(c.b).toBeLessThanOrEqual(90);
    }
  });
});

describe("stringToSeed", () => {
  it("produces consistent seeds", () => {
    expect(stringToSeed("hello")).toBe(stringToSeed("hello"));
  });

  it("produces different seeds for different strings", () => {
    expect(stringToSeed("hello")).not.toBe(stringToSeed("world"));
  });
});
