/**
 * @file Auth Service
 * @description Business logic layer for authentication operations
 * @pattern Service Layer (Facade) - Orchestrates business logic
 */

import { logger } from "../../config/logger";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../../common/errors";
import { comparePassword, hashPassword } from "../../common/utils/password.util";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../common/utils/jwt.util";
import { blacklistToken } from "../../common/utils/tokenBlacklist";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import * as authRepo from "./auth.repository";
import type {
  AuthResponse,
  ChangePasswordDTO,
  GoogleOAuthDTO,
  LoginDTO,
  RegisterDTO,
  UpdateProfileDTO,
  Verify2FADTO,
} from "./auth.dto";
import type { NewUser } from "../../common/types";

/**
 * Register a new user
 */
export async function register(data: RegisterDTO): Promise<AuthResponse> {
  // Check if email already exists
  const existingUser = await authRepo.findUserByEmail(data.email);

  if (existingUser) {
    throw new ConflictError("Email already registered", "EMAIL_ALREADY_EXISTS");
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Create user
  const newUser = await authRepo.createUser({
    email: data.email,
    passwordHash,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phoneNumber,
    docNumber: data.docNumber,
  });

  // Assign CLIENT role by default
  await authRepo.assignRoleToUser(newUser.userId, "CLIENT");

  // Get user roles
  const roles = await authRepo.getUserRoles(newUser.userId);

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: newUser.userId,
    email: newUser.email,
    roles,
  });

  const refreshToken = generateRefreshToken({
    userId: newUser.userId,
    email: newUser.email,
    roles,
  });

  logger.info({ userId: newUser.userId, email: newUser.email }, "User registered successfully");

  return {
    user: {
      userId: newUser.userId,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      roles,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
}

/**
 * Login with email and password
 */
export async function login(data: LoginDTO): Promise<AuthResponse> {
  // Find user by email
  const user = await authRepo.findUserByEmail(data.email);

  if (!user || !user.passwordHash) {
    logger.warn({ email: data.email }, "Login failed: invalid credentials");
    throw new UnauthorizedError("Invalid credentials", "INVALID_CREDENTIALS");
  }

  // Verify password
  const isPasswordValid = await comparePassword(data.password, user.passwordHash);

  if (!isPasswordValid) {
    logger.warn({ userId: user.userId }, "Login failed: invalid credentials");
    throw new UnauthorizedError("Invalid credentials", "INVALID_CREDENTIALS");
  }

  // Check if user is soft-deleted
  if (user.deletedAt) {
    throw new UnauthorizedError("Account has been deactivated", "ACCOUNT_DEACTIVATED");
  }

  // Get user roles
  const roles = await authRepo.getUserRoles(user.userId);

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: user.userId,
    email: user.email,
    roles,
  });

  const refreshToken = generateRefreshToken({
    userId: user.userId,
    email: user.email,
    roles,
  });

  logger.info({ userId: user.userId, email: user.email }, "User logged in successfully");

  return {
    user: {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
}

/**
 * Refresh access token using refresh token
 * @param token - Raw refresh token string (extracted from httpOnly cookie)
 */
export async function refreshAccessToken(token: string): Promise<AuthResponse> {
  try {
    // Verify refresh token with dedicated refresh secret
    const decoded = verifyRefreshToken(token);

    // Find user
    const user = await authRepo.findUserById(decoded.userId);

    if (!user) {
      throw new UnauthorizedError("User not found", "USER_NOT_FOUND");
    }

    if (user.deletedAt) {
      throw new UnauthorizedError("Account has been deactivated", "ACCOUNT_DEACTIVATED");
    }

    // Get fresh roles (in case they changed)
    const roles = await authRepo.getUserRoles(user.userId);

    // Generate new tokens
    const accessToken = generateAccessToken({
      userId: user.userId,
      email: user.email,
      roles,
    });

    const refreshToken = generateRefreshToken({
      userId: user.userId,
      email: user.email,
      roles,
    });

    return {
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  } catch {
    logger.warn("Token refresh failed: invalid or expired refresh token");
    throw new UnauthorizedError("Invalid or expired refresh token", "INVALID_REFRESH_TOKEN");
  }
}

/**
 * Login with Google OAuth
 */
export async function loginWithGoogle(data: GoogleOAuthDTO): Promise<AuthResponse> {
  const { verifyGoogleIdToken } = await import("../../integrations/google-oauth/client");
  const googleUser = await verifyGoogleIdToken(data.idToken);

  // Try to find existing user by Google ID
  let user = await authRepo.findUserByGoogleId(googleUser.sub);

  if (!user) {
    // Try to find by email (account linking)
    user = await authRepo.findUserByEmail(googleUser.email);

    if (user) {
      // Link Google ID to existing account
      await authRepo.updateUserProfile(user.userId, { googleId: googleUser.sub });
    } else {
      // Create new user
      const [firstName, ...lastParts] = googleUser.name.split(" ");
      const lastName = lastParts.join(" ") || firstName;

      const newUser: NewUser = {
        firstName,
        lastName,
        email: googleUser.email,
        googleId: googleUser.sub,
        avatarUrl: googleUser.picture || null,
        docType: "DNI",
        docNumber: "PENDING",
      };

      user = await authRepo.createUser(newUser);
      await authRepo.assignRoleToUser(user.userId, "CLIENT");
    }
  }

  if (user.deletedAt) {
    throw new UnauthorizedError("Account has been deactivated", "ACCOUNT_DEACTIVATED");
  }

  const roles = await authRepo.getUserRoles(user.userId);

  const accessToken = generateAccessToken({ userId: user.userId, email: user.email, roles });
  const refreshToken = generateRefreshToken({ userId: user.userId, email: user.email, roles });

  logger.info({ userId: user.userId, method: "google" }, "Google OAuth login successful");

  return {
    user: {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles,
    },
    tokens: { accessToken, refreshToken },
  };
}

/**
 * Get current user profile
 */
export async function getCurrentUser(userId: string) {
  const user = await authRepo.findUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found", "USER_NOT_FOUND");
  }

  if (user.deletedAt) {
    throw new UnauthorizedError("Account has been deactivated", "ACCOUNT_DEACTIVATED");
  }

  const roles = await authRepo.getUserRoles(user.userId);

  return {
    userId: user.userId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    roles,
    createdAt: user.createdAt,
  };
}

// ===== LOGOUT =====

/**
 * Logout - revoke an access token via Redis blacklist
 */
export async function logout(token: string): Promise<void> {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (decoded?.exp) {
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await blacklistToken(token, ttl);
    }
  }
}

