import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({ title, onPress, variant = "primary", size = "md" }: ButtonProps) {
  const c = Colors.dark;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const sizeStyle: ViewStyle =
    size === "lg" ? { paddingHorizontal: 32, paddingVertical: 16 }
    : size === "sm" ? { paddingHorizontal: 14, paddingVertical: 8 }
    : { paddingHorizontal: 22, paddingVertical: 12 };

  const textSize: TextStyle =
    size === "lg" ? { fontSize: 16 }
    : size === "sm" ? { fontSize: 13 }
    : { fontSize: 14 };

  const variantStyle: ViewStyle =
    variant === "primary"
      ? { backgroundColor: c.accent }
      : variant === "secondary"
      ? { borderWidth: 1, borderColor: c.border }
      : {};

  const textColor =
    variant === "primary" ? c.bg
    : variant === "ghost" ? c.fgMuted
    : c.fg;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        variant !== "ghost" && sizeStyle,
        variant === "ghost" && { paddingVertical: 8 },
        variantStyle,
        pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
      ]}
    >
      <Text
        style={[
          styles.text,
          textSize,
          { color: textColor },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 8, alignItems: "center", justifyContent: "center" },
  text: { fontWeight: "700" },
});
