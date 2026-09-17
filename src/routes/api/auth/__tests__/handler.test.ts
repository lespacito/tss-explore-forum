import { beforeEach, describe, expect, it, vi } from "vitest";

// Mocks Arcjet avant les imports
vi.mock("@/features/auth/lib/security/arcjet-policies", () => ({
	runArcjetPolicy: vi.fn(),
}));

vi.mock("@/features/auth/lib/security/protected-server-fn", () => ({
	handleArcjetDenied: vi.fn((decision) => ({
		success: false,
		error: decision.reason.isRateLimit()
			? "Trop de tentatives. Veuillez réessayer plus tard."
			: "Accès refusé",
	})),
}));

vi.mock("@/features/auth/lib/auth", () => ({
	auth: {
		handler: vi.fn(
			() =>
				new Response(JSON.stringify({ ok: true }), {
					status: 200,
					headers: { "Content-Type": "application/json" },
				}),
		),
	},
}));

// Mocks côté serveur et client
vi.mock("@tanstack/start", async () => {
	const actual = await vi.importActual("@tanstack/start");
	return {
		...actual,
		getRequest: vi.fn(
			() =>
				new Request("http://localhost", {
					headers: {
						"user-agent": "test-agent",
						"cf-connecting-ip": "192.0.2.1",
						"x-forwarded-for": "192.0.2.1",
					},
				}),
		),
	};
});

import { auth } from "@/features/auth/lib/auth";
import { runArcjetPolicy } from "@/features/auth/lib/security/arcjet-policies";
import { handleArcjetDenied } from "@/features/auth/lib/security/protected-server-fn";

type ArcjetDecision = {
	isDenied: () => boolean;
	reason: {
		isRateLimit: () => boolean;
		isBot: () => boolean;
	};
};

function makeHandler() {
	return async function handler({ request }: { request: Request }) {
		const url = new URL(request.url);
		const path = url.pathname;
		let email: string | undefined;

		let policyPath = path;
		if (path.includes("/sign-in")) policyPath = "/auth/sign-in";
		if (path.includes("/sign-up")) {
			policyPath = "/auth/sign-up";
			try {
				const clone = request.clone();
				const body = await clone.json();
				email = body.email;
			} catch {
				// ignore body parsing errors
			}
		}

		const decision = await runArcjetPolicy({
			request,
			path: policyPath,
			email,
		});

		if (decision.isDenied()) {
			const result = handleArcjetDenied(decision);
			const status = decision.reason.isRateLimit() ? 429 : 403;
			return new Response(JSON.stringify(result), {
				status,
				headers: { "Content-Type": "application/json" },
			});
		}
		return await auth.handler(request);
	};
}

describe("src/routes/api/auth/$.ts", () => {
	const handler = makeHandler();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("intercepte /sign-in/credentials via policyPath /auth/sign-in", async () => {
		const credentialsPath = "/api/auth/sign-in/credentials";
		const request = new Request(`http://localhost${credentialsPath}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ secretCode: "ABCD-EFGH" }),
		});

		vi.mocked(runArcjetPolicy).mockResolvedValue({
			isDenied: () => false,
			reason: {
				isRateLimit: () => false,
				isBot: () => false,
			},
		} as unknown as ArcjetDecision);

		const response = await handler({ request });

		expect(runArcjetPolicy).toHaveBeenCalledWith(
			expect.objectContaining({ path: "/auth/sign-in" }),
		);
		expect(response.status).toBe(200);
	});

	it("renvoie 429 quand Arcjet bloque pour rate-limit sur /sign-in/credentials", async () => {
		const credentialsPath = "/api/auth/sign-in/credentials";
		const request = new Request(`http://localhost${credentialsPath}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ secretCode: "ABCD-EFGH" }),
		});

		vi.mocked(runArcjetPolicy).mockResolvedValue({
			isDenied: () => true,
			reason: {
				isRateLimit: () => true,
				isBot: () => false,
			},
		} as unknown as ArcjetDecision);

		const response = await handler({ request });
		const body = await response.json();

		expect(response.status).toBe(429);
		expect(body.success).toBe(false);
		expect(body.error).toContain("Trop de tentatives");
	});

	it("laisse passer les requêtes non sign-in (ex: health check)", async () => {
		vi.mocked(runArcjetPolicy).mockResolvedValue({
			isDenied: () => false,
			reason: {
				isRateLimit: () => false,
				isBot: () => false,
			},
		} as unknown as ArcjetDecision);

		const request = new Request("http://localhost/api/auth/health", {
			method: "GET",
		});

		const response = await handler({ request });

		expect(runArcjetPolicy).toHaveBeenCalledWith(
			expect.objectContaining({ path: "/api/auth/health" }),
		);
		expect(response.status).toBe(200);
	});
});
