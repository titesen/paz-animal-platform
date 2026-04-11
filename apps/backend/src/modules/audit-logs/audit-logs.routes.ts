import { Router } from "express";
import { validate } from "../../common/middlewares";
import { authenticate, requireRole } from "../../common/middlewares/auth";
import * as controller from "./audit-logs.controller";
import { auditLogQuerySchema, jobHistoryQuerySchema } from "./audit-logs.dto";

const router = Router();

/**
 * @route   GET /api/audit-logs
 * @desc    Get audit logs with optional filters
 * @access  Protected (ADMIN)
 */
router.get(
  "/",
  authenticate,
  requireRole("ADMIN"),
  validate(auditLogQuerySchema, "query"),
  controller.getAuditLogs,
);

/**
 * @route   GET /api/audit-logs/jobs
 * @desc    Get job execution history with optional filters
 * @access  Protected (ADMIN)
 */
router.get(
  "/jobs",
  authenticate,
  requireRole("ADMIN"),
  validate(jobHistoryQuerySchema, "query"),
  controller.getJobHistory,
);

export default router;
