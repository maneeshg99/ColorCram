import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@colorguesser/color-utils",
    "@colorguesser/game-logic",
    "@colorguesser/types",
  ],
};

export default nextConfig;
