// Auth Schema Tables
import { sql } from "drizzle-orm";
import {
  boolean,
  char,
  check,
  date,
  index,
  jsonb,
  serial,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { authSchema, documentTypeEnum } from "./enums";

// ===================
// AUTH SCHEMA TABLES
// ===================

export const roles = authSchema.table("roles", {
  roleId: serial("role_id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
});

export const users = authSchema.table(
  "users",
  {
    userId: uuid("user_id").defaultRandom().primaryKey(),

    // Basic info
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),

    // Auth
    passwordHash: varchar("password_hash", { length: 60 }),
    googleId: varchar("google_id", { length: 255 }).unique(),
    avatarUrl: varchar("avatar_url", { length: 500 }),
    tfaEnabled: boolean("tfa_enabled").notNull().default(false),
    tfaSecret: varchar("tfa_secret", { length: 255 }),

    // Identity
    docType: documentTypeEnum("doc_type").notNull().default("DNI"),
    docNumber: varchar("doc_number", { length: 50 }).notNull(),
    nationalityIso: char("nationality_iso", { length: 2 })
      .notNull()
      .default("AR"),

    // Contact
    birthDate: date("birth_date"),
    phone: varchar("phone", { length: 20 }),
    secondaryEmail: varchar("secondary_email", { length: 255 }),

    // Preferences
    notificationPreferences: jsonb("notification_preferences")
      .notNull()
      .default({ news: true, events: true }),

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    emailIdx: index("idx_users_email").on(table.email),
    uniqueDoc: unique("uq_users_document").on(table.docType, table.docNumber),
    authMethodCheck: check(
      "chk_users_auth_method",
      sql`${table.passwordHash} IS NOT NULL OR ${table.googleId} IS NOT NULL`,
    ),
  }),
);

export const usersRoles = authSchema.table(
  "users_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    roleId: serial("role_id")
      .notNull()
      .references(() => roles.roleId, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: {
      name: "pk_users_roles",
      columns: [table.userId, table.roleId],
    },
  }),
);
