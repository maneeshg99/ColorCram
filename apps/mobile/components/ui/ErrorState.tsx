import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { Button } from "@/components/ui/Button";
import { Colors } from "@/constants/theme";

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
  icon?: React.ReactNode;
}

export function ErrorState({ title, message, onRetry, icon }: ErrorStateProps) {
  const c = Colors.dark;
  return (
    <View style={styles.container}>
      {icon}
      <Text style={[styles.title, { color: c.fg }]}>{title}</Text>
      <Text style={[styles.message, { color: c.fgMuted }]}>{message}</Text>
      {onRetry && (
        <View style={styles.button}>
          <Button title="Try Again" variant="secondary" onPress={onRetry} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  button: {
    marginTop: 20,
  },
});
