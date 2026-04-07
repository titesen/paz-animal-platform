import app from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { connectRedis, redis } from "./config/redis";
import { pool } from "./db";

const PORT = env.PORT;
const SHUTDOWN_TIMEOUT_MS = 30_000;

// Connect to Redis (non-blocking — app works without it)
connectRedis();

const server = app.listen(PORT, () => {
  logger.info(`🚀 Backend server running on http://localhost:${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
});

/**
 * Graceful shutdown handler.
 * 1. Stop accepting new connections
 * 2. Drain the database connection pool
 * 3. Disconnect Redis
 * 4. Exit cleanly — or force-exit after timeout
 */
async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`${signal} received — starting graceful shutdown`);

  // Force exit if shutdown takes too long
  const forceTimer = setTimeout(() => {
    logger.error("Graceful shutdown timed out — forcing exit");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceTimer.unref();

  // 1. Stop accepting new connections and wait for in-flight requests
  server.close(() => {
    logger.info("HTTP server closed — no longer accepting connections");
  });

  try {
    // 2. Drain database connection pool
    await pool.end();
    logger.info("Database pool drained");
  } catch (err) {
    logger.error({ err }, "Error draining database pool");
  }

  try {
    // 3. Disconnect Redis (only if connected)
    if (redis.status === "ready" || redis.status === "connecting") {
      await redis.quit();
      logger.info("Redis disconnected");
    }
  } catch (err) {
    logger.error({ err }, "Error disconnecting Redis");
  }

  logger.info("Graceful shutdown complete");
  process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
