/**
 * @file Finance Service
 * @description Business logic for donations, transactions, and Mercado Pago integration
 */

import { logger } from "../../config/logger";
import * as mercadopago from "../../lib/mercadopago";
import { NotFoundError, ValidationError } from "../../common/types/errors";
import * as repository from "./finance.repository";
import type {
  CreateInKindDonationDTO,
  CreateMonetaryDonationDTO,
  DonationWithTransaction,
  FinancialSummary,
  MercadoPagoWebhookPayload,
} from "./finance.types";

// ===================
// MONETARY DONATIONS
// ===================

/**
 * Create a monetary donation and generate Mercado Pago preference
 */
export async function createMonetaryDonation(
  userId: string | undefined,
  data: CreateMonetaryDonationDTO,
): Promise<{
  donation: DonationWithTransaction;
  paymentUrl: string;
}> {
  // Validate amount
  if (data.amount <= 0) {
    throw new ValidationError("Donation amount must be greater than zero", "INVALID_AMOUNT");
  }

  const currency = data.currency || "ARS";

  // Create donation record
  const donation = await repository.createMonetaryDonation({
    userId,
    targetAmount: data.amount.toString(),
    currency,
    isAnonymous: data.isAnonymous || false,
    thankYouMessage: data.thankYouMessage,
  });

  // Create pending transaction
  const transaction = await repository.createTransaction({
    userId,
    amountTotal: data.amount.toString(),
    currency,
    provider: "MERCADOPAGO",
    externalReferenceId: donation.donationId,
    status: "PENDING",
    originType: "DONATION",
    originId: donation.donationId,
  });

  // Create Mercado Pago preference
  const preference = await mercadopago.createPaymentPreference({
    title: "Donación - Fundación Paz Animal",
    description: data.thankYouMessage || "Donación para ayudar a los animales",
    amount: data.amount,
    currency,
    externalReference: donation.donationId,
    payerEmail: userId ? undefined : undefined, // Would need to fetch user email
  });

  logger.info(
    {
      donationId: donation.donationId,
      preferenceId: preference.id,
      amount: data.amount,
    },
    "Mercado Pago preference created",
  );

  return {
    donation: {
      ...donation,
      transaction,
    },
    paymentUrl: preference.init_point,
  };
}

/**
 * Process Mercado Pago webhook notification
 */
export async function processMercadoPagoWebhook(payload: MercadoPagoWebhookPayload): Promise<void> {
  // Only process payment notifications
  if (payload.type !== "payment") {
    logger.info({ type: payload.type }, "Ignoring non-payment webhook");
    return;
  }

  const paymentId = payload.data.id;

  // Check if we already processed this payment
  const existingTransaction = await repository.findTransactionByExternalId(paymentId);
  if (existingTransaction && existingTransaction.status !== "PENDING") {
    logger.info({ paymentId }, "Payment already processed");
    return;
  }

  // Fetch payment details from Mercado Pago
  const paymentData = await mercadopago.getPaymentData(paymentId);

  logger.info(
    {
      paymentId,
      status: paymentData.status,
      amount: paymentData.transaction_amount,
    },
    "Processing Mercado Pago payment",
  );

  // Find the donation by external reference
  const donationId = paymentData.external_reference;
  if (!donationId) {
    logger.error({ paymentId }, "Payment without external reference");
    throw new ValidationError("Payment without donation reference", "MISSING_REFERENCE");
  }

  const donation = await repository.findDonationById(donationId);
  if (!donation) {
    logger.error({ donationId }, "Donation not found");
    throw new NotFoundError("Donation not found");
  }

  // Update or create transaction
  let transaction = existingTransaction;
  if (!transaction) {
    // Create transaction if webhook arrived before redirect
    transaction = await repository.createTransaction({
      amountTotal: paymentData.transaction_amount.toString(),
      currency: paymentData.currency_id,
      provider: "MERCADOPAGO",
      externalTransactionId: paymentId.toString(),
      externalReferenceId: donationId,
      method: mapPaymentMethod(paymentData.payment_type_id),
      methodDetail: paymentData.payment_method_id,
      status: mapPaymentStatus(paymentData.status),
      originType: "DONATION",
      originId: donationId,
    });
  } else {
    // Update existing transaction
    transaction = (await repository.updateTransactionStatus(
      transaction.transactionId,
      mapPaymentStatus(paymentData.status),
    ))!;
  }

  // If payment is approved, confirm the donation
  if (paymentData.status === "approved") {
    await repository.confirmDonation(donationId);

    logger.info(
      {
        donationId,
        transactionId: transaction.transactionId,
        amount: paymentData.transaction_amount,
      },
      "Donation confirmed",
    );

    // TODO: Send thank you email
  }
}

/**
 * Map Mercado Pago payment status to our transaction status
 */
function mapPaymentStatus(mpStatus: string): "PENDING" | "APPROVED" | "REJECTED" {
  switch (mpStatus) {
    case "approved":
      return "APPROVED";
    case "rejected":
    case "cancelled":
      return "REJECTED";
    default:
      return "PENDING";
  }
}

/**
 * Map Mercado Pago payment type to our payment method
 */
function mapPaymentMethod(
  paymentType: string,
): "CREDIT_CARD" | "DEBIT_CARD" | "TRANSFER" | "OTHER" {
  switch (paymentType) {
    case "credit_card":
      return "CREDIT_CARD";
    case "debit_card":
      return "DEBIT_CARD";
    case "bank_transfer":
      return "TRANSFER";
    default:
      return "OTHER";
  }
}

/**
 * Get user's donation history
 */
export async function getUserDonations(userId: string): Promise<DonationWithTransaction[]> {
  const donations = await repository.findDonationsByUser(userId);
  const transactions = await repository.findTransactionsByUser(userId);

  // Match donations with their transactions
  return donations.map((donation) => ({
    ...donation,
    transaction: transactions.find(
      (t) => t.originId === donation.donationId && t.originType === "DONATION",
    ),
  }));
}

/**
 * Get all confirmed donations (public view)
 */
export async function getAllConfirmedDonations() {
  return await repository.findAllConfirmedDonations();
}

/**
 * Get financial summary (ADMIN only)
 */
export async function getFinancialSummary(): Promise<FinancialSummary> {
  const summary = await repository.getFinancialSummary();

  return {
    ...summary,
    currency: "ARS",
  };
}

// ===================
// IN-KIND DONATIONS
// ===================

/**
 * Register an in-kind donation (ADMIN/VOLUNTEER only)
 */
export async function createInKindDonation(
  receivedById: string,
  data: CreateInKindDonationDTO,
): Promise<void> {
  // Validate that either userId or manual donor info is provided
  if (!data.manualDonorName) {
    throw new ValidationError("Donor information is required", "MISSING_DONOR_INFO");
  }

  await repository.createInKindDonation({
    manualDonorName: data.manualDonorName,
    manualDonorContact: data.manualDonorContact,
    description: data.description,
    estimatedValue: data.estimatedValue?.toString() || "0",
    receivedById,
  });
}

/**
 * Get all in-kind donations (ADMIN only)
 */
export async function getAllInKindDonations() {
  return await repository.findAllInKindDonations();
}
