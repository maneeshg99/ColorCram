import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider } from "@/lib/auth-context";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    AsyncStorage.getItem("hasSeenOnboarding").then((value) => {
      setHasSeenOnboarding(value === "true");
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    if (!isReady) return;
    // Only redirect if we haven't seen onboarding and we're not already on the onboarding screen
    const onOnboarding = segments[0] === "onboarding";
    if (!hasSeenOnboarding && !onOnboarding) {
      router.replace("/onboarding");
    }
  }, [isReady, hasSeenOnboarding, segments, router]);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <View style={styles.root}>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="onboarding"
              options={{ animation: "fade" }}
            />
            <Stack.Screen
              name="game"
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="auth/modal"
              options={{ presentation: "modal", animation: "slide_from_bottom" }}
            />
          </Stack>
        </View>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
});
