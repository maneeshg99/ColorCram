import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import type { HSB } from "@colorguesser/types";
import { hsbToHex } from "@colorguesser/color-utils";
import { Colors } from "@/constants/theme";

const STRIP_HEIGHT = 260;
const STRIP_WIDTH = 56;
const THUMB_WIDTH = 68;
const THUMB_HEIGHT = 6;

interface HSBColorPickerProps {
  value: HSB;
  onChange: (hsb: HSB) => void;
}

interface StripProps {
  label: string;
  valueLabel: string;
  colors: string[];
  position: number;
  onDrag: (position: number) => void;
}

function Strip({ label, valueLabel, colors, position, onDrag }: StripProps) {
  const thumbY = useSharedValue(position * STRIP_HEIGHT);
  const lastInt = useSharedValue(-1);

  const doHaptic = useCallback(() => {
    Haptics.selectionAsync();
  }, []);

  const gesture = Gesture.Pan()
    .onStart((e) => {
      const y = Math.max(0, Math.min(STRIP_HEIGHT, e.y));
      thumbY.value = y;
      runOnJS(onDrag)(y / STRIP_HEIGHT);
    })
    .onUpdate((e) => {
      const y = Math.max(0, Math.min(STRIP_HEIGHT, e.y));
      thumbY.value = y;
      const norm = y / STRIP_HEIGHT;
      const intVal = Math.round(norm * 100);
      if (intVal !== lastInt.value) {
        lastInt.value = intVal;
        runOnJS(doHaptic)();
      }
      runOnJS(onDrag)(norm);
    })
    .hitSlop({ horizontal: 20, vertical: 10 });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: thumbY.value - THUMB_HEIGHT / 2 }],
  }));

  return (
    <View style={styles.stripContainer}>
      <Text style={styles.stripLabel}>{label}</Text>
      <GestureDetector gesture={gesture}>
        <View style={styles.stripWrapper}>
          <LinearGradient
            colors={colors as any}
            style={styles.strip}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </View>
      </GestureDetector>
      <Text style={styles.stripValue}>{valueLabel}</Text>
    </View>
  );
}

export function HSBColorPicker({ value, onChange }: HSBColorPickerProps) {
  const hex = hsbToHex(value);

  // Hue: rainbow spectrum
  const hueColors = [
    "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ff0000",
  ];

  // Saturation: desaturated to saturated at current H+B
  const satColors = [0, 25, 50, 75, 100].map((s) =>
    hsbToHex({ h: value.h, s, b: value.b })
  );

  // Brightness: bright (top) to dark (bottom)
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
          onDrag={(y) => onChange({ ...value, h: Math.round(y * 360) })}
        />
        <Strip
          label="S"
          valueLabel={`${Math.round(value.s)}%`}
          colors={satColors}
          position={value.s / 100}
          onDrag={(y) => onChange({ ...value, s: Math.round(y * 100) })}
        />
        <Strip
          label="B"
          valueLabel={`${Math.round(value.b)}%`}
          colors={briColors}
          position={1 - value.b / 100}
          onDrag={(y) => onChange({ ...value, b: Math.round((1 - y) * 100) })}
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
  stripWrapper: {
    width: STRIP_WIDTH,
    height: STRIP_HEIGHT,
    borderRadius: STRIP_WIDTH / 2,
    overflow: "hidden",
    position: "relative",
  },
  strip: {
    width: "100%",
    height: "100%",
    borderRadius: STRIP_WIDTH / 2,
  },
  thumb: {
    position: "absolute",
    left: (STRIP_WIDTH - THUMB_WIDTH) / 2,
    width: THUMB_WIDTH,
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
