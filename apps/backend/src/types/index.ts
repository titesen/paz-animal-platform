/**
 * @file Shared TypeScript Types & Interfaces
 * @description Central type definitions used across the backend application
 */

import type { Request } from "express";
import type * as schema from "../db/schema";

/**
 * JSend Response Envelope (Standard API Response Format)
 * @see https://github.com/omniti-labs/jsend
 */
export type JSendSuccess<T = unknown> = {
  status: "success";
  data: T;
};

export type JSendError = {
  status: "error";
  message: string;
  code?: string;
  details?: unknown;
};

export type JSendFail = {
  status: "fail";
  data: Record<string, unknown>;
};

export type JSendResponse<T = unknown> =
  | JSendSuccess<T>
  | JSendError
  | JSendFail;

/**
 * Authenticated Request
 * Extends Express Request with user information after authentication
 */
export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    roles: string[];
  };
}

/**
 * Pagination Query Parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Paginated Response Wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Database Entity Types (Inferred from Drizzle Schema)
 */
export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;

export type Pet = typeof schema.pets.$inferSelect;
export type NewPet = typeof schema.pets.$inferInsert;

export type AdoptionApplication =
  typeof schema.adoptionApplications.$inferSelect;
export type NewAdoptionApplication =
  typeof schema.adoptionApplications.$inferInsert;

export type Event = typeof schema.events.$inferSelect;
export type NewEvent = typeof schema.events.$inferInsert;

export type News = typeof schema.news.$inferSelect;
export type NewNews = typeof schema.news.$inferInsert;

export type Volunteer = typeof schema.volunteers.$inferSelect;
export type NewVolunteer = typeof schema.volunteers.$inferInsert;

export type Transaction = typeof schema.transactions.$inferSelect;
export type NewTransaction = typeof schema.transactions.$inferInsert;

/**
 * Role-Based Access Control (RBAC)
 */
export type UserRole = "ADMIN" | "CLIENT" | "VOLUNTEER";

/**
 * JWT Payload
 */
export interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

/**
 * Upload File Metadata
 */
export interface FileUpload {
  originalName: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

/**
 * External Integration Types
 */
export interface MercadoPagoPreference {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
}

export interface GoogleOAuthTokens {
  access_token: string;
  refresh_token?: string;
  id_token: string;
  expires_in: number;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
}

/**
 * Email Template Types
 */
export type EmailTemplate =
  | "welcome"
  | "adoption-confirmation"
  | "donation-thanks"
  | "volunteer-accepted"
  | "event-registration"
  | "password-reset";

export interface EmailPayload {
  to: string;
  subject: string;
  template: EmailTemplate;
  data: Record<string, unknown>;
}
