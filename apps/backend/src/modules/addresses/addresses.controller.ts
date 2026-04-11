import type { Response } from "express";
import type { JSendSuccess } from "../../common/types";
import { asyncHandler } from "../../common/utils";
import * as addressesService from "./addresses.service";

export const getAddressesForEntity = asyncHandler(async (req, res: Response) => {
  const { entityType, entityId } = req.params;
  const result = await addressesService.getAddressesForEntity(entityType, entityId);
  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const createAddress = asyncHandler(async (req, res: Response) => {
  const result = await addressesService.createAddress(req.body);
  const response: JSendSuccess = { status: "success", data: result };
  res.status(201).json(response);
});

export const updateAddress = asyncHandler(async (req, res: Response) => {
  const { addressId } = req.params;
  const result = await addressesService.updateAddress(addressId, req.body);
  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const deleteAddress = asyncHandler(async (req, res: Response) => {
  const { addressId } = req.params;
  await addressesService.deleteAddress(addressId);
  const response: JSendSuccess = { status: "success", data: { message: "Address deleted" } };
  res.status(200).json(response);
});
