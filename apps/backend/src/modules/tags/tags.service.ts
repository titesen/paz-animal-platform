import { NotFoundError } from "../../common/errors";
import * as tagsRepo from "./tags.repository";
import type { AssignTagDTO, CreateTagDTO, UpdateTagDTO } from "./tags.dto";

export async function getAllTags() {
  return tagsRepo.findAllTags();
}

export async function createTag(data: CreateTagDTO) {
  return tagsRepo.createTag(data);
}

export async function updateTag(tagId: number, data: UpdateTagDTO) {
  const tag = await tagsRepo.findTagById(tagId);
  if (!tag) {
    throw new NotFoundError("Tag not found", "TAG_NOT_FOUND");
  }
  return tagsRepo.updateTag(tagId, data);
}

export async function deleteTag(tagId: number) {
  const tag = await tagsRepo.findTagById(tagId);
  if (!tag) {
    throw new NotFoundError("Tag not found", "TAG_NOT_FOUND");
  }
  await tagsRepo.deleteTag(tagId);
}

export async function assignTag(tagId: number, data: AssignTagDTO) {
  const tag = await tagsRepo.findTagById(tagId);
  if (!tag) {
    throw new NotFoundError("Tag not found", "TAG_NOT_FOUND");
  }
  return tagsRepo.assignTag(tagId, data.entityType, data.entityId);
}

export async function removeTag(tagId: number, data: AssignTagDTO) {
  const tag = await tagsRepo.findTagById(tagId);
  if (!tag) {
    throw new NotFoundError("Tag not found", "TAG_NOT_FOUND");
  }
  await tagsRepo.removeTag(tagId, data.entityType, data.entityId);
}

export async function getTagsForEntity(entityType: string, entityId: string) {
  return tagsRepo.findTagsForEntity(entityType, entityId);
}
