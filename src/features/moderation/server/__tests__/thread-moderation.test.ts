import { describe, expect, it, vi } from "vitest";
import type { User } from "@/features/auth/lib/map-auth-user";
import {
	assertModerator,
	formatModerationReason,
	moderationActionSchema,
} from "../thread-moderation";

vi.mock("@/db", () => ({ db: {} }));
vi.mock("@/features/auth/server/get-auth-session", () => ({
	getAuthSession: vi.fn(),
}));

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

	it("rejects a banned moderator", () => {
		expect(() =>
			assertModerator({ ...userWithRole("MODERATOR"), banned: true }),
		).toThrow("Accès réservé à la modération");
	});

	it("rejects a banned admin", () => {
		expect(() =>
			assertModerator({ ...userWithRole("ADMIN"), banned: true }),
		).toThrow("Accès réservé à la modération");
	});
});

describe("moderation action validation", () => {
	const threadId = "46cc031d-7a75-4cf0-88c6-6aac14dd80f7";

	it("accepts publication without a reason", () => {
		expect(
			moderationActionSchema.parse({ threadId, action: "publish" }),
		).toMatchObject({ threadId, action: "publish" });
	});

	it("requires a predefined non-publication reason", () => {
		expect(() =>
			moderationActionSchema.parse({
				threadId,
				action: "reject",
			}),
		).toThrow("Choisissez un motif de non-publication.");
	});

	it("accepts a reason code and optional clarification", () => {
		expect(
			moderationActionSchema.parse({
				threadId,
				action: "reject",
				reasonCode: "IDENTIFYING_DETAIL",
				details: "Retirez le nom complet indiqué dans la deuxième phrase.",
			}),
		).toMatchObject({
			action: "reject",
			reasonCode: "IDENTIFYING_DETAIL",
		});
	});

	it("formats a participant-facing reason without exposing an internal code", () => {
		expect(
			formatModerationReason(
				"OUT_OF_SCOPE",
				"Utilisez uniquement la situation fictive fournie.",
			),
		).toBe(
			"Ce scénario ne correspond pas au périmètre de cette bêta. Utilisez uniquement la situation fictive fournie.",
		);
	});
});
