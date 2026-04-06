/**
 * @file Utilities Barrel Export
 * @description Central export point for all utility functions
 */

export { asyncHandler } from "./asyncHandler";
export { comparePassword, generateSecureToken, hashPassword } from "./password.util";
export {
  calculateTotalPages,
  formatCurrency,
  formatDate,
  formatFileSize,
  generateUniqueFilename,
  parsePagination,
  sanitizeFilename,
  truncateText,
} from "./formatter";
export {
  decodeToken,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "./jwt.util";
export {
  generateEventQRCode,
  generatePetQRCode,
  generateQRCode,
  generateQRCodeBuffer,
} from "./qrcode";
export {
  isValidCUIT,
  isValidEmail,
  isValidPhone,
  isValidUUID,
  validateDateRange,
  validateFileSize,
  validateFutureDate,
  validateMimeType,
  validateMinimumAge,
  validatePasswordStrength,
} from "./validator";
