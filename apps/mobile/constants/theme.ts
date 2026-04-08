export const Colors = {
  dark: {
    bg: "#131313",
    fg: "#ffffff",
    fgMuted: "#adadad",
    fgSubtle: "#666666",
    surface: "#1f1f1f",
    surfaceElevated: "#2a2a2a",
    border: "#2a2a2a",
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
    perfect: "#14b861",
    great: "#ffe103",
    good: "#ff9500",
    poor: "#ff3b3b",
  },
};

export function getScoreColor(score: number): string {
  if (score >= 90) return Colors.score.perfect;
  if (score >= 70) return Colors.score.great;
  if (score >= 40) return Colors.score.good;
  return Colors.score.poor;
}
