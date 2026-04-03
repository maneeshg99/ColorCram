"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";

export function AuthButton() {
  const { user, profile, loading, setShowAuthModal, signOut } = useAuth();

  if (loading) {
    return <div className="w-16 h-8" />;
  }

  if (user && profile) {
    return (
      <div className="flex items-center gap-3">
        {profile.role === "admin" && (
          <a
            href="/admin"
            className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
          >
            Admin
          </a>
        )}
        <span className="text-sm font-medium hidden sm:inline">
          {profile.username}
        </span>
        <motion.button
          onClick={signOut}
          className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Sign Out
        </motion.button>
      </div>
    );
  }

  return (
    <motion.button
      onClick={() => setShowAuthModal(true)}
      className="text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Sign In
    </motion.button>
  );
}
