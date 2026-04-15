import React, { useEffect, useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Pressable,
  Modal,
  Share,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGameStore } from "@/hooks/useGame";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { HSBColorPicker } from "./HSBColorPicker";
import { DualHSBPicker } from "./DualHSBPicker";
import { GradientDisplay } from "./GradientDisplay";
import { GradientComparison } from "./GradientComparison";
import { CountdownTimer } from "./CountdownTimer";
import { ScoreFeedback } from "./ScoreFeedback";
import { Button } from "@/components/ui/Button";
import { hsbToHex, hsbToRgb } from "@colorcram-v2/color-utils";
import { BLITZ_DURATION_MS } from "@colorcram-v2/game-logic";
import { Colors, getScoreColor } from "@/constants/theme";
import type { GameMode, Difficulty, HSB, GameResults } from "@colorcram-v2/types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const COLOR_SWATCH_SIZE = Math.min(SCREEN_WIDTH - 48, SCREEN_HEIGHT * 0.45);

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

/** Format blitz time as ss.ms consistently */
function formatBlitzTime(ms: number): string {
  const sec = Math.floor(ms / 1000);
  const centis = String(Math.floor((ms % 1000) / 10)).padStart(2, "0");
  return `${sec}.${centis}`;
}

/** Diagonal split comparison square */
function ColorComparison({ target, guess }: { target: HSB; guess: HSB }) {
  const targetHex = hsbToHex(target);
  const guessHex = hsbToHex(guess);
  const targetText = contrastColor(target);
  const guessText = contrastColor(guess);
  const size = SCREEN_WIDTH - 80;

  return (
    <View style={[styles.comparisonBox, { width: size, height: size }]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: targetHex }]} />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderStyle: "solid",
            borderLeftWidth: size,
            borderBottomWidth: size,
            borderLeftColor: "transparent",
            borderBottomColor: guessHex,
          },
        ]}
      />
      {/* Diagonal line */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderStyle: "solid",
            borderLeftWidth: size,
            borderBottomWidth: size,
            borderLeftColor: "transparent",
            borderBottomColor: Colors.dark.border,
            opacity: 0.6,
          },
        ]}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderStyle: "solid",
            borderLeftWidth: size,
            borderBottomWidth: size,
            borderLeftColor: "transparent",
            borderBottomColor: guessHex,
            top: 2,
            left: -2,
          },
        ]}
      />
      <View style={styles.comparisonLabels}>
        <View style={styles.comparisonTopLeft}>
          <Text style={[styles.compLabel, { color: targetText, opacity: 0.6 }]}>TARGET</Text>
          <Text style={[styles.compHsb, { color: targetText, opacity: 0.8 }]}>H: {Math.round(target.h)}°</Text>
          <Text style={[styles.compHsb, { color: targetText, opacity: 0.8 }]}>S: {Math.round(target.s)}%</Text>
          <Text style={[styles.compHsb, { color: targetText, opacity: 0.8 }]}>B: {Math.round(target.b)}%</Text>
        </View>
        <View style={styles.comparisonBottomRight}>
          <Text style={[styles.compLabel, { color: guessText, opacity: 0.6 }]}>GUESS</Text>
          <Text style={[styles.compHsb, { color: guessText, opacity: 0.8 }]}>H: {Math.round(guess.h)}°</Text>
          <Text style={[styles.compHsb, { color: guessText, opacity: 0.8 }]}>S: {Math.round(guess.s)}%</Text>
          <Text style={[styles.compHsb, { color: guessText, opacity: 0.8 }]}>B: {Math.round(guess.b)}%</Text>
        </View>
      </View>
    </View>
  );
}

