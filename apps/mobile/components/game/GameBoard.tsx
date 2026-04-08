import React, { useEffect, useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useGameStore } from "@/hooks/useGame";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { HSBColorPicker } from "./HSBColorPicker";
import { DualHSBPicker } from "./DualHSBPicker";
import { GradientComparison } from "./GradientComparison";
import { CountdownTimer } from "./CountdownTimer";
import { ScoreFeedback } from "./ScoreFeedback";
import { Button } from "@/components/ui/Button";
import { RainbowRing } from "@/components/ui/RainbowRing";
import { Share } from "react-native";
import { createShareLink, getShareUrl } from "@/lib/share";
import { hsbToHex, hsbToRgb } from "@colorcram-v2/color-utils";
import { BLITZ_DURATION_MS } from "@colorcram-v2/game-logic";

const DEFAULT_GUESS: HSB = { h: 180, s: 50, b: 50 };
import { Colors, getScoreColor } from "@/constants/theme";
import type { GameMode, Difficulty, HSB, GameResults } from "@colorcram-v2/types";

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

function contrastColorAlpha(hsb: HSB, alpha: number): string {
  const isLight = getLuminance(hsb) > 0.35;
  return isLight ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha})`;
}

function formatBlitzTime(ms: number): { sec: string; centis: string } {
  const s = Math.floor(ms / 1000);
  const c = String(Math.floor((ms % 1000) / 10)).padStart(2, "0");
  return { sec: String(s), centis: c };
}

/** Fixed-width blitz timer display that doesn't jump around */
function BlitzTimerText({
  ms,
  size,
  color,
}: {
  ms: number;
  size: "large" | "small" | "memorize";
  color: string;
}) {
  const { sec, centis } = formatBlitzTime(ms);
  const fontSize = size === "large" ? 24 : size === "memorize" ? 32 : 14;
  const centiSize = size === "large" ? 16 : size === "memorize" ? 20 : 10;
  return (
    <View style={{ flexDirection: "row", alignItems: "baseline" }}>
      <Text
        style={{
          fontSize,
          fontWeight: "800",
          fontFamily: "monospace",
          color,
          minWidth: fontSize * 1.4,
          textAlign: "right",
        }}
      >
        {sec}
      </Text>
      <Text
        style={{
          fontSize: centiSize,
          fontWeight: "600",
          fontFamily: "monospace",
          color,
          opacity: 0.7,
        }}
      >
        .{centis}
      </Text>
    </View>
  );
}

function getFeedback(score: number): string {
  if (score >= 97) return "Perfect";
  if (score >= 90) return "Almost perfect";
  if (score >= 70) return "Good eye";
  if (score >= 40) return "Keep practicing";
  return "Way off";
}

function getRankText(avgScore: number): string {
  if (avgScore >= 97) return "Chromatic Savant";
  if (avgScore >= 90) return "Color Master";
  if (avgScore >= 80) return "Sharp Eye";
  if (avgScore >= 70) return "Keen Observer";
  if (avgScore >= 50) return "Getting There";
  return "Keep Practicing";
}

/** HSB breakdown display — shows H: S: B: for target vs guess */
function HSBBreakdown({ target, guess }: { target: HSB; guess: HSB }) {
  const c = Colors.dark;
  return (
    <View style={hsbStyles.container}>
      <View style={hsbStyles.column}>
        <Text style={hsbStyles.label}>TARGET</Text>
        <Text style={[hsbStyles.value, { color: c.fgMuted }]}>H: {Math.round(target.h)}°</Text>
        <Text style={[hsbStyles.value, { color: c.fgMuted }]}>S: {Math.round(target.s)}%</Text>
        <Text style={[hsbStyles.value, { color: c.fgMuted }]}>B: {Math.round(target.b)}%</Text>
      </View>
      <View style={hsbStyles.column}>
        <Text style={hsbStyles.label}>GUESS</Text>
        <Text style={[hsbStyles.value, { color: c.fgMuted }]}>H: {Math.round(guess.h)}°</Text>
        <Text style={[hsbStyles.value, { color: c.fgMuted }]}>S: {Math.round(guess.s)}%</Text>
        <Text style={[hsbStyles.value, { color: c.fgMuted }]}>B: {Math.round(guess.b)}%</Text>
      </View>
    </View>
  );
}

const hsbStyles = StyleSheet.create({
  container: { flexDirection: "row", gap: 40, marginTop: 12 },
  column: { gap: 3 },
  label: { fontSize: 10, fontWeight: "700", color: "#666", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 },
  value: { fontSize: 13, fontFamily: "monospace" },
});

/** Diagonal split comparison square */
function ColorComparison({ target, guess }: { target: HSB; guess: HSB }) {
  const targetHex = hsbToHex(target);
  const guessHex = hsbToHex(guess);
  const targetText = contrastColor(target);
  const guessText = contrastColor(guess);
  const size = Math.min(SCREEN_WIDTH - 64, 320);

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
          <Text style={[styles.compHex, { color: targetText, opacity: 0.8 }]}>{targetHex}</Text>
        </View>
        <View style={styles.comparisonBottomRight}>
          <Text style={[styles.compLabel, { color: guessText, opacity: 0.6 }]}>GUESS</Text>
          <Text style={[styles.compHex, { color: guessText, opacity: 0.8 }]}>{guessHex}</Text>
        </View>
      </View>
    </View>
  );
}

/** Exit confirmation modal — web-style with pill buttons */
function ExitModal({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.modalOverlay} onPress={onCancel}>
        <View style={styles.modalBox} onStartShouldSetResponder={() => true}>
          <Text style={styles.modalTitle}>Quit game?</Text>
          <Text style={styles.modalBody}>
            You'll lose all progress in this round.
          </Text>
          <View style={styles.modalActions}>
            <Pressable
              onPress={onConfirm}
              style={styles.modalBtnQuit}
            >
              <Text style={[styles.modalBtnText, { color: "#ef4444" }]}>Quit</Text>
            </Pressable>
            <Pressable
              onPress={onCancel}
              style={styles.modalBtnKeep}
            >
              <Text style={[styles.modalBtnText, { color: "#fff" }]}>Keep playing</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
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

    // Client-side plausibility checks (server should also enforce these)
    if (
      avgScore < 0 || avgScore > 100 ||
      results.totalScore < 0 ||
      results.totalTimeMs <= 0 ||
      results.rounds.length <= 0 ||
      results.avgDeltaE < 0
    ) {
      setStatus("error");
      return;
    }

    supabase
      .rpc("submit_score", {
        p_mode: results.mode,
        p_difficulty: results.difficulty,
        p_total_score: results.totalScore,
        p_avg_delta_e: results.avgDeltaE,
        p_rounds_played: results.rounds.length,
        p_avg_score: avgScore,
        p_total_time_ms: results.totalTimeMs,
        p_daily_challenge_id:
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
        Saved to leaderboard
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
  const [showEndColorWarning, setShowEndColorWarning] = useState(false);

  const c = Colors.dark;
  const isBlitz = mode === "blitz";
  const isGradient = mode === "gradient";

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      newGame(mode, difficulty, seed);
      setTimeout(() => {
        useGameStore.getState().state && beginMemorize();
      }, 50);
    }
  }, [mode, difficulty, seed]);

  useEffect(() => {
    if (!isBlitz || !state) return;
    if (state.phase === "idle" || state.phase === "summary") return;
    if (blitzStartRef.current === null) blitzStartRef.current = Date.now();

    const interval = setInterval(() => {
      if (blitzStartRef.current === null) return;
      tickBlitz(Date.now() - blitzStartRef.current);
    }, 33);
    return () => clearInterval(interval);
  }, [isBlitz, state?.phase]);

  const handleMemorizeComplete = useCallback(() => {
    beginGuess();
  }, [beginGuess]);

  const isEndColorDefault = currentGuessEnd &&
    currentGuessEnd.h === DEFAULT_GUESS.h &&
    currentGuessEnd.s === DEFAULT_GUESS.s &&
    currentGuessEnd.b === DEFAULT_GUESS.b;

  const handleSubmit = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isGradient && isEndColorDefault) {
      setShowEndColorWarning(true);
      return;
    }
    if (isGradient) {
      confirmGradientGuess();
    } else {
      confirmGuess();
    }
  }, [isGradient, isEndColorDefault, confirmGuess, confirmGradientGuess]);

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
    newGame(mode, difficulty, seed);
    setTimeout(() => {
      initialized.current = true;
      beginMemorize();
    }, 50);
  }, [mode, difficulty, seed]);

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

  const showExit = state.phase !== "summary" && state.phase !== "idle";

  // ── MEMORIZE PHASE ──
  // Web-style: full-screen color fill, round top-left, timer top-right, "MEMORIZE" label
  if (state.phase === "memorize" && (target || gradientTarget)) {
    const contrastRef = isGradient && gradientTarget
      ? {
          h: (gradientTarget.start.h + gradientTarget.end.h) / 2,
          s: (gradientTarget.start.s + gradientTarget.end.s) / 2,
          b: (gradientTarget.start.b + gradientTarget.end.b) / 2,
        }
      : target!;

    const textColor = contrastColor(contrastRef);
    const mutedColor = contrastColorAlpha(contrastRef, 0.5);

    const content = (
      <>
        <ExitModal
          visible={showExitModal}
          onCancel={() => setShowExitModal(false)}
          onConfirm={handleExit}
        />

        {/* Top bar: round left, timer right */}
        <SafeAreaView style={styles.memorizeTopBar} edges={["top"]}>
          <Text style={[styles.memorizeRound, { color: mutedColor }]}>
            {state.currentRound + 1} / {isBlitz ? state.currentRound + 1 : state.totalRounds}
          </Text>

          <View style={styles.memorizeTimerBlock}>
            {isBlitz && state.timeRemainingMs != null && (
              <View style={{ marginBottom: 8 }}>
                <BlitzTimerText ms={state.timeRemainingMs} size="memorize" color={textColor} />
              </View>
            )}
            <CountdownTimer
              durationMs={state.memorizeTimeMs}
              onComplete={handleMemorizeComplete}
              running={true}
              color={textColor}
            />
            <Text style={[styles.memorizeSubLabel, { color: mutedColor }]}>
              MEMORIZE
            </Text>
          </View>
        </SafeAreaView>

        {/* Exit button — bottom center floating pill */}
        {showExit && (
          <Pressable
            onPress={() => setShowExitModal(true)}
            style={styles.exitPill}
            hitSlop={12}
          >
            <Text style={styles.exitPillText}>Exit</Text>
          </Pressable>
        )}
      </>
    );

    if (isGradient && gradientTarget) {
      return (
        <LinearGradient
          colors={[hsbToHex(gradientTarget.start), hsbToHex(gradientTarget.end)] as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fullScreen}
        >
          {content}
        </LinearGradient>
      );
    }

    return (
      <View style={[styles.fullScreen, { backgroundColor: hsbToHex(target!) }]}>
        {content}
      </View>
    );
  }

  // ── GUESS PHASE ──
  // Web-style: round top-left, "GUESS" top-right, picker+preview+submit centered, non-scrollable
  if (state.phase === "guess") {
    const submitButton = (
      <Pressable onPress={handleSubmit}>
        <RainbowRing size={84} spinning>
          <Text style={styles.submitRingText}>Submit</Text>
        </RainbowRing>
      </Pressable>
    );

    return (
      <SafeAreaView style={[styles.fullScreen, { backgroundColor: c.bg }]}>
        <ExitModal
          visible={showExitModal}
          onCancel={() => setShowExitModal(false)}
          onConfirm={handleExit}
        />

        {/* End color warning modal */}
        <Modal visible={showEndColorWarning} transparent animationType="fade">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowEndColorWarning(false)}
          >
            <View style={styles.modalBox} onStartShouldSetResponder={() => true}>
              <Text style={styles.modalTitle}>Are you sure?</Text>
              <Text style={styles.modalBody}>
                You haven't chosen an End Color.
              </Text>
              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => {
                    setShowEndColorWarning(false);
                    if (isGradient) confirmGradientGuess();
                    else confirmGuess();
                  }}
                  style={styles.modalBtnKeep}
                >
                  <Text style={[styles.modalBtnText, { color: "#fff" }]}>Submit anyway</Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowEndColorWarning(false)}
                  style={styles.modalBtnKeep}
                >
                  <Text style={[styles.modalBtnText, { color: "#adadad" }]}>Go back</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Modal>

        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={[styles.topBarLeft, { color: c.fgMuted }]}>
            {state.currentRound + 1} / {isBlitz ? state.currentRound + 1 : state.totalRounds}
          </Text>
          <View style={{ alignItems: "flex-end" }}>
            {isBlitz && state.timeRemainingMs != null && (
              <BlitzTimerText
                ms={state.timeRemainingMs}
                size="large"
                color={state.timeRemainingMs < 10000 ? Colors.score.poor : c.fg}
              />
            )}
            <Text style={[styles.topBarRight, { color: c.fg }]}>GUESS</Text>
          </View>
        </View>

        {/* Picker centered — fixed, not scrollable */}
        <View style={styles.guessContent}>
          {isGradient ? (
            <DualHSBPicker
              startValue={currentGuessStart}
              endValue={currentGuessEnd}
              onStartChange={setGuessStart}
              onEndChange={setGuessEnd}
              rightContent={submitButton}
            />
          ) : (
            <HSBColorPicker
              value={currentGuess}
              onChange={setGuess}
              rightContent={submitButton}
            />
          )}
        </View>

        {showExit && (
          <Pressable
            onPress={() => setShowExitModal(true)}
            style={styles.exitPill}
            hitSlop={12}
          >
            <Text style={styles.exitPillText}>Exit</Text>
          </Pressable>
        )}
      </SafeAreaView>
    );
  }

  // ── REVEAL PHASE — gradient ──
  if (state.phase === "reveal" && isGradient && gradientRoundData) {
    const score = gradientRoundData.score ?? 0;
    const scoreColor = getScoreColor(score);
    const isLastRound = state.currentRound + 1 >= state.totalRounds;

    return (
      <SafeAreaView style={[styles.fullScreen, { backgroundColor: c.bg }]}>
        <ExitModal
          visible={showExitModal}
          onCancel={() => setShowExitModal(false)}
          onConfirm={handleExit}
        />

        {/* Top bar: round left, score right */}
        <View style={styles.topBar}>
          <Text style={[styles.topBarLeft, { color: c.fgMuted }]}>
            {state.currentRound + 1} / {state.totalRounds}
          </Text>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.revealScore, { color: scoreColor }]}>
              {score}%
            </Text>
            <Text style={[styles.revealFeedback, { color: c.fgMuted }]}>
              {getFeedback(score)}
            </Text>
          </View>
        </View>

        {/* Gradient comparison centered */}
        <View style={styles.revealCenter}>
          <GradientComparison
            targetStart={gradientRoundData.targetStart}
            targetEnd={gradientRoundData.targetEnd}
            guessStart={gradientRoundData.guessStart ?? { h: 0, s: 0, b: 0 }}
            guessEnd={gradientRoundData.guessEnd ?? { h: 0, s: 0, b: 0 }}
          />
        </View>

        {/* Bottom: Next text button */}
        <View style={styles.bottomBar}>
          <Pressable onPress={handleNext} hitSlop={12}>
            <Text style={styles.nextText}>
              {isLastRound ? "See Results" : "Next"} →
            </Text>
          </Pressable>
        </View>

        {showExit && (
          <Pressable
            onPress={() => setShowExitModal(true)}
            style={styles.exitPill}
            hitSlop={12}
          >
            <Text style={styles.exitPillText}>Exit</Text>
          </Pressable>
        )}
      </SafeAreaView>
    );
  }

  // ── REVEAL PHASE — standard ──
  if (state.phase === "reveal" && target && roundData?.guess) {
    const score = roundData.score ?? 0;
    const scoreColor = getScoreColor(score);
    const isLastRound = !isBlitz && state.currentRound + 1 >= state.totalRounds;

    return (
      <SafeAreaView style={[styles.fullScreen, { backgroundColor: c.bg }]}>
        <ExitModal
          visible={showExitModal}
          onCancel={() => setShowExitModal(false)}
          onConfirm={handleExit}
        />

        {/* Top bar: round left, score right */}
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.topBarLeft, { color: c.fgMuted }]}>
              {state.currentRound + 1} / {isBlitz ? state.currentRound + 1 : state.totalRounds}
            </Text>
            {isBlitz && state.timeRemainingMs != null && (
              <BlitzTimerText
                ms={state.timeRemainingMs}
                size="small"
                color={state.timeRemainingMs < 10000 ? Colors.score.poor : c.fgMuted}
              />
            )}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={[styles.revealScore, { color: scoreColor }]}>
              {score}%
            </Text>
            <Text style={[styles.revealFeedback, { color: c.fgMuted }]}>
              {getFeedback(score)}
            </Text>
          </View>
        </View>

        {/* Diagonal comparison centered + HSB breakdown */}
        <View style={styles.revealCenter}>
          <ColorComparison target={target} guess={roundData.guess} />
          <HSBBreakdown target={target} guess={roundData.guess} />
        </View>

        {/* Bottom: Next text button */}
        <View style={styles.bottomBar}>
          <Pressable onPress={handleNext} hitSlop={12}>
            <Text style={styles.nextText}>
              {isLastRound ? "See Results" : "Next"} →
            </Text>
          </Pressable>
        </View>

        {showExit && (
          <Pressable
            onPress={() => setShowExitModal(true)}
            style={styles.exitPill}
            hitSlop={12}
          >
            <Text style={styles.exitPillText}>Exit</Text>
          </Pressable>
        )}
      </SafeAreaView>
    );
  }

  // ── SUMMARY PHASE ──
  // Web-style: title + round count, massive score with rank, round rows with dividers, text-style actions
  if (state.phase === "summary" && results) {
    const avgScore =
      results.rounds.length > 0
        ? Math.round(results.totalScore / results.rounds.length)
        : 0;
    const scoreColor = getScoreColor(avgScore);
    const rankText = getRankText(avgScore);

    const rounds = isGradient && results.gradientRounds
      ? results.gradientRounds
      : results.rounds;

    return (
      <SafeAreaView style={[styles.fullScreen, { backgroundColor: c.bg }]}>
        <ScrollView contentContainerStyle={styles.summaryContent}>
          {/* Title line */}
          <Text style={[styles.summarySubtitle, { color: c.fgMuted }]}>
            {isBlitz ? "Time's Up" : "Game Over"} · {results.rounds.length} round
            {results.rounds.length !== 1 ? "s" : ""}
          </Text>

          {/* Massive score */}
          <Text style={[styles.bigScore, { color: scoreColor }]}>
            {avgScore}%
          </Text>
          <Text style={[styles.rankText, { color: c.fgMuted }]}>
            {rankText}
          </Text>

          {/* Blitz stats */}
          {isBlitz && (
            <View style={styles.blitzStats}>
              <View style={styles.blitzStat}>
                <Text style={[styles.blitzStatValue, { color: c.fg }]}>
                  {Math.max(...results.rounds.map((r) => r.score ?? 0))}%
                </Text>
                <Text style={[styles.blitzStatLabel, { color: c.fgMuted }]}>
                  best round
                </Text>
              </View>
              <View style={styles.blitzStat}>
                <Text style={[styles.blitzStatValue, { color: c.fg }]}>
                  {results.rounds.length > 0
                    ? (
                        results.rounds.reduce((s, r) => s + (r.timeMs ?? 0), 0) /
                        results.rounds.length /
                        1000
                      ).toFixed(1)
                    : 0}
                  s
                </Text>
                <Text style={[styles.blitzStatLabel, { color: c.fgMuted }]}>
                  avg time
                </Text>
              </View>
            </View>
          )}

          {/* Score submitter */}
          <ScoreSubmitter results={results} />

          {/* Round breakdown with dividers */}
          <View style={styles.roundList}>
            {rounds.map((round, i) => {
              const roundScore = round.score ?? 0;
              const rColor = getScoreColor(roundScore);

              return (
                <View
                  key={i}
                  style={[
                    styles.roundRow,
                    i < rounds.length - 1 && styles.roundRowBorder,
                  ]}
                >
                  <Text style={[styles.roundNum, { color: "rgba(255,255,255,0.3)" }]}>
                    {i + 1}
                  </Text>

                  {/* Color circles or gradient bar */}
                  {isGradient && "targetStart" in round ? (
                    <LinearGradient
                      colors={[
                        hsbToHex((round as any).targetStart),
                        hsbToHex((round as any).targetEnd),
                      ] as any}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={styles.miniGradientBar}
                    />
                  ) : (
                    <View style={styles.roundColors}>
                      <View
                        style={[
                          styles.miniCircle,
                          { backgroundColor: hsbToHex((round as any).target) },
                        ]}
                      />
                      {"guess" in round && (round as any).guess && (
                        <View
                          style={[
                            styles.miniCircle,
                            {
                              backgroundColor: hsbToHex((round as any).guess),
                              marginLeft: 6,
                            },
                          ]}
                        />
                      )}
                    </View>
                  )}

                  <Text style={[styles.roundScore, { color: rColor }]}>
                    {roundScore}%
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Text-style action buttons like web */}
          <View style={styles.actionsRow}>
            <Pressable onPress={handlePlayAgain} hitSlop={8}>
              <Text style={styles.actionTextPrimary}>Play Again</Text>
            </Pressable>
            <Pressable
              onPress={async () => {
                const shareId = await createShareLink(results);
                if (shareId) {
                  const url = getShareUrl(shareId);
                  Share.share({
                    message: `${avgScore}% on ColorCram ${results.mode}. Can you beat it? ${url}`,
                  });
                }
              }}
              hitSlop={8}
            >
              <Text style={styles.actionTextSecondary}>Challenge a Friend</Text>
            </Pressable>
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Text style={styles.actionTextSecondary}>Menu</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1 },

  // ── Top bar (shared between guess/reveal) ──
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  topBarLeft: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  topBarRight: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  // ── Bottom bar ──
  bottomBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  nextText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    letterSpacing: 0.3,
    paddingVertical: 12,
  },

  // ── Exit pill (bottom center, web-style) ──
  exitPill: {
    position: "absolute",
    bottom: 16,
    left: "50%",
    transform: [{ translateX: -30 }],
    zIndex: 200,
    backgroundColor: "rgba(40,40,40,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  exitPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#bbb",
  },

  // ── Memorize phase (full-screen color) ──
  memorizeTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  memorizeRound: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  memorizeTimerBlock: {
    alignItems: "flex-end",
  },
  memorizeSubLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginTop: 8,
  },

  // (blitz timer styles are inline in BlitzTimerText component)

  // ── Guess ──
  guessContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  submitRingText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.8,
  },

  // ── Reveal ──
  revealCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  revealScore: {
    fontSize: 48,
    fontWeight: "900",
    lineHeight: 48,
  },
  revealFeedback: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  comparisonBox: {
    borderRadius: 24,
    overflow: "hidden",
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
  compHex: { fontSize: 11, fontFamily: "monospace", marginTop: 2 },

  // ── Summary ──
  summaryContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  summarySubtitle: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  bigScore: {
    fontSize: 64,
    fontWeight: "900",
    lineHeight: 64,
  },
  rankText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
    letterSpacing: -0.3,
  },
  blitzStats: {
    flexDirection: "row",
    gap: 32,
    marginTop: 20,
  },
  blitzStat: {},
  blitzStatValue: {
    fontSize: 24,
    fontWeight: "800",
  },
  blitzStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  roundList: {
    width: "100%",
    marginTop: 24,
  },
  roundRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 14,
  },
  roundRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  roundNum: {
    fontSize: 12,
    fontFamily: "monospace",
    width: 20,
  },
  roundColors: {
    flexDirection: "row",
    flex: 1,
  },
  miniCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  miniGradientBar: {
    width: 48,
    height: 24,
    borderRadius: 6,
    flex: 1,
    maxWidth: 48,
  },
  roundScore: {
    fontSize: 15,
    fontWeight: "800",
    marginLeft: "auto",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 24,
    marginTop: 24,
  },
  actionTextPrimary: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  actionTextSecondary: {
    fontSize: 15,
    fontWeight: "600",
    color: "#adadad",
  },

  // ── Exit modal (web-style) ──
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
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalBtnQuit: {
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.4)",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  modalBtnKeep: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  modalBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
