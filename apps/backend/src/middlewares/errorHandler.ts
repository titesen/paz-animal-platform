/**
 * @file Global Error Handler Middleware
 * @description Catches all errors and returns JSend-compliant responses
 * @pattern Chain of Responsibility (Express middleware pipeline)
 */

import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { logger } from "../config/logger";
import type { JSendError, JSendFail } from "../types";
import { AppError, ValidationError } from "../types/errors";

/**
 * Global error handler - MUST be registered last in middleware chain
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Log error for observability
  logger.error({
    err,
    req: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
    },
    msg: "Error occurred",
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const validationErrors: Record<string, string[]> = {};
    err.issues.forEach((issue) => {
      const path = issue.path.join(".");
      if (!validationErrors[path]) {
        validationErrors[path] = [];
      }
      validationErrors[path].push(issue.message);
    });

    const response: JSendFail = {
      status: "fail",
      data: validationErrors,
    };

    res.status(400).json(response);
    return;
  }

  // Handle custom AppError instances
  if (err instanceof AppError) {
    // Validation errors return "fail" status with field-level errors
    if (err instanceof ValidationError && err.errors) {
      const response: JSendFail = {
        status: "fail",
        data: err.errors,
      };
      res.status(err.statusCode).json(response);
      return;
    }

    // Other AppErrors return "error" status with message
    const response: JSendError = {
      status: "error",
      message: err.message,
      code: err.code,
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle unknown errors (programming errors)
  const response: JSendError = {
    status: "error",
    message:
      env.NODE_ENV === "production" ? "Internal server error" : err.message,
    code: "INTERNAL_ERROR",
    ...(env.NODE_ENV !== "production" && { details: err.stack }),
  };

  res.status(500).json(response);
}

/**
 * 404 Not Found handler with helpful suggestions
 * Should be registered before errorHandler but after all routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  // Available API routes for suggestions
  const availableRoutes = [
    "/health",
    "/version",
    "/api-docs",
    "/api/auth/register",
    "/api/auth/login",
    "/api/pets",
    "/api/adoptions",
    "/api/volunteers",
    "/api/events",
    "/api/finance",
    "/api/cms",
  ];

  // Find similar routes (basic string matching)
  const requestedPath = req.path.toLowerCase();
  const suggestions = availableRoutes.filter((route) =>
    route.toLowerCase().includes(requestedPath.split("/")[1] || ""),
  );

  const response: JSendError = {
    status: "error",
    message: `Route ${req.method} ${req.path} not found`,
    code: "NOT_FOUND",
    ...(suggestions.length > 0 && {
      suggestions: {
        message: "Did you mean one of these endpoints?",
        routes: suggestions,
      },
    }),
    ...(env.NODE_ENV !== "production" && {
      hint: "Check /api-docs for full API documentation",
    }),
  };

  res.status(404).json(response);
}
