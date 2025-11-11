import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import type { Provider } from "next-auth/providers"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./database/db"
import { eq } from "drizzle-orm"
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
    Google({
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: profile.email_verified ? new Date() : null,
        }
      }
    }),
    GitHub,
    MicrosoftEntraId,
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    /**
     * Session Callback - Enhance Session with Backend Data
     * 
     * Fetches user data from backend (credits, subscription, etc.)
     * and includes it in the NextAuth session for client-side access.
     */
    async session({ session, user }) {
      try {
        // Query user data from local database
        const dbUser = await db
          .select({
            credits: schema.users.credits,
            subscriptionTier: schema.users.subscription_tier,
            emailVerified: schema.users.emailVerified,
          })
          .from(schema.users)
          .where(eq(schema.users.id, user.id))
          .limit(1)

        if (dbUser.length > 0) {
          const userData = dbUser[0]!
          // Enhance session with database data
          session.user.id = user.id
          session.user.credits = userData.credits ?? 0
          session.user.subscriptionTier = userData.subscriptionTier ?? "free"
          session.user.emailVerified = userData.emailVerified ? new Date(userData.emailVerified) : null
        } else {
          // User not found in database, log error and set defaults
          console.error(`User with id ${user.id} not found in database`)
          session.user.id = user.id
          session.user.credits = 0
          session.user.subscriptionTier = "free"
          session.user.emailVerified = null
        }

        return session
      } catch (error) {
        console.error("Error enhancing session:", error)
        // Return basic session if database query fails
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
