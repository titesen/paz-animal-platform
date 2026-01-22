/**
 * @file JWT Token Management
 * @description JSON Web Token generation and verification utilities
 */

import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { JWTPayload } from "../types";

/**
 * Generate an access token (short-lived)
 * @param payload - User information to encode in token
 * @returns JWT access token
 */
export function generateAccessToken(
  payload: Omit<JWTPayload, "iat" | "exp">,
): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "15m", // 15 minutes
  });
}

/**
 * Generate a refresh token (long-lived)
 * @param payload - User information to encode in token
 * @returns JWT refresh token
 */
export function generateRefreshToken(
  payload: Omit<JWTPayload, "iat" | "exp">,
): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "7d", // 7 days
  });
}

/**
 * Verify a JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
}

/**
 * Decode a JWT token without verification
 * Useful for debugging or reading expired tokens
 * @param token - JWT token to decode
 * @returns Decoded payload or null if invalid format
 */
export function decodeToken(token: string): JWTPayload | null {
  return jwt.decode(token) as JWTPayload | null;
}
