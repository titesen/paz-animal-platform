/**
 * @file Auth Controller
 * @description HTTP request handlers for authentication endpoints
 * @pattern Controller Layer - Handles HTTP concerns (req/res)
 */

import type { Request, Response } from "express";
import type { AuthenticatedRequest, JSendSuccess } from "../../common/types";
import { asyncHandler } from "../../common/utils";
import * as authService from "./auth.service";
import type { LoginDTO, RefreshTokenDTO, RegisterDTO } from "./auth.dto";
import type { AuthResponse } from "./auth.types";

/**
 * POST /api/auth/register
 * Register a new user account
 */
export const register = asyncHandler(async (req, res: Response) => {
  const data: RegisterDTO = req.body;

  const result = await authService.register(data);

  const response: JSendSuccess<AuthResponse> = {
    status: "success",
    data: result,
  };

  res.status(201).json(response);
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
export const login = asyncHandler(async (req, res: Response) => {
  const data: LoginDTO = req.body;

  const result = await authService.login(data);

  const response: JSendSuccess<AuthResponse> = {
    status: "success",
    data: result,
  };

  res.status(200).json(response);
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
export const refreshToken = asyncHandler(async (req, res: Response) => {
  const data: RefreshTokenDTO = req.body;

  const result = await authService.refreshAccessToken(data);

  const response: JSendSuccess<AuthResponse> = {
    status: "success",
    data: result,
  };

  res.status(200).json(response);
});

/**
 * POST /api/auth/google
 * Login with Google OAuth
 */
export const googleAuth = asyncHandler(async (req, res: Response) => {
  const data = req.body;

  const result = await authService.loginWithGoogle(data);

  const response: JSendSuccess<AuthResponse> = {
    status: "success",
    data: result,
  };

  res.status(200).json(response);
});

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
export const getCurrentUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.userId;

  const result = await authService.getCurrentUser(userId);

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(200).json(response);
});

/**
 * POST /api/auth/logout
 * Logout - revokes the current access token via Redis blacklist
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    await authService.logout(token);
  }

  const response: JSendSuccess = {
    status: "success",
    data: {
      message: "Logged out successfully",
    },
  };

  res.status(200).json(response);
});
