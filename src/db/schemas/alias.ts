import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { user } from "@/db/schemas/user";
import { createdAt, id } from "@/db/schemaHelpers";
import { relations } from "drizzle-orm";

export const alias = pgTable("alias", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  alias: text("alias").notNull().unique(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  rotationEnabled: boolean("rotation_enabled").default(false).notNull(),
  createdAt: createdAt(),
});

export const aliasRelations = relations(alias, ({ one }) => ({
  user: one(user, {
    fields: [alias.userId],
    references: [user.id],
  }),
}));
