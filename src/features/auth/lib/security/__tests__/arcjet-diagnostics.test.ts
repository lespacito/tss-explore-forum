import { ArcjetAllowDecision, ArcjetReason } from "@arcjet/protocol";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	beginArcjetDiagnostic,
	headerStructure,
	ipCategory,
} from "../arcjet-diagnostics";

afterEach(() => {
	vi.unstubAllEnvs();
	vi.restoreAllMocks();
});
const decision = () =>
	new ArcjetAllowDecision({ ttl: 0, reason: new ArcjetReason(), results: [] });

describe("temporary Arcjet diagnostics", () => {
	it("is silent unless explicitly enabled", () => {
		const log = vi.spyOn(console, "info").mockImplementation(() => {});
		for (const flag of [undefined, "false", "1", "TRUE"]) {
			vi.stubEnv("ARCJET_PREPROD_DIAGNOSTICS", flag);
			expect(
				beginArcjetDiagnostic(new Request("https://example.org"), "", true),
			).toBeUndefined();
		}
		expect(log).not.toHaveBeenCalled();
	});
	it("correlates interleaved calls without retaining identifiers or sensitive inputs", () => {
		vi.stubEnv("ARCJET_PREPROD_DIAGNOSTICS", "true");
		const log = vi.spyOn(console, "info").mockImplementation(() => {});
		const request = new Request(
			"https://example.org/private-secret?token=query-secret",
			{
				headers: {
					forwarded:
						'for="[2606:4700:4700::1111]";proto=https, for=192.168.1.2',
					"x-forwarded-for": "8.8.8.8, 10.1.2.3",
					"x-real-ip": "1.1.1.1",
					"x-client-ip": "untrusted-secret",
					cookie: "session=cookie-secret",
					authorization: "Bearer auth-secret",
					"x-request-id": "attacker-id",
				},
			},
		);
		Object.defineProperty(request, "ip", { value: "127.0.0.1" });
		const first = beginArcjetDiagnostic(request, "8.8.8.8", false);
		const second = beginArcjetDiagnostic(request, "", true);
		second?.(decision());
		first?.(decision());
		const logs = log.mock.calls.map(([line]) => JSON.parse(line));
		expect(logs[0].correlationId).toBe(logs[3].correlationId);
		expect(logs[1].correlationId).toBe(logs[2].correlationId);
		expect(logs[0].correlationId).not.toBe(logs[1].correlationId);
		expect(logs[0]).toMatchObject({
			requestIpCategory: "loopback",
			policyIpResolution: "success",
			adapterIpResolution: "not-observable",
			fallbackUsed: false,
		});
		expect(logs[1]).toMatchObject({
			policyIpResolution: "failure",
			fallbackUsed: true,
		});
		const text = JSON.stringify(logs);
		for (const secret of [
			"2606:4700",
			"192.168.1.2",
			"8.8.8.8",
			"10.1.2.3",
			"1.1.1.1",
			"127.0.0.1",
			"secret",
			"attacker-id",
			"cookie",
			"authorization",
		])
			expect(text).not.toContain(secret);
	});
	it("bounds structures and never emits arbitrary Forwarded parameters", () => {
		const headers = new Headers({
			forwarded: 'for=unknown;token=secret, for="[::1]:443"',
			"x-forwarded-for": Array(50).fill("8.8.8.8").join(","),
		});
		expect(headerStructure(headers, "forwarded")).toMatchObject({
			entries: [
				{ form: "for-parameter", category: "missing" },
				{ category: "loopback" },
			],
		});
		expect(headerStructure(headers, "x-forwarded-for")).toMatchObject({
			truncated: true,
		});
		expect(headerStructure(headers, "x-forwarded-for").entries).toHaveLength(
			16,
		);
		expect(headerStructure(headers, "x-real-ip")).toEqual({
			present: false,
			entries: [],
		});
	});
	it.each([
		["8.8.8.8", "public"],
		["10.1.2.3", "private"],
		["::1", "loopback"],
		["::ffff:127.0.0.1", "loopback"],
		[undefined, "missing"],
		["malformed", "missing"],
	])("classifies %s as %s", (ip, category) =>
		expect(ipCategory(ip)).toBe(category),
	);
	it("logs an error marker without serializing errors; logging failures do not escape", () => {
		vi.stubEnv("ARCJET_PREPROD_DIAGNOSTICS", "true");
		const log = vi.spyOn(console, "info").mockImplementation(() => {});
		beginArcjetDiagnostic(
			new Request("https://example.org"),
			undefined,
			false,
		)?.();
		expect(JSON.parse(String(log.mock.calls[0][0])).policyIpResolution).toBe(
			"not-run-session",
		);
		expect(JSON.parse(String(log.mock.calls[1][0])).phase).toBe("arcjet-error");
		log.mockImplementation(() => {
			throw new Error("logger-secret");
		});
		expect(() =>
			beginArcjetDiagnostic(
				new Request("https://example.org"),
				"",
				true,
			)?.(decision()),
		).not.toThrow();
	});
});
