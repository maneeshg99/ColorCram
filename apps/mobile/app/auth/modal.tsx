import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";

export default function AuthModal() {
  const router = useRouter();
  const c = Colors.dark;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.surface }]}>
      <Text style={[styles.title, { color: c.fg }]}>Sign In</Text>
      <Text style={[styles.subtitle, { color: c.fgMuted }]}>
        Account system coming soon to mobile
      </Text>
      <Button title="Close" variant="secondary" onPress={() => router.back()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16, padding: 20 },
  title: { fontSize: 24, fontWeight: "900" },
  subtitle: { fontSize: 14, textAlign: "center" },
});
