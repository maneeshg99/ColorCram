import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Colors, getScoreColor } from "@/constants/theme";

interface GameStat {
  mode: string;
  difficulty: string;
  games_played: number;
  best_avg_score: number;
}

export default function ProfileTab() {
  const { user, profile, loading, signOut, deleteAccount, changeUsername } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const c = Colors.dark;

  const [stats, setStats] = useState<GameStat[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Username change modal state
  const [usernameModalVisible, setUsernameModalVisible] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameSubmitting, setUsernameSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuccessFlash, setUsernameSuccessFlash] = useState(false);
  const openUsernameModal = useCallback(() => {
    setUsernameInput(profile?.username ?? "");
    setUsernameError(null);
    setUsernameModalVisible(true);
  }, [profile?.username]);
  const closeUsernameModal = useCallback(() => {
    setUsernameModalVisible(false);
    setUsernameError(null);
    setUsernameSubmitting(false);
  }, []);
  const submitUsername = useCallback(async () => {
    setUsernameError(null);
    setUsernameSubmitting(true);
    const result = await changeUsername(usernameInput);
    setUsernameSubmitting(false);
    if (result.status === "ok") {
      setUsernameSuccessFlash(true);
      setTimeout(() => {
        setUsernameSuccessFlash(false);
        closeUsernameModal();
      }, 900);
    } else if (result.status === "noop") {
      // No change made — just close
      closeUsernameModal();
    } else {
      // 'cooldown' | 'conflict' | 'error' — surface the message
      setUsernameError(result.message);
    }
  }, [changeUsername, usernameInput, closeUsernameModal]);

  const loadStats = useCallback(async () => {
    if (!user) {
      setStats([]);
      setStatsError(null);
      return;
    }
    setStatsLoading(true);
    setStatsError(null);
    try {
      const { data, error } = (await (supabase
        .from("game_scores")
        .select("mode, difficulty, avg_score")
        .eq("user_id", user.id) as unknown as Promise<{
        data: any[] | null;
        error: { message: string } | null;
      }>));

      if (error) {
        setStatsError(error.message);
        setStats([]);
        setStatsLoading(false);
        return;
      }

      const rows = data ?? [];
      // Group by mode+difficulty
      const grouped: Record<string, { scores: number[]; count: number }> = {};
      rows.forEach((row: any) => {
        const key = `${row.mode}-${row.difficulty}`;
        if (!grouped[key]) grouped[key] = { scores: [], count: 0 };
        grouped[key].scores.push(row.avg_score);
        grouped[key].count++;
      });

      const result: GameStat[] = Object.entries(grouped).map(
        ([key, val]) => {
          const [mode, difficulty] = key.split("-");
          return {
            mode,
            difficulty,
            games_played: val.count,
            best_avg_score: Math.max(...val.scores),
          };
        }
      );
      result.sort((a, b) => b.best_avg_score - a.best_avg_score);
      setStats(result);
      setStatsLoading(false);
    } catch (e: any) {
      setStatsError(e?.message ?? "Couldn't load stats");
      setStats([]);
      setStatsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Not logged in
  if (!loading && !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
        <View style={styles.signedOutContent}>
          <Text style={[styles.title, { color: c.fg }]}>Profile</Text>
          <Text style={[styles.subtitle, { color: c.fgMuted }]}>
            Sign in to track your scores and compete on the leaderboard.
          </Text>
          <Button
            title="Sign In / Sign Up"
            onPress={() => router.push("/auth/modal")}
          />
          <View style={styles.linksSection}>
            <Pressable
              onPress={() => Linking.openURL("https://colorcram.app/privacy")}
              style={styles.linkRow}
            >
              <Text style={[styles.linkText, { color: c.fgMuted }]}>
                Privacy Policy
              </Text>
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL("https://colorcram.app/support")}
              style={styles.linkRow}
            >
              <Text style={[styles.linkText, { color: c.fgMuted }]}>
                Support
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
        <ActivityIndicator color={c.fgMuted} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: c.fg }]}>Profile</Text>

        {/* User card — pencil button next to username opens change modal */}
        <View style={[styles.userCard, { backgroundColor: c.surface }]}>
          <View style={[styles.avatar, { backgroundColor: c.surfaceElevated }]}>
            <Text style={[styles.avatarText, { color: c.fg }]}>
              {(profile?.username ?? "?")[0].toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.usernameRow}>
              <Text
                style={[styles.username, { color: c.fg }]}
                numberOfLines={1}
              >
                {profile?.username ?? "Loading..."}
              </Text>
              <Pressable
                onPress={openUsernameModal}
                hitSlop={12}
                accessibilityLabel="Change username"
                style={({ pressed }) => [
                  styles.editButton,
                  { borderColor: c.border },
                  pressed && { opacity: 0.5 },
                ]}
              >
                <Text style={[styles.editButtonText, { color: c.fgMuted }]}>
                  Change
                </Text>
              </Pressable>
            </View>
            <Text style={[styles.email, { color: c.fgMuted }]}>
              {user?.email}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <Text style={[styles.sectionTitle, { color: c.fg }]}>Your Stats</Text>

        {statsLoading ? (
          <ActivityIndicator color={c.fgMuted} style={{ marginTop: 16 }} />
        ) : statsError ? (
          <View style={styles.statsStateWrap}>
            <ErrorState
              title="Couldn't load stats"
              message="Check your connection and try again."
              onRetry={loadStats}
            />
          </View>
        ) : stats.length === 0 ? (
          <View style={styles.statsStateWrap}>
            <EmptyState
              title="No games played yet"
              message="Go play some rounds!"
            />
          </View>
        ) : (
          <View style={styles.statsList}>
            {stats.map((stat) => (
              <View
                key={`${stat.mode}-${stat.difficulty}`}
                style={[styles.statRow, { backgroundColor: c.surface }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.statMode, { color: c.fg }]}>
                    {stat.mode.charAt(0).toUpperCase() + stat.mode.slice(1)}
                  </Text>
                  <Text style={[styles.statDifficulty, { color: c.fgMuted }]}>
                    {stat.difficulty} · {stat.games_played} game
                    {stat.games_played !== 1 ? "s" : ""}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.statScore,
                    { color: getScoreColor(stat.best_avg_score) },
                  ]}
                >
                  {Math.round(stat.best_avg_score)}%
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Sign out */}
        <View style={{ marginTop: 32 }}>
          <Button title="Sign Out" variant="secondary" onPress={signOut} />
        </View>

        {/* Links */}
        <View style={styles.linksSection}>
          <Pressable
            onPress={() => Linking.openURL("https://colorcram.app/privacy")}
            style={styles.linkRow}
          >
            <Text style={[styles.linkText, { color: c.fgMuted }]}>
              Privacy Policy
            </Text>
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL("https://colorcram.app/support")}
            style={styles.linkRow}
          >
            <Text style={[styles.linkText, { color: c.fgMuted }]}>
              Support
            </Text>
          </Pressable>
        </View>

        {/* Delete account */}
        <View style={{ marginTop: 16 }}>
          <Pressable
            onPress={() => {
              Alert.alert(
                "Delete Account",
                "This will permanently delete your account and all your data including scores and game history. This action cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                      setDeleting(true);
                      const err = await deleteAccount();
                      setDeleting(false);
                      if (err) {
                        Alert.alert("Error", err);
                      }
                    },
                  },
                ]
              );
            }}
            disabled={deleting}
            style={({ pressed }) => ({
              opacity: pressed || deleting ? 0.5 : 1,
              alignItems: "center",
              paddingVertical: 12,
            })}
          >
            <Text style={{ color: "#ff3b3b", fontSize: 13, fontWeight: "600" }}>
              {deleting ? "Deleting..." : "Delete Account"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Change username modal */}
      <Modal
        visible={usernameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeUsernameModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={usernameSubmitting ? undefined : closeUsernameModal}
          />
          <View style={[styles.modalCard, { backgroundColor: c.surface }]}>
            {usernameSuccessFlash ? (
              <View style={styles.modalSuccessBox}>
                <Text style={[styles.modalSuccessTitle, { color: c.fg }]}>
                  Username updated
                </Text>
                <Text style={[styles.modalSuccessMsg, { color: c.fgMuted }]}>
                  Next change available in 30 days.
                </Text>
              </View>
            ) : (
              <>
                <Text style={[styles.modalTitle, { color: c.fg }]}>
                  Change username
                </Text>
                <Text style={[styles.modalHelper, { color: c.fgMuted }]}>
                  2-24 characters. Letters, numbers, and underscores only —
                  no spaces or symbols. You can change your username once
                  every 30 days.
                </Text>
                <TextInput
                  value={usernameInput}
                  onChangeText={(t) => {
                    setUsernameInput(t);
                    if (usernameError) setUsernameError(null);
                  }}
                  placeholder="Username"
                  placeholderTextColor={c.fgSubtle}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={24}
                  style={[
                    styles.modalInput,
                    {
                      color: c.fg,
                      borderColor: usernameError ? "#ff3b3b" : c.border,
                      backgroundColor: c.surfaceElevated,
                    },
                  ]}
                  editable={!usernameSubmitting}
                  returnKeyType="done"
                  onSubmitEditing={submitUsername}
                />
                {usernameError && (
                  <Text style={styles.modalError}>{usernameError}</Text>
                )}
                <View style={styles.modalActions}>
                  <Pressable
                    onPress={closeUsernameModal}
                    disabled={usernameSubmitting}
                    style={({ pressed }) => [
                      styles.modalBtn,
                      { borderColor: c.border, borderWidth: 1 },
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <Text style={[styles.modalBtnText, { color: c.fg }]}>
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={submitUsername}
                    disabled={
                      usernameSubmitting || usernameInput.trim().length < 2
                    }
                    style={({ pressed }) => [
                      styles.modalBtn,
                      {
                        backgroundColor: c.accent,
                        opacity:
                          usernameSubmitting ||
                          usernameInput.trim().length < 2
                            ? 0.4
                            : pressed
                            ? 0.7
                            : 1,
                      },
                    ]}
                  >
                    {usernameSubmitting ? (
                      <ActivityIndicator color={c.bg} />
                    ) : (
                      <Text style={[styles.modalBtnText, { color: c.bg }]}>
                        Save
                      </Text>
                    )}
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  scrollContent: { paddingBottom: 40 },
  signedOutContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  subtitle: { fontSize: 14, textAlign: "center", maxWidth: 280 },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 14,
    marginBottom: 24,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "800" },
  username: { fontSize: 18, fontWeight: "700" },
  email: { fontSize: 12, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12 },
  emptyText: { fontSize: 14 },
  statsStateWrap: { minHeight: 220 },
  statsList: { gap: 8 },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
  },
  statMode: { fontSize: 14, fontWeight: "700" },
  statDifficulty: { fontSize: 12, marginTop: 2 },
  statScore: { fontSize: 18, fontWeight: "900", fontFamily: "monospace" },
  linksSection: { marginTop: 24, alignItems: "center", gap: 12 },
  linkRow: { paddingVertical: 4 },
  linkText: { fontSize: 13, textDecorationLine: "underline" },
  // Username row + change button
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  editButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 11,
    fontWeight: "700",
  },
  // Username change modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    padding: 22,
    gap: 14,
  },
  modalTitle: { fontSize: 20, fontWeight: "800" },
  modalHelper: { fontSize: 13, lineHeight: 19 },
  modalInput: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: "600",
  },
  modalError: {
    fontSize: 13,
    color: "#ff3b3b",
    marginTop: -4,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnText: { fontSize: 14, fontWeight: "700" },
  // Success flash inside the username modal
  modalSuccessBox: {
    paddingVertical: 24,
    alignItems: "center",
    gap: 6,
  },
  modalSuccessTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  modalSuccessMsg: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
});
