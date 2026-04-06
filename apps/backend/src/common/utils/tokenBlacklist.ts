/**
 * @file Token Blacklist Service
 * @description Server-side JWT revocation using Redis
 *
 * Strategy: On logout, the token's unique signature is stored in Redis
 * with a TTL matching the token's remaining lifetime. The authenticate
 * middleware checks this blacklist before accepting a token.
 *
 * Graceful degradation: If Redis is unavailable, blacklist checks are
 * skipped (tokens remain valid until natural expiration).
 */

import { redis } from "../../config/redis";
import { logger } from "../../config/logger";

const BLACKLIST_PREFIX = "token:blacklist:";

/**
 * Extract a short, unique key from a JWT token.
 * Uses the last 32 chars of the token (part of the signature) to avoid
 * storing the full token in Redis.
 */
function tokenKey(token: string): string {
  return BLACKLIST_PREFIX + token.slice(-32);
}

/**
 * Add a token to the blacklist.
 * @param token - The full JWT token string
 * @param expiresInSeconds - TTL matching the token's remaining lifetime
 */
export async function blacklistToken(token: string, expiresInSeconds: number): Promise<void> {
  try {
    if (redis.status !== "ready") return;
    await redis.set(tokenKey(token), "1", "EX", expiresInSeconds);
  } catch (err) {
    logger.warn({ err }, "Failed to blacklist token — Redis unavailable");
  }
}

/**
 * Check if a token has been blacklisted (revoked).
 * @param token - The full JWT token string
 * @returns true if the token is blacklisted
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  try {
    if (redis.status !== "ready") return false;
    const result = await redis.get(tokenKey(token));
    return result !== null;
  } catch (err) {
    logger.warn({ err }, "Failed to check token blacklist — Redis unavailable");
    return false;
  }
}
