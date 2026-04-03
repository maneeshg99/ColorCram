import React from "react";
import { Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";

const FEEDBACK_POOLS: Record<string, string[]> = {
  perfect: ["Are you even human?", "Pixel-perfect. Literally.", "The color gods bow to you."],
  great: ["Almost creepy how close that is.", "Your cones are firing on all cylinders.", "Impressively dialed."],
  good: ["Not bad. Monitor calibrated?", "Getting warmer...", "You've got the eye."],
  fair: ["Points for confidence.", "That's... a color, alright.", "The vibes are there at least."],
  poor: ["Were your eyes open?", "Bold strategy, going for the opposite.", "The color wheel weeps."],
};

function getTier(score: number): string {
  if (score >= 97) return "perfect";
  if (score >= 90) return "great";
  if (score >= 70) return "good";
  if (score >= 40) return "fair";
  return "poor";
}

export function ScoreFeedback({ score, roundIndex }: { score: number; roundIndex: number }) {
  const pool = FEEDBACK_POOLS[getTier(score)];
  const message = pool[roundIndex % pool.length];
  return <Text style={styles.text}>{message}</Text>;
}

const styles = StyleSheet.create({
  text: { fontSize: 14, fontStyle: "italic", color: Colors.dark.fgMuted, textAlign: "center", maxWidth: 280 },
});
