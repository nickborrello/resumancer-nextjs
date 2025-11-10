/**
 * Drizzle Kit Configuration
 * 
 * Configuration for Drizzle Kit CLI tools:
 * - Migration generation: `npm run db:generate` (no DATABASE_URL needed)
 * - Migration execution: `npm run db:migrate` (requires DATABASE_URL)
 * - Drizzle Studio: `npm run db:studio` (requires DATABASE_URL)
 * 
 * Environment Variables:
 * - DATABASE_URL: PostgreSQL connection string (required for migrate/studio, optional for generate)
 */

import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/database/schema.ts",
  out: "./src/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://placeholder",
  },
  verbose: true,
  strict: true,
})
