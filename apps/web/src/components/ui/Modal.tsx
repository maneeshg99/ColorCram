"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  labelledBy?: string;
  /** Width preset. Defaults to "sm" (360px). */
  size?: "sm" | "md";
}

/**
 * Shared modal shell — centered, dark surface, hairline border, tinted shadow.
 * Replaces the several copy-pasted confirmation dialogs across the app.
 * Handles overlay click + Escape to close.
 */
export function Modal({ open, onClose, children, labelledBy, size = "sm" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const maxWidth = size === "md" ? 440 : 360;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: "var(--z-modal)" as unknown as number,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "rgba(5, 5, 10, 0.72)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth,
              background: "var(--surface-elevated)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-lg)",
              padding: "28px 28px 24px",
              boxShadow: "var(--shadow-lg), var(--shadow-inset)",
              position: "relative",
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ModalHeaderProps {
  title: string;
  description?: ReactNode;
  id?: string;
}

export function ModalHeader({ title, description, id }: ModalHeaderProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2
        id={id}
        style={{
          fontSize: 17,
          fontWeight: 800,
          letterSpacing: "-0.015em",
          color: "var(--fg)",
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          style={{
            fontSize: 13.5,
            color: "var(--fg-muted)",
            marginTop: 6,
            lineHeight: 1.55,
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

interface ModalActionsProps {
  children: ReactNode;
  align?: "right" | "stretch";
}

export function ModalActions({ children, align = "right" }: ModalActionsProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        justifyContent: align === "right" ? "flex-end" : "stretch",
        marginTop: 4,
      }}
    >
      {children}
    </div>
  );
}
