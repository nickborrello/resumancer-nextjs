/**
 * NextAuth.js Type Extensions
 * 
 * Extends NextAuth types to include custom properties from backend user data.
 * These properties are added to the session during the session callback.
 */

import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  /**
   * Extended Session User
   * 
   * Includes backend user data in the NextAuth session.
   */
  interface Session {
    user: {
      /** NextAuth user ID (from frontend user table) */
      id: string
      /** Backend user ID (from backend users table) */
      backendId: string | null
      /** User's email address */
      email: string
      /** User's full name */
      name?: string | null
      /** User's profile image URL */
      image?: string | null
      /** User's available credits */
      credits: number
      /** User's subscription tier (free, pro, etc.) */
      subscriptionTier: string
      /** Email verification timestamp from backend */
      emailVerified: Date | null
    }
  }

  /**
   * Extended User
   * 
   * Adds custom properties to the User type used in callbacks.
   */
  interface User {
    /** Backend user ID */
    backendId?: string | null
    /** User's available credits */
    credits?: number
    /** User's subscription tier */
    subscriptionTier?: string
  }
}

declare module "next-auth/jwt" {
  /**
   * Extended JWT
   * 
   * Includes custom properties in JWT tokens.
   */
  interface JWT {
    /** Backend user ID */
    backendId?: string | null
    /** User's available credits */
    credits?: number
    /** User's subscription tier */
    subscriptionTier?: string
  }
}
