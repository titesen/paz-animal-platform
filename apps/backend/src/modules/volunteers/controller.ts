/**
 * @file Volunteers Controller - Placeholder
 */

import type { Response } from "express";
import { asyncHandler } from "../../utils";

export const createVolunteerApplication = asyncHandler(
  async (req, res: Response) => {
    // TODO: Implement
    res.status(501).json({
      status: "error",
      message: "Not yet implemented",
      code: "NOT_IMPLEMENTED",
    });
  },
);
