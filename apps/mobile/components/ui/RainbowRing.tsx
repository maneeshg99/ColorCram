import React, { useEffect, useRef } from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

interface RainbowRingProps {
  size: number;
  children: React.ReactNode;
  spinning?: boolean;
  ringWidth?: number;
}

// 12 segments for smooth hue transitions — each covers 30 degrees
const SEGMENTS = [
  { from: "#ff0000", to: "#ff8000" },
  { from: "#ff8000", to: "#ffff00" },
  { from: "#ffff00", to: "#80ff00" },
  { from: "#80ff00", to: "#00ff00" },
  { from: "#00ff00", to: "#00ff80" },
  { from: "#00ff80", to: "#00ffff" },
  { from: "#00ffff", to: "#0080ff" },
  { from: "#0080ff", to: "#0000ff" },
  { from: "#0000ff", to: "#8000ff" },
  { from: "#8000ff", to: "#ff00ff" },
  { from: "#ff00ff", to: "#ff0080" },
  { from: "#ff0080", to: "#ff0000" },
];

const NUM_SEGMENTS = SEGMENTS.length;

export function RainbowRing({
  size,
  children,
  spinning = false,
  ringWidth = 2,
}: RainbowRingProps) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (spinning) {
      const anim = Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      anim.start();
      return () => anim.stop();
    } else {
      rotation.setValue(0);
    }
  }, [spinning]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const innerSize = size - ringWidth * 2;
  const center = size / 2;
  const radius = (size - ringWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Slight overlap to eliminate seams between segments
  const segmentLength = circumference / NUM_SEGMENTS + 1;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.ringWrapper,
          { width: size, height: size, transform: [{ rotate: spin }] },
        ]}
      >
        <Svg width={size} height={size}>
          <Defs>
            {SEGMENTS.map((seg, i) => {
              // Rotate gradient direction to align with the arc's tangent
              const angle = ((i + 0.5) / NUM_SEGMENTS) * 2 * Math.PI - Math.PI / 2;
              const cos = Math.cos(angle);
              const sin = Math.sin(angle);
              return (
                <LinearGradient
                  key={`g${i}`}
                  id={`g${i}`}
                  x1={`${0.5 - cos * 0.5}`}
                  y1={`${0.5 - sin * 0.5}`}
                  x2={`${0.5 + cos * 0.5}`}
                  y2={`${0.5 + sin * 0.5}`}
                >
                  <Stop offset="0" stopColor={seg.from} />
                  <Stop offset="1" stopColor={seg.to} />
                </LinearGradient>
              );
            })}
          </Defs>
          {SEGMENTS.map((_, i) => (
            <Circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              stroke={`url(#g${i})`}
              strokeWidth={ringWidth}
              fill="none"
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={-(i * circumference) / NUM_SEGMENTS}
              strokeLinecap="butt"
              rotation={-90}
              origin={`${center}, ${center}`}
            />
          ))}
        </Svg>
      </Animated.View>

      <View
        style={[
          styles.inner,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  ringWrapper: {
    position: "absolute",
  },
  inner: {
    backgroundColor: "#131313",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
});
