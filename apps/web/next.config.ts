import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Type checking is done separately via `tsc --noEmit`.
    // Next.js build picks up @types/react@18 from the mobile app in the monorepo,
    // causing "type cannot be named" errors. Skip it here.
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    "@colorcram/color-utils",
    "@colorcram/game-logic",
    "@colorcram/types",
  ],
};

export default nextConfig;
