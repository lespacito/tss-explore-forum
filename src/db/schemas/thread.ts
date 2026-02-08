import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "@/db/schemaHelpers";
import { alias } from "@/db/schemas/alias";
import { user } from "@/db/schemas/user";

// Thread status enum for moderation workflow (Story 2.4)
// DISTINCT from report_status enum in moderation schema
export const threadStatus = ["pending", "published", "rejected"] as const;
export type ThreadStatus = (typeof threadStatus)[number];
export const threadStatusEnum = pgEnum("thread_status", threadStatus);

export const threadsColumns = {
	id: id(),
	aliasId: uuid("alias_id")
		.notNull()
		.references(() => alias.id, { onDelete: "cascade" }),
	title: varchar("title").notNull().unique(),
	body: text("body").notNull(),
	slug: varchar("slug").notNull().unique(),
	category: varchar("category").notNull(),
	// Moderation fields (Story 2.4)
	status: threadStatusEnum("status").notNull().default("pending"),
	isSensitive: boolean("is_sensitive").notNull().default(false),
	moderatedAt: timestamp("moderated_at", { withTimezone: true }),
	moderatorId: text("moderator_id").references(() => user.id, {
		onDelete: "set null",
	}),
	rejectionReason: text("rejection_reason"),
	// Soft delete for moderatable content (AR7)
	deletedAt: timestamp("deleted_at", { withTimezone: true }),
	createdAt: createdAt(),
	updatedAt: updatedAt(),
};

export const threads = pgTable("threads", threadsColumns, (table) => ({
	categoryCreatedIdx: index("threads_category_created_idx").on(
		table.category,
		table.createdAt.desc(),
	),
	slugIdx: index("threads_slug_idx").on(table.slug),
	// Moderation queue performance indexes (Story 2.4)
	statusIdx: index("threads_status_idx").on(table.status),
	moderatorIdx: index("threads_moderator_idx").on(table.moderatorId),
	// Soft delete index (used for filtering deleted threads)
	deletedAtIdx: index("threads_deleted_at_idx").on(table.deletedAt),
}));

export const threadsRelations = relations(threads, ({ one }) => ({
	alias: one(alias, {
		fields: [threads.aliasId],
		references: [alias.id],
	}),
}));
