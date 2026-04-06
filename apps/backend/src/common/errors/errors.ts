/**
 * @file Custom Application Error Classes
 * @description Type-safe error handling with semantic HTTP status codes
 */

/**
 * Base Application Error
 * All custom errors extend this class for consistent error handling
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // Indicates trusted errors vs programming errors

    // Maintains proper stack trace for where error was thrown (V8 engines only)
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * 400 Bad Request - Invalid client input
 */
export class BadRequestError extends AppError {
  constructor(message: string = "Bad Request", code: string = "BAD_REQUEST") {
    super(message, 400, code);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * 401 Unauthorized - Missing or invalid authentication
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized", code: string = "UNAUTHORIZED") {
    super(message, 401, code);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * 403 Forbidden - Authenticated but insufficient permissions
 */
export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden", code: string = "FORBIDDEN") {
    super(message, 403, code);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * 404 Not Found - Resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", code: string = "NOT_FOUND") {
    super(message, 404, code);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 409 Conflict - Resource conflict (e.g., duplicate email)
 */
export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict", code: string = "CONFLICT") {
    super(message, 409, code);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * 422 Unprocessable Entity - Validation failed
 */
export class ValidationError extends AppError {
  constructor(
    message: string = "Validation failed",
    code: string = "VALIDATION_ERROR",
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message, 422, code);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests", code: string = "RATE_LIMIT_EXCEEDED") {
    super(message, 429, code);
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * 500 Internal Server Error - Unexpected server error
 */
export class InternalError extends AppError {
  constructor(message: string = "Internal server error", code: string = "INTERNAL_ERROR") {
    super(message, 500, code);
    Object.setPrototypeOf(this, InternalError.prototype);
  }
}

/**
 * 503 Service Unavailable - External dependency failure
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = "Service unavailable", code: string = "SERVICE_UNAVAILABLE") {
    super(message, 503, code);
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}
