/**
 * @file Custom Validation Utilities
 * @description Business logic validation functions beyond Zod schema validation
 */

import { BadRequestError } from "../types/errors";

/**
 * Validate Argentine CUIT/CUIL format
 * @param cuit - CUIT/CUIL string
 * @returns True if valid format
 */
export function isValidCUIT(cuit: string): boolean {
  // Remove hyphens and spaces
  const cleanCuit = cuit.replace(/[-\s]/g, "");

  // Must be 11 digits
  if (!/^\d{11}$/.test(cleanCuit)) return false;

  // Validate check digit
  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;

  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCuit[i]) * multipliers[i];
  }

  const checkDigit = 11 - (sum % 11);
  const expectedDigit = checkDigit === 11 ? 0 : checkDigit === 10 ? 9 : checkDigit;

  return parseInt(cleanCuit[10]) === expectedDigit;
}

/**
 * Validate email format (more strict than basic regex)
 * @param email - Email address
 * @returns True if valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (flexible format)
 * Accepts: +54 9 11 1234-5678, 011-1234-5678, 1112345678
 * @param phone - Phone number
 * @returns True if valid format
 */
export function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[\s\-()]/g, "");
  // Allow 8-15 digits, optionally starting with +
  return /^\+?\d{8,15}$/.test(cleanPhone);
}

/**
 * Validate file MIME type
 * @param mimetype - File MIME type
 * @param allowedTypes - Array of allowed MIME types
 * @throws BadRequestError if MIME type not allowed
 */
export function validateMimeType(mimetype: string, allowedTypes: string[]): void {
  if (!allowedTypes.includes(mimetype)) {
    throw new BadRequestError(
      `Invalid file type. Allowed: ${allowedTypes.join(", ")}`,
      "INVALID_FILE_TYPE",
    );
  }
}

/**
 * Validate file size
 * @param size - File size in bytes
 * @param maxSize - Maximum allowed size in bytes
 * @throws BadRequestError if file too large
 */
export function validateFileSize(size: number, maxSize: number): void {
  if (size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    throw new BadRequestError(`File too large. Maximum size: ${maxSizeMB} MB`, "FILE_TOO_LARGE");
  }
}

/**
 * Validate date is in the future
 * @param date - Date to validate
 * @throws BadRequestError if date is in the past
 */
export function validateFutureDate(date: Date | string): void {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  if (dateObj <= now) {
    throw new BadRequestError("Date must be in the future", "INVALID_DATE");
  }
}

/**
 * Validate date range
 * @param startDate - Start date
 * @param endDate - End date
 * @throws BadRequestError if end date is before start date
 */
export function validateDateRange(startDate: Date | string, endDate: Date | string): void {
  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  if (end <= start) {
    throw new BadRequestError("End date must be after start date", "INVALID_DATE_RANGE");
  }
}

/**
 * Validate age requirement (for adoption eligibility)
 * @param birthDate - Birth date
 * @param minAge - Minimum required age
 * @throws BadRequestError if user is underage
 */
export function validateMinimumAge(birthDate: Date | string, minAge: number = 18): void {
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  if (age < minAge) {
    throw new BadRequestError(`You must be at least ${minAge} years old`, "MINIMUM_AGE_NOT_MET");
  }
}

/**
 * Validate UUID format
 * @param uuid - UUID string
 * @returns True if valid UUID v4
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with validation result and messages
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
