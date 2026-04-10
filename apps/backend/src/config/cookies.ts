/**
 * @file Cookie Configuration
 * @description Secure cookie options for refresh token storage
 *
 * The refresh token is stored in an httpOnly cookie to prevent XSS attacks.
 * - httpOnly: JavaScript cannot access the cookie (mitigates XSS)
 * - sameSite "strict": Cookie only sent on same-site requests (mitigates CSRF)
 * - secure: Cookie only sent over HTTPS in production
 * - path: Restricts cookie to auth endpoints only (minimizes exposure)
 */

import type { CookieOptions } from "express";
import { env } from "./env";

export const REFRESH_TOKEN_COOKIE_NAME = "__paz_refresh_token";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api/auth",
  maxAge: SEVEN_DAYS_MS,
};
