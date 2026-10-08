import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	arcjet: vi.fn(),
	session: vi.fn(),
	alias: vi.fn(),
	user: vi.fn(),
	threads: vi.fn(),
	create: vi.fn(),
	code: vi.fn(),
}));
// Run the actual server handler without HTTP transport or a live database.
vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => ({
		validator: () => ({ handler: (handler: unknown) => handler }),
		handler: (handler: unknown) => handler,
	}),
}));
vi.mock("@/features/auth/lib/security/protected-server-fn", () => ({
	checkArcjet: mocks.arcjet,
	handleArcjetDenied: () => ({ success: false, error: "blocked" }),
}));
vi.mock("@/features/auth/server/get-auth-session", () => ({
	getAuthSession: mocks.session,
}));
vi.mock("@/features/alias/lib/get-primary-alias", () => ({
	getPrimaryAlias: mocks.alias,
}));
vi.mock("@/features/users/server/db/user-queries", () => ({
	getUserById: mocks.user,
}));
vi.mock("../db/thread-queries", () => ({
	createThreadRecord: mocks.create,
	getUserThreads: mocks.threads,
}));
vi.mock("@/features/auth/server/generate-secret-code-logic", () => ({
	generateSecretCodeLogic: mocks.code,
}));
vi.mock("@/lib/logger/server", () => ({
	logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { createThreadFn } from "../actions/create-thread";

const data = {
	title: "Scénario fictif",
	body: "<p>Un contenu fictif suffisamment détaillé.</p>",
};

beforeEach(() => {
	vi.clearAllMocks();
	vi.stubEnv("BETA_ACCESS_REQUIRED", "false");
	vi.stubEnv("BETA_SUBMISSIONS_OPEN", "true");
	vi.stubEnv("BETA_MODERATION_SCHEDULE", "Lundi 18–19 h");
	mocks.arcjet.mockResolvedValue({ isDenied: () => false });
	mocks.session.mockResolvedValue({
		user: { id: "private-user-id", isAnonymous: true },
	});
	mocks.alias.mockResolvedValue({ id: "public-alias-id" });
	mocks.user.mockResolvedValue({ isAnonymous: true });
	mocks.threads.mockResolvedValue([]);
	mocks.code.mockResolvedValue({ success: true, secretCode: "ABCD-EFGH-JKLM" });
	mocks.create.mockResolvedValue({
		id: "thread",
		status: "pending",
		aliasId: "public-alias-id",
	});
});
afterEach(() => vi.unstubAllEnvs());

describe.each(["test", "real"])(
	"contribution boundaries in %s publication mode",
	(mode) => {
		beforeEach(() => vi.stubEnv("PUBLICATION_MODE", mode));
		it.each(["false", "", "TRUE"])(
			"refuses writes when submissions flag is %s",
			async (flag) => {
				vi.stubEnv("BETA_SUBMISSIONS_OPEN", flag);
				await expect(createThreadFn({ data })).rejects.toThrow("suspendu");
				expect(mocks.arcjet).not.toHaveBeenCalled();
				expect(mocks.create).not.toHaveBeenCalled();
			},
		);
		it("refuses writes without a moderation schedule", async () => {
			vi.stubEnv("BETA_MODERATION_SCHEDULE", " ");
			await expect(createThreadFn({ data })).rejects.toThrow("suspendu");
			expect(mocks.create).not.toHaveBeenCalled();
		});
		it("still requires an authenticated session", async () => {
			mocks.session.mockResolvedValue(null);
			await expect(createThreadFn({ data })).rejects.toThrow("Unauthorized");
			expect(mocks.create).not.toHaveBeenCalled();
		});
		it("still respects Arcjet denial", async () => {
			mocks.arcjet.mockResolvedValue({ isDenied: () => true });
			await expect(createThreadFn({ data })).resolves.toEqual({
				success: false,
				error: "blocked",
			});
			expect(mocks.session).not.toHaveBeenCalled();
			expect(mocks.create).not.toHaveBeenCalled();
		});
		it("keeps anonymous submissions pending and linked only to their alias", async () => {
			await expect(createThreadFn({ data })).resolves.toMatchObject({
				success: true,
				secretCode: "ABCD-EFGH-JKLM",
			});
			expect(mocks.code).toHaveBeenCalled();
			expect(mocks.create).toHaveBeenCalledWith(
				expect.objectContaining({
					aliasId: "public-alias-id",
					status: "pending",
				}),
			);
			expect(mocks.create.mock.calls[0][0]).not.toHaveProperty("userId");
			expect(mocks.code.mock.invocationCallOrder[0]).toBeLessThan(
				mocks.create.mock.invocationCallOrder[0],
			);
		});
		it("does not write if the anonymous recovery code cannot be prepared", async () => {
			mocks.code.mockResolvedValue({ success: false, error: "unavailable" });
			await expect(createThreadFn({ data })).resolves.toMatchObject({
				success: false,
			});
			expect(mocks.create).not.toHaveBeenCalled();
		});
	},
);
