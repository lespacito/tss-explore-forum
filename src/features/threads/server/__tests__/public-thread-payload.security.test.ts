import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import type { PublicThread } from "../../schemas/public-thread";

const mocks = vi.hoisted(() => ({ all: vi.fn(), category: vi.fn(), detail: vi.fn() }));
vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => {
		const builder = { validator: () => builder, handler: (handler: unknown) => handler };
		return builder;
	},
}));
vi.mock("../db/thread-queries", () => ({
	getAllPublishedThreads: mocks.all,
	getPublishedThreadsByCategory: mocks.category,
	getThreadBySlug: mocks.detail,
}));

import { getThreadsFn, getThreadsByCategoryFn } from "../actions/get-threads";
import { getThreadBySlugFn } from "../actions/get-thread-by-slug";

const publicThread = {
	id: "publication-id", title: "Fiction", body: "<p>Fiction</p>", slug: "fiction",
	category: "VIOLENCE", isSensitive: true,
	createdAt: "2026-09-30T10:00:00.000Z", updatedAt: "2026-09-30T11:00:00.000Z",
};
const contaminated = {
	...publicThread, aliasName: "PRIVATE_ALIAS", aliasId: "PRIVATE_ALIAS_ID",
	displayUsername: "PRIVATE_PROFILE", userId: "PRIVATE_USER", authorId: "PRIVATE_AUTHOR",
	email: "private@example.test", moderatorId: "PRIVATE_MODERATOR", sessionId: "PRIVATE_SESSION",
};
const all = getThreadsFn as unknown as () => Promise<unknown>;
const category = getThreadsByCategoryFn as unknown as (input: { data: { category: string } }) => Promise<unknown>;
const detail = getThreadBySlugFn as unknown as (input: { data: { slug: string } }) => Promise<unknown>;

describe("public publication response boundary", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.all.mockResolvedValue([contaminated]);
		mocks.category.mockResolvedValue([contaminated]);
		mocks.detail.mockResolvedValue(contaminated);
	});
	it("allowlists the list response even if the database contract grows", async () => {
		await expect(all()).resolves.toEqual([publicThread]);
	});
	it("allowlists category responses", async () => {
		await expect(category({ data: { category: "VIOLENCE" } })).resolves.toEqual([publicThread]);
		expect(mocks.category).toHaveBeenCalledWith("VIOLENCE");
	});
	it("allowlists detail responses without author or session identifiers", async () => {
		await expect(detail({ data: { slug: "fiction" } })).resolves.toEqual(publicThread);
		expect(mocks.detail).toHaveBeenCalledWith("fiction");
	});
	it("keeps the missing publication error", async () => {
		mocks.detail.mockResolvedValue(null);
		await expect(detail({ data: { slug: "missing" } })).rejects.toThrow("Thread not found");
	});
	it("keeps author fields out of the public DTO and inferred response types", () => {
		type AuthorKeys = "aliasName" | "aliasId" | "displayUsername" | "userId" | "authorId" | "email" | "sessionId";
		expectTypeOf<Extract<keyof PublicThread, AuthorKeys>>().toEqualTypeOf<never>();
		expectTypeOf<Extract<keyof Awaited<ReturnType<typeof getThreadsFn>>[number], AuthorKeys>>().toEqualTypeOf<never>();
		expectTypeOf<Extract<keyof Awaited<ReturnType<typeof getThreadBySlugFn>>, AuthorKeys>>().toEqualTypeOf<never>();
	});
});
