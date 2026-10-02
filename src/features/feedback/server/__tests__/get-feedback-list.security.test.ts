import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ session: vi.fn(), query: vi.fn() }));
vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => {
		const builder = {
			validator: () => builder,
			handler: (handler: unknown) => handler,
		};
		return builder;
	},
}));
vi.mock("@/db", () => ({ db: {} }));
vi.mock("@/features/auth/server/get-auth-session", () => ({ getAuthSession: mocks.session }));
vi.mock("../db/feedback-queries", () => ({ getFeedbackList: mocks.query }));

import { getFeedbackListFn } from "../get-feedback-list";
const readFeedback = getFeedbackListFn as unknown as () => Promise<unknown>;

describe("feedback server authorization boundary", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.query.mockResolvedValue([{ id: "feedback", experience: "fictitious" }]);
	});

	it.each([null, { role: "USER", banned: false }, { role: "BANNED", banned: false },
		{ role: "MODERATOR", banned: true }, { role: "ADMIN", banned: true }])(
		"denies unauthorized users before reading any feedback: %j", async (user) => {
			mocks.session.mockResolvedValue({ user });
			await expect(readFeedback()).rejects.toThrow("Accès réservé à la modération");
			expect(mocks.query).not.toHaveBeenCalled();
		},
	);

	it.each(["ADMIN", "MODERATOR"])("allows an unbanned %s", async (role) => {
		mocks.session.mockResolvedValue({ user: { role, banned: false } });
		await expect(readFeedback()).resolves.toEqual([{ id: "feedback", experience: "fictitious" }]);
		expect(mocks.query).toHaveBeenCalledOnce();
	});
});
