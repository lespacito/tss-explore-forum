import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { logger } from "@/lib/logger/server";

export const getUserEmailByUsername = createServerFn({
	method: "GET",
})
	.inputValidator((data: { username: string }) => data)
	.handler(
		async ({
			data,
		}): Promise<{
			email: string | null;
			error?: string;
		}> => {
			try {
				const { username } = data;

				if (!username || typeof username !== "string") {
					return {
						email: null,
						error: "Username is required",
					};
				}

				// Rechercher l'utilisateur par username
				const foundUser = await db.query.user.findFirst({
					where: eq(user.username, username),
					columns: {
						email: true,
					},
				});

				if (!foundUser) {
					return {
						email: null,
						error: "User not found",
					};
				}

				return {
					email: foundUser.email,
				};
			} catch (error) {
				logger.error("Error fetching user email by username", { error });
				return {
					email: null,
					error: "Failed to fetch user email",
				};
			}
		},
	);
