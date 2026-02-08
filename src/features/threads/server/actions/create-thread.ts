import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ThreadCategory } from "@/data/threads-categories";
import { getPrimaryAlias } from "@/features/alias/lib/get-primary-alias";
import {
	checkArcjet,
	handleArcjetDenied,
} from "@/features/auth/lib/security/protected-server-fn";
import { generateSecretCodeLogic } from "@/features/auth/server/generate-secret-code-fn";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { getUserById } from "@/features/users/server/db/user-queries";
import { logger } from "@/lib/logger/server";
import { validateAndSanitize } from "@/lib/security/sanitize-html";
import { generateUniqueSlug } from "@/lib/utils/slug-utils";
import { threads } from "../../../db/schemas/thread";
import { createThreadRecord, getThreadsByAliasId } from "../db/thread-queries";

const createThreadSchema = z.object({
	title: z
		.string()
		.min(1, "Le titre ne peut pas être vide")
		.max(200, "Le titre ne peut pas dépasser 200 caractères"),
	body: z
		.string()
		.min(1, "Le contenu ne peut pas être vide")
		.max(10000, "Le contenu ne peut pas dépasser 10000 caractères"),
	category: z.enum(["VIOLENCE", "ABUS", "TEMOIN", "DETRESSE", "AUTRE"], {
		errorMap: () => ({ message: "Catégorie invalide" }),
	}) as z.ZodType<ThreadCategory>,
});

// Type pour le retour de createThreadFn
type CreateThreadResult =
	| {
			success: true;
			thread: typeof threads.$inferSelect;
			secretCode?: string;
			isFirstPublication?: boolean;
	  }
	| {
			success: false;
			error: string;
	  };

export const createThreadFn = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => createThreadSchema.parse(data))
	.handler(async ({ data }) => {
		const decision = await checkArcjet({
			path: "/threads/create",
		});

		if (decision.isDenied()) {
			return handleArcjetDenied(decision);
		}

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

		const title = data.title.trim();
		const body = data.body.trim();
		const category = data.category.trim();

		// Sanitize HTML content from Tiptap editor (critical security layer)
		const sanitizationResult = validateAndSanitize(body);
		if (!sanitizationResult.isValid) {
			logger.warn("Thread creation blocked due to invalid content", {
				userId: session.user.id,
				error: sanitizationResult.error,
			});
			return {
				success: false,
				error: sanitizationResult.error || "Le contenu n'est pas valide",
			};
		}

		const sanitizedBody = sanitizationResult.sanitized!;

		// Générer le slug unique à partir du titre
		const slug = generateUniqueSlug(title);

		// OPTIMIZATION: Parallelize independent DB queries to reduce waterfall
		// Fetch existing threads and current user data in parallel
		const [existingThreads, currentUser] = await Promise.all([
			getThreadsByAliasId(primaryAlias.id),
			getUserById(session.user.id),
		]);

		const isFirstPublication = existingThreads.length === 0;

		// Créer le thread avec l'alias et le slug
		// Story 2.4: All new threads start with status="pending" for moderation
		const newThread = await createThreadRecord({
			aliasId: primaryAlias.id,
			title,
			body: sanitizedBody, // Use sanitized HTML
			category,
			slug,
			status: "pending", // Story 2.4: Moderation workflow
		});

		// Task 4.2: Générer code secret après première publication pour utilisateurs anonymes
		if (isFirstPublication) {
			// Vérifier si l'utilisateur est anonyme (isAnonymous === true)
			if (currentUser && currentUser.isAnonymous === true) {
				// Task 4.3: generateSecretCodeLogic gère l'idempotence (code existant)
				const codeResult = await generateSecretCodeLogic(session);

				if (codeResult.success) {
					logger.info("Secret code generated for first publication", {
						userId: session.user.id,
						isExisting: codeResult.isExisting,
					});

					// Retourner le thread avec le code secret généré
					const response = {
						success: true,
						thread: newThread,
						secretCode: codeResult.secretCode,
						isFirstPublication: true,
					};

					return response;
				} else {
					// Ne pas bloquer la création du thread si la génération échoue
					logger.error("Secret code generation failed but thread created", {
						userId: session.user.id,
						error: codeResult.error,
					});
				}
			}
		}

		return { success: true, thread: newThread };
	});
