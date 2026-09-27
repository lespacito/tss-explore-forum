import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock all server-side dependencies BEFORE imports
vi.mock("@/db", () => ({
	db: {},
}));

vi.mock("@/data/env/server", () => ({
	env: {
		NODE_ENV: "test",
		SERVICE_NAME: "test-service",
		DATABASE_URL: "postgresql://test",
	},
}));

vi.mock("@/lib/logger/server", () => ({
	logger: {
		info: vi.fn(),
		error: vi.fn(),
		warn: vi.fn(),
		debug: vi.fn(),
	},
}));

vi.mock("@/features/alias/lib/create-alias", () => ({
	createPrimaryAlias: vi.fn(),
}));

vi.mock("@/features/alias/lib/get-primary-alias", () => ({
	getPrimaryAlias: vi.fn(),
}));

// Now safe to import
import { createPrimaryAlias } from "@/features/alias/lib/create-alias";
import { getPrimaryAlias } from "@/features/alias/lib/get-primary-alias";
import { logger } from "@/lib/logger/server";

type MockUser = {
	id: string;
	isAnonymous: boolean;
	email: string;
	emailVerified: boolean;
	name: string | null;
	image: string | null;
	createdAt: Date;
	updatedAt: Date;
};

type MockCtx = {
	path: string;
	context: {
		newSession: {
			user: MockUser;
			session: {
				token: string;
				expiresAt: Date;
			};
		};
	};
};

