/**
 * @file Events Repository Interface
 * @description Contract for the events data access layer
 */

import type {
  Attendance,
  Event,
  EventPaymentOption,
  EventRegistration,
  EventTranslation,
  RegistrationPaymentStatus,
} from "./events.types";

export interface IEventsRepository {
  // Events CRUD
  createEvent(data: {
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
  }): Promise<Event>;
  createEventTranslations(
    translations: {
      eventId: string;
      language: string;
      title: string;
      description?: string;
    }[],
  ): Promise<EventTranslation[]>;
  findEventById(eventId: string): Promise<(Event & { translations: EventTranslation[] }) | null>;
  findAllUpcomingEvents(): Promise<(Event & { translations: EventTranslation[] })[]>;
  updateEvent(eventId: string, data: Partial<Event>): Promise<Event | null>;
  updateEventTranslation(
    eventId: string,
    language: string,
    data: { title?: string; description?: string },
  ): Promise<EventTranslation | null>;
  deleteEvent(eventId: string): Promise<void>;

  // Registrations
  createEventRegistration(data: {
    userId: string;
    eventId: string;
    selectedPaymentOption: EventPaymentOption;
    agreedPriceSnapshot?: string;
    agreedInKindSnapshot?: string;
  }): Promise<EventRegistration>;
  findRegistrationByUserAndEvent(
    userId: string,
    eventId: string,
  ): Promise<EventRegistration | null>;
  findRegistrationsByEvent(eventId: string): Promise<EventRegistration[]>;
  getRegistrationsCount(eventId: string): Promise<number>;
  updateRegistrationStatus(
    userId: string,
    eventId: string,
    paymentStatus: RegistrationPaymentStatus,
  ): Promise<EventRegistration | null>;
  cancelRegistration(userId: string, eventId: string): Promise<void>;

  // Attendance
  createAttendance(data: {
    userId: string;
    checkedInBy: string;
    entityType: string;
    entityId: string;
    notes?: string;
  }): Promise<Attendance>;
  findAttendanceByUserAndEntity(
    userId: string,
    entityType: string,
    entityId: string,
  ): Promise<Attendance | null>;
  findAttendancesByEvent(eventId: string): Promise<Attendance[]>;
  getAttendancesCount(eventId: string): Promise<number>;
}
