/**
 * @file Events Service
 * @description Business logic for events, registrations, and attendance
 */

import { ConflictError, NotFoundError, ValidationError } from "../../common/types/errors";
import * as repository from "./repository";
import type {
  CheckInDTO,
  CreateEventDTO,
  EventRegistrationWithUser,
  EventWithDetails,
  EventWithTranslations,
  RegisterForEventDTO,
  UpdateEventDTO,
  UpdateEventTranslationDTO,
} from "./types";

// ===================
// EVENTS MANAGEMENT
// ===================

/**
 * Create a new event with translations
 */
export async function createEvent(
  creatorId: string,
  data: CreateEventDTO,
): Promise<EventWithTranslations> {
  // Validate event date is in the future
  const eventDate = new Date(data.eventDate);
  if (eventDate <= new Date()) {
    throw new ValidationError("Event date must be in the future", "INVALID_DATE");
  }

  // Validate payment configuration
  if (data.isFree) {
    if (data.acceptsOnlinePayment || data.acceptsOnSitePayment || data.acceptsInKind) {
      throw new ValidationError("Free events cannot accept payments", "INVALID_PAYMENT_CONFIG");
    }
  } else {
    if (!data.acceptsOnlinePayment && !data.acceptsOnSitePayment && !data.acceptsInKind) {
      throw new ValidationError(
        "Paid events must have at least one payment option",
        "INVALID_PAYMENT_CONFIG",
      );
    }
  }

  // Validate virtual link for virtual/hybrid events
  if ((data.modality === "VIRTUAL" || data.modality === "HYBRID") && !data.virtualLink) {
    throw new ValidationError(
      "Virtual link is required for virtual/hybrid events",
      "MISSING_VIRTUAL_LINK",
    );
  }

  // Validate translations
  if (!data.translations || data.translations.length === 0) {
    throw new ValidationError("At least one translation is required", "MISSING_TRANSLATIONS");
  }

  // Create event
  const event = await repository.createEvent({
    creatorId,
    eventDate,
    modality: data.modality,
    virtualLink: data.virtualLink,
    isFree: data.isFree,
    acceptsOnlinePayment: data.acceptsOnlinePayment || false,
    onlinePrice: data.onlinePrice?.toString(),
    acceptsOnSitePayment: data.acceptsOnSitePayment || false,
    onSitePrice: data.onSitePrice?.toString(),
    acceptsInKind: data.acceptsInKind || false,
    inKindDescription: data.inKindDescription,
  });

  // Create translations
  const translations = await repository.createEventTranslations(
    data.translations.map((t) => ({
      eventId: event.eventId,
      language: t.language,
      title: t.title,
      description: t.description,
    })),
  );

  return {
    ...event,
    translations,
  };
}

/**
 * Get all upcoming events
 */
export async function getAllUpcomingEvents(): Promise<EventWithTranslations[]> {
  return await repository.findAllUpcomingEvents();
}

/**
 * Get event by ID with details
 */
export async function getEventById(eventId: string): Promise<EventWithDetails> {
  const event = await repository.findEventById(eventId);
  if (!event) {
    throw new NotFoundError("Event not found");
  }

  const registrationsCount = await repository.getRegistrationsCount(eventId);
  const attendancesCount = await repository.getAttendancesCount(eventId);

  return {
    ...event,
    registrationsCount,
    attendancesCount,
  };
}

/**
 * Update event
 */
export async function updateEvent(
  eventId: string,
  data: UpdateEventDTO,
): Promise<EventWithTranslations> {
  const event = await repository.findEventById(eventId);
  if (!event) {
    throw new NotFoundError("Event not found");
  }

  // Validate event date if provided
  if (data.eventDate) {
    const eventDate = new Date(data.eventDate);
    if (eventDate <= new Date()) {
      throw new ValidationError("Event date must be in the future", "INVALID_DATE");
    }
  }

  // Validate virtual link if modality changes to virtual/hybrid
  if (
    data.modality &&
    (data.modality === "VIRTUAL" || data.modality === "HYBRID") &&
    !data.virtualLink &&
    !event.virtualLink
  ) {
    throw new ValidationError(
      "Virtual link is required for virtual/hybrid events",
      "MISSING_VIRTUAL_LINK",
    );
  }

  const updateData: any = {};
  if (data.eventDate) updateData.eventDate = new Date(data.eventDate);
  if (data.modality) updateData.modality = data.modality;
  if (data.virtualLink !== undefined) updateData.virtualLink = data.virtualLink;
  if (data.isFree !== undefined) updateData.isFree = data.isFree;
  if (data.acceptsOnlinePayment !== undefined)
    updateData.acceptsOnlinePayment = data.acceptsOnlinePayment;
  if (data.onlinePrice !== undefined) updateData.onlinePrice = data.onlinePrice?.toString();
  if (data.acceptsOnSitePayment !== undefined)
    updateData.acceptsOnSitePayment = data.acceptsOnSitePayment;
  if (data.onSitePrice !== undefined) updateData.onSitePrice = data.onSitePrice?.toString();
  if (data.acceptsInKind !== undefined) updateData.acceptsInKind = data.acceptsInKind;
  if (data.inKindDescription !== undefined) updateData.inKindDescription = data.inKindDescription;

  await repository.updateEvent(eventId, updateData);

  return (await repository.findEventById(eventId))!;
}

/**
 * Update event translation
 */
