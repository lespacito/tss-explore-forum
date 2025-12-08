import { db } from "@/db";
import { threads } from "../schema";
import { z } from "zod";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { createServerFn } from "@tanstack/react-start";
import { getPrimaryAlias } from "@/features/alias/lib/get-primary-alias";

const createThreadSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre ne peut pas être vide")
    .max(200, "Le titre ne peut pas dépasser 200 caractères"),
  body: z
    .string()
    .min(1, "Le contenu ne peut pas être vide")
    .max(10000, "Le contenu ne peut pas dépasser 10000 caractères"),
  category: z.string().min(1, "La catégorie est requise"),
});

export const createThreadFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createThreadSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await getAuthSession();
    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    // Récupérer l'alias principal de l'utilisateur
    const primaryAlias = await getPrimaryAlias(session.user.id);

    if (!primaryAlias) {
      throw new Error(
        "Aucun alias trouvé pour cet utilisateur. Veuillez contacter le support.",
      );
    }

    // Créer le thread avec l'alias
    const [newThread] = await db
      .insert(threads)
      .values({
        aliasId: primaryAlias.id,
        title: data.title.trim(),
        body: data.body.trim(),
        category: data.category.trim(),
      })
      .returning();

    return { success: true, thread: newThread };
  });
