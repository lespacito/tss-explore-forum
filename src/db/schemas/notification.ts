import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	json,
	pgEnum,
	pgTable,
	text,
} from "drizzle-orm/pg-core";
import { createdAt, id } from "@/db/schemaHelpers";
import { user } from "@/db/schemas/user";

export const notificationType = [
	"NEW_REPLY",
	"REPORT_RECEIVED",
	"MODERATION_ACTION",
] as const;
export type NotificationType = (typeof notificationType)[number];
export const notificationTypeEnum = pgEnum(
	"notification_type",
	notificationType,
);

export const notificationsColumns = {
	id: id(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	targetType: notificationTypeEnum().notNull(),
	payload: json("payload").notNull(),
	isRead: boolean("is_read").default(false).notNull(),
	createdAt: createdAt(),
};

export const notifications = pgTable(
	"notifications",
	notificationsColumns,
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

export const notificationsRelations = relations(notifications, ({ one }) => ({
	user: one(user, {
		fields: [notifications.userId],
		references: [user.id],
	}),
}));