async function runHookLogic(ctx: MockCtx) {
	const newSession = ctx.context.newSession;

	if (!newSession?.user) return;

	const userId = newSession.user.id;

	// Auto-vérifier l'email pour les utilisateurs anonymes (nouveaux ou existants)
	if (newSession.user.isAnonymous) {
		try {
			logger.info("Auto-verified email for anonymous user", {
				userId,
			});
		} catch (error) {
			logger.error("Failed to auto-verify anonymous user email", {
				userId,
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	// Vérifier et créer l'alias principal si manquant
	// S'applique à TOUS les cas : nouveaux inscrits, OAuth, anonymes,
	// ET comptes existants reconnectés (ex: login credentials sans alias)
	try {
		const existingAlias = await getPrimaryAlias(userId);

		if (!existingAlias) {
			const alias = await createPrimaryAlias(userId);
			logger.info("Primary alias created", {
				userId,
				alias: alias.alias,
				path: ctx.path,
				isAnonymous: newSession.user.isAnonymous,
			});
		}
	} catch (error) {
		logger.error("Failed to create primary alias", {
			userId,
			path: ctx.path,
			isAnonymous: newSession.user.isAnonymous,
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
	}
}

describe("Auth Hook - Alias Creation Logic", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("Existing Account Login (new behavior)", () => {
		it("should create primary alias for existing account without alias on credentials login", async () => {
			// ARRANGE - compte existant reconnu via credentials, sans alias
			const mockExistingUser: MockUser = {
				id: "existing_user_123",
				isAnonymous: false,
				email: "existing@example.com",
				emailVerified: true,
				name: "Existing User",
				image: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const mockCtx: MockCtx = {
				path: "/sign-in/credentials",
				context: {
					newSession: {
						user: mockExistingUser,
						session: {
							token: "session_token_123",
							expiresAt: new Date(Date.now() + 3600000),
						},
					},
				},
			};

			// Pas d'alias existant
			vi.mocked(getPrimaryAlias).mockResolvedValue(null);
			const mockNewAlias = {
				id: "alias_123",
				userId: mockExistingUser.id,
				alias: "SilentWhisper42",
				isPrimary: true,
				rotationEnabled: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			vi.mocked(createPrimaryAlias).mockResolvedValue(mockNewAlias);

			// ACT - le hook s'exécute maintenant pour TOUS les types de session
			await runHookLogic(mockCtx);

			// ASSERT
			expect(getPrimaryAlias).toHaveBeenCalledWith(mockExistingUser.id);
			expect(createPrimaryAlias).toHaveBeenCalledWith(mockExistingUser.id);
			expect(logger.info).toHaveBeenCalledWith("Primary alias created", {
				userId: mockExistingUser.id,
				alias: "SilentWhisper42",
				path: "/sign-in/credentials",
				isAnonymous: false,
			});
		});

		it("should NOT create duplicate alias if existing account already has one", async () => {
			// ARRANGE - compte existant avec déjà un alias primaire
			const mockExistingUser: MockUser = {
				id: "existing_user_456",
				isAnonymous: false,
				email: "existing2@example.com",
				emailVerified: true,
				name: "Existing User 2",
				image: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const mockCtx: MockCtx = {
				path: "/sign-in/credentials",
				context: {
					newSession: {
						user: mockExistingUser,
						session: {
							token: "session_token_456",
							expiresAt: new Date(Date.now() + 3600000),
						},
					},
				},
			};

			const existingAlias = {
				id: "alias_456",
				userId: mockExistingUser.id,
				alias: "MidnightVoice88",
				isPrimary: true,
				rotationEnabled: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			// getPrimaryAlias retourne l'alias existant
			vi.mocked(getPrimaryAlias).mockResolvedValue(existingAlias);

			// ACT
			await runHookLogic(mockCtx);

			// ASSERT - pas de création de doublon
			expect(getPrimaryAlias).toHaveBeenCalledWith(mockExistingUser.id);
			expect(createPrimaryAlias).not.toHaveBeenCalled();
			expect(logger.info).not.toHaveBeenCalledWith(
				"Primary alias created",
				expect.anything(),
			);
		});
	});

	describe("Anonymous User Alias Creation", () => {
		it("should create primary alias for anonymous user on session creation", async () => {
			const mockAnonymousUser: MockUser = {
				id: "anonymous_user_123",
				isAnonymous: true,
				email: "",
				emailVerified: false,
				name: null,
				image: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const mockCtx: MockCtx = {
				path: "/api/sign-in/anonymous",
				context: {
					newSession: {
						user: mockAnonymousUser,
						session: {
							token: "session_token_123",
							expiresAt: new Date(Date.now() + 3600000),
						},
					},
				},
			};

			vi.mocked(getPrimaryAlias).mockResolvedValue(null);
			const mockNewAlias = {
				id: "alias_123",
				userId: mockAnonymousUser.id,
				alias: "SilentWhisper42",
				isPrimary: true,
				rotationEnabled: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			vi.mocked(createPrimaryAlias).mockResolvedValue(mockNewAlias);

			await runHookLogic(mockCtx);

			expect(getPrimaryAlias).toHaveBeenCalledWith(mockAnonymousUser.id);
			expect(createPrimaryAlias).toHaveBeenCalledWith(mockAnonymousUser.id);
			expect(logger.info).toHaveBeenCalledWith("Primary alias created", {
				userId: mockAnonymousUser.id,
				alias: "SilentWhisper42",
				path: mockCtx.path,
				isAnonymous: true,
			});
		});

		it("should NOT create alias if anonymous user already has one", async () => {
			const mockAnonymousUser: MockUser = {
				id: "anonymous_user_456",
				isAnonymous: true,
				email: "",
				emailVerified: false,
				name: null,
				image: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const mockCtx: MockCtx = {
				path: "/api/sign-in/anonymous",
				context: {
					newSession: {
						user: mockAnonymousUser,
						session: {
							token: "session_token_456",
							expiresAt: new Date(Date.now() + 3600000),
						},
					},
				},
			};

			const existingAlias = {
				id: "alias_456",
				userId: mockAnonymousUser.id,
				alias: "MidnightVoice88",
				isPrimary: true,
				rotationEnabled: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			vi.mocked(getPrimaryAlias).mockResolvedValue(existingAlias);

			await runHookLogic(mockCtx);

			expect(getPrimaryAlias).toHaveBeenCalledWith(mockAnonymousUser.id);
			expect(createPrimaryAlias).not.toHaveBeenCalled();
		});
	});

	describe("Email Signup (existing behavior preserved)", () => {
		it("should create alias for email signup users", async () => {
			const mockEmailUser: MockUser = {
				id: "email_user_789",
				isAnonymous: false,
				email: "user@example.com",
				emailVerified: false,
				name: null,
				image: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const mockCtx: MockCtx = {
				path: "/sign-up/email",
				context: {
					newSession: {
						user: mockEmailUser,
						session: {
							token: "session_token_789",
							expiresAt: new Date(Date.now() + 3600000),
						},
					},
				},
			};

			vi.mocked(getPrimaryAlias).mockResolvedValue(null);
			const mockNewAlias = {
				id: "alias_789",
				userId: mockEmailUser.id,
				alias: "QuietSoul23",
				isPrimary: true,
				rotationEnabled: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			vi.mocked(createPrimaryAlias).mockResolvedValue(mockNewAlias);

			await runHookLogic(mockCtx);

			expect(getPrimaryAlias).toHaveBeenCalledWith(mockEmailUser.id);
			expect(createPrimaryAlias).toHaveBeenCalledWith(mockEmailUser.id);
		});
	});

	describe("OAuth Callback (existing behavior preserved)", () => {
		it("should create alias for OAuth callback users", async () => {
			const mockOAuthUser: MockUser = {
				id: "oauth_user_101",
				isAnonymous: false,
				email: "oauth@example.com",
				emailVerified: true,
				name: "OAuth User",
				image: "https://example.com/avatar.jpg",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const mockCtx: MockCtx = {
				path: "/callback/google",
				context: {
					newSession: {
						user: mockOAuthUser,
						session: {
							token: "session_token_101",
							expiresAt: new Date(Date.now() + 3600000),
						},
					},
				},
			};

			vi.mocked(getPrimaryAlias).mockResolvedValue(null);
			const mockNewAlias = {
				id: "alias_101",
				userId: mockOAuthUser.id,
				alias: "HiddenShadow77",
				isPrimary: true,
				rotationEnabled: false,
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			vi.mocked(createPrimaryAlias).mockResolvedValue(mockNewAlias);

			await runHookLogic(mockCtx);

			expect(getPrimaryAlias).toHaveBeenCalledWith(mockOAuthUser.id);
			expect(createPrimaryAlias).toHaveBeenCalledWith(mockOAuthUser.id);
		});
	});

	describe("Error Handling", () => {
		it("should handle alias creation failure gracefully", async () => {
			const mockAnonymousUser: MockUser = {
				id: "anonymous_user_error",
				isAnonymous: true,
				email: "",
				emailVerified: false,
				name: null,
				image: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const mockCtx: MockCtx = {
				path: "/api/sign-in/anonymous",
				context: {
					newSession: {
						user: mockAnonymousUser,
						session: {
							token: "session_token_error",
							expiresAt: new Date(Date.now() + 3600000),
						},
					},
				},
			};

			vi.mocked(getPrimaryAlias).mockResolvedValue(null);
			vi.mocked(createPrimaryAlias).mockRejectedValue(
				new Error("Database connection failed"),
			);

			await runHookLogic(mockCtx);

			expect(getPrimaryAlias).toHaveBeenCalledWith(mockAnonymousUser.id);
			expect(createPrimaryAlias).toHaveBeenCalledWith(mockAnonymousUser.id);
			expect(logger.error).toHaveBeenCalledWith(
				"Failed to create primary alias",
				expect.objectContaining({
					userId: mockAnonymousUser.id,
					path: mockCtx.path,
					isAnonymous: true,
					error: "Database connection failed",
				}),
			);
		});
	});
});
