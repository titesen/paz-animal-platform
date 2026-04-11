import * as auditLogsRepo from "./audit-logs.repository";

export async function getAuditLogs(filters?: {
  action?: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  limit?: number;
  offset?: number;
}) {
  return auditLogsRepo.findAuditLogs(filters);
}

export async function logAction(data: {
  action: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  entityType?: string;
  entityId?: string;
  details?: unknown;
}) {
  return auditLogsRepo.createAuditLog(data);
}

export async function getJobHistory(filters?: {
  jobName?: string;
  status?: string;
  limit?: number;
  offset?: number;
}) {
  return auditLogsRepo.findJobHistory(filters);
}
