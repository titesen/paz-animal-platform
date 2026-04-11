import { Router } from "express";
import { validate } from "../../common/middlewares";
import { authenticate, requireRole } from "../../common/middlewares/auth";
import * as controller from "./reports.controller";
import { createReportSchema, reportIdSchema, resolveReportSchema } from "./reports.dto";

const router = Router();

/**
 * @route   POST /api/reports
 * @desc    Report an entity (spam, offensive, etc.)
 * @access  Protected
 */
router.post("/", authenticate, validate(createReportSchema), controller.createReport);

/**
 * @route   GET /api/reports
 * @desc    Get all reports (with optional isResolved filter)
 * @access  Protected (ADMIN)
 */
router.get("/", authenticate, requireRole("ADMIN"), controller.getAllReports);

/**
 * @route   GET /api/reports/:reportId
 * @desc    Get report by ID
 * @access  Protected (ADMIN)
 */
router.get(
  "/:reportId",
  authenticate,
  requireRole("ADMIN"),
  validate(reportIdSchema, "params"),
  controller.getReportById,
);

/**
 * @route   PATCH /api/reports/:reportId/resolve
 * @desc    Resolve/unresolve a report
 * @access  Protected (ADMIN)
 */
router.patch(
  "/:reportId/resolve",
  authenticate,
  requireRole("ADMIN"),
  validate(reportIdSchema, "params"),
  validate(resolveReportSchema),
  controller.resolveReport,
);

export default router;
