import { ciede2000, hsbToLab } from "@colorcram-v2/color-utils";
import type { HSB } from "@colorcram-v2/types";

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
 * Calculate the circular hue difference between two HSB colors (0-180).
 */
function hueDifference(target: HSB, guess: HSB): number {
  let diff = Math.abs(target.h - guess.h);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

/**
 * Convert a Delta E value to a 0-100 percentage match score
 * using a Dialed-style sigmoid base with hue recovery and penalty.
 *
 * Base score uses a sigmoid curve: 100 / (1 + (dE / 25.25)^1.55)
 *
 * Hue recovery: rewards getting the hue right even when brightness/saturation
 * is off. Only applies to saturated colors (where hue is perceptually meaningful).
 *
 * Hue penalty: punishes getting the hue very wrong on vivid, saturated colors
 * (where a hue miss is very obvious to the eye).
 *
 * Approximate score ranges:
 *   DeltaE ~0:    100%  (perfect)
 *   DeltaE ~2:    98%   (imperceptible)
 *   DeltaE ~5:    93%   (excellent)
 *   DeltaE ~10:   80%   (great)
 *   DeltaE ~15:   64%   (good)
 *   DeltaE ~25:   41%   (mediocre)
 *   DeltaE ~50:   14%   (poor)
 *   DeltaE ~80+:  ~5%   (opposite color)
 */
export function deltaEToScore(
  deltaE: number,
  target?: HSB,
  guess?: HSB
): number {
  // Base score: sigmoid curve scaled to 0-100
  const base = 100 / (1 + Math.pow(deltaE / 25.25, 1.55));

  // If no HSB values provided, return base score only
  if (!target || !guess) {
    return Math.round(base);
  }

  const hueDiff = hueDifference(target, guess);
  const avgSat = (target.s + guess.s) / 2;

  // Hue recovery: reward getting the hue right even if brightness/sat is off
  // Only meaningful for saturated colors (avgSat > ~30)
  const recovery =
    (100 - base) *
    Math.max(0, 1 - Math.pow(hueDiff / 25, 1.5)) *
    Math.min(1, avgSat / 30) *
    0.25;

  // Hue penalty: punish wrong hue on saturated colors (hueDiff > 30°)
  const penalty =
    base *
    Math.max(0, (hueDiff - 30) / 150) *
    Math.min(1, avgSat / 40) *
    0.15;

  const final = Math.max(0, Math.min(100, base + recovery - penalty));
  return Math.round(final);
}

/**
 * Calculate score with optional speed bonus for blitz mode.
 * Speed bonus: up to 1.5x multiplier for fast guesses (< 3 seconds).
 */
export function calculateScoreWithSpeedBonus(
  deltaE: number,
  timeMs: number,
  target?: HSB,
  guess?: HSB
): number {
  const baseScore = deltaEToScore(deltaE, target, guess);
  const speedMultiplier = timeMs < 3000 ? 1 + 0.5 * (1 - timeMs / 3000) : 1;
  return Math.min(100, Math.round(baseScore * speedMultiplier));
}
