import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
let AppleAuthentication: typeof import("expo-apple-authentication") | null = null;
try {
  AppleAuthentication = require("expo-apple-authentication");
} catch {
  // Native module not available in Expo Go — Apple button hidden
}
import { useAuth } from "@/lib/auth-context";
import { Colors } from "@/constants/theme";
import {
  validateUsername,
  validateEmail,
  validatePassword,
  sanitizeInput,
} from "@colorcram-v2/types";

export default function AuthModal() {
  const router = useRouter();
  const { signIn, signUp, signInWithApple, signInWithGoogle } = useAuth();
  const c = Colors.dark;

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const handleSubmit = async () => {
    setError(null);

    // Brute-force protection: lock out after 5 consecutive failures
    if (lockedUntil && Date.now() < lockedUntil) {
      const secondsLeft = Math.ceil((lockedUntil - Date.now()) / 1000);
      setError(`Too many failed attempts. Try again in ${secondsLeft}s.`);
      return;
    }
    if (lockedUntil && Date.now() >= lockedUntil) {
      setLockedUntil(null);
      setFailedAttempts(0);
    }

    // Validate inputs
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setError(emailCheck.error!);
      return;
    }

    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      setError(pwCheck.error!);
      return;
    }

    if (mode === "signup") {
      const usernameCheck = validateUsername(username);
      if (!usernameCheck.valid) {
        setError(usernameCheck.error!);
        return;
      }
    }

    setLoading(true);

    let err: string | null;
    if (mode === "signin") {
      err = await signIn(sanitizeInput(email), password);
    } else {
      err = await signUp(sanitizeInput(email), password, sanitizeInput(username));
    }

    setLoading(false);
    if (err) {
      const newCount = failedAttempts + 1;
      setFailedAttempts(newCount);
      if (newCount >= 5) {
        setLockedUntil(Date.now() + 30000);
        setError("Too many failed attempts. Try again in 30s.");
      } else {
        setError(err);
      }
    } else {
      setFailedAttempts(0);
      setLockedUntil(null);
      router.back();
    }
  };

  const handleAppleSignIn = async () => {
    setError(null);
    setLoading(true);
    const err = await signInWithApple();
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.surface }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        {/* Close button */}
        <Pressable
          onPress={() => router.back()}
          style={styles.closeBtn}
          hitSlop={12}
        >
          <Text style={[styles.closeBtnText, { color: c.fgMuted }]}>✕</Text>
        </Pressable>

        <Text style={[styles.title, { color: c.fg }]}>
          {mode === "signin" ? "Sign In" : "Create Account"}
        </Text>

        {/* Apple Sign In button (iOS only, requires native module) */}
        {Platform.OS === "ios" && AppleAuthentication && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              mode === "signin"
                ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
                : AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
            }
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={10}
            style={styles.appleBtn}
            onPress={handleAppleSignIn}
          />
        )}

        {/* Google Sign In button (all platforms) */}
        <Pressable
          onPress={async () => {
            setError(null);
            setLoading(true);
            const err = await signInWithGoogle();
            setLoading(false);
            if (err) setError(err);
            else router.back();
          }}
          style={[styles.googleBtn, { borderColor: c.border }]}
        >
          <Text style={[styles.googleBtnText, { color: c.fg }]}>
            Continue with Google
          </Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
          <Text style={[styles.dividerText, { color: c.fgMuted }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
        </View>

        {mode === "signup" && (
          <View>
            <TextInput
              style={[styles.input, { color: c.fg, borderColor: c.border }]}
              placeholder="Username"
              placeholderTextColor={c.fgMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={24}
            />
            <Text style={[styles.hint, { color: c.fgMuted }]}>
              2-24 characters, letters, numbers, underscores
            </Text>
          </View>
        )}

        <TextInput
          style={[styles.input, { color: c.fg, borderColor: c.border }]}
          placeholder="Email"
          placeholderTextColor={c.fgMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={254}
        />

        <TextInput
          style={[styles.input, { color: c.fg, borderColor: c.border }]}
          placeholder="Password"
          placeholderTextColor={c.fgMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          maxLength={128}
        />

        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={[
            styles.submitBtn,
            { backgroundColor: c.accent, opacity: loading ? 0.7 : 1 },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={c.bg} />
          ) : (
            <Text style={[styles.submitBtnText, { color: c.bg }]}>
              {mode === "signin" ? "Sign In" : "Create Account"}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
          }}
        >
          <Text style={[styles.switchText, { color: c.fgMuted }]}>
            {mode === "signin"
              ? "Don't have an account? Sign Up"
              : "Already have an account? Sign In"}
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 14,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 24,
    zIndex: 10,
  },
  closeBtnText: { fontSize: 20 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: "center",
  },
  appleBtn: {
    height: 48,
    width: "100%",
  },
  googleBtn: {
    height: 48,
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  hint: {
    fontSize: 11,
    marginTop: 4,
  },
  error: {
    color: Colors.score.poor,
    fontSize: 13,
    textAlign: "center",
  },
  submitBtn: {
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  submitBtnText: { fontSize: 16, fontWeight: "700" },
  switchText: { fontSize: 13, textAlign: "center", marginTop: 4 },
});
