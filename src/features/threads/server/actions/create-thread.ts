import { createServerFn } from "@tanstack/react-start";
import type { ThreadCategory } from "@/data/threads-categories";
import { getPrimaryAlias } from "@/features/alias/lib/get-primary-alias";
import {
	checkArcjet,
	handleArcjetDenied,
} from "@/features/auth/lib/security/protected-server-fn";
import { generateSecretCodeLogic } from "@/features/auth/server/generate-secret-code-logic";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { betaSettings } from "@/features/beta/server/settings";
import { createThreadSchema } from "@/features/threads/schemas/create-thread";
import { getUserById } from "@/features/users/server/db/user-queries";
import { logger } from "@/lib/logger/server";
import { validateAndSanitize } from "@/lib/security/sanitize-html";
import { generateUniqueSlug } from "@/lib/utils/slug-utils";
import { createThreadRecord, getThreadsByAliasId } from "../db/thread-queries";

export const createThreadFn = createServerFn({ method: "POST" })
	.validator((data: unknown) => createThreadSchema.parse(data))
	.handler(async ({ data }) => {
		if (!betaSettings().submissionsOpen)
			throw new Error(
				"L’envoi de scénarios est suspendu. Consultez les informations de l’organisateur.",
			);
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

		const title = data.title;
		const body = data.body.trim();
		const category = (data.category ?? null) as ThreadCategory | null;

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

		const isFirstScenario = existingThreads.length === 0;
		const needsRecoveryCode =
			isFirstScenario && currentUser?.isAnonymous === true;
		const codeResult = needsRecoveryCode
			? await generateSecretCodeLogic(session)
			: null;

		if (codeResult && !codeResult.success) {
			logger.error("Recovery code generation failed before scenario creation", {
				userId: session.user.id,
				error: codeResult.error,
			});
			return {
				success: false,
				error:
					"Votre scénario n’a pas été envoyé. Réessayez pour obtenir un code de récupération valide.",
			};
		}

		const newThread = await createThreadRecord({
			aliasId: primaryAlias.id,
			title,
			body: sanitizedBody,
			category,
			slug,
			status: "pending",
		});

		if (codeResult?.success) {
			logger.info("Recovery code ready for first scenario", {
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

		return { success: true, thread: newThread };
	});
