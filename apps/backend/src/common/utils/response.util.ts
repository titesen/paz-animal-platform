// Response utilities following JSend standard
import type { Response } from "express";

export interface SuccessResponse<T = any> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error: {
    code: string;
    details?: any;
  };
  data: null;
  timestamp: string;
}

/**
 * Send a success response
 * @param res - Express response object
 * @param data - Response data
 * @param message - Success message
 * @param statusCode - HTTP status code (default: 200)
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = "Success",
  statusCode: number = 200,
): void {
  const response: SuccessResponse<T> = {
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
}

/**
 * Send an error response
 * @param res - Express response object
 * @param message - Error message
 * @param statusCode - HTTP status code (default: 500)
 * @param code - Error code
 * @param details - Additional error details
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  code: string = "INTERNAL_ERROR",
  details?: any,
): void {
  const response: ErrorResponse = {
    success: false,
    statusCode,
    message,
    error: {
      code,
      details,
    },
    data: null,
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(response);
}

/**
 * Send a created response (201)
 * @param res - Express response object
 * @param data - Response data
 * @param message - Success message
 */
export function sendCreated<T>(
  res: Response,
  data: T,
  message: string = "Resource created successfully",
): void {
  sendSuccess(res, data, message, 201);
}

/**
 * Send a no content response (204)
 * @param res - Express response object
 */
export function sendNoContent(res: Response): void {
  res.status(204).send();
}
