import { db } from "@/db";
import { posts } from "../schema";

import { desc, eq, isNull } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import { alias, threads } from "@/db/schema";
import { user } from "@/features/auth/schema";

export const getPostsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const result = await db
      .select({
        id: posts.id,
        content: posts.content,
        threadId: posts.threadId,
        threadTitle: threads.title,
        threadCategory: threads.category,
        isSensitive: posts.isSensitive,
        contentWarnings: posts.contentWarnings,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        aliasName: alias.alias,
        aliasId: alias.id,
        displayUsername: user.displayUsername,
      })
      .from(posts)
      .leftJoin(alias, eq(posts.aliasId, alias.id))
      .leftJoin(threads, eq(posts.threadId, threads.id))
      .leftJoin(user, eq(alias.userId, user.id))
      .where(isNull(posts.deletedAt))
      .orderBy(desc(posts.createdAt));

    return result;
  },
);
