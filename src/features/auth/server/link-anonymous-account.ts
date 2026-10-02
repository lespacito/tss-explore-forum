import { createServerFn } from "@tanstack/react-start";
import { getRequest, getRequestIP } from "@tanstack/react-start/server";
import { asc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { alias } from "@/db/schemas/alias";
import { account, session as sessionTable, user } from "@/db/schemas/user";
import { auth } from "@/features/auth/lib/auth";
import { protectAuthEndpoint } from "@/features/auth/lib/security/arcjet-policies";
import { consumeLinkAttempt } from "@/features/auth/lib/security/link-attempt-limiter";
import { getAuthSession } from "@/features/auth/server/get-auth-session";
import { logger } from "@/lib/logger/server";

/** Both accounts must be proven: the anonymous session and destination password.
 * This transfers content, not a session; email verification remains required.
 * The source account/code is retained, but cannot recover transferred aliases.
 */
export const linkAnonymousAccountFn = createServerFn({ method: "POST" })
	.validator(
		z.object({
			email: z.email().max(254),
			password: z.string().min(1).max(128),
		}),
	)
	.handler(async ({ data }) => {
		const session = await getAuthSession();
		if (!session.isAuthenticated || !session.user?.isAnonymous) {
			return {
				success: false,
				error: "Une session anonyme est requise pour lier vos publications",
			};
		}
		try {
			if (
				!consumeLinkAttempt(data.email, getRequestIP({ xForwardedFor: false }))
			) {
				return {
					success: false,
					error:
						"Liaison temporairement indisponible. Veuillez réessayer plus tard.",
				};
			}
			const decision = await protectAuthEndpoint({
				request: getRequest(),
				path: "/auth/link-anonymous",
			});
			if (decision.isDenied() || decision.isErrored()) {
				return {
					success: false,
					error:
						"Liaison temporairement indisponible. Veuillez réessayer plus tard.",
				};
			}
			const context = await auth.$context;
			// internalAdapter's base-user type omits fields supplied by installed plugins.
			const source = (await context.internalAdapter.findUserById(
				session.user.id,
			)) as {
				id: string;
				isAnonymous?: boolean;
				banned?: boolean;
				role?: string;
			} | null;
			if (!source?.isAnonymous || source.banned || source.role === "BANNED")
				return { success: false, error: "Identifiants invalides" };
			const destination = await context.internalAdapter.findUserByEmail(
				data.email.toLowerCase(),
				{ includeAccounts: true },
			);
			const target = destination?.user as
				| { id: string; isAnonymous?: boolean; banned?: boolean; role?: string }
				| undefined;
			const credential = destination?.accounts.find(
				(account) => account.providerId === "credential",
			);
			if (
				!destination ||
				!target ||
				target.isAnonymous ||
				target.banned ||
				target.role === "BANNED" ||
				target.id === source.id ||
				!credential?.password ||
				!(await context.password.verify({
					hash: credential.password,
					password: data.password,
				}))
			) {
				return { success: false, error: "Identifiants invalides" };
			}
			return await db.transaction(async (tx) => {
				// Every linkage touching either owner acquires user locks in the same order.
				const owners = await tx
					.select()
					.from(user)
					.where(inArray(user.id, [source.id, target.id]))
					.orderBy(asc(user.id))
					.for("update");
				const freshSource = owners.find((owner) => owner.id === source.id);
				const freshTarget = owners.find((owner) => owner.id === target.id);
				if (
					!freshSource?.isAnonymous ||
					freshSource.banned ||
					freshSource.role === "BANNED" ||
					!freshTarget ||
					freshTarget.isAnonymous ||
					freshTarget.banned ||
					freshTarget.role === "BANNED" ||
					freshTarget.email.toLowerCase() !== data.email.toLowerCase()
				) {
					return { success: false, error: "Identifiants invalides" };
				}
				const [freshCredential] = await tx
					.select()
					.from(account)
					.where(eq(account.id, credential.id))
					.for("update");
				if (
					!freshCredential ||
					freshCredential.userId !== target.id ||
					freshCredential.providerId !== "credential" ||
					freshCredential.password !== credential.password
				) {
					return { success: false, error: "Identifiants invalides" };
				}
				const [freshSession] = await tx
					.select()
					.from(sessionTable)
					.where(eq(sessionTable.id, session.session?.id || ""))
					.for("update");
				if (
					!freshSession ||
					freshSession.userId !== source.id ||
					freshSession.token !== session.session?.token ||
					freshSession.expiresAt.getTime() <= Date.now()
				) {
					return { success: false, error: "Identifiants invalides" };
				}
				const ownedAliases = await tx
					.select()
					.from(alias)
					.where(inArray(alias.userId, [source.id, target.id]))
					.orderBy(asc(alias.id))
					.for("update");
				const primary =
					ownedAliases.find(
						(row) => row.userId === target.id && row.isPrimary,
					) ??
					ownedAliases.find(
						(row) => row.userId === source.id && row.isPrimary,
					) ??
					ownedAliases[0];
				if (!primary)
					return { success: false, error: "Aucune publication à lier" };
				const updatedAliases = await tx
					.update(alias)
					.set({ userId: destination.user.id })
					.where(eq(alias.userId, source.id))
					.returning();
				await tx
					.update(alias)
					.set({ isPrimary: sql`${alias.id} = ${primary.id}` })
					.where(eq(alias.userId, target.id))
					.returning();
				return { success: true, linkedPostsCount: updatedAliases.length };
			});
		} catch {
			// Never log credentials or provider exceptions that could include them.
			logger.error("Failed to link anonymous account", {});
			return { success: false, error: "Erreur lors de la liaison du compte" };
		}
	});
