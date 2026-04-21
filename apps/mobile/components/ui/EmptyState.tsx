import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { Button } from "@/components/ui/Button";
import { Colors } from "@/constants/theme";

interface EmptyStateProps {
  title: string;
  message: string;
  action?: { label: string; onPress: () => void };
  icon?: React.ReactNode;
}

export function EmptyState({ title, message, action, icon }: EmptyStateProps) {
  const c = Colors.dark;
  return (
    <View style={styles.container}>
      {icon}
      <Text style={[styles.title, { color: c.fg }]}>{title}</Text>
      <Text style={[styles.message, { color: c.fgMuted }]}>{message}</Text>
      {action && (
        <View style={styles.button}>
          <Button title={action.label} variant="primary" onPress={action.onPress} />
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
