/**
 * @file Auth Module - Domain Types
 * @description Domain interfaces and response types for auth module
 */

/**
 * Auth Response Schema
 */
export interface AuthResponse {
  user: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
