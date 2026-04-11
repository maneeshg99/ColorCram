import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Colors, getScoreColor } from "@/constants/theme";
import { HSBColorPicker } from "@/components/game/HSBColorPicker";
import { CountdownTimer } from "@/components/game/CountdownTimer";
import { hsbToHex } from "@colorcram-v2/color-utils";
import { calculateDeltaE, deltaEToScore } from "@colorcram-v2/game-logic";
import type { HSB } from "@colorcram-v2/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const c = Colors.dark;
const TOTAL_SLIDES = 4;

// Demo colors
const DEMO_TARGET_TEAL: HSB = { h: 175, s: 85, b: 85 };
const DEMO_GUESS_OFF: HSB = { h: 160, s: 70, b: 75 };
const DEMO_PLAY_TARGET: HSB = { h: 220, s: 90, b: 95 };

const DEMO_TARGET_HEX = hsbToHex(DEMO_TARGET_TEAL);
const DEMO_GUESS_HEX = hsbToHex(DEMO_GUESS_OFF);
const DEMO_PLAY_HEX = hsbToHex(DEMO_PLAY_TARGET);

const SWATCH_SIZE = 200;
const COMPARISON_SIZE = 160;

// --- Reusable diagonal split comparison ---
function DiagonalComparison({
  targetHex,
  guessHex,
}: {
  targetHex: string;
  guessHex: string;
}) {
  return (
    <View style={styles.comparisonSquare}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: guessHex }]} />
      <View
        style={[
          styles.triangleOverlay,
          { borderTopColor: targetHex, borderLeftColor: targetHex },
        ]}
      />
      <View style={styles.diagonalLine} />
      <Text style={styles.triangleLabelTarget}>TARGET</Text>
      <Text style={styles.triangleLabelGuess}>GUESS</Text>
    </View>
  );
}

