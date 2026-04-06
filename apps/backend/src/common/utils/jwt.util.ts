// JWT token utilities
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import type { JWTPayload } from "../types";

/**
 * Generate an access token
 * @param payload - JWT payload containing user data
 * @returns Signed JWT access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRATION,
    issuer: "paz-animal",
    audience: "paz-animal-client",
  } as SignOptions);
}

/**
 * Generate a refresh token
 * @param payload - JWT payload containing user data
 * @returns Signed JWT refresh token
 */
export function generateRefreshToken(payload: JWTPayload): string {
  const secret = env.JWT_REFRESH_SECRET || env.JWT_SECRET;
  return jwt.sign(payload, secret, {
    expiresIn: env.JWT_REFRESH_EXPIRATION,
    issuer: "paz-animal",
    audience: "paz-animal-client",
  } as SignOptions);
}

/**
 * Verify an access token
 * @param token - JWT token to verify
 * @returns Decoded JWT payload
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET, {
      issuer: "paz-animal",
      audience: "paz-animal-client",
    }) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("TOKEN_EXPIRED", { cause: error });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("INVALID_TOKEN", { cause: error });
    }
    throw error;
  }
}

/**
 * Verify a refresh token
 * @param token - JWT refresh token to verify
 * @returns Decoded JWT payload
 */
export function verifyRefreshToken(token: string): JWTPayload {
  try {
    const secret = env.JWT_REFRESH_SECRET || env.JWT_SECRET;
    return jwt.verify(token, secret, {
      issuer: "paz-animal",
      audience: "paz-animal-client",
    }) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("REFRESH_TOKEN_EXPIRED", { cause: error });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("INVALID_REFRESH_TOKEN", { cause: error });
    }
    throw error;
  }
}

/**
 * Decode a JWT token without verification
 * Useful for reading expired tokens or debugging
 * @param token - JWT token to decode
 * @returns Decoded payload or null if invalid format
 */
export function decodeToken(token: string): JWTPayload | null {
  return jwt.decode(token) as JWTPayload | null;
}
