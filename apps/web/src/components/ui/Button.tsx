"use client";

import { motion } from "motion/react";
import type { ButtonHTMLAttributes, CSSProperties } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
  variant?: Variant;
  size?: Size;
  style?: CSSProperties;
}

const sizeStyle: Record<Size, CSSProperties> = {
  sm: { padding: "8px 16px", fontSize: 13, fontWeight: 600, borderRadius: 999 },
  md: { padding: "10px 20px", fontSize: 14, fontWeight: 600, borderRadius: 999 },
  lg: { padding: "14px 28px", fontSize: 15, fontWeight: 700, borderRadius: 999 },
};

const variantStyle: Record<Variant, CSSProperties> = {
  primary: {
    background: "var(--accent)",
    color: "var(--accent-ink)",
    border: "1px solid var(--accent)",
    boxShadow: "var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.2)",
  },
  secondary: {
    background: "transparent",
    color: "var(--fg)",
    border: "1px solid var(--border-strong)",
  },
  ghost: {
    background: "transparent",
    color: "var(--fg-muted)",
    border: "1px solid transparent",
  },
  danger: {
    background: "transparent",
    color: "#ff6a6a",
    border: "1px solid rgba(255, 106, 106, 0.35)",
  },
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  style,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const combined: CSSProperties = {
    ...sizeStyle[size],
    ...variantStyle[variant],
    letterSpacing: "-0.005em",
    cursor: "pointer",
    transition: "background var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out), opacity var(--duration-fast) var(--ease-out)",
    opacity: disabled ? 0.4 : 1,
    pointerEvents: disabled ? "none" : "auto",
    ...style,
  };

  return (
    <motion.button
      className={className}
      style={combined}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 450, damping: 30 }}
      disabled={disabled}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
