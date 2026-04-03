import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";

const EXPERT_WARNINGS = [
  "Your confidence is inspiring. Your accuracy? We'll see.",
  "Bold move. Hope your cones are warmed up.",
  "Expert mode doesn't grade on a curve. Just saying.",
  "5 rounds. 2 seconds each. No mercy.",
  "You sure? The colors don't get easier, the timer gets shorter.",
  "Most people regret this. Just so you know.",
  "The leaderboard remembers everything.",
  "Statistically, you will be humbled.",
];

let warningIdx = 0;

export default function PlayTab() {
  const router = useRouter();
  const c = Colors.dark;

  const handleExpert = () => {
    const msg = EXPERT_WARNINGS[warningIdx % EXPERT_WARNINGS.length];
    warningIdx++;
    Alert.alert("Expert Mode", `"${msg}"`, [
      { text: "Maybe not", style: "cancel" },
      {
        text: "Bring it on",
        onPress: () =>
          router.push("/game/classic?difficulty=expert" as any),
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      <Text style={[styles.title, { color: c.fg }]}>
        Color<Text style={{ opacity: 0.4 }}>Guesser</Text>
      </Text>
      <Text style={[styles.subtitle, { color: c.fgMuted }]}>
        Memorize colors. Recreate them from memory.
      </Text>

      <View style={styles.modes}>
        <ModeCard
          title="Classic"
          description="Memorize and recreate at your own pace"
          onPress={() => null}
          buttons={
            <View style={styles.diffRow}>
              <Pressable
                style={[styles.diffBtn, { borderColor: c.border }]}
                onPress={() =>
                  router.push("/game/classic?difficulty=easy" as any)
                }
              >
                <Text style={[styles.diffText, { color: c.fg }]}>Easy</Text>
              </Pressable>
              <Pressable
                style={[styles.diffBtn, { borderColor: c.border }]}
                onPress={handleExpert}
              >
                <Text style={[styles.diffText, { color: c.fg }]}>Expert</Text>
              </Pressable>
            </View>
          }
        />
        <ModeCard
          title="Daily"
          description="Same colors for everyone. One shot."
          onPress={() => router.push("/game/daily" as any)}
        />
        <ModeCard
          title="Blitz"
          description="60 seconds. As many as you can."
          onPress={() => router.push("/game/blitz" as any)}
        />
        <ModeCard
          title="Gradient"
          description="Recreate gradients, not just flats"
          onPress={() => router.push("/game/gradient" as any)}
        />
      </View>
    </SafeAreaView>
  );
}

function ModeCard({
  title,
  description,
  onPress,
  buttons,
}: {
  title: string;
  description: string;
  onPress: () => void;
  buttons?: React.ReactNode;
}) {
  const c = Colors.dark;
  return (
    <Pressable
      style={[styles.card, { borderColor: c.border }]}
      onPress={buttons ? undefined : onPress}
    >
      <Text style={[styles.cardTitle, { color: c.fg }]}>{title}</Text>
      <Text style={[styles.cardDesc, { color: c.fgMuted }]}>{description}</Text>
      {buttons}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  subtitle: { fontSize: 14, marginTop: 8, marginBottom: 28 },
  modes: { gap: 12 },
  card: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardTitle: { fontSize: 18, fontWeight: "800", marginBottom: 4 },
  cardDesc: { fontSize: 13 },
  diffRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  diffBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  diffText: { fontSize: 13, fontWeight: "600" },
});
