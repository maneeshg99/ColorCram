import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Platform } from "react-native";
import type { User } from "@supabase/supabase-js";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { supabase } from "./supabase";

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
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
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => null,
  signUp: async () => null,
  signInWithApple: async () => null,
  signOut: async () => {},
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
      .select("id, username, avatar_url")
      .eq("id", userId)
      .single();
    if (error) {
      if (__DEV__) console.error("Failed to fetch profile:", error.message);
      return;
    }
    if (data) setProfile(data);
  }, []);

  useEffect(() => {
    // Register listener FIRST to avoid missing events between getSession and subscribe
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // Bootstrap: read cached session, then validate with server
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Validate the token server-side before trusting it
        const { data: { user: validatedUser } } = await supabase.auth.getUser();
        setUser(validatedUser ?? null);
        if (validatedUser) fetchProfile(validatedUser.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return error ? "Invalid email or password" : null;
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
      return error ? "Could not create account. Please try again." : null;
    },
    []
  );

  const signInWithApple = useCallback(async (): Promise<string | null> => {
    if (Platform.OS !== "ios") {
      return "Apple Sign In is only available on iOS";
    }

    try {
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

      if (error) return "Apple Sign In failed. Please try again.";

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
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ display_name: displayName })
            .eq("id", currentUser.id);
          if (updateError && __DEV__) {
            console.error("Failed to update display name:", updateError.message);
          }
        }
      }

      return null;
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        return null;
      }
      return "Apple Sign In failed. Please try again.";
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // Clear local state only after server-side sign-out succeeds
    setUser(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signUp, signInWithApple, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
