/**
 * @file Events Module - Data Transfer Objects (DTOs)
 * @description Input DTOs for event management operations
 */

import type { EventModality, EventPaymentOption, RegistrationPaymentStatus } from "./events.types";

// ===================
// EVENTS DTOs
// ===================

export interface CreateEventDTO {
  eventDate: string; // ISO 8601
  modality: EventModality;
  virtualLink?: string;
  isFree: boolean;
  acceptsOnlinePayment?: boolean;
  onlinePrice?: number;
  acceptsOnSitePayment?: boolean;
  onSitePrice?: number;
  acceptsInKind?: boolean;
  inKindDescription?: string;
  translations: {
    language: string;
    title: string;
    description?: string;
  }[];
}

export interface UpdateEventDTO {
  eventDate?: string;
  modality?: EventModality;
  virtualLink?: string;
  isFree?: boolean;
  acceptsOnlinePayment?: boolean;
  onlinePrice?: number;
  acceptsOnSitePayment?: boolean;
  onSitePrice?: number;
  acceptsInKind?: boolean;
  inKindDescription?: string;
}

export interface UpdateEventTranslationDTO {
  title?: string;
  description?: string;
}

export interface RegisterForEventDTO {
  selectedPaymentOption: EventPaymentOption;
}

export interface UpdateRegistrationStatusDTO {
  paymentStatus: RegistrationPaymentStatus;
}

export interface CheckInDTO {
  userId: string;
  notes?: string;
}
