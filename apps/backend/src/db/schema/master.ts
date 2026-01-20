// Master Data Tables
import {
  boolean,
  char,
  pgTable,
  serial,
  smallint,
  varchar,
} from "drizzle-orm/pg-core";

// ===================
// MASTER DATA TABLES
// ===================

export const countries = pgTable("countries", {
  isoCode: char("iso_code", { length: 2 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  phonePrefix: varchar("phone_prefix", { length: 10 }),
  isActive: boolean("is_active").default(true),
});

export const currencies = pgTable("currencies", {
  isoCode: char("iso_code", { length: 3 }).primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  symbol: varchar("symbol", { length: 5 }).notNull(),
  decimals: smallint("decimals").default(2),
});

export const provinces = pgTable("provinces", {
  provinceId: serial("province_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
});

export const cities = pgTable("cities", {
  cityId: serial("city_id").primaryKey(),
  provinceId: serial("province_id")
    .notNull()
    .references(() => provinces.provinceId),
  name: varchar("name", { length: 100 }).notNull(),
});