// ===== INTER-MODULE API =====

/**
 * Find user by email (exposed for cross-module use)
 */
export async function findUserByEmail(email: string) {
  return authRepo.findUserByEmail(email);
}

/**
 * Create a user account (exposed for cross-module use, e.g. volunteer promotion)
 */
export async function createUser(userData: NewUser) {
  return authRepo.createUser(userData);
}

/**
 * Assign a role to a user (exposed for cross-module use)
 */
export async function assignRoleToUser(userId: string, roleName: string): Promise<void> {
  return authRepo.assignRoleToUser(userId, roleName);
}

// ===== PROFILE MANAGEMENT =====

/**
 * Update current user profile
 */
export async function updateProfile(userId: string, data: UpdateProfileDTO) {
  const user = await authRepo.findUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found", "USER_NOT_FOUND");
  }

  if (user.deletedAt) {
    throw new UnauthorizedError("Account has been deactivated", "ACCOUNT_DEACTIVATED");
  }

  const updatedUser = await authRepo.updateUserProfile(userId, data);

  logger.info({ userId, updates: Object.keys(data) }, "User profile updated");

  return {
    userId: updatedUser!.userId,
    email: updatedUser!.email,
    firstName: updatedUser!.firstName,
    lastName: updatedUser!.lastName,
    phone: updatedUser!.phone,
    secondaryEmail: updatedUser!.secondaryEmail,
    birthDate: updatedUser!.birthDate,
    avatarUrl: updatedUser!.avatarUrl,
    notificationPreferences: updatedUser!.notificationPreferences,
  };
}

/**
 * Change user password
 */
export async function changePassword(userId: string, data: ChangePasswordDTO): Promise<void> {
  const user = await authRepo.findUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found", "USER_NOT_FOUND");
  }

  if (!user.passwordHash) {
    throw new BadRequestError("Cannot change password for OAuth-only accounts", "NO_PASSWORD_SET");
  }

  const isCurrentValid = await comparePassword(data.currentPassword, user.passwordHash);

  if (!isCurrentValid) {
    throw new UnauthorizedError("Current password is incorrect", "INVALID_CURRENT_PASSWORD");
  }

  const newHash = await hashPassword(data.newPassword);
  await authRepo.updateUserPassword(userId, newHash);

  logger.info({ userId }, "User password changed");
}