/** Exit confirmation modal */
function ExitModal({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const c = Colors.dark;
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalBox, { backgroundColor: c.surface }]}>
          <Text style={[styles.modalTitle, { color: c.fg }]}>Exit Game?</Text>
          <Text style={[styles.modalBody, { color: c.fgMuted }]}>
            You'll lose all progress for this game.
          </Text>
          <View style={styles.modalActions}>
            <Pressable
              onPress={onCancel}
              style={[styles.modalBtn, { borderColor: c.border, borderWidth: 1 }]}
            >
              <Text style={[styles.modalBtnText, { color: c.fg }]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={[styles.modalBtn, { backgroundColor: Colors.score.poor }]}
            >
              <Text style={[styles.modalBtnText, { color: "#fff" }]}>Exit</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/** End color confirmation modal */
function EndColorModal({
  visible,
  onGoBack,
  onContinue,
}: {
  visible: boolean;
  onGoBack: () => void;
  onContinue: () => void;
}) {
  const c = Colors.dark;
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalBox, { backgroundColor: c.surface }]}>
          <Text style={[styles.modalTitle, { color: c.fg }]}>Are you sure you want to submit?</Text>
          <Text style={[styles.modalBody, { color: c.fgMuted }]}>
            You haven't chosen an End Color.
          </Text>
          <View style={styles.modalActions}>
            <Pressable
              onPress={onGoBack}
              style={[styles.modalBtn, { borderColor: c.border, borderWidth: 1 }]}
            >
              <Text style={[styles.modalBtnText, { color: c.fg }]}>Go Back</Text>
            </Pressable>
            <Pressable
              onPress={onContinue}
              style={[styles.modalBtn, { backgroundColor: Colors.score.poor }]}
            >
              <Text style={[styles.modalBtnText, { color: "#fff" }]}>Continue</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/** Score submitter for leaderboard */
function ScoreSubmitter({ results }: { results: GameResults }) {
  const { user } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const submitted = useRef(false);

  useEffect(() => {
    if (!user || submitted.current) return;
    submitted.current = true;
    setStatus("submitting");

    const avgScore =
      results.rounds.length > 0
        ? Math.round(results.totalScore / results.rounds.length)
        : 0;

    supabase
      .from("game_scores")
      .insert({
        user_id: user.id,
        mode: results.mode,
        difficulty: results.difficulty,
        total_score: results.totalScore,
        avg_delta_e: results.avgDeltaE,
        rounds_played: results.rounds.length,
        avg_score: avgScore,
        total_time_ms: results.totalTimeMs,
        daily_challenge_id:
          results.mode === "daily"
            ? new Date().toISOString().split("T")[0]
            : null,
      })
      .then(({ error }) => {
        if (error && error.code !== "23505") {
          setStatus("error");
        } else {
          setStatus("submitted");
        }
      });
  }, [user]);

  const c = Colors.dark;

  if (!user) {
    return (
      <View style={{ alignItems: "center", gap: 8, marginTop: 8 }}>
        <Text style={{ color: c.fgMuted, fontSize: 13 }}>
          Sign in to save your score
        </Text>
        <Button
          title="Sign In"
          variant="secondary"
          size="sm"
          onPress={() => router.push("/auth/modal")}
        />
      </View>
    );
  }

  if (status === "submitted") {
    return (
      <Text style={{ color: c.fgMuted, fontSize: 13, textAlign: "center" }}>
        ✓ Saved to leaderboard
      </Text>
    );
  }
  if (status === "submitting") {
    return (
      <Text style={{ color: c.fgMuted, fontSize: 13, textAlign: "center" }}>
        Saving...
      </Text>
    );
  }
  return null;
}

