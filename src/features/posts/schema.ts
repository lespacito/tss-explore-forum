import { pgTable, boolean, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "../auth/schema";

export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  authorId: text("author_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  content_redacted: text("content_redacted"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  editedAt: timestamp("edited_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
});
