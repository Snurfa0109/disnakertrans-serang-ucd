import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'disnakertrans.serangkab.go.id',
        pathname: '/**',
      },
    ],
  },

  serverExternalPackages: ['postgres', 'node-cron'],

  // Required: fixes Turbopack detecting wrong lockfile (C:\Users\ACER\package-lock.json)
  turbopack: {
    root: process.cwd(),
  },

  // HTTP Security Headers (OWASP & SPBE Standards)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' *",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
