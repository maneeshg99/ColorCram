import { describe, it, expect } from "vitest";
import { ciede2000 } from "../delta-e";
import type { LAB } from "@colorcram-v2/types";

describe("ciede2000", () => {
  it("returns 0 for identical colors", () => {
    const lab: LAB = { l: 50, a: 25, b: -10 };
    expect(ciede2000(lab, lab)).toBeCloseTo(0, 5);
  });

  it("returns small value for very similar colors", () => {
    const lab1: LAB = { l: 50, a: 2.6772, b: -79.7751 };
    const lab2: LAB = { l: 50, a: 0, b: -82.7485 };
    // Published CIEDE2000 test pair: expected ΔE ≈ 2.0425
    expect(ciede2000(lab1, lab2)).toBeCloseTo(2.0425, 1);
  });

  it("returns larger value for different colors", () => {
    const red: LAB = { l: 53.23, a: 80.11, b: 67.22 };
    const blue: LAB = { l: 32.3, a: 79.2, b: -107.86 };
    const de = ciede2000(red, blue);
    expect(de).toBeGreaterThan(50);
  });

  it("is symmetric", () => {
    const a: LAB = { l: 50, a: 25, b: -10 };
    const b: LAB = { l: 73, a: -20, b: 55 };
    expect(ciede2000(a, b)).toBeCloseTo(ciede2000(b, a), 10);
  });

  // Additional published test pairs from the CIE technical report
  it("handles achromatic colors", () => {
    const lab1: LAB = { l: 50, a: 0, b: 0 };
    const lab2: LAB = { l: 50, a: -1, b: 2 };
    const de = ciede2000(lab1, lab2);
    expect(de).toBeCloseTo(2.3669, 1);
  });

  it("handles near-black colors", () => {
    const lab1: LAB = { l: 2, a: 0, b: 0 };
    const lab2: LAB = { l: 5, a: 0, b: 0 };
    const de = ciede2000(lab1, lab2);
    expect(de).toBeGreaterThan(0);
    expect(de).toBeLessThan(5);
  });
});
