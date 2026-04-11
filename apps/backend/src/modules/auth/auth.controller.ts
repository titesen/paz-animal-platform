/**
 * @file Auth Controller
 * @description HTTP request handlers for authentication endpoints
 * @pattern Controller Layer - Handles HTTP concerns (req/res)
 */

import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { REFRESH_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_OPTIONS } from "../../config/cookies";
import { blacklistToken } from "../../common/utils/tokenBlacklist";
import type { AuthenticatedRequest, JSendSuccess } from "../../common/types";
import { asyncHandler } from "../../common/utils";
import * as authService from "./auth.service";
import type { AuthClientResponse, LoginDTO, RegisterDTO } from "./auth.dto";

/**
 * Sets the refresh token as an httpOnly cookie and returns the access token in the response body.
 */
function sendAuthResponse(
  res: Response,
  result: { accessToken: string; refreshToken: string; user: AuthClientResponse["user"] },
  statusCode: number,
): void {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, result.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

  const response: JSendSuccess<AuthClientResponse> = {
    status: "success",
    data: {
      user: result.user,
      tokens: { accessToken: result.accessToken },
    },
  };

  res.status(statusCode).json(response);
}

/**
 * POST /api/auth/register
 * Register a new user account
 */
export const register = asyncHandler(async (req, res: Response) => {
  const data: RegisterDTO = req.body;

  const result = await authService.register(data);

  sendAuthResponse(
    res,
    {
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      user: result.user,
    },
    201,
  );
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
export const login = asyncHandler(async (req, res: Response) => {
  const data: LoginDTO = req.body;

  const result = await authService.login(data);

  sendAuthResponse(
    res,
    {
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      user: result.user,
    },
    200,
  );
});

/**
 * POST /api/auth/refresh
 * Refresh access token using httpOnly cookie
 */
export const refreshToken = asyncHandler(async (req, res: Response) => {
  // eslint-disable-next-line security/detect-object-injection
  const oldRefreshToken: string | undefined = req.cookies[REFRESH_TOKEN_COOKIE_NAME];

  if (!oldRefreshToken) {
    res.status(401).json({
      status: "error",
      message: "Missing refresh token",
      code: "MISSING_REFRESH_TOKEN",
    });
    return;
  }

  const result = await authService.refreshAccessToken(oldRefreshToken);

  // Blacklist the old refresh token to prevent reuse (token rotation)
  const decoded = jwt.decode(oldRefreshToken) as { exp?: number } | null;
  if (decoded?.exp) {
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await blacklistToken(oldRefreshToken, ttl);
    }
  }

  sendAuthResponse(
    res,
    {
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      user: result.user,
    },
    200,
  );
});

/**
 * POST /api/auth/google
 * Login with Google OAuth
 */
export const googleAuth = asyncHandler(async (req, res: Response) => {
  const data = req.body;

  const result = await authService.loginWithGoogle(data);

  sendAuthResponse(
    res,
    {
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      user: result.user,
    },
    200,
  );
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
 * Logout - revokes access token and refresh token, clears cookie
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // Blacklist access token
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (decoded?.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await blacklistToken(token, ttl);
      }
    }
  }

  // Blacklist refresh token from cookie
  // eslint-disable-next-line security/detect-object-injection
  const refreshCookie: string | undefined = req.cookies[REFRESH_TOKEN_COOKIE_NAME];
  if (refreshCookie) {
    const decoded = jwt.decode(refreshCookie) as { exp?: number } | null;
    if (decoded?.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await blacklistToken(refreshCookie, ttl);
      }
    }
  }

  // Clear the refresh token cookie
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_OPTIONS);

  const response: JSendSuccess = {
    status: "success",
    data: {
      message: "Logged out successfully",
    },
  };

  res.status(200).json(response);
});

// ===================
// PROFILE MANAGEMENT
// ===================

/**
 * PATCH /api/auth/profile
 * Update current user's profile
 */
export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.userId;
  const data = req.body;

  const result = await authService.updateProfile(userId, data);

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(200).json(response);
});

/**
 * PATCH /api/auth/password
 * Change current user's password
 */
export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.userId;
  const data = req.body;

  await authService.changePassword(userId, data);

  const response: JSendSuccess = {
    status: "success",
    data: { message: "Password changed successfully" },
  };

  res.status(200).json(response);
});

/**
 * DELETE /api/auth/account
 * Soft-delete current user's account
 */
export const deleteAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.userId;
  const { password } = req.body;

  await authService.deleteAccount(userId, password);

  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_OPTIONS);

  const response: JSendSuccess = {
    status: "success",
    data: { message: "Account deleted successfully" },
  };

  res.status(200).json(response);
});

// ===================
// TWO-FACTOR AUTH
// ===================

/**
 * POST /api/auth/2fa/setup
 * Generate 2FA secret and QR URI
 */
export const setup2FA = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.userId;

  const result = await authService.setup2FA(userId);

  const response: JSendSuccess = {
    status: "success",
    data: result,
  };

  res.status(200).json(response);
});

/**
 * POST /api/auth/2fa/verify
 * Verify 2FA code and enable it
 */
export const verify2FA = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.userId;
  const data = req.body;

  await authService.verify2FA(userId, data);

  const response: JSendSuccess = {
    status: "success",
    data: { message: "2FA enabled successfully" },
  };

  res.status(200).json(response);
});

/**
 * POST /api/auth/2fa/disable
 * Disable 2FA (not allowed for admins)
 */
export const disable2FA = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.userId;

  await authService.disable2FA(userId);

  const response: JSendSuccess = {
    status: "success",
    data: { message: "2FA disabled successfully" },
  };

  res.status(200).json(response);
});
