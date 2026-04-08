/**
 * @file JWT Token Management
 * @description JSON Web Token generation and verification utilities
 */

import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import type { JWTPayload } from "../types";

const refreshSecret = env.JWT_REFRESH_SECRET ?? env.JWT_SECRET;

const accessSignOptions: SignOptions = {
  expiresIn: env.JWT_ACCESS_EXPIRATION as SignOptions["expiresIn"],
};

const refreshSignOptions: SignOptions = {
  expiresIn: env.JWT_REFRESH_EXPIRATION as SignOptions["expiresIn"],
};

/**
 * Generate an access token (short-lived)
 * @param payload - User information to encode in token
 * @returns JWT access token
 */
export function generateAccessToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, env.JWT_SECRET, accessSignOptions);
}

/**
 * Generate a refresh token (long-lived)
 * Signed with a separate secret to isolate token scopes.
 * @param payload - User information to encode in token
 * @returns JWT refresh token
 */
export function generateRefreshToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, refreshSecret, refreshSignOptions);
}

/**
 * Verify an access token
 * @param token - JWT access token to verify
 * @returns Decoded payload
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
}

/**
 * Verify a refresh token using the dedicated refresh secret
 * @param token - JWT refresh token to verify
 * @returns Decoded payload
 * @throws Error if token is invalid or expired
 */
export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, refreshSecret) as JWTPayload;
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
