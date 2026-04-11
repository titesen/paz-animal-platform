import { Router } from "express";
import { validate } from "../../common/middlewares";
import { authenticate, requireRole } from "../../common/middlewares/auth";
import * as controller from "./notifications.controller";
import { createNotificationSchema, markReadSchema } from "./notifications.dto";

const router = Router();

/**
 * @route   GET /api/notifications/my
 * @desc    Get current user's notifications
 * @access  Protected
 */
router.get("/my", authenticate, controller.getMyNotifications);

/**
 * @route   PATCH /api/notifications/read
 * @desc    Mark notifications as read
 * @access  Protected
 */
router.patch("/read", authenticate, validate(markReadSchema), controller.markAsRead);

/**
 * @route   POST /api/notifications
 * @desc    Create a notification (system/admin use)
 * @access  Protected (ADMIN)
 */
router.post(
  "/",
  authenticate,
  requireRole("ADMIN"),
  validate(createNotificationSchema),
  controller.createNotification,
);

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications (admin view)
 * @access  Protected (ADMIN)
 */
router.get("/", authenticate, requireRole("ADMIN"), controller.getAllNotifications);

export default router;
