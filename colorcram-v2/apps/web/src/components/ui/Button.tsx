"use client";

import { motion } from "motion/react";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm font-medium",
  lg: "px-10 py-4 text-base font-semibold",
};

const variantClasses = {
  primary:
    "bg-[var(--accent)] text-[var(--bg)] hover:shadow-[0_0_24px_rgba(var(--glow-rgb),0.15)]",
  secondary:
    "border border-[var(--border)] text-[var(--fg)] hover:bg-[var(--surface-elevated)] hover:border-[var(--fg-muted)]",
  ghost:
    "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)]",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      className={`rounded-lg transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
