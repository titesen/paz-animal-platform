import { Router } from "express";
import { validate } from "../../common/middlewares";
import { authenticate, requireRole } from "../../common/middlewares/auth";
import * as usersController from "./users.controller";
import { updateUserRolesSchema, updateUserSchema, usersQuerySchema } from "./users.dto";

const router = Router();

/**
 * @route   GET /api/users
 * @desc    List all users with optional filters
 * @access  Admin
 */
router.get(
  "/",
  authenticate,
  requireRole("ADMIN"),
  validate(usersQuerySchema, "query"),
  usersController.listUsers,
);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID
 * @access  Admin
 */
router.get("/:userId", authenticate, requireRole("ADMIN"), usersController.getUserById);

/**
 * @route   PATCH /api/users/:userId
 * @desc    Update user profile (admin)
 * @access  Admin
 */
router.patch(
  "/:userId",
  authenticate,
  requireRole("ADMIN"),
  validate(updateUserSchema),
  usersController.updateUser,
);

/**
 * @route   PATCH /api/users/:userId/roles
 * @desc    Update user roles
 * @access  Admin
 */
router.patch(
  "/:userId/roles",
  authenticate,
  requireRole("ADMIN"),
  validate(updateUserRolesSchema),
  usersController.updateUserRoles,
);

/**
 * @route   PATCH /api/users/:userId/ban
 * @desc    Ban (soft delete) a user
 * @access  Admin
 */
router.patch("/:userId/ban", authenticate, requireRole("ADMIN"), usersController.banUser);

/**
 * @route   PATCH /api/users/:userId/unban
 * @desc    Unban (restore) a user
 * @access  Admin
 */
router.patch("/:userId/unban", authenticate, requireRole("ADMIN"), usersController.unbanUser);

export default router;
