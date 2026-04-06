import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Configuration for Migrations
 *
 * Uses DATABASE_MIGRATION_URL for DDL operations (db_owner user)
 * Falls back to DATABASE_URL for backward compatibility
 *
 * SEC-03: "Dos Sombreros" Strategy - Migrations use privileged user
 */
export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
