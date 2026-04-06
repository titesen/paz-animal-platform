/**
 * @file Events Module - Domain Types
 * @description Entity interfaces, type aliases, and constants for events management
 */

export type EventModality = "VIRTUAL" | "IN_PERSON" | "HYBRID";
export type EventPaymentOption = "FREE" | "ONLINE_PAYMENT" | "ON_SITE_CASH" | "IN_KIND_DONATION";
export type RegistrationPaymentStatus = "NA" | "PENDING" | "PAID" | "VERIFIED_ON_SITE";

// ===================
// EVENTS ENTITIES
// ===================

export interface Event {
  eventId: string;
  creatorId: string;
  eventDate: Date;
  virtualLink: string | null;
  modality: EventModality;
  isFree: boolean;
  acceptsOnlinePayment: boolean;
  onlinePrice: string | null;
  acceptsOnSitePayment: boolean;
  onSitePrice: string | null;
  acceptsInKind: boolean;
  inKindDescription: string | null;
  deletedAt: Date | null;
}

export interface EventTranslation {
  eventId: string;
  language: string;
  title: string;
  description: string | null;
}

export interface EventRegistration {
  userId: string;
  eventId: string;
  registeredAt: Date | null;
  selectedPaymentOption: EventPaymentOption;
  paymentStatus: RegistrationPaymentStatus;
  agreedPriceSnapshot: string | null;
  agreedInKindSnapshot: string | null;
}

export interface Attendance {
  attendanceId: string;
  userId: string;
  checkedInBy: string | null;
  entityType: string;
  entityId: string;
  checkInTime: Date;
  notes: string | null;
}

// ===================
// RESPONSE TYPES
// ===================

export interface EventWithTranslations extends Event {
  translations: EventTranslation[];
}

export interface EventRegistrationWithUser extends EventRegistration {
  user?: {
    userId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export interface EventWithDetails extends EventWithTranslations {
  registrationsCount: number;
  attendancesCount: number;
  creator?: {
    userId: string;
    email: string;
  };
}

// ===================
// CONSTANTS
// ===================

export const EVENT_MODALITY_VALUES: EventModality[] = ["VIRTUAL", "IN_PERSON", "HYBRID"];

export const PAYMENT_OPTION_VALUES: EventPaymentOption[] = [
  "FREE",
  "ONLINE_PAYMENT",
  "ON_SITE_CASH",
  "IN_KIND_DONATION",
];

export const PAYMENT_STATUS_VALUES: RegistrationPaymentStatus[] = [
  "NA",
  "PENDING",
  "PAID",
  "VERIFIED_ON_SITE",
];
