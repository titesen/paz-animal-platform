/**
 * @file Events Repository
 * @description Data access layer for events, registrations, and attendance
 */

import { eq, and, gte, isNull, sql } from "drizzle-orm";
import { db } from "../../db";
import * as schema from "../../db/schema";
import type {
  Event,
  EventTranslation,
  EventRegistration,
  Attendance,
  EventPaymentOption,
  RegistrationPaymentStatus,
} from "./types";

// ===================
// EVENTS CRUD
// ===================

/**
 * Create a new event
 */
export async function createEvent(data: {
  creatorId: string;
  eventDate: Date;
  modality: "VIRTUAL" | "IN_PERSON" | "HYBRID";
  virtualLink?: string;
  isFree: boolean;
  acceptsOnlinePayment?: boolean;
  onlinePrice?: string;
  acceptsOnSitePayment?: boolean;
  onSitePrice?: string;
  acceptsInKind?: boolean;
  inKindDescription?: string;
}): Promise<Event> {
  const [event] = await db
    .insert(schema.events)
    .values(data)
    .returning();

  return event;
}

/**
 * Create event translations
 */
export async function createEventTranslations(
  translations: {
    eventId: string;
    language: string;
    title: string;
    description?: string;
  }[],
): Promise<EventTranslation[]> {
  if (translations.length === 0) return [];

  return await db
    .insert(schema.eventsTranslations)
    .values(translations.map(t => ({
      ...t,
      language: t.language as "es" | "en" | "pt",
    })))
    .returning();
}

/**
 * Find event by ID with translations
 */
export async function findEventById(
  eventId: string,
): Promise<(Event & { translations: EventTranslation[] }) | null> {
  const event = await db
    .select()
    .from(schema.events)
    .where(
      and(
        eq(schema.events.eventId, eventId),
        isNull(schema.events.deletedAt),
      ),
    )
    .limit(1);

  if (!event[0]) return null;

  const translations = await db
    .select()
    .from(schema.eventsTranslations)
    .where(eq(schema.eventsTranslations.eventId, eventId));

  return {
    ...event[0],
    translations,
  };
}

/**
 * Find all upcoming events (not deleted, eventDate >= now)
 */
export async function findAllUpcomingEvents(): Promise<
  (Event & { translations: EventTranslation[] })[]
> {
  const events = await db
    .select()
    .from(schema.events)
    .where(
      and(
        isNull(schema.events.deletedAt),
        gte(schema.events.eventDate, new Date()),
      ),
    )
    .orderBy(schema.events.eventDate);

  const eventIds = events.map((e) => e.eventId);
  if (eventIds.length === 0) return [];

  const translations = await db
    .select()
    .from(schema.eventsTranslations)
    .where(sql`${schema.eventsTranslations.eventId} = ANY(${eventIds})`);

  return events.map((event) => ({
    ...event,
    translations: translations.filter((t) => t.eventId === event.eventId),
  }));
}

/**
 * Update event
 */
export async function updateEvent(
  eventId: string,
  data: Partial<Event>,
): Promise<Event | null> {
  const [updated] = await db
    .update(schema.events)
    .set(data)
    .where(eq(schema.events.eventId, eventId))
    .returning();

  return updated || null;
}

/**
 * Update event translation
 */
export async function updateEventTranslation(
  eventId: string,
  language: string,
  data: { title?: string; description?: string },
): Promise<EventTranslation | null> {
  const [updated] = await db
    .update(schema.eventsTranslations)
    .set(data)
    .where(
      and(
        eq(schema.eventsTranslations.eventId, eventId),
        eq(schema.eventsTranslations.language, language as "es" | "en" | "pt"),
      ),
    )
    .returning();

  return updated || null;
}

/**
 * Soft delete event
 */
export async function deleteEvent(eventId: string): Promise<void> {
  await db
    .update(schema.events)
    .set({ deletedAt: new Date() })
    .where(eq(schema.events.eventId, eventId));
}

