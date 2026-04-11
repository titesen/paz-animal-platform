import type { Response } from "express";
import type { JSendSuccess } from "../../common/types";
import { asyncHandler } from "../../common/utils";
import * as locationsService from "./locations.service";

export const getAllProvinces = asyncHandler(async (_req, res: Response) => {
  const result = await locationsService.getAllProvinces();
  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const createProvince = asyncHandler(async (req, res: Response) => {
  const result = await locationsService.createProvince(req.body);
  const response: JSendSuccess = { status: "success", data: result };
  res.status(201).json(response);
});

export const getCitiesByProvince = asyncHandler(async (req, res: Response) => {
  const provinceId = Number(req.params.provinceId);
  const result = await locationsService.getCitiesByProvince(provinceId);
  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const createCity = asyncHandler(async (req, res: Response) => {
  const result = await locationsService.createCity(req.body);
  const response: JSendSuccess = { status: "success", data: result };
  res.status(201).json(response);
});
