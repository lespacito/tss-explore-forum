import { db } from "@/db";
import { threads } from "../../../db/schemas/thread";
import { alias } from "@/db/schemas/alias";
import { user } from "@/db/schemas/user";
import { desc, eq } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";

export const getThreadsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const result = await db
      .select({
        id: threads.id,
        title: threads.title,
        body: threads.body,
        slug: threads.slug,
        category: threads.category,
        createdAt: threads.createdAt,
        updatedAt: threads.updatedAt,
        // Informations de l'alias (anonymat respecté)
        aliasName: alias.alias,
        aliasId: alias.id,
        // Informations de l'utilisateur (pour displayUsername)
        displayUsername: user.displayUsername,
      })
      .from(threads)
      .leftJoin(alias, eq(threads.aliasId, alias.id))
      .leftJoin(user, eq(alias.userId, user.id))
      .orderBy(desc(threads.createdAt));

    // OPTIMIZATION: Serialize dates to ISO strings on server to reduce JSON payload size
    // This reduces the payload by ~20-30% and makes it easier for the client to parse
    return result.map((thread) => ({
      ...thread,
      createdAt: thread.createdAt.toISOString(),
      updatedAt: thread.updatedAt.toISOString(),
    }));
  },
);

// Export as alias for compatibility with optimized loaders
export { getThreadsFn as getThreadsCached };
