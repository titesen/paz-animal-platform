// Interactions Tables
import type { PgTableWithColumns } from "drizzle-orm/pg-core";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { moderationStatusEnum, reportReasonEnum } from "./enums";

// ===================
// INTERACTIONS TABLES
// ===================

export const comments: PgTableWithColumns<any> = pgTable(
  "comments",
  {
    commentId: uuid("comment_id").defaultRandom().primaryKey(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),

    // Polymorphic relationship
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: uuid("entity_id").notNull(),

    content: text("content").notNull(),
    moderationStatus: moderationStatusEnum("moderation_status")
      .notNull()
      .default("PUBLISHED"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastUpdatedAt: timestamp("last_updated_at", {
      withTimezone: true,
    }).defaultNow(),
    parentCommentId: uuid("parent_comment_id").references(
      (): any => comments.commentId,
      { onDelete: "cascade" },
    ),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    entityIdx: index("idx_comments_entity").on(
      table.entityType,
      table.entityId,
    ),
  }),
);

export const likes = pgTable(
  "likes",
  {
    likeId: uuid("like_id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),

    // Polymorphic relationship
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: uuid("entity_id").notNull(),

    likedAt: timestamp("liked_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    entityIdx: index("idx_likes_entity").on(table.entityType, table.entityId),
    uniqueLike: unique("uq_likes_unique").on(
      table.userId,
      table.entityType,
      table.entityId,
    ),
  }),
);

export const reports = pgTable(
  "reports",
  {
    reportId: uuid("report_id").defaultRandom().primaryKey(),
    reporterId: uuid("reporter_id").references(() => users.userId, {
      onDelete: "set null",
    }),

    // Polymorphic relationship
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: uuid("entity_id").notNull(),

    reason: reportReasonEnum("reason").notNull(),
    description: text("description"),
    isResolved: boolean("is_resolved").default(false),
    reportedAt: timestamp("reported_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueReport: unique("uq_report_unique").on(
      table.reporterId,
      table.entityType,
      table.entityId,
    ),
  }),
);
