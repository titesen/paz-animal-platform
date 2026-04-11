import { z } from "zod";

export const userIdSchema = z.object({
  userId: z.string().uuid(),
});

export type UserIdParams = z.infer<typeof userIdSchema>;

export const usersQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("20"),
  role: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(["active", "banned"]).optional(),
  sortBy: z.enum(["createdAt", "email", "firstName"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type UsersQueryParams = z.infer<typeof usersQuerySchema>;

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z
    .string()
    .regex(/^\+?\d{8,15}$/)
    .optional()
    .nullable(),
  birthDate: z.string().date().optional().nullable(),
});

export type UpdateUserDTO = z.infer<typeof updateUserSchema>;

export const updateUserRolesSchema = z.object({
  roles: z.array(z.string().min(1)).min(1, "At least one role is required"),
});

export type UpdateUserRolesDTO = z.infer<typeof updateUserRolesSchema>;
