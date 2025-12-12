import {
  boolean,
  index,
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

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    targetType: notificationTypeEnum("notifications_type").notNull(),
    payload: json("payload").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    // Composite index for unread notifications queries
    userUnreadIdx: index("notifications_user_unread_idx").on(
      table.userId,
      table.isRead,
    ),
    // Index for user notification timeline
    userCreatedIdx: index("notifications_user_created_idx").on(
      table.userId,
      table.createdAt.desc(),
    ),
  }),
);
