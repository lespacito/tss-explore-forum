import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { alias } from "@/db/schemas/alias";
import { user } from "@/db/schemas/user";
import { threads } from "../../../db/schemas/thread";

const getThreadBySlugSchema = z.object({
	slug: z.string().min(1, "Slug is required"),
});

export const getThreadBySlugFn = createServerFn({ method: "GET" })
	.inputValidator((data: unknown) => getThreadBySlugSchema.parse(data))
	.handler(async ({ data }) => {
		const [thread] = await db
			.select({
				id: threads.id,
				title: threads.title,
				body: threads.body,
				slug: threads.slug,
				category: threads.category,
				createdAt: threads.createdAt,
				updatedAt: threads.updatedAt,
				aliasName: alias.alias,
				aliasId: alias.id,
				displayUsername: user.displayUsername,
			})
			.from(threads)
			.leftJoin(alias, eq(threads.aliasId, alias.id))
			.leftJoin(user, eq(alias.userId, user.id))
			.where(eq(threads.slug, data.slug))
			.limit(1);

		if (!thread) {
			throw new Error("Thread not found");
		}

		return thread;
	});
