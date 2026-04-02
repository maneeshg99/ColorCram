import type { HSB } from "@colorguesser/types";

/**
 * Linearly interpolate between two HSB colors.
 * Handles hue wraparound (e.g., 350 -> 10 goes through 0).
 */
export function interpolateHsb(start: HSB, end: HSB, t: number): HSB {
  // Shortest path hue interpolation
  let dh = end.h - start.h;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;

  let h = start.h + dh * t;
  if (h < 0) h += 360;
  if (h >= 360) h -= 360;

  return {
    h,
    s: start.s + (end.s - start.s) * t,
    b: start.b + (end.b - start.b) * t,
  };
}

/**
 * Generate an array of N evenly-spaced colors along a gradient.
 */
export function sampleGradient(start: HSB, end: HSB, steps: number): HSB[] {
  const colors: HSB[] = [];
  for (let i = 0; i < steps; i++) {
    colors.push(interpolateHsb(start, end, i / (steps - 1)));
  }
  return colors;
}
