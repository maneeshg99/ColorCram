import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Not Found",
};

export default function NotFound() {
  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center px-8 gap-4 text-center"
      style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
    >
      <div className="flex flex-col items-center gap-4 max-w-md">
        <h1
          className="font-black tracking-tighter leading-none"
          style={{ fontSize: "clamp(3rem, 10vw, 6rem)" }}
        >
          404
        </h1>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--fg-muted)" }}
        >
          This page doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button variant="primary" className="mt-4">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
