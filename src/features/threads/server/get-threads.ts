import { db } from "@/db";
import { threads } from "../schema";
import { alias } from "@/features/alias/schema";
import { user } from "@/features/auth/schema";
import { desc, eq } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";

export const getThreadsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const result = await db
      .select({
        id: threads.id,
        title: threads.title,
        body: threads.body,
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

    return result;
  },
);
