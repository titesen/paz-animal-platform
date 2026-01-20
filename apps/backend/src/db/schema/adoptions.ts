// Adoptions Module Tables
import { sql } from "drizzle-orm";
import {
  check,
  date,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { adoptionStatusEnum } from "./enums";
import { pets } from "./pets";

// ===================
// ADOPTIONS TABLES
// ===================

export const adoptionApplications = pgTable(
  "adoption_applications",
  {
    applicationId: uuid("application_id").defaultRandom().primaryKey(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    petId: uuid("pet_id")
      .notNull()
      .references(() => pets.petId, { onDelete: "cascade" }),
    status: adoptionStatusEnum("status").notNull().default("REQUESTED"),

    spaceDescription: text("space_description").notNull(),
    incomeDescription: text("income_description").notNull(),
    otherPetsDescription: text("other_pets_description").notNull(),
    motivation: text("motivation").notNull(),
    evidenceUrls: jsonb("evidence_urls"),
    adminNotes: text("admin_notes"),
    appliedAt: timestamp("applied_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
  },
  (table) => ({
    // Partial unique index: only one active adoption per client
    activeAdoptionIdx: uniqueIndex("uq_adoption_active")
      .on(table.clientId, table.status)
      .where(
        sql`${table.status} IN ('REQUESTED', 'UNDER_REVIEW', 'INTERVIEW_SCHEDULED', 'APPROVED', 'PROBATION')`,
      ),
  }),
);

export const adoptionFollowups = pgTable(
  "adoption_followups",
  {
    followupId: uuid("followup_id").defaultRandom().primaryKey(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => adoptionApplications.applicationId, {
        onDelete: "cascade",
      }),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => users.userId),
    scheduledDate: date("scheduled_date").notNull(),
    performedAt: timestamp("performed_at", { withTimezone: true }).defaultNow(),
    notes: text("notes").notNull(),
    monthNumber: smallint("month_number").notNull(),
  },
  (table) => ({
    monthCheck: check(
      "chk_followups_month",
      sql`${table.monthNumber} BETWEEN 1 AND 6`,
    ),
    uniqueMonth: unique("uq_followups_month").on(
      table.applicationId,
      table.monthNumber,
    ),
  }),
);
