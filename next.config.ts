import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully client-rendered app (realtime store) — cache components add no value
  // and generate dev-mode instant-navigation warnings.
  cacheComponents: false,
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
