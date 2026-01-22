/**
 * @file Auth Service
 * @description Business logic layer for authentication operations
 * @pattern Service Layer (Facade) - Orchestrates business logic
 */

import { logger } from "../../config/logger";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../types/errors";
import { comparePassword, hashPassword } from "../../utils/encryption";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../../utils/jwt";
import * as authRepo from "./repository";
import type {
  AuthResponse,
  GoogleOAuthDTO,
  LoginDTO,
  RefreshTokenDTO,
  RegisterDTO,
} from "./types";

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

  logger.info(
    { userId: newUser.userId, email: newUser.email },
    "User registered successfully",
  );

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
    throw new UnauthorizedError("Invalid credentials", "INVALID_CREDENTIALS");
  }

  // Verify password
  const isPasswordValid = await comparePassword(
    data.password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid credentials", "INVALID_CREDENTIALS");
  }

  // Check if user is soft-deleted
  if (user.deletedAt) {
    throw new UnauthorizedError(
      "Account has been deactivated",
      "ACCOUNT_DEACTIVATED",
    );
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

  logger.info(
    { userId: user.userId, email: user.email },
    "User logged in successfully",
  );

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
 */
export async function refreshAccessToken(
  data: RefreshTokenDTO,
): Promise<AuthResponse> {
  try {
    // Verify refresh token
    const decoded = verifyToken(data.refreshToken);

    // Find user
    const user = await authRepo.findUserById(decoded.userId);

    if (!user) {
      throw new UnauthorizedError("User not found", "USER_NOT_FOUND");
    }

    if (user.deletedAt) {
      throw new UnauthorizedError(
        "Account has been deactivated",
        "ACCOUNT_DEACTIVATED",
      );
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
  } catch (error) {
    throw new UnauthorizedError(
      "Invalid or expired refresh token",
      "INVALID_REFRESH_TOKEN",
    );
  }
}

/**
 * Login with Google OAuth
 */
export async function loginWithGoogle(
  _data: GoogleOAuthDTO,
): Promise<AuthResponse> {
  // TODO: Verify Google ID token and extract user info
  // This requires integration with Google OAuth client
  throw new BadRequestError(
    "Google OAuth not yet implemented",
    "NOT_IMPLEMENTED",
  );
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
    throw new UnauthorizedError(
      "Account has been deactivated",
      "ACCOUNT_DEACTIVATED",
    );
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
