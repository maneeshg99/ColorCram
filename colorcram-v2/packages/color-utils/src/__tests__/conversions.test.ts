import { describe, it, expect } from "vitest";
import { hsbToRgb, rgbToHsb, hsbToLab, hsbToHex } from "../conversions";

describe("hsbToRgb", () => {
  it("converts pure red", () => {
    expect(hsbToRgb({ h: 0, s: 100, b: 100 })).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("converts pure green", () => {
    expect(hsbToRgb({ h: 120, s: 100, b: 100 })).toEqual({ r: 0, g: 255, b: 0 });
  });

  it("converts pure blue", () => {
    expect(hsbToRgb({ h: 240, s: 100, b: 100 })).toEqual({ r: 0, g: 0, b: 255 });
  });

  it("converts white", () => {
    expect(hsbToRgb({ h: 0, s: 0, b: 100 })).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("converts black", () => {
    expect(hsbToRgb({ h: 0, s: 0, b: 0 })).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("converts mid-gray", () => {
    const rgb = hsbToRgb({ h: 0, s: 0, b: 50 });
    expect(rgb.r).toBeCloseTo(128, 0);
    expect(rgb.g).toBeCloseTo(128, 0);
    expect(rgb.b).toBeCloseTo(128, 0);
  });
});

describe("rgbToHsb", () => {
  it("converts pure red", () => {
    const hsb = rgbToHsb({ r: 255, g: 0, b: 0 });
    expect(hsb.h).toBeCloseTo(0, 0);
    expect(hsb.s).toBeCloseTo(100, 0);
    expect(hsb.b).toBeCloseTo(100, 0);
  });

  it("round-trips correctly", () => {
    const original = { h: 210, s: 75, b: 80 };
    const rgb = hsbToRgb(original);
    const roundTripped = rgbToHsb(rgb);
    expect(roundTripped.h).toBeCloseTo(original.h, 0);
    expect(roundTripped.s).toBeCloseTo(original.s, 0);
    expect(roundTripped.b).toBeCloseTo(original.b, 0);
  });
});

describe("hsbToLab", () => {
  it("converts white to L=100", () => {
    const lab = hsbToLab({ h: 0, s: 0, b: 100 });
    expect(lab.l).toBeCloseTo(100, 0);
    expect(lab.a).toBeCloseTo(0, 0);
    expect(lab.b).toBeCloseTo(0, 0);
  });

  it("converts black to L=0", () => {
    const lab = hsbToLab({ h: 0, s: 0, b: 0 });
    expect(lab.l).toBeCloseTo(0, 0);
  });

  it("red has positive a", () => {
    const lab = hsbToLab({ h: 0, s: 100, b: 100 });
    expect(lab.a).toBeGreaterThan(0);
  });
});

describe("hsbToHex", () => {
  it("converts pure red", () => {
    expect(hsbToHex({ h: 0, s: 100, b: 100 })).toBe("#ff0000");
  });

  it("converts white", () => {
    expect(hsbToHex({ h: 0, s: 0, b: 100 })).toBe("#ffffff");
  });

  it("converts black", () => {
    expect(hsbToHex({ h: 0, s: 0, b: 0 })).toBe("#000000");
  });
});
