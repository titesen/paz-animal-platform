/**
 * @file Finance Repository
 * @description Data access layer for transactions, donations, and financial records
 */

import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db";
import * as schema from "../../db/schema";
import type {
  InKindDonation,
  MonetaryDonation,
  PaymentMethodType,
  PaymentProvider,
  Transaction,
  TransactionStatus,
} from "./finance.types";
import type { IFinanceRepository } from "./finance.repository.interface";

// ===================
// TRANSACTIONS (Immutable Ledger)
// ===================

/**
 * Create a new transaction record (immutable once created)
 */
export async function createTransaction(data: {
  userId?: string;
  amountTotal: string;
  currency: string;
  provider: PaymentProvider;
  externalTransactionId?: string;
  externalReferenceId?: string;
  method?: PaymentMethodType;
  methodDetail?: string;
  status: TransactionStatus;
  originType: string;
  originId: string;
}): Promise<Transaction> {
  const [transaction] = await db.insert(schema.transactions).values(data).returning();

  return transaction;
}

/**
 * Find transaction by ID
 */
export async function findTransactionById(transactionId: string): Promise<Transaction | null> {
  const [transaction] = await db
    .select()
    .from(schema.transactions)
    .where(eq(schema.transactions.transactionId, transactionId))
    .limit(1);

  return transaction || null;
}

/**
 * Find transaction by external ID (Mercado Pago payment ID)
 */
export async function findTransactionByExternalId(externalId: string): Promise<Transaction | null> {
  const [transaction] = await db
    .select()
    .from(schema.transactions)
    .where(eq(schema.transactions.externalTransactionId, externalId))
    .limit(1);

  return transaction || null;
}

/**
 * Update transaction status (only status and processedAt can be modified)
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: TransactionStatus,
): Promise<Transaction | null> {
  const [updated] = await db
    .update(schema.transactions)
    .set({
      status,
      processedAt: new Date(),
    })
    .where(eq(schema.transactions.transactionId, transactionId))
    .returning();

  return updated || null;
}

/**
 * Get all transactions for a user
 */
export async function findTransactionsByUser(userId: string): Promise<Transaction[]> {
  return await db
    .select()
    .from(schema.transactions)
    .where(eq(schema.transactions.userId, userId))
    .orderBy(desc(schema.transactions.createdAt));
}

/**
 * Get financial summary (total donations, amounts by status)
 */
export async function getFinancialSummary(currency: string = "ARS"): Promise<{
  totalDonations: number;
  totalAmount: string;
  pendingAmount: string;
  approvedAmount: string;
}> {
  const summary = await db
    .select({
      totalDonations: sql<number>`count(*)::int`,
      totalAmount: sql<string>`COALESCE(sum(${schema.transactions.amountTotal}), 0)`,
      pendingAmount: sql<string>`COALESCE(sum(CASE WHEN ${schema.transactions.status} = 'PENDING' THEN ${schema.transactions.amountTotal} ELSE 0 END), 0)`,
      approvedAmount: sql<string>`COALESCE(sum(CASE WHEN ${schema.transactions.status} = 'APPROVED' THEN ${schema.transactions.amountTotal} ELSE 0 END), 0)`,
    })
    .from(schema.transactions)
    .where(
      and(
        eq(schema.transactions.currency, currency),
        eq(schema.transactions.originType, "DONATION"),
      ),
    );

  return (
    summary[0] || {
      totalDonations: 0,
      totalAmount: "0",
      pendingAmount: "0",
      approvedAmount: "0",
    }
  );
}

// ===================
// MONETARY DONATIONS
// ===================

/**
 * Create a monetary donation intent
 */
export async function createMonetaryDonation(data: {
  userId?: string;
  targetAmount: string;
  currency: string;
  isAnonymous?: boolean;
  thankYouMessage?: string;
}): Promise<MonetaryDonation> {
  const [donation] = await db.insert(schema.monetaryDonations).values(data).returning();

  return donation;
}

/**
 * Find donation by ID
 */
export async function findDonationById(donationId: string): Promise<MonetaryDonation | null> {
  const [donation] = await db
    .select()
    .from(schema.monetaryDonations)
    .where(eq(schema.monetaryDonations.donationId, donationId))
    .limit(1);

  return donation || null;
}

/**
 * Confirm donation (mark as paid)
 */
export async function confirmDonation(donationId: string): Promise<MonetaryDonation | null> {
  const [confirmed] = await db
    .update(schema.monetaryDonations)
    .set({ isConfirmed: true })
    .where(eq(schema.monetaryDonations.donationId, donationId))
    .returning();

  return confirmed || null;
}

/**
 * Get all donations for a user
 */
export async function findDonationsByUser(userId: string): Promise<MonetaryDonation[]> {
  return await db
    .select()
    .from(schema.monetaryDonations)
    .where(eq(schema.monetaryDonations.userId, userId))
    .orderBy(desc(schema.monetaryDonations.createdAt));
}

/**
 * Get all confirmed donations (for public display)
 */
export async function findAllConfirmedDonations(limit: number = 50): Promise<MonetaryDonation[]> {
  return await db
    .select()
    .from(schema.monetaryDonations)
    .where(eq(schema.monetaryDonations.isConfirmed, true))
    .orderBy(desc(schema.monetaryDonations.createdAt))
    .limit(limit);
}

// ===================
// IN-KIND DONATIONS
// ===================

/**
 * Create an in-kind donation record
 */
export async function createInKindDonation(data: {
  userId?: string;
  manualDonorName?: string;
  manualDonorContact?: string;
  description: string;
  estimatedValue?: string;
  receivedById: string;
}): Promise<InKindDonation> {
  const [donation] = await db.insert(schema.inKindDonations).values(data).returning();

  return donation;
}

/**
 * Find in-kind donation by ID
 */
export async function findInKindDonationById(donationId: string): Promise<InKindDonation | null> {
  const [donation] = await db
    .select()
    .from(schema.inKindDonations)
    .where(eq(schema.inKindDonations.donationId, donationId))
    .limit(1);

  return donation || null;
}

/**
 * Get all in-kind donations
 */
export async function findAllInKindDonations(): Promise<InKindDonation[]> {
  return await db
    .select()
    .from(schema.inKindDonations)
    .orderBy(desc(schema.inKindDonations.receivedAt));
}

// Compile-time contract verification
void ({
  createTransaction,
  findTransactionById,
  findTransactionByExternalId,
  updateTransactionStatus,
  findTransactionsByUser,
  getFinancialSummary,
  createMonetaryDonation,
  findDonationById,
  confirmDonation,
  findDonationsByUser,
  findAllConfirmedDonations,
  createInKindDonation,
  findInKindDonationById,
  findAllInKindDonations,
} satisfies IFinanceRepository);
