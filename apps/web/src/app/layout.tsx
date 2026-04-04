import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthProvider } from "@/lib/auth-context";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthModal } from "@/components/auth/AuthModal";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ColorCram - Test Your Color Memory",
  description:
    "A color memory game that challenges your visual perception. Memorize colors, recreate them, and compete on global leaderboards.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("cg-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body className={`${inter.variable} font-[family-name:var(--font-inter)] min-h-screen`}>
        <ThemeProvider>
          <AuthProvider>
            <header className="fixed top-0 left-0 right-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
              <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 h-14">
                <a href="/" className="text-lg font-[900] tracking-tighter">
                  Color<span className="opacity-40">Cram</span>
                </a>
                <div className="flex items-center gap-2 sm:gap-5">
                  <a
                    href="/play"
                    className="text-xs sm:text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors duration-200"
                  >
                    Play
                  </a>
                  <a
                    href="/leaderboard"
                    className="text-xs sm:text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors duration-200"
                  >
                    Leaderboard
                  </a>
                  <AuthButton />
                  <ThemeToggle />
                </div>
              </nav>
            </header>
            <main className="pt-14">{children}</main>
            <footer className="border-t border-[var(--border)] py-4 text-center">
              <span className="text-xs text-[var(--fg-muted)] opacity-50">
                ColorCram v0.5.0
              </span>
            </footer>
            <AuthModal />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
