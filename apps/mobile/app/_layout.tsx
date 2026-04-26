import { useEffect, useRef } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider } from "@/lib/auth-context";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function RootLayout() {
  const router = useRouter();
  const didCheck = useRef(false);

  // Run once on mount: if the user hasn't seen onboarding, send them there.
  // After this runs we never check again — onboarding's finishOnboarding()
  // writes the flag and navigates to (tabs). If we kept checking on every
  // segment change, the stale `hasSeenOnboarding` state would loop us back.
  useEffect(() => {
    if (didCheck.current) return;
    didCheck.current = true;
    AsyncStorage.getItem("hasSeenOnboarding").then((value) => {
      if (value !== "true") {
        router.replace("/onboarding");
      }
    });
  }, [router]);

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
