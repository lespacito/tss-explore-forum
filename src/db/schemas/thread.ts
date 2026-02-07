import { relations } from "drizzle-orm";
import { index, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "@/db/schemaHelpers";
import { alias } from "@/db/schemas/alias";

export const threadsColumns = {
	id: id(),
	aliasId: uuid("alias_id")
		.notNull()
		.references(() => alias.id, { onDelete: "cascade" }),
	title: varchar("title").notNull().unique(),
	body: text("body").notNull(),
	slug: varchar("slug").notNull().unique(),
	category: varchar("category").notNull(),
	createdAt: createdAt(),
	updatedAt: updatedAt(),
};

export const threads = pgTable("threads", threadsColumns, (table) => ({
	categoryCreatedIdx: index("threads_category_created_idx").on(
		table.category,
		table.createdAt.desc(),
	),
	slugIdx: index("threads_slug_idx").on(table.slug),
}));

export const threadsRelations = relations(threads, ({ one }) => ({
	alias: one(alias, {
		fields: [threads.aliasId],
		references: [alias.id],
	}),
}));
