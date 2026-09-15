import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { verifyPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { account, user } from "@/db/schema";
import { auth } from "@/features/auth/lib/auth";
import { eraseBetaAccountSchema } from "@/features/beta/schemas/erase-account";
import {
	hasSupportedOAuthAccount,
	isRecentAuthentication,
} from "./erase-account-auth";

export const eraseBetaAccount = createServerFn({ method: "POST" })
	.validator(eraseBetaAccountSchema)
	.handler(async ({ data }) => {
		const { eraseAccountRecords } = await import("./erase-account-records");
		const session = await auth.api.getSession({
			headers: getRequest().headers,
			query: { disableCookieCache: true },
		});
		if (!session?.user)
			throw new Error("Reconnectez-vous avant de supprimer votre compte.");
		const [owner] = await db
			.select()
			.from(user)
			.where(eq(user.id, session.user.id));
		if (!owner) throw new Error("Cette session n’existe plus.");
		if (!owner.isAnonymous) {
			const ownerAccounts = await db
				.select()
				.from(account)
				.where(eq(account.userId, owner.id));
			const credential = ownerAccounts.find(
				(candidate) => candidate.providerId === "credential",
			);
			if (credential) {
				if (
					!credential.password ||
					!data.password ||
					!(await verifyPassword({
						hash: credential.password,
						password: data.password,
					}))
				) {
					throw new Error("Le mot de passe n’a pas pu être vérifié.");
				}
			} else {
				if (
					!hasSupportedOAuthAccount(
						ownerAccounts.map((candidate) => candidate.providerId),
					) ||
					!isRecentAuthentication(session.session.createdAt)
				) {
					throw new Error(
						"Reconnectez-vous avec Google ou GitHub, puis revenez ici dans les dix minutes pour confirmer l’effacement.",
					);
				}
			}
		}
		await eraseAccountRecords(owner.id);
		return { success: true };
	});
