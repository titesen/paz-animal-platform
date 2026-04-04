import app from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`🚀 Backend server running on http://localhost:${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
});
