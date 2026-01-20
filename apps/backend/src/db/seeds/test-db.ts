// Simple database connection test
import { db, pool } from "../index.js";
import * as schema from "../schema/index.js";

async function testConnection() {
  try {
    console.log("Testing database connection...");

    const result = await db.select().from(schema.roles);
    console.log("Roles found:", result.length);
    console.log("Connection successful!");

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("Connection failed:", error);
    await pool.end();
    process.exit(1);
  }
}

testConnection();
