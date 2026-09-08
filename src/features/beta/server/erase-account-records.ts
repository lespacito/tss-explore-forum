import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
	alias,
	comments,
	moderationLogs,
	posts,
	threads,
	user,
} from "@/db/schema";
export async function eraseAccountRecords(
	userId: string,
	database: typeof db = db,
) {
	return database.transaction(async (tx) => {
		// Serialize erasure against account changes; all content removal is atomic.
		const [owner] = await tx
			.select({ id: user.id })
			.from(user)
			.where(eq(user.id, userId))
			.for("update");
		if (!owner) throw new Error("Cette session n’existe plus.");
		const aliases = await tx
			.select({ id: alias.id })
			.from(alias)
			.where(eq(alias.userId, userId));
		const ids = aliases.map((a) => a.id);
		if (ids.length) {
			const content = await Promise.all([
				tx
					.select({ id: threads.id })
					.from(threads)
					.where(inArray(threads.aliasId, ids)),
				tx
					.select({ id: posts.id })
					.from(posts)
					.where(inArray(posts.aliasId, ids)),
				tx
					.select({ id: comments.id })
					.from(comments)
					.where(inArray(comments.aliasId, ids)),
			]);
			const targets = content.flat().map((item) => item.id);
			if (targets.length)
				await tx
					.delete(moderationLogs)
					.where(inArray(moderationLogs.targetId, targets));
		}
		// Versioned FKs cascade to aliases/content and all sessions/accounts.
		await tx.delete(user).where(eq(user.id, userId));
	});
}
