import { boolean, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const resources = pgTable("resources", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(),
	description: text("description"),
	url: text("url").notNull(),
	category: text("category").notNull(),
	isOfficial: boolean("is_official").default(false).notNull(),
});
