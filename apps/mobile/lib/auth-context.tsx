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
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession();

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  role: string;
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
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, role")
      .eq("id", userId)
      .single();
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
    try {
      const redirectTo = makeRedirectUri();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data.url) {
        return "Google Sign In failed. Please try again.";
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );

      if (result.type === "success") {
        const url = new URL(result.url);
        // Extract tokens from the URL fragment
        const params = new URLSearchParams(url.hash.substring(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) return "Google Sign In failed. Please try again.";
          return null;
        }
      }

      if (result.type === "cancel" || result.type === "dismiss") {
        return null;
      }

      return "Google Sign In failed. Please try again.";
    } catch (e: any) {
      return "Google Sign In failed. Please try again.";
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
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
      return null;
    } catch (e: any) {
      return e.message || "Failed to delete account";
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signUp, signInWithApple, signInWithGoogle, signOut, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}
