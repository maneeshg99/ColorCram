import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https://api.colorcram.app wss://api.colorcram.app https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  typescript: {
    // Type checking is done separately via `tsc --noEmit`.
    // Next.js build picks up @types/react@18 from the mobile app in the monorepo,
    // causing "type cannot be named" errors. Skip it here.
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    "@colorcram-v2/color-utils",
    "@colorcram-v2/game-logic",
    "@colorcram-v2/types",
  ],
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ["framer-motion", "motion"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
