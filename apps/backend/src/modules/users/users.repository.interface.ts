import type { User } from "../../common/types";

export interface IUsersRepository {
  findUsers(filters: {
    page: number;
    limit: number;
    offset: number;
    role?: string;
    search?: string;
    status?: "active" | "banned";
    sortBy: string;
    sortOrder: "asc" | "desc";
  }): Promise<{ users: User[]; total: number }>;
  findUserById(userId: string): Promise<User | null>;
  updateUser(userId: string, data: Partial<User>): Promise<User | null>;
  softDeleteUser(userId: string): Promise<void>;
  restoreUser(userId: string): Promise<void>;
  getUserRoles(userId: string): Promise<string[]>;
  setUserRoles(userId: string, roleNames: string[]): Promise<void>;
}
