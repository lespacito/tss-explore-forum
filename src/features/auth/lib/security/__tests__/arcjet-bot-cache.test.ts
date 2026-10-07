import { ArcjetAllowDecision, ArcjetReason } from "@arcjet/protocol";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	decide: vi.fn(),
	report: vi.fn(),
	debug: vi.fn(),
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
					warn: vi.fn(),
					error: vi.fn(),
				},
			}),
	};
});

const browser =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
function context(agent: string, path = "/auth/sign-in", ip = "8.8.8.8") {
	return {
		path,
		request: new Request(`https://preprod.parlonsviolence.ch${path}`, {
			method: "POST",
			headers: {
				host: "preprod.parlonsviolence.ch",
				"user-agent": agent,
				"x-forwarded-for": ip,
			},
		}),
	};
}

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

// Cold WASM initialization can exceed the default 5s on developer machines.
describe(
	"Arcjet beta.15 BOT cache characterization (not desired browser behavior)",
	{ timeout: 30_000 },
	() => {
		it("reuses BOT DENY for a fresh browser Request at the same IP, across withRule clones", async () => {
			const { runArcjetPolicy } = await import("../arcjet-policies");
			const bot = await runArcjetPolicy(context("curl/8.0.1"));
			expect(bot.isDenied()).toBe(true);
			expect(bot.reason.isBot()).toBe(true);
			expect(bot.ttl).toBe(60);
			const botResult = bot.results.find((r) => r.reason.isBot());
			expect(botResult?.state).toBe("RUN");

			vi.mocked(Date.now).mockReturnValue(1_700_000_001_000);
			const legitimate = await runArcjetPolicy(context(browser));
			expect(legitimate.isDenied()).toBe(true);
			expect(legitimate.reason.isBot()).toBe(true);
			expect(legitimate.ttl).toBe(59);
			expect(legitimate.results.find((r) => r.reason.isBot())).toMatchObject({
				state: "CACHED",
				fingerprint: botResult?.fingerprint,
				ruleId: botResult?.ruleId,
			});
			expect(mocks.decide).not.toHaveBeenCalled();
		});

		it("allows browser evaluation again once the exact 60-second cache expires", async () => {
			const { runArcjetPolicy } = await import("../arcjet-policies");
			await runArcjetPolicy(context("curl/8.0.1"));
			vi.mocked(Date.now).mockReturnValue(1_700_000_060_000);
			const decision = await runArcjetPolicy(context(browser));
			expect(decision.isAllowed()).toBe(true);
			expect(mocks.decide).toHaveBeenCalledTimes(1);
			expect(
				mocks.debug.mock.calls.some(
					([entry]) => entry?.rule === "BOT" && entry.conclusion === "ALLOW",
				),
			).toBe(true);
		});

		it("allows a browser with a new singleton/client even before cache expiry", async () => {
			const first = await import("../arcjet-policies");
			expect(
				(await first.runArcjetPolicy(context("curl/8.0.1"))).isDenied(),
			).toBe(true);
			// Reconstruct the singleton, equivalent to a fresh process for its cache.
			vi.resetModules();
			const fresh = await import("../arcjet-policies");
			expect((await fresh.runArcjetPolicy(context(browser))).isAllowed()).toBe(
				true,
			);
			expect(mocks.decide).toHaveBeenCalledTimes(1);
			expect(
				mocks.debug.mock.calls.some(
					([entry]) => entry?.rule === "BOT" && entry.conclusion === "ALLOW",
				),
			).toBe(true);
		});

		it("shares the BOT refusal across route policies with the same bot options", async () => {
			const { runArcjetPolicy } = await import("../arcjet-policies");
			await runArcjetPolicy(context("curl/8.0.1", "/auth/sign-in"));
			const otherRoute = await runArcjetPolicy(
				context(browser, "/threads/create"),
			);
			expect(otherRoute.reason.isBot()).toBe(true);
			expect(otherRoute.results.find((r) => r.reason.isBot())?.state).toBe(
				"CACHED",
			);
		});

		it("does not transfer the refusal to a different identity/IP", async () => {
			const { runArcjetPolicy } = await import("../arcjet-policies");
			await runArcjetPolicy(context("curl/8.0.1"));
			expect(
				(
					await runArcjetPolicy(context(browser, "/auth/sign-in", "1.1.1.1"))
				).isAllowed(),
			).toBe(true);
		});
	},
);
