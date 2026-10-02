import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	select: vi.fn(),
	transaction: vi.fn(),
	lockedRows: {} as Record<string, Record<string, unknown>[]>,
	session: vi.fn(),
	update: vi.fn(),
	set: vi.fn(),
	where: vi.fn(),
	returning: vi.fn(),
	findUserById: vi.fn(),
	findUserByEmail: vi.fn(),
	verify: vi.fn(),
	hash: vi.fn(),
	protect: vi.fn(),
	consume: vi.fn(),
	ip: vi.fn(),
}));
vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => ({
		validator: (schema: { parse: (data: unknown) => unknown }) => ({
			handler:
				(handler: (input: { data: unknown }) => unknown) =>
				(input: { data: unknown }) =>
					handler({ data: schema.parse(input.data) }),
		}),
	}),
}));
vi.mock("@tanstack/react-start/server", () => ({
	getRequest: () => new Request("http://localhost/link", { headers: { "x-forwarded-for": "attacker" } }),
	getRequestIP: mocks.ip,
}));
vi.mock("@/features/auth/lib/security/link-attempt-limiter", async (importOriginal) => ({
	...await importOriginal<typeof import("@/features/auth/lib/security/link-attempt-limiter")>(),
	consumeLinkAttempt: mocks.consume,
}));
vi.mock("@/features/auth/lib/security/arcjet-policies", () => ({
	protectAuthEndpoint: mocks.protect,
}));
vi.mock("@/features/auth/server/get-auth-session", () => ({
	getAuthSession: mocks.session,
}));
vi.mock("@/features/auth/lib/auth", () => ({
	auth: {
		$context: Promise.resolve({
			internalAdapter: {
				findUserByEmail: mocks.findUserByEmail,
				findUserById: mocks.findUserById,
			},
			password: { verify: mocks.verify, hash: mocks.hash },
		}),
	},
}));
vi.mock("@/db", () => ({ db: { update: mocks.update, select: mocks.select, transaction: mocks.transaction } }));
vi.mock("@/lib/logger/server", () => ({
	logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
import { createLinkAttemptLimiter } from "@/features/auth/lib/security/link-attempt-limiter";
import { linkAnonymousAccountFn } from "../link-anonymous-account";
import { findUserBySecretCode } from "@/features/auth/lib/find-user-by-code";

import { getTableName } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";

// The identity-chain mock runs the actual imported handler and its real validator.
const invoke = async (data: Record<string, unknown>) =>
	linkAnonymousAccountFn({ data } as never);
const proof = { email: "new@example.com", password: "destination-password" };
describe("linkAnonymousAccountFn account ownership", () => {
	it("real quota stops password attempts across renewable anonymous sessions with Arcjet allowing", async () => {
		mocks.consume.mockImplementation(createLinkAttemptLimiter());
		mocks.verify.mockResolvedValue(false);
		for (let index = 0; index < 6; index++) {
			mocks.session.mockResolvedValue({ isAuthenticated: true, session: { id: `session-${index}`, token: `token-${index}` }, user: { id: `source-${index}`, isAnonymous: true } });
			mocks.ip.mockReturnValue(`192.0.2.${index + 1}`);
			await invoke(proof);
		}
		expect(mocks.verify).toHaveBeenCalledTimes(5);
		expect(mocks.findUserByEmail).toHaveBeenCalledTimes(5);
	});
	it("bounds the submitted email before lookup or sensitive-attempt storage", async () => {
		await expect(invoke({ ...proof, email: `${"a".repeat(250)}@example.com` })).rejects.toThrow();
		expect(mocks.findUserByEmail).not.toHaveBeenCalled();
	});
	it.each(["source", "target"])("rejects banned %s role before password work", async (which) => {
		mocks.session.mockResolvedValue({ isAuthenticated: true, session: { id: "session", token: "token" }, user: { id: "source", isAnonymous: true } });
		if (which === "source") mocks.findUserById.mockResolvedValue({ id: "source", isAnonymous: true, role: "BANNED" });
		else mocks.findUserByEmail.mockResolvedValue({ user: { id: "destination", isAnonymous: false, role: "BANNED" }, accounts: [{ id: "credential", providerId: "credential", password: "hash" }] });
		expect((await invoke(proof)).success).toBe(false);
		expect(mocks.verify).not.toHaveBeenCalled();
	});
	it("enforces sensitive quota before destination lookup even when Arcjet allows", async () => {
		mocks.session.mockResolvedValue({ isAuthenticated: true, session: { id: "session", token: "token" }, user: { id: "source", isAnonymous: true } });
		mocks.consume.mockReturnValue(false);
		expect((await invoke(proof)).success).toBe(false);
		expect(mocks.findUserByEmail).not.toHaveBeenCalled();
		expect(mocks.verify).not.toHaveBeenCalled();
		expect(mocks.update).not.toHaveBeenCalled();
	});
	it.each(["192.0.2.1", undefined])("uses only runtime transport IP (%s), never forwarded headers", async (ip) => {
		mocks.session.mockResolvedValue({ isAuthenticated: true, session: { id: "session", token: "token" }, user: { id: "source", isAnonymous: true } });
		mocks.ip.mockReturnValue(ip);
		await invoke(proof);
		expect(mocks.ip).toHaveBeenCalledWith({ xForwardedFor: false });
		expect(mocks.consume).toHaveBeenCalledWith(proof.email, ip);
	});
	it.each([
		["expired session", () => { mocks.lockedRows.session[0].expiresAt = new Date(0); }],
		["changed session owner", () => { mocks.lockedRows.session[0].userId = "victim"; }],
		["changed session token", () => { mocks.lockedRows.session[0].token = "replacement"; }],
		["changed source", () => { mocks.lockedRows.user[0].isAnonymous = false; }],
		["banned source", () => { mocks.lockedRows.user[0].banned = true; }],
		["deleted destination", () => { mocks.lockedRows.user.pop(); }],
		["banned destination", () => { mocks.lockedRows.user[1].banned = true; }],
		["banned destination role", () => { mocks.lockedRows.user[1].role = "BANNED"; }],
		["anonymous destination", () => { mocks.lockedRows.user[1].isAnonymous = true; }],
		["changed destination email", () => { mocks.lockedRows.user[1].email = "different@example.com"; }],
		["changed password", () => { mocks.lockedRows.account[0].password = "replacement"; }],
		["changed credential owner", () => { mocks.lockedRows.account[0].userId = "victim"; }],
		["deleted credential", () => { mocks.lockedRows.account = []; }],
	] as const)("rejects %s during password proof without alias effects", async (_label, change) => {
		mocks.session.mockResolvedValue({ isAuthenticated: true, session: { id: "session", token: "token" }, user: { id: "source", isAnonymous: true } });
		mocks.verify.mockImplementationOnce(async () => { change(); return true; });
		expect((await invoke(proof)).success).toBe(false);
		expect(mocks.update).not.toHaveBeenCalled();
	});
	it("rejects a source session revoked while destination password is verified", async () => {
		mocks.session.mockResolvedValue({ isAuthenticated: true, session: { id: "session", token: "token" }, user: { id: "source", isAnonymous: true } });
		mocks.verify.mockImplementationOnce(async () => { mocks.lockedRows.session = []; return true; });
		expect((await invoke(proof)).success).toBe(false);
		expect(mocks.update).not.toHaveBeenCalled();
	});

	beforeEach(() => {
		vi.clearAllMocks();
		mocks.consume.mockReturnValue(true);
		mocks.ip.mockReturnValue("192.0.2.1");
		mocks.lockedRows = {
			user: [{ id: "source", isAnonymous: true, banned: false }, { id: "destination", email: proof.email, isAnonymous: false, banned: false }],
			session: [{ id: "session", token: "token", userId: "source", expiresAt: new Date(Date.now() + 60000) }],
			account: [{ id: "credential", userId: "destination", providerId: "credential", password: "hash" }],
			alias: [{ id: "alias", userId: "source", isPrimary: true }],
		};
		mocks.transaction.mockImplementation(async (callback) => callback({ select: mocks.select, update: mocks.update }));
		mocks.select.mockImplementation(() => ({ from: (table: Parameters<typeof getTableName>[0]) => {
			const query = {
				where: () => query,
				orderBy: () => query,
				for: async () => mocks.lockedRows[getTableName(table)],
			};
			return query;
		} }));
		mocks.update.mockReturnValue({ set: mocks.set });
		mocks.set.mockReturnValue({ where: mocks.where });
		mocks.where.mockReturnValue({ returning: mocks.returning });
		mocks.returning.mockResolvedValue([{ id: "alias" }]);
		mocks.session.mockResolvedValue({
			isAuthenticated: true,
			session: { id: "session", token: "token" },
			user: { id: "destination", isAnonymous: false },
		});
		mocks.findUserByEmail.mockResolvedValue({
			user: { id: "destination", isAnonymous: false, banned: false },
			accounts: [{ id: "credential", providerId: "credential", password: "hash" }],
		});
		mocks.findUserById.mockResolvedValue({
			id: "source",
			isAnonymous: true,
			banned: false,
		});
		mocks.verify.mockResolvedValue(true);
		mocks.protect.mockResolvedValue({
			isDenied: () => false,
			isErrored: () => false,
		});
	});
	it("rejects a registered session claiming an arbitrary anonymous source", async () => {
		const result = await invoke({
			...proof,
			anonymousUserId: "victim",
			newUserId: "destination",
		});
		expect(result.success).toBe(false);
		expect(mocks.update).not.toHaveBeenCalled();
	});
	it("links only the session source to the password-proven destination before email verification", async () => {
		mocks.session.mockResolvedValue({
			isAuthenticated: true,
			session: { id: "session", token: "token" },
			user: { id: "source", isAnonymous: true },
		});
		const result = await invoke({
			...proof,
			anonymousUserId: "victim",
			newUserId: "source",
		});
		expect(result.success).toBe(true);
		expect(mocks.verify).toHaveBeenCalledWith({
			hash: "hash",
			password: proof.password,
		});
		expect(mocks.set).toHaveBeenCalledWith({ userId: "destination" });
		expect(
			new PgDialect().sqlToQuery(mocks.where.mock.calls[0][0]).params,
		).toEqual(["source"]);
	});
	it("refuses rate-limited credential checks before looking up a destination", async () => {
		mocks.session.mockResolvedValue({
			isAuthenticated: true,
			session: { id: "session", token: "token" },
			user: { id: "source", isAnonymous: true },
		});
		mocks.protect.mockResolvedValue({
			isDenied: () => true,
			isErrored: () => false,
		});
		expect((await invoke(proof)).success).toBe(false);
		expect(mocks.findUserByEmail).not.toHaveBeenCalled();
		expect(mocks.update).not.toHaveBeenCalled();
	});
	it("documents actual recovery after linking: code recovers only source, not transferred aliases", async () => {
		const source = { id: "source", isAnonymous: true, secretCode: "ABCD-EFGH" };
		const storedAliases = [{ id: "alias", userId: source.id }];
		mocks.session.mockResolvedValue({ isAuthenticated: true,
			session: { id: "session", token: "token" }, user: source });
		mocks.findUserById.mockResolvedValue(source);
		mocks.returning.mockImplementation(async () => {
			const owner = mocks.set.mock.calls[0][0].userId;
			const sourceId = new PgDialect().sqlToQuery(mocks.where.mock.calls[0][0])
				.params[0];
			for (const alias of storedAliases)
				if (alias.userId === sourceId) alias.userId = owner;
			return storedAliases;
		});
		expect((await invoke(proof)).success).toBe(true);
		mocks.select.mockReturnValue({
			from: () => ({ where: () => ({ limit: async () => [source] }) }),
		});
		const recovered = await findUserBySecretCode(source.secretCode);
		expect(recovered?.id).toBe(source.id);
		expect(
			storedAliases.filter((alias) => alias.userId === recovered?.id),
		).toEqual([]);
		expect(storedAliases).toEqual([{ id: "alias", userId: "destination" }]);
	});
	it("rejects a wrong destination password without mutation", async () => {
		mocks.session.mockResolvedValue({
			isAuthenticated: true,
			session: { id: "session", token: "token" },
			user: { id: "source", isAnonymous: true },
		});
		mocks.verify.mockResolvedValue(false);
		expect((await invoke(proof)).success).toBe(false);
		expect(mocks.update).not.toHaveBeenCalled();
	});
	it("fails closed when the existing auth policy errors", async () => {
		mocks.session.mockResolvedValue({
			isAuthenticated: true,
			session: { id: "session", token: "token" },
			user: { id: "source", isAnonymous: true },
		});
		mocks.protect.mockResolvedValue({
			isDenied: () => false,
			isErrored: () => true,
		});
		expect((await invoke(proof)).success).toBe(false);
		expect(mocks.verify).not.toHaveBeenCalled();
	});
	it.each([
		["missing source", null, { id: "destination", isAnonymous: false }],
		[
			"changed source",
			{ id: "source", isAnonymous: false },
			{ id: "destination", isAnonymous: false },
		],
		[
			"banned source",
			{ id: "source", isAnonymous: true, banned: true },
			{ id: "destination", isAnonymous: false },
		],
		[
			"anonymous target",
			{ id: "source", isAnonymous: true },
			{ id: "destination", isAnonymous: true },
		],
		[
			"banned target",
			{ id: "source", isAnonymous: true },
			{ id: "destination", isAnonymous: false, banned: true },
		],
		[
			"same account",
			{ id: "source", isAnonymous: true },
			{ id: "source", isAnonymous: false },
		],
	])(
		"rejects %s using current server account records",
		async (_label, source, target) => {
			mocks.session.mockResolvedValue({
				isAuthenticated: true,
			session: { id: "session", token: "token" },
				user: { id: "source", isAnonymous: true },
			});
			mocks.findUserById.mockResolvedValue(source);
			mocks.findUserByEmail.mockResolvedValue({
				user: target,
				accounts: [{ id: "credential", providerId: "credential", password: "hash" }],
			});
			expect((await invoke(proof)).success).toBe(false);
			expect(mocks.update).not.toHaveBeenCalled();
		},
	);
});
