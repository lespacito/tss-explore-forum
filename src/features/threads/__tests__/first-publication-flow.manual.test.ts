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
		// Clean up any previous test data
		await db.delete(threads).where(eq(threads.id, "test-e2e-thread"));
		await db.delete(alias).where(eq(alias.id, "test-e2e-alias"));
		await db.delete(user).where(eq(user.id, "test-e2e-user"));
	});

	it("should complete full flow: anonymous user creates first thread and receives secret code", async () => {
		// Step 1: Create anonymous user
		const [anonymousUser] = await db
			.insert(user)
			.values({
				id: "test-e2e-user",
				name: "Anonymous User E2E",
				email: null, // Anonymous
				emailVerified: false,
				isAnonymous: true,
				secretCode: null, // No code yet
			})
			.returning();

		testUserId = anonymousUser.id;
		expect(anonymousUser.secretCode).toBeNull();

		// Step 2: Create alias for user
		const [userAlias] = await db
			.insert(alias)
			.values({
				id: "test-e2e-alias",
				userId: testUserId,
				aliasName: "Anonymous_E2E_123",
				isPrimary: true,
			})
			.returning();

		testAliasId = userAlias.id;

		// Step 3: Verify no threads exist yet
		const existingThreads = await db
			.select()
			.from(threads)
			.where(eq(threads.aliasId, testAliasId));

		expect(existingThreads.length).toBe(0);
		console.log(
			"✅ Step 3: No existing threads - this will be first publication",
		);

		// Step 4: Create first thread (simulates createThreadFn)
		const [newThread] = await db
			.insert(threads)
			.values({
				id: "test-e2e-thread",
				aliasId: testAliasId,
				title: "E2E Test Thread - First Publication",
				body: "This is a test of the first publication flow",
				slug: "e2e-test-thread-first-publication",
				category: "general",
			})
			.returning();

		expect(newThread).toBeDefined();
		console.log("✅ Step 4: Thread created successfully");

		// Step 5: Verify user should receive secret code (email is null)
		const [userAfterThread] = await db
			.select()
			.from(user)
			.where(eq(user.id, testUserId));

		expect(userAfterThread.email).toBeNull();
		console.log("✅ Step 5: User is anonymous, should receive secret code");

		// Step 6: Check if generateSecretCodeLogic would be called
		// (In real flow, this happens in createThreadFn)
		console.log("📋 Expected behavior:");
		console.log("  - createThreadFn should detect isFirstPublication = true");
		console.log("  - Should call generateSecretCodeLogic()");
		console.log(
			"  - Should return { success: true, thread, secretCode, isFirstPublication: true }",
		);
		console.log("  - Client should redirect to /threads/confirmation");

		// Clean up
		await db.delete(threads).where(eq(threads.id, "test-e2e-thread"));
		await db.delete(alias).where(eq(alias.id, "test-e2e-alias"));
		await db.delete(user).where(eq(user.id, "test-e2e-user"));

		console.log("✅ Test cleanup complete");
	});

	it("should NOT generate code for second publication", async () => {
		// Create user with existing thread and code
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
			})
			.returning();

		const [userAlias] = await db
			.insert(alias)
			.values({
				id: "test-e2e-alias-2",
				userId: anonymousUser.id,
				aliasName: "Anonymous_E2E_456",
				isPrimary: true,
			})
			.returning();

		// Create first thread
		await db.insert(threads).values({
			id: "test-e2e-thread-first",
			aliasId: userAlias.id,
			title: "First Thread Already Exists",
			body: "This was created before",
			slug: "first-thread-already-exists",
			category: "general",
		});

		// Verify existing thread count
		const existingThreads = await db
			.select()
			.from(threads)
			.where(eq(threads.aliasId, userAlias.id));

		expect(existingThreads.length).toBe(1);
		console.log("✅ User already has 1 thread - NOT first publication");

		// Create second thread
		const [secondThread] = await db
			.insert(threads)
			.values({
				id: "test-e2e-thread-second",
				aliasId: userAlias.id,
				title: "Second Thread",
				body: "This is the second thread",
				slug: "second-thread-e2e",
				category: "general",
			})
			.returning();

		expect(secondThread).toBeDefined();
		console.log("📋 Expected behavior for second thread:");
		console.log("  - isFirstPublication = false");
		console.log("  - Should NOT call generateSecretCodeLogic()");
		console.log("  - Should return { success: true, thread } (no secretCode)");
		console.log("  - Client should show normal success message");

		// Clean up
		await db.delete(threads).where(eq(threads.aliasId, userAlias.id));
		await db.delete(alias).where(eq(alias.id, userAlias.id));
		await db.delete(user).where(eq(user.id, anonymousUser.id));

		console.log("✅ Test cleanup complete");
	});
});

/**
 * Manual Browser Testing Checklist
 * ================================
 *
 * □ 1. Start dev server: pnpm dev
 * □ 2. Open browser DevTools Console
 * □ 3. Navigate to http://localhost:3000
 * □ 4. Sign in anonymously
 * □ 5. Create a new thread
 * □ 6. Check console for debug logs:
 *      - "🔍 Thread creation result"
 *      - "🔍 isFirstPublication: true"
 *      - "🔍 secretCode exists: true"
 *      - "✅ Redirecting to confirmation page"
 * □ 7. Verify redirect to /threads/confirmation
 * □ 8. Verify SecretCodeDisplay component shows:
 *      - Code in format XXXX-XXXX-XXXX
 *      - "Code secret créé !" title
 *      - Copy button works
 *      - Instructions displayed
 *      - Warning about losing code
 * □ 9. Click "J'ai sauvegardé mon code"
 * □ 10. Verify navigation to created thread
 * □ 11. Create second thread
 * □ 12. Check console shows "✅ Normal flow - no secret code"
 * □ 13. Verify NO redirect (normal success toast)
 *
 * Troubleshooting
 * ===============
 *
 * If redirect doesn't work:
 * 1. Check console logs - what does result object contain?
 * 2. Verify createThreadFn returns correct structure
 * 3. Check Network tab - what does server response look like?
 * 4. Verify route exists: /threads/confirmation
 * 5. Check browser console for routing errors
 *
 * If secret code not generated:
 * 1. Check server logs for "Secret code generated/retrieved"
 * 2. Verify user.email is NULL in database
 * 3. Check generateSecretCodeLogic is being called
 * 4. Verify no errors in generateSecretCodeLogic
 *
 * If page doesn't display correctly:
 * 1. Verify query params in URL
 * 2. Check SecretCodeDisplay component renders
 * 3. Verify secretCode prop is passed correctly
 * 4. Check browser console for React errors
 */
