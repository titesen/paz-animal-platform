/** @file Finance Repository - Placeholder */
import { eq } from "drizzle-orm";
import { db } from "../../db";
import * as schema from "../../db/schema";

export async function findTransactionById(transactionId: string) {
  const result = await db
    .select()
    .from(schema.transactions)
    .where(eq(schema.transactions.transactionId, transactionId))
    .limit(1);
  return result[0] || null;
}
