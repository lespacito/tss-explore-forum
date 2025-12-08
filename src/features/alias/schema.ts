import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "@/features/auth/schema";

export const alias = pgTable("alias", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  alias: text("alias").notNull().unique(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  rotationEnabled: boolean("rotation_enabled").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