export async function updateEventTranslation(
  eventId: string,
  language: string,
  data: UpdateEventTranslationDTO,
): Promise<void> {
  const event = await repository.findEventById(eventId);
  if (!event) {
    throw new NotFoundError("Event not found");
  }

  const translation = event.translations.find((t) => t.language === language);
  if (!translation) {
    throw new NotFoundError("Translation not found");
  }

  await repository.updateEventTranslation(eventId, language, data);
}

/**
 * Delete event (soft delete)
 */
export async function deleteEvent(eventId: string): Promise<void> {
  const event = await repository.findEventById(eventId);
  if (!event) {
    throw new NotFoundError("Event not found");
  }

  await repository.deleteEvent(eventId);
}

// ===================
// REGISTRATIONS
// ===================

/**
 * Register user for event
 */
export async function registerForEvent(
  userId: string,
  eventId: string,
  data: RegisterForEventDTO,
): Promise<void> {
  // Check if event exists
  const event = await repository.findEventById(eventId);
  if (!event) {
    throw new NotFoundError("Event not found");
  }

  // Check if event date is in the future
  if (event.eventDate <= new Date()) {
    throw new ValidationError("Cannot register for past events", "EVENT_ALREADY_PASSED");
  }

  // Check if already registered
  const existingRegistration = await repository.findRegistrationByUserAndEvent(userId, eventId);
  if (existingRegistration) {
    throw new ConflictError("Already registered for this event");
  }

  // Validate payment option
  const paymentOption = data.selectedPaymentOption;
  if (event.isFree && paymentOption !== "FREE") {
    throw new ValidationError("This event is free, no payment required", "INVALID_PAYMENT_OPTION");
  }

  if (!event.isFree) {
    if (paymentOption === "FREE") {
      throw new ValidationError("This event requires payment", "INVALID_PAYMENT_OPTION");
    }

    if (paymentOption === "ONLINE_PAYMENT" && !event.acceptsOnlinePayment) {
      throw new ValidationError(
        "Online payment not accepted for this event",
        "INVALID_PAYMENT_OPTION",
      );
    }

    if (paymentOption === "ON_SITE_CASH" && !event.acceptsOnSitePayment) {
      throw new ValidationError(
        "On-site payment not accepted for this event",
        "INVALID_PAYMENT_OPTION",
      );
    }

    if (paymentOption === "IN_KIND_DONATION" && !event.acceptsInKind) {
      throw new ValidationError(
        "In-kind payment not accepted for this event",
        "INVALID_PAYMENT_OPTION",
      );
    }
  }

  // Prepare snapshot data
  let agreedPriceSnapshot: string | undefined;
  let agreedInKindSnapshot: string | undefined;

  if (paymentOption === "ONLINE_PAYMENT") {
    agreedPriceSnapshot = event.onlinePrice || undefined;
  } else if (paymentOption === "ON_SITE_CASH") {
    agreedPriceSnapshot = event.onSitePrice || undefined;
  } else if (paymentOption === "IN_KIND_DONATION") {
    agreedInKindSnapshot = event.inKindDescription || undefined;
  }

  // Create registration
  await repository.createEventRegistration({
    userId,
    eventId,
    selectedPaymentOption: paymentOption,
    agreedPriceSnapshot,
    agreedInKindSnapshot,
  });
}

/**
 * Get user's registrations
 */
export async function getMyRegistrations(_userId: string): Promise<EventWithTranslations[]> {
  // This would need a new repository method to join events with registrations
  // For now, return empty array
  return [];
}

/**
 * Get all registrations for an event
 */
export async function getEventRegistrations(eventId: string): Promise<EventRegistrationWithUser[]> {
  const event = await repository.findEventById(eventId);
  if (!event) {
    throw new NotFoundError("Event not found");
  }

  const registrations = await repository.findRegistrationsByEvent(eventId);

  // Would need to join with users table for full details
  return registrations;
}

/**
 * Cancel user's registration
 */
export async function cancelRegistration(userId: string, eventId: string): Promise<void> {
  const registration = await repository.findRegistrationByUserAndEvent(userId, eventId);
  if (!registration) {
    throw new NotFoundError("Registration not found");
  }

  await repository.cancelRegistration(userId, eventId);
}

// ===================
// ATTENDANCE
// ===================

/**
 * Check in user for event
 */
export async function checkInUser(
  eventId: string,
  checkedInBy: string,
  data: CheckInDTO,
): Promise<void> {
  const event = await repository.findEventById(eventId);
  if (!event) {
    throw new NotFoundError("Event not found");
  }

  // Check if user is registered
  const registration = await repository.findRegistrationByUserAndEvent(data.userId, eventId);
  if (!registration) {
    throw new ValidationError("User is not registered for this event", "NOT_REGISTERED");
  }

  // Check if already checked in
  const existingAttendance = await repository.findAttendanceByUserAndEntity(
    data.userId,
    "EVENT",
    eventId,
  );
  if (existingAttendance) {
    throw new ConflictError("User already checked in");
  }

  // Create attendance record
  await repository.createAttendance({
    userId: data.userId,
    checkedInBy,
    entityType: "EVENT",
    entityId: eventId,
    notes: data.notes,
  });
}

/**
 * Get event attendances
 */
export async function getEventAttendances(eventId: string) {
  const event = await repository.findEventById(eventId);
  if (!event) {
    throw new NotFoundError("Event not found");
  }

  return await repository.findAttendancesByEvent(eventId);
}
