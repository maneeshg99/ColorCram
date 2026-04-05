"use client";

import { useAuth } from "@/lib/auth-context";

export function AuthButton() {
  const { user, profile, loading, setShowAuthModal, signOut } = useAuth();

  if (loading) {
    return <div className="w-12 h-4" />;
  }

  if (user && profile) {
    return (
      <div className="flex items-center gap-4">
        {profile.role === "admin" && (
          <a
            href="/admin"
            className="text-xs text-[#666] hover:text-white transition-colors duration-200"
          >
            admin
          </a>
        )}
        <span className="text-xs text-[#adadad]">
          {profile.username}
        </span>
        <button
          onClick={signOut}
          className="text-xs text-[#666] hover:text-white transition-colors duration-200"
        >
          sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowAuthModal(true)}
      className="text-xs text-[#adadad] hover:text-white transition-colors duration-200"
    >
      sign in
    </button>
  );
}
