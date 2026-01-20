// Finance Module Tables
import { sql } from "drizzle-orm";
import {
  boolean,
  char,
  check,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import {
  paymentMethodTypeEnum,
  paymentProviderEnum,
  physicalContributionTypeEnum,
  transactionStatusEnum,
} from "./enums";
import { currencies } from "./master";

// ===================
// FINANCE TABLES
// ===================

export const transactions = pgTable(
  "transactions",
  {
    transactionId: uuid("transaction_id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.userId, {
      onDelete: "set null",
    }),
    amountTotal: numeric("amount_total", { precision: 12, scale: 2 }).notNull(),
    currency: char("currency", { length: 3 })
      .notNull()
      .default("ARS")
      .references(() => currencies.isoCode),
    provider: paymentProviderEnum("provider").notNull(),
    externalTransactionId: varchar("external_transaction_id", {
      length: 255,
    }).unique(),
    externalReferenceId: varchar("external_reference_id", { length: 255 }),
    method: paymentMethodTypeEnum("method"),
    methodDetail: varchar("method_detail", { length: 100 }),
    status: transactionStatusEnum("status").notNull().default("PENDING"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    originType: varchar("origin_type", { length: 50 }).notNull(),
    originId: uuid("origin_id").notNull(),
  },
  (table) => ({
    amountCheck: check(
      "chk_transactions_amount",
      sql`${table.amountTotal} > 0`,
    ),
    externalIdx: index("idx_transactions_external").on(
      table.externalTransactionId,
    ),
  }),
);

export const monetaryDonations = pgTable("monetary_donations", {
  donationId: uuid("donation_id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.userId, {
    onDelete: "set null",
  }),
  targetAmount: numeric("target_amount", { precision: 12, scale: 2 }).notNull(),
  currency: char("currency", { length: 3 })
    .notNull()
    .default("ARS")
    .references(() => currencies.isoCode),
  thankYouMessage: text("thank_you_message"),
  isAnonymous: boolean("is_anonymous").default(false),
  isConfirmed: boolean("is_confirmed").default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const inKindDonations = pgTable(
  "in_kind_donations",
  {
    donationId: uuid("donation_id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.userId, {
      onDelete: "set null",
    }),
    manualDonorName: varchar("manual_donor_name", { length: 100 }),
    manualDonorContact: varchar("manual_donor_contact", { length: 100 }),
    description: text("description").notNull(),
    estimatedValue: numeric("estimated_value", {
      precision: 12,
      scale: 2,
    }).default("0"),
    receivedById: uuid("received_by_id")
      .notNull()
      .references(() => users.userId),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    donorCheck: check(
      "chk_inkind_donor_id",
      sql`${table.userId} IS NOT NULL OR ${table.manualDonorName} IS NOT NULL`,
    ),
  }),
);

export const onSiteCollections = pgTable("on_site_collections", {
  collectionId: uuid("collection_id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.userId),

  // Polymorphic relationship
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: uuid("entity_id").notNull(),

  type: physicalContributionTypeEnum("type").notNull(),
  description: text("description").notNull(),
  estimatedValue: numeric("estimated_value", {
    precision: 12,
    scale: 2,
  }).default("0"),
  currency: char("currency", { length: 3 })
    .default("ARS")
    .references(() => currencies.isoCode),
  receivedById: uuid("received_by_id")
    .notNull()
    .references(() => users.userId),
  receivedAt: timestamp("received_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const paymentMethods = pgTable("payment_methods", {
  methodId: uuid("method_id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
  provider: paymentProviderEnum("provider").notNull().default("MERCADOPAGO"),
  externalToken: varchar("external_token", { length: 255 }).notNull(),
  cardBrand: varchar("card_brand", { length: 50 }),
  lastFour: varchar("last_four", { length: 4 }),
  description: varchar("description", { length: 100 }),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
