"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Modal, ModalHeader, ModalActions } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function AuthButton() {
  const { user, profile, loading, setShowAuthModal, signOut, deleteAccount } =
    useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const linkStyle: React.CSSProperties = {
    fontSize: 12.5,
    fontWeight: 500,
    color: "var(--fg-subtle)",
    transition: "color var(--duration-fast) var(--ease-out)",
  };

  if (loading) {
    return (
      <button
        onClick={() => setShowAuthModal(true)}
        style={{ ...linkStyle, color: "var(--fg-muted)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--fg)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--fg-muted)";
        }}
      >
        Sign in
      </button>
    );
  }

  if (user && profile) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {profile.role === "admin" && (
          <a
            href="/admin"
            style={linkStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--fg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--fg-subtle)";
            }}
          >
            admin
          </a>
        )}
        <span
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--fg)",
            maxWidth: 120,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {profile.username}
        </span>
        <button
          onClick={signOut}
          style={linkStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--fg)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--fg-subtle)";
          }}
        >
          sign out
        </button>
        <button
          onClick={() => {
            setDeleteError(null);
            setShowDeleteConfirm(true);
          }}
          style={{ ...linkStyle, color: "var(--fg-faint)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#ff6a6a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--fg-faint)";
          }}
        >
          delete account
        </button>

        <Modal
          open={showDeleteConfirm}
          onClose={() => !deleting && setShowDeleteConfirm(false)}
          labelledBy="delete-account-title"
          size="md"
        >
          <ModalHeader
            id="delete-account-title"
            title="Delete your account"
            description="This permanently removes your account, scores, and game history. This cannot be undone."
          />
          {deleteError && (
            <p
              role="alert"
              style={{
                fontSize: 12.5,
                color: "#ff6a6a",
                background: "rgba(255, 106, 106, 0.08)",
                border: "1px solid rgba(255, 106, 106, 0.2)",
                borderRadius: 10,
                padding: "8px 12px",
                marginBottom: 16,
                lineHeight: 1.4,
              }}
            >
              {deleteError}
            </p>
          )}
          <ModalActions>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={deleting}
              onClick={async () => {
                setDeleting(true);
                setDeleteError(null);
                const err = await deleteAccount();
                setDeleting(false);
                if (err) {
                  setDeleteError(err);
                } else {
                  setShowDeleteConfirm(false);
                }
              }}
            >
              {deleting ? "Deleting…" : "Delete account"}
            </Button>
          </ModalActions>
        </Modal>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowAuthModal(true)}
      style={{
        ...linkStyle,
        color: "var(--fg-muted)",
        padding: "6px 14px",
        borderRadius: 999,
        border: "1px solid var(--border-strong)",
        fontSize: 12.5,
        fontWeight: 600,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--fg)";
        e.currentTarget.style.borderColor = "var(--border-focus)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--fg-muted)";
        e.currentTarget.style.borderColor = "var(--border-strong)";
      }}
    >
      Sign in
    </button>
  );
}
