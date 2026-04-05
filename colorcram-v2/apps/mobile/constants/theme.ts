export const Colors = {
  dark: {
    bg: "#000000",
    fg: "#ffffff",
    fgMuted: "#737373",
    fgSubtle: "#525252",
    surface: "#0a0a0a",
    surfaceElevated: "#141414",
    border: "#1f1f1f",
    accent: "#ffffff",
  },
  light: {
    bg: "#ffffff",
    fg: "#000000",
    fgMuted: "#737373",
    fgSubtle: "#a3a3a3",
    surface: "#f5f5f5",
    surfaceElevated: "#e5e5e5",
    border: "#e5e5e5",
    accent: "#000000",
  },
  score: {
    perfect: "#22c55e",
    great: "#84cc16",
    good: "#eab308",
    fair: "#f97316",
    poor: "#ef4444",
  },
};

export function getScoreColor(score: number): string {
  if (score >= 97) return Colors.score.perfect;
  if (score >= 90) return Colors.score.great;
  if (score >= 70) return Colors.score.good;
  if (score >= 40) return Colors.score.fair;
  return Colors.score.poor;
}