// --- Bottom navigation bar ---
function BottomNav({
  scrollX,
  currentPage,
  onNavigate,
}: {
  scrollX: Animated.Value;
  currentPage: number;
  onNavigate: (index: number) => void;
}) {
  return (
    <View style={styles.bottomNav}>
      {Array.from({ length: TOTAL_SLIDES }, (_, i) => {
        const inputRange = [
          (i - 1) * SCREEN_WIDTH,
          i * SCREEN_WIDTH,
          (i + 1) * SCREEN_WIDTH,
        ];
        const scale = scrollX.interpolate({
          inputRange,
          outputRange: [1, 1.4, 1],
          extrapolate: "clamp",
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: "clamp",
        });

        return (
          <Pressable
            key={i}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onNavigate(i);
            }}
            hitSlop={12}
          >
            <Animated.View
              style={[
                styles.navDot,
                { transform: [{ scale }], opacity },
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

// --- Slide 1: See the color ---
function Slide1() {
  return (
    <View style={styles.slide}>
      <View style={styles.slideContent}>
        <Text style={styles.slideTitle}>See the color</Text>

        <View style={[styles.swatch, { backgroundColor: DEMO_TARGET_HEX }]}>
          <Text style={styles.swatchLabel}>MEMORIZE</Text>
        </View>

        {/* Fake countdown bar */}
        <View style={styles.fakeCountdownContainer}>
          <View style={styles.fakeCountdownRow}>
            {Array.from({ length: 5 }, (_, i) => (
              <View key={i} style={styles.fakeSegBg}>
                <View
                  style={[
                    styles.fakeSegFill,
                    {
                      width: i < 3 ? "100%" : i === 3 ? "60%" : "0%",
                      backgroundColor: c.fg,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
          <Text style={styles.fakeCountdownText}>3.60</Text>
        </View>

        <Text style={styles.slideDescription}>
          You'll see a color for a few seconds.{"\n"}Study it carefully.
        </Text>
      </View>
    </View>
  );
}

// --- Slide 2: Guess from memory (real picker, non-interactive) ---
function Slide2() {
  const noop = useCallback(() => {}, []);

  return (
    <View style={styles.slide}>
      <View style={styles.slideContentGuess}>
        <Text style={styles.slideTitle}>Guess from memory</Text>

        <View pointerEvents="none">
          <HSBColorPicker value={DEMO_GUESS_OFF} onChange={noop} />
        </View>

        <Text style={styles.slideDescription}>
          Recreate it from memory{"\n"}using the color picker.
        </Text>
      </View>
    </View>
  );
}

// --- Slide 3: See your score ---
function Slide3() {
  const score = 87;
  const scoreColor = getScoreColor(score);

  return (
    <View style={styles.slide}>
      <View style={styles.slideContent}>
        <Text style={styles.slideTitle}>See your score</Text>

        <DiagonalComparison
          targetHex={DEMO_TARGET_HEX}
          guessHex={DEMO_GUESS_HEX}
        />

        <Text style={[styles.scoreText, { color: scoreColor }]}>87%</Text>
        <Text style={styles.feedbackText}>You've got the eye.</Text>

        <Text style={styles.slideDescription}>
          The closer your guess,{"\n"}the higher your score.
        </Text>
      </View>
    </View>
  );
}

// --- Slide 4: Live demo round ---
type DemoPhase = "ready" | "memorize" | "guess" | "reveal";

function Slide4({
  onFinish,
  onDemoStart,
}: {
  onFinish: () => void;
  onDemoStart: () => void;
}) {
  const [phase, setPhase] = useState<DemoPhase>("ready");
  const [guess, setGuess] = useState<HSB>({ h: 180, s: 50, b: 50 });
  const [score, setScore] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  const startDemo = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDemoStart();
    setPhase("memorize");
    setTimerRunning(true);
  }, [onDemoStart]);

  const handleCountdownComplete = useCallback(() => {
    setTimerRunning(false);
    setPhase("guess");
  }, []);

  const handleSubmit = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const deltaE = calculateDeltaE(DEMO_PLAY_TARGET, guess);
    const calculatedScore = deltaEToScore(deltaE, DEMO_PLAY_TARGET, guess);
    setScore(calculatedScore);
    setPhase("reveal");
  }, [guess]);

  const handleFinish = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFinish();
  }, [onFinish]);

  if (phase === "ready") {
    return (
      <View style={styles.slide}>
        <View style={styles.slideContent}>
          <Text style={styles.ctaTitle}>Ready?</Text>
          <Text style={styles.ctaDescription}>
            Let's see how good your{"\n"}color memory really is.
          </Text>
          <Pressable
            onPress={startDemo}
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
            ]}
          >
            <Text style={styles.ctaButtonText}>Try it yourself!</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (phase === "memorize") {
    return (
      <View style={styles.slide}>
        <View style={styles.slideContent}>
          <Text style={styles.phaseLabel}>MEMORIZE</Text>

          <View style={[styles.swatch, { backgroundColor: DEMO_PLAY_HEX }]}>
            <Text style={styles.swatchLabel}>MEMORIZE</Text>
          </View>

          <CountdownTimer
            durationMs={5000}
            onComplete={handleCountdownComplete}
            running={timerRunning}
          />

          <Text style={styles.slideDescription}>
            Study this color carefully!
          </Text>
        </View>
      </View>
    );
  }

  if (phase === "guess") {
    return (
      <View style={styles.slide}>
        <View style={styles.slideContentGuess}>
          <Text style={styles.phaseLabel}>GUESS</Text>

          <HSBColorPicker value={guess} onChange={setGuess} />

          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitButton,
              pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
            ]}
          >
            <Text style={styles.submitButtonText}>Submit Guess</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // phase === "reveal"
  const scoreColor = getScoreColor(score);
  const guessHex = hsbToHex(guess);

  return (
    <View style={styles.slide}>
      <View style={styles.slideContent}>
        <DiagonalComparison targetHex={DEMO_PLAY_HEX} guessHex={guessHex} />

        <Text style={[styles.scoreText, { color: scoreColor }]}>{score}%</Text>
        <Text style={styles.feedbackText}>
          {score >= 90
            ? "Nailed it!"
            : score >= 70
              ? "Not bad at all!"
              : score >= 40
                ? "Keep practicing!"
                : "Room for improvement!"}
        </Text>

        <Pressable
          onPress={handleFinish}
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] },
          ]}
        >
          <Text style={styles.ctaButtonText}>Let's Play!</Text>
        </Pressable>
      </View>
    </View>
  );
}

// --- Main Onboarding Screen ---
export default function OnboardingScreen() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [demoActive, setDemoActive] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const finishOnboarding = useCallback(async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    router.replace("/(tabs)");
  }, [router]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    finishOnboarding();
  }, [finishOnboarding]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setCurrentPage(page);
    },
    []
  );

  const scrollToSlide = useCallback(
    (index: number) => {
      scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
      setCurrentPage(index);
    },
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip button -- hidden on slide 4 and during demo */}
      {currentPage < 3 && !demoActive && (
        <Pressable
          onPress={handleSkip}
          style={({ pressed }) => [
            styles.skipButton,
            pressed && { opacity: 0.5 },
          ]}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        scrollEnabled={!demoActive}
        bounces={false}
      >
        <Slide1 />
        <Slide2 />
        <Slide3 />
        <Slide4
          onFinish={finishOnboarding}
          onDemoStart={() => setDemoActive(true)}
        />
      </ScrollView>

      {/* Bottom nav dots -- hidden during demo */}
      {!demoActive && (
        <BottomNav
          scrollX={scrollX}
          currentPage={currentPage}
          onNavigate={scrollToSlide}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.bg,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: "center",
  },
  slideContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 24,
  },
  slideContentGuess: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: c.fg,
    textAlign: "center",
  },
  slideDescription: {
    fontSize: 15,
    color: c.fgMuted,
    textAlign: "center",
    lineHeight: 22,
  },

  // Swatch
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 4,
    textTransform: "uppercase",
  },

  // Fake countdown
  fakeCountdownContainer: {
    alignItems: "center",
    gap: 10,
    width: "100%",
    maxWidth: 300,
  },
  fakeCountdownRow: {
    flexDirection: "row",
    gap: 3,
    width: "100%",
  },
  fakeSegBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    backgroundColor: c.surfaceElevated,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  fakeSegFill: {
    height: "100%",
    borderRadius: 3,
  },
  fakeCountdownText: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "monospace",
    color: c.fg,
    textAlign: "center",
  },

  // Diagonal comparison square
  comparisonSquare: {
    width: COMPARISON_SIZE,
    height: COMPARISON_SIZE,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  triangleOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderTopWidth: COMPARISON_SIZE,
    borderRightWidth: COMPARISON_SIZE,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
  },
  diagonalLine: {
    position: "absolute",
    width: Math.sqrt(2) * COMPARISON_SIZE,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    top: COMPARISON_SIZE / 2 - 1,
    left: -(Math.sqrt(2) * COMPARISON_SIZE - COMPARISON_SIZE) / 2,
    transform: [{ rotate: "-45deg" }],
  },
  triangleLabelTarget: {
    position: "absolute",
    top: 16,
    left: 12,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 2,
    color: "rgba(255,255,255,0.7)",
  },
  triangleLabelGuess: {
    position: "absolute",
    bottom: 16,
    right: 12,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 2,
    color: "rgba(255,255,255,0.7)",
  },

  // Score
  scoreText: {
    fontSize: 48,
    fontWeight: "900",
  },
  feedbackText: {
    fontSize: 14,
    fontStyle: "italic",
    color: c.fgMuted,
    textAlign: "center",
  },

  // Phase label
  phaseLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 3,
    color: c.fgSubtle,
    textTransform: "uppercase",
  },

  // CTA
  ctaTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: c.fg,
    textAlign: "center",
    letterSpacing: -1,
  },
  ctaDescription: {
    fontSize: 16,
    color: c.fgMuted,
    textAlign: "center",
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: c.accent,
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: c.bg,
  },

  // Submit button
  submitButton: {
    backgroundColor: c.accent,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: c.bg,
  },

  // Skip button
  skipButton: {
    position: "absolute",
    top: 8,
    right: 20,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "600",
    color: c.fgMuted,
  },

  // Bottom nav
  bottomNav: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingBottom: 32,
    paddingTop: 16,
  },
  navDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: c.fg,
  },
});
