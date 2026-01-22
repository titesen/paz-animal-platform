/**
 * @file Zod Schema Validation Middleware
 * @description Express middleware factory for request validation using Zod
 */

import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

/**
 * Validates request data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param source - Which part of the request to validate (body, query, params)
 */
export function validate(
  schema: ZodSchema,
  source: "body" | "query" | "params" = "body",
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = req[source];
      const validated = schema.parse(dataToValidate);

      // Replace request data with validated (and potentially transformed) data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any)[source] = validated;

      next();
    } catch (error) {
      // ZodError will be caught by global error handler
      next(error);
    }
  };
}

/**
 * Validates multiple parts of the request
 * @param schemas - Object with schemas for body, query, and/or params
 */
export function validateMultiple(schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req as any).body = schemas.body.parse(req.body);
      }

      if (schemas.query) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req as any).query = schemas.query.parse(req.query);
      }

      if (schemas.params) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req as any).params = schemas.params.parse(req.params);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
