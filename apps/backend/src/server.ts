import app from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { connectRedis } from "./config/redis";

const PORT = env.PORT;

// Connect to Redis (non-blocking — app works without it)
connectRedis();

app.listen(PORT, () => {
  logger.info(`🚀 Backend server running on http://localhost:${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
});
