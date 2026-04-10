"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export function AuthButton() {
  const { user, profile, loading, setShowAuthModal, signOut, deleteAccount } =
    useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Show "sign in" optimistically while auth loads instead of blank placeholder
  if (loading) {
    return (
      <button
        onClick={() => setShowAuthModal(true)}
        className="text-xs text-[#adadad] hover:text-white transition-colors duration-200"
      >
        sign in
      </button>
    );
  }

  if (user && profile) {
    return (
      <div className="relative flex items-center gap-4">
        {profile.role === "admin" && (
          <a
            href="/admin"
            className="text-xs text-[#666] hover:text-white transition-colors duration-200"
          >
            admin
          </a>
        )}
        <span className="text-xs text-[#adadad]">{profile.username}</span>
        <button
          onClick={signOut}
          className="text-xs text-[#666] hover:text-white transition-colors duration-200"
        >
          sign out
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="text-xs text-[#444] hover:text-[#ff3b3b] transition-colors duration-200"
        >
          delete account
        </button>

        {/* Delete confirmation modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <div className="relative z-10 w-full max-w-sm rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#1a1a1a] p-8">
              <h3 className="text-lg font-black tracking-tight text-white mb-3">
                Delete Account
              </h3>
              <p className="text-sm text-[#999] leading-relaxed mb-6">
                This will permanently delete your account and all your data
                including scores and game history. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white bg-[#333] hover:bg-[#444] transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setDeleting(true);
                    const err = await deleteAccount();
                    setDeleting(false);
                    if (err) {
                      alert(err);
                    }
                    setShowDeleteConfirm(false);
                  }}
                  disabled={deleting}
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white bg-[#ff3b3b] hover:bg-[#cc2f2f] transition-colors duration-200 disabled:opacity-40"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
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
