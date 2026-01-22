import { eq } from "drizzle-orm";
import { env } from "../../config/env";
import { hashPassword } from "../../shared/utils/password.util";
import { db, pool } from "../index";
import * as schema from "../schema";

console.log("Starting simple seeder...");

try {
  console.log("Hashing password...");
  const hash = await hashPassword(env.ADMIN_DEFAULT_PASSWORD || "Admin123!");
  console.log("Password hashed successfully");

  console.log("Inserting admin user...");
  const [admin] = await db
    .insert(schema.users)
    .values({
      firstName: "Admin",
      lastName: "Sistema",
      email: env.ADMIN_DEFAULT_EMAIL,
      passwordHash: hash,
      docType: "DNI",
      docNumber: "99999999",
      nationalityIso: "AR",
      phone: "+54 11 4444-5555",
      birthDate: "1990-01-01",
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: { passwordHash: hash },
    })
    .returning();

  console.log("Admin created:", admin.email);

  // Assign role
  console.log("Getting ADMIN role...");
  const adminRole = await db
    .select()
    .from(schema.roles)
    .where(eq(schema.roles.name, "ADMIN"))
    .limit(1)
    .then((r) => r[0]);

  if (adminRole) {
    console.log("Assigning role...");
    await db
      .insert(schema.usersRoles)
      .values({ userId: admin.userId, roleId: adminRole.roleId })
      .onConflictDoNothing();
    console.log("Role assigned");
  }

  console.log("✅ Seeding completed");
} catch (error) {
  console.error("❌ Error:", error);
} finally {
  await pool.end();
  console.log("Pool closed");
  process.exit(0);
}
