import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated as RNAnimated } from "react-native";
import { Colors } from "@/constants/theme";

interface CountdownTimerProps {
  durationMs: number;
  onComplete: () => void;
  running: boolean;
  /** Text color to use (auto-contrast on memorize background) */
  color?: string;
}

export function CountdownTimer({
  durationMs,
  onComplete,
  running,
  color,
}: CountdownTimerProps) {
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const c = Colors.dark;

  useEffect(() => {
    setRemainingMs(durationMs);
    completedRef.current = false;
  }, [durationMs]);

  useEffect(() => {
    if (!running) return;
    completedRef.current = false;

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, durationMs - elapsed);
      setRemainingMs(remaining);

      if (remaining <= 0 && !completedRef.current) {
        completedRef.current = true;
        clearInterval(interval);
        onCompleteRef.current();
      }
    }, 30);

    return () => clearInterval(interval);
  }, [durationMs, running]);

  const progress = remainingMs / durationMs;
  const totalSeconds = Math.ceil(durationMs / 1000);
  const isWarning = progress < 0.25;
  const isCritical = progress < 0.12;

  // Current second being depleted (0-indexed from left)
  const elapsedMs = durationMs - remainingMs;
  const currentSegIndex = Math.min(
    totalSeconds - 1,
    Math.floor(elapsedMs / 1000)
  );
  const segProgress = (elapsedMs % 1000) / 1000;

  const barColor = isCritical
    ? Colors.score.poor
    : isWarning
      ? Colors.score.good
      : color || c.fg;

  const bgColor = color ? `${color}30` : c.surfaceElevated;

  const displaySec = Math.floor(remainingMs / 1000);
  const displayMs = Math.floor((remainingMs % 1000) / 10);

  return (
    <View style={styles.container}>
      <View style={styles.barRow}>
        {Array.from({ length: totalSeconds }, (_, i) => {
          const isFullyDepleted = i < currentSegIndex;
          const isDepleting = i === currentSegIndex;

          const fillWidth = isFullyDepleted
            ? 0
            : isDepleting
              ? 1 - segProgress
              : 1;

          return (
            <View
              key={i}
              style={[
                styles.segmentBg,
                { backgroundColor: bgColor },
              ]}
            >
              <View
                style={[
                  styles.segmentFill,
                  {
                    width: `${fillWidth * 100}%`,
                    backgroundColor: barColor,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      <Text style={[styles.timeSec, { color: barColor }]}>
        {displaySec}
        <Text style={[styles.timeMs, { color: barColor, opacity: 0.6 }]}>
          .{displayMs.toString().padStart(2, "0")}
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 10,
    width: "100%",
    maxWidth: 300,
  },
  barRow: {
    flexDirection: "row",
    gap: 3,
    width: "100%",
  },
  segmentBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  segmentFill: {
    height: "100%",
    borderRadius: 3,
  },
  timeSec: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "monospace",
    textAlign: "center",
  },
  timeMs: {
    fontSize: 12,
    fontFamily: "monospace",
  },
});
