/**
 * @file Volunteers Repository
 * @description Data access layer for volunteers and their role assignments
 */

import { eq } from "drizzle-orm";
import { db } from "../../db";
import * as schema from "../../db/schema";

export async function findVolunteerApplicationById(applicationId: string) {
  const result = await db
    .select()
    .from(schema.volunteerApplications)
    .where(eq(schema.volunteerApplications.applicationId, applicationId))
    .limit(1);

  return result[0] || null;
}

/**
 * Get volunteer record by user ID
 */
export async function findVolunteerByUserId(userId: string) {
  const result = await db
    .select()
    .from(schema.volunteers)
    .where(eq(schema.volunteers.userId, userId))
    .limit(1);

  return result[0] || null;
}

/**
 * Get volunteer with all assigned tags/roles
 */
export async function findVolunteerWithTags(volunteerId: string) {
  const volunteer = await db
    .select()
    .from(schema.volunteers)
    .where(eq(schema.volunteers.volunteerId, volunteerId))
    .limit(1);

  if (!volunteer.length) {
    return null;
  }

  const tags = await db
    .select({
      roleId: schema.volunteerRoles.roleId,
      roleName: schema.volunteerRoles.name,
      description: schema.volunteerRoles.description,
      assignedAt: schema.volunteersVolunteerRoles.assignedAt,
    })
    .from(schema.volunteersVolunteerRoles)
    .innerJoin(
      schema.volunteerRoles,
      eq(schema.volunteersVolunteerRoles.roleId, schema.volunteerRoles.roleId),
    )
    .where(eq(schema.volunteersVolunteerRoles.volunteerId, volunteerId));

  return {
    ...volunteer[0],
    tags,
  };
}

/**
 * Assign role/tag to volunteer
 */
export async function assignVolunteerTag(volunteerId: string, roleId: number) {
  const result = await db
    .insert(schema.volunteersVolunteerRoles)
    .values({
      volunteerId,
      roleId,
    })
    .onConflictDoNothing()
    .returning();

  return result[0] || null;
}

/**
 * Remove role/tag from volunteer
 */
export async function removeVolunteerTag(volunteerId: string, roleId: number) {
  const result = await db
    .delete(schema.volunteersVolunteerRoles)
    .where(
      eq(schema.volunteersVolunteerRoles.volunteerId, volunteerId) &&
        eq(schema.volunteersVolunteerRoles.roleId, roleId),
    )
    .returning();

  return result.length > 0;
}

/**
 * Get all available volunteer roles
 */
export async function findAllVolunteerRoles() {
  return db.select().from(schema.volunteerRoles);
}
