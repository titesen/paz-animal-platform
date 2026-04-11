import { Router } from "express";
import { validate } from "../../common/middlewares";
import { authenticate, requireRole } from "../../common/middlewares/auth";
import * as controller from "./audit-logs.controller";
import { auditLogQuerySchema } from "./audit-logs.dto";

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

export default router;
