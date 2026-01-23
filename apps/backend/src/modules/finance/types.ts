/**
 * @file Finance Module Types
 * @description Type definitions and DTOs for financial transactions and donations
 */

export type TransactionStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "REFUNDED"
  | "PROCESSING";
export type PaymentProvider =
  | "MERCADOPAGO"
  | "STRIPE"
  | "PAYPAL"
  | "BANK_TRANSFER"
  | "CASH_REGISTER";
export type PaymentMethodType =
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "ACCOUNT_MONEY"
  | "CASH_TICKET"
  | "TRANSFER"
  | "OTHER";

// Database entity types
export interface Transaction {
  transactionId: string;
  userId: string | null;
  amountTotal: string;
  currency: string;
  provider: PaymentProvider;
  externalTransactionId: string | null;
  externalReferenceId: string | null;
  method: PaymentMethodType | null;
  methodDetail: string | null;
  status: TransactionStatus;
  createdAt: Date;
  processedAt: Date | null;
  originType: string;
  originId: string;
}

export interface MonetaryDonation {
  donationId: string;
  userId: string | null;
  targetAmount: string;
  currency: string;
  thankYouMessage: string | null;
  isAnonymous: boolean | null;
  isConfirmed: boolean | null;
  createdAt: Date;
}

export interface InKindDonation {
  donationId: string;
  userId: string | null;
  manualDonorName: string | null;
  manualDonorContact: string | null;
  description: string;
  estimatedValue: string | null;
  receivedById: string;
  receivedAt: Date;
}

// DTOs for creating donations
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

// Mercado Pago types
export interface MercadoPagoPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export interface MercadoPagoWebhookPayload {
  id: number;
  live_mode: boolean;
  type: string;
  date_created: string;
  user_id: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

export interface MercadoPagoPaymentData {
  id: number;
  status: string;
  status_detail: string;
  transaction_amount: number;
  currency_id: string;
  date_approved: string | null;
  external_reference: string | null;
  payment_method_id: string;
  payment_type_id: string;
  payer: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
}

// Response types
export interface DonationWithTransaction extends MonetaryDonation {
  transaction?: Transaction;
}

export interface FinancialSummary {
  totalDonations: number;
  totalAmount: string;
  pendingAmount: string;
  approvedAmount: string;
  currency: string;
}

// Validation constants
export const TRANSACTION_STATUS_VALUES: TransactionStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "REFUNDED",
];

export const PAYMENT_PROVIDER_VALUES: PaymentProvider[] = [
  "MERCADOPAGO",
  "STRIPE",
  "PAYPAL",
  "BANK_TRANSFER",
  "CASH_REGISTER",
];

export const PAYMENT_METHOD_VALUES: PaymentMethodType[] = [
  "CREDIT_CARD",
  "DEBIT_CARD",
  "ACCOUNT_MONEY",
  "CASH_TICKET",
  "TRANSFER",
  "OTHER",
];
