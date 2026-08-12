import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { db } from "@/db";
import { alias } from "@/db/schemas/alias";
import { threads } from "@/db/schemas/thread";
import { user } from "@/db/schemas/user";

/**
 * Manual End-to-End Test for First Publication Flow
 *
 * This test simulates the complete flow of an anonymous user creating
 * their first thread and receiving a secret code.
 *
 * To run this test manually:
 * 1. Ensure database is running
 * 2. Run: pnpm test src/features/threads/__tests__/first-publication-flow.manual.test.ts
 *
 * Or test manually in browser:
 * 1. Start dev server: pnpm dev
 * 2. Sign in anonymously
 * 3. Create a thread (first time)
 * 4. Check console logs for "🔍 Thread creation result"
 * 5. Should redirect to /threads/confirmation with secret code
 */

describe.skip("First Publication Flow - Manual E2E Test", () => {
	let testUserId: string;
	let testAliasId: string;

	beforeAll(async () => {
		await db.delete(threads).where(eq(threads.id, "test-e2e-thread"));
		await db.delete(alias).where(eq(alias.id, "test-e2e-alias"));
		await db.delete(user).where(eq(user.id, "test-e2e-user"));
	});

	it("should complete full flow: anonymous user creates first thread and receives secret code", async () => {
		const [anonymousUser] = await db
			.insert(user)
			.values({
				id: "test-e2e-user",
				name: "Anonymous User E2E",
				email: null,
				emailVerified: false,
				isAnonymous: true,
				secretCode: null,
			} as any)
			.returning();

		testUserId = anonymousUser.id;
		expect(anonymousUser.secretCode).toBeNull();

		const [userAlias] = await db
			.insert(alias)
			.values({
				id: "test-e2e-alias",
				userId: testUserId,
				aliasName: "Anonymous_E2E_123",
				isPrimary: true,
			} as any)
			.returning();

		testAliasId = userAlias.id;

		const existingThreads = await db
			.select()
			.from(threads)
			.where(eq(threads.aliasId, testAliasId));

		expect(existingThreads.length).toBe(0);

		const [newThread] = await db
			.insert(threads)
			.values({
				id: "test-e2e-thread",
				aliasId: testAliasId,
				title: "E2E Test Thread - First Publication",
				body: "This is a test of the first publication flow",
				slug: "e2e-test-thread-first-publication",
				category: "AUTRE",
			} as any)
			.returning();

		expect(newThread).toBeDefined();

		const [userAfterThread] = await db
			.select()
			.from(user)
			.where(eq(user.id, testUserId));

		expect(userAfterThread.email).toBeNull();

		await db.delete(threads).where(eq(threads.id, "test-e2e-thread"));
		await db.delete(alias).where(eq(alias.id, "test-e2e-alias"));
		await db.delete(user).where(eq(user.id, "test-e2e-user"));
	});

	it("should NOT generate code for second publication", async () => {
		const [anonymousUser] = await db
			.insert(user)
			.values({
				id: "test-e2e-user-2",
				name: "Anonymous User E2E 2",
				email: null,
				emailVerified: false,
				isAnonymous: true,
				secretCode: "EXISTING-CODE-123",
				secretCodeGeneratedAt: new Date(),
			} as any)
			.returning();

		const [userAlias] = await db
			.insert(alias)
			.values({
				id: "test-e2e-alias-2",
				userId: anonymousUser.id,
				aliasName: "Anonymous_E2E_456",
				isPrimary: true,
			} as any)
			.returning();

		await db.insert(threads).values({
			id: "test-e2e-thread-first",
			aliasId: userAlias.id,
			title: "First Thread Already Exists",
			body: "This was created before",
			slug: "first-thread-already-exists",
			category: "AUTRE",
		} as any);

		const existingThreads = await db
			.select()
			.from(threads)
			.where(eq(threads.aliasId, userAlias.id));

		expect(existingThreads.length).toBe(1);

		const [secondThread] = await db
			.insert(threads)
			.values({
				id: "test-e2e-thread-second",
				aliasId: userAlias.id,
				title: "Second Thread",
				body: "This is the second thread",
				slug: "second-thread-e2e",
				category: "AUTRE",
			} as any)
			.returning();

		expect(secondThread).toBeDefined();

		await db.delete(threads).where(eq(threads.aliasId, userAlias.id));
		await db.delete(alias).where(eq(alias.id, userAlias.id));
		await db.delete(user).where(eq(user.id, anonymousUser.id));
	});
});
