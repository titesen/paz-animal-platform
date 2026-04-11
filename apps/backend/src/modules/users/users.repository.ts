import { and, asc, desc, eq, ilike, isNotNull, isNull, or, sql } from "drizzle-orm";
import { db } from "../../db";
import * as schema from "../../db/schema";
import type { IUsersRepository } from "./users.repository.interface";

export async function findUsers(filters: {
  page: number;
  limit: number;
  offset: number;
  role?: string;
  search?: string;
  status?: "active" | "banned";
  sortBy: string;
  sortOrder: "asc" | "desc";
}) {
  const { limit, offset, role, search, status, sortBy, sortOrder } = filters;

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(schema.users.email, `%${search}%`),
        ilike(schema.users.firstName, `%${search}%`),
        ilike(schema.users.lastName, `%${search}%`),
      ),
    );
  }

  if (status === "active") {
    conditions.push(isNull(schema.users.deletedAt));
  } else if (status === "banned") {
    conditions.push(isNotNull(schema.users.deletedAt));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const sortColumns = {
    createdAt: schema.users.createdAt,
    email: schema.users.email,
    firstName: schema.users.firstName,
  } as const;

  const orderByColumn = sortColumns[sortBy as keyof typeof sortColumns] || schema.users.createdAt;
  const orderByClause = sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

  const query = db
    .select()
    .from(schema.users)
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  // If filtering by role, add join
  if (role) {
    const usersWithRole = await db
      .select({ userId: schema.usersRoles.userId })
      .from(schema.usersRoles)
      .innerJoin(schema.roles, eq(schema.usersRoles.roleId, schema.roles.roleId))
      .where(eq(schema.roles.name, role));

    const userIds = usersWithRole.map((u) => u.userId);

    if (userIds.length === 0) {
      return { users: [], total: 0 };
    }

    const roleCondition = sql`${schema.users.userId} IN (${sql.join(
      userIds.map((id) => sql`${id}`),
      sql`, `,
    )})`;

    const allConditions = whereClause ? and(whereClause, roleCondition) : roleCondition;

    const users = await db
      .select()
      .from(schema.users)
      .where(allConditions)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.users)
      .where(allConditions);

    return { users, total: countResult[0]?.count || 0 };
  }

  const users = await query;

  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.users)
    .where(whereClause);

  return { users, total: countResult[0]?.count || 0 };
}

export async function findUserById(userId: string) {
  const result = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.userId, userId))
    .limit(1);
  return result[0] || null;
}

export async function updateUser(userId: string, data: Record<string, unknown>) {
  const result = await db
    .update(schema.users)
    .set(data)
    .where(eq(schema.users.userId, userId))
    .returning();
  return result[0] || null;
}

export async function softDeleteUser(userId: string): Promise<void> {
  await db
    .update(schema.users)
    .set({ deletedAt: new Date() })
    .where(eq(schema.users.userId, userId));
}

export async function restoreUser(userId: string): Promise<void> {
  await db.update(schema.users).set({ deletedAt: null }).where(eq(schema.users.userId, userId));
}

export async function getUserRoles(userId: string): Promise<string[]> {
  const userRoles = await db
    .select({ roleName: schema.roles.name })
    .from(schema.usersRoles)
    .innerJoin(schema.roles, eq(schema.usersRoles.roleId, schema.roles.roleId))
    .where(eq(schema.usersRoles.userId, userId));
  return userRoles.map((ur) => ur.roleName);
}

export async function setUserRoles(userId: string, roleNames: string[]): Promise<void> {
  // Remove all existing roles
  await db.delete(schema.usersRoles).where(eq(schema.usersRoles.userId, userId));

  // Find role IDs
  for (const roleName of roleNames) {
    const role = await db
      .select()
      .from(schema.roles)
      .where(eq(schema.roles.name, roleName))
      .limit(1);

    if (role[0]) {
      await db
        .insert(schema.usersRoles)
        .values({ userId, roleId: role[0].roleId })
        .onConflictDoNothing();
    }
  }
}

// Compile-time contract verification
void ({
  findUsers,
  findUserById,
  updateUser,
  softDeleteUser,
  restoreUser,
  getUserRoles,
  setUserRoles,
} satisfies IUsersRepository);
