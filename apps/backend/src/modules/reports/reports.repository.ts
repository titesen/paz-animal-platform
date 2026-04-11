import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db";
import * as schema from "../../db/schema";

export async function createReport(data: {
  reporterId: string;
  entityType: string;
  entityId: string;
  reason: "SPAM" | "OFFENSIVE" | "FALSE_INFORMATION" | "OTHER";
  description?: string;
}) {
  const [result] = await db.insert(schema.reports).values(data).returning();
  return result;
}

export async function findAllReports(filters?: { isResolved?: boolean }) {
  if (filters?.isResolved !== undefined) {
    return db
      .select()
      .from(schema.reports)
      .where(eq(schema.reports.isResolved, filters.isResolved))
      .orderBy(schema.reports.reportedAt);
  }
  return db.select().from(schema.reports).orderBy(schema.reports.reportedAt);
}

export async function findReportById(reportId: string) {
  const [result] = await db
    .select()
    .from(schema.reports)
    .where(eq(schema.reports.reportId, reportId))
    .limit(1);
  return result || null;
}

export async function resolveReport(reportId: string, isResolved: boolean) {
  const [result] = await db
    .update(schema.reports)
    .set({ isResolved })
    .where(eq(schema.reports.reportId, reportId))
    .returning();
  return result || null;
}

export async function countUnresolvedReports(
  entityType: string,
  entityId: string,
): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.reports)
    .where(
      and(
        eq(schema.reports.entityType, entityType),
        eq(schema.reports.entityId, entityId),
        eq(schema.reports.isResolved, false),
      ),
    );
  return row?.count ?? 0;
}
