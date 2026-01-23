// Volunteers Module Tables
import {
  boolean,
  date,
  index,
  jsonb,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import {
  interviewModalityEnum,
  interviewResultEnum,
  volunteerAppStatusEnum,
} from "./enums";

// ===================
// VOLUNTEERS TABLES
// ===================

export const volunteerApplications = pgTable("volunteer_applications", {
  applicationId: uuid("application_id").defaultRandom().primaryKey(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  docNumber: varchar("doc_number", { length: 50 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  birthDate: date("birth_date").notNull(),
  instagramHandle: varchar("instagram_handle", { length: 100 }),

  hasExperience: boolean("has_experience").notNull().default(false),
  experienceDetails: text("experience_details"),
  wasVolunteerBefore: boolean("was_volunteer_before").notNull().default(false),
  motivation: text("motivation").notNull(),
  availability: jsonb("availability").notNull(),

  status: volunteerAppStatusEnum("status").notNull().default("PENDING"),
  adminNotes: text("admin_notes"),
  appliedAt: timestamp("applied_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
});

export const volunteerRoles = pgTable("volunteer_roles", {
  roleId: serial("role_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
});

export const volunteers = pgTable("volunteers", {
  volunteerId: uuid("volunteer_id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.userId, { onDelete: "cascade" }),
  bio: text("bio"),
  availability: jsonb("availability").notNull().default({}),
  qrCode: uuid("qr_code").defaultRandom().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// Junction table for many-to-many relationship between volunteers and roles
export const volunteersVolunteerRoles = pgTable(
  "volunteers_volunteer_roles",
  {
    volunteerId: uuid("volunteer_id")
      .notNull()
      .references(() => volunteers.volunteerId, { onDelete: "cascade" }),
    roleId: serial("role_id")
      .notNull()
      .references(() => volunteerRoles.roleId, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: index("idx_volunteers_roles_pk").on(table.volunteerId, table.roleId),
  }),
);

export const interviews = pgTable(
  "interviews",
  {
    interviewId: uuid("interview_id").defaultRandom().primaryKey(),
    interviewerId: uuid("interviewer_id")
      .notNull()
      .references(() => users.userId),

    // Polymorphic relationship
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: uuid("entity_id").notNull(),

    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    durationMinutes: smallint("duration_minutes").default(30),
    modality: interviewModalityEnum("modality").notNull(),
    locationDetails: varchar("location_details", { length: 255 }),
    result: interviewResultEnum("result").notNull().default("PENDING"),
    observations: text("observations"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    scheduleIdx: index("idx_interviews_schedule").on(table.scheduledAt),
  }),
);
