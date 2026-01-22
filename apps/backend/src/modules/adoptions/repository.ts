/**
 * @file Adoptions Repository
 * @description Data access layer for adoption applications
 */

import { eq } from "drizzle-orm";
import { db } from "../../db";
import * as schema from "../../db/schema";
import type { NewAdoptionApplication } from "../../types";

export async function findAdoptionById(adoptionId: string) {
  const result = await db
    .select()
    .from(schema.adoptionApplications)
    .where(eq(schema.adoptionApplications.applicationId, adoptionId))
    .limit(1);

  return result[0] || null;
}

export async function createAdoptionApplication(data: NewAdoptionApplication) {
  const result = await db
    .insert(schema.adoptionApplications)
    .values(data)
    .returning();
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
