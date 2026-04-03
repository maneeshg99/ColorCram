import React, { useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGameStore } from "@/hooks/useGame";
import { HSBColorPicker } from "./HSBColorPicker";
import { ScoreFeedback } from "./ScoreFeedback";
import { Button } from "@/components/ui/Button";
import { hsbToHex, hsbToRgb } from "@colorguesser/color-utils";
import { BLITZ_DURATION_MS } from "@colorguesser/game-logic";
import { Colors, getScoreColor } from "@/constants/theme";
import type { GameMode, Difficulty, HSB } from "@colorguesser/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface GameBoardProps {
  mode: GameMode;
  difficulty: Difficulty;
  seed?: string;
}

function getLuminance(hsb: HSB): number {
  const rgb = hsbToRgb(hsb);
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastColor(hsb: HSB): string {
  return getLuminance(hsb) > 0.35 ? "#000" : "#fff";
}

export function GameBoard({ mode, difficulty, seed }: GameBoardProps) {
  const router = useRouter();
  const {
    state,
    currentGuess,
    newGame,
    beginMemorize,
    beginGuess,
    setGuess,
    confirmGuess,
    advance,
    tickBlitz,
    getTarget,
    getGameResults,
  } = useGameStore();

  const initialized = useRef(false);
  const blitzStartRef = useRef<number | null>(null);
  const timerCompletedRef = useRef(false);

  const c = Colors.dark;
  const isBlitz = mode === "blitz";

  // Initialize game
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      newGame(mode, difficulty, seed);
      // Start memorize after state is set
      setTimeout(() => {
        useGameStore.getState().state && beginMemorize();
      }, 50);
    }
  }, [mode, difficulty, seed]);

  // Memorize timer
  useEffect(() => {
    if (!state || state.phase !== "memorize") return;
    timerCompletedRef.current = false;

    const start = Date.now();
    const interval = setInterval(() => {
      if (timerCompletedRef.current) return;
      const elapsed = Date.now() - start;
      if (elapsed >= state.memorizeTimeMs) {
        timerCompletedRef.current = true;
        clearInterval(interval);
        beginGuess();
      }
    }, 50);
    return () => clearInterval(interval);
  }, [state?.phase, state?.currentRound]);

  // Blitz timer
  useEffect(() => {
    if (!isBlitz || !state) return;
    if (state.phase === "idle" || state.phase === "summary") return;
    if (blitzStartRef.current === null) blitzStartRef.current = Date.now();

    const interval = setInterval(() => {
      if (blitzStartRef.current === null) return;
      tickBlitz(Date.now() - blitzStartRef.current);
    }, 100);
    return () => clearInterval(interval);
  }, [isBlitz, state?.phase]);

  const handleSubmit = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    confirmGuess();
  }, [confirmGuess]);

  const handleNext = useCallback(() => {
    advance();
    // Auto-start memorize for next round
    setTimeout(() => {
      const s = useGameStore.getState().state;
      if (s && s.phase === "memorize") return; // nextRound already set it
      if (s && s.phase !== "summary") beginMemorize();
    }, 50);
  }, [advance, beginMemorize]);

  const handlePlayAgain = useCallback(() => {
    blitzStartRef.current = null;
    initialized.current = false;
    newGame(mode, difficulty, seed);
    setTimeout(() => {
      initialized.current = true;
      beginMemorize();
    }, 50);
  }, [mode, difficulty, seed]);

  if (!state) return null;

  const target = getTarget();
  const results = getGameResults();
  const roundData = state.rounds[state.currentRound];

  // MEMORIZE PHASE
  if (state.phase === "memorize" && target) {
    const hex = hsbToHex(target);
    const textColor = contrastColor(target);
    const remaining = Math.max(0, state.memorizeTimeMs / 1000);

    return (
      <View style={[styles.fullScreen, { backgroundColor: hex }]}>
        <SafeAreaView style={styles.memorizeContent}>
          <Text style={[styles.memorizeLabel, { color: textColor, opacity: 0.5 }]}>
            MEMORIZE
          </Text>
          <Text style={[styles.roundText, { color: textColor, opacity: 0.5 }]}>
            Round {state.currentRound + 1} {!isBlitz && `/ ${state.totalRounds}`}
          </Text>
          {isBlitz && state.timeRemainingMs != null && (
            <Text style={[styles.blitzTime, { color: textColor }]}>
              {Math.ceil(state.timeRemainingMs / 1000)}s
            </Text>
          )}
        </SafeAreaView>
      </View>
    );
  }

  // GUESS PHASE
  if (state.phase === "guess") {
    return (
      <SafeAreaView style={[styles.fullScreen, { backgroundColor: c.bg }]}>
        <View style={styles.guessContent}>
          {isBlitz && state.timeRemainingMs != null && (
            <Text style={[styles.blitzTimer, { color: state.timeRemainingMs < 10000 ? Colors.score.poor : c.fg }]}>
              {Math.floor(state.timeRemainingMs / 1000)}.
              {String(Math.floor((state.timeRemainingMs % 1000) / 10)).padStart(2, "0")}
            </Text>
          )}
          <Text style={[styles.roundTextSmall, { color: c.fgMuted }]}>
            Round {state.currentRound + 1} {!isBlitz && `/ ${state.totalRounds}`}
          </Text>
          <Text style={[styles.heading, { color: c.fg }]}>
            Recreate the color
          </Text>
          <HSBColorPicker value={currentGuess} onChange={setGuess} />
          <Button title="Submit Guess" onPress={handleSubmit} size="lg" />
        </View>
      </SafeAreaView>
    );
  }

  // REVEAL PHASE
  if (state.phase === "reveal" && target && roundData?.guess) {
    const score = roundData.score ?? 0;
    const scoreColor = getScoreColor(score);

    return (
      <SafeAreaView style={[styles.fullScreen, { backgroundColor: c.bg }]}>
        <View style={styles.revealContent}>
          {isBlitz && state.timeRemainingMs != null && (
            <Text style={[styles.blitzTimer, { color: state.timeRemainingMs < 10000 ? Colors.score.poor : c.fg }]}>
              {Math.floor(state.timeRemainingMs / 1000)}s
            </Text>
          )}
          <Text style={[styles.roundTextSmall, { color: c.fgMuted }]}>
            Round {state.currentRound + 1} {!isBlitz && `/ ${state.totalRounds}`}
          </Text>

          {/* Color comparison */}
          <View style={styles.comparison}>
            <View style={styles.colorBox}>
              <Text style={styles.colorLabel}>TARGET</Text>
              <View style={[styles.colorSwatch, { backgroundColor: hsbToHex(target) }]} />
              <Text style={styles.colorHex}>{hsbToHex(target)}</Text>
            </View>
            <View style={styles.colorBox}>
              <Text style={styles.colorLabel}>GUESS</Text>
              <View style={[styles.colorSwatch, { backgroundColor: hsbToHex(roundData.guess) }]} />
              <Text style={styles.colorHex}>{hsbToHex(roundData.guess)}</Text>
            </View>
          </View>

          {/* Score */}
          <Text style={[styles.scoreText, { color: scoreColor }]}>
            {score}%
          </Text>
          <Text style={[styles.matchLabel, { color: c.fgMuted }]}>match</Text>
          <ScoreFeedback score={score} roundIndex={state.currentRound} />

          <View style={{ marginTop: 20 }}>
            <Button
              title={!isBlitz && state.currentRound + 1 >= state.totalRounds ? "See Results" : "Next Round"}
              onPress={handleNext}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // SUMMARY PHASE
  if (state.phase === "summary" && results) {
    const avgScore = results.rounds.length > 0
      ? Math.round(results.totalScore / results.rounds.length)
      : 0;

    return (
      <SafeAreaView style={[styles.fullScreen, { backgroundColor: c.bg }]}>
        <ScrollView contentContainerStyle={styles.summaryContent}>
          <Text style={[styles.heading, { color: c.fg }]}>
            {isBlitz ? "Time\u2019s Up!" : "Game Over"}
          </Text>
          <Text style={[styles.roundTextSmall, { color: c.fgMuted }]}>
            {results.rounds.length} round{results.rounds.length !== 1 ? "s" : ""} completed
          </Text>

          <Text style={[styles.bigScore, { color: c.fg }]}>{avgScore}%</Text>
          <Text style={[styles.matchLabel, { color: c.fgMuted }]}>avg match</Text>

          {/* Round breakdown */}
          <View style={styles.roundList}>
            {results.rounds.map((round, i) => (
              <View key={i} style={[styles.roundRow, { backgroundColor: c.surface }]}>
                <Text style={[styles.roundNum, { color: c.fgSubtle }]}>
                  {i + 1}
                </Text>
                <View style={styles.roundColors}>
                  <View style={[styles.miniSwatch, { backgroundColor: hsbToHex(round.target) }]} />
                  {round.guess && (
                    <View style={[styles.miniSwatch, { backgroundColor: hsbToHex(round.guess), marginLeft: -8 }]} />
                  )}
                </View>
                <Text style={[styles.roundScore, { color: c.fg }]}>
                  {round.score}%
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <Button title="Play Again" onPress={handlePlayAgain} />
            <Button
              title="Back to Menu"
              variant="secondary"
              onPress={() => router.back()}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  memorizeContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  memorizeLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  roundText: { fontSize: 14, fontWeight: "500" },
  roundTextSmall: { fontSize: 13, marginBottom: 4 },
  blitzTime: { fontSize: 28, fontWeight: "800", marginTop: 12 },
  blitzTimer: { fontSize: 24, fontWeight: "800", fontFamily: "monospace", textAlign: "center" },
  guessContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
  },
  heading: { fontSize: 24, fontWeight: "800", letterSpacing: -0.5, marginBottom: 8 },
  revealContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  comparison: { flexDirection: "row", gap: 16, marginVertical: 12 },
  colorBox: { alignItems: "center", gap: 6 },
  colorLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: Colors.dark.fgMuted,
    textTransform: "uppercase",
  },
  colorSwatch: {
    width: (SCREEN_WIDTH - 80) / 2,
    height: (SCREEN_WIDTH - 80) / 2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  colorHex: { fontSize: 12, fontFamily: "monospace", color: Colors.dark.fgMuted },
  scoreText: { fontSize: 48, fontWeight: "900" },
  matchLabel: { fontSize: 13 },
  summaryContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 8,
  },
  bigScore: { fontSize: 52, fontWeight: "900", marginTop: 12 },
  roundList: { width: "100%", gap: 8, marginTop: 16 },
  roundRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  roundNum: { fontSize: 12, fontFamily: "monospace", width: 20 },
  roundColors: { flexDirection: "row", flex: 1 },
  miniSwatch: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  roundScore: { fontSize: 14, fontWeight: "800", fontFamily: "monospace" },
  actions: { gap: 10, marginTop: 20, width: "100%" },
});
