/**
 * Database Client Configuration for Drizzle ORM
 *
 * Configures PostgreSQL connection for production deployment.
 * Uses postgres driver for database operations.
 *
 * Environment Variables Required:
 * - DATABASE_URL: PostgreSQL connection string
 */

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Create PostgreSQL connection
const client = postgres(process.env.DATABASE_URL!)

/**
 * Drizzle ORM Database Instance
 *
 * Exports a configured Drizzle instance with the schema.
 * Use this `db` object for all database operations.
 */
export const db = drizzle(client, { schema })
