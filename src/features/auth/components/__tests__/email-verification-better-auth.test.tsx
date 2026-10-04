import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { betterAuth } from "better-auth";
import { type MemoryDB, memoryAdapter } from "better-auth/adapters/memory";
import { anonymousClient } from "better-auth/client/plugins";
import { anonymous } from "better-auth/plugins";
import { createAuthClient } from "better-auth/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

const state = vi.hoisted(() => ({
	client: null as ReturnType<typeof createAuthClient> | null,
}));
vi.mock("@/features/auth/lib/auth-client", () => ({
	get authClient() {
		return state.client;
	},
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { EmailVerification } from "../email-verification";

const email = "destination@example.com";
let db: MemoryDB;
let delivered: ReturnType<typeof vi.fn>;
let client: ReturnType<typeof createAuthClient>;
let sourceId: string;
let requests: string[];
let swapAtMutation: (() => void) | null;
let prepareReplacement: (
	kind: "anonymous" | "same-user" | "registered",
) => Promise<{ apply: () => void; id: string; userId: string }>;
let capturedTokenWasRevoked: boolean;
afterEach(() => vi.unstubAllGlobals());
beforeEach(async () => {
	// Align jsdom's constructor with Node TextEncoder's output for real jose
	// JWT signing. No crypto/auth functions are mocked.
	vi.stubGlobal("Uint8Array", new TextEncoder().encode("").constructor);
	const now = new Date();
	db = {
		user: [
			{
				id: "destination",
				email,
				emailVerified: false,
				name: "Destination",
				isAnonymous: false,
				createdAt: now,
				updatedAt: now,
			},
		],
		session: [],
		account: [],
		verification: [],
	};
	delivered = vi.fn();
	requests = [];
	swapAtMutation = null;
	capturedTokenWasRevoked = false;
	// Isolated native BA router + memory adapter. Never imports app auth/DB/mail.
	const auth = betterAuth({
		baseURL: "http://localhost:3000",
		secret: "isolated-regression-secret-at-least-32-characters",
		database: memoryAdapter(db),
		plugins: [anonymous()],
		emailVerification: { sendVerificationEmail: delivered },
	});
	const cookies = new Map<string, string>();
	const nativeClient = createAuthClient({
		baseURL: "http://localhost:3000",
		plugins: [anonymousClient()],
		fetchOptions: {
			customFetchImpl: async (input, init) => {
				const path = new URL(String(input)).pathname;
				if (
					(path.endsWith("/revoke-session") || path.endsWith("/sign-out")) &&
					swapAtMutation
				) {
					swapAtMutation();
					swapAtMutation = null;
				}
				if (path.endsWith("/revoke-session")) {
					const body = JSON.parse(String(init?.body));
					capturedTokenWasRevoked = db.session.some(
						(record) =>
							record.userId === sourceId && record.token === body.token,
					);
				}
				const headers = new Headers(init?.headers);
				headers.set("origin", "http://localhost:3000");
				if (cookies.size)
					headers.set(
						"cookie",
						[...cookies].map(([key, value]) => `${key}=${value}`).join("; "),
					);
				// jsdom's AbortSignal belongs to a different realm than Node's
				// Request. This in-process transport has no network to abort.
				const request = new Request(input, {
					...init,
					signal: undefined,
					headers,
				});
				requests.push(new URL(request.url).pathname);
				const response = await auth.handler(request);
				// Emulate browser cookie updates from the real native endpoints,
				// including expiry on signOut; never suppress a cookie per request.
				for (const cookie of response.headers.getSetCookie()) {
					const [pair] = cookie.split(";");
					const separator = pair.indexOf("=");
					const name = pair.slice(0, separator);
					const value = pair.slice(separator + 1);
					if (/max-age=0/i.test(cookie)) cookies.delete(name);
					else cookies.set(name, value);
				}
				return response;
			},
		},
	});
	const result = await nativeClient.signIn.anonymous();
	expect(result.error).toBeNull();
	if (!result.data)
		throw new Error("Native anonymous sign-in returned no user");
	sourceId = result.data.user.id;
	prepareReplacement = async (kind) => {
		const original = new Map(cookies);
		cookies.clear();
		const replacement = await nativeClient.signIn.anonymous();
		expect(replacement.error).toBeNull();
		const session = (
			await nativeClient.getSession({ query: { disableCookieCache: true } })
		).data;
		if (!session) throw new Error("No replacement session");
		// Fixture setup only: native signed cookie and native session row. Assign
		// another session to the source/registered user to model recovery/login;
		// all subsequent authentication and revocation uses the real BA handler.
		const row = db.session.find((record) => record.id === session.session.id);
		if (!row) throw new Error("No replacement row");
		if (kind === "same-user") row.userId = sourceId;
		if (kind === "registered") row.userId = "destination";
		const replacementCookies = new Map(cookies);
		const apply = () => {
			cookies.clear();
			for (const [key, value] of replacementCookies) cookies.set(key, value);
		};
		cookies.clear();
		for (const [key, value] of original) cookies.set(key, value);
		return { apply, id: row.id as string, userId: row.userId as string };
	};
	client = nativeClient;
	state.client = client;
});
it("reproduces installed Better Auth EMAIL_MISMATCH for a synthetic anonymous session", async () => {
	const session = await client.getSession();
	expect(session.data?.user.email).not.toBe(email);
	const result = await client.sendVerificationEmail({
		email,
		callbackURL: "/",
	});
	expect(result.error).toMatchObject({
		code: "EMAIL_MISMATCH",
		message: "Email mismatch",
		status: 400,
	});
	expect(delivered).not.toHaveBeenCalled();
	expect((await client.getSession()).data?.user.id).toBe(sourceId);
});
it("component consent revokes only the captured token then uses the real no-session resend endpoint without deleting the source", async () => {
	render(<EmailVerification email="" />);
	const user = userEvent.setup();
	await user.type(screen.getByLabelText(/^email$/i), email);
	await user.click(
		screen.getByRole("button", { name: /renvoyer l'email de vérification/i }),
	);
	await screen.findByRole("checkbox");
	expect(delivered).not.toHaveBeenCalled();
	expect((await client.getSession()).data?.user.id).toBe(sourceId);
	expect(requests).not.toContain("/api/auth/sign-out");
	await user.click(screen.getByRole("checkbox"));
	await user.click(
		screen.getByRole("button", { name: /déconnecter.*renvoyer/i }),
	);
	await waitFor(() => expect(delivered).toHaveBeenCalledTimes(1));
	expect(delivered.mock.calls[0][0].user.email).toBe(email);
	expect(delivered.mock.calls[0][0].url).toContain("/verify-email?token=");
	expect((await client.getSession()).data).toBeNull();
	expect(db.user.some((record) => record.id === sourceId)).toBe(true);
	expect(db.session.some((record) => record.userId === sourceId)).toBe(false);
	expect(requests).not.toContain("/api/auth/sign-out");
	expect(requests.indexOf("/api/auth/revoke-session")).toBeGreaterThan(-1);
	expect(requests.indexOf("/api/auth/revoke-session")).toBeLessThan(
		requests.indexOf("/api/auth/send-verification-email"),
	);
});

async function promptConsent() {
	render(<EmailVerification email="" />);
	const user = userEvent.setup();
	await user.type(screen.getByLabelText(/^email$/i), email);
	await user.click(
		screen.getByRole("button", { name: /renvoyer l'email de vérification/i }),
	);
	await user.click(await screen.findByRole("checkbox"));
	return user;
}
it.each(["anonymous", "same-user", "registered"] as const)(
	"cookie swap to %s at mutation never revokes the replacement or resends under old consent",
	async (kind) => {
		const user = await promptConsent();
		const replacement = await prepareReplacement(kind);
		swapAtMutation = replacement.apply;
		await user.click(
			screen.getByRole("button", { name: /déconnecter.*renvoyer/i }),
		);
		await waitFor(() => expect(requests).toContain("/api/auth/revoke-session"));
		await waitFor(() => {
			const checkbox = screen.queryByRole("checkbox");
			if (kind === "registered") expect(checkbox).not.toBeInTheDocument();
			else expect(checkbox).not.toBeChecked();
		});
		expect(requests).not.toContain("/api/auth/sign-out");
		expect(capturedTokenWasRevoked).toBe(true);
		expect(db.session.some((record) => record.id === replacement.id)).toBe(
			true,
		);
		expect(
			(await client.getSession({ query: { disableCookieCache: true } })).data
				?.session.id,
		).toBe(replacement.id);
		expect(
			db.session.some(
				(record) => record.userId === sourceId && record.id !== replacement.id,
			),
		).toBe(kind !== "same-user");
		expect(delivered).not.toHaveBeenCalled();
		expect(requests).not.toContain("/api/auth/send-verification-email");
		if (kind !== "registered")
			expect(
				screen.getByRole("button", { name: /déconnecter.*renvoyer/i }),
			).toBeDisabled();
	},
);

it.each(["anonymous", "same-user", "registered"] as const)(
	"replacement %s before confirmation invalidates consent without calling any revoke endpoint",
	async (kind) => {
		const user = await promptConsent();
		const replacement = await prepareReplacement(kind);
		replacement.apply();
		await user.click(
			screen.getByRole("button", { name: /déconnecter.*renvoyer/i }),
		);
		await waitFor(() => {
			const checkbox = screen.queryByRole("checkbox");
			if (kind === "registered") expect(checkbox).not.toBeInTheDocument();
			else expect(checkbox).not.toBeChecked();
		});
		expect(requests).not.toContain("/api/auth/revoke-session");
		expect(requests).not.toContain("/api/auth/sign-out");
		expect(requests).not.toContain("/api/auth/send-verification-email");
		expect(db.session.some((record) => record.id === replacement.id)).toBe(
			true,
		);
		expect(
			db.session.some(
				(record) => record.userId === sourceId && record.id !== replacement.id,
			),
		).toBe(true);
		expect(
			(await client.getSession({ query: { disableCookieCache: true } })).data
				?.session.id,
		).toBe(replacement.id);
		expect(delivered).not.toHaveBeenCalled();
		if (kind !== "registered") {
			// New acknowledgment is required; it applies only to the fresh source.
			await user.click(screen.getByRole("checkbox"));
			await user.click(
				screen.getByRole("button", { name: /déconnecter.*renvoyer/i }),
			);
			await waitFor(() => expect(delivered).toHaveBeenCalledTimes(1));
			expect(db.session.some((record) => record.id === replacement.id)).toBe(
				false,
			);
			expect(
				db.session.some(
					(record) =>
						record.userId === sourceId && record.id !== replacement.id,
				),
			).toBe(true);
			expect(requests).not.toContain("/api/auth/sign-out");
		}
	},
);
it("signed-out replacement before confirmation clears consent without resend", async () => {
	const user = await promptConsent();
	// Native logout in the other tab, not a component mutation.
	await client.signOut();
	const count = requests.length;
	await user.click(
		screen.getByRole("button", { name: /déconnecter.*renvoyer/i }),
	);
	await waitFor(() =>
		expect(screen.queryByRole("checkbox")).not.toBeInTheDocument(),
	);
	expect(requests.slice(count)).not.toContain("/api/auth/sign-out");
	expect(requests.slice(count)).not.toContain("/api/auth/revoke-session");
	expect(requests.slice(count)).not.toContain(
		"/api/auth/send-verification-email",
	);
	expect(delivered).not.toHaveBeenCalled();
});
