import { handlers } from "@/auth"

/**
 * NextAuth.js v5 API Route Handler
 * 
 * Handles all authentication requests:
 * - GET /api/auth/signin: Sign-in page with OAuth providers
 * - GET /api/auth/signout: Sign-out confirmation
 * - GET /api/auth/callback/[provider]: OAuth callback handling
 * - POST /api/auth/signin/[provider]: Initiate OAuth flow
 * - GET /api/auth/session: Get current session
 * - GET /api/auth/providers: List configured providers
 * - GET /api/auth/csrf: CSRF token
 * 
 * The handlers are exported from the centralized auth.ts configuration.
 */
export const { GET, POST } = handlers
