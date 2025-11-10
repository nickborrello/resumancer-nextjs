import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import type { Provider } from "next-auth/providers"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./database/db"
import * as schema from "./database/schema"

/**
 * NextAuth.js v5 Configuration with Drizzle Adapter
 * 
 * Configures OAuth-only authentication with Google, GitHub, and Microsoft providers.
 * Uses Drizzle ORM adapter for PostgreSQL database session persistence.
 * All credentials are sourced from environment variables following NextAuth v5 conventions.
 * 
 * Environment variables required:
 * - AUTH_SECRET: Secret for signing tokens
 * - DATABASE_URL: PostgreSQL connection string
 * - AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET: Google OAuth credentials
 * - AUTH_GITHUB_ID, AUTH_GITHUB_SECRET: GitHub OAuth credentials
 * - AUTH_MICROSOFT_ENTRA_ID_ID, AUTH_MICROSOFT_ENTRA_ID_SECRET: Microsoft OAuth credentials
 * - AUTH_MICROSOFT_ENTRA_ID_TENANT_ID: Microsoft tenant ID
 */

/**
 * Microsoft Entra ID (formerly Azure AD) Provider Configuration
 * 
 * NextAuth v5 uses the naming convention "microsoft-entra-id" for Azure AD.
 * This provider requires tenantId in addition to clientId and clientSecret.
 */
const MicrosoftEntraId: Provider = {
  id: "microsoft-entra-id",
  name: "Microsoft",
  type: "oidc",
  issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`,
  clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
  clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
  authorization: {
    params: {
      scope: "openid profile email",
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),
  providers: [
    Google,
    GitHub,
    MicrosoftEntraId,
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    /**
     * Sign-In Callback - User Migration Logic
     * 
     * Links OAuth users to existing backend users by email.
     * Creates new backend user if none exists.
     * 
     * This ensures data preservation for existing users migrating from
     * the Vite app's JWT authentication to NextAuth.js OAuth.
     */
    async signIn({ user, account }) {
      try {
        // Only link on first sign-in (account exists means OAuth flow)
        if (!account) return true

        const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3000"

        // Call backend to link/create user
        const response = await fetch(`${BACKEND_API_URL}/api/auth/link-oauth-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            image: user.image,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          }),
        })

        if (!response.ok) {
          console.error("Failed to link OAuth user to backend:", await response.text())
          // Allow sign-in to continue even if backend linking fails
          // User can still authenticate, but backend data may not be available
          return true
        }

        const data = await response.json()
        console.log("User linked to backend:", data)
        return true
      } catch (error) {
        console.error("Error in signIn callback:", error)
        // Allow sign-in to continue despite errors
        return true
      }
    },

    /**
     * Session Callback - Enhance Session with Backend Data
     * 
     * Fetches user data from backend (credits, subscription, etc.)
     * and includes it in the NextAuth session for client-side access.
     */
    async session({ session, user }) {
      try {
        const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:3000"

        // Fetch backend user data by email
        const response = await fetch(`${BACKEND_API_URL}/api/users/by-email/${user.email}`)
        
        if (response.ok) {
          const backendUser = await response.json()
          
          // Enhance session with backend data
          session.user.id = user.id // NextAuth user ID
          session.user.backendId = backendUser.id // Backend user ID
          session.user.credits = backendUser.credits
          session.user.subscriptionTier = backendUser.subscription_tier
          session.user.emailVerified = backendUser.email_verified
        } else {
          // Backend user not found, include minimal session data
          session.user.id = user.id
          session.user.backendId = null
          session.user.credits = 0
          session.user.subscriptionTier = "free"
        }

        return session
      } catch (error) {
        console.error("Error enhancing session:", error)
        // Return basic session if backend fetch fails
        session.user.id = user.id
        return session
      }
    },

    /**
     * Authorized Callback - Route Protection
     * 
     * Controls access to protected routes based on authentication status.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
      const isOnResume = nextUrl.pathname.startsWith("/resume")
      const isOnProfile = nextUrl.pathname.startsWith("/profile")
      const isOnCredits = nextUrl.pathname.startsWith("/credits")
      const isOnResumes = nextUrl.pathname.startsWith("/resumes")
      
      const isProtectedRoute = 
        isOnDashboard || 
        isOnResume || 
        isOnProfile || 
        isOnCredits || 
        isOnResumes

      if (isProtectedRoute) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return true
      }

      return true
    },
  },
})
