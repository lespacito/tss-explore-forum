import { boolean, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { id } from "@/db/schemaHelpers";

export const resources = pgTable("resources", {
  id: id(),
  title: varchar("title").notNull(),
  description: text("description"),
  url: varchar("url").notNull(),
  category: varchar("category").notNull(),
  isOfficial: boolean("is_official").default(false).notNull(),
});
