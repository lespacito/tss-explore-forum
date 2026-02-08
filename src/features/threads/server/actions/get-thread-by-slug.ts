import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getThreadBySlug } from "../db/thread-queries";

const getThreadBySlugSchema = z.object({
	slug: z.string().min(1, "Slug is required"),
});

/**
 * Server function to get a thread by its slug
 * Pure orchestration - validates input and delegates to DB layer
 */
export const getThreadBySlugFn = createServerFn({ method: "GET" })
	.inputValidator((data: unknown) => getThreadBySlugSchema.parse(data))
	.handler(async ({ data }) => {
		const thread = await getThreadBySlug(data.slug);

		if (!thread) {
			throw new Error("Thread not found");
		}

		return thread;
	});
