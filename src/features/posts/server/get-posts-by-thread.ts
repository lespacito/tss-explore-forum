import { db } from "@/db";
import { posts } from "../schema";
import { alias } from "@/features/alias/schema";
import { user } from "@/features/auth/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const getPostsByThreadSchema = z.object({
  threadId: z.string().uuid("Thread ID must be a valid UUID"),
});

export const getPostsByThreadFn = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => getPostsByThreadSchema.parse(data))
  .handler(async ({ data }) => {
    const result = await db
      .select({
        id: posts.id,
        content: posts.content,
        threadId: posts.threadId,
        isSensitive: posts.isSensitive,
        contentWarnings: posts.contentWarnings,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        // Informations de l'alias (anonymat respecté)
        aliasName: alias.alias,
        aliasId: alias.id,
        // Informations de l'utilisateur (pour displayUsername)
        displayUsername: user.displayUsername,
      })
      .from(posts)
      .leftJoin(alias, eq(posts.aliasId, alias.id))
      .leftJoin(user, eq(alias.userId, user.id))
      .where(and(eq(posts.threadId, data.threadId), isNull(posts.deletedAt)))
      .orderBy(desc(posts.createdAt));

    return result;
  });
