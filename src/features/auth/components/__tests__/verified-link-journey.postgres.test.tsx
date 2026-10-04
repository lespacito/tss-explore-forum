import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymousClient } from "better-auth/client/plugins";
import { anonymous } from "better-auth/plugins";
import { createAuthClient } from "better-auth/react";
import { credentials } from "better-auth-credentials-plugin";
import { credentialsClient } from "better-auth-credentials-plugin/client";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { z } from "zod";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import * as schema from "@/db/schemas/user";

const state = vi.hoisted(() => ({
	auth: null as any,
	client: null as any,
	db: null as any,
	request: null as any,
	profile: null as any,
}));
vi.mock("@/db", () => ({
	get db() {
		return state.db;
	},
}));
vi.mock("@/db/index", () => ({
	get db() {
		return state.db;
	},
}));
vi.mock("@/features/auth/lib/auth", () => ({
	get auth() {
		return state.auth;
	},
}));
vi.mock("@/features/auth/lib/auth-client", () => ({
	getSession: (...args: any[]) => state.client.getSession(...args),
}));
vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => ({
		validator: (validator: any) => ({
			handler: (handler: any) => (input: any) =>
				handler({ data: validator.parse(input.data) }),
		}),
	}),
}));
vi.mock("@tanstack/react-start/server", () => ({
	getRequest: () => state.request(),
	getRequestIP: () => "127.0.0.1",
}));
vi.mock("@/features/auth/lib/security/arcjet-policies", () => ({
	protectAuthEndpoint: async () => ({
		isDenied: () => false,
		isErrored: () => false,
	}),
}));
vi.mock("@/features/auth/lib/security/link-attempt-limiter", () => ({
	consumeLinkAttempt: () => true,
}));
vi.mock("@/features/auth/server/get-auth-session", () => ({
	getAuthSession: async () => {
		const session = await state.auth.api.getSession({
			headers: state.request().headers,
		});
		return { ...session, isAuthenticated: !!session };
	},
	getAuthSessionCached: async () => {
		const session = await state.auth.api.getSession({
			headers: state.request().headers,
		});
		return { ...session, isAuthenticated: !!session };
	},
}));
vi.mock("@/features/threads/server/actions/get-user-threads", () => ({
	getUserThreadsFn: async () => [],
}));
vi.mock("@/features/auth/server/generate-secret-code-fn", () => ({
	generateSecretCodeFn: vi.fn(),
}));
vi.mock("@tanstack/react-router", () => ({
	createFileRoute: () => (options: any) => ({
		options,
		useLoaderData: () => state.profile,
	}),
	Link: ({ to, children }: any) => <a href={to}>{children}</a>,
	redirect: vi.fn(),
}));
vi.mock("@/lib/logger/client-logger", () => ({
	logger: { info: vi.fn(), error: vi.fn() },
}));
vi.mock("@/lib/logger/server", () => ({ logger: { error: vi.fn() } }));
vi.mock("sonner", () => ({
	toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() },
}));

const enabled = process.env.TEST_LINK_PG_PORT === "32769";
let sql: ReturnType<typeof postgres>;
const isolatedSchema = `journey_${crypto.randomUUID().replaceAll("-", "")}`;
const delivered = vi.fn();
const cookies = new Map<string, string>();
const requests: string[] = [];
const inputSchema = z.object({
	secretCode: z.string().regex(/^[A-Z2-9]{4}-[A-Z2-9]{4}$/),
});
const email = "journey@example.com";
const password = "verified-password-123";
const sourceAliasId = "00000000-0000-4000-8000-000000000001";
afterEach(() => vi.unstubAllGlobals());

