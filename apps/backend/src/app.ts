import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { apiLimiter, errorHandler, notFoundHandler } from "./middlewares";

// Import module routes
import adoptionsRoutes from "./modules/adoptions/routes";
import authRoutes from "./modules/auth/routes";
import cmsRoutes from "./modules/cms/routes";
import eventsRoutes from "./modules/events/routes";
import financeRoutes from "./modules/finance/routes";
import petsRoutes from "./modules/pets/routes";
import volunteersRoutes from "./modules/volunteers/routes";

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

// Request logging
app.use((req, _res, next) => {
  logger.info(
    { method: req.method, url: req.url, ip: req.ip },
    "Incoming request",
  );
  next();
});

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API routes with rate limiting
app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/pets", petsRoutes);
app.use("/api/adoptions", adoptionsRoutes);
app.use("/api/volunteers", volunteersRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/cms", cmsRoutes);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
