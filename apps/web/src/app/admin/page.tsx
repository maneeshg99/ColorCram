"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { getSupabase } from "@/lib/supabase";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
  games_played: number;
}

export default function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const isAdmin = profile?.role === "admin";

  const fetchUsers = useCallback(async () => {
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("admin_get_users");
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setUsers((data ?? []) as AdminUser[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }
    fetchUsers();
  }, [user, isAdmin, authLoading, fetchUsers]);

  const handleRoleChange = async (targetId: string, newRole: string) => {
    const supabase = getSupabase();
    const { error } = await supabase.rpc("admin_update_role", {
      target_user_id: targetId,
      new_role: newRole,
    });
    if (error) {
      setActionMsg(`Error: ${error.message}`);
    } else {
      setActionMsg(`Role updated to ${newRole}`);
      fetchUsers();
    }
    setTimeout(() => setActionMsg(null), 3000);
  };

  const handleDeleteUser = async (targetId: string, username: string) => {
    if (!confirm(`Delete user "${username}"? This removes all their scores and cannot be undone.`)) {
      return;
    }
    const supabase = getSupabase();
    const { error } = await supabase.rpc("admin_delete_user", {
      target_user_id: targetId,
    });
    if (error) {
      setActionMsg(`Error: ${error.message}`);
    } else {
      setActionMsg(`User "${username}" deleted`);
      fetchUsers();
    }
    setTimeout(() => setActionMsg(null), 3000);
  };

  const handleResetPassword = async (email: string) => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin`,
    });
    if (error) {
      setActionMsg(`Error: ${error.message}`);
    } else {
      setActionMsg(`Password reset email sent to ${email}`);
    }
    setTimeout(() => setActionMsg(null), 3000);
  };

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex justify-center py-24 text-[var(--fg-muted)]">
        Loading...
      </div>
    );
  }

  // Not logged in or not admin
  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center py-24 gap-4">
        <h1 className="text-xl font-[800]">Access Denied</h1>
        <p className="text-sm text-[var(--fg-muted)]">
          {!user ? "You must be signed in." : "Admin access required."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="font-[900] tracking-tight"
              style={{ fontSize: "var(--text-heading)" }}
            >
              Admin Panel
            </h1>
            <p className="text-sm text-[var(--fg-muted)] mt-1">
              {users.length} registered users
            </p>
          </div>
        </div>

        {/* Action message */}
        {actionMsg && (
          <motion.div
            className="mb-4 px-4 py-2 rounded-lg bg-[var(--surface)] text-sm border border-[var(--border)]"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {actionMsg}
          </motion.div>
        )}

        {/* Users table */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-[var(--surface)] animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-sm text-[var(--score-poor)]">{error}</div>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 text-xs text-[var(--fg-muted)] uppercase tracking-wider">
              <span className="flex-1">User</span>
              <span className="w-40">Email</span>
              <span className="w-16 text-center">Role</span>
              <span className="w-16 text-center">Games</span>
              <span className="w-48 text-right">Actions</span>
            </div>

            {users.map((u) => (
              <motion.div
                key={u.id}
                className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-4 rounded-xl bg-[var(--surface)] ${
                  u.id === user.id
                    ? "border border-[var(--accent)]/30"
                    : ""
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-[700] truncate">
                    {u.username}
                    {u.id === user.id && (
                      <span className="text-xs text-[var(--fg-muted)] ml-1">
                        (you)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--fg-muted)] sm:hidden">
                    {u.email}
                  </div>
                </div>

                <span className="hidden sm:block w-40 text-xs text-[var(--fg-muted)] truncate">
                  {u.email}
                </span>

                <span
                  className={`w-16 text-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                    u.role === "admin"
                      ? "bg-[var(--accent)]/10 text-[var(--fg)]"
                      : "text-[var(--fg-muted)]"
                  }`}
                >
                  {u.role}
                </span>

                <span className="w-16 text-center text-xs text-[var(--fg-muted)] tabular-nums">
                  {u.games_played}
                </span>

                <div className="flex gap-2 w-48 justify-end">
                  {u.id !== user.id && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRoleChange(
                            u.id,
                            u.role === "admin" ? "user" : "admin"
                          )
                        }
                      >
                        {u.role === "admin" ? "Demote" : "Promote"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResetPassword(u.email)}
                      >
                        Reset PW
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[var(--score-poor)]"
                        onClick={() => handleDeleteUser(u.id, u.username)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
