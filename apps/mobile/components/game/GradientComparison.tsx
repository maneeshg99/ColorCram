import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { HSB } from "@colorcram-v2/types";
import { hsbToHex } from "@colorcram-v2/color-utils";
import { Colors } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BAR_WIDTH = SCREEN_WIDTH - 80;

interface GradientComparisonProps {
  targetStart: HSB;
  targetEnd: HSB;
  guessStart: HSB;
  guessEnd: HSB;
}

export function GradientComparison({
  targetStart,
  targetEnd,
  guessStart,
  guessEnd,
}: GradientComparisonProps) {
  const c = Colors.dark;

  return (
    <View style={styles.container}>
      {/* Target */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: c.fgMuted }]}>TARGET</Text>
        <LinearGradient
          colors={[hsbToHex(targetStart), hsbToHex(targetEnd)] as any}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.bar, { width: BAR_WIDTH }]}
        />
      </View>

      {/* Guess */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: c.fgMuted }]}>YOURS</Text>
        <LinearGradient
          colors={[hsbToHex(guessStart), hsbToHex(guessEnd)] as any}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.bar, { width: BAR_WIDTH }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 20,
  },
  section: {
    alignItems: "flex-start",
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  bar: {
    height: 80,
    borderRadius: 20,
  },
});
