import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ColorGuesser - Test Your Color Memory",
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
          <header className="fixed top-0 left-0 right-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 h-14">
              <a href="/" className="text-lg font-[900] tracking-tighter">
                Color<span className="opacity-40">Guesser</span>
              </a>
              <div className="flex items-center gap-6">
                <a
                  href="/play"
                  className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors duration-200"
                >
                  Play
                </a>
                <a
                  href="/leaderboard"
                  className="text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors duration-200"
                >
                  Leaderboard
                </a>
                <ThemeToggle />
              </div>
            </nav>
          </header>
          <main className="pt-14">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
