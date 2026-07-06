import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "yahoo-finance2"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Disable ESLint during build for faster iteration
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
