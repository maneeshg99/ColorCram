import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { HSB } from "@colorcram-v2/types";
import { hsbToHex, hsbToRgb } from "@colorcram-v2/color-utils";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWATCH_SIZE = Math.min(SCREEN_WIDTH - 48, SCREEN_HEIGHT * 0.45);

function getLuminance(hsb: HSB): number {
  const rgb = hsbToRgb(hsb);
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

interface GradientDisplayProps {
  startColor: HSB;
  endColor: HSB;
}

export function GradientDisplay({ startColor, endColor }: GradientDisplayProps) {
  const startHex = hsbToHex(startColor);
  const endHex = hsbToHex(endColor);

  // Use midpoint luminance for contrast
  const midColor: HSB = {
    h: (startColor.h + endColor.h) / 2,
    s: (startColor.s + endColor.s) / 2,
    b: (startColor.b + endColor.b) / 2,
  };
  const textColor = getLuminance(midColor) > 0.35 ? "#000" : "#fff";

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[startHex, endHex] as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.swatch, { width: SWATCH_SIZE, height: SWATCH_SIZE }]}
      >
        <Text style={[styles.label, { color: textColor }]}>MEMORIZE</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    marginBottom: 8,
  },
  swatch: {
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 4,
    textTransform: "uppercase",
    opacity: 0.5,
  },
});
