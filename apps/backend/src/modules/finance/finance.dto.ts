/**
 * @file Finance Module - Data Transfer Objects (DTOs)
 * @description Input DTOs for financial and donation operations
 */

export interface CreateMonetaryDonationDTO {
  amount: number;
  currency?: string;
  isAnonymous?: boolean;
  thankYouMessage?: string;
}

export interface CreateInKindDonationDTO {
  description: string;
  estimatedValue?: number;
  manualDonorName?: string;
  manualDonorContact?: string;
}
