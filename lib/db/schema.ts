import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  doublePrecision,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import {
  USER_ROLES,
  REPORT_CATEGORIES,
  REPORT_STATUSES,
  REPORT_SEVERITIES,
  MODERATION_ACTIONS,
  DEFAULT_USER_ROLE,
  DEFAULT_REPORT_STATUS,
} from "../constants";

export const userRoleEnum = pgEnum("user_role", [...USER_ROLES]);
export const reportCategoryEnum = pgEnum("report_category", [...REPORT_CATEGORIES]);
export const reportStatusEnum = pgEnum("report_status", [...REPORT_STATUSES]);
export const reportSeverityEnum = pgEnum("report_severity", [...REPORT_SEVERITIES]);
export const moderationActionEnum = pgEnum("moderation_action", [...MODERATION_ACTIONS]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull().default(DEFAULT_USER_ROLE),
  created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const neighborhoods = pgTable(
  "neighborhoods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    city: text("city").notNull(),
    created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.name, t.city)]
);

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: reportCategoryEnum("category").notNull(),
  status: reportStatusEnum("status").notNull().default(DEFAULT_REPORT_STATUS),
  severity: reportSeverityEnum("severity").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  address: text("address"),
  street_name: text("street_name"),
  neighborhood_id: uuid("neighborhood_id").references(() => neighborhoods.id),
  is_anonymous: boolean("is_anonymous").notNull().default(false),
  created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
});

export const report_images = pgTable("report_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  report_id: uuid("report_id").notNull().references(() => reports.id, { onDelete: "cascade" }),
  image_url: text("image_url").notNull(),
  storage_path: text("storage_path").notNull(),
  created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const report_confirmations = pgTable("report_confirmations", {
  id: uuid("id").primaryKey().defaultRandom(),
  report_id: uuid("report_id").notNull().references(() => reports.id, { onDelete: "cascade" }),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const moderation_logs = pgTable("moderation_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  report_id: uuid("report_id").notNull().references(() => reports.id, { onDelete: "cascade" }),
  moderator_id: uuid("moderator_id").notNull().references(() => users.id),
  action: moderationActionEnum("action").notNull(),
  note: text("note"),
  created_at: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});
