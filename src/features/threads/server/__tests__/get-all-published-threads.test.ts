import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Tests for getAllPublishedThreads() database query
 * Story 3.1 AC1: Verify date serialization, field mapping, and query execution
 *
 * These tests verify the transformation logic of getAllPublishedThreads():
 * - Date serialization (Date → ISO string)
 * - Field preservation through the mapping step
 * - Edge cases (empty results, null fields)
 *
 * Query filter correctness (status='published', deletedAt IS NULL, orderBy DESC)
 * is verified by E2E tests with a real database (thread-list.e2e.test.ts).
 */

// Mock data simulating raw DB output (Date objects, not strings)
const mockDbRows = [
	{
		id: "thread-1",
		title: "Thread about violence",
		body: "<p>Content</p>",
		slug: "thread-about-violence",
		category: "VIOLENCE",
		createdAt: new Date("2024-01-15T10:00:00.000Z"),
		updatedAt: new Date("2024-01-15T12:00:00.000Z"),
		aliasName: "brave-fox",
		aliasId: "alias-1",
		displayUsername: "BraveFox",
	},
	{
		id: "thread-2",
		title: "Thread about support",
		body: "<p>Support content</p>",
		slug: "thread-about-support",
		category: "DETRESSE",
		createdAt: new Date("2024-01-14T08:00:00.000Z"),
		updatedAt: new Date("2024-01-14T09:30:00.000Z"),
		aliasName: "quiet-owl",
		aliasId: "alias-2",
		displayUsername: null,
	},
];

// Use vi.hoisted to define mock functions before vi.mock hoisting
const {
	mockSelect,
	mockFrom,
	mockWhere,
	mockLeftJoin1,
	mockLeftJoin2,
	mockOrderBy,
} = vi.hoisted(() => {
	const mockOrderBy = vi.fn();
	const mockLeftJoin2 = vi.fn(() => ({ orderBy: mockOrderBy }));
	const mockLeftJoin1 = vi.fn(() => ({ leftJoin: mockLeftJoin2 }));
	const mockWhere = vi.fn(() => ({ leftJoin: mockLeftJoin1 }));
	const mockFrom = vi.fn(() => ({ where: mockWhere }));
	const mockSelect = vi.fn(() => ({ from: mockFrom }));
	return {
		mockSelect,
		mockFrom,
		mockWhere,
		mockLeftJoin1,
		mockLeftJoin2,
		mockOrderBy,
	};
});

vi.mock("@/db", () => ({
	db: { select: mockSelect },
}));

vi.mock("@/db/schemas/alias", () => ({
	alias: { id: "alias.id", alias: "alias.alias", userId: "alias.userId" },
}));

vi.mock("@/db/schemas/thread", () => ({
	threads: {
		id: "threads.id",
		title: "threads.title",
		body: "threads.body",
		slug: "threads.slug",
		category: "threads.category",
		createdAt: "threads.createdAt",
		updatedAt: "threads.updatedAt",
		aliasId: "threads.aliasId",
		status: "threads.status",
		deletedAt: "threads.deletedAt",
	},
}));

vi.mock("@/db/schemas/user", () => ({
	user: { id: "user.id", displayUsername: "user.displayUsername" },
}));

import {
	getAllPublishedThreads,
	getPublishedThreadsByCategory,
} from "../db/thread-queries";

