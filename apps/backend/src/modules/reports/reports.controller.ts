import type { Response } from "express";
import type { AuthenticatedRequest, JSendSuccess } from "../../common/types";
import { asyncHandler } from "../../common/utils";
import * as reportsService from "./reports.service";

export const createReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await reportsService.createReport(req.user.userId, req.body);

  const response: JSendSuccess = { status: "success", data: result };
  res.status(201).json(response);
});

export const getAllReports = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const isResolved =
    req.query.isResolved === "true" ? true : req.query.isResolved === "false" ? false : undefined;

  const result = await reportsService.getAllReports({ isResolved });

  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const getReportById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { reportId } = req.params;
  const result = await reportsService.getReportById(reportId);

  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const resolveReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { reportId } = req.params;
  const result = await reportsService.resolveReport(reportId, req.body);

  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});
