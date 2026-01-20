// Transversal Tables (Polymorphic)
import {
  boolean,
  index,
  jsonb,
  pgTable,
  point,
  serial,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { mediaTypeEnum } from "./enums";
import { cities } from "./master";

// ===================
// TRANSVERSAL TABLES
// ===================

export const media = pgTable(
  "media",
  {
    mediaId: uuid("media_id").defaultRandom().primaryKey(),
    storageUrl: varchar("storage_url", { length: 255 }).notNull(),
    type: mediaTypeEnum("type").notNull(),
    altText: varchar("alt_text", { length: 255 }),

    // Polymorphic relationship
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: uuid("entity_id").notNull(),

    isMain: boolean("is_main").default(false),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    polymorphicIdx: index("idx_media_polymorphic").on(
      table.entityType,
      table.entityId,
    ),
  }),
);

export const tags = pgTable("tags", {
  tagId: serial("tag_id").primaryKey(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  name: jsonb("name").notNull(),
  colorHex: varchar("color_hex", { length: 7 }).default("#00AA00"),
});

export const taggables = pgTable(
  "taggables",
  {
    tagId: serial("tag_id")
      .notNull()
      .references(() => tags.tagId, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: uuid("entity_id").notNull(),
  },
  (table) => ({
    pk: {
      name: "pk_taggables",
      columns: [table.tagId, table.entityType, table.entityId],
    },
    entityIdx: index("idx_taggables_entity").on(
      table.entityType,
      table.entityId,
    ),
  }),
);

export const addresses = pgTable(
  "addresses",
  {
    addressId: uuid("address_id").defaultRandom().primaryKey(),

    // Polymorphic relationship
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: uuid("entity_id").notNull(),

    cityId: serial("city_id")
      .notNull()
      .references(() => cities.cityId),
    street: varchar("street", { length: 255 }).notNull(),
    number: varchar("number", { length: 20 }).notNull(),
    unit: varchar("unit", { length: 50 }),
    zipCode: varchar("zip_code", { length: 10 }).notNull(),
    alias: varchar("alias", { length: 100 }).default("Main"),
    coordinates: point("coordinates"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    polymorphicIdx: index("idx_addresses_polymorphic").on(
      table.entityType,
      table.entityId,
    ),
  }),
);
