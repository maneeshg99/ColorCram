"use client";

import dynamic from "next/dynamic";

const AuthModal = dynamic(
  () => import("@/components/auth/AuthModal").then((m) => ({ default: m.AuthModal })),
  { ssr: false }
);

export function LazyAuthModal() {
  return <AuthModal />;
}
