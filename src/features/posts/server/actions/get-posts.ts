import { createServerFn } from "@tanstack/react-start";
import { getAllPosts } from "../db/post-queries";

/**
 * Server function to get all posts
 * Pure orchestration - delegates to DB layer
 */
export const getPostsFn = createServerFn({ method: "GET" }).handler(
	async () => {
		return await getAllPosts();
	},
);
