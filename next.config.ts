import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from the source website
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'disnakertrans.serangkab.go.id',
        pathname: '/**',
      },
    ],
  },

  // Server external packages (needed for better-sqlite3 and node-cron)
  serverExternalPackages: ['better-sqlite3', 'node-cron'],
};

export default nextConfig;
