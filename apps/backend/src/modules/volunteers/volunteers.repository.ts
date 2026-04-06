/**
 * @file Volunteers Repository
 * @description Data access layer for volunteers and their role assignments
 */

import { eq, isNull } from "drizzle-orm";
import { db } from "../../db";
import * as schema from "../../db/schema";
import type { IVolunteersRepository } from "./volunteers.repository.interface";

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

// ===== VOLUNTEER APPLICATIONS =====

/**
 * Create a new volunteer application
 */
export async function createVolunteerApplication(data: {
  firstName: string;
  lastName: string;
  email: string;
  docNumber: string;
  phone: string;
  birthDate: Date;
  instagramHandle?: string;
  hasExperience: boolean;
  experienceDetails?: string;
  wasVolunteerBefore: boolean;
  motivation: string;
  availability: unknown;
}) {
  const [result] = await db
    .insert(schema.volunteerApplications)
    .values({
      ...data,
      birthDate: data.birthDate.toISOString().split("T")[0],
      availability: JSON.stringify(data.availability),
    })
    .returning();

  return result;
}

/**
 * Get all volunteer applications (with pagination and filtering)
 */
export async function findAllApplications(filters?: {
  status?: "PENDING" | "APPROVED" | "REJECTED";
  limit?: number;
  offset?: number;
}) {
  const baseQuery = db.select().from(schema.volunteerApplications);

  if (filters?.status) {
    return await baseQuery
      .where(eq(schema.volunteerApplications.status, filters.status))
      .limit(filters?.limit || 50)
      .offset(filters?.offset || 0)
      .orderBy(schema.volunteerApplications.appliedAt);
  }

  const results = await baseQuery
    .limit(filters?.limit || 50)
    .offset(filters?.offset || 0)
    .orderBy(schema.volunteerApplications.appliedAt);

  return results;
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: "PENDING" | "APPROVED" | "REJECTED",
  adminNotes?: string,
) {
  const [result] = await db
    .update(schema.volunteerApplications)
    .set({
      status,
      adminNotes,
      decidedAt: new Date(),
    })
    .where(eq(schema.volunteerApplications.applicationId, applicationId))
    .returning();

  return result || null;
}

// ===== VOLUNTEER MANAGEMENT =====

/**
 * Create a new volunteer record (typically after application approval)
 */
export async function createVolunteer(data: {
  userId: string;
  bio?: string;
  availability: unknown;
}) {
  const [result] = await db.insert(schema.volunteers).values(data).returning();

  return result;
}

/**
 * Get all active volunteers
 */
export async function findAllVolunteers() {
  return db
    .select()
    .from(schema.volunteers)
    .where(isNull(schema.volunteers.deletedAt))
    .orderBy(schema.volunteers.createdAt);
}

/**
 * Get volunteer by ID
 */
export async function findVolunteerById(volunteerId: string) {
  const [result] = await db
    .select()
    .from(schema.volunteers)
    .where(eq(schema.volunteers.volunteerId, volunteerId))
    .limit(1);

  return result || null;
}

/**
 * Update volunteer
 */
export async function updateVolunteer(
  volunteerId: string,
  data: {
    bio?: string;
    availability?: unknown;
  },
) {
  const [result] = await db
    .update(schema.volunteers)
    .set(data)
    .where(eq(schema.volunteers.volunteerId, volunteerId))
    .returning();

  return result || null;
}

/**
 * Soft delete volunteer
 */
export async function deleteVolunteer(volunteerId: string) {
  const [result] = await db
    .update(schema.volunteers)
    .set({ deletedAt: new Date() })
    .where(eq(schema.volunteers.volunteerId, volunteerId))
    .returning();

  return result || null;
}

// Compile-time contract verification
void ({
  findVolunteerApplicationById,
  findVolunteerByUserId,
  findVolunteerWithTags,
  assignVolunteerTag,
  removeVolunteerTag,
  findAllVolunteerRoles,
  createVolunteerApplication,
  findAllApplications,
  updateApplicationStatus,
  createVolunteer,
  findAllVolunteers,
  findVolunteerById,
  updateVolunteer,
  deleteVolunteer,
} satisfies IVolunteersRepository);
