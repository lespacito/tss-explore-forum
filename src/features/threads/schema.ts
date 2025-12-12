import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { alias } from "@/features/alias/schema";

export const threads = pgTable(
  "threads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    aliasId: uuid("alias_id")
      .notNull()
      .references(() => alias.id, { onDelete: "cascade" }),
    title: text("title").notNull().unique(),
    body: text("body").notNull(),
    slug: text("slug").notNull().unique(),
    category: text("category").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    categoryCreatedIdx: index("threads_category_created_idx").on(
      table.category,
      table.createdAt.desc(),
    ),
    slugIdx: index("threads_slug_idx").on(table.slug),
  }),
);
