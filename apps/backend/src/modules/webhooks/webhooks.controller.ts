import type { Request, Response } from "express";
import type { AuthenticatedRequest, JSendSuccess } from "../../common/types";
import { asyncHandler } from "../../common/utils";
import * as webhooksService from "./webhooks.service";

export const receiveWebhook = asyncHandler(async (req: Request, res: Response) => {
  const source = req.params.source;
  const result = await webhooksService.receiveWebhook(source, req.body);

  const response: JSendSuccess = { status: "success", data: result };
  res.status(201).json(response);
});

export const getWebhooks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { source, isProcessed, limit, offset } = req.query as Record<string, string | undefined>;

  const result = await webhooksService.getWebhooks({
    source,
    isProcessed: isProcessed === "true" ? true : isProcessed === "false" ? false : undefined,
    limit: limit ? parseInt(limit) : undefined,
    offset: offset ? parseInt(offset) : undefined,
  });

  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const getWebhookById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { webhookId } = req.params;
  const result = await webhooksService.getWebhookById(webhookId);

  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});

export const markProcessed = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { webhookId } = req.params;
  const result = await webhooksService.markProcessed(webhookId, req.body.error);

  const response: JSendSuccess = { status: "success", data: result };
  res.status(200).json(response);
});
