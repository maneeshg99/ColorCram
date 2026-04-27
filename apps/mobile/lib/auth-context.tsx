import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Platform } from "react-native";
import type { User } from "@supabase/supabase-js";
import * as Crypto from "expo-crypto";
import { supabase } from "./supabase";

// Native Google Sign-In — lazily required because the native module
// isn't present in Expo Go (only in EAS dev builds and production).
let GoogleSignin:
  | typeof import("@react-native-google-signin/google-signin").GoogleSignin
  | null = null;
let GoogleStatusCodes:
  | typeof import("@react-native-google-signin/google-signin").statusCodes
  | null = null;
try {
  const mod = require("@react-native-google-signin/google-signin");
  GoogleSignin = mod.GoogleSignin;
  GoogleStatusCodes = mod.statusCodes;
} catch {
  // Native module not installed — Google Sign-In button will be hidden
}

// Configure once at module load. Both client IDs come from Google Cloud
// Console for the same OAuth project. The iOS client ID is needed to
// initiate native sign-in. The web client ID is what Supabase has
// configured under Auth → Providers → Google, and is used to verify
// the ID token on Supabase's side via signInWithIdToken.
const GOOGLE_WEB_CLIENT_ID =
  "595175145400-0vbmd6cvua3a8fiin8uq8qnn3n33lpf0.apps.googleusercontent.com";
// IMPORTANT: replace this placeholder with the iOS OAuth client ID
// you created in Google Cloud Console (must match bundle id
// com.colorcram.app). Without a real value, native sign-in fails with
// "DEVELOPER_ERROR" before the account picker even opens.
const GOOGLE_IOS_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "";

if (GoogleSignin && GOOGLE_IOS_CLIENT_ID) {
  GoogleSignin.configure({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    // Request the ID token (we hand it to Supabase). offlineAccess=false
    // because we don't need the long-lived refresh token from Google;
    // Supabase issues its own refresh token for our session.
    offlineAccess: false,
    scopes: ["profile", "email"],
  });
}

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  role: string;
}

