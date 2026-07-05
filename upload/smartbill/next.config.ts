import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Required so the Electron build can bundle a self-contained Node server
  // instead of a static export (this app needs server-side API routes + Prisma).
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Keep Prisma's native binary engine out of the webpack/file-tracing bundle
  // so its .node engine files get copied as-is into the standalone output.
  serverExternalPackages: ['@prisma/client', '.prisma/client'],
};

export default nextConfig;
