import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { Colors } from "@/constants/theme";
import { RainbowRing } from "@/components/ui/RainbowRing";

export const APP_VERSION = "1.0.0";

const modes = [
  {
    id: "classic",
    label: "Classic",
    description: "Memorize. Guess. Repeat.",
    route: "/game/classic",
  },
  {
    id: "daily",
    label: "Daily",
    description: "Same colors. Everyone. Every day.",
    route: "/game/daily",
  },
  {
    id: "blitz",
    label: "Blitz",
    description: "60 seconds. As many as you can.",
    route: "/game/blitz",
  },
  {
    id: "gradient",
    label: "Gradient",
    description: "Two colors. One smooth blend.",
    route: "/game/gradient",
  },
];

function PlayIcon() {
  return (
    <View style={styles.playTriangleWrap}>
      <View style={styles.playTriangle} />
    </View>
  );
}

export default function PlayTab() {
  const router = useRouter();
  const c = Colors.dark;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title — stacked like web, "color" has rainbow gradient */}
        <View style={styles.titleBlock}>
          <MaskedView
            style={{ alignSelf: "flex-start" }}
            maskElement={
              <Text style={[styles.titleLine, { color: "#000" }]}>color</Text>
            }
          >
            <LinearGradient
              colors={[
                "#ff0000",
                "#ff8800",
                "#ffff00",
                "#00ff00",
                "#0088ff",
                "#8800ff",
                "#ff0088",
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
            >
              <Text style={[styles.titleLine, { opacity: 0 }]}>color</Text>
            </LinearGradient>
          </MaskedView>
          <Text style={[styles.titleLine, { color: c.fgMuted }]}>cram</Text>
        </View>

        {/* Mode list */}
        <View style={styles.modes}>
          {modes.map((mode) => (
            <Pressable
              key={mode.id}
              style={({ pressed }) => [
                styles.modeRow,
                pressed && { opacity: 0.6 },
              ]}
              onPress={() => router.push(mode.route as any)}
            >
              <RainbowRing size={56} spinning>
                <PlayIcon />
              </RainbowRing>
              <View style={styles.modeText}>
                <Text style={[styles.modeLabel, { color: c.fg }]}>
                  {mode.label}
                </Text>
                <Text style={[styles.modeDesc, { color: c.fgSubtle }]}>
                  {mode.description}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

      </ScrollView>

      {/* How to Play */}
      <Pressable
        onPress={() => router.push("/onboarding" as any)}
        style={({ pressed }) => [
          styles.howToPlayButton,
          pressed && { opacity: 0.5 },
        ]}
      >
        <Text style={[styles.howToPlayText, { color: c.fgSubtle }]}>
          How to Play
        </Text>
      </Pressable>

      {/* Version — bottom left corner */}
      <Text style={[styles.versionText, { color: c.fgSubtle }]}>
        v{APP_VERSION}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
  },
  titleBlock: { marginBottom: 48 },
  titleLine: {
    fontSize: 64,
    fontWeight: "900",
    letterSpacing: -3,
    lineHeight: 62,
  },
  modes: { gap: 28 },
  modeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  playTriangleWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: "#ffffff",
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    marginLeft: 2,
  },
  modeText: { flex: 1 },
  modeLabel: {
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  modeDesc: {
    fontSize: 14,
    marginTop: 3,
  },
  howToPlayButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    left: 0,
    right: 0,
    alignItems: "center",
    paddingVertical: 6,
  },
  howToPlayText: {
    fontSize: 13,
    fontWeight: "600",
  },
  versionText: {
    position: "absolute",
    bottom: 16,
    left: 24,
    fontSize: 10,
  },
});
