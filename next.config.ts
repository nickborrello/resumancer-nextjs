import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google OAuth images
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // GitHub OAuth images
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com', // Discord OAuth images
      },
    ],
  },
  async rewrites() {
    return [
      {
        // Proxy all /api/* routes to backend EXCEPT /api/auth/* (handled by NextAuth)
        source: "/api/:path((?!auth).*)*",
        destination: `${process.env.BACKEND_API_URL}/api/:path*`,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env['SENTRY_ORG'],
  project: process.env['SENTRY_PROJECT'],
});
