/**
 * @file Auth Module - Data Transfer Objects (DTOs)
 * @description Zod schemas for request/response validation in auth endpoints
 */

import { z } from "zod";

/**
 * Registration Request Schema
 */
export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
      "Password must contain at least one special character",
    ),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  phoneNumber: z.string().regex(/^\+?\d{8,15}$/, "Invalid phone number format"),
  docNumber: z.string().min(1, "Document number is required").max(50),
});

export type RegisterDTO = z.infer<typeof registerSchema>;

/**
 * Login Request Schema
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type LoginDTO = z.infer<typeof loginSchema>;

/**
 * Refresh Token Request Schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;

/**
 * Google OAuth Request Schema
 */
export const googleOAuthSchema = z.object({
  idToken: z.string().min(1, "Google ID token is required"),
});

export type GoogleOAuthDTO = z.infer<typeof googleOAuthSchema>;

/**
 * Password Reset Request Schema
 */
export const requestPasswordResetSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export type RequestPasswordResetDTO = z.infer<typeof requestPasswordResetSchema>;

/**
 * Password Reset Confirmation Schema
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number"),
});

export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;

/**
 * Internal Auth Response (used by service layer, includes refresh token)
 */
export interface AuthResponse {
  user: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Client Auth Response (sent in HTTP response body, refresh token excluded)
 * The refresh token is delivered via httpOnly cookie instead.
 */
export interface AuthClientResponse {
  user: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
  tokens: {
    accessToken: string;
  };
}