beforeAll(async () => {
	if (!enabled) return;
	vi.stubGlobal("Uint8Array", new TextEncoder().encode("").constructor);
	// Only the expressly authorized disposable DB; separate search_path prevents
	// this harness touching the concurrent transaction suite's public tables.
	sql = postgres({
		host: "127.0.0.1",
		port: 32769,
		database: "pv_link_disposable",
		username: "postgres",
		connection: { search_path: isolatedSchema },
		max: 5,
		onnotice: () => {},
	});
	await sql.unsafe(`create schema ${isolatedSchema}`);
	await sql`create table "user" (id text primary key, name text not null default '', email text unique not null, email_verified boolean not null default false, image text, role text not null default 'USER', username text, display_username text, is_anonymous boolean not null default false, bio text, banned boolean not null default false, secret_code text, secret_code_generated_at timestamp, created_at timestamp default now(), updated_at timestamp default now())`;
	await sql`create table session (id text primary key, expires_at timestamp not null, token text unique not null, user_id text references "user"(id), created_at timestamp default now(), updated_at timestamp default now(), ip_address text, user_agent text)`;
	await sql`create table account (id text primary key, account_id text, provider_id text, user_id text references "user"(id), password text, access_token text, refresh_token text, id_token text, access_token_expires_at timestamp, refresh_token_expires_at timestamp, scope text, created_at timestamp default now(), updated_at timestamp default now(), unique(provider_id,account_id))`;
	await sql`create table verification (id text primary key, identifier text not null, value text not null, expires_at timestamp not null, created_at timestamp default now(), updated_at timestamp default now())`;
	await sql`create table alias (id uuid primary key default gen_random_uuid(), user_id text not null references "user"(id), alias text unique not null, is_primary boolean not null default false, rotation_enabled boolean not null default false, created_at timestamp default now())`;
	state.db = drizzle(sql, { schema });
	const { findUserBySecretCode } = await import(
		"@/features/auth/lib/find-user-by-code"
	);
	state.auth = betterAuth({
		baseURL: "http://localhost:3000",
		secret: "isolated-native-journey-secret-at-least-32-chars",
		database: drizzleAdapter(state.db, { provider: "pg", schema }),
		emailAndPassword: { enabled: true, requireEmailVerification: true },
		emailVerification: {
			autoSignInAfterVerification: true,
			sendOnSignUp: true,
			sendVerificationEmail: delivered,
		},
		hooks: {
			after: createAuthMiddleware(async (ctx) => {
				// Match production's anonymous-only synthetic-email auto-verification;
				// registered destinations still require consuming the real signed link.
				const session = ctx.context.newSession;
				if (session?.user.isAnonymous)
					await sql`update "user" set email_verified=true where id=${session.user.id}`;
			}),
		},
		plugins: [
			anonymous({ disableDeleteAnonymousUser: true }),
			credentials({
				providerId: "secret-code",
				inputSchema,
				linkAccountIfExisting: true,
				callback: async (ctx) => {
					const user = await findUserBySecretCode(ctx.body.secretCode);
					// Same idempotent secret-code account fallback as the application callback.
					if (user)
						await sql`insert into account (id,account_id,provider_id,user_id) values (${crypto.randomUUID()},${user.id},'secret-code',${user.id}) on conflict(provider_id,account_id) do nothing`;
					return user ? { id: user.id, email: user.email } : null;
				},
			}),
		],
	});
	state.request = () =>
		new Request("http://localhost:3000/link", {
			headers: {
				cookie: [...cookies]
					.map(([key, value]) => `${key}=${value}`)
					.join("; "),
				origin: "http://localhost:3000",
			},
		});
	state.client = createAuthClient({
		baseURL: "http://localhost:3000",
		plugins: [anonymousClient(), credentialsClient()],
		fetchOptions: {
			customFetchImpl: async (input, init) => {
				const headers = new Headers(init?.headers);
				headers.set("origin", "http://localhost:3000");
				headers.set("cookie", state.request().headers.get("cookie") || "");
				const request = new Request(input, {
					...init,
					signal: undefined,
					headers,
				});
				requests.push(new URL(request.url).pathname);
				const response = await state.auth.handler(request);
				for (const cookie of response.headers.getSetCookie()) {
					const pair = cookie.split(";")[0];
					const separator = pair.indexOf("=");
					const key = pair.slice(0, separator);
					const value = pair.slice(separator + 1);
					if (/max-age=0/i.test(cookie)) cookies.delete(key);
					else cookies.set(key, value);
				}
				return response;
			},
		},
	});
});
afterAll(async () => {
	if (sql) {
		await sql.unsafe(`drop schema ${isolatedSchema} cascade`);
		await sql.end();
	}
});

