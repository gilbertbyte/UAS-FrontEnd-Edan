import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  // better-sqlite3 adalah modul native, jangan di-bundle oleh Next
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
