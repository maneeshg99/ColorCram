import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { fetchLeaderboard, type LeaderboardRow } from "@/lib/leaderboard";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Colors } from "@/constants/theme";
import type { GameMode } from "@colorcram-v2/types";

const TABS: { id: string; label: string; mode: GameMode; difficulty?: string }[] = [
  { id: "classic-easy", label: "Easy", mode: "classic", difficulty: "easy" },
  { id: "classic-expert", label: "Expert", mode: "classic", difficulty: "expert" },
  { id: "blitz", label: "Blitz", mode: "blitz" },
  { id: "daily", label: "Daily", mode: "daily" },
];

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardTab() {
  const { user } = useAuth();
  const c = Colors.dark;

  const [selectedTab, setSelectedTab] = useState(TABS[0].id);
  const [entries, setEntries] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeTab = TABS.find((t) => t.id === selectedTab)!;

  const load = useCallback(async () => {
    setLoading(true);
    // For now the RPC only filters by mode; we'll use that
    const { rows, error: fetchError } = await fetchLeaderboard(activeTab.mode);
    setEntries(rows);
    setError(fetchError);
    setLoading(false);
  }, [activeTab.mode]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const { rows, error: fetchError } = await fetchLeaderboard(activeTab.mode);
    setEntries(rows);
    setError(fetchError);
    setRefreshing(false);
  }, [activeTab.mode]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      <Text style={[styles.title, { color: c.fg }]}>Leaderboard</Text>

      {/* Mode tabs */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const active = tab.id === selectedTab;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setSelectedTab(tab.id)}
              style={[
                styles.tab,
                active
                  ? { backgroundColor: c.accent }
                  : { borderWidth: 1, borderColor: c.border },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: active ? c.bg : c.fgMuted },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Table */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={c.fgMuted} />
        </View>
      ) : error ? (
        <ErrorState
          title="Couldn't load leaderboard"
          message="Check your connection and try again."
          onRetry={load}
        />
      ) : entries.length === 0 ? (
        <EmptyState
          title="No scores yet"
          message="Be the first to set a high score!"
        />
      ) : (
        <ScrollView
          style={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={c.fgMuted}
            />
          }
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.rankCol, { color: c.fgMuted }]}>
              #
            </Text>
            <Text style={[styles.headerCell, styles.nameCol, { color: c.fgMuted }]}>
              Player
            </Text>
            <Text
              style={[styles.headerCell, styles.scoreCol, { color: c.fgMuted }]}
            >
              Best
            </Text>
            <Text
              style={[styles.headerCell, styles.gamesCol, { color: c.fgMuted }]}
            >
              Games
            </Text>
          </View>

          {entries.map((entry) => {
            const isMe = user?.id === entry.user_id;
            return (
              <View
                key={entry.user_id}
                style={[
                  styles.row,
                  {
                    backgroundColor: isMe
                      ? `${c.accent}15`
                      : c.surface,
                    borderColor: isMe ? `${c.accent}40` : "transparent",
                    borderWidth: isMe ? 1 : 0,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.rankCol,
                    {
                      color: entry.rank <= 3 ? c.fg : c.fgMuted,
                      fontWeight: entry.rank <= 3 ? "800" : "400",
                      fontSize: entry.rank <= 3 ? 16 : 13,
                    },
                  ]}
                >
                  {entry.rank <= 3 ? MEDALS[entry.rank - 1] : entry.rank}
                </Text>
                <Text
                  style={[
                    styles.nameCol,
                    {
                      color: c.fg,
                      fontWeight: isMe ? "700" : "500",
                      fontSize: 14,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {entry.username}
                  {isMe ? " (you)" : ""}
                </Text>
                <Text style={[styles.scoreCol, styles.scoreText, { color: c.fg }]}>
                  {Math.round(entry.best_avg_score)}%
                </Text>
                <Text style={[styles.gamesCol, { color: c.fgMuted, fontSize: 12 }]}>
                  {entry.games_played}
                </Text>
              </View>
            );
          })}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  tabText: { fontSize: 13, fontWeight: "600" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
  emptySubtitle: { fontSize: 14 },
  list: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 4,
  },
  headerCell: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  rankCol: { width: 32, fontFamily: "monospace" },
  nameCol: { flex: 1 },
  scoreCol: { width: 56, textAlign: "right" },
  scoreText: { fontSize: 14, fontWeight: "800", fontFamily: "monospace" },
  gamesCol: { width: 44, textAlign: "right", fontFamily: "monospace" },
});
