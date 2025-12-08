import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { alias } from "@/features/alias/schema";
import { threads } from "@/features/threads/schema";

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  threadId: uuid("thread_id")
    .notNull()
    .references(() => threads.id, {
      onDelete: "cascade",
    }),
  aliasId: uuid("alias_id")
    .notNull()
    .references(() => alias.id, {
      onDelete: "cascade",
    }),
  isSensitive: boolean("is_sensitive").default(false).notNull(),
  contentWarnings: text("content_warnings").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  aliasId: uuid("alias_id")
    .notNull()
    .references(() => alias.id, {
      onDelete: "cascade",
    }),
  parentId: uuid("parent_id"), // Self-reference needs to be handled carefully or just assumed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at"),
});
