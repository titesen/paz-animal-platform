/**
 * Logger Configuration using Pino v10
 *
 * Features:
 * - Development: Pretty-printed, colorized logs with timestamps
 * - Production: Structured JSON logs optimized for log aggregation
 * - Test: Silent mode to avoid cluttering test output
 * - Redaction: Sensitive fields automatically masked
 * - Performance: Zero-cost abstractions, minimal overhead
 */
import pino from "pino";
import { env } from "./env.js";

const isDevelopment = env.NODE_ENV === "development";
const isProduction = env.NODE_ENV === "production";
const isTest = env.NODE_ENV === "test";

export const logger = pino({
  // Log level hierarchy: trace < debug < info < warn < error < fatal
  level: isTest ? "silent" : isDevelopment ? "debug" : "info",

  // Redact sensitive information from logs (GDPR/security compliance)
  redact: {
    paths: [
      "password",
      "passwordHash",
      "password_hash",
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.passwordHash",
      "*.token",
      "*.secret",
      "*.apiKey",
      "user.passwordHash",
      "user.tfaSecret",
    ],
    censor: "[REDACTED]",
  },

  // Base context included in all logs
  base: {
    env: env.NODE_ENV,
    // Remove pid and hostname in production (not useful in containerized environments)
    ...(isProduction ? {} : { pid: process.pid, hostname: undefined }),
  },

  // Pretty printing in development for readability
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "yyyy-mm-dd HH:MM:ss.l",
          ignore: "pid,hostname",
          singleLine: false,
          // Show errors with stack traces
          errorLikeObjectKeys: ["err", "error"],
          messageFormat: "{levelLabel} - {msg}",
        },
      }
    : undefined,

  // Custom formatters for consistent log structure
  formatters: {
    level: (label, number) => {
      return { level: label, levelValue: number };
    },
    // Bindings formatter (context added via logger.child())
    bindings: (bindings) => {
      return {
        // Only include process info in development
        ...(isDevelopment ? { pid: bindings.pid } : {}),
        // Custom context
        ...bindings,
      };
    },
    // Log object formatter
    log: (object) => {
      // Ensure errors are properly serialized with stack traces
      if (object.err && object.err instanceof Error) {
        return {
          ...object,
          err: pino.stdSerializers.err(object.err),
        };
      }
      return object;
    },
  },

  // ISO 8601 timestamp for consistency across systems
  timestamp: pino.stdTimeFunctions.isoTime,

  // Serialize errors with stack traces automatically
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});
