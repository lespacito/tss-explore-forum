import { beforeEach, expect, it, vi } from "vitest";
import type { BetterAuthOptions } from "better-auth";
const mocks = vi.hoisted(() => ({
	options: null as BetterAuthOptions | null,
	welcome: vi.fn(),
}));
vi.mock("better-auth", () => ({
	betterAuth: (options: BetterAuthOptions) => {
		mocks.options = options;
		return {};
	},
}));
vi.mock("better-auth/adapters/drizzle", () => ({ drizzleAdapter: () => ({}) }));
vi.mock("@/db", () => ({ db: {} }));
vi.mock("@/data/env/server", () => ({
	env: { BETTER_AUTH_URL: "http://localhost:3000" },
}));
vi.mock("@/features/alias/lib/create-alias", () => ({
	createPrimaryAlias: vi.fn(),
}));
vi.mock("@/features/alias/lib/get-primary-alias", () => ({
	getPrimaryAlias: vi.fn(),
}));
vi.mock("@/features/auth/lib/find-user-by-code", () => ({
	findUserBySecretCode: vi.fn(),
}));
vi.mock("@/features/auth/server/send-welcome-email", () => ({
	sendWelcomeEmail: mocks.welcome,
}));
vi.mock(
	"@/features/auth/server/send-delete-account-verification-email",
	() => ({ sendDeleteAccountVerificationEmail: vi.fn() }),
);
vi.mock("@/features/auth/server/send-password-reset-email", () => ({
	sendPasswordResetEmail: vi.fn(),
}));
vi.mock("@/features/auth/server/send-verification-email", () => ({
	sendEmailVerificationEmail: vi.fn(),
}));
vi.mock("@/lib/logger/server", () => ({
	logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));
import "../lib/auth";
const registeredUser = {
	id: "registered",
	name: "New user",
	email: "new@example.com",
	emailVerified: false,
	createdAt: new Date(),
	updatedAt: new Date(),
};
it("sends welcome email only from the trusted user creation lifecycle", async () => {
	const after = mocks.options?.databaseHooks?.user?.create?.after;
	expect(after).toBeTypeOf("function");
	await after?.(registeredUser, null);
	expect(mocks.welcome).toHaveBeenCalledWith({
		email: registeredUser.email,
		name: registeredUser.name,
	});
});
beforeEach(() => vi.clearAllMocks());
it("does not send welcome mail to an anonymous synthetic email", async () => {
	await mocks.options?.databaseHooks?.user?.create?.after?.(
		{ ...registeredUser, isAnonymous: true },
		null,
	);
	expect(mocks.welcome).not.toHaveBeenCalled();
});
it("retains anonymous users and recovery codes when the installed plugin handles later sign-in", () => {
	const plugin = mocks.options?.plugins?.find(
		(plugin) => plugin.id === "anonymous",
	);
	expect(plugin?.options).toMatchObject({ disableDeleteAnonymousUser: true });
});
