/**
 * @file Data Formatting Utilities
 * @description Helper functions for formatting data (dates, currency, etc.)
 */

import { PAGINATION } from "../constants";

/**
 * Format a date to ISO 8601 string
 * @param date - Date object or ISO string
 * @returns Formatted ISO string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toISOString();
}

/**
 * Format currency amount for display
 * @param amount - Numeric amount
 * @param currency - Currency code (default: ARS)
 * @param locale - Locale for formatting (default: es-AR)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string,
  currency: string = "ARS",
  locale: string = "es-AR",
): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(numericAmount);
}

/**
 * Format file size in human-readable format
 * @param bytes - Size in bytes
 * @returns Formatted size string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Truncate text to a maximum length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to append (default: "...")
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, suffix: string = "..."): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Sanitize filename for safe storage
 * @param filename - Original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace invalid chars with underscore
    .replace(/_{2,}/g, "_") // Replace multiple underscores with single
    .toLowerCase();
}

/**
 * Generate a unique filename with timestamp
 * @param originalName - Original filename
 * @returns Unique filename with timestamp prefix
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop();
  const baseName = originalName.replace(`.${extension}`, "");

  return `${timestamp}-${randomSuffix}-${sanitizeFilename(baseName)}.${extension}`;
}

/**
 * Parse pagination parameters
 * @param page - Page number (string from query)
 * @param limit - Items per page (string from query)
 * @returns Parsed pagination object
 */
export function parsePagination(page?: string, limit?: string) {
  const parsedPage = Math.max(1, parseInt(page || String(PAGINATION.DEFAULT_PAGE), 10));
  const parsedLimit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(limit || String(PAGINATION.DEFAULT_LIMIT), 10)),
  );
  const offset = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    offset,
  };
}

/**
 * Calculate total pages for pagination
 * @param totalItems - Total number of items
 * @param limit - Items per page
 * @returns Total number of pages
 */
export function calculateTotalPages(totalItems: number, limit: number): number {
  return Math.ceil(totalItems / limit);
}
