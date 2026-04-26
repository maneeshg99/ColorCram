import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { LazyAuthModal } from "@/components/auth/LazyAuthModal";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://colorcram.app"),
  title: {
    default: "ColorCram",
    template: "%s | ColorCram",
  },
  description:
    "Memorize a color. Recreate it from memory. Test your visual perception across four game modes.",
  applicationName: "ColorCram",
  keywords: [
    "color game",
    "memory game",
    "color perception",
    "color matching",
    "color quiz",
    "HSB picker",
  ],
  authors: [{ name: "ColorCram" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://colorcram.app",
    siteName: "ColorCram",
    title: "ColorCram",
    description:
      "Memorize a color. Recreate it from memory. Test your visual perception.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ColorCram",
    description: "Memorize a color. Recreate it from memory.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen antialiased`}
        style={{
          fontFamily: "var(--font-sans)",
          backgroundColor: "var(--bg)",
          color: "var(--fg)",
        }}
      >
        {/* Global grain — breaks flatness without touching layout */}
        <div className="cc-grain-fixed" aria-hidden="true" />
        <AuthProvider>
          {children}
          <LazyAuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
