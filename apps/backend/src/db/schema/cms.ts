// CMS and Content Tables
import {
  index,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import {
  languageCodeEnum,
  publicationStatusEnum,
  uiComponentTypeEnum,
  uiSectionEnum,
} from "./enums";

// ===================
// CMS TABLES
// ===================

export const news = pgTable("news", {
  newsId: uuid("news_id").defaultRandom().primaryKey(),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.userId, { onDelete: "set null" }),
  status: publicationStatusEnum("status").notNull().default("DRAFT"),
  publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const newsTranslations = pgTable(
  "news_translations",
  {
    newsId: uuid("news_id")
      .notNull()
      .references(() => news.newsId, { onDelete: "cascade" }),
    language: languageCodeEnum("language").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    excerpt: varchar("excerpt", { length: 500 }),
    content: text("content").notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: varchar("meta_description", { length: 500 }),
  },
  (table) => ({
    pk: {
      name: "pk_news_translations",
      columns: [table.newsId, table.language],
    },
    uniqueSlug: unique("uq_news_slug").on(table.language, table.slug),
  }),
);

export const resources = pgTable("resources", {
  resourceId: uuid("resource_id").defaultRandom().primaryKey(),
  authorId: uuid("author_id")
    .notNull()
    .references(() => users.userId, { onDelete: "set null" }),
  status: publicationStatusEnum("status").notNull().default("DRAFT"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  lastUpdatedAt: timestamp("last_updated_at", {
    withTimezone: true,
  }).defaultNow(),
  sortOrder: smallint("sort_order").default(0),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const resourcesTranslations = pgTable(
  "resources_translations",
  {
    resourceId: uuid("resource_id")
      .notNull()
      .references(() => resources.resourceId, { onDelete: "cascade" }),
    language: languageCodeEnum("language").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: varchar("meta_description", { length: 500 }),
  },
  (table) => ({
    pk: {
      name: "pk_resources_trans",
      columns: [table.resourceId, table.language],
    },
    uniqueSlug: unique("uq_res_slug").on(table.language, table.slug),
  }),
);

export const sponsors = pgTable("sponsors", {
  sponsorId: uuid("sponsor_id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  websiteUrl: varchar("website_url", { length: 255 }),
  contactName: varchar("contact_name", { length: 100 }).unique(),
  contactEmail: varchar("contact_email", { length: 255 }).unique(),
  contactPhone: varchar("contact_phone", { length: 20 }).unique(),
  sortOrder: smallint("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const uiFragments = pgTable(
  "ui_fragments",
  {
    fragmentKey: varchar("fragment_key", { length: 100 }).notNull(),
    language: languageCodeEnum("language").notNull().default("es"),

    description: varchar("description", { length: 255 }),
    type: uiComponentTypeEnum("type").notNull(),
    section: uiSectionEnum("section").notNull(),

    content: jsonb("content").notNull(),

    lastUpdatedAt: timestamp("last_updated_at", {
      withTimezone: true,
    }).defaultNow(),
    updatedBy: uuid("updated_by").references(() => users.userId, {
      onDelete: "set null",
    }),
  },
  (table) => ({
    pk: {
      name: "pk_ui_fragments",
      columns: [table.fragmentKey, table.language],
    },
    sectionIdx: index("idx_ui_fragments_section").on(table.section),
  }),
);
