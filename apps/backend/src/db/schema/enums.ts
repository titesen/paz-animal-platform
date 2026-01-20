// Drizzle Schema - Enums and Types
import { pgEnum, pgSchema } from "drizzle-orm/pg-core";

// Create schemas
export const authSchema = pgSchema("auth");

// ===================
// ENUM DEFINITIONS
// ===================

// Identity & Attributes
export const documentTypeEnum = pgEnum("document_type", [
  "DNI",
  "PASSPORT",
  "MERCOSUR_ID",
  "TAX_ID",
  "OTHER",
]);

export const petSexEnum = pgEnum("pet_sex", ["MALE", "FEMALE", "UNKNOWN"]);

export const mediaTypeEnum = pgEnum("media_type", [
  "IMAGE",
  "VIDEO",
  "DOCUMENT",
  "AUDIO",
]);

export const languageCodeEnum = pgEnum("language_code", ["es", "en", "pt"]);

// Business Workflows
export const publicationStatusEnum = pgEnum("publication_status", [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
]);

export const petStatusEnum = pgEnum("pet_status", [
  "ADOPTION_AVAILABLE",
  "IN_PROCESS",
  "OWNED",
  "LOST",
  "DECEASED",
]);

export const adoptionStatusEnum = pgEnum("adoption_status", [
  "REQUESTED",
  "UNDER_REVIEW",
  "INTERVIEW_SCHEDULED",
  "REJECTED",
  "APPROVED",
  "PROBATION",
  "COMPLETED",
  "REVOKED",
]);

export const volunteerAppStatusEnum = pgEnum("volunteer_app_status", [
  "PENDING",
  "INTERVIEW_SCHEDULED",
  "APPROVED",
  "REJECTED",
]);

export const interviewModalityEnum = pgEnum("interview_modality", [
  "IN_PERSON",
  "VIRTUAL",
  "PHONE",
]);

export const interviewResultEnum = pgEnum("interview_result", [
  "PENDING",
  "POSITIVE",
  "NEGATIVE",
  "ABSENT",
  "RESCHEDULED",
]);

export const reportReasonEnum = pgEnum("report_reason", [
  "SPAM",
  "OFFENSIVE",
  "FALSE_INFORMATION",
  "OTHER",
]);

// Moderation Status
export const moderationStatusEnum = pgEnum("moderation_status", [
  "PUBLISHED",
  "FLAGGED",
  "HIDDEN_BY_SYSTEM",
  "REMOVED_BY_ADMIN",
  "APPROVED_BY_ADMIN",
]);

// Finance & Events
export const transactionStatusEnum = pgEnum("transaction_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "REFUNDED",
  "PROCESSING",
]);

export const paymentProviderEnum = pgEnum("payment_provider", [
  "MERCADOPAGO",
  "STRIPE",
  "PAYPAL",
  "BANK_TRANSFER",
  "CASH_REGISTER",
]);

export const paymentMethodTypeEnum = pgEnum("payment_method_type", [
  "CREDIT_CARD",
  "DEBIT_CARD",
  "ACCOUNT_MONEY",
  "CASH_TICKET",
  "TRANSFER",
  "OTHER",
]);

export const eventModalityEnum = pgEnum("event_modality", [
  "IN_PERSON",
  "VIRTUAL",
  "HYBRID",
]);

export const eventPaymentOptionEnum = pgEnum("event_payment_option", [
  "FREE",
  "ONLINE_PAYMENT",
  "ON_SITE_CASH",
  "IN_KIND_DONATION",
]);

export const registrationPaymentStatusEnum = pgEnum(
  "registration_payment_status",
  ["NA", "PENDING", "PAID", "VERIFIED_ON_SITE"],
);

export const physicalContributionTypeEnum = pgEnum(
  "physical_contribution_type",
  ["CASH_ON_SITE", "MATERIAL_SUPPLY", "FOOD_SUPPLY"],
);

// Communications
export const notificationTypeEnum = pgEnum("notification_type", [
  "EMAIL",
  "SYSTEM",
]);

export const notificationStatusEnum = pgEnum("notification_status", [
  "PENDING",
  "SENT",
  "FAILED",
]);

// UI Management
export const uiComponentTypeEnum = pgEnum("ui_component_type", [
  "TEXT",
  "RICH_TEXT",
  "IMAGE_URL",
  "CAROUSEL_LIST",
  "CONFIG",
  "LINK",
]);

export const uiSectionEnum = pgEnum("ui_section", [
  "GLOBAL",
  "HOME",
  "FOOTER",
  "NAVBAR",
  "ADOPTIONS",
  "VOLUNTEERS",
  "DONATIONS",
  "CONTACT",
  "ABOUT_US",
]);
