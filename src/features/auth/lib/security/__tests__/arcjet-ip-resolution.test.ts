import { findIp } from "@arcjet/ip";
import { ArcjetAllowDecision, ArcjetReason } from "@arcjet/protocol";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	decide: vi.fn(),
	report: vi.fn(),
	debug: vi.fn(),
	warn: vi.fn(),
	session: vi.fn(),
}));
vi.mock("@/data/env/server", () => ({
	env: { NODE_ENV: "production", ARCJET_KEY: "ajkey_fixture_no_network" },
}));
vi.mock("@/features/auth/lib/auth", () => ({
	auth: { api: { getSession: mocks.session } },
}));
// Only replace transport/logging. Real node adapter, SDK, WASM bot detector,
// fingerprint generation, rule IDs and MemoryCache all execute unchanged.
vi.mock("@arcjet/node", async (importOriginal) => {
	const actual = await importOriginal<typeof import("@arcjet/node")>();
	return {
		...actual,
		default: (options: Parameters<typeof actual.default>[0]) =>
			actual.default({
				...options,
				client: { decide: mocks.decide, report: mocks.report },
				log: {
					debug: mocks.debug,
					info: vi.fn(),
					warn: mocks.warn,
					error: vi.fn(),
				},
			}),
	};
});

const browser =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	mocks.session.mockResolvedValue(null);
	mocks.decide.mockImplementation(
		async () =>
			new ArcjetAllowDecision({
				ttl: 0,
				reason: new ArcjetReason(),
				results: [],
			}),
	);
	vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
});
afterEach(() => vi.restoreAllMocks());

function req(
	headers: Record<string, string> = {},
	ip?: string,
	agent = browser,
) {
	const request = new Request(
		"https://preprod.parlonsviolence.ch/api/auth/get-session",
		{
			headers: {
				host: "preprod.parlonsviolence.ch",
				"user-agent": agent,
				...headers,
			},
		},
	);
	if (ip) Object.defineProperty(request, "ip", { value: ip });
	return { request, path: "/api/auth/get-session" };
}

describe(
	"Arcjet beta.15 IP resolution characterization",
	{ timeout: 30_000 },
	() => {
		it.each([
			["XFF", { "x-forwarded-for": "8.8.8.8, 172.18.0.2" }, "8.8.8.8"],
			["X-Real-IP", { "x-real-ip": "8.8.8.8" }, "8.8.8.8"],
			[
				"XFF before real IP",
				{ "x-forwarded-for": "8.8.8.8", "x-real-ip": "1.1.1.1" },
				"8.8.8.8",
			],
			[
				"rightmost public XFF",
				{ "x-forwarded-for": "8.8.8.8, 1.1.1.1" },
				"1.1.1.1",
			],
			[
				"X-Client-IP before XFF",
				{ "x-client-ip": "1.1.1.1", "x-forwarded-for": "8.8.8.8" },
				"1.1.1.1",
			],
			["RFC Forwarded", { forwarded: "for=8.8.8.8;proto=https" }, ""],
			[
				"private only",
				{ "x-forwarded-for": "172.18.0.2", "x-real-ip": "127.0.0.1" },
				"",
			],
			["absent", {}, ""],
		] as const)(
			"resolves %s through real policy and Node adapter",
			async (_name, headers, expected) => {
				const ctx = req(headers);
				expect(findIp(ctx.request)).toBe(expected);
				const { runArcjetPolicy } = await import("../arcjet-policies");
				await runArcjetPolicy(ctx);
				const [remoteContext, details, rules] = mocks.decide.mock.calls[0];
				expect(details.ip).toBe(expected);
				expect(details.extra.userIdOrIp).toBe(expected || "127.0.0.1");
				expect(remoteContext.characteristics).toEqual(["userIdOrIp"]);
				expect(
					rules.find((r: { type: string }) => r.type === "RATE_LIMIT")
						.characteristics,
				).toEqual(["userIdOrIp"]);
				expect(
					mocks.warn.mock.calls.some(([message]) =>
						message.includes("Client IP address is missing"),
					),
				).toBe(expected === "");
			},
		);

		it("policy reads runtime request.ip but Node adapter discards it", async () => {
			const ctx = req({}, "8.8.8.8");
			expect(findIp(ctx.request)).toBe("8.8.8.8");
			const { runArcjetPolicy } = await import("../arcjet-policies");
			await runArcjetPolicy(ctx);
			const [, details] = mocks.decide.mock.calls[0];
			expect(details.ip).toBe("");
			expect(details.extra.userIdOrIp).toBe("8.8.8.8");
		});

		it("different unresolvable clients share BOT refusal via fallback identity", async () => {
			const { runArcjetPolicy } = await import("../arcjet-policies");
			const first = await runArcjetPolicy(
				req({ forwarded: "for=8.8.8.8" }, undefined, "curl/8.0.1"),
			);
			const second = await runArcjetPolicy(req({ forwarded: "for=1.1.1.1" }));
			expect(first.isDenied()).toBe(true);
			expect(second.results.find((r) => r.reason.isBot())).toMatchObject({
				state: "CACHED",
				conclusion: "DENY",
				fingerprint: first.results.find((r) => r.reason.isBot())?.fingerprint,
			});
			expect(mocks.decide).not.toHaveBeenCalled();
		});

		it("different unresolvable clients send the same rate-limit identity and fingerprint", async () => {
			const { runArcjetPolicy } = await import("../arcjet-policies");
			await runArcjetPolicy(req({ forwarded: "for=8.8.8.8" }));
			await runArcjetPolicy(req({ forwarded: "for=1.1.1.1" }));
			const [first, second] = mocks.decide.mock.calls;
			expect(first[1].extra.userIdOrIp).toBe("127.0.0.1");
			expect(second[1].extra.userIdOrIp).toBe("127.0.0.1");
			expect(first[0].fingerprint).toBe(second[0].fingerprint);
		});

		it("a signed-in identity survives missing IP without anonymous fallback", async () => {
			mocks.session.mockResolvedValue({ user: { id: "fixture-user" } });
			const { runArcjetPolicy } = await import("../arcjet-policies");
			await runArcjetPolicy(req());
			expect(mocks.decide.mock.calls[0][1].extra.userIdOrIp).toBe(
				"fixture-user",
			);
			expect(mocks.decide.mock.calls[0][1].ip).toBe("");
		});
	},
);
