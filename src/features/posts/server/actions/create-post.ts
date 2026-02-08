import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getPrimaryAlias } from "@/features/alias/lib/get-primary-alias";
import {
	checkArcjet,
	handleArcjetDenied,
} from "@/features/auth/lib/security/protected-server-fn";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { isThreadCategorySensitive } from "@/lib/utils/thread-utils";
import { createPostRecord, getThreadCategory } from "../db/post-queries";

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
		const decision = await checkArcjet({
			path: "/posts/create",
		});

		if (decision.isDenied()) {
			return handleArcjetDenied(decision);
		}

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

		// Récupérer le thread pour vérifier sa catégorie
		const thread = await getThreadCategory(data.threadId);

		if (!thread) {
			throw new Error("Thread not found");
		}

		// Forcer isSensitive à true si la catégorie du thread est sensible
		const isCategorySensitive = isThreadCategorySensitive(thread.category);
		const isSensitive = isCategorySensitive || data.isSensitive;

		const newPost = await createPostRecord({
			aliasId: primaryAlias.id,
			threadId: data.threadId,
			content: data.content.trim(),
			isSensitive,
			contentWarnings: data.contentWarnings ?? [],
		});

		return { success: true, post: newPost };
	});
