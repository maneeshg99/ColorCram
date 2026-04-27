"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Modal, ModalHeader, ModalActions } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function AuthButton() {
  const {
    user,
    profile,
    loading,
    setShowAuthModal,
    signOut,
    deleteAccount,
    changeUsername,
  } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Username change modal state
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameSubmitting, setUsernameSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuccessFlash, setUsernameSuccessFlash] = useState(false);

  const openUsernameModal = () => {
    setUsernameInput(profile?.username ?? "");
    setUsernameError(null);
    setShowUsernameModal(true);
  };
  const closeUsernameModal = () => {
    if (usernameSubmitting) return;
    setShowUsernameModal(false);
    setUsernameError(null);
    setUsernameSuccessFlash(false);
  };
  const submitUsername = async () => {
    setUsernameError(null);
    setUsernameSubmitting(true);
    const result = await changeUsername(usernameInput);
    setUsernameSubmitting(false);
    if (result.status === "ok") {
      setUsernameSuccessFlash(true);
      setTimeout(() => {
        setUsernameSuccessFlash(false);
        setShowUsernameModal(false);
      }, 900);
    } else if (result.status === "noop") {
      setShowUsernameModal(false);
    } else {
      setUsernameError(result.message);
    }
  };

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
        <button
          onClick={openUsernameModal}
          title="Change username"
          aria-label={`Change username (current: ${profile.username})`}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--fg)",
            maxWidth: 180,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            textDecoration: "underline dotted",
            textDecorationColor: "var(--border-strong)",
            textUnderlineOffset: 4,
            transition:
              "color var(--duration-fast) var(--ease-out), text-decoration-color var(--duration-fast) var(--ease-out)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--fg-muted)";
            e.currentTarget.style.textDecorationColor = "var(--fg-muted)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--fg)";
            e.currentTarget.style.textDecorationColor = "var(--border-strong)";
          }}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 140,
            }}
          >
            {profile.username}
          </span>
          {/* Small pencil icon to signal editability */}
          <svg
            aria-hidden="true"
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.6 }}
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>
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

        {/* Change username modal */}
        <Modal
          open={showUsernameModal}
          onClose={closeUsernameModal}
          labelledBy="change-username-title"
          size="md"
        >
          {usernameSuccessFlash ? (
            <div
              role="status"
              style={{
                padding: "8px 0 16px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <h2
                id="change-username-title"
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "var(--fg)",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Username updated
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--fg-muted)",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Next change available in 30 days.
              </p>
            </div>
          ) : (
            <>
              <ModalHeader
                id="change-username-title"
                title="Change username"
                description="2-24 characters. Letters, numbers, and underscores only — no spaces or symbols. You can change your username once every 30 days."
              />
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value);
                  if (usernameError) setUsernameError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitUsername();
                }}
                placeholder="Username"
                maxLength={24}
                autoComplete="off"
                disabled={usernameSubmitting}
                autoFocus
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 10,
                  border: `1px solid ${
                    usernameError ? "#ff6a6a" : "var(--border)"
                  }`,
                  background: "var(--surface)",
                  color: "var(--fg)",
                  padding: "0 14px",
                  fontSize: 14,
                  fontWeight: 600,
                  outline: "none",
                  marginBottom: usernameError ? 8 : 16,
                  transition:
                    "border-color var(--duration-fast) var(--ease-out)",
                }}
              />
              {usernameError && (
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
                  {usernameError}
                </p>
              )}
              <ModalActions>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeUsernameModal}
                  disabled={usernameSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={
                    usernameSubmitting || usernameInput.trim().length < 2
                  }
                  onClick={submitUsername}
                >
                  {usernameSubmitting ? "Saving…" : "Save"}
                </Button>
              </ModalActions>
            </>
          )}
        </Modal>

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
