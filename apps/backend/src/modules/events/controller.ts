/** @file Events Controller - Placeholder */
import type { Response } from "express";
import { asyncHandler } from "../../utils";

export const createEvent = asyncHandler(async (_req, res: Response) => {
  res.status(501).json({
    status: "error",
    message: "Not implemented",
    code: "NOT_IMPLEMENTED",
  });
});
