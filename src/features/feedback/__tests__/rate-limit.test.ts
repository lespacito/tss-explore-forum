import { describe, expect, it } from "vitest";
import { checkRateLimit, extractBetaHash } from "@/features/feedback/lib/rate-limit";

describe("Feedback rate limit (cookie beta uniquement)", () => {
	it("refuse si aucun cookie beta", () => {
		const result = checkRateLimit(new Request("http://localhost/feedback"));
		expect(result.allowed).toBe(false);
		expect(result.reason).toContain("cookie beta");
	});

	it("refuse si cookie beta absent ou vide", () => {
		const req = new Request("http://localhost/feedback", {
			headers: { cookie: "autre-cookie=valeur" },
		});
		expect(checkRateLimit(req).allowed).toBe(false);
	});

	it("refuse si cookie beta trop court", () => {
		const req = new Request("http://localhost/feedback", {
			headers: { cookie: "pv-beta-access=short" },
		});
		expect(checkRateLimit(req).allowed).toBe(false);
	});

	it("extrait le hash du cookie beta valide", () => {
		const cookieValue = "a".repeat(64);
		const req = new Request("http://localhost/feedback", {
			headers: { cookie: `pv-beta-access=${cookieValue}` },
		});
		const hash = extractBetaHash(req);
		expect(hash).not.toBeNull();
		expect(hash).not.toBe(cookieValue);
		expect(hash).toHaveLength(64);
	});

	it("cookie beta invalide (trop long) => refus", () => {
		const cookieValue = "a".repeat(201);
		const req = new Request("http://localhost/feedback", {
			headers: { cookie: `pv-beta-access=${cookieValue}` },
		});
		expect(extractBetaHash(req)).toBeNull();
		expect(checkRateLimit(req).allowed).toBe(false);
	});
});

describe("Feedback rate limit — comportement bucket", () => {
	it("cookie différent => bucket différent (pas de limitation croisée)", () => {
		const cookie1 = "a".repeat(64);
		const cookie2 = "b".repeat(64);
		const req1 = new Request("http://localhost/feedback", {
			headers: { cookie: `pv-beta-access=${cookie1}` },
		});
		const req2 = new Request("http://localhost/feedback", {
			headers: { cookie: `pv-beta-access=${cookie2}` },
		});

		expect(checkRateLimit(req1).allowed).toBe(true);
		expect(checkRateLimit(req2).allowed).toBe(true);

		for (let i = 0; i < 3; i++) {
			checkRateLimit(req1);
		}
		expect(checkRateLimit(req1).allowed).toBe(false);
		expect(checkRateLimit(req2).allowed).toBe(true);
	});

	it("même cookie => limite après 3 soumissions", () => {
		const cookie = "c".repeat(64);
		const req = new Request("http://localhost/feedback", {
			headers: { cookie: `pv-beta-access=${cookie}` },
		});

		for (let i = 0; i < 3; i++) {
			expect(checkRateLimit(req).allowed).toBe(true);
		}
		expect(checkRateLimit(req).allowed).toBe(false);
		expect(checkRateLimit(req).reason).toContain("Trop de soumissions");
	});
});