import { asc, eq } from "drizzle-orm";
import { db } from "../../db";
import * as schema from "../../db/schema";

export async function findAllProvinces() {
  return db.select().from(schema.provinces).orderBy(asc(schema.provinces.name));
}

export async function findProvinceById(provinceId: number) {
  const result = await db
    .select()
    .from(schema.provinces)
    .where(eq(schema.provinces.provinceId, provinceId))
    .limit(1);
  return result[0] || null;
}

export async function createProvince(name: string) {
  const result = await db.insert(schema.provinces).values({ name }).returning();
  return result[0];
}

export async function findCitiesByProvince(provinceId: number) {
  return db
    .select()
    .from(schema.cities)
    .where(eq(schema.cities.provinceId, provinceId))
    .orderBy(asc(schema.cities.name));
}

export async function createCity(data: { name: string; provinceId: number }) {
  const result = await db.insert(schema.cities).values(data).returning();
  return result[0];
}
