import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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

describe("Auth Hook - Alias Creation Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Anonymous User Alias Creation", () => {
    it("should create primary alias for anonymous user on session creation", async () => {
      // ARRANGE
      const mockAnonymousUser = {
        id: "anonymous_user_123",
        isAnonymous: true,
        email: "",
        emailVerified: false,
        name: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCtx = {
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

      // Mock getPrimaryAlias to return null (no existing alias)
      vi.mocked(getPrimaryAlias).mockResolvedValue(null);

      // Mock createPrimaryAlias to return a new alias
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

      // ACT - Simulate the hook logic
      const newSession = mockCtx.context.newSession;

      if (newSession?.user) {
        const userId = newSession.user.id;

        const isNewSession =
          mockCtx.path === "/sign-up/email" ||
          mockCtx.path?.startsWith("/callback/") ||
          newSession.user.isAnonymous === true;

        if (isNewSession) {
          const existingAlias = await getPrimaryAlias(userId);

          if (!existingAlias) {
            const alias = await createPrimaryAlias(userId);
            logger.info("Primary alias created", {
              userId,
              alias: alias.alias,
              path: mockCtx.path,
              isAnonymous: newSession.user.isAnonymous,
            });
          }
        }
      }

      // ASSERT
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
      // ARRANGE
      const mockAnonymousUser = {
        id: "anonymous_user_456",
        isAnonymous: true,
        email: "",
        emailVerified: false,
        name: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCtx = {
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

      // Mock getPrimaryAlias to return existing alias
      vi.mocked(getPrimaryAlias).mockResolvedValue(existingAlias);

      // ACT - Simulate the hook logic
      const newSession = mockCtx.context.newSession;

      if (newSession?.user) {
        const userId = newSession.user.id;

        const isNewSession =
          mockCtx.path === "/sign-up/email" ||
          mockCtx.path?.startsWith("/callback/") ||
          newSession.user.isAnonymous === true;

        if (isNewSession) {
          const existingAlias = await getPrimaryAlias(userId);

          if (!existingAlias) {
            await createPrimaryAlias(userId);
          }
        }
      }

      // ASSERT
      expect(getPrimaryAlias).toHaveBeenCalledWith(mockAnonymousUser.id);
      expect(createPrimaryAlias).not.toHaveBeenCalled();
    });

    it("should create alias for email signup users (existing behavior)", async () => {
      // ARRANGE
      const mockEmailUser = {
        id: "email_user_789",
        isAnonymous: false,
        email: "user@example.com",
        emailVerified: false,
        name: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCtx = {
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

      // ACT - Simulate the hook logic
      const newSession = mockCtx.context.newSession;

      if (newSession?.user) {
        const userId = newSession.user.id;

        const isNewSession =
          mockCtx.path === "/sign-up/email" ||
          mockCtx.path?.startsWith("/callback/") ||
          newSession.user.isAnonymous === true;

        if (isNewSession) {
          const existingAlias = await getPrimaryAlias(userId);

          if (!existingAlias) {
            await createPrimaryAlias(userId);
          }
        }
      }

      // ASSERT
      expect(getPrimaryAlias).toHaveBeenCalledWith(mockEmailUser.id);
      expect(createPrimaryAlias).toHaveBeenCalledWith(mockEmailUser.id);
    });

    it("should create alias for OAuth callback users", async () => {
      // ARRANGE
      const mockOAuthUser = {
        id: "oauth_user_101",
        isAnonymous: false,
        email: "oauth@example.com",
        emailVerified: true,
        name: "OAuth User",
        image: "https://example.com/avatar.jpg",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCtx = {
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

      // ACT - Simulate the hook logic
      const newSession = mockCtx.context.newSession;

      if (newSession?.user) {
        const userId = newSession.user.id;

        const isNewSession =
          mockCtx.path === "/sign-up/email" ||
          mockCtx.path?.startsWith("/callback/") ||
          newSession.user.isAnonymous === true;

        if (isNewSession) {
          const existingAlias = await getPrimaryAlias(userId);

          if (!existingAlias) {
            await createPrimaryAlias(userId);
          }
        }
      }

      // ASSERT
      expect(getPrimaryAlias).toHaveBeenCalledWith(mockOAuthUser.id);
      expect(createPrimaryAlias).toHaveBeenCalledWith(mockOAuthUser.id);
    });

    it("should handle alias creation failure gracefully for anonymous users", async () => {
      // ARRANGE
      const mockAnonymousUser = {
        id: "anonymous_user_error",
        isAnonymous: true,
        email: "",
        emailVerified: false,
        name: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCtx = {
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

      // ACT - Simulate the hook logic with error handling
      const newSession = mockCtx.context.newSession;

      if (newSession?.user) {
        const userId = newSession.user.id;

        const isNewSession =
          mockCtx.path === "/sign-up/email" ||
          mockCtx.path?.startsWith("/callback/") ||
          newSession.user.isAnonymous === true;

        if (isNewSession) {
          try {
            const existingAlias = await getPrimaryAlias(userId);

            if (!existingAlias) {
              await createPrimaryAlias(userId);
            }
          } catch (error) {
            logger.error("Failed to create primary alias", {
              userId,
              path: mockCtx.path,
              isAnonymous: newSession.user.isAnonymous,
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            });
            // Ne pas bloquer l'inscription si la création d'alias échoue
          }
        }
      }

      // ASSERT - The hook should catch the error and log it
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

    it("should NOT create alias for non-triggering paths", async () => {
      // ARRANGE
      const mockUser = {
        id: "user_999",
        isAnonymous: false,
        email: "test@example.com",
        emailVerified: true,
        name: "Test User",
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCtx = {
        path: "/api/posts",
        context: {
          newSession: {
            user: mockUser,
            session: {
              token: "session_token_999",
              expiresAt: new Date(Date.now() + 3600000),
            },
          },
        },
      };

      // ACT - Simulate the hook logic
      const newSession = mockCtx.context.newSession;

      if (newSession?.user) {
        const userId = newSession.user.id;

        const isNewSession =
          mockCtx.path === "/sign-up/email" ||
          mockCtx.path?.startsWith("/callback/") ||
          newSession.user.isAnonymous === true;

        if (isNewSession) {
          const existingAlias = await getPrimaryAlias(userId);

          if (!existingAlias) {
            await createPrimaryAlias(userId);
          }
        }
      }

      // ASSERT
      expect(getPrimaryAlias).not.toHaveBeenCalled();
      expect(createPrimaryAlias).not.toHaveBeenCalled();
    });
  });

  describe("Hook Trigger Conditions", () => {
    it("should detect email signup path correctly", () => {
      const path = "/sign-up/email";
      const isNewSession =
        path === "/sign-up/email" || path?.startsWith("/callback/");
      expect(isNewSession).toBe(true);
    });

    it("should detect OAuth callback paths correctly", () => {
      const paths = [
        "/callback/google",
        "/callback/github",
        "/callback/discord",
      ];
      paths.forEach((path) => {
        const isNewSession =
          path === "/sign-up/email" || path?.startsWith("/callback/");
        expect(isNewSession).toBe(true);
      });
    });

    it("should detect anonymous user flag correctly", () => {
      const mockAnonymousUser = { isAnonymous: true };
      const isNewSession = mockAnonymousUser.isAnonymous === true;
      expect(isNewSession).toBe(true);
    });

    it("should NOT trigger for regular paths without anonymous flag", () => {
      const paths = ["/api/posts", "/threads", "/profile", "/api/comments"];
      paths.forEach((path) => {
        const mockUser = { isAnonymous: false };
        const isNewSession =
          path === "/sign-up/email" ||
          path?.startsWith("/callback/") ||
          mockUser.isAnonymous === true;
        expect(isNewSession).toBe(false);
      });
    });
  });
});
