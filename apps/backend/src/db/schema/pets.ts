// Pets Module Tables
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  pgTable,
  point,
  serial,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { petSexEnum, petStatusEnum } from "./enums";

// ===================
// PETS TABLES
// ===================

export const species = pgTable("species", {
  speciesId: serial("species_id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
});

export const breeds = pgTable("breeds", {
  breedId: serial("breed_id").primaryKey(),
  speciesId: serial("species_id")
    .notNull()
    .references(() => species.speciesId),
  name: varchar("name", { length: 100 }).notNull(),
});

export const pets = pgTable(
  "pets",
  {
    petId: uuid("pet_id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    status: petStatusEnum("status").notNull(),
    sex: petSexEnum("sex").notNull().default("UNKNOWN"),

    breedId: serial("breed_id").references(() => breeds.breedId, {
      onDelete: "set null",
    }),
    birthDateApprox: date("birth_date_approx"),
    qrCode: uuid("qr_code").defaultRandom().unique(),
    ownerId: uuid("owner_id").references(() => users.userId, {
      onDelete: "set null",
    }),
    neuterDate: date("neuter_date"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    ownerIdx: index("idx_pets_owner").on(table.ownerId),
    petsLogicCheck: check(
      "chk_pets_logic",
      sql`(
        (${table.status} IN ('ADOPTION_AVAILABLE', 'IN_PROCESS') AND ${table.ownerId} IS NULL) OR
        (${table.status} IN ('OWNED', 'LOST') AND ${table.ownerId} IS NOT NULL) OR
        (${table.status} = 'DECEASED')
      )`,
    ),
  }),
);

export const lostPetAlerts = pgTable(
  "lost_pet_alerts",
  {
    alertId: uuid("alert_id").defaultRandom().primaryKey(),
    petId: uuid("pet_id")
      .notNull()
      .references(() => pets.petId, { onDelete: "cascade" }),

    lostAt: timestamp("lost_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenZone: varchar("last_seen_zone", { length: 255 }).notNull(),
    coordinates: point("coordinates"),
    contactPhone: varchar("contact_phone", { length: 50 }).notNull(),
    message: varchar("message"),
    isActive: boolean("is_active").default(true),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (table) => ({
    uniqueActive: unique("uq_lost_alerts_active").on(
      table.petId,
      table.isActive,
    ),
  }),
);

export const vaccinesCatalog = pgTable("vaccines_catalog", {
  vaccineId: serial("vaccine_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
});

export const petsVaccines = pgTable(
  "pets_vaccines",
  {
    petId: uuid("pet_id")
      .notNull()
      .references(() => pets.petId, { onDelete: "cascade" }),
    vaccineId: serial("vaccine_id")
      .notNull()
      .references(() => vaccinesCatalog.vaccineId, { onDelete: "cascade" }),
    appliedAt: date("applied_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: {
      name: "pk_pets_vaccines",
      columns: [table.petId, table.vaccineId, table.appliedAt],
    },
  }),
);
