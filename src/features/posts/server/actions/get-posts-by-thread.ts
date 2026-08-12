import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getPostsByThreadId } from "../db/post-queries";

const getPostsByThreadSchema = z.object({
	threadId: z.string().uuid("Thread ID must be a valid UUID"),
});

/**
 * Server function to get posts by thread ID
 * Pure orchestration - validates input and delegates to DB layer
 */
export const getPostsByThreadFn = createServerFn({ method: "GET" })
	.inputValidator((data: unknown) => getPostsByThreadSchema.parse(data))
	.handler(async ({ data }) => {
		return await getPostsByThreadId(data.threadId);
	});
