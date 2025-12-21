import { pgEnum, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./user";
import { createdAt, id } from "@/db/schemaHelpers";
import { relations } from "drizzle-orm";

export const reportStatus = ["PENDING", "RESOLVED", "DISMISSED"] as const;
export type ReportStatus = (typeof reportStatus)[number];
export const reportStatusEnum = pgEnum("report_status", reportStatus);

export const reportType = ["POST", "COMMENT", "USER"] as const;
export type ReportType = (typeof reportType)[number];
export const reportTypeEnum = pgEnum("report_target_type", reportType);

export const reports = pgTable("reports", {
  id,
  reporterId: text("reporter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  targetId: uuid("target_id").notNull(), // Polymorphic ID
  targetType: reportTypeEnum().notNull(),
  reason: text("reason").notNull(),
  details: varchar("details"),
  status: reportStatusEnum().notNull(),
  createdAt,
});

export const moderationLogs = pgTable("moderation_logs", {
  id,
  moderatorId: text("moderator_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  targetId: uuid("target_id"),
  reason: text("reason"),
  createdAt,
});

export const blockedUsers = pgTable(
  "blocked_users",
  {
    blockerId: text("blocker_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    blockedId: text("blocked_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt,
  },
  (t) => ({
    pk: [t.blockerId, t.blockedId],
  }),
);

export const reportRelations = relations(reports, ({ one }) => ({
  reporter: one(user, {
    fields: [reports.reporterId],
    references: [user.id],
  }),
}));

export const moderationLogRelations = relations(moderationLogs, ({ one }) => ({
  moderator: one(user, {
    fields: [moderationLogs.moderatorId],
    references: [user.id],
  }),
}));

export const blockedUsersRelations = relations(blockedUsers, ({ one }) => ({
  blocker: one(user, {
    fields: [blockedUsers.blockerId],
    references: [user.id],
  }),
  blocked: one(user, {
    fields: [blockedUsers.blockedId],
    references: [user.id],
  }),
}));
