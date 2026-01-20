// Audit and Operations Tables
import {
  bigserial,
  boolean,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { notificationStatusEnum, notificationTypeEnum } from "./enums";

// ===================
// AUDIT & OPS TABLES
// ===================

export const notifications = pgTable("notifications", {
  notificationId: uuid("notification_id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  subject: varchar("subject", { length: 255 }),
  body: text("body").notNull(),
  status: notificationStatusEnum("status").notNull().default("PENDING"),
  retryCount: smallint("retry_count").default(0),
  errorDetail: text("error_detail"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
});

export const incomingWebhooks = pgTable("incoming_webhooks", {
  webhookId: uuid("webhook_id").defaultRandom().primaryKey(),
  source: varchar("source", { length: 50 }).notNull(),
  payload: jsonb("payload").notNull(),
  isProcessed: boolean("is_processed").default(false),
  receivedAt: timestamp("received_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  processingError: text("processing_error"),
});

export const jobHistory = pgTable("job_history", {
  jobId: bigserial("job_id", { mode: "number" }).primaryKey(),
  jobName: varchar("job_name", { length: 100 }).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  status: varchar("status", { length: 50 }),
  details: jsonb("details"),
});

export const auditLogs = pgTable("audit_logs", {
  logId: bigserial("log_id", { mode: "number" }).primaryKey(),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
  action: varchar("action", { length: 100 }).notNull(),
  userId: uuid("user_id").references(() => users.userId, {
    onDelete: "set null",
  }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: uuid("entity_id"),
  details: jsonb("details"),
});
