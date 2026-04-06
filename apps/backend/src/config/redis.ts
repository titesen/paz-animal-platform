/**
 * @file Redis Client
 * @description Shared Redis connection for token blacklist, caching, and BullMQ
 */

import Redis from "ioredis";
import { env } from "./env";
import { logger } from "./logger";

const REDIS_URL = env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on("connect", () => {
  logger.info("Redis connection established");
});

redis.on("error", (err) => {
  logger.error({ err }, "Redis connection error");
});

/**
 * Connect to Redis. Call during app startup.
 * Non-blocking: the app can run without Redis (blacklist will be skipped).
 */
export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
  } catch (err) {
    logger.warn({ err }, "Redis unavailable — token blacklist disabled");
  }
}
