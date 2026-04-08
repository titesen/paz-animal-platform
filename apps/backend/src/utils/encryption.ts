/**
 * @file Password Hashing & Comparison Utilities
 * @description Secure password handling using bcrypt
 */

import bcrypt from "bcrypt";
import crypto from "crypto";
import { env } from "../config/env";

const SALT_ROUNDS = env.BCRYPT_SALT_ROUNDS;

/**
 * Hash a plain text password
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password from user input
 * @param hashedPassword - Stored hashed password from database
 * @returns True if passwords match, false otherwise
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a cryptographically secure random token
 * Useful for password reset tokens, email verification, etc.
 * @param length - Length of the token in bytes (default: 32)
 * @returns Hex-encoded random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}
