import * as likesRepo from "./likes.repository";
import type { ToggleLikeDTO } from "./likes.dto";

export async function toggleLike(userId: string, data: ToggleLikeDTO) {
  const existing = await likesRepo.findLike(userId, data.entityType, data.entityId);

  if (existing) {
    await likesRepo.deleteLike(userId, data.entityType, data.entityId);
    return { liked: false };
  }

  await likesRepo.createLike(userId, data.entityType, data.entityId);
  return { liked: true };
}

export async function getLikeStatus(entityType: string, entityId: string, userId?: string) {
  const count = await likesRepo.countLikesByEntity(entityType, entityId);
  const liked = userId ? await likesRepo.hasUserLiked(userId, entityType, entityId) : false;

  return { count, liked };
}
