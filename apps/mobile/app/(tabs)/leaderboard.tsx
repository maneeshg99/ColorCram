import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";

export default function LeaderboardTab() {
  const c = Colors.dark;
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      <Text style={[styles.title, { color: c.fg }]}>Leaderboard</Text>
      <Text style={[styles.subtitle, { color: c.fgMuted }]}>
        Coming soon to mobile
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 8 },
});
