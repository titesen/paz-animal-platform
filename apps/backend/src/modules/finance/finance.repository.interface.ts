/**
 * @file Finance Repository Interface
 * @description Contract for the finance data access layer
 */

import type {
  InKindDonation,
  MonetaryDonation,
  PaymentMethodType,
  PaymentProvider,
  Transaction,
  TransactionStatus,
} from "./finance.types";

export interface IFinanceRepository {
  // Transactions
  createTransaction(data: {
    userId?: string;
    amountTotal: string;
    currency: string;
    provider: PaymentProvider;
    externalTransactionId?: string;
    externalReferenceId?: string;
    method?: PaymentMethodType;
    methodDetail?: string;
    status: TransactionStatus;
    originType: string;
    originId: string;
  }): Promise<Transaction>;
  findTransactionById(transactionId: string): Promise<Transaction | null>;
  findTransactionByExternalId(externalId: string): Promise<Transaction | null>;
  updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
  ): Promise<Transaction | null>;
  findTransactionsByUser(userId: string): Promise<Transaction[]>;
  getFinancialSummary(currency?: string): Promise<{
    totalDonations: number;
    totalAmount: string;
    pendingAmount: string;
    approvedAmount: string;
  }>;

  // Monetary Donations
  createMonetaryDonation(data: {
    userId?: string;
    targetAmount: string;
    currency: string;
    isAnonymous?: boolean;
    thankYouMessage?: string;
  }): Promise<MonetaryDonation>;
  findDonationById(donationId: string): Promise<MonetaryDonation | null>;
  confirmDonation(donationId: string): Promise<MonetaryDonation | null>;
  findDonationsByUser(userId: string): Promise<MonetaryDonation[]>;
  findAllConfirmedDonations(limit?: number): Promise<MonetaryDonation[]>;

  // In-Kind Donations
  createInKindDonation(data: {
    userId?: string;
    manualDonorName?: string;
    manualDonorContact?: string;
    description: string;
    estimatedValue?: string;
    receivedById: string;
  }): Promise<InKindDonation>;
  findInKindDonationById(donationId: string): Promise<InKindDonation | null>;
  findAllInKindDonations(): Promise<InKindDonation[]>;
}