describe("getAllPublishedThreads", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockOrderBy.mockResolvedValue(mockDbRows);
	});

	describe("Query chain execution", () => {
		it("should execute the full chain: select → from → where → leftJoin × 2 → orderBy", async () => {
			await getAllPublishedThreads();

			expect(mockSelect).toHaveBeenCalledOnce();
			expect(mockFrom).toHaveBeenCalledOnce();
			expect(mockWhere).toHaveBeenCalledOnce();
			expect(mockLeftJoin1).toHaveBeenCalledOnce();
			expect(mockLeftJoin2).toHaveBeenCalledOnce();
			expect(mockOrderBy).toHaveBeenCalledOnce();
		});
	});

	describe("Date serialization", () => {
		it("should convert Date objects to ISO 8601 strings", async () => {
			const results = await getAllPublishedThreads();

			expect(typeof results[0].createdAt).toBe("string");
			expect(typeof results[0].updatedAt).toBe("string");
			expect(results[0].createdAt).toBe("2024-01-15T10:00:00.000Z");
			expect(results[0].updatedAt).toBe("2024-01-15T12:00:00.000Z");
		});

		it("should serialize dates for all threads in the result", async () => {
			const results = await getAllPublishedThreads();

			const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
			for (const thread of results) {
				expect(thread.createdAt).toMatch(isoRegex);
				expect(thread.updatedAt).toMatch(isoRegex);
			}
		});

		it("should produce different ISO strings for different dates", async () => {
			const results = await getAllPublishedThreads();

			expect(results[0].createdAt).not.toBe(results[1].createdAt);
			expect(results[0].updatedAt).not.toBe(results[0].createdAt);
		});
	});

	describe("Field preservation", () => {
		it("should preserve all non-date fields unchanged", async () => {
			const results = await getAllPublishedThreads();

			expect(results[0]).toMatchObject({
				id: "thread-1",
				title: "Thread about violence",
				body: "<p>Content</p>",
				slug: "thread-about-violence",
				category: "VIOLENCE",
				aliasName: "brave-fox",
				aliasId: "alias-1",
				displayUsername: "BraveFox",
			});
		});

		it("should handle null displayUsername without error", async () => {
			const results = await getAllPublishedThreads();

			expect(results[1].displayUsername).toBeNull();
			expect(results[1].aliasName).toBe("quiet-owl");
		});

		it("should not expose userId in results (AR25 anonymity)", async () => {
			const results = await getAllPublishedThreads();

			for (const thread of results) {
				expect(thread).not.toHaveProperty("userId");
			}
		});
	});

	describe("Empty state", () => {
		it("should return empty array when database returns no rows", async () => {
			mockOrderBy.mockResolvedValue([]);

			const results = await getAllPublishedThreads();

			expect(results).toEqual([]);
			expect(Array.isArray(results)).toBe(true);
		});
	});

	describe("Return type consistency", () => {
		it("should return an array with correct length", async () => {
			const results = await getAllPublishedThreads();

			expect(Array.isArray(results)).toBe(true);
			expect(results).toHaveLength(2);
		});

		it("should include all required fields for ThreadCard", async () => {
			const results = await getAllPublishedThreads();

			const requiredFields = [
				"id",
				"title",
				"body",
				"slug",
				"category",
				"createdAt",
				"updatedAt",
				"aliasName",
				"aliasId",
				"displayUsername",
			];

			for (const field of requiredFields) {
				expect(results[0]).toHaveProperty(field);
			}
		});
	});
});

describe("getPublishedThreadsByCategory", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockOrderBy.mockResolvedValue([mockDbRows[0]]);
	});

	it("executes the complete query chain", async () => {
		await getPublishedThreadsByCategory("VIOLENCE");

		expect(mockSelect).toHaveBeenCalledOnce();
		expect(mockWhere).toHaveBeenCalledOnce();
		expect(mockLeftJoin1).toHaveBeenCalledOnce();
		expect(mockLeftJoin2).toHaveBeenCalledOnce();
		expect(mockOrderBy).toHaveBeenCalledOnce();
	});

	it("serializes dates and preserves the selected category", async () => {
		const results = await getPublishedThreadsByCategory("VIOLENCE");

		expect(results).toHaveLength(1);
		expect(results[0].category).toBe("VIOLENCE");
		expect(results[0].createdAt).toBe("2024-01-15T10:00:00.000Z");
		expect(results[0].updatedAt).toBe("2024-01-15T12:00:00.000Z");
	});

	it("returns an empty array when the category has no published thread", async () => {
		mockOrderBy.mockResolvedValue([]);

		await expect(getPublishedThreadsByCategory("AUTRE")).resolves.toEqual([]);
	});
});
