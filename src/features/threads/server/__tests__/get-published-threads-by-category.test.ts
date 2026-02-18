import { describe, expect, it, vi } from "vitest";
import type { ThreadCategory } from "@/data/threads-categories";

/**
 * Test Suite: getPublishedThreadsByCategory
 * Coverage: Task 1 - Filtered DB query by category (Story 3.2)
 *
 * Strategy: Test the function contract using mocks.
 * The real DB integration is validated manually / via E2E.
 */

// Mock the db module
vi.mock("@/db", () => ({
	db: {
		select: vi.fn(),
	},
}));

// Mock drizzle-orm operators
vi.mock("drizzle-orm", () => ({
	and: vi.fn((...args) => ({ type: "and", conditions: args })),
	desc: vi.fn((col) => ({ type: "desc", col })),
	eq: vi.fn((col, val) => ({ type: "eq", col, val })),
	isNull: vi.fn((col) => ({ type: "isNull", col })),
}));

// Mock schemas
vi.mock("@/db/schemas/thread", () => ({
	threads: {
		id: "id",
		status: "status",
		category: "category",
		deletedAt: "deletedAt",
		createdAt: "createdAt",
		updatedAt: "updatedAt",
		aliasId: "aliasId",
	},
}));
vi.mock("@/db/schemas/alias", () => ({
	alias: { id: "id", alias: "alias", userId: "userId" },
}));
vi.mock("@/db/schemas/user", () => ({
	user: { id: "id", displayUsername: "displayUsername" },
}));

describe("getPublishedThreadsByCategory", () => {
	const makeThread = (overrides = {}) => ({
		id: "thread-1",
		title: "Test Thread",
		body: "<p>Content</p>",
		slug: "test-thread",
		category: "VIOLENCE" as ThreadCategory,
		createdAt: new Date("2026-02-01T10:00:00Z"),
		updatedAt: new Date("2026-02-01T10:00:00Z"),
		aliasName: "Anonyme123",
		aliasId: "alias-1",
		displayUsername: null,
		...overrides,
	});

	describe("Subtask 1.2: Function contract", () => {
		it("should be exported from thread-queries module", async () => {
			const module = await import(
				"@/features/threads/server/db/thread-queries"
			);
			expect(typeof module.getPublishedThreadsByCategory).toBe("function");
		});

		it("should accept a ThreadCategory parameter", async () => {
			const { db } = await import("@/db");
			const mockResult = [makeThread()];

			const selectMock = vi.fn().mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						leftJoin: vi.fn().mockReturnValue({
							leftJoin: vi.fn().mockReturnValue({
								orderBy: vi.fn().mockResolvedValue(mockResult),
							}),
						}),
					}),
				}),
			});
			// biome-ignore lint/suspicious/noExplicitAny: Mock chain requires any for complex Drizzle ORM types
			vi.mocked(db.select).mockReturnValue(selectMock() as any);

			const { getPublishedThreadsByCategory } = await import(
				"@/features/threads/server/db/thread-queries"
			);

			// Should not throw when called with a valid category
			await expect(
				getPublishedThreadsByCategory("VIOLENCE"),
			).resolves.toBeDefined();
		});
	});

	describe("Date serialization", () => {
		it("should serialize dates to ISO strings", async () => {
			const { db } = await import("@/db");
			const rawDate = new Date("2026-02-01T10:00:00Z");
			const mockResult = [
				makeThread({ createdAt: rawDate, updatedAt: rawDate }),
			];

			const selectMock = vi.fn().mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						leftJoin: vi.fn().mockReturnValue({
							leftJoin: vi.fn().mockReturnValue({
								orderBy: vi.fn().mockResolvedValue(mockResult),
							}),
						}),
					}),
				}),
			});
			// biome-ignore lint/suspicious/noExplicitAny: Mock chain requires any for complex Drizzle ORM types
			vi.mocked(db.select).mockReturnValue(selectMock() as any);

			const { getPublishedThreadsByCategory } = await import(
				"@/features/threads/server/db/thread-queries"
			);
			const result = await getPublishedThreadsByCategory("VIOLENCE");

			expect(result[0].createdAt).toBe(rawDate.toISOString());
			expect(result[0].updatedAt).toBe(rawDate.toISOString());
			expect(typeof result[0].createdAt).toBe("string");
			expect(typeof result[0].updatedAt).toBe("string");
		});
	});

	describe("Empty results", () => {
		it("should return empty array when no threads in category", async () => {
			const { db } = await import("@/db");

			const selectMock = vi.fn().mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						leftJoin: vi.fn().mockReturnValue({
							leftJoin: vi.fn().mockReturnValue({
								orderBy: vi.fn().mockResolvedValue([]),
							}),
						}),
					}),
				}),
			});
			// biome-ignore lint/suspicious/noExplicitAny: Mock chain requires any for complex Drizzle ORM types
			vi.mocked(db.select).mockReturnValue(selectMock() as any);

			const { getPublishedThreadsByCategory } = await import(
				"@/features/threads/server/db/thread-queries"
			);
			const result = await getPublishedThreadsByCategory("AUTRE");

			expect(result).toEqual([]);
		});
	});
});
