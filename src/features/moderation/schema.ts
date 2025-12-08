import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "../auth/schema";

export const reportStatusEnum = pgEnum("report_status", [
	"PENDING",
	"RESOLVED",
	"DISMISSED",
]);

export const targetTypeEnum = pgEnum("target_type", ["POST", "COMMENT", "USER"]);

export const reports = pgTable("reports", {
	id: uuid("id").primaryKey().defaultRandom(),
	reporterId: text("reporter_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	targetId: uuid("target_id").notNull(), // Polymorphic ID
	targetType: targetTypeEnum("target_type").notNull(),
	reason: text("reason").notNull(),
	details: text("details"),
	status: reportStatusEnum("status").default("PENDING").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const moderationLogs = pgTable("moderation_logs", {
	id: uuid("id").primaryKey().defaultRandom(),
	moderatorId: text("moderator_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	action: text("action").notNull(),
	targetId: uuid("target_id"),
	reason: text("reason"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const blockedUsers = pgTable("blocked_users", {
	blockerId: text("blocker_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	blockedId: text("blocked_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
    pk: [t.blockerId, t.blockedId]
}));
