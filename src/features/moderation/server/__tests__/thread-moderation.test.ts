import { describe, expect, it } from "vitest";
import type { User } from "@/features/auth/lib/map-auth-user";
import { assertModerator, moderationActionSchema } from "../thread-moderation";

function userWithRole(role: User["role"]): User {
	return {
		id: "user-1",
		name: "Test",
		email: "test@example.com",
		emailVerified: true,
		image: null,
		role,
		username: "test",
		displayUsername: "Test",
		isAnonymous: false,
		bio: null,
		banned: false,
		secretCode: null,
		secretCodeGeneratedAt: null,
		createdAt: new Date(),
		updatedAt: new Date(),
	};
}

describe("thread moderation authorization", () => {
	it.each(["ADMIN", "MODERATOR"] as const)("allows the %s role", (role) => {
		expect(() => assertModerator(userWithRole(role))).not.toThrow();
	});

	it.each(["USER", "BANNED"] as const)("rejects the %s role", (role) => {
		expect(() => assertModerator(userWithRole(role))).toThrow(
			"Accès réservé à la modération",
		);
	});

	it("rejects an unauthenticated user", () => {
		expect(() => assertModerator(null)).toThrow(
			"Accès réservé à la modération",
		);
	});
});

describe("moderation action validation", () => {
	const threadId = "46cc031d-7a75-4cf0-88c6-6aac14dd80f7";

	it("accepts publication without a reason", () => {
		expect(
			moderationActionSchema.parse({ threadId, action: "publish" }),
		).toMatchObject({ threadId, action: "publish" });
	});

	it("requires a useful rejection reason", () => {
		expect(() =>
			moderationActionSchema.parse({
				threadId,
				action: "reject",
				reason: "Court",
			}),
		).toThrow("Le motif de rejet doit contenir au moins 10 caractères.");
	});

	it("accepts a clear rejection reason", () => {
		expect(
			moderationActionSchema.parse({
				threadId,
				action: "reject",
				reason:
					"Le contenu révèle une information permettant l’identification.",
			}),
		).toMatchObject({ action: "reject" });
	});
});
