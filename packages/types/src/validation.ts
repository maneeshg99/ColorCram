/**
 * Shared input validation for auth forms.
 * These run client-side AND are enforced server-side via DB constraints.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateUsername(username: string): ValidationResult {
  const trimmed = username.trim();
  if (!trimmed) return { valid: false, error: "Username is required" };
  if (trimmed.length < 2) return { valid: false, error: "Username must be at least 2 characters" };
  if (trimmed.length > 24) return { valid: false, error: "Username must be 24 characters or less" };
  if (!USERNAME_REGEX.test(trimmed)) {
    return { valid: false, error: "Username can only contain letters, numbers, and underscores" };
  }
  return { valid: true };
}

export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  if (!trimmed) return { valid: false, error: "Email is required" };
  if (!EMAIL_REGEX.test(trimmed)) return { valid: false, error: "Enter a valid email address" };
  if (trimmed.length > 254) return { valid: false, error: "Email is too long" };
  return { valid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) return { valid: false, error: "Password is required" };
  if (password.length < 8) return { valid: false, error: "Password must be at least 8 characters" };
  if (password.length > 128) return { valid: false, error: "Password is too long" };
  return { valid: true };
}

/** Sanitize a string — strip leading/trailing whitespace, collapse internal whitespace */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}
