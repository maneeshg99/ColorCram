import type { HSB } from "@colorguesser/types";

/**
 * Mulberry32 seeded PRNG.
 * Same seed always produces the same sequence.
 */
export function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Convert a string to a numeric seed via simple hash.
 */
export function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

/**
 * Generate a date-based seed string (e.g., "2026-04-01").
 */
export function dateSeed(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

/**
 * Generate N random HSB colors using a seeded PRNG.
 * Colors are spread across the hue spectrum with decent saturation and brightness
 * to ensure they're visually distinct and challenging.
 */
export function generateColors(count: number, seed: string): HSB[] {
  const rng = mulberry32(stringToSeed(seed));
  const colors: HSB[] = [];

  for (let i = 0; i < count; i++) {
    colors.push({
      h: Math.floor(rng() * 360),
      s: Math.floor(rng() * 60 + 30), // 30-90 range for visible saturation
      b: Math.floor(rng() * 60 + 30), // 30-90 range for visible brightness
    });
  }

  return colors;
}

/**
 * Generate N gradient pairs (start + end HSB colors).
 * Endpoints have 30-210° hue separation for visually interesting gradients.
 */
export function generateGradientPairs(
  count: number,
  seed: string
): Array<{ start: HSB; end: HSB }> {
  const rng = mulberry32(stringToSeed(seed + "-gradient"));
  const pairs: Array<{ start: HSB; end: HSB }> = [];

  for (let i = 0; i < count; i++) {
    const startH = Math.floor(rng() * 360);
    const hueSep = Math.floor(rng() * 180 + 30); // 30-210° separation
    const endH = (startH + hueSep) % 360;

    pairs.push({
      start: {
        h: startH,
        s: Math.floor(rng() * 50 + 40), // 40-90
        b: Math.floor(rng() * 50 + 40), // 40-90
      },
      end: {
        h: endH,
        s: Math.floor(rng() * 50 + 40),
        b: Math.floor(rng() * 50 + 40),
      },
    });
  }

  return pairs;
}
