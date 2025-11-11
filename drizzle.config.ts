/**
 * Drizzle Kit Configuration
 *
 * Configuration for Drizzle Kit CLI tools:
 * - Migration generation: `npm run db:generate` (DATABASE_URL required for postgresql)
 * - Migration execution: `npm run db:migrate` (requires DATABASE_URL)
 * - Drizzle Studio: `npm run db:studio` (requires DATABASE_URL)
 *
 * Environment Variables:
 * - DATABASE_URL: PostgreSQL connection string
 */

import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/database/schema.ts",
  out: "./src/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
