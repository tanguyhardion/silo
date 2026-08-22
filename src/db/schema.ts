import { pgTable, text, timestamp, numeric } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  customType: text("custom_type"),
  description: text("description"),
  currentEstimatedValue: numeric("current_estimated_value", { precision: 12, scale: 2 }).notNull().default("0"),
  currency: text("currency").notNull().default("EUR"),
  mainImageUrl: text("main_image_url"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const valuations = pgTable("valuations", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  value: numeric("value", { precision: 12, scale: 2 }).notNull(),
  valuationDate: text("valuation_date").notNull(),
  notes: text("notes"),
  createdBy: text("created_by").notNull().default("Utilisateur Silo"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const listings = pgTable("listings", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  source: text("source").notNull(), // 'leboncoin' | 'agriaffaires' | 'autre'
  url: text("url").notNull(),
  title: text("title").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("EUR"),
  sellerName: text("seller_name"),
  sellerType: text("seller_type"),
  location: text("location"),
  publishedDate: text("published_date"),
  observedAt: text("observed_at").notNull(), // JJ/MM/AAAA or ISO
  description: text("description"),
  specs: text("specs"),
  images: text("images"),
  rawData: text("raw_data"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  actionType: text("action_type").notNull(),
  description: text("description").notNull(),
  metadata: text("metadata"),
  actor: text("actor").notNull().default("Utilisateur Silo"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
