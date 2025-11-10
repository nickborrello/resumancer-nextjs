/**
 * NextAuth.js Database Schema for Drizzle ORM (PostgreSQL)
 * 
 * This schema defines the four core tables required by NextAuth.js v5:
 * - users: User accounts
 * - accounts: OAuth provider account linkage
 * - sessions: Active user sessions
 * - verificationTokens: Email verification and magic links
 * 
 * Schema matches NextAuth.js Drizzle Adapter requirements:
 * https://authjs.dev/getting-started/adapters/drizzle
 */

import {
  pgTable,
  text,
  timestamp,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "next-auth/adapters"

/**
 * Users Table
 * 
 * Stores core user information from OAuth providers.
 * The `id` is auto-generated UUID, used as the primary key.
 */
export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
})

/**
 * Accounts Table
 * 
 * Links users to their OAuth provider accounts (Google, GitHub, Microsoft).
 * Stores OAuth tokens and metadata.
 * 
 * Composite primary key: (provider, providerAccountId)
 * Foreign key: userId references users.id (cascade delete)
 */
export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

/**
 * Sessions Table
 * 
 * Stores active user sessions.
 * Each session has a unique sessionToken used for authentication.
 * 
 * Primary key: sessionToken
 * Foreign key: userId references users.id (cascade delete)
 */
export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

/**
 * Verification Tokens Table
 * 
 * Used for email verification and magic link authentication.
 * Tokens expire after a set time period.
 * 
 * Composite primary key: (identifier, token)
 * 
 * Note: OAuth-only setup may not use this table frequently,
 * but it's required by the NextAuth.js adapter schema.
 */
export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
)

/**
 * Type Exports for TypeScript
 * 
 * These types are inferred from the Drizzle schema and can be used
 * throughout the application for type-safe database operations.
 */
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Account = typeof accounts.$inferSelect
export type NewAccount = typeof accounts.$inferInsert

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert

export type VerificationToken = typeof verificationTokens.$inferSelect
export type NewVerificationToken = typeof verificationTokens.$inferInsert
