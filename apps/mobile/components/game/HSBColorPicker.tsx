import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { HSB } from "@colorcram/types";
import { hsbToHex } from "@colorcram/color-utils";
import { Colors } from "@/constants/theme";

const STRIP_HEIGHT = 260;
const STRIP_WIDTH = 56;
const THUMB_HEIGHT = 6;

interface HSBColorPickerProps {
  value: HSB;
  onChange: (hsb: HSB) => void;
}

interface StripProps {
  label: string;
  valueLabel: string;
  colors: string[];
  position: number; // 0-1 normalized
  onDrag: (position: number) => void;
}

function Strip({ label, valueLabel, colors, position, onDrag }: StripProps) {
  // Use a ref so PanResponder always calls the latest callback
  const onDragRef = useRef(onDrag);
  onDragRef.current = onDrag;

  // Use a ref for the touch handler itself so the PanResponder closure
  // always invokes the current version
  const handleTouchRef = useRef((evt: GestureResponderEvent) => {
    const y = evt.nativeEvent.locationY;
    const clamped = Math.max(0, Math.min(STRIP_HEIGHT, y));
    onDragRef.current(clamped / STRIP_HEIGHT);
  });
  handleTouchRef.current = (evt: GestureResponderEvent) => {
    const y = evt.nativeEvent.locationY;
    const clamped = Math.max(0, Math.min(STRIP_HEIGHT, y));
    onDragRef.current(clamped / STRIP_HEIGHT);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => handleTouchRef.current(evt),
      onPanResponderMove: (evt) => handleTouchRef.current(evt),
    })
  ).current;

  // Clamp thumb position within bounds
  const thumbTop = Math.max(0, Math.min(STRIP_HEIGHT - THUMB_HEIGHT, position * STRIP_HEIGHT - THUMB_HEIGHT / 2));

  return (
    <View style={styles.stripContainer}>
      <Text style={styles.stripLabel}>{label}</Text>
      {/* Outer wrapper for touch area — no overflow hidden so thumb is visible */}
      <View style={styles.stripTouchArea} {...panResponder.panHandlers}>
        {/* Inner gradient with overflow hidden + borderRadius */}
        <View style={styles.stripGradientClip}>
          <LinearGradient
            colors={colors as any}
            style={styles.strip}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </View>
        {/* Thumb sits on top, not clipped */}
        <View style={[styles.thumb, { top: thumbTop }]} />
      </View>
      <Text style={styles.stripValue}>{valueLabel}</Text>
    </View>
  );
}

export function HSBColorPicker({ value, onChange }: HSBColorPickerProps) {
  const hex = hsbToHex(value);

  const hueColors = [
    "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ff0000",
  ];

  const satColors = [0, 25, 50, 75, 100].map((s) =>
    hsbToHex({ h: value.h, s, b: value.b })
  );

  const briColors = [100, 75, 50, 25, 0].map((b) =>
    hsbToHex({ h: value.h, s: value.s, b })
  );

  return (
    <View style={styles.container}>
      <View style={styles.strips}>
        <Strip
          label="H"
          valueLabel={`${Math.round(value.h)}°`}
          colors={hueColors}
          position={value.h / 360}
          onDrag={(norm) => onChange({ ...value, h: Math.round(norm * 360) })}
        />
        <Strip
          label="S"
          valueLabel={`${Math.round(value.s)}%`}
          colors={satColors}
          position={value.s / 100}
          onDrag={(norm) => onChange({ ...value, s: Math.round(norm * 100) })}
        />
        <Strip
          label="B"
          valueLabel={`${Math.round(value.b)}%`}
          colors={briColors}
          position={1 - value.b / 100}
          onDrag={(norm) => onChange({ ...value, b: Math.round((1 - norm) * 100) })}
        />
      </View>

      <View style={styles.preview}>
        <View style={[styles.previewSwatch, { backgroundColor: hex }]} />
        <View>
          <Text style={styles.previewHex}>{hex}</Text>
          <Text style={styles.previewValues}>
            H {Math.round(value.h)}° · S {Math.round(value.s)}% · B{" "}
            {Math.round(value.b)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const c = Colors.dark;

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 16 },
  strips: { flexDirection: "row", gap: 20 },
  stripContainer: { alignItems: "center", gap: 6 },
  stripLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: c.fgMuted,
    textTransform: "uppercase",
  },
  stripTouchArea: {
    width: STRIP_WIDTH + 12, // extra touch padding
    height: STRIP_HEIGHT,
    position: "relative",
    alignItems: "center",
  },
  stripGradientClip: {
    width: STRIP_WIDTH,
    height: STRIP_HEIGHT,
    borderRadius: STRIP_WIDTH / 2,
    overflow: "hidden",
  },
  strip: {
    width: "100%",
    height: "100%",
  },
  thumb: {
    position: "absolute",
    alignSelf: "center",
    width: STRIP_WIDTH + 12,
    height: THUMB_HEIGHT,
    borderRadius: 3,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  stripValue: {
    fontSize: 12,
    fontFamily: "monospace",
    color: c.fgMuted,
  },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  previewSwatch: {
    width: 64,
    height: 64,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.border,
  },
  previewHex: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "monospace",
    color: c.fg,
  },
  previewValues: {
    fontSize: 11,
    fontFamily: "monospace",
    color: c.fgMuted,
    marginTop: 2,
  },
});
