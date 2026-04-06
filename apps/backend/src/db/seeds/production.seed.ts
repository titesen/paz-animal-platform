import { eq } from "drizzle-orm";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { hashPassword } from "../../common/utils/password.util";
import { db, pool } from "../index";
import * as schema from "../schema";

/**
 * Production Data Seeder
 *
 * Creates essential data required for production deployment:
 * 1. Master reference data (via master-data.seed.ts)
 * 2. Initial admin user (bootstrap)
 *
 * Security: Requires ADMIN_DEFAULT_PASSWORD environment variable in production
 * Idempotency: Safe to run multiple times
 */
async function seedProduction() {
  try {
    logger.info("🚀 Starting production data seeding...");

    // ==========================================
    // 1. MASTER DATA (Reference Tables)
    // ==========================================
    logger.info("→ Seeding master data...");
    const { seedMasterData } = await import("./master-data.seed");
    await seedMasterData();

    // ==========================================
    // 2. INITIAL ADMIN USER (Bootstrap)
    // ==========================================
    logger.info("→ Creating initial admin user...");

    // Validate password is configured in production
    if (env.NODE_ENV === "production" && !env.ADMIN_DEFAULT_PASSWORD) {
      throw new Error(
        "ADMIN_DEFAULT_PASSWORD is required in production environment. " +
          "Set this environment variable before running production seeder.",
      );
    }

    // Hash password (fallback only allowed in non-production)
    const adminPasswordHash = await hashPassword(env.ADMIN_DEFAULT_PASSWORD || "Admin123!");

    // Create or update admin user
    const [adminUser] = await db
      .insert(schema.users)
      .values({
        firstName: "Admin",
        lastName: "Sistema",
        email: env.ADMIN_DEFAULT_EMAIL,
        passwordHash: adminPasswordHash,
        docType: "DNI",
        docNumber: "99999999",
        nationalityIso: "AR",
        phone: "+54 379 4000-000",
        birthDate: "1990-01-01",
      })
      .onConflictDoUpdate({
        target: schema.users.email,
        set: {
          passwordHash: adminPasswordHash,
          // Update timestamp to track when password was last reset
        },
      })
      .returning();

    // Assign ADMIN role
    const adminRole = await db
      .select()
      .from(schema.roles)
      .where(eq(schema.roles.name, "ADMIN"))
      .limit(1)
      .then((r) => r[0]);

    if (!adminRole) {
      throw new Error("ADMIN role not found. Ensure master-data.seed.ts ran successfully.");
    }

    await db
      .insert(schema.usersRoles)
      .values({ userId: adminUser.userId, roleId: adminRole.roleId })
      .onConflictDoNothing();

    logger.info(`✅ Admin user created: ${adminUser.email}`);

    if (env.NODE_ENV !== "production") {
      logger.warn("⚠️  Default password used. Change it immediately via admin panel!");
    }

    logger.info("✅ Production seeding completed successfully!");
  } catch (error) {
    logger.error({ error }, "❌ Production seeding failed");
    throw error;
  } finally {
    await pool.end();
    // Force exit to ensure process terminates cleanly
    process.exit(0);
  }
}

// Execute seeder
seedProduction();
