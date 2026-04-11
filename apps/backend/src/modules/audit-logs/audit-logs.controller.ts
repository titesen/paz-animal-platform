import type { Response } from "express";
import type { AuthenticatedRequest, JSendSuccess } from "../../common/types";
import { asyncHandler } from "../../common/utils";
import * as auditLogsService from "./audit-logs.service";

export const getAuditLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { action, userId, entityType, entityId, limit, offset } = req.query as Record<
    string,
    string | undefined
  >;

  const result = await auditLogsService.getAuditLogs({
    action,
    userId,
    entityType,
    entityId,
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
  });

  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const getJobHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { jobName, status, limit, offset } = req.query as Record<string, string | undefined>;

  const result = await auditLogsService.getJobHistory({
    jobName,
    status,
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
  });

  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});
