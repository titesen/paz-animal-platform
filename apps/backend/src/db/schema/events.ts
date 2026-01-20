// Events Module Tables
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import {
  eventModalityEnum,
  eventPaymentOptionEnum,
  languageCodeEnum,
  registrationPaymentStatusEnum,
} from "./enums";

// ===================
// EVENTS TABLES
// ===================

export const events = pgTable(
  "events",
  {
    eventId: uuid("event_id").defaultRandom().primaryKey(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => users.userId, { onDelete: "set null" }),
    eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
    virtualLink: varchar("virtual_link", { length: 255 }),
    modality: eventModalityEnum("modality").notNull().default("IN_PERSON"),

    isFree: boolean("is_free").notNull().default(true),
    acceptsOnlinePayment: boolean("accepts_online_payment")
      .notNull()
      .default(false),
    onlinePrice: numeric("online_price", { precision: 12, scale: 2 }),
    acceptsOnSitePayment: boolean("accepts_on_site_payment")
      .notNull()
      .default(false),
    onSitePrice: numeric("on_site_price", { precision: 12, scale: 2 }),
    acceptsInKind: boolean("accepts_in_kind").notNull().default(false),
    inKindDescription: text("in_kind_description"),

    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    configCheck: check(
      "chk_event_config",
      sql`(
        (${table.isFree} = true AND ${table.acceptsOnlinePayment} = false AND ${table.acceptsOnSitePayment} = false AND ${table.acceptsInKind} = false) OR
        (${table.isFree} = false AND (${table.acceptsOnlinePayment} = true OR ${table.acceptsOnSitePayment} = true OR ${table.acceptsInKind} = true))
      )`,
    ),
    futureCheck: check("chk_event_future", sql`${table.eventDate} > NOW()`),
  }),
);

export const eventsTranslations = pgTable(
  "events_translations",
  {
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.eventId, { onDelete: "cascade" }),
    language: languageCodeEnum("language").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
  },
  (table) => ({
    pk: {
      name: "pk_events_translations",
      columns: [table.eventId, table.language],
    },
  }),
);

export const eventRegistrations = pgTable(
  "event_registrations",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.eventId, { onDelete: "cascade" }),
    registeredAt: timestamp("registered_at", {
      withTimezone: true,
    }).defaultNow(),
    selectedPaymentOption: eventPaymentOptionEnum(
      "selected_payment_option",
    ).notNull(),
    paymentStatus: registrationPaymentStatusEnum("payment_status")
      .notNull()
      .default("PENDING"),
    agreedPriceSnapshot: numeric("agreed_price_snapshot", {
      precision: 12,
      scale: 2,
    }),
    agreedInKindSnapshot: text("agreed_in_kind_snapshot"),
  },
  (table) => ({
    pk: {
      name: "pk_event_registrations",
      columns: [table.userId, table.eventId],
    },
  }),
);

export const attendances = pgTable(
  "attendances",
  {
    attendanceId: uuid("attendance_id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    checkedInBy: uuid("checked_in_by").references(() => users.userId),

    // Polymorphic relationship
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: uuid("entity_id").notNull(),

    checkInTime: timestamp("check_in_time", { withTimezone: true })
      .notNull()
      .defaultNow(),
    notes: text("notes"),
  },
  (table) => ({
    uniqueAttendance: unique("uq_attendance_unique").on(
      table.userId,
      table.entityType,
      table.entityId,
    ),
  }),
);
