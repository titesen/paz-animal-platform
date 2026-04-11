import { and, eq, isNull } from "drizzle-orm";
import { db } from "../../db";
import * as schema from "../../db/schema";

export async function findAddressesByEntity(entityType: string, entityId: string) {
  return db
    .select()
    .from(schema.addresses)
    .where(
      and(
        eq(schema.addresses.entityType, entityType),
        eq(schema.addresses.entityId, entityId),
        isNull(schema.addresses.deletedAt),
      ),
    );
}

export async function findAddressById(addressId: string) {
  const result = await db
    .select()
    .from(schema.addresses)
    .where(and(eq(schema.addresses.addressId, addressId), isNull(schema.addresses.deletedAt)))
    .limit(1);
  return result[0] || null;
}

export async function createAddress(data: typeof schema.addresses.$inferInsert) {
  const result = await db.insert(schema.addresses).values(data).returning();
  return result[0];
}

export async function updateAddress(
  addressId: string,
  data: Partial<typeof schema.addresses.$inferInsert>,
) {
  const result = await db
    .update(schema.addresses)
    .set(data)
    .where(eq(schema.addresses.addressId, addressId))
    .returning();
  return result[0] || null;
}

export async function softDeleteAddress(addressId: string) {
  await db
    .update(schema.addresses)
    .set({ deletedAt: new Date() })
    .where(eq(schema.addresses.addressId, addressId));
}
