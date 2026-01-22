/**
 * @file Rate Limiting Middleware
 * @description Protection against brute-force and DDoS attacks
 */

import rateLimit from "express-rate-limit";
import type { JSendError } from "../types";

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (_req, res) => {
    const response: JSendError = {
      status: "error",
      message: "Too many requests, please try again later",
      code: "RATE_LIMIT_EXCEEDED",
    };
    res.status(429).json(response);
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (_req, res) => {
    const response: JSendError = {
      status: "error",
      message:
        "Too many authentication attempts, please try again in 15 minutes",
      code: "AUTH_RATE_LIMIT_EXCEEDED",
    };
    res.status(429).json(response);
  },
});

/**
 * Rate limiter for file uploads
 * 10 uploads per hour per IP
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  handler: (_req, res) => {
    const response: JSendError = {
      status: "error",
      message: "Too many uploads, please try again later",
      code: "UPLOAD_RATE_LIMIT_EXCEEDED",
    };
    res.status(429).json(response);
  },
});

/**
 * Lenient rate limiter for public read endpoints
 * 1000 requests per 15 minutes per IP
 */
export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  handler: (_req, res) => {
    const response: JSendError = {
      status: "error",
      message: "Too many requests, please try again later",
      code: "RATE_LIMIT_EXCEEDED",
    };
    res.status(429).json(response);
  },
});
