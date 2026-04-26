import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { Colors } from "@/constants/theme";

export const APP_VERSION = "1.0.0";

const RAINBOW: [string, string, string, string, string, string, string] = [
  "#ff0000",
  "#ff8800",
  "#ffff00",
  "#00ff00",
  "#0088ff",
  "#8800ff",
  "#ff0088",
];

const modes = [
  {
    id: "classic",
    index: "01",
    label: "Classic",
    description: "Memorize. Guess. Repeat.",
    route: "/game/classic",
  },
  {
    id: "daily",
    index: "02",
    label: "Daily",
    description: "Same colors. Everyone. Every day.",
    route: "/game/daily",
  },
  {
    id: "blitz",
    index: "03",
    label: "Blitz",
    description: "60 seconds. As many as you can.",
    route: "/game/blitz",
  },
  {
    id: "gradient",
    index: "04",
    label: "Gradient",
    description: "Two colors. One smooth blend.",
    route: "/game/gradient",
  },
];

/** Tiny rainbow rule used in the eyebrow */
function RainbowRule() {
  return (
    <LinearGradient
      colors={RAINBOW}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.rainbowRule}
    />
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
        {/* Eyebrow — rainbow rule + label */}
        <View style={styles.eyebrowRow}>
          <RainbowRule />
          <Text style={[styles.eyebrowText, { color: c.fgMuted }]}>
            A COLOR MEMORY GAME
          </Text>
        </View>

        {/* Wordmark — "color" rainbow / "cram" muted */}
        <View style={styles.titleBlock}>
          <MaskedView
            style={{ alignSelf: "flex-start" }}
            maskElement={
              <Text style={[styles.titleLine, { color: "#000" }]}>color</Text>
            }
          >
            <LinearGradient
              colors={RAINBOW}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
            >
              <Text style={[styles.titleLine, { opacity: 0 }]}>color</Text>
            </LinearGradient>
          </MaskedView>
          <Text style={[styles.titleLine, { color: c.fgMuted }]}>cram</Text>
        </View>

        {/* Subtitle / lede */}
        <Text style={[styles.lede, { color: c.fgSubtle }]}>
          Memorize a color. Recreate it from memory. Four modes, one
          unforgiving picker.
        </Text>

        {/* Mode list — numbered with hairline dividers */}
        <View style={styles.modes}>
          {modes.map((mode, i) => (
            <Pressable
              key={mode.id}
              style={({ pressed }) => [
                styles.modeRow,
                i > 0 && {
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: c.border,
                },
                pressed && styles.modeRowPressed,
              ]}
              onPress={() => router.push(mode.route as any)}
            >
              <Text style={[styles.modeIndex, { color: c.fgSubtle }]}>
                {mode.index}
              </Text>
              <View style={styles.modeText}>
                <Text style={[styles.modeLabel, { color: c.fg }]}>
                  {mode.label}
                </Text>
                <Text style={[styles.modeDesc, { color: c.fgSubtle }]}>
                  {mode.description}
                </Text>
              </View>
              <Text style={[styles.modeArrow, { color: c.fgSubtle }]}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.versionText, { color: c.fgSubtle }]}>
          v{APP_VERSION}
        </Text>
        <Pressable
          onPress={() => router.push("/onboarding" as any)}
          hitSlop={12}
          style={({ pressed }) => [pressed && { opacity: 0.5 }]}
        >
          <Text style={[styles.howToPlayText, { color: c.fgMuted }]}>
            How to play
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 80,
  },

  // Eyebrow
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  rainbowRule: {
    height: 2,
    width: 22,
    borderRadius: 999,
  },
  eyebrowText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
  },

  // Wordmark
  titleBlock: { marginBottom: 16 },
  titleLine: {
    fontSize: 64,
    fontWeight: "900",
    letterSpacing: -3,
    lineHeight: 62,
  },

  // Lede
  lede: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 36,
    maxWidth: 320,
  },

  // Mode list
  modes: {},
  modeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 18,
  },
  modeRowPressed: {
    opacity: 0.55,
  },
  modeIndex: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    width: 22,
    fontVariant: ["tabular-nums"],
  },
  modeText: { flex: 1 },
  modeLabel: {
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  modeDesc: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  modeArrow: {
    fontSize: 22,
    fontWeight: "300",
    marginRight: 4,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  versionText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    fontVariant: ["tabular-nums"],
  },
  howToPlayText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
