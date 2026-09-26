import { pgTable, uuid, smallint, text, timestamp, varchar, index } from "drizzle-orm/pg-core";

export const feedback = pgTable("feedback", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	overallRating: smallint().notNull(),
	easeOfUse: smallint().notNull(),
	trustAnonymity: smallint().notNull(),
	misunderstood: text(),
	bugDescription: text(),
	bugPage: varchar(),
	improvementSuggestion: text(),
	freeComment: text(),
	createdAt: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
}, (table) => [
	index("feedback_created_at_idx").using("btree", table.createdAt.desc().nullsLast().op("timestamptz_ops")),
]);