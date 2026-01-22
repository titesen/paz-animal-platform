/**
 * @file Async Handler Wrapper
 * @description Wraps async route handlers to catch errors and pass to error middleware
 */

import type { NextFunction, Request, Response } from "express";

/**
 * Wraps an async route handler to catch errors
 * Eliminates need for try-catch in every controller method
 *
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await userService.getAll();
 *   res.json({ status: 'success', data: users });
 * }));
 */
export function asyncHandler(
  fn: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void | Response>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
