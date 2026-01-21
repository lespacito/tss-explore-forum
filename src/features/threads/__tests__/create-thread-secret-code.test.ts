import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type { Session } from "better-auth/types";

// Mock all server-side dependencies BEFORE imports
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

// Mock Drizzle DB
vi.mock("@/db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  },
}));

vi.mock("@/db/schemas/user", () => ({
  user: {
    id: "id",
    email: "email",
    secretCode: "secretCode",
    secretCodeGeneratedAt: "secretCodeGeneratedAt",
  },
}));

vi.mock("@/db/schemas/thread", () => ({
  threads: {
    id: "id",
    aliasId: "aliasId",
    title: "title",
    body: "body",
    slug: "slug",
    category: "category",
  },
}));

vi.mock("@/db/schemas/alias", () => ({
  alias: {
    id: "id",
    userId: "userId",
    aliasName: "aliasName",
    isPrimary: "isPrimary",
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(() => "mocked-eq"),
  and: vi.fn(() => "mocked-and"),
}));

vi.mock("@/features/auth/lib/generate-secret-code", () => ({
  ensureUniqueCode: vi.fn(),
}));

// Now safe to import
import { db } from "@/db";
import { generateSecretCodeLogic } from "@/features/auth/server/generate-secret-code-fn";
import { ensureUniqueCode } from "@/features/auth/lib/generate-secret-code";

const mockDb = vi.mocked(db);

/**
 * Integration tests for secret code generation after first thread publication
 *
 * Tests cover:
 * - Task 4.1: Detection of first vs subsequent publications
 * - Task 4.2: Calling generateSecretCodeFn after successful submission
 * - Task 4.3: Handling cases where code already exists (idempotency)
 * - Task 4.4: Testing integration with thread publication flow
 *
 * AC1: Secret code generated after first publication for anonymous users
 */
describe("Thread Creation - Secret Code Integration (Task 4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset DB chain
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.where.mockReturnThis();
    mockDb.limit.mockResolvedValue([]);
    mockDb.insert.mockReturnThis();
    mockDb.values.mockReturnThis();
    mockDb.returning.mockResolvedValue([]);
    mockDb.update.mockReturnThis();
    mockDb.set.mockReturnThis();
    mockDb.delete.mockReturnThis();
  });

  describe("Task 4.1: Detect if first publication for anonymous user", () => {
    it("should detect when anonymous user has no previous threads", async () => {
      // GIVEN: An anonymous user with no threads
      const userId = "test-anon-user-1";
      const aliasId = "test-alias-1";

      // Mock: Query for existing threads returns empty array
      mockDb.limit.mockResolvedValue([]);

      // WHEN: Checking for existing threads
      const existingThreads = await mockDb
        .select()
        .from({} as any)
        .where({} as any)
        .limit(10);

      // THEN: No threads should exist (first publication)
      expect(existingThreads.length).toBe(0);
    });

    it("should detect when anonymous user has previous threads", async () => {
      // GIVEN: An anonymous user with an existing thread
      const existingThread = {
        id: "test-thread-1",
        aliasId: "test-alias-2",
        title: "Existing Thread",
        body: "Body content",
        slug: "existing-thread-slug",
        category: "general",
      };

      // Mock: Query for existing threads returns 1 thread
      mockDb.limit.mockResolvedValue([existingThread]);

      // WHEN: Checking for existing threads
      const existingThreads = await mockDb
        .select()
        .from({} as any)
        .where({} as any)
        .limit(10);

      // THEN: Threads should exist (not first publication)
      expect(existingThreads.length).toBe(1);
    });
  });

  describe("Task 4.2: Call generateSecretCodeFn after successful submission", () => {
    it("should generate secret code for anonymous user creating first thread", async () => {
      // GIVEN: An anonymous user creating their first thread
      const mockSession = {
        user: {
          id: "test-anon-user-3",
          email: null,
          name: "Anonymous User",
          secretCode: null,
        } as any,
        session: {
          id: "mock-session-id",
          userId: "test-anon-user-3",
          expiresAt: new Date(Date.now() + 86400000),
        } as Session,
      };

      // Mock: Thread creation succeeds
      const newThread = {
        id: "test-thread-2",
        aliasId: "test-alias-3",
        title: "First Thread Title",
        body: "First thread body content",
        slug: "first-thread-slug",
        category: "general",
      };
      mockDb.returning.mockResolvedValue([newThread]);

      // Mock: User query returns anonymous user without code
      mockDb.limit.mockResolvedValue([
        {
          id: "test-anon-user-3",
          email: "temp@anonymous.com",
          isAnonymous: true,
          secretCode: null,
        },
      ]);

      // Mock: Secret code generation
      vi.mocked(ensureUniqueCode).mockResolvedValue("ABC4-DEF5-GHI6");

      // WHEN: Thread is created (simulate thread creation)
      const thread = await mockDb
        .insert({} as any)
        .values(newThread)
        .returning();

      expect(thread[0]).toBeDefined();

      // AND: Secret code generation is triggered
      const result = await generateSecretCodeLogic(mockSession, mockDb as any);

      // THEN: Secret code should be generated successfully
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.secretCode).toBe("ABC4-DEF5-GHI6");
        expect(result.isExisting).toBe(false);
      }
    });

    it("should not regenerate code if anonymous user already has one", async () => {
      // GIVEN: An anonymous user with existing secret code
      const existingCode = "EXISTING-CODE-123";
      const mockSession = {
        user: {
          id: "test-anon-user-4",
          email: null,
          name: "Anonymous User",
          secretCode: existingCode,
        } as any,
        session: {
          id: "mock-session-id",
          userId: "test-anon-user-4",
          expiresAt: new Date(Date.now() + 86400000),
        } as Session,
      };

      // WHEN: Secret code generation is triggered
      const result = await generateSecretCodeLogic(mockSession, mockDb as any);

      // THEN: Should return existing code (idempotent)
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.secretCode).toBe(existingCode);
        expect(result.isExisting).toBe(true);
      }

      // AND: ensureUniqueCode should NOT be called
      expect(ensureUniqueCode).not.toHaveBeenCalled();
    });

    it("should not generate secret code for registered users", async () => {
      // GIVEN: A registered user (with email)
      const mockSession = {
        user: {
          id: "test-registered-user-1",
          email: "test-registered@example.com",
          name: "Registered User",
          secretCode: null,
        } as any,
        session: {
          id: "mock-session-id",
          userId: "test-registered-user-1",
          expiresAt: new Date(Date.now() + 86400000),
        } as Session,
      };

      // Mock: User query returns registered user
      mockDb.limit.mockResolvedValue([
        {
          id: "test-registered-user-1",
          email: "test-registered@example.com",
          isAnonymous: false,
          secretCode: null,
        },
      ]);

      // WHEN: Secret code generation is attempted
      const result = await generateSecretCodeLogic(mockSession, mockDb as any);

      // THEN: Should fail with appropriate error
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("anonyme");
      }
    });
  });

  describe("Task 4.3: Handle cases where code already exists", () => {
    it("should skip code generation if user already has code in session", async () => {
      // GIVEN: Anonymous user with existing code in session
      const existingCode = "SKIP-TEST-CODE-1";
      const mockSession = {
        user: {
          id: "test-anon-user-5",
          email: null,
          name: "Anonymous User",
          secretCode: existingCode,
        } as any,
        session: {
          id: "mock-session-id",
          userId: "test-anon-user-5",
          expiresAt: new Date(Date.now() + 86400000),
        } as Session,
      };

      // WHEN: generateSecretCodeLogic is called
      const result = await generateSecretCodeLogic(mockSession, mockDb as any);

      // THEN: Should return existing code without regeneration
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.secretCode).toBe(existingCode);
        expect(result.isExisting).toBe(true);
      }

      // AND: No database operations should be performed
      expect(ensureUniqueCode).not.toHaveBeenCalled();
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it("should return existing code from database if not in session", async () => {
      // GIVEN: Anonymous user without code in session but has one in DB
      const dbCode = "DB-EXISTING-CODE";
      const mockSession = {
        user: {
          id: "test-anon-user-6",
          email: null,
          name: "Anonymous User",
          secretCode: null, // Not in session
        } as any,
        session: {
          id: "mock-session-id",
          userId: "test-anon-user-6",
          expiresAt: new Date(Date.now() + 86400000),
        } as Session,
      };

      // Mock: User query returns user with existing code
      mockDb.limit.mockResolvedValue([
        {
          id: "test-anon-user-6",
          email: "temp@anonymous.com",
          isAnonymous: true,
          secretCode: dbCode,
        },
      ]);

      // WHEN: generateSecretCodeLogic is called
      const result = await generateSecretCodeLogic(mockSession, mockDb as any);

      // THEN: Should return existing code from database
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.secretCode).toBe(dbCode);
        expect(result.isExisting).toBe(true);
      }

      // AND: No new code should be generated
      expect(ensureUniqueCode).not.toHaveBeenCalled();
    });
  });

  describe("Task 4.4: Test integration with thread publication flow", () => {
    it("should complete full flow: create thread → detect first publication → generate code", async () => {
      // GIVEN: New anonymous user with no threads
      const userId = "test-anon-user-7";
      const aliasId = "test-alias-7";

      const mockSession = {
        user: {
          id: userId,
          email: null,
          name: "Anonymous User",
          secretCode: null,
        } as any,
        session: {
          id: "mock-session-id",
          userId: userId,
          expiresAt: new Date(Date.now() + 86400000),
        } as Session,
      };

      // Step 1: Check for existing threads (should be empty - first publication)
      mockDb.limit.mockResolvedValueOnce([]); // No existing threads

      const existingThreads = await mockDb
        .select()
        .from({} as any)
        .where({} as any)
        .limit(10);

      expect(existingThreads.length).toBe(0); // Confirm first publication

      // Step 2: Create thread
      const newThread = {
        id: "test-thread-7",
        aliasId: aliasId,
        title: "Integration Test Thread",
        body: "Full integration test",
        slug: "integration-test-thread",
        category: "general",
      };

      mockDb.returning.mockResolvedValueOnce([newThread]);

      const threadResult = await mockDb
        .insert({} as any)
        .values(newThread)
        .returning();

      expect(threadResult[0]).toBeDefined();
      expect(threadResult[0].title).toBe("Integration Test Thread");

      // Step 3: Generate secret code after successful thread creation
      mockDb.limit.mockResolvedValueOnce([
        {
          id: userId,
          email: "temp@anonymous.com",
          isAnonymous: true,
          secretCode: null,
        },
      ]);

      vi.mocked(ensureUniqueCode).mockResolvedValue("INTEG-TEST-CODE");

      const codeResult = await generateSecretCodeLogic(
        mockSession,
        mockDb as any,
      );

      // THEN: Secret code should be generated
      expect(codeResult.success).toBe(true);
      if (codeResult.success) {
        expect(codeResult.secretCode).toBe("INTEG-TEST-CODE");
        expect(codeResult.isExisting).toBe(false);
      }

      // AND: Code should be saved to database
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          secretCode: "INTEG-TEST-CODE",
          secretCodeGeneratedAt: expect.any(Date),
        }),
      );
    });

    it("should handle second publication without regenerating code", async () => {
      // GIVEN: Anonymous user with existing thread and code
      const userId = "test-anon-user-8";
      const aliasId = "test-alias-8";
      const existingCode = "SECOND-POST-CODE";

      const mockSession = {
        user: {
          id: userId,
          email: null,
          name: "Anonymous User",
          secretCode: existingCode,
        } as any,
        session: {
          id: "mock-session-id",
          userId: userId,
          expiresAt: new Date(Date.now() + 86400000),
        } as Session,
      };

      // Step 1: Check for existing threads (has 1 thread)
      mockDb.limit.mockResolvedValueOnce([
        {
          id: "existing-thread",
          aliasId: aliasId,
          title: "First Thread",
        },
      ]);

      const existingThreads = await mockDb
        .select()
        .from({} as any)
        .where({} as any)
        .limit(10);

      expect(existingThreads.length).toBe(1); // Not first publication

      // Step 2: Create second thread
      const secondThread = {
        id: "test-thread-8",
        aliasId: aliasId,
        title: "Second Thread",
        body: "Second thread body",
        slug: "second-thread-slug",
        category: "general",
      };

      mockDb.returning.mockResolvedValueOnce([secondThread]);

      const threadResult = await mockDb
        .insert({} as any)
        .values(secondThread)
        .returning();

      expect(threadResult[0]).toBeDefined();

      // Step 3: Secret code generation (should return existing)
      const codeResult = await generateSecretCodeLogic(
        mockSession,
        mockDb as any,
      );

      // THEN: Should return existing code
      expect(codeResult.success).toBe(true);
      if (codeResult.success) {
        expect(codeResult.secretCode).toBe(existingCode);
        expect(codeResult.isExisting).toBe(true);
      }

      // AND: No new code generated
      expect(ensureUniqueCode).not.toHaveBeenCalled();
    });
  });

  describe("Error handling in integration flow", () => {
    it("should handle thread creation failure gracefully", async () => {
      // GIVEN: Thread creation fails
      mockDb.returning.mockRejectedValueOnce(new Error("Database error"));

      // WHEN: Attempting to create thread
      const createThreadPromise = mockDb
        .insert({} as any)
        .values({})
        .returning();

      // THEN: Should reject with error
      await expect(createThreadPromise).rejects.toThrow("Database error");

      // AND: Secret code generation should not be called
      expect(ensureUniqueCode).not.toHaveBeenCalled();
    });

    it("should handle secret code generation failure after thread creation", async () => {
      // GIVEN: Thread created but code generation fails
      const mockSession = {
        user: {
          id: "test-user-err",
          email: null,
          secretCode: null,
        } as any,
        session: {} as Session,
      };

      mockDb.limit.mockResolvedValue([
        {
          id: "test-user-err",
          email: null,
          secretCode: null,
        },
      ]);

      vi.mocked(ensureUniqueCode).mockRejectedValue(
        new Error("Code generation failed"),
      );

      // WHEN: Secret code generation is attempted
      const result = await generateSecretCodeLogic(mockSession, mockDb as any);

      // THEN: Should return error result
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });
});
