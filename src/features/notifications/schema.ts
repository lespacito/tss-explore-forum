import {
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "@/features/auth/schema";

export const notificationTypeEnum = pgEnum("notifications_type", [
  "NEW_REPLY",
  "REPORT_RECEIVED",
  "MODERATION_ACTION",
]);

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  targetType: notificationTypeEnum("notifications_type").notNull(),
  payload: json("payload").notNull(),
  isRead: text("is_read").default("false").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
