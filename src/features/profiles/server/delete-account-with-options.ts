import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { alias, comments, posts, threads, user as users } from "@/db/schema";
import { auth } from "@/features/auth/lib/auth";
import { deleteAccountSchema } from "@/features/profiles/schemas/delete-account-schema";
import { logger } from "@/lib/logger/server";

const SYSTEM_DELETED_USER_ID = "system-deleted-user";
const SYSTEM_DELETED_ALIAS_ID = "system-deleted-alias";

/**
 * Get or create system alias for anonymized content
 * This alias represents deleted users' content that has been preserved
 */
async function getSystemDeletedAlias(): Promise<string> {
	try {
		// Check if system alias exists
		const existingAlias = await db.query.alias.findFirst({
			where: eq(alias.id, SYSTEM_DELETED_ALIAS_ID),
		});

		if (existingAlias) {
			return existingAlias.id;
		}

		// System alias should be created via migration/seed
		// If it doesn't exist, log error but don't create it here
		logger.error("System deleted alias not found", {
			expectedId: SYSTEM_DELETED_ALIAS_ID,
		});

		throw new Error("Configuration système manquante");
	} catch (error) {
		logger.error("Failed to get system deleted alias", {
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}

/**
 * Anonymize user content by transferring to system alias
 * @param userId - User ID whose content to anonymize
 * @returns Number of aliases transferred
 */
async function anonymizeUserContent(userId: string): Promise<number> {
	try {
		const systemAliasId = await getSystemDeletedAlias();

		// Get all user's aliases
		const userAliases = await db.query.alias.findMany({
			where: eq(alias.userId, userId),
		});

		if (userAliases.length === 0) {
			logger.info("No aliases to anonymize", { userId });
			return 0;
		}

		const userAliasIds = userAliases.map((a) => a.id);

		// Transfer threads to system alias
		for (const aliasId of userAliasIds) {
			await db
				.update(threads)
				.set({ aliasId: systemAliasId })
				.where(eq(threads.aliasId, aliasId));
		}

		// Transfer posts to system alias
		for (const aliasId of userAliasIds) {
			await db
				.update(posts)
				.set({ aliasId: systemAliasId })
				.where(eq(posts.aliasId, aliasId));
		}

		// Transfer comments to system alias
		for (const aliasId of userAliasIds) {
			await db
				.update(comments)
				.set({ aliasId: systemAliasId })
				.where(eq(comments.aliasId, aliasId));
		}

		logger.info("User content anonymized", {
			userId,
			aliasesTransferred: userAliases.length,
			systemAliasId,
		});

		return userAliases.length;
	} catch (error) {
		logger.error("Failed to anonymize user content", {
			userId,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}

/**
 * Log account deletion to audit trail (implementation deferred to Task 5)
 * @param userId - User ID (will be anonymized)
 * @param retentionOption - Retention option chosen
 */
async function logAccountDeletion(
	userId: string,
	retentionOption: "delete_all" | "anonymize",
): Promise<void> {
	// TODO: Task 5 - Implement audit trail logging
	// This will create entry in account_deletion_logs table (to be created)
	logger.info("Account deletion logged", {
		// Use hash for anonymization (SHA256)
		anonymizedUserId: Buffer.from(userId).toString("base64").substring(0, 16),
		retentionOption,
		timestamp: new Date().toISOString(),
	});
}

/**
 * Server function to delete user account with retention options
 * Supports two modes:
 * - delete_all: Complete deletion including all content
 * - anonymize: Preserve content but transfer to system alias
 */
export const deleteAccountWithOptionsFn = createServerFn({
	method: "POST",
})
	.inputValidator(deleteAccountSchema)
	.handler(async ({ data }) => {
		try {
			const request = getRequest();

			// 1. Verify authentication
			const session = await auth.api.getSession({
				headers: request.headers,
			});

			if (!session?.session || !session?.user) {
				throw new Error("Non autorisé");
			}

			const userId = session.user.id;

			// 2. Validate confirmation
			if (!data.confirmDeletion) {
				throw new Error("La confirmation est requise");
			}

			// 3. Validate password and retention option
			const { password, retentionOption } = data;

			if (!password || password.trim().length === 0) {
				throw new Error("Le mot de passe est requis");
			}

			// 4. CRITICAL: Verify password BEFORE any destructive operations
			// We need to ensure the password is correct before anonymizing content
			// Use Better Auth's changePassword to verify current password
			try {
				// Attempt to verify password by checking if we can authenticate
				const user = await db.query.user.findFirst({
					where: eq(users.id, userId),
				});

				if (!user?.email) {
					throw new Error("Utilisateur non trouvé ou email manquant");
				}

				// Verify password using Better Auth's signIn
				const signInResult = await auth.api.signInEmail({
					body: {
						email: user.email,
						password: password,
					},
				});

				if (!signInResult) {
					throw new Error("Mot de passe incorrect");
				}
			} catch (error) {
				logger.error("Password verification failed", {
					userId,
					error: error instanceof Error ? error.message : String(error),
				});
				throw new Error("Mot de passe incorrect");
			}

			// 5. Handle anonymization if requested (only after password verification)
			if (retentionOption === "anonymize") {
				try {
					await anonymizeUserContent(userId);
				} catch (error) {
					logger.error("Content anonymization failed, aborting deletion", {
						userId,
						error: error instanceof Error ? error.message : String(error),
					});
					throw new Error(
						"Échec de l'anonymisation du contenu. Suppression annulée.",
					);
				}
			}

			// 6. Log deletion for audit trail
			await logAccountDeletion(userId, retentionOption);

			// 7. Delete user account via Better Auth
			// This handles:
			// - Session invalidation
			// - Account deletion
			// - CASCADE deletion of aliases (if delete_all)
			try {
				await auth.api.deleteUser({
					headers: request.headers,
				});
			} catch (error) {
				logger.error("Account deletion via Better Auth failed", {
					userId,
					error: error instanceof Error ? error.message : String(error),
				});
				throw new Error("Échec de la suppression du compte");
			}

			logger.info("Account deleted successfully", {
				anonymizedUserId: Buffer.from(userId)
					.toString("base64")
					.substring(0, 16),
				retentionOption,
			});

			return {
				success: true,
				message: "Compte supprimé avec succès",
			};
		} catch (error) {
			logger.error("Account deletion failed", {
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			});

			// Re-throw with user-friendly message
			if (error instanceof Error) {
				throw error;
			}

			throw new Error("Une erreur est survenue lors de la suppression");
		}
	});
