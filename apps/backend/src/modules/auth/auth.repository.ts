/**
 * @file Auth Repository
 * @description Data access layer for authentication-related database operations
 * @pattern Repository Pattern - Encapsulates data persistence logic
 */

import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import * as schema from "../../db/schema";
import type { NewUser } from "../../common/types";
import type { IAuthRepository } from "./auth.repository.interface";

/**
 * Find user by email
 */
export async function findUserByEmail(email: string) {
  const result = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);

  return result[0] || null;
}

/**
 * Find user by ID
 */
export async function findUserById(userId: string) {
  const result = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.userId, userId))
    .limit(1);

  return result[0] || null;
}

/**
 * Create a new user
 */
export async function createUser(userData: NewUser) {
  const result = await db.insert(schema.users).values(userData).returning();

  return result[0];
}

/**
 * Get user roles
 */
export async function getUserRoles(userId: string): Promise<string[]> {
  const userRoles = await db
    .select({
      roleName: schema.roles.name,
    })
    .from(schema.usersRoles)
    .innerJoin(schema.roles, eq(schema.usersRoles.roleId, schema.roles.roleId))
    .where(eq(schema.usersRoles.userId, userId));

  return userRoles.map((ur) => ur.roleName);
}

/**
 * Assign role to user
 */
export async function assignRoleToUser(userId: string, roleName: string): Promise<void> {
  // First, find the role ID
  const role = await db.select().from(schema.roles).where(eq(schema.roles.name, roleName)).limit(1);

  if (!role[0]) {
    throw new Error(`Role ${roleName} not found`);
  }

  // Assign role to user (ignore if already exists)
  await db
    .insert(schema.usersRoles)
    .values({
      userId,
      roleId: role[0].roleId,
    })
    .onConflictDoNothing();
}

/**
 * Update user password
 */
export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  await db
    .update(schema.users)
    .set({
      passwordHash,
    })
    .where(eq(schema.users.userId, userId));
}

/**
 * Find user by Google ID
 */
export async function findUserByGoogleId(googleId: string) {
  const result = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.googleId, googleId))
    .limit(1);

  return result[0] || null;
}

/**
 * Soft delete user (set deletedAt timestamp)
 */
export async function softDeleteUser(userId: string): Promise<void> {
  await db
    .update(schema.users)
    .set({
      deletedAt: new Date(),
    })
    .where(eq(schema.users.userId, userId));
}

/**
 * Check if email is already taken
 */
export async function isEmailTaken(email: string): Promise<boolean> {
  const existing = await db
    .select({ userId: schema.users.userId })
    .from(schema.users)
    .where(and(eq(schema.users.email, email)))
    .limit(1);

  return existing.length > 0;
}

/**
 * Update user profile fields
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<typeof schema.users.$inferInsert>,
) {
  const result = await db
    .update(schema.users)
    .set(data)
    .where(eq(schema.users.userId, userId))
    .returning();

  return result[0] || null;
}

/**
 * Update 2FA secret and enabled status
 */
export async function update2FASecret(
  userId: string,
  secret: string | null,
  enabled: boolean,
): Promise<void> {
  await db
    .update(schema.users)
    .set({
      tfaSecret: secret,
      tfaEnabled: enabled,
    })
    .where(eq(schema.users.userId, userId));
}

// Compile-time contract verification
void ({
  findUserByEmail,
  findUserById,
  createUser,
  getUserRoles,
  assignRoleToUser,
  updateUserPassword,
  findUserByGoogleId,
  softDeleteUser,
  isEmailTaken,
  updateUserProfile,
  update2FASecret,
} satisfies IAuthRepository);

export async function findUserByDocNumber(docType: string, docNumber: string) {
  const result = await db
    .select()
    .from(schema.users)
    .where(and(eq(schema.users.docType, docType as any), eq(schema.users.docNumber, docNumber)))
    .limit(1);
  return result[0] || null;
}