// ===================
// REGISTRATIONS
// ===================

/**
 * Register user for event
 */
export async function createEventRegistration(data: {
  userId: string;
  eventId: string;
  selectedPaymentOption: EventPaymentOption;
  agreedPriceSnapshot?: string;
  agreedInKindSnapshot?: string;
}): Promise<EventRegistration> {
  const [registration] = await db
    .insert(schema.eventRegistrations)
    .values(data)
    .returning();

  return registration;
}

/**
 * Find registration by user and event
 */
export async function findRegistrationByUserAndEvent(
  userId: string,
  eventId: string,
): Promise<EventRegistration | null> {
  const [registration] = await db
    .select()
    .from(schema.eventRegistrations)
    .where(
      and(
        eq(schema.eventRegistrations.userId, userId),
        eq(schema.eventRegistrations.eventId, eventId),
      ),
    )
    .limit(1);

  return registration || null;
}

/**
 * Get all registrations for an event
 */
export async function findRegistrationsByEvent(
  eventId: string,
): Promise<EventRegistration[]> {
  return await db
    .select()
    .from(schema.eventRegistrations)
    .where(eq(schema.eventRegistrations.eventId, eventId))
    .orderBy(schema.eventRegistrations.registeredAt);
}

/**
 * Get registrations count for an event
 */
export async function getRegistrationsCount(
  eventId: string,
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.eventRegistrations)
    .where(eq(schema.eventRegistrations.eventId, eventId));

  return result[0]?.count || 0;
}

/**
 * Update registration payment status
 */
export async function updateRegistrationStatus(
  userId: string,
  eventId: string,
  paymentStatus: RegistrationPaymentStatus,
): Promise<EventRegistration | null> {
  const [updated] = await db
    .update(schema.eventRegistrations)
    .set({ paymentStatus })
    .where(
      and(
        eq(schema.eventRegistrations.userId, userId),
        eq(schema.eventRegistrations.eventId, eventId),
      ),
    )
    .returning();

  return updated || null;
}

/**
 * Cancel registration
 */
export async function cancelRegistration(
  userId: string,
  eventId: string,
): Promise<void> {
  await db
    .delete(schema.eventRegistrations)
    .where(
      and(
        eq(schema.eventRegistrations.userId, userId),
        eq(schema.eventRegistrations.eventId, eventId),
      ),
    );
}

// ===================
// ATTENDANCE
// ===================

/**
 * Check in user for event
 */
export async function createAttendance(data: {
  userId: string;
  checkedInBy: string;
  entityType: string;
  entityId: string;
  notes?: string;
}): Promise<Attendance> {
  const [attendance] = await db
    .insert(schema.attendances)
    .values(data)
    .returning();

  return attendance;
}

/**
 * Find attendance by user and entity
 */
export async function findAttendanceByUserAndEntity(
  userId: string,
  entityType: string,
  entityId: string,
): Promise<Attendance | null> {
  const [attendance] = await db
    .select()
    .from(schema.attendances)
    .where(
      and(
        eq(schema.attendances.userId, userId),
        eq(schema.attendances.entityType, entityType),
        eq(schema.attendances.entityId, entityId),
      ),
    )
    .limit(1);

  return attendance || null;
}

/**
 * Get all attendances for an event
 */
export async function findAttendancesByEvent(
  eventId: string,
): Promise<Attendance[]> {
  return await db
    .select()
    .from(schema.attendances)
    .where(
      and(
        eq(schema.attendances.entityType, "EVENT"),
        eq(schema.attendances.entityId, eventId),
      ),
    )
    .orderBy(schema.attendances.checkInTime);
}

/**
 * Get attendances count for an event
 */
export async function getAttendancesCount(eventId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.attendances)
    .where(
      and(
        eq(schema.attendances.entityType, "EVENT"),
        eq(schema.attendances.entityId, eventId),
      ),
    );

  return result[0]?.count || 0;
}
