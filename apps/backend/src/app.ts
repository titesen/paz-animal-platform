import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Request, type Response } from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { generateOpenAPIDocument } from "./config/openapi";
import { pool } from "./db";
import { apiLimiter, errorHandler, notFoundHandler } from "./common/middlewares";

// Import module routes
import adoptionsRoutes from "./modules/adoptions/adoptions.routes";
import addressesRoutes from "./modules/addresses/addresses.routes";
import auditLogsRoutes from "./modules/audit-logs/audit-logs.routes";
import authRoutes from "./modules/auth/auth.routes";
import cmsRoutes from "./modules/cms/cms.routes";
import commentsRoutes from "./modules/comments/comments.routes";
import eventsRoutes from "./modules/events/events.routes";
import financeRoutes from "./modules/finance/finance.routes";
import likesRoutes from "./modules/likes/likes.routes";
import locationsRoutes from "./modules/locations/locations.routes";
import mediaRoutes from "./modules/media/media.routes";
import notificationsRoutes from "./modules/notifications/notifications.routes";
import petsRoutes from "./modules/pets/pets.routes";
import reportsRoutes from "./modules/reports/reports.routes";
import tagsRoutes from "./modules/tags/tags.routes";
import usersRoutes from "./modules/users/users.routes";
import volunteersRoutes from "./modules/volunteers/volunteers.routes";
import webhooksRoutes from "./modules/webhooks/webhooks.routes";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// HTTP request/response logging with correlation IDs
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req: Request) => {
        // Don't log health checks and static assets to reduce noise
        return req.url === "/health" || req.url === "/version";
      },
    },
    customProps: (req: Request) => ({
      // Add correlation ID for request tracing
      correlationId: req.headers["x-correlation-id"] || undefined,
    }),
    customSuccessMessage: (req: Request, res: Response) => {
      return `${req.method} ${req.url} completed with ${res.statusCode}`;
    },
    customErrorMessage: (req: Request, _res: Response, err: Error) => {
      return `${req.method} ${req.url} failed: ${err.message}`;
    },
  }),
);

// Health check endpoint with database verification
app.get("/health", async (_req, res) => {
  const startTime = Date.now();
  const healthStatus: {
    status: "ok" | "degraded" | "error";
    timestamp: string;
    environment: string;
    uptime: number;
    database: {
      status: "connected" | "disconnected" | "error";
      responseTime?: number;
      error?: string;
    };
    memory: {
      usage: number;
      total: number;
      percentage: number;
    };
  } = {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    uptime: process.uptime(),
    database: {
      status: "disconnected",
    },
    memory: {
      usage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      percentage: Math.round(
        (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100,
      ),
    },
  };

  // Database health check
  try {
    const dbStart = Date.now();
    await pool.query("SELECT 1");
    healthStatus.database = {
      status: "connected",
      responseTime: Date.now() - dbStart,
    };
  } catch (error) {
    healthStatus.status = "degraded";
    healthStatus.database = {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown database error",
    };
    logger.error({ error }, "Database health check failed");
  }

  const responseTime = Date.now() - startTime;
  const statusCode = healthStatus.status === "ok" ? 200 : 503;

  res.status(statusCode).json({
    ...healthStatus,
    responseTime,
  });
});

// Version endpoint
app.get("/version", (_req, res) => {
  res.json({
    version: "1.0.0",
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    buildTimestamp: new Date().toISOString(),
  });
});

// API Documentation (Swagger UI) - disabled in production
if (env.NODE_ENV !== "production") {
  const openApiSpec = generateOpenAPIDocument();

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, {
      customSiteTitle: "Paz Animal API Documentation",
      customCss: ".swagger-ui .topbar { display: none }",
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
      },
    }),
  );

  // Swagger JSON endpoint
  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(openApiSpec);
  });
}

// Static file serving for uploads (secured: no directory listing, deny dotfiles)
app.use(
  "/uploads",
  express.static("uploads", {
    index: false,
    dotfiles: "deny",
  }),
);

// API routes with rate limiting
app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/pets", petsRoutes);
app.use("/api/adoptions", adoptionsRoutes);
app.use("/api/addresses", addressesRoutes);
app.use("/api/volunteers", volunteersRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/tags", tagsRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/likes", likesRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/audit-logs", auditLogsRoutes);
app.use("/api/webhooks", webhooksRoutes);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
