import Link from "next/link";
import { AuthButton } from "@/components/auth/AuthButton";
import { HomeContent } from "@/components/home/HomeContent";

export default function HomePage() {
  return (
    <div className="relative flex flex-col min-h-screen select-none">
      {/* Top nav bar — server-rendered */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
        style={{
          padding: "16px clamp(24px, 5vw, 48px)",
          backgroundColor: "rgba(19, 19, 19, 0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-6">
          <Link
            href="/leaderboard"
            className="text-sm font-black text-[#adadad] hover:text-white transition-colors duration-200 tracking-widest uppercase"
            style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
          >
            Leaderboard
          </Link>
          <Link
            href="/support"
            className="text-xs font-bold text-[#666] hover:text-[#adadad] transition-colors duration-200 tracking-wide uppercase"
            style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
          >
            Support
          </Link>
          <Link
            href="/privacy"
            className="text-xs font-bold text-[#666] hover:text-[#adadad] transition-colors duration-200 tracking-wide uppercase"
            style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
          >
            Privacy
          </Link>
        </div>
        <AuthButton />
      </div>

      {/* Client island — animations, sounds, mute toggle */}
      <HomeContent />
    </div>
  );
}
