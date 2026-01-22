/**
 * @file Auth Routes
 * @description Route definitions for authentication endpoints
 */

import { Router } from "express";
import { validate } from "../../middlewares";
import { authenticate } from "../../middlewares/auth";
import { authLimiter } from "../../middlewares/rateLimiter";
import * as authController from "./controller";
import {
  googleOAuthSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from "./types";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  authController.register,
);

/**
 * @route   POST /api/auth/login
 * @desc    Login with email and password
 * @access  Public
 */
router.post("/login", authLimiter, validate(loginSchema), authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  "/refresh",
  validate(refreshTokenSchema),
  authController.refreshToken,
);

/**
 * @route   POST /api/auth/google
 * @desc    Login with Google OAuth
 * @access  Public
 */
router.post(
  "/google",
  authLimiter,
  validate(googleOAuthSchema),
  authController.googleAuth,
);

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

export default router;