export interface ChangeUsernameResult {
  /** ok | noop | cooldown | conflict | error */
  status: "ok" | "noop" | "cooldown" | "conflict" | "error";
  message: string;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (
    email: string,
    password: string,
    username: string
  ) => Promise<string | null>;
  signInWithApple: () => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
  changeUsername: (newUsername: string) => Promise<ChangeUsernameResult>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => null,
  signUp: async () => null,
  signInWithApple: async () => null,
  signInWithGoogle: async () => null,
  signOut: async () => {},
  deleteAccount: async () => null,
  resetPassword: async () => null,
  changeUsername: async () => ({ status: "error", message: "Not initialized" }),
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, role")
      .eq("id", userId)
      .single();
    if (error) {
      if (error.code === "PGRST116") {
        // Profile doesn't exist — account was deleted but session lingers
        setProfile(null);
        setUser(null);
        await supabase.auth.signOut();
      }
      return;
    }
    if (data) setProfile(data);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return error ? error.message : null;
    },
    []
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      username: string
    ): Promise<string | null> => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      return error ? error.message : null;
    },
    []
  );

  const signInWithApple = useCallback(async (): Promise<string | null> => {
    if (Platform.OS !== "ios") {
      return "Apple Sign In is only available on iOS";
    }

    try {
      const AppleAuthentication = require("expo-apple-authentication");

      const rawNonce = Crypto.randomUUID();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      );

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!credential.identityToken) {
        return "Apple Sign In failed — no identity token received";
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
        nonce: rawNonce,
      });

      if (error) return error.message;

      // If Apple provided a full name (first sign-in only), update the profile
      if (credential.fullName?.givenName) {
        const displayName = [
          credential.fullName.givenName,
          credential.fullName.familyName,
        ]
          .filter(Boolean)
          .join(" ");

        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        if (currentUser) {
          await supabase
            .from("profiles")
            .update({ username: displayName })
            .eq("id", currentUser.id);
        }
      }

      return null;
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        return null;
      }
      return e.message || "Apple Sign In failed";
    }
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<string | null> => {
    if (!GoogleSignin) {
      return "Google Sign In requires the native module — install the dev build.";
    }
    if (!GOOGLE_IOS_CLIENT_ID) {
      return "Google Sign In is not configured. Contact support.";
    }

    try {
      // Make sure Google Play Services / native auth services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Native account picker sheet appears here. Returns a userInfo
      // object with an idToken we hand to Supabase.
      const userInfo = await GoogleSignin.signIn();
      // SDK 16+ returns { type: "success" | "cancelled", data: { ... } }
      if (userInfo.type === "cancelled") {
        return null;
      }
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        return "Google Sign In failed — no identity token received.";
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (error) return error.message;
      return null;
    } catch (e: any) {
      // statusCodes.SIGN_IN_CANCELLED is what older SDK versions throw
      if (
        GoogleStatusCodes &&
        (e?.code === GoogleStatusCodes.SIGN_IN_CANCELLED ||
          e?.code === "SIGN_IN_CANCELLED")
      ) {
        return null;
      }
      if (
        GoogleStatusCodes &&
        e?.code === GoogleStatusCodes.IN_PROGRESS
      ) {
        return null; // sign-in already in flight, ignore the duplicate tap
      }
      if (
        GoogleStatusCodes &&
        e?.code === GoogleStatusCodes.PLAY_SERVICES_NOT_AVAILABLE
      ) {
        // Misnamed status code — actually fires on iOS too if the Google
        // SDK can't initialize. Use a platform-neutral message.
        return "Google Sign In is unavailable. Please try again.";
      }
      if (__DEV__) {
        console.warn("[signInWithGoogle]", e);
      }
      return e?.message ?? "Google Sign In failed. Please try again.";
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // Best-effort native Google sign-out so the next tap re-prompts
    // the account picker (instead of silently re-using the cached one).
    if (GoogleSignin) {
      try {
        await GoogleSignin.signOut();
      } catch {
        // Not signed in to Google or no native module — ignore.
      }
    }
    setProfile(null);
  }, []);

  const deleteAccount = useCallback(async (): Promise<string | null> => {
    try {
      const { error } = await supabase.rpc("delete_own_account");
      if (error) return error.message;
      // Clear local state after successful deletion
      setUser(null);
      setProfile(null);
      await supabase.auth.signOut();
      if (GoogleSignin) {
        try {
          await GoogleSignin.signOut();
          // revokeAccess removes the OAuth grant on Google's side so the
          // user gets the consent screen again next time, not just the
          // picker. Important after a delete-account.
          await GoogleSignin.revokeAccess();
        } catch {
          /* ignore */
        }
      }
      return null;
    } catch (e: any) {
      return e.message || "Failed to delete account";
    }
  }, []);

  const resetPassword = useCallback(
    async (email: string): Promise<string | null> => {
      try {
        // Mobile reset flow uses the web reset page as the redirect target.
        // Email link opens the user's mobile browser; they set a new password
        // there, then come back to the app and sign in.
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: "https://colorcram.app/auth/reset-password",
        });
        // Always return success regardless of whether the email exists,
        // to prevent account enumeration. UI shows generic success message.
        if (error && __DEV__) {
          console.warn("resetPasswordForEmail error:", error.message);
        }
        return null;
      } catch {
        return null;
      }
    },
    []
  );

  const changeUsername = useCallback(
    async (newUsername: string): Promise<ChangeUsernameResult> => {
      const trimmed = (newUsername ?? "").trim();
      if (trimmed.length < 2 || trimmed.length > 24) {
        return { status: "error", message: "Username must be 2-24 characters" };
      }
      if (!/^[A-Za-z0-9_]+$/.test(trimmed)) {
        return {
          status: "error",
          message: "Letters, numbers, and underscores only",
        };
      }
      try {
        const { data, error } = await supabase.rpc("change_username", {
          new_username: trimmed,
        });
        if (error) {
          return {
            status: "error",
            message: error.message ?? "Couldn't update username",
          };
        }
        // RPC returns a single-row table — supabase-js gives us an array
        const row = Array.isArray(data) ? data[0] : data;
        if (!row?.status) {
          return { status: "error", message: "Unexpected response" };
        }
        // On success, refresh the profile so UI reflects new username
        if (row.status === "ok" && user) {
          await fetchProfile(user.id);
        }
        return {
          status: row.status as ChangeUsernameResult["status"],
          message: row.message ?? "",
        };
      } catch (e: any) {
        return {
          status: "error",
          message: e?.message ?? "Network error. Try again.",
        };
      }
    },
    [user, fetchProfile]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signInWithApple,
        signInWithGoogle,
        signOut,
        deleteAccount,
        resetPassword,
        changeUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
