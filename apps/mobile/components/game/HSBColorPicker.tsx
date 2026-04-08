import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  LayoutChangeEvent,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { HSB } from "@colorcram-v2/types";
import { hsbToHex } from "@colorcram-v2/color-utils";
import { Colors } from "@/constants/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const STRIP_HEIGHT = Math.min(SCREEN_HEIGHT * 0.42, 340);
const STRIP_WIDTH = 56;
const THUMB_HEIGHT = 6;

interface HSBColorPickerProps {
  value: HSB;
  onChange: (hsb: HSB) => void;
  rightContent?: React.ReactNode;
}

interface StripProps {
  label: string;
  valueLabel: string;
  colors: string[];
  position: number;
  onDrag: (position: number) => void;
}

function Strip({ label, valueLabel, colors, position, onDrag }: StripProps) {
  const stripPageY = useRef(0);
  const onDragRef = useRef(onDrag);
  onDragRef.current = onDrag;

  const handleTouch = useCallback((pageY: number) => {
    const relativeY = pageY - stripPageY.current;
    const clamped = Math.max(0, Math.min(STRIP_HEIGHT, relativeY));
    onDragRef.current(clamped / STRIP_HEIGHT);
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => handleTouch(evt.nativeEvent.pageY),
      onPanResponderMove: (evt) => handleTouch(evt.nativeEvent.pageY),
    })
  ).current;

  const handleViewLayout = useCallback((e: LayoutChangeEvent) => {
    e.target.measure?.(
      (_x: number, _y: number, _w: number, _h: number, _px: number, pageY: number) => {
        if (typeof pageY === "number" && !isNaN(pageY)) {
          stripPageY.current = pageY;
        }
      }
    );
  }, []);

  const thumbTop = Math.max(
    0,
    Math.min(STRIP_HEIGHT - THUMB_HEIGHT, position * STRIP_HEIGHT - THUMB_HEIGHT / 2)
  );

  return (
    <View style={styles.stripContainer}>
      <Text style={styles.stripLabel}>{label}</Text>
      <View
        style={styles.stripTouchArea}
        onLayout={handleViewLayout}
        {...panResponder.panHandlers}
      >
        <View style={styles.stripGradientClip}>
          <LinearGradient
            colors={colors as any}
            style={styles.strip}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          />
        </View>
        <View
          style={[styles.thumb, { top: thumbTop }]}
          pointerEvents="none"
        />
      </View>
      <Text style={styles.stripValue}>{valueLabel}</Text>
    </View>
  );
}

export function HSBColorPicker({ value, onChange, rightContent }: HSBColorPickerProps) {
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
      {/* Top row: preview circle + hex + submit button */}
      <View style={styles.topRow}>
        <View style={[styles.previewCircle, { backgroundColor: hex }]} />
        <View style={styles.topRowRight}>
          <Text style={styles.previewHex}>{hex}</Text>
          {rightContent}
        </View>
      </View>

      {/* Strips */}
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
    </View>
  );
}

const c = Colors.dark;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 16,
  },
  strips: { flexDirection: "row", gap: 16 },
  stripContainer: { alignItems: "center", gap: 6 },
  stripLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    color: c.fgMuted,
    textTransform: "uppercase",
  },
  stripTouchArea: {
    width: STRIP_WIDTH + 12,
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
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  topRowRight: {
    alignItems: "center",
    gap: 8,
  },
  previewCircle: {
    width: 144,
    height: 144,
    borderRadius: 72,
  },
  previewHex: {
    fontSize: 13,
    fontFamily: "monospace",
    color: c.fgMuted,
    letterSpacing: 0.5,
  },
});
