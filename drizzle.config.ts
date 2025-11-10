/**
 * Drizzle Kit Configuration
 * 
 * Configuration for Drizzle Kit CLI tools:
 * - Migration generation: `npm run db:generate` (DATABASE_URL optional for sqlite)
 * - Migration execution: `npm run db:migrate` (requires DATABASE_URL)
 * - Drizzle Studio: `npm run db:studio` (requires DATABASE_URL)
 * 
 * Environment Variables:
 * - DATABASE_URL: SQLite file path (optional, defaults to ./dev.db)
 */

import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/database/schema.ts",
  out: "./src/database/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "./dev.db",
  },
  verbose: true,
  strict: true,
});
