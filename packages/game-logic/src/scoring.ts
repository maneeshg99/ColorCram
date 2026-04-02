import { ciede2000, hsbToLab } from "@colorguesser/color-utils";
import type { HSB } from "@colorguesser/types";

/**
 * Calculate the perceptual distance between two HSB colors
 * using CIEDE2000.
 */
export function calculateDeltaE(target: HSB, guess: HSB): number {
  const lab1 = hsbToLab(target);
  const lab2 = hsbToLab(guess);
  return ciede2000(lab1, lab2);
}

/**
 * Convert a Delta E value to a 0-100 percentage match score.
 * Uses a power-exponential curve: score = 100 * e^(-0.004 * deltaE^1.6)
 *
 * Generous for close matches, still punishing for bad guesses:
 *   DeltaE ~2:   99%  (imperceptible)
 *   DeltaE ~3.5: 97%  (near-perfect, comparable to dialed 4.8/5)
 *   DeltaE ~5:   93%  (excellent)
 *   DeltaE ~10:  85%  (great)
 *   DeltaE ~15:  74%  (good)
 *   DeltaE ~25:  50%  (mediocre)
 *   DeltaE ~50:  12%  (poor)
 *   DeltaE ~80+: ~1%  (opposite color)
 */
export function deltaEToScore(deltaE: number): number {
  return Math.round(100 * Math.exp(-0.004 * Math.pow(deltaE, 1.6)));
}

/**
 * Calculate score with optional speed bonus for blitz mode.
 * Speed bonus: up to 1.5x multiplier for fast guesses (< 3 seconds).
 */
export function calculateScoreWithSpeedBonus(
  deltaE: number,
  timeMs: number
): number {
  const baseScore = deltaEToScore(deltaE);
  const speedMultiplier = timeMs < 3000 ? 1 + 0.5 * (1 - timeMs / 3000) : 1;
  return Math.round(baseScore * speedMultiplier);
}
