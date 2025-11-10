/**
 * Database Client Configuration for Drizzle ORM
 * 
 * Configures PostgreSQL connection for NextAuth.js session storage.
 * Uses connection pooling via the `postgres` library.
 * 
 * Environment Variables Required:
 * - DATABASE_URL: PostgreSQL connection string
 *   Format: postgresql://username:password@host:port/database
 *   Example: postgresql://user:pass@localhost:5432/resumancer
 */

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is not set. " +
    "Please add it to your .env.local file."
  )
}

/**
 * PostgreSQL Connection Client
 * 
 * Configuration:
 * - max: 1 connection (Next.js serverless functions use short-lived connections)
 * - Connection pooling handled by Vercel/Railway in production
 */
const client = postgres(process.env.DATABASE_URL, {
  max: 1, // Serverless-friendly: single connection per function invocation
})

/**
 * Drizzle ORM Database Instance
 * 
 * Exports a configured Drizzle instance with the NextAuth schema.
 * Use this `db` object for all database operations.
 */
export const db = drizzle(client, { schema })
