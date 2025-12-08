import { db } from "@/db";
import { threads } from "../schema";
import { alias } from "@/features/alias/schema";
import { user } from "@/features/auth/schema";
import { eq } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const getThreadByIdSchema = z.object({
  threadId: z.uuid("Thread ID must be a valid UUID"),
});

export const getThreadByIdFn = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => getThreadByIdSchema.parse(data))
  .handler(async ({ data }) => {
    const [thread] = await db
      .select({
        id: threads.id,
        title: threads.title,
        body: threads.body,
        category: threads.category,
        createdAt: threads.createdAt,
        updatedAt: threads.updatedAt,
        aliasName: alias.alias,
        aliasId: alias.id,
        displayUsername: user.displayUsername,
      })
      .from(threads)
      .leftJoin(alias, eq(threads.aliasId, alias.id))
      .leftJoin(user, eq(alias.userId, user.id))
      .where(eq(threads.id, data.threadId))
      .limit(1);

    if (!thread) {
      throw new Error("Thread non trouvé");
    }

    return thread;
  });
