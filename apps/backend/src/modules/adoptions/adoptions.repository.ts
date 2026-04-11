/**
 * @file Adoptions Repository
 * @description Data access layer for adoption applications
 */

import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import * as schema from "../../db/schema";
import type { NewAdoptionApplication } from "../../common/types";
import type { IAdoptionsRepository } from "./adoptions.repository.interface";

export async function findAdoptionById(adoptionId: string) {
  const result = await db
    .select()
    .from(schema.adoptionApplications)
    .where(eq(schema.adoptionApplications.applicationId, adoptionId))
    .limit(1);

  return result[0] || null;
}

export async function createAdoptionApplication(data: NewAdoptionApplication) {
  const result = await db.insert(schema.adoptionApplications).values(data).returning();
  return result[0];
}

export async function updateAdoptionStatus(adoptionId: string, status: string) {
  const result = await db
    .update(schema.adoptionApplications)
    .set({ status: status as any })
    .where(eq(schema.adoptionApplications.applicationId, adoptionId))
    .returning();

  return result[0] || null;
}

export async function findAdoptionsByUser(userId: string) {
  return db
    .select()
    .from(schema.adoptionApplications)
    .where(eq(schema.adoptionApplications.clientId, userId));
}

export async function findAllAdoptions() {
  return db
    .select()
    .from(schema.adoptionApplications)
    .orderBy(schema.adoptionApplications.appliedAt);
}

// Compile-time contract verification
void ({
  findAdoptionById,
  createAdoptionApplication,
  updateAdoptionStatus,
  findAdoptionsByUser,
  findAllAdoptions,
} satisfies IAdoptionsRepository);

// ===== INTERVIEWS =====

export async function createInterview(data: {
  entityType: string;
  entityId: string;
  interviewerId: string;
  scheduledAt: Date;
  modality: "IN_PERSON" | "VIRTUAL" | "PHONE";
  durationMinutes?: number;
  locationDetails?: string;
}) {
  const [result] = await db.insert(schema.interviews).values(data).returning();
  return result;
}

export async function findInterviewsByEntity(entityType: string, entityId: string) {
  return db
    .select()
    .from(schema.interviews)
    .where(
      and(eq(schema.interviews.entityType, entityType), eq(schema.interviews.entityId, entityId)),
    )
    .orderBy(schema.interviews.scheduledAt);
}

export async function findInterviewById(interviewId: string) {
  const [result] = await db
    .select()
    .from(schema.interviews)
    .where(eq(schema.interviews.interviewId, interviewId))
    .limit(1);
  return result || null;
}

export async function updateInterview(
  interviewId: string,
  data: Partial<{
    scheduledAt: Date;
    modality: "IN_PERSON" | "VIRTUAL" | "PHONE";
    durationMinutes: number;
    locationDetails: string;
    result: "PENDING" | "POSITIVE" | "NEGATIVE" | "ABSENT" | "RESCHEDULED";
    observations: string;
    occurredAt: Date;
  }>,
) {
  const [result] = await db
    .update(schema.interviews)
    .set(data)
    .where(eq(schema.interviews.interviewId, interviewId))
    .returning();
  return result || null;
}

// ===== FOLLOWUPS =====

export async function createFollowup(data: {
  applicationId: string;
  adminId: string;
  scheduledDate: string;
  monthNumber: number;
  notes: string;
}) {
  const [result] = await db.insert(schema.adoptionFollowups).values(data).returning();
  return result;
}

export async function findFollowupsByApplication(applicationId: string) {
  return db
    .select()
    .from(schema.adoptionFollowups)
    .where(eq(schema.adoptionFollowups.applicationId, applicationId))
    .orderBy(schema.adoptionFollowups.monthNumber);
}

export async function findFollowupById(followupId: string) {
  const [result] = await db
    .select()
    .from(schema.adoptionFollowups)
    .where(eq(schema.adoptionFollowups.followupId, followupId))
    .limit(1);
  return result || null;
}

export async function updateFollowup(
  followupId: string,
  data: Partial<{
    scheduledDate: string;
    notes: string;
    performedAt: Date;
  }>,
) {
  const [result] = await db
    .update(schema.adoptionFollowups)
    .set(data)
    .where(eq(schema.adoptionFollowups.followupId, followupId))
    .returning();
  return result || null;
}
