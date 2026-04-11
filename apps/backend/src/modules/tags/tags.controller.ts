import type { Response } from "express";
import type { JSendSuccess } from "../../common/types";
import { asyncHandler } from "../../common/utils";
import * as tagsService from "./tags.service";

export const getAllTags = asyncHandler(async (_req, res: Response) => {
  const result = await tagsService.getAllTags();
  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const createTag = asyncHandler(async (req, res: Response) => {
  const result = await tagsService.createTag(req.body);
  const response: JSendSuccess = { status: "success", data: result };
  res.status(201).json(response);
});

export const updateTag = asyncHandler(async (req, res: Response) => {
  const tagId = Number(req.params.tagId);
  const result = await tagsService.updateTag(tagId, req.body);
  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const deleteTag = asyncHandler(async (req, res: Response) => {
  const tagId = Number(req.params.tagId);
  await tagsService.deleteTag(tagId);
  const response: JSendSuccess = { status: "success", data: { message: "Tag deleted" } };
  res.status(200).json(response);
});

export const assignTag = asyncHandler(async (req, res: Response) => {
  const tagId = Number(req.params.tagId);
  const result = await tagsService.assignTag(tagId, req.body);
  const response: JSendSuccess = { status: "success", data: result };
  res.status(201).json(response);
});

export const removeTag = asyncHandler(async (req, res: Response) => {
  const tagId = Number(req.params.tagId);
  await tagsService.removeTag(tagId, req.body);
  const response: JSendSuccess = {
    status: "success",
    data: { message: "Tag removed from entity" },
  };
  res.status(200).json(response);
});

export const getTagsForEntity = asyncHandler(async (req, res: Response) => {
  const { entityType, entityId } = req.params;
  const result = await tagsService.getTagsForEntity(entityType, entityId);
  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});
