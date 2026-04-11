import { logger } from "../../config/logger";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../common/errors";
import { calculateTotalPages, parsePagination } from "../../common/utils/formatter";
import * as usersRepo from "./users.repository";
import type { UpdateUserDTO, UpdateUserRolesDTO, UsersQueryParams } from "./users.dto";

export async function listUsers(queryParams: UsersQueryParams) {
  const { page, limit, offset } = parsePagination(queryParams.page, queryParams.limit);

  const { users, total } = await usersRepo.findUsers({
    page,
    limit,
    offset,
    role: queryParams.role,
    search: queryParams.search,
    status: queryParams.status,
    sortBy: queryParams.sortBy || "createdAt",
    sortOrder: queryParams.sortOrder || "desc",
  });

  // Strip sensitive fields
  const sanitized = users.map((u) => ({
    userId: u.userId,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone,
    avatarUrl: u.avatarUrl,
    createdAt: u.createdAt,
    deletedAt: u.deletedAt,
  }));

  return {
    items: sanitized,
    pagination: { page, limit, total, totalPages: calculateTotalPages(total, limit) },
  };
}

export async function getUserById(userId: string) {
  const user = await usersRepo.findUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found", "USER_NOT_FOUND");
  }

  const roles = await usersRepo.getUserRoles(userId);

  return {
    userId: user.userId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    secondaryEmail: user.secondaryEmail,
    birthDate: user.birthDate,
    avatarUrl: user.avatarUrl,
    docType: user.docType,
    docNumber: user.docNumber,
    tfaEnabled: user.tfaEnabled,
    createdAt: user.createdAt,
    deletedAt: user.deletedAt,
    roles,
  };
}

export async function updateUser(userId: string, data: UpdateUserDTO) {
  const user = await usersRepo.findUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found", "USER_NOT_FOUND");
  }

  const updated = await usersRepo.updateUser(userId, data);

  logger.info({ userId, updates: Object.keys(data) }, "Admin updated user");

  return updated;
}

export async function updateUserRoles(
  adminUserId: string,
  userId: string,
  data: UpdateUserRolesDTO,
) {
  const user = await usersRepo.findUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found", "USER_NOT_FOUND");
  }

  // Prevent self-role modification
  if (adminUserId === userId) {
    throw new ForbiddenError("Cannot modify your own roles", "CANNOT_MODIFY_OWN_ROLES");
  }

  await usersRepo.setUserRoles(userId, data.roles);

  logger.info({ adminUserId, userId, roles: data.roles }, "User roles updated");

  return { userId, roles: data.roles };
}

export async function banUser(adminUserId: string, userId: string) {
  if (adminUserId === userId) {
    throw new ForbiddenError("Cannot ban yourself", "CANNOT_BAN_SELF");
  }

  const user = await usersRepo.findUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found", "USER_NOT_FOUND");
  }

  if (user.deletedAt) {
    throw new BadRequestError("User is already banned", "ALREADY_BANNED");
  }

  await usersRepo.softDeleteUser(userId);

  logger.info({ adminUserId, userId }, "User banned");
}

export async function unbanUser(userId: string) {
  const user = await usersRepo.findUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found", "USER_NOT_FOUND");
  }

  if (!user.deletedAt) {
    throw new BadRequestError("User is not banned", "NOT_BANNED");
  }

  await usersRepo.restoreUser(userId);

  logger.info({ userId }, "User unbanned");
}
