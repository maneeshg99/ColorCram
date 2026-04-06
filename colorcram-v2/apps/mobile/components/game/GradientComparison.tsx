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
        <View style={[styles.hexRow, { width: BAR_WIDTH }]}>
          <Text style={[styles.hex, { color: c.fgMuted }]}>
            {hsbToHex(targetStart)}
          </Text>
          <Text style={[styles.hex, { color: c.fgMuted }]}>
            {hsbToHex(targetEnd)}
          </Text>
        </View>
      </View>

      {/* Guess */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: c.fgMuted }]}>YOUR GUESS</Text>
        <LinearGradient
          colors={[hsbToHex(guessStart), hsbToHex(guessEnd)] as any}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.bar, { width: BAR_WIDTH }]}
        />
        <View style={[styles.hexRow, { width: BAR_WIDTH }]}>
          <Text style={[styles.hex, { color: c.fgMuted }]}>
            {hsbToHex(guessStart)}
          </Text>
          <Text style={[styles.hex, { color: c.fgMuted }]}>
            {hsbToHex(guessEnd)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 16,
    marginVertical: 8,
  },
  section: {
    alignItems: "flex-start",
  },
  label: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  bar: {
    height: 72,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  hexRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  hex: {
    fontSize: 11,
    fontFamily: "monospace",
  },
});