export function GameBoard({ mode, difficulty, seed }: GameBoardProps) {
  const router = useRouter();
  const {
    state,
    currentGuess,
    currentGuessStart,
    currentGuessEnd,
    newGame,
    beginMemorize,
    beginGuess,
    setGuess,
    setGuessStart,
    setGuessEnd,
    confirmGuess,
    confirmGradientGuess,
    advance,
    tickBlitz,
    getTarget,
    getGradientTarget,
    getGameResults,
  } = useGameStore();

  const initialized = useRef(false);
  const blitzStartRef = useRef<number | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showEndColorModal, setShowEndColorModal] = useState(false);
  const endColorChanged = useRef(false);

  const c = Colors.dark;
  const isBlitz = mode === "blitz";
  const isGradient = mode === "gradient";

  // Initialize game
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      newGame(mode, difficulty, seed);
      setTimeout(() => {
        useGameStore.getState().state && beginMemorize();
      }, 50);
    }
  }, [mode, difficulty, seed]);

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

  const handleMemorizeComplete = useCallback(() => {
    endColorChanged.current = false;
    beginGuess();
  }, [beginGuess]);

  const handleSetGuessEnd = useCallback((hsb: HSB) => {
    endColorChanged.current = true;
    setGuessEnd(hsb);
  }, [setGuessEnd]);

  const handleSubmit = useCallback(() => {
    if (isGradient && !endColorChanged.current) {
      setShowEndColorModal(true);
      return;
    }
    if (isGradient) {
      confirmGradientGuess();
    } else {
      confirmGuess();
    }
  }, [isGradient, confirmGuess, confirmGradientGuess]);

  const handleForceSubmitGradient = useCallback(() => {
    setShowEndColorModal(false);
    confirmGradientGuess();
  }, [confirmGradientGuess]);

  const handleNext = useCallback(() => {
    advance();
    setTimeout(() => {
      const s = useGameStore.getState().state;
      if (s && s.phase === "memorize") return;
      if (s && s.phase !== "summary") beginMemorize();
    }, 50);
  }, [advance, beginMemorize]);

  const handlePlayAgain = useCallback(() => {
    blitzStartRef.current = null;
    initialized.current = false;
    endColorChanged.current = false;
    newGame(mode, difficulty, seed);
    setTimeout(() => {
      initialized.current = true;
      beginMemorize();
    }, 50);
  }, [mode, difficulty, seed]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: "https://colorcram.app",
        url: "https://colorcram.app",
      });
    } catch {
      // User cancelled or share failed silently — no UI feedback needed
    }
  }, []);

  const handleExit = useCallback(() => {
    setShowExitModal(false);
    router.back();
  }, [router]);

  if (!state) return null;

  const target = getTarget();
  const gradientTarget = isGradient ? getGradientTarget() : null;
  const results = getGameResults();
  const roundData = state.rounds[state.currentRound];
  const gradientRoundData = isGradient ? state.gradientRounds?.[state.currentRound] : null;

  // Blitz timer component — used on all blitz screens
  const blitzTimerDisplay =
    isBlitz && state.timeRemainingMs != null ? (
      <Text
        style={[
          styles.blitzTimer,
          {
            color:
              state.timeRemainingMs < 10000 ? Colors.score.poor : c.fg,
          },
        ]}
      >
        {formatBlitzTime(state.timeRemainingMs)}
      </Text>
    ) : null;

  // Exit button
  const exitButton = (
    <Pressable
      onPress={() => setShowExitModal(true)}
      style={styles.exitBtn}
      hitSlop={12}
    >
      <Text style={styles.exitBtnText}>✕ Exit</Text>
    </Pressable>
  );

  // MEMORIZE PHASE
  if (state.phase === "memorize" && (target || gradientTarget)) {
    return (
      <SafeAreaView style={[styles.fullScreen, { backgroundColor: c.bg }]}>
        {exitButton}
        <ExitModal
          visible={showExitModal}
          onCancel={() => setShowExitModal(false)}
          onConfirm={handleExit}
        />
        <View style={styles.memorizeContent}>
          {isGradient && gradientTarget ? (
            <GradientDisplay
              startColor={gradientTarget.start}
              endColor={gradientTarget.end}
            />
          ) : target ? (
            <View
              style={[
                styles.memorizeSwatch,
                {
                  backgroundColor: hsbToHex(target),
                  width: COLOR_SWATCH_SIZE,
                  height: COLOR_SWATCH_SIZE,
                },
              ]}
            >
              <Text style={[styles.memorizeLabel, { color: contrastColor(target), opacity: 0.5 }]}>
                MEMORIZE
              </Text>
            </View>
          ) : null}

          <Text style={[styles.roundTextSmall, { color: c.fgMuted }]}>
            Round {state.currentRound + 1} {!isBlitz && `/ ${state.totalRounds}`}
          </Text>

          {blitzTimerDisplay}

          <CountdownTimer
            durationMs={state.memorizeTimeMs}
            onComplete={handleMemorizeComplete}
            running={true}
            color={c.fg}
          />
        </View>
      </SafeAreaView>
    );
  }

  // GUESS PHASE
  if (state.phase === "guess") {
    return (
      <SafeAreaView style={[styles.fullScreen, { backgroundColor: c.bg }]}>
        {exitButton}
        <ExitModal
          visible={showExitModal}
          onCancel={() => setShowExitModal(false)}
          onConfirm={handleExit}
        />
        {isGradient && (
          <EndColorModal
            visible={showEndColorModal}
            onGoBack={() => setShowEndColorModal(false)}
            onContinue={handleForceSubmitGradient}
          />
        )}
        <View style={styles.guessContent}>
          {blitzTimerDisplay}
          <Text style={[styles.roundTextSmall, { color: c.fgMuted }]}>
            Round {state.currentRound + 1}{" "}
            {!isBlitz && `/ ${state.totalRounds}`}
          </Text>
          <Text style={[styles.heading, { color: c.fg }]}>
            {isGradient ? "Recreate the gradient" : "Recreate the color"}
          </Text>
          {isGradient ? (
            <DualHSBPicker
              startValue={currentGuessStart}
              endValue={currentGuessEnd}
              onStartChange={setGuessStart}
              onEndChange={handleSetGuessEnd}
            />
          ) : (
            <HSBColorPicker value={currentGuess} onChange={setGuess} />
          )}
          <Button title="Submit Guess" onPress={handleSubmit} size="lg" />
        </View>
      </SafeAreaView>
    );
  }

  // REVEAL PHASE — gradient
  if (state.phase === "reveal" && isGradient && gradientRoundData) {
    const score = gradientRoundData.score ?? 0;
    const scoreColor = getScoreColor(score);

    return (
      <SafeAreaView style={[styles.fullScreen, { backgroundColor: c.bg }]}>
        {exitButton}
        <ExitModal
          visible={showExitModal}
          onCancel={() => setShowExitModal(false)}
          onConfirm={handleExit}
        />
        <ScrollView contentContainerStyle={styles.revealContent}>
          <Text style={[styles.roundTextSmall, { color: c.fgMuted }]}>
            Round {state.currentRound + 1} / {state.totalRounds}
          </Text>

          <GradientComparison
            targetStart={gradientRoundData.targetStart}
            targetEnd={gradientRoundData.targetEnd}
            guessStart={gradientRoundData.guessStart ?? { h: 0, s: 0, b: 0 }}
            guessEnd={gradientRoundData.guessEnd ?? { h: 0, s: 0, b: 0 }}
          />

          <Text style={[styles.scoreText, { color: scoreColor }]}>
            {score}%
          </Text>
          <Text style={[styles.matchLabel, { color: c.fgMuted }]}>match</Text>
          <ScoreFeedback score={score} roundIndex={state.currentRound} />

          <View style={{ marginTop: 16 }}>
            <Button
              title={
                state.currentRound + 1 >= state.totalRounds
                  ? "See Results"
                  : "Next Round"
              }
              onPress={handleNext}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // REVEAL PHASE — standard
  if (state.phase === "reveal" && target && roundData?.guess) {
    const score = roundData.score ?? 0;
    const scoreColor = getScoreColor(score);

    return (
      <SafeAreaView style={[styles.fullScreen, { backgroundColor: c.bg }]}>
        {exitButton}
        <ExitModal
          visible={showExitModal}
          onCancel={() => setShowExitModal(false)}
          onConfirm={handleExit}
        />
        <View style={styles.revealContent}>
          {blitzTimerDisplay}
          <Text style={[styles.roundTextSmall, { color: c.fgMuted }]}>
            Round {state.currentRound + 1}{" "}
            {!isBlitz && `/ ${state.totalRounds}`}
          </Text>

          <ColorComparison target={target} guess={roundData.guess} />

          <Text style={[styles.scoreText, { color: scoreColor }]}>
            {score}%
          </Text>
          <Text style={[styles.matchLabel, { color: c.fgMuted }]}>match</Text>
          <ScoreFeedback score={score} roundIndex={state.currentRound} />

          <View style={{ marginTop: 16 }}>
            <Button
              title={
                !isBlitz && state.currentRound + 1 >= state.totalRounds
                  ? "See Results"
                  : "Next Round"
              }
              onPress={handleNext}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // SUMMARY PHASE
  if (state.phase === "summary" && results) {
    const avgScore =
      results.rounds.length > 0
        ? Math.round(results.totalScore / results.rounds.length)
        : 0;

    return (
      <SafeAreaView style={[styles.fullScreen, { backgroundColor: c.bg }]}>
        <ScrollView contentContainerStyle={styles.summaryContent}>
          <Text style={[styles.heading, { color: c.fg }]}>
            {isBlitz ? "Time\u2019s Up!" : "Game Over"}
          </Text>
          <Text style={[styles.roundTextSmall, { color: c.fgMuted }]}>
            {results.rounds.length} round
            {results.rounds.length !== 1 ? "s" : ""} completed
          </Text>

          <Text style={[styles.bigScore, { color: c.fg }]}>{avgScore}%</Text>
          <Text style={[styles.matchLabel, { color: c.fgMuted }]}>
            avg match
          </Text>

          {/* Round breakdown */}
          <View style={styles.roundList}>
            {isGradient && results.gradientRounds
              ? results.gradientRounds.map((round, i) => {
                  const roundScore = round.score ?? 0;
                  return (
                    <View
                      key={i}
                      style={[styles.roundRow, { backgroundColor: c.surface }]}
                    >
                      <Text style={[styles.roundNum, { color: c.fgSubtle }]}>
                        {i + 1}
                      </Text>
                      <View style={styles.roundColors}>
                        <View
                          style={[
                            styles.miniSwatch,
                            { backgroundColor: hsbToHex(round.targetStart) },
                          ]}
                        />
                        <View
                          style={[
                            styles.miniSwatch,
                            {
                              backgroundColor: hsbToHex(round.targetEnd),
                              marginLeft: -8,
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.roundScore,
                          { color: getScoreColor(roundScore) },
                        ]}
                      >
                        {roundScore}%
                      </Text>
                    </View>
                  );
                })
              : results.rounds.map((round, i) => {
                  const roundScore = round.score ?? 0;
                  return (
                    <View
                      key={i}
                      style={[styles.roundRow, { backgroundColor: c.surface }]}
                    >
                      <Text style={[styles.roundNum, { color: c.fgSubtle }]}>
                        {i + 1}
                      </Text>
                      <View style={styles.roundColors}>
                        <View
                          style={[
                            styles.miniSwatch,
                            { backgroundColor: hsbToHex(round.target) },
                          ]}
                        />
                        {round.guess && (
                          <View
                            style={[
                              styles.miniSwatch,
                              {
                                backgroundColor: hsbToHex(round.guess),
                                marginLeft: -8,
                              },
                            ]}
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.roundScore,
                          { color: getScoreColor(roundScore) },
                        ]}
                      >
                        {roundScore}%
                      </Text>
                    </View>
                  );
                })}
          </View>

          {/* Score submission */}
          <ScoreSubmitter results={results} />

          <View style={styles.actions}>
            <Button title="Play Again" onPress={handlePlayAgain} />
            <Button
              title="Share Result"
              variant="secondary"
              onPress={handleShare}
            />
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

  // Exit button
  exitBtn: {
    position: "absolute",
    top: 56,
    left: 16,
    zIndex: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  exitBtnText: {
    color: Colors.dark.fgMuted,
    fontSize: 13,
    fontWeight: "600",
  },

  // Memorize
  memorizeContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  memorizeSwatch: {
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  memorizeLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 4,
    textTransform: "uppercase",
  },

  // Shared
  roundTextSmall: { fontSize: 13, marginBottom: 2 },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  blitzTimer: {
    fontSize: 24,
    fontWeight: "800",
    fontFamily: "monospace",
    textAlign: "center",
  },

  // Guess
  guessContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
  },

  // Reveal
  revealContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
  },
  comparisonBox: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginVertical: 8,
  },
  comparisonLabels: { ...StyleSheet.absoluteFillObject },
  comparisonTopLeft: { position: "absolute", top: 16, left: 16 },
  comparisonBottomRight: {
    position: "absolute",
    bottom: 16,
    right: 16,
    alignItems: "flex-end",
  },
  compLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  compHsb: { fontSize: 11, fontFamily: "monospace", marginTop: 1 },
  scoreText: { fontSize: 48, fontWeight: "900" },
  matchLabel: { fontSize: 13 },

  // Summary
  summaryContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 4,
  },
  bigScore: { fontSize: 52, fontWeight: "900", marginTop: 8 },
  roundList: { width: "100%", gap: 8, marginTop: 12 },
  roundRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  roundNum: { fontSize: 16, fontWeight: "700", fontFamily: "monospace", width: 24 },
  roundColors: { flexDirection: "row", flex: 1 },
  miniSwatch: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  roundScore: { fontSize: 18, fontWeight: "800", fontFamily: "monospace" },
  actions: { gap: 10, marginTop: 16, width: "100%" },

  // Exit modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  modalBox: {
    width: "100%",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: "800" },
  modalBody: { fontSize: 14, textAlign: "center" },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 8 },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalBtnText: { fontSize: 14, fontWeight: "700" },
});