it.skipIf(!enabled)(
	"native verification URL → real secret-code recovery → production profile entry → authorized PG transfer → explicit verified signin",
	async () => {
		// Signup once, signed out: never make a second signup attempt to reach linking.
		const signup = await state.client.signUp.email({
			email,
			password,
			name: "Destination",
		});
		expect(signup.error).toBeNull();
		const targetId = signup.data.user.id;
		expect(
			(await sql`select email_verified from "user" where id=${targetId}`)[0]
				.email_verified,
		).toBe(false);
		const anonymous = await state.client.signIn.anonymous();
		expect(anonymous.error).toBeNull();
		const sourceId = anonymous.data.user.id;
		await sql`update "user" set secret_code='ABCD-EFGH' where id=${sourceId}`;
		await sql`insert into alias (id,user_id,alias,is_primary) values (${sourceAliasId},${sourceId},'original-alias',true)`;
		const { linkAnonymousAccountFn } = await import(
			"@/features/auth/server/link-anonymous-account"
		);
		expect(await linkAnonymousAccountFn({ data: { email, password } })).toEqual(
			{ success: false, error: "Identifiants invalides" },
		);
		expect(
			await sql`select user_id from alias where id=${sourceAliasId}`,
		).toEqual([{ user_id: sourceId }]);
		expect((await state.client.getSession()).data.user.id).toBe(sourceId);
		await state.client.signOut();
		const url = delivered.mock.calls[0][0].url;
		expect(url).toContain("/verify-email?token=");
		// Follow the actual signed URL via the same native transport/cookie jar.
		const verified = await state.client.$fetch(url);
		expect(verified.error).toMatchObject({ status: 302 }); // native verification redirects to its callback
		expect(
			(await sql`select email_verified from "user" where id=${targetId}`)[0]
				.email_verified,
		).toBe(true);
		expect((await state.client.getSession()).data.user.id).toBe(targetId);
		await state.client.signOut();
		const recovered = await state.client.signIn.credentials({
			secretCode: "ABCD-EFGH",
		});
		expect(recovered.error).toBeNull();
		const session = await state.client.getSession();
		expect(session.data.user.id).toBe(sourceId);
		expect(session.data.user.isAnonymous).toBe(true);
		expect(
			await linkAnonymousAccountFn({
				data: { email, password: "wrong-password" },
			}),
		).toEqual({ success: false, error: "Identifiants invalides" });
		expect(
			await sql`select user_id from alias where id=${sourceAliasId}`,
		).toEqual([{ user_id: sourceId }]);
		expect((await state.client.getSession()).data.user.id).toBe(sourceId);
		const { Route } = await import("@/routes/account/profile/index");
		state.profile = await (Route.options.loader as any)();
		expect(state.profile.user.id).toBe(sourceId);
		const Profile = Route.options.component!;
		render(<Profile />);
		const user = userEvent.setup();
		await user.click(
			screen.getByRole("button", { name: "Lier à un compte vérifié" }),
		);
		await user.type(screen.getByLabelText(/^email du compte vérifié$/i), email);
		await user.type(
			screen.getByLabelText(/mot de passe du compte vérifié/i),
			password,
		);
		const signoutsBefore = requests.filter(
			(path) => path === "/api/auth/sign-out",
		).length;
		await user.click(screen.getByRole("button", { name: /oui, lier/i }));
		await waitFor(() =>
			expect(screen.getByText(/liaison effectuée/i)).toBeInTheDocument(),
		);
		expect(
			await sql`select id::text,user_id,alias,is_primary from alias`,
		).toEqual([
			{
				id: sourceAliasId,
				user_id: targetId,
				alias: "original-alias",
				is_primary: true,
			},
		]);
		expect((await state.client.getSession()).data.user.id).toBe(sourceId);
		expect(
			requests.filter((path) => path === "/api/auth/sign-out"),
		).toHaveLength(signoutsBefore);
		expect(
			requests.filter((path) => path === "/api/auth/sign-up/email"),
		).toHaveLength(1);
		expect(
			screen.getByRole("link", { name: /se connecter au compte vérifié/i }),
		).toHaveAttribute("href", "/auth/login");
		// Explicit destination login through native BA (the UI only offers the link).
		const signin = await state.client.signIn.email({ email, password });
		expect(signin.error).toBeNull();
		expect((await state.client.getSession()).data.user.id).toBe(targetId);
		expect(
			await sql`select user_id from alias where id=${sourceAliasId}`,
		).toEqual([{ user_id: targetId }]);
	},
	20000,
);
