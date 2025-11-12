import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Add canvas support for react-pdf
    config.resolve.alias.canvas = false;
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };
    return config;
  },
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
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env['SENTRY_ORG'],
  project: process.env['SENTRY_PROJECT'],
});
