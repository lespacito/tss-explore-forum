import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { alias, moderationLogs, threads } from "@/db/schema";
import type { User } from "@/features/auth/lib/map-auth-user";
import { getAuthSession } from "@/features/auth/server/get-auth-session";

const moderatorRoles = new Set(["ADMIN", "MODERATOR"]);

export type ModerationQueueItem = {
	id: string;
	title: string;
	body: string;
	category: string;
	status: "pending" | "published" | "rejected";
	isSensitive: boolean;
	rejectionReason: string | null;
	createdAt: string;
	moderatedAt: string | null;
	aliasName: string;
};

export const moderationActionSchema = z
	.object({
		threadId: z.string().uuid(),
		action: z.enum(["publish", "reject", "mark_sensitive", "unmark_sensitive"]),
		reason: z.string().trim().max(500).optional(),
	})
	.superRefine((value, context) => {
		if (value.action === "reject" && (value.reason?.length ?? 0) < 10) {
			context.addIssue({
				code: "custom",
				path: ["reason"],
				message: "Le motif de rejet doit contenir au moins 10 caractères.",
			});
		}
	});

export function assertModerator(
	user: User | null | undefined,
): asserts user is User {
	if (!user || !moderatorRoles.has(user.role)) {
		throw new Error("Accès réservé à la modération");
	}
}

export const getModerationQueueFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const session = await getAuthSession();
		assertModerator(session.user);

		const queue = await db
			.select({
				id: threads.id,
				title: threads.title,
				body: threads.body,
				category: threads.category,
				status: threads.status,
				isSensitive: threads.isSensitive,
				rejectionReason: threads.rejectionReason,
				createdAt: threads.createdAt,
				moderatedAt: threads.moderatedAt,
				aliasName: alias.alias,
			})
			.from(threads)
			.innerJoin(alias, eq(threads.aliasId, alias.id))
			.where(isNull(threads.deletedAt))
			.orderBy(desc(threads.createdAt));

		return queue.map((thread) => ({
			...thread,
			aliasName: thread.aliasName || "Anonyme",
			createdAt: thread.createdAt.toISOString(),
			moderatedAt: thread.moderatedAt?.toISOString() ?? null,
		}));
	},
);

export const moderateThreadFn = createServerFn({ method: "POST" })
	.validator((input: unknown) => moderationActionSchema.parse(input))
	.handler(async ({ data }) => {
		const session = await getAuthSession();
		assertModerator(session.user);
		const moderator = session.user;

		return db.transaction(async (transaction) => {
			const [currentThread] = await transaction
				.select({
					id: threads.id,
					status: threads.status,
					isSensitive: threads.isSensitive,
				})
				.from(threads)
				.where(and(eq(threads.id, data.threadId), isNull(threads.deletedAt)))
				.limit(1);

			if (!currentThread) {
				throw new Error("Publication introuvable");
			}

			const now = new Date();
			const update =
				data.action === "publish"
					? {
							status: "published" as const,
							rejectionReason: null,
							moderatedAt: now,
							moderatorId: moderator.id,
						}
					: data.action === "reject"
						? {
								status: "rejected" as const,
								rejectionReason: data.reason,
								moderatedAt: now,
								moderatorId: moderator.id,
							}
						: {
								isSensitive: data.action === "mark_sensitive",
								moderatedAt: now,
								moderatorId: moderator.id,
							};

			const [updatedThread] = await transaction
				.update(threads)
				.set(update)
				.where(eq(threads.id, data.threadId))
				.returning({
					id: threads.id,
					status: threads.status,
					isSensitive: threads.isSensitive,
				});

			await transaction.insert(moderationLogs).values({
				moderatorId: moderator.id,
				action: data.action,
				targetId: data.threadId,
				reason: data.reason || null,
			});

			return updatedThread;
		});
	});
