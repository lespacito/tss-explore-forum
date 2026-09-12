import { betaSettings } from "@/features/beta/server/settings";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ThreadCategory } from "@/data/threads-categories";
import { getPrimaryAlias } from "@/features/alias/lib/get-primary-alias";
import {
	checkArcjet,
	handleArcjetDenied,
} from "@/features/auth/lib/security/protected-server-fn";
import { generateSecretCodeLogic } from "@/features/auth/server/generate-secret-code-logic";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { getUserById } from "@/features/users/server/db/user-queries";
import { logger } from "@/lib/logger/server";
import { validateAndSanitize } from "@/lib/security/sanitize-html";
import { generateUniqueSlug } from "@/lib/utils/slug-utils";
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
	category: z.enum(["VIOLENCE", "ABUS", "TEMOIN", "DETRESSE", "AUTRE"]),
});

export const createThreadFn = createServerFn({ method: "POST" })
	.validator((data: unknown) => createThreadSchema.parse(data))
	.handler(async ({ data }) => {
 if (!betaSettings().submissionsOpen) throw new Error("Les dépôts sont suspendus. Consultez les informations de l’organisateur.");
		const decision = await checkArcjet({
			path: "/threads/create",
		});

		if (decision.isDenied()) {
			return handleArcjetDenied(decision);
		}

		const session = await getAuthSession();
		if (!session?.user) {
			throw new Error("Unauthorized");
		}

		const primaryAlias = await getPrimaryAlias(session.user.id);

		if (!primaryAlias) {
			throw new Error(
				"Aucun alias trouvé pour cet utilisateur. Veuillez contacter le support.",
			);
		}

		const title = data.title.trim();
		const body = data.body.trim();
		const category = data.category as ThreadCategory;

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
		const slug = generateUniqueSlug(title);

		const [existingThreads, currentUser] = await Promise.all([
			getThreadsByAliasId(primaryAlias.id),
			getUserById(session.user.id),
		]);

		const isFirstPublication = existingThreads.length === 0;

		const newThread = await createThreadRecord({
			aliasId: primaryAlias.id,
			title,
			body: sanitizedBody,
			category,
			slug,
			status: "pending",
		});

		if (isFirstPublication && currentUser?.isAnonymous === true) {
			const codeResult = await generateSecretCodeLogic(session);

			if (codeResult.success) {
				logger.info("Secret code generated for first publication", {
					userId: session.user.id,
					isExisting: codeResult.isExisting,
				});

				return {
					success: true,
					thread: newThread,
					secretCode: codeResult.secretCode,
					isFirstPublication: true,
				};
			}

			logger.error("Secret code generation failed but thread created", {
				userId: session.user.id,
				error: codeResult.error,
			});
		}

		return { success: true, thread: newThread };
	});
