import { expect, test } from "@playwright/test";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { alias as aliasTable } from "@/db/schemas/alias";
import { threads as threadsTable } from "@/db/schemas/thread";
import { user as userTable } from "@/db/schemas/user";

/**
 * E2E Tests for Story 1.2: Code Secret pour Utilisateur Anonyme
 *
 * Coverage:
 * - AC1: Génération du code secret après première publication
 * - AC2: Affichage et instructions pour le code secret
 * - Task 7.4: Test end-to-end du workflow complet
 *
 * Validates:
 * - First publication generates secret code
 * - Code displayed on confirmation page
 * - Copy button works
 * - Second publication does NOT generate code
 * - Instructions and warnings displayed
 */

test.describe("First Publication Secret Code - E2E", () => {
	let testUserId: string;
	let testAliasId: string;

	test.beforeEach(async () => {
		// Create a fresh anonymous user for each test
		const timestamp = Date.now();
		testUserId = `test_anon_${timestamp}`;

		const [newUser] = await db
			.insert(userTable)
			.values({
				id: testUserId,
				name: `Test User ${timestamp}`,
				email: null as any,
				emailVerified: false,
				isAnonymous: true,
				secretCode: null,
				secretCodeGeneratedAt: null,
			})
			.returning();

		// Create primary alias for this user
		const [newAlias] = await db
			.insert(aliasTable)
			.values({
				id: `alias_${timestamp}`,
				userId: newUser.id,
				name: `Anonymous ${timestamp}`,
				isPrimary: true,
			})
			.returning();

		testAliasId = newAlias.id;
	});

	test.afterEach(async () => {
		// Cleanup: delete threads, aliases, and user
		if (testAliasId) {
			await db
				.delete(threadsTable)
				.where(eq(threadsTable.aliasId, testAliasId));
			await db.delete(aliasTable).where(eq(aliasTable.id, testAliasId));
		}
		if (testUserId) {
			await db.delete(userTable).where(eq(userTable.id, testUserId));
		}
	});

	/**
	 * AC1: Génération du code secret après première publication
	 * Critical: First publication MUST generate secret code
	 */
	test("should generate secret code after first publication", async ({
		page,
	}) => {
		// Mock authentication session for test user
		await page.addInitScript((userId) => {
			// This would normally be set by your auth system
			window.localStorage.setItem("test_user_id", userId);
		}, testUserId);

		// Navigate to thread creation page
		await page.goto("/threads/new");

		// Fill in thread form
		await page.getByLabel(/titre/i).fill("Ma première publication anonyme");
		await page.getByLabel(/catégorie/i).selectOption("support");
		await page
			.getByLabel(/contenu/i)
			.fill("Ceci est ma première publication. J'ai besoin d'aide.");

		// Submit form
		await page.getByRole("button", { name: /publier|soumettre/i }).click();

		// Should redirect to confirmation page
		await page.waitForURL(/\/threads\/confirmation/, { timeout: 5000 });

		// Verify secret code is displayed
		const codeDisplay = page.locator('[data-testid="secret-code-display"]');
		await expect(codeDisplay).toBeVisible();

		// Verify code format (XXXX-XXXX-XXXX)
		const codeText = await codeDisplay.textContent();
		expect(codeText).toMatch(/[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}/);

		// Verify code is saved in database
		const [userRecord] = await db
			.select()
			.from(userTable)
			.where(eq(userTable.id, testUserId))
			.limit(1);

		expect(userRecord.secretCode).toBeTruthy();
		expect(userRecord.secretCode).toMatch(
			/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/,
		);
		expect(userRecord.secretCodeGeneratedAt).toBeInstanceOf(Date);
	});

	/**
	 * AC2: Affichage et instructions pour le code secret
	 * Must display clear instructions and warnings
	 */
	test("should display instructions and warnings for secret code", async ({
		page,
	}) => {
		// Create first publication and navigate to confirmation
		await page.goto("/threads/new");
		await page.getByLabel(/titre/i).fill("Test Publication");
		await page.getByLabel(/catégorie/i).selectOption("support");
		await page.getByLabel(/contenu/i).fill("Test content");
		await page.getByRole("button", { name: /publier/i }).click();

		await page.waitForURL(/\/threads\/confirmation/);

		// Verify instructions are displayed
		await expect(
			page.getByText(/conservez ce code|sauvegardez ce code/i),
		).toBeVisible();

		// Verify warning about importance
		await expect(
			page.getByText(/important|crucial|ne perdez pas/i),
		).toBeVisible();

		// Verify explanation of what code is for
		await expect(
			page.getByText(/retrouver vos publications|reconnecter/i),
		).toBeVisible();
	});

	/**
	 * AC2: Copy button functionality
	 * User must be able to copy code easily
	 */
	test("should copy secret code to clipboard when button clicked", async ({
		page,
		context,
	}) => {
		// Grant clipboard permissions
		await context.grantPermissions(["clipboard-read", "clipboard-write"]);

		// Create first publication
		await page.goto("/threads/new");
		await page.getByLabel(/titre/i).fill("Test Publication");
		await page.getByLabel(/catégorie/i).selectOption("support");
		await page.getByLabel(/contenu/i).fill("Test content");
		await page.getByRole("button", { name: /publier/i }).click();

		await page.waitForURL(/\/threads\/confirmation/);

		// Find and click copy button
		const copyButton = page.getByRole("button", { name: /copier/i });
		await expect(copyButton).toBeVisible();
		await copyButton.click();

		// Verify success feedback
		await expect(page.getByText(/copié|copied/i)).toBeVisible({
			timeout: 2000,
		});

		// Verify code is actually in clipboard
		const clipboardText = await page.evaluate(() =>
			navigator.clipboard.readText(),
		);
		expect(clipboardText).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
	});

	/**
	 * Critical: Second publication should NOT generate another code
	 */
	test("should NOT generate code for second publication", async ({ page }) => {
		// First publication - generates code
		await page.goto("/threads/new");
		await page.getByLabel(/titre/i).fill("Première publication");
		await page.getByLabel(/catégorie/i).selectOption("support");
		await page.getByLabel(/contenu/i).fill("Premier contenu");
		await page.getByRole("button", { name: /publier/i }).click();

		await page.waitForURL(/\/threads\/confirmation/);

		// Get the generated code
		const firstCode = await page
			.locator('[data-testid="secret-code-display"]')
			.textContent();

		// Navigate back to create second publication
		await page.goto("/threads/new");
		await page.getByLabel(/titre/i).fill("Deuxième publication");
		await page.getByLabel(/catégorie/i).selectOption("support");
		await page.getByLabel(/contenu/i).fill("Deuxième contenu");
		await page.getByRole("button", { name: /publier/i }).click();

		// Should redirect to threads list, NOT confirmation page
		await expect(page).not.toHaveURL(/\/threads\/confirmation/);
		await expect(page).toHaveURL(/\/threads/);

		// Verify code in DB is still the same (not regenerated)
		const [userRecord] = await db
			.select()
			.from(userTable)
			.where(eq(userTable.id, testUserId))
			.limit(1);

		expect(userRecord.secretCode).toBe(firstCode?.replace(/\s/g, ""));
	});

	/**
	 * Idempotency: If code already exists, don't regenerate
	 */
	test("should handle existing secret code gracefully", async ({ page }) => {
		// Pre-create secret code for user
		const existingCode = "TEST-CODE-1234";
		await db
			.update(userTable)
			.set({
				secretCode: existingCode,
				secretCodeGeneratedAt: new Date(),
			})
			.where(eq(userTable.id, testUserId));

		// Create first publication
		await page.goto("/threads/new");
		await page.getByLabel(/titre/i).fill("Test Publication");
		await page.getByLabel(/catégorie/i).selectOption("support");
		await page.getByLabel(/contenu/i).fill("Test content");
		await page.getByRole("button", { name: /publier/i }).click();

		await page.waitForURL(/\/threads\/confirmation/);

		// Should display the EXISTING code, not a new one
		const displayedCode = await page
			.locator('[data-testid="secret-code-display"]')
			.textContent();

		expect(displayedCode).toContain(existingCode);

		// Verify DB still has same code
		const [userRecord] = await db
			.select()
			.from(userTable)
			.where(eq(userTable.id, testUserId))
			.limit(1);

		expect(userRecord.secretCode).toBe(existingCode);
	});

	/**
	 * Security: Registered users should NOT get secret codes
	 */
	test("should NOT generate code for registered (non-anonymous) users", async ({
		page,
	}) => {
		// Update user to be registered (not anonymous)
		await db
			.update(userTable)
			.set({
				isAnonymous: false,
				email: "test@example.com",
			})
			.where(eq(userTable.id, testUserId));

		// Create publication
		await page.goto("/threads/new");
		await page.getByLabel(/titre/i).fill("Test Publication");
		await page.getByLabel(/catégorie/i).selectOption("support");
		await page.getByLabel(/contenu/i).fill("Test content");
		await page.getByRole("button", { name: /publier/i }).click();

		// Should NOT redirect to confirmation page
		await expect(page).not.toHaveURL(/\/threads\/confirmation/);

		// Verify no code in database
		const [userRecord] = await db
			.select()
			.from(userTable)
			.where(eq(userTable.id, testUserId))
			.limit(1);

		expect(userRecord.secretCode).toBeNull();
	});

	/**
	 * UI/UX: Code format with dashes for readability
	 */
	test("should display code with proper formatting", async ({ page }) => {
		await page.goto("/threads/new");
		await page.getByLabel(/titre/i).fill("Test Publication");
		await page.getByLabel(/catégorie/i).selectOption("support");
		await page.getByLabel(/contenu/i).fill("Test content");
		await page.getByRole("button", { name: /publier/i }).click();

		await page.waitForURL(/\/threads\/confirmation/);

		const codeDisplay = page.locator('[data-testid="secret-code-display"]');
		const codeText = await codeDisplay.textContent();

		// Should be displayed with dashes
		expect(codeText).toMatch(/[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}/);

		// Should be monospace/code-like styling
		const fontFamily = await codeDisplay.evaluate(
			(el) => window.getComputedStyle(el).fontFamily,
		);
		expect(fontFamily).toMatch(/mono|code|courier/i);
	});

	/**
	 * Accessibility: Keyboard navigation support
	 */
	test("should support keyboard navigation on confirmation page", async ({
		page,
	}) => {
		await page.goto("/threads/new");
		await page.getByLabel(/titre/i).fill("Test Publication");
		await page.getByLabel(/catégorie/i).selectOption("support");
		await page.getByLabel(/contenu/i).fill("Test content");
		await page.getByRole("button", { name: /publier/i }).click();

		await page.waitForURL(/\/threads\/confirmation/);

		// Tab to copy button
		await page.keyboard.press("Tab");
		const copyButton = page.getByRole("button", { name: /copier/i });

		// Should be able to focus and activate with keyboard
		await expect(copyButton).toBeFocused();
		await page.keyboard.press("Enter");

		// Verify copy succeeded
		await expect(page.getByText(/copié/i)).toBeVisible();
	});

	/**
	 * Accessibility: Screen reader support
	 */
	test("should have proper ARIA labels for accessibility", async ({ page }) => {
		await page.goto("/threads/new");
		await page.getByLabel(/titre/i).fill("Test Publication");
		await page.getByLabel(/catégorie/i).selectOption("support");
		await page.getByLabel(/contenu/i).fill("Test content");
		await page.getByRole("button", { name: /publier/i }).click();

		await page.waitForURL(/\/threads\/confirmation/);

		// Verify copy button has aria-label
		const copyButton = page.getByRole("button", { name: /copier/i });
		await expect(copyButton).toHaveAttribute("aria-label");

		// Verify alert/warning has role
		const alert = page.locator('[role="alert"], [role="status"]').first();
		await expect(alert).toBeVisible();
	});

	/**
	 * Error handling: Thread creation fails, no code generated
	 */
	test("should not generate code if thread creation fails", async ({
		page,
	}) => {
		await page.goto("/threads/new");

		// Submit empty form (should fail validation)
		await page.getByRole("button", { name: /publier/i }).click();

		// Should show validation errors, not redirect
		await expect(page).toHaveURL(/\/threads\/new/);

		// Verify no code in database
		const [userRecord] = await db
			.select()
			.from(userTable)
			.where(eq(userTable.id, testUserId))
			.limit(1);

		expect(userRecord.secretCode).toBeNull();
	});

	/**
	 * Performance: Code generation should be fast
	 */
	test("should generate code quickly (< 2 seconds)", async ({ page }) => {
		const startTime = Date.now();

		await page.goto("/threads/new");
		await page.getByLabel(/titre/i).fill("Test Publication");
		await page.getByLabel(/catégorie/i).selectOption("support");
		await page.getByLabel(/contenu/i).fill("Test content");
		await page.getByRole("button", { name: /publier/i }).click();

		await page.waitForURL(/\/threads\/confirmation/);

		// Wait for code to be visible
		await page.locator('[data-testid="secret-code-display"]').waitFor();

		const endTime = Date.now();
		const duration = (endTime - startTime) / 1000;

		expect(duration).toBeLessThan(2);
	});

	/**
	 * Integration: Verify code can be used for signin
	 */
	test("should generate valid code that can be used for signin", async ({
		page,
	}) => {
		// Create first publication and get code
		await page.goto("/threads/new");
		await page.getByLabel(/titre/i).fill("Test Publication");
		await page.getByLabel(/catégorie/i).selectOption("support");
		await page.getByLabel(/contenu/i).fill("Test content");
		await page.getByRole("button", { name: /publier/i }).click();

		await page.waitForURL(/\/threads\/confirmation/);

		const generatedCode = await page
			.locator('[data-testid="secret-code-display"]')
			.textContent();

		expect(generatedCode).toBeTruthy();

		// Verify code is in correct format and can be found in DB
		const [userRecord] = await db
			.select()
			.from(userTable)
			.where(eq(userTable.id, testUserId))
			.limit(1);

		expect(userRecord.secretCode).toBe(generatedCode?.replace(/\s/g, ""));

		// Test that this code could be used for signin
		// (Full signin flow tested in Story 1.3 E2E tests)
		expect(userRecord.secretCode).toMatch(
			/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/,
		);
	});
});
