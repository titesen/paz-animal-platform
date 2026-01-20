// Database connection and Drizzle instance
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { env } from "../config/env.js";
import * as schema from "./schema/index.js";
const { Pool } = pkg;

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error if no connection is available within 2 seconds
});

// Test database connection on startup
pool.on("connect", () => {
  console.log("✅ Database connection established");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected database error:", err);
  process.exit(-1);
});

// Create Drizzle instance with schema
export const db = drizzle(pool, { schema });

// Export pool for manual queries if needed
export { pool };
