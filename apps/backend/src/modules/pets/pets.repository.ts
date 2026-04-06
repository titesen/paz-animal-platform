/**
 * @file Pets Repository
 * @description Data access layer for pet-related database operations
 */

import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db";
import * as schema from "../../db/schema";
import type { NewPet } from "../../common/types";
import type { IPetsRepository } from "./pets.repository.interface";

/**
 * Find pet by ID
 */
export async function findPetById(petId: string) {
  const result = await db.select().from(schema.pets).where(eq(schema.pets.petId, petId)).limit(1);

  return result[0] || null;
}

/**
 * Get all pets with pagination and filters
 */
export async function findPets(filters: {
  page: number;
  limit: number;
  status?: string;
  sex?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) {
  const { page, limit, status, sex, sortBy, sortOrder } = filters;
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [];
  if (status) conditions.push(eq(schema.pets.status, status as any));
  if (sex) conditions.push(eq(schema.pets.sex, sex as any));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Build order by - use explicit column mapping
  const validSortColumns = {
    createdAt: schema.pets.createdAt,
    name: schema.pets.name,
  } as const;

  const orderByColumn =
    validSortColumns[sortBy as keyof typeof validSortColumns] || schema.pets.createdAt;
  const orderByClause = sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

  // Execute query
  const pets = await db
    .select()
    .from(schema.pets)
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.pets)
    .where(whereClause);

  const total = countResult[0]?.count || 0;

  return { pets, total };
}

/**
 * Create a new pet
 */
export async function createPet(petData: NewPet) {
  const result = await db.insert(schema.pets).values(petData).returning();
  return result[0];
}

/**
 * Update pet
 */
export async function updatePet(petId: string, petData: Partial<NewPet>) {
  const result = await db
    .update(schema.pets)
    .set(petData)
    .where(eq(schema.pets.petId, petId))
    .returning();

  return result[0] || null;
}

/**
 * Delete pet (soft delete)
 */
export async function softDeletePet(petId: string): Promise<void> {
  await db.update(schema.pets).set({ deletedAt: new Date() }).where(eq(schema.pets.petId, petId));
}

/**
 * Update pet status
 */
export async function updatePetStatus(petId: string, status: string): Promise<void> {
  await db
    .update(schema.pets)
    .set({ status: status as any })
    .where(eq(schema.pets.petId, petId));
}

/**
 * Find pets by owner ID (for CLIENTs)
 */
export async function findPetsByOwner(ownerId: string) {
  return db
    .select()
    .from(schema.pets)
    .where(eq(schema.pets.ownerId, ownerId))
    .orderBy(desc(schema.pets.createdAt));
}

/**
 * Find all active lost pet alerts
 */
export async function findActiveLostPetAlerts() {
  return db
    .select()
    .from(schema.lostPetAlerts)
    .where(eq(schema.lostPetAlerts.isActive, true))
    .orderBy(desc(schema.lostPetAlerts.lostAt));
}

/**
 * Find lost pet alert by ID
 */
export async function findLostPetAlertById(alertId: string) {
  const result = await db
    .select()
    .from(schema.lostPetAlerts)
    .where(eq(schema.lostPetAlerts.alertId, alertId))
    .limit(1);

  return result[0] || null;
}

/**
 * Create lost pet alert
 */
export async function createLostPetAlert(data: {
  petId: string;
  lastSeenZone: string;
  contactPhone: string;
  message?: string;
  isActive: boolean;
}) {
  const result = await db.insert(schema.lostPetAlerts).values(data).returning();

  return result[0];
}

/**
 * Resolve lost pet alert
 */
export async function resolveLostPetAlert(alertId: string): Promise<void> {
  await db
    .update(schema.lostPetAlerts)
    .set({ isActive: false, resolvedAt: new Date() })
    .where(eq(schema.lostPetAlerts.alertId, alertId));
}

// Compile-time contract verification
void ({
  findPetById,
  findPets,
  createPet,
  updatePet,
  softDeletePet,
  updatePetStatus,
  findPetsByOwner,
  findActiveLostPetAlerts,
  findLostPetAlertById,
  createLostPetAlert,
  resolveLostPetAlert,
} satisfies IPetsRepository);
