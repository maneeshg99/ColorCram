import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { HSB } from "@colorcram-v2/types";
import { hsbToHex } from "@colorcram-v2/color-utils";
import { HSBColorPicker } from "./HSBColorPicker";
import { Colors } from "@/constants/theme";

interface DualHSBPickerProps {
  startValue: HSB;
  endValue: HSB;
  onStartChange: (hsb: HSB) => void;
  onEndChange: (hsb: HSB) => void;
  rightContent?: React.ReactNode;
}

export function DualHSBPicker({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  rightContent,
}: DualHSBPickerProps) {
  const [activeTab, setActiveTab] = useState<"start" | "end">("start");
  const activeValue = activeTab === "start" ? startValue : endValue;
  const activeOnChange = activeTab === "start" ? onStartChange : onEndChange;

  const startHex = hsbToHex(startValue);
  const endHex = hsbToHex(endValue);
  const c = Colors.dark;

  return (
    <View style={styles.container}>
      {/* Tab switcher */}
      <View style={styles.tabs}>
        <Pressable onPress={() => setActiveTab("start")} style={styles.tabBtn}>
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === "start" ? c.fg : c.fgMuted,
                fontWeight: activeTab === "start" ? "700" : "500",
              },
            ]}
          >
            Start Color
          </Text>
          <View
            style={[
              styles.tabIndicator,
              {
                backgroundColor:
                  activeTab === "start" ? c.fg : "transparent",
              },
            ]}
          />
        </Pressable>
        <Pressable onPress={() => setActiveTab("end")} style={styles.tabBtn}>
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === "end" ? c.fg : c.fgMuted,
                fontWeight: activeTab === "end" ? "700" : "500",
              },
            ]}
          >
            End Color
          </Text>
          <View
            style={[
              styles.tabIndicator,
              {
                backgroundColor:
                  activeTab === "end" ? c.fg : "transparent",
              },
            ]}
          />
        </Pressable>
      </View>

      {/* Gradient preview bar */}
      <LinearGradient
        colors={[startHex, endHex] as any}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradientBar}
      />

      {/* HSB Picker for active color — pass rightContent through */}
      <HSBColorPicker
        value={activeValue}
        onChange={activeOnChange}
        rightContent={rightContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 10,
  },
  tabs: {
    flexDirection: "row",
    gap: 24,
  },
  tabBtn: {
    alignItems: "center",
    paddingVertical: 4,
  },
  tabText: {
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  tabIndicator: {
    height: 2,
    width: "100%",
    marginTop: 4,
    borderRadius: 1,
  },
  gradientBar: {
    width: 330,
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
});
