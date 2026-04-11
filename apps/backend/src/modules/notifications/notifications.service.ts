import { NotFoundError } from "../../common/errors";
import * as notificationsRepo from "./notifications.repository";
import type { CreateNotificationDTO, MarkReadDTO } from "./notifications.dto";

export async function createNotification(data: CreateNotificationDTO) {
  return notificationsRepo.createNotification({
    userId: data.userId,
    type: data.type,
    subject: data.subject,
    body: data.body,
  });
}

export async function getMyNotifications(userId: string) {
  return notificationsRepo.findNotificationsByUser(userId);
}

export async function markAsRead(userId: string, data: MarkReadDTO) {
  return notificationsRepo.markNotificationsRead(data.notificationIds, userId);
}

export async function getNotificationById(notificationId: string) {
  const notification = await notificationsRepo.findNotificationById(notificationId);
  if (!notification) {
    throw new NotFoundError("Notification not found", "NOTIFICATION_NOT_FOUND");
  }
  return notification;
}

export async function getAllNotifications() {
  return notificationsRepo.findAllNotifications();
}
