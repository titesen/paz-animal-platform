/**
 * @file QR Code Generator
 * @description Generate QR codes for pet identification and event tickets
 */

import QRCode from "qrcode";

/**
 * Generate a QR code as a data URL (base64)
 * @param data - Data to encode in QR code (typically a URL)
 * @param options - QR code generation options
 * @returns Data URL string (e.g., "data:image/png;base64,...")
 */
export async function generateQRCode(
  data: string,
  options?: {
    width?: number;
    margin?: number;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  },
): Promise<string> {
  const defaultOptions = {
    width: 300,
    margin: 2,
    errorCorrectionLevel: "M" as const,
  };

  return QRCode.toDataURL(data, { ...defaultOptions, ...options });
}

/**
 * Generate a QR code as a buffer
 * @param data - Data to encode in QR code
 * @returns PNG buffer
 */
export async function generateQRCodeBuffer(data: string): Promise<Buffer> {
  return QRCode.toBuffer(data, {
    type: "png",
    width: 300,
    margin: 2,
  });
}

/**
 * Generate a public QR code URL for a pet
 * @param petId - Pet UUID
 * @param baseUrl - Base URL of the frontend application
 * @returns QR code data URL
 */
export async function generatePetQRCode(
  petId: string,
  baseUrl: string,
): Promise<string> {
  const petUrl = `${baseUrl}/pets/${petId}`;
  return generateQRCode(petUrl, { errorCorrectionLevel: "H" }); // High error correction for physical tags
}

/**
 * Generate a QR code for event registration
 * @param registrationId - Event registration UUID
 * @param baseUrl - Base URL of the frontend application
 * @returns QR code data URL
 */
export async function generateEventQRCode(
  registrationId: string,
  baseUrl: string,
): Promise<string> {
  const checkInUrl = `${baseUrl}/events/check-in/${registrationId}`;
  return generateQRCode(checkInUrl);
}