/**
 * Soft-delete user account (self-service)
 */
export async function deleteAccount(userId: string, password: string): Promise<void> {
  const user = await authRepo.findUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found", "USER_NOT_FOUND");
  }

  if (user.passwordHash) {
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError("Invalid password", "INVALID_PASSWORD");
    }
  }

  await authRepo.softDeleteUser(userId);

  logger.info({ userId }, "User account soft-deleted");
}

// ===== TWO-FACTOR AUTHENTICATION =====

/**
 * Setup 2FA - generate TOTP secret
 */
export async function setup2FA(userId: string) {
  const user = await authRepo.findUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found", "USER_NOT_FOUND");
  }

  if (user.tfaEnabled) {
    throw new BadRequestError("2FA is already enabled", "2FA_ALREADY_ENABLED");
  }

  // Generate a hex-encoded secret (20 bytes)
  const secretBuffer = crypto.randomBytes(20);
  const secret = secretBuffer.toString("hex");

  // Store secret temporarily (not yet enabled)
  await authRepo.update2FASecret(userId, secret, false);

  // Build otpauth URI
  const otpauthUrl = `otpauth://totp/PazAnimal:${encodeURIComponent(user.email)}?secret=${secret}&issuer=PazAnimal&digits=6&period=30`;

  return { secret, otpauthUrl };
}

/**
 * Verify 2FA code and enable
 */
export async function verify2FA(userId: string, data: Verify2FADTO): Promise<void> {
  const user = await authRepo.findUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found", "USER_NOT_FOUND");
  }

  if (user.tfaEnabled) {
    throw new BadRequestError("2FA is already enabled", "2FA_ALREADY_ENABLED");
  }

  if (!user.tfaSecret) {
    throw new BadRequestError("2FA setup not initiated. Call setup first.", "2FA_NOT_SETUP");
  }

  // Simple TOTP verification using HMAC-based approach
  const isValid = verifyTOTP(user.tfaSecret, data.code);

  if (!isValid) {
    throw new BadRequestError("Invalid 2FA code", "INVALID_2FA_CODE");
  }

  await authRepo.update2FASecret(userId, user.tfaSecret, true);

  logger.info({ userId }, "2FA enabled");
}

/**
 * Disable 2FA
 */
export async function disable2FA(userId: string): Promise<void> {
  const user = await authRepo.findUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found", "USER_NOT_FOUND");
  }

  if (!user.tfaEnabled) {
    throw new BadRequestError("2FA is not enabled", "2FA_NOT_ENABLED");
  }

  // Check if user is ADMIN — 2FA is mandatory for admins
  const roles = await authRepo.getUserRoles(userId);
  if (roles.includes("ADMIN")) {
    throw new ForbiddenError("Admins cannot disable 2FA", "ADMIN_2FA_MANDATORY");
  }

  await authRepo.update2FASecret(userId, null, false);

  logger.info({ userId }, "2FA disabled");
}

/**
 * Simple TOTP verification (RFC 6238)
 * Checks current and previous time steps for clock skew tolerance
 */
function verifyTOTP(secret: string, code: string): boolean {
  const period = 30;
  const now = Math.floor(Date.now() / 1000);

  // Check current and adjacent time windows (±1 window for clock skew)
  for (let i = -1; i <= 1; i++) {
    const timeStep = Math.floor(now / period) + i;
    const generated = generateTOTP(secret, timeStep);
    if (generated === code) {
      return true;
    }
  }

  return false;
}

/**
 * Generate a 6-digit TOTP code for a given time step
 */
function generateTOTP(secret: string, timeStep: number): string {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(timeStep));

  const hmac = crypto.createHmac("sha1", Buffer.from(secret, "hex"));
  hmac.update(buffer);
  const hash = hmac.digest();

  // eslint-disable-next-line security/detect-object-injection
  const offset = hash[hash.length - 1] & 0x0f;
  /* eslint-disable security/detect-object-injection */
  const code =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);
  /* eslint-enable security/detect-object-injection */

  return (code % 1000000).toString().padStart(6, "0");
}
