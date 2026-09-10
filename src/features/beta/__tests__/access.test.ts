import { afterEach, describe, expect, it, vi } from "vitest";
import {
	BETA_COOKIE,
	betaAccessResponse,
	invitationDigests,
	signInvitation,
	verifyInvitation,
} from "../server/access";

const code = "fixture-invitation-with-32-characters-minimum";
const secret = "fixture-signing-key-with-32-characters-minimum";
afterEach(() => vi.unstubAllEnvs());
describe("private beta boundary", () => {
	it("rejects forged, expired and revoked invitations", () => {
		const now = 1_700_000_000_000;
		const signed = signInvitation(code, secret, now);
		expect(verifyInvitation(signed, invitationDigests(code), secret, now)).toBe(
			true,
		);
		expect(
			verifyInvitation(`${signed}x`, invitationDigests(code), secret, now),
		).toBe(false);
		expect(
			verifyInvitation(
				signed,
				invitationDigests(code),
				secret,
				now + 15 * 86400_000,
			),
		).toBe(false);
		expect(verifyInvitation(signed, [], secret, now)).toBe(false);
		expect(
			verifyInvitation(
				signed,
				invitationDigests(code),
				"wrong-key-but-at-least-32-characters",
				now,
			),
		).toBe(false);
	});
	it("fails closed without configuration and protects direct APIs", async () => {
		vi.stubEnv("BETA_INVITATION_CODES", "");
		expect(
			(
				await betaAccessResponse(
					new Request("http://localhost/threads", {
						headers: { accept: "text/html" },
					}),
				)
			)?.headers.get("location"),
		).toBe("/beta");
		for (const path of [
			"/api/auth/get-session",
			"/_serverFn/any",
			"/threads/example",
		])
			expect(
				(await betaAccessResponse(new Request(`http://localhost${path}`)))
					?.status,
			).toBe(401);
	});
	it("allows help pages without granting API access", async () => {
		for (const path of ["/help", "/privacy", "/rules"])
			expect(
				await betaAccessResponse(new Request(`http://localhost${path}`)),
			).toBeNull();
		expect(
			(
				await betaAccessResponse(
					new Request("http://localhost/help", { method: "POST" }),
				)
			)?.status,
		).toBe(401);
	});
	it("requires same origin and emits a signed HttpOnly cookie", async () => {
		vi.stubEnv("BETA_INVITATION_CODES", code);
		vi.stubEnv("BETTER_AUTH_SECRET", secret);
		const req = (origin: string) =>
			new Request("http://localhost/beta", {
				method: "POST",
				headers: {
					origin,
					"content-type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({ invitation: code }).toString(),
			});
		expect(
			(await betaAccessResponse(req("http://attacker.invalid")))?.status,
		).toBe(403);
		const response = await betaAccessResponse(req("http://localhost"));
		expect(response?.status).toBe(303);
		const cookie = response?.headers.get("set-cookie")!;
		expect(cookie).toContain("HttpOnly");
		expect(cookie).toContain("SameSite=Strict");
		expect(cookie).not.toContain(code);
		expect(
			await betaAccessResponse(
				new Request("http://localhost/threads", {
					headers: { cookie: cookie.split(";")[0] },
				}),
			),
		).toBeNull();
	});
	it("rejects oversized form bodies", async () => {
		const response = await betaAccessResponse(
			new Request("http://localhost/beta", {
				method: "POST",
				headers: {
					origin: "http://localhost",
					"content-type": "application/x-www-form-urlencoded",
				},
				body: "invitation=" + "x".repeat(3000),
			}),
		);
		expect(response?.status).toBe(413);
	});
	it("clears access when leaving", async () => {
		const response = await betaAccessResponse(
			new Request("http://localhost/beta?leave=1"),
		);
		expect(response?.headers.get("set-cookie")).toContain(`${BETA_COOKIE}=`);
		expect(response?.headers.get("set-cookie")).toContain("Max-Age=0");
	});
	it("preserves an account-erasure confirmation after clearing access", async () => {
		const leaveResponse = await betaAccessResponse(
			new Request("http://localhost/beta?leave=erased"),
		);
		expect(leaveResponse?.status).toBe(303);
		expect(leaveResponse?.headers.get("location")).toBe("/beta?erased=1");
		expect(leaveResponse?.headers.get("set-cookie")).toContain("Max-Age=0");

		const confirmationResponse = await betaAccessResponse(
			new Request("http://localhost/beta?erased=1"),
		);
		const html = await confirmationResponse?.text();
		expect(confirmationResponse?.status).toBe(200);
		expect(html).toContain('role="status"');
		expect(html).toContain(
			"Votre compte et vos publications ont été effacés de la base active.",
		);
		expect(html).toContain("sept jours supplémentaires");
	});
});
