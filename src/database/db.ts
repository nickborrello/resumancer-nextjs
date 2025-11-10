/**
 * Database Client Configuration for Drizzle ORM
 * 
 * Configures SQLite connection for NextAuth.js session storage.
 * Uses better-sqlite3 for local development.
 * 
 * Environment Variables Required:
 * - DATABASE_URL: SQLite file path (optional, defaults to ./dev.db)
 */

import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import * as schema from "./schema"

const sqlite = new Database(process.env.DATABASE_URL || "./dev.db")

/**
 * Drizzle ORM Database Instance
 * 
 * Exports a configured Drizzle instance with the schema.
 * Use this `db` object for all database operations.
 */
export const db = drizzle(sqlite, { schema })
