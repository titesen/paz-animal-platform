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

export async function findPetByQrCode(qrCode: string) {
  const result = await db.select().from(schema.pets).where(eq(schema.pets.qrCode, qrCode)).limit(1);
  return result[0] || null;
}

export async function findActiveLostAlertForPet(petId: string) {
  const result = await db
    .select()
    .from(schema.lostPetAlerts)
    .where(and(eq(schema.lostPetAlerts.petId, petId), eq(schema.lostPetAlerts.isActive, true)))
    .limit(1);
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

// ===================
// SPECIES
// ===================

export async function findAllSpecies() {
  return db.select().from(schema.species).orderBy(asc(schema.species.name));
}

export async function findSpeciesById(speciesId: number) {
  const result = await db
    .select()
    .from(schema.species)
    .where(eq(schema.species.speciesId, speciesId))
    .limit(1);
  return result[0] || null;
}

export async function createSpecies(name: string) {
  const result = await db.insert(schema.species).values({ name }).returning();
  return result[0];
}

export async function updateSpecies(speciesId: number, name: string) {
  const result = await db
    .update(schema.species)
    .set({ name })
    .where(eq(schema.species.speciesId, speciesId))
    .returning();
  return result[0] || null;
}

export async function deleteSpecies(speciesId: number) {
  await db.delete(schema.species).where(eq(schema.species.speciesId, speciesId));
}

export async function countBreedsForSpecies(speciesId: number): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.breeds)
    .where(eq(schema.breeds.speciesId, speciesId));
  return result[0]?.count || 0;
}

export async function countPetsForSpecies(speciesId: number): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.pets)
    .innerJoin(schema.breeds, eq(schema.pets.breedId, schema.breeds.breedId))
    .where(eq(schema.breeds.speciesId, speciesId));
  return result[0]?.count || 0;
}

// ===================
// BREEDS
// ===================

export async function findBreedsBySpecies(speciesId: number) {
  return db
    .select()
    .from(schema.breeds)
    .where(eq(schema.breeds.speciesId, speciesId))
    .orderBy(asc(schema.breeds.name));
}

export async function findBreedById(breedId: number) {
  const result = await db
    .select()
    .from(schema.breeds)
    .where(eq(schema.breeds.breedId, breedId))
    .limit(1);
  return result[0] || null;
}

export async function createBreed(data: { name: string; speciesId: number }) {
  const result = await db.insert(schema.breeds).values(data).returning();
  return result[0];
}

export async function updateBreed(breedId: number, data: { name?: string }) {
  const result = await db
    .update(schema.breeds)
    .set(data)
    .where(eq(schema.breeds.breedId, breedId))
    .returning();
  return result[0] || null;
}

export async function deleteBreed(breedId: number) {
  await db.delete(schema.breeds).where(eq(schema.breeds.breedId, breedId));
}

export async function countPetsForBreed(breedId: number): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.pets)
    .where(eq(schema.pets.breedId, breedId));
  return result[0]?.count || 0;
}

// ===================
// VACCINES
// ===================

export async function findAllVaccines() {
  return db.select().from(schema.vaccinesCatalog).orderBy(asc(schema.vaccinesCatalog.name));
}

export async function findVaccineById(vaccineId: number) {
  const result = await db
    .select()
    .from(schema.vaccinesCatalog)
    .where(eq(schema.vaccinesCatalog.vaccineId, vaccineId))
    .limit(1);
  return result[0] || null;
}

export async function createVaccine(name: string) {
  const result = await db.insert(schema.vaccinesCatalog).values({ name }).returning();
  return result[0];
}

export async function updateVaccine(vaccineId: number, name: string) {
  const result = await db
    .update(schema.vaccinesCatalog)
    .set({ name })
    .where(eq(schema.vaccinesCatalog.vaccineId, vaccineId))
    .returning();
  return result[0] || null;
}

export async function deleteVaccine(vaccineId: number) {
  await db.delete(schema.vaccinesCatalog).where(eq(schema.vaccinesCatalog.vaccineId, vaccineId));
}

export async function countPetsForVaccine(vaccineId: number): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.petsVaccines)
    .where(eq(schema.petsVaccines.vaccineId, vaccineId));
  return result[0]?.count || 0;
}

// ===================
// PET VACCINES
// ===================

export async function findPetVaccines(petId: string) {
  return db
    .select({
      vaccineId: schema.vaccinesCatalog.vaccineId,
      name: schema.vaccinesCatalog.name,
      appliedAt: schema.petsVaccines.appliedAt,
    })
    .from(schema.petsVaccines)
    .innerJoin(
      schema.vaccinesCatalog,
      eq(schema.petsVaccines.vaccineId, schema.vaccinesCatalog.vaccineId),
    )
    .where(eq(schema.petsVaccines.petId, petId))
    .orderBy(desc(schema.petsVaccines.appliedAt));
}

export async function applyVaccineToPet(data: {
  petId: string;
  vaccineId: number;
  appliedAt: string;
}) {
  const result = await db.insert(schema.petsVaccines).values(data).returning();
  return result[0];
}

export async function removePetVaccine(petId: string, vaccineId: number, appliedAt: string) {
  await db
    .delete(schema.petsVaccines)
    .where(
      and(
        eq(schema.petsVaccines.petId, petId),
        eq(schema.petsVaccines.vaccineId, vaccineId),
        eq(schema.petsVaccines.appliedAt, appliedAt),
      ),
    );
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
