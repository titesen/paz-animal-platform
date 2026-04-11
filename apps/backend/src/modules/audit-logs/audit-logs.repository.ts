import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db";
import * as schema from "../../db/schema";

export async function createAuditLog(data: {
  action: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  entityType?: string;
  entityId?: string;
  details?: unknown;
}) {
  const [result] = await db.insert(schema.auditLogs).values(data).returning();
  return result;
}

export async function findAuditLogs(filters?: {
  action?: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  limit?: number;
  offset?: number;
}) {
  const conditions = [];

  if (filters?.action) {
    conditions.push(eq(schema.auditLogs.action, filters.action));
  }
  if (filters?.userId) {
    conditions.push(eq(schema.auditLogs.userId, filters.userId));
  }
  if (filters?.entityType) {
    conditions.push(eq(schema.auditLogs.entityType, filters.entityType));
  }
  if (filters?.entityId) {
    conditions.push(eq(schema.auditLogs.entityId, filters.entityId));
  }

  const query = db
    .select()
    .from(schema.auditLogs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${schema.auditLogs.timestamp} DESC`)
    .limit(filters?.limit || 50)
    .offset(filters?.offset || 0);

  return query;
}

export async function findJobHistory(filters?: {
  jobName?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  const conditions = [];

  if (filters?.jobName) {
    conditions.push(eq(schema.jobHistory.jobName, filters.jobName));
  }
  if (filters?.status) {
    conditions.push(eq(schema.jobHistory.status, filters.status));
  }

  return db
    .select()
    .from(schema.jobHistory)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(sql`${schema.jobHistory.startedAt} DESC`)
    .limit(filters?.limit || 50)
    .offset(filters?.offset || 0);
}
