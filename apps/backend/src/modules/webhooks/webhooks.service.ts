import { logger } from "../../config/logger";
import { NotFoundError } from "../../common/errors";
import * as webhooksRepo from "./webhooks.repository";

export async function receiveWebhook(source: string, payload: unknown) {
  const webhook = await webhooksRepo.createWebhook({ source, payload });
  logger.info({ webhookId: webhook.webhookId, source }, "Webhook received");
  return webhook;
}

export async function getWebhooks(filters?: {
  source?: string;
  isProcessed?: boolean;
  limit?: number;
  offset?: number;
}) {
  return webhooksRepo.findWebhooks(filters);
}

export async function getWebhookById(webhookId: string) {
  const webhook = await webhooksRepo.findWebhookById(webhookId);
  if (!webhook) {
    throw new NotFoundError("Webhook not found", "WEBHOOK_NOT_FOUND");
  }
  return webhook;
}

export async function markProcessed(webhookId: string, error?: string) {
  const webhook = await webhooksRepo.findWebhookById(webhookId);
  if (!webhook) {
    throw new NotFoundError("Webhook not found", "WEBHOOK_NOT_FOUND");
  }
  return webhooksRepo.markWebhookProcessed(webhookId, error);
}
