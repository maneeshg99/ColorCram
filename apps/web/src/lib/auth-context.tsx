"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";
import { validateEmail, validatePassword, validateUsername, sanitizeInput } from "@colorcram-v2/types";

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  role?: string;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (
    email: string,
    password: string,
    username: string
  ) => Promise<string | null>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  showAuthModal: false,
  setShowAuthModal: () => {},
  signIn: async () => null,
  signUp: async () => null,
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
  const [showAuthModal, setShowAuthModal] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, role")
      .eq("id", userId)
      .single();
    if (error) {
      if (process.env.NODE_ENV === "development") console.error("Failed to fetch profile:", error.message);
      return;
    }
    if (data) setProfile(data);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();

    // Register listener FIRST to avoid missing events between getSession and subscribe
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // Bootstrap: read cached session, then validate with server
    supabase.auth.getSession().then(async ({ data: { session } }: { data: { session: any } }) => {
      if (session?.user) {
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
      const emailResult = validateEmail(sanitizeInput(email));
      if (!emailResult.valid) return emailResult.error ?? "Invalid email";
      const pwResult = validatePassword(password);
      if (!pwResult.valid) return pwResult.error ?? "Invalid password";

      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizeInput(email),
        password,
      });
      if (error) return "Invalid email or password";
      setShowAuthModal(false);
      return null;
    },
    []
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      username: string
    ): Promise<string | null> => {
      const emailResult = validateEmail(sanitizeInput(email));
      if (!emailResult.valid) return emailResult.error ?? "Invalid email";
      const pwResult = validatePassword(password);
      if (!pwResult.valid) return pwResult.error ?? "Invalid password";
      const usernameResult = validateUsername(sanitizeInput(username));
      if (!usernameResult.valid) return usernameResult.error ?? "Invalid username";

      const supabase = getSupabase();
      const { error } = await supabase.auth.signUp({
        email: sanitizeInput(email),
        password,
        options: { data: { username: sanitizeInput(username) } },
      });
      if (error) return "Could not create account. Please try again.";
      setShowAuthModal(false);
      return null;
    },
    []
  );

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    // Clear local state only after server-side sign-out succeeds
    setUser(null);
    setProfile(null);
  }, []);

  const deleteAccount = useCallback(async (): Promise<string | null> => {
    try {
      const supabase = getSupabase();
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
      value={{
        user,
        profile,
        loading,
        showAuthModal,
        setShowAuthModal,
        signIn,
        signUp,
        signOut,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
