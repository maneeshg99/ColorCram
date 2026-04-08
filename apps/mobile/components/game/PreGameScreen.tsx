import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, Modal } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/theme";
import { RainbowRing } from "@/components/ui/RainbowRing";

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

interface PreGameScreenProps {
  mode: "classic" | "daily" | "blitz" | "gradient";
  title: string;
  description: string;
  onStart: (difficulty?: string) => void;
}

export function PreGameScreen({ mode, title, description, onStart }: PreGameScreenProps) {
  const router = useRouter();
  const c = Colors.dark;
  const [expertModal, setExpertModal] = useState(false);
  const [expertMsg, setExpertMsg] = useState("");

  const handleExpert = () => {
    const msg = EXPERT_WARNINGS[warningIdx % EXPERT_WARNINGS.length];
    warningIdx++;
    setExpertMsg(msg);
    setExpertModal(true);
  };

  const handlePress = (difficulty?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onStart(difficulty);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      {/* Back button */}
      <Pressable
        onPress={() => router.back()}
        style={styles.backBtn}
        hitSlop={12}
      >
        <Text style={[styles.backText, { color: c.fgMuted }]}>← Back</Text>
      </Pressable>

      <View style={styles.content}>
        <RainbowRing size={72} spinning>
          <View style={styles.playTriangleWrap}>
            <View style={styles.playTriangle} />
          </View>
        </RainbowRing>

        <Text style={[styles.title, { color: c.fg }]}>{title}</Text>
        <Text style={[styles.description, { color: c.fgMuted }]}>
          {description}
        </Text>

        {mode === "classic" ? (
          <View style={styles.buttonRow}>
            <Pressable
              onPress={() => handlePress("easy")}
              style={({ pressed }) => [
                styles.startBtn,
                { borderColor: c.border },
                pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={[styles.startBtnText, { color: c.fg }]}>Easy</Text>
            </Pressable>
            <Pressable
              onPress={handleExpert}
              style={({ pressed }) => [
                styles.startBtn,
                { borderColor: c.border },
                pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
              ]}
            >
              <Text style={[styles.startBtnText, { color: c.fg }]}>Expert</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => handlePress()}
            style={({ pressed }) => [
              styles.startBtn,
              styles.startBtnWide,
              { backgroundColor: c.accent },
              pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
            ]}
          >
            <Text style={[styles.startBtnText, { color: c.bg, fontWeight: "700" }]}>
              Start Game
            </Text>
          </Pressable>
        )}
      </View>

      {/* Expert warning modal */}
      <Modal visible={expertModal} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setExpertModal(false)}
        >
          <View style={styles.modalBox} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Expert Mode</Text>
            <Text style={styles.modalBody}>"{expertMsg}"</Text>
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setExpertModal(false)}
                style={styles.modalBtnCancel}
              >
                <Text style={[styles.modalBtnText, { color: "#adadad" }]}>
                  Maybe not
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setExpertModal(false);
                  handlePress("expert");
                }}
                style={styles.modalBtnConfirm}
              >
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>
                  Bring it on
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backText: {
    fontSize: 15,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  playTriangleWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: "#ffffff",
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    marginLeft: 3,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
    marginTop: 8,
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  startBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  startBtnWide: {
    marginTop: 16,
    minWidth: 180,
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },

  // Expert modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  modalBox: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    fontStyle: "italic",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalBtnCancel: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  modalBtnConfirm: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  modalBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
