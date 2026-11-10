import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getModerationQueueFn, moderateThreadFn } from "../thread-moderation";

const mocks = vi.hoisted(() => ({
	getSession: vi.fn(),
	transaction: vi.fn(),
	select: vi.fn(),
	update: vi.fn(),
	log: vi.fn(),
	queue: vi.fn(),
	updatePayload: undefined as unknown,
}));
vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => {
		let validate = (input: unknown) => input;
		const builder = {
			validator: (fn: typeof validate) => {
				validate = fn;
				return builder;
			},
			handler:
				(fn: (input: { data: unknown }) => unknown) =>
				(input?: { data: unknown }) =>
					fn({ data: validate(input?.data) }),
		};
		return builder;
	},
}));
vi.mock("@/db", () => ({
	db: { transaction: mocks.transaction, select: mocks.queue },
}));
vi.mock("@/features/auth/server/get-auth-session", () => ({
	getAuthSession: mocks.getSession,
}));

afterEach(() => vi.unstubAllEnvs());

const threadId = "46cc031d-7a75-4cf0-88c6-6aac14dd80f7";
const reject = async (reasonCode: string, extra = {}) =>
	moderateThreadFn({
		data: {
			threadId,
			action: "reject",
			reasonCode,
			...extra,
		} as never,
	});

beforeEach(() => {
	vi.clearAllMocks();
	vi.stubEnv("PUBLICATION_MODE", "real");
	mocks.getSession.mockResolvedValue({
		user: { id: "moderator-1", role: "MODERATOR", banned: false },
	});
	mocks.select.mockResolvedValue([
		{ id: threadId, status: "pending", isSensitive: false },
	]);
	mocks.update.mockResolvedValue([
		{ id: threadId, status: "rejected", isSensitive: false },
	]);
	mocks.transaction.mockImplementation(async (callback) =>
		callback({
			select: () => ({
				from: () => ({ where: () => ({ limit: mocks.select }) }),
			}),
			update: () => ({
				set: (value: unknown) => {
					mocks.updatePayload = value;
					return { where: () => ({ returning: mocks.update }) };
				},
			}),
			insert: () => ({ values: mocks.log }),
		}),
	);
});

describe("server moderation publication mode", () => {
	it.each([null, { role: "USER" }, { role: "MODERATOR", banned: true }])(
		"guards both server functions before database access for %j",
		async (user) => {
			mocks.getSession.mockResolvedValue({ user });
			await expect(reject("OUT_OF_SCOPE")).rejects.toThrow(
				"Accès réservé à la modération",
			);
			await expect(getModerationQueueFn()).rejects.toThrow(
				"Accès réservé à la modération",
			);
			expect(mocks.transaction).not.toHaveBeenCalled();
			expect(mocks.queue).not.toHaveBeenCalled();
		},
	);

	it("returns historical reasons verbatim in real mode without writes", async () => {
		const historicalReason =
			"Cette situation fictive semble décrire une situation réelle ou urgente, hors du cadre fictif de cette bêta. Précision historique.";
		mocks.queue.mockReturnValue({
			from: () => ({
				innerJoin: () => ({
					where: () => ({
						orderBy: async () => [
							{
								id: threadId,
								rejectionReason: historicalReason,
								createdAt: new Date("2026-09-10"),
								moderatedAt: null,
							},
						],
					}),
				}),
			}),
		});
		expect(await getModerationQueueFn()).toEqual([
			expect.objectContaining({ rejectionReason: historicalReason }),
		]);
		expect(mocks.transaction).not.toHaveBeenCalled();
	});

	it.each(["test", "real"] as const)(
		"stores exactly the displayed labels and trimmed clarification in %s mode",
		async (mode) => {
			vi.stubEnv("PUBLICATION_MODE", mode);
			const { getModerationReasons } = await import(
				"../../lib/moderation-reasons"
			);
			for (const { code, label } of getModerationReasons(mode)) {
				await reject(code, { details: "  Précision utile.  " });
				expect(mocks.updatePayload).toMatchObject({
					rejectionReason: `${label} Précision utile.`,
				});
				expect(mocks.log).toHaveBeenLastCalledWith(
					expect.objectContaining({ reason: `${label} Précision utile.` }),
				);
			}
		},
	);

	it.each([undefined, "unexpected"])(
		"defaults server mode to test for %s",
		async (value) => {
			vi.stubEnv("PUBLICATION_MODE", value);
			await reject("REAL_OR_URGENT");
			await expect(reject("URGENT")).rejects.toThrow(
				"Motif indisponible dans ce mode de publication.",
			);
		},
	);

	it("does not update or log when the thread is missing", async () => {
		mocks.select.mockResolvedValue([]);
		await expect(reject("OUT_OF_SCOPE")).rejects.toThrow(
			"Publication introuvable",
		);
		expect(mocks.update).not.toHaveBeenCalled();
		expect(mocks.log).not.toHaveBeenCalled();
	});

	it("rejects the test-only reason in real mode even when a caller supplies test mode", async () => {
		await expect(
			reject("REAL_OR_URGENT", { publicationMode: "test" }),
		).rejects.toThrow("Motif indisponible dans ce mode de publication.");
		expect(mocks.transaction).not.toHaveBeenCalled();
	});

	it("accepts a distinct urgent reason in real mode and directs to help resources", async () => {
		await reject("URGENT");
		expect(mocks.updatePayload).toMatchObject({
			rejectionReason:
				"Ce témoignage décrit une situation urgente qui ne peut pas être traitée dans cet espace. Consultez les ressources d’aide de la page Aide (/help).",
		});
	});

	it("rejects the urgent-only reason in test mode even when a caller supplies real mode", async () => {
		vi.stubEnv("PUBLICATION_MODE", "test");
		await expect(reject("URGENT", { publicationMode: "real" })).rejects.toThrow(
			"Motif indisponible dans ce mode de publication.",
		);
		expect(mocks.transaction).not.toHaveBeenCalled();
	});

	it("retains the existing test-only reason verbatim", async () => {
		vi.stubEnv("PUBLICATION_MODE", "test");
		await reject("REAL_OR_URGENT");
		expect(mocks.updatePayload).toMatchObject({
			rejectionReason:
				"Cette situation fictive semble décrire une situation réelle ou urgente, hors du cadre fictif de cette bêta.",
		});
	});
	it("stores a real-mode reason in the thread and audit log without fictitious restrictions", async () => {
		await reject("OUT_OF_SCOPE");
		expect(mocks.updatePayload).toMatchObject({
			status: "rejected",
			rejectionReason:
				"Ce témoignage ne correspond pas au périmètre de cet espace.",
		});
		expect(mocks.log).toHaveBeenCalledWith(
			expect.objectContaining({
				reason: "Ce témoignage ne correspond pas au périmètre de cet espace.",
			}),
		);
	});
});
