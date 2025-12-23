import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { alias } from "@/db/schemas/alias";
import { threads } from "@/db/schemas/thread";
import { createdAt, id, updatedAt } from "@/db/schemaHelpers";
import { relations } from "drizzle-orm";

export const posts = pgTable(
  "posts",
  {
    id: id(),
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
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    threadCreatedIdx: index("posts_thread_created_idx").on(
      table.threadId,
      table.createdAt,
    ),
  }),
);

export const comments = pgTable(
  "comments",
  {
    id: id(),
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
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    postCreatedIdx: index("comments_post_created_idx").on(
      table.postId,
      table.createdAt,
    ),
  }),
);

export const postsRelations = relations(posts, ({ one, many }) => ({
  thread: one(threads, {
    fields: [posts.threadId],
    references: [threads.id],
  }),
  alias: one(alias, {
    fields: [posts.aliasId],
    references: [alias.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  alias: one(alias, {
    fields: [comments.aliasId],
    references: [alias.id],
  }),
  replies: many(comments),
}));
