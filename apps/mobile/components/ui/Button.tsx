import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

export function Button({ title, onPress, variant = "primary", size = "md" }: ButtonProps) {
  const c = Colors.dark;
  const isPrimary = variant === "primary";

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

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        sizeStyle,
        isPrimary
          ? { backgroundColor: c.accent }
          : { borderWidth: 1, borderColor: c.border },
        pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
      ]}
    >
      <Text
        style={[
          styles.text,
          textSize,
          { color: isPrimary ? c.bg : c.fg },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 10, alignItems: "center", justifyContent: "center" },
  text: { fontWeight: "700" },
});
