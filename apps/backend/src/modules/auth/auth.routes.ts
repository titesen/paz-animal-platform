/**
 * @file Auth Routes
 * @description Route definitions for authentication endpoints
 */

import { Router } from "express";
import { validate } from "../../common/middlewares";
import { authenticate } from "../../common/middlewares/auth";
import { authLimiter } from "../../common/middlewares/rateLimiter";
import * as authController from "./auth.controller";
import {
  changePasswordSchema,
  deleteAccountSchema,
  googleOAuthSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
  verify2FASchema,
} from "./auth.dto";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", authLimiter, validate(registerSchema), authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login with email and password
 * @access  Public
 */
router.post("/login", authLimiter, validate(loginSchema), authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token via httpOnly cookie
 * @access  Public (cookie-based)
 */
router.post("/refresh", authController.refreshToken);

/**
 * @route   POST /api/auth/google
 * @desc    Login with Google OAuth
 * @access  Public
 */
router.post("/google", authLimiter, validate(googleOAuthSchema), authController.googleAuth);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Protected
 */
router.get("/me", authenticate, authController.getCurrentUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (client-side token invalidation)
 * @access  Protected
 */
router.post("/logout", authenticate, authController.logout);

// ===================
// PROFILE MANAGEMENT
// ===================

/**
 * @route   PATCH /api/auth/profile
 * @desc    Update current user's profile
 * @access  Protected
 */
router.patch("/profile", authenticate, validate(updateProfileSchema), authController.updateProfile);

/**
 * @route   PATCH /api/auth/password
 * @desc    Change current user's password
 * @access  Protected
 */
router.patch(
  "/password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);

/**
 * @route   DELETE /api/auth/account
 * @desc    Soft-delete current user's account
 * @access  Protected
 */
router.delete(
  "/account",
  authenticate,
  validate(deleteAccountSchema),
  authController.deleteAccount,
);

// ===================
// TWO-FACTOR AUTH
// ===================

/**
 * @route   POST /api/auth/2fa/setup
 * @desc    Generate 2FA secret + QR code URI
 * @access  Protected
 */
router.post("/2fa/setup", authenticate, authController.setup2FA);

/**
 * @route   POST /api/auth/2fa/verify
 * @desc    Verify 2FA code and enable
 * @access  Protected
 */
router.post("/2fa/verify", authenticate, validate(verify2FASchema), authController.verify2FA);

/**
 * @route   POST /api/auth/2fa/disable
 * @desc    Disable 2FA (not allowed for admins)
 * @access  Protected
 */
router.post("/2fa/disable", authenticate, authController.disable2FA);

export default router;
