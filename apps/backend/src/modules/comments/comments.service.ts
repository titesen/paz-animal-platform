import { ForbiddenError, NotFoundError } from "../../common/errors";
import * as commentsRepo from "./comments.repository";
import type { CreateCommentDTO, ModerateCommentDTO, UpdateCommentDTO } from "./comments.dto";

export async function createComment(userId: string, data: CreateCommentDTO) {
  return commentsRepo.createComment({
    authorId: userId,
    entityType: data.entityType,
    entityId: data.entityId,
    content: data.content,
    parentCommentId: data.parentCommentId,
  });
}

export async function getCommentsByEntity(entityType: string, entityId: string) {
  return commentsRepo.findCommentsByEntity(entityType, entityId);
}

export async function updateComment(
  commentId: string,
  userId: string,
  userRoles: string[],
  data: UpdateCommentDTO,
) {
  const comment = await commentsRepo.findCommentById(commentId);
  if (!comment) {
    throw new NotFoundError("Comment not found", "COMMENT_NOT_FOUND");
  }

  if (comment.authorId !== userId && !userRoles.includes("ADMIN")) {
    throw new ForbiddenError("You can only edit your own comments");
  }

  return commentsRepo.updateComment(commentId, data.content);
}

export async function deleteComment(commentId: string, userId: string, userRoles: string[]) {
  const comment = await commentsRepo.findCommentById(commentId);
  if (!comment) {
    throw new NotFoundError("Comment not found", "COMMENT_NOT_FOUND");
  }

  if (comment.authorId !== userId && !userRoles.includes("ADMIN")) {
    throw new ForbiddenError("You can only delete your own comments");
  }

  return commentsRepo.softDeleteComment(commentId);
}

export async function moderateComment(commentId: string, data: ModerateCommentDTO) {
  const comment = await commentsRepo.findCommentById(commentId);
  if (!comment) {
    throw new NotFoundError("Comment not found", "COMMENT_NOT_FOUND");
  }

  return commentsRepo.moderateComment(commentId, data.moderationStatus);
}
