import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { verifyPassword } from "better-auth/crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { account, user } from "@/db/schema";
import { auth } from "@/features/auth/lib/auth";

export const eraseBetaAccount = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			confirmation: z.literal("EFFACER"),
			password: z.string().max(256).optional(),
		}),
	)
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
			const [credential] = await db
				.select()
				.from(account)
				.where(
					and(
						eq(account.userId, owner.id),
						eq(account.providerId, "credential"),
					),
				);
			if (
				!credential?.password ||
				!data.password ||
				!(await verifyPassword({
					hash: credential.password,
					password: data.password,
				}))
			) {
				throw new Error(
					"Le mot de passe n’a pas pu être vérifié. Contactez l’organisateur si votre compte utilise une connexion externe.",
				);
			}
		}
		await eraseAccountRecords(owner.id);
		return { success: true };
	});
