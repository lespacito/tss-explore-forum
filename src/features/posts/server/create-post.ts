import { db } from "@/db";
import { posts } from "../schema";
import { z } from "zod";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { createServerFn } from "@tanstack/react-start";
import { getPrimaryAlias } from "@/features/alias/lib/get-primary-alias";

const createPostSchema = z.object({
  threadId: z.uuid("Thread ID must be a valid UUID"),
  content: z
    .string()
    .min(1, "Le contenu ne peut pas être vide")
    .max(10000, "Le contenu ne peut pas dépasser 10000 caractères"),
  isSensitive: z.boolean().default(false),
  contentWarnings: z.array(z.string()).optional(),
});

export const createPostFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createPostSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await getAuthSession();
    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    const primaryAlias = await getPrimaryAlias(session.user.id);

    if (!primaryAlias) {
      throw new Error(
        "Aucun alias trouvé pour cet utilisateur. Veuillez contacter le support.",
      );
    }

    const [newPost] = await db
      .insert(posts)
      .values({
        aliasId: primaryAlias.id,
        threadId: data.threadId,
        content: data.content.trim(),
        isSensitive: data.isSensitive,
        contentWarnings: data.contentWarnings ?? [],
      })
      .returning();

    return { success: true, post: newPost };
  });
