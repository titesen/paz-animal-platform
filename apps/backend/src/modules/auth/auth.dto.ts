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
  docType: z.enum(["DNI", "PASSPORT", "MERCOSUR_ID", "TAX_ID", "OTHER"]).default("DNI"),
  docNumber: z.string().min(1, "Document number is required").max(50),
  nationalityIso: z.string().length(2, "Must be a 2-letter ISO country code").optional(),
  birthDate: z.string().date("Invalid date format (YYYY-MM-DD)").optional(),
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

// ===================
// PROFILE MANAGEMENT
// ===================

/**
 * Update Profile Request Schema
 */
export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z
    .string()
    .regex(/^\+?\d{8,15}$/, "Invalid phone number format")
    .optional()
    .nullable(),
  birthDate: z.string().date("Invalid date format (YYYY-MM-DD)").optional().nullable(),
  nationalityIso: z.string().length(2, "Must be a 2-letter ISO country code").optional().nullable(),
  docType: z.enum(["DNI", "PASSPORT", "MERCOSUR_ID", "TAX_ID", "OTHER"]).optional(),
  secondaryEmail: z.string().email("Invalid email format").optional().nullable(),
  notificationPreferences: z
    .object({
      news: z.boolean(),
      events: z.boolean(),
    })
    .optional(),
  avatarUrl: z.string().url("Invalid URL format").max(500).optional().nullable(),
});

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;

/**
 * Change Password Request Schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
      "Password must contain at least one special character",
    ),
});

export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;

/**
 * Delete Account Request Schema
 */
export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required for account deletion"),
});

export type DeleteAccountDTO = z.infer<typeof deleteAccountSchema>;

// ===================
// TWO-FACTOR AUTH
// ===================

/**
 * 2FA Verify Schema
 */
export const verify2FASchema = z.object({
  code: z
    .string()
    .length(6, "TOTP code must be 6 digits")
    .regex(/^\d{6}$/, "TOTP code must be 6 digits"),
});

export type Verify2FADTO = z.infer<typeof verify2FASchema>;
