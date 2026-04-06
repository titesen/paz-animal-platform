/**
 * @file Auth Repository Interface
 * @description Contract for the auth data access layer
 */

import type { NewUser, User } from "../../common/types";

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(userId: string): Promise<User | null>;
  createUser(userData: NewUser): Promise<User>;
  getUserRoles(userId: string): Promise<string[]>;
  assignRoleToUser(userId: string, roleName: string): Promise<void>;
  updateUserPassword(userId: string, passwordHash: string): Promise<void>;
  findUserByGoogleId(googleId: string): Promise<User | null>;
  softDeleteUser(userId: string): Promise<void>;
  isEmailTaken(email: string): Promise<boolean>;
}
