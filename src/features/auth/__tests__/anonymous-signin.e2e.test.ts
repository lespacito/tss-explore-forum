import { expect, test } from "@playwright/test";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { user as userTable } from "@/db/schemas/user";

/**
 * E2E Tests for Story 1.3: Récupération via Code Secret
 *
 * Coverage:
 * - AC1: Reconnexion réussie avec code secret valide
 * - AC2: Gestion des codes secrets invalides
 * - AC3: Support multi-appareils
 *
 * Tests Subtask 6.4: Tests E2E - connexion complète avec code valide sur nouvel appareil
 */

test.describe("Anonymous Sign-in with Secret Code - E2E", () => {
	let testSecretCode: string;
	let testUserId: string;

	test.beforeAll(async () => {
		// Create a test anonymous user with a known secret code
		testSecretCode = "K7MN-P8QR";

		const existingUsers = await db
			.select()
			.from(userTable)
			.where(eq(userTable.secretCode, testSecretCode))
			.limit(1);

		if (existingUsers.length > 0) {
			testUserId = existingUsers[0].id;
		} else {
			const [newUser] = await db
				.insert(userTable)
				.values({
					id: `test_anon_${Date.now()}`,
					name: "Anonymous Test User",
					email: null as any, // Anonymous user has no email
					emailVerified: false,
					isAnonymous: true,
					secretCode: testSecretCode,
					secretCodeGeneratedAt: new Date(),
				})
				.returning();
			testUserId = newUser.id;
		}
	});

	test.afterAll(async () => {
		// Cleanup test user
		if (testUserId) {
			await db.delete(userTable).where(eq(userTable.id, testUserId));
		}
	});

	/**
	 * AC1: Reconnexion réussie avec code secret valide
	 * NFR5: Processus prend moins de 2 secondes
	 */
	test("should sign in successfully with valid secret code within 2 seconds", async ({
		page,
	}) => {
		const startTime = Date.now();

		await page.goto("/auth/anonymous-signin");

		// Verify page loaded
		await expect(
			page.getByRole("heading", { name: /connexion avec code secret/i }),
		).toBeVisible();

		// Fill in the secret code
		const codeInput = page.getByLabel("Code Secret");
		await codeInput.fill(testSecretCode);

		// Submit form
		const submitButton = page.getByRole("button", {
			name: /se connecter/i,
		});
		await submitButton.click();

		// Wait for redirect to /posts
		await page.waitForURL("/posts", { timeout: 3000 });

		const endTime = Date.now();
		const duration = (endTime - startTime) / 1000;

		// Validate NFR5: Less than 2 seconds
		expect(duration).toBeLessThan(2);

		// Verify we're on the posts page (authenticated)
		await expect(page).toHaveURL("/posts");
	});

	/**
	 * AC1: User can access their previous posts after reconnection
	 */
	test("should access previous posts after successful signin", async ({
		page,
	}) => {
		await page.goto("/auth/anonymous-signin");

		const codeInput = page.getByLabel("Code Secret");
		await codeInput.fill(testSecretCode);

		const submitButton = page.getByRole("button", {
			name: /se connecter/i,
		});
		await submitButton.click();

		await page.waitForURL("/posts");

		// User should be able to navigate and create new posts
		await expect(page.getByText(/publications/i)).toBeVisible();
	});

	/**
	 * AC2: Gestion des codes secrets invalides
	 */
	test("should show empathetic error for invalid secret code", async ({
		page,
	}) => {
		await page.goto("/auth/anonymous-signin");

		const codeInput = page.getByLabel("Code Secret");
		await codeInput.fill("XXXX-YYYY"); // Invalid code

		const submitButton = page.getByRole("button", {
			name: /se connecter/i,
		});
		await submitButton.click();

		// Should display empathetic error message
		await expect(
			page.getByText(/vérifiez votre code|impossible de se connecter/i),
		).toBeVisible({ timeout: 3000 });

		// Should NOT reveal whether code exists or not
		await expect(page.getByText(/n'existe pas|introuvable/i)).not.toBeVisible();

		// Should stay on the signin page
		await expect(page).toHaveURL("/auth/anonymous-signin");
	});

	/**
	 * AC2: Clear and helpful error message
	 */
	test("should suggest format verification in error message", async ({
		page,
	}) => {
		await page.goto("/auth/anonymous-signin");

		const codeInput = page.getByLabel("Code Secret");
		await codeInput.fill("FAKE-CODE");

		const submitButton = page.getByRole("button", {
			name: /se connecter/i,
		});
		await submitButton.click();

		// Wait for error to appear
		await page.waitForSelector('[role="alert"]', { timeout: 3000 });

		// Error message should be empathetic
		const errorAlert = page.locator('[role="alert"]').first();
		const errorText = await errorAlert.textContent();

		expect(errorText).toMatch(/vérifiez/i);
		expect(errorText).not.toMatch(/invalide|incorrect|faux/i);
	});

	/**
	 * AC2: User can retry after error
	 */
	test("should allow retry after failed signin", async ({ page }) => {
		await page.goto("/auth/anonymous-signin");

		// First attempt with invalid code
		const codeInput = page.getByLabel("Code Secret");
		await codeInput.fill("AAAA-BBBB");

		let submitButton = page.getByRole("button", {
			name: /se connecter/i,
		});
		await submitButton.click();

		await expect(page.getByRole("alert")).toBeVisible({ timeout: 3000 });

		// Clear and retry with valid code
		await codeInput.clear();
		await codeInput.fill(testSecretCode);

		submitButton = page.getByRole("button", {
			name: /se connecter/i,
		});
		await submitButton.click();

		await page.waitForURL("/posts");
		await expect(page).toHaveURL("/posts");
	});

	/**
	 * AC3: Support multi-appareils
	 * Test that signin on new device doesn't invalidate previous sessions
	 */
	test("should support multi-device signin without invalidating sessions", async ({
		browser,
	}) => {
		// Device 1
		const context1 = await browser.newContext();
		const page1 = await context1.newPage();

		await page1.goto("/auth/anonymous-signin");
		await page1.getByLabel("Code Secret").fill(testSecretCode);
		await page1.getByRole("button", { name: /se connecter/i }).click();
		await page1.waitForURL("/posts");

		// Verify Device 1 is authenticated
		await expect(page1).toHaveURL("/posts");

		// Device 2 (new context = new device)
		const context2 = await browser.newContext();
		const page2 = await context2.newPage();

		await page2.goto("/auth/anonymous-signin");
		await page2.getByLabel("Code Secret").fill(testSecretCode);
		await page2.getByRole("button", { name: /se connecter/i }).click();
		await page2.waitForURL("/posts");

		// Verify Device 2 is authenticated
		await expect(page2).toHaveURL("/posts");

		// Verify Device 1 session is STILL ACTIVE (not invalidated)
		await page1.reload();
		await expect(page1).toHaveURL("/posts");

		// Both devices should be able to access posts
		await expect(page1.getByText(/publications/i)).toBeVisible();
		await expect(page2.getByText(/publications/i)).toBeVisible();

		await context1.close();
		await context2.close();
	});

	/**
	 * UI/UX: Auto-formatting with dashes
	 */
	test("should auto-format code with dashes during typing", async ({
		page,
	}) => {
		await page.goto("/auth/anonymous-signin");

		const codeInput = page.getByLabel("Code Secret");

		// Type without dashes
		await codeInput.pressSequentially("K7MNP8QR");

		// Should auto-format with dashes
		await expect(codeInput).toHaveValue("K7MN-P8QR");
	});

	/**
	 * UI/UX: Uppercase conversion
	 */
	test("should convert lowercase to uppercase automatically", async ({
		page,
	}) => {
		await page.goto("/auth/anonymous-signin");

		const codeInput = page.getByLabel("Code Secret");

		// Type in lowercase
		await codeInput.pressSequentially("k7mnp8qr");

		// Should convert to uppercase
		await expect(codeInput).toHaveValue("K7MN-P8QR");
	});

	/**
	 * UI/UX: Paste button functionality
	 */
	test("should paste code from clipboard when paste button clicked", async ({
		page,
		context,
	}) => {
		await page.goto("/auth/anonymous-signin");

		// Grant clipboard permissions
		await context.grantPermissions(["clipboard-read", "clipboard-write"]);

		// Copy secret code to clipboard
		await page.evaluate((code) => {
			return navigator.clipboard.writeText(code);
		}, testSecretCode);

		// Click paste button
		const pasteButton = page.getByRole("button", {
			name: /coller le code/i,
		});
		await pasteButton.click();

		// Verify code is pasted and formatted
		const codeInput = page.getByLabel("Code Secret");
		await expect(codeInput).toHaveValue(testSecretCode);
	});

	/**
	 * UI/UX: Loading state during submission
	 */
	test("should show loading state during form submission", async ({ page }) => {
		await page.goto("/auth/anonymous-signin");

		const codeInput = page.getByLabel("Code Secret");
		await codeInput.fill(testSecretCode);

		const submitButton = page.getByRole("button", {
			name: /se connecter/i,
		});
		await submitButton.click();

		// Should show loading text (briefly)
		await expect(
			page.getByRole("button", { name: /connexion\.\.\./i }),
		).toBeVisible({ timeout: 1000 });

		// Button should be disabled during loading
		const loadingButton = page.getByRole("button", { name: /connexion/i });
		await expect(loadingButton).toBeDisabled();

		await page.waitForURL("/posts");
	});

	/**
	 * UI/UX: Help text and links
	 */
	test("should display helpful information and links", async ({ page }) => {
		await page.goto("/auth/anonymous-signin");

		// Format help text
		await expect(
			page.getByText("Format: XXXX-XXXX ou XXXX-XXXX-XXXX"),
		).toBeVisible();

		// "Where to find my code" section
		await expect(page.getByText(/où trouver mon code secret/i)).toBeVisible();

		// Link to create first anonymous post
		await expect(
			page.getByRole("link", {
				name: /créer ma première publication anonyme/i,
			}),
		).toBeVisible();

		// Link to email login
		await expect(
			page.getByRole("link", { name: /se connecter avec email/i }),
		).toBeVisible();
	});

	/**
	 * Security: Redirect if already authenticated
	 */
	test("should redirect to /posts if already authenticated", async ({
		page,
	}) => {
		// First, sign in
		await page.goto("/auth/anonymous-signin");
		await page.getByLabel("Code Secret").fill(testSecretCode);
		await page.getByRole("button", { name: /se connecter/i }).click();
		await page.waitForURL("/posts");

		// Try to access signin page again
		await page.goto("/auth/anonymous-signin");

		// Should be redirected back to /posts
		await expect(page).toHaveURL("/posts");
	});

	/**
	 * Accessibility: Keyboard navigation
	 */
	test("should support keyboard navigation", async ({ page }) => {
		await page.goto("/auth/anonymous-signin");

		const codeInput = page.getByLabel("Code Secret");

		// Tab to input
		await page.keyboard.press("Tab");
		await expect(codeInput).toBeFocused();

		// Type code
		await page.keyboard.type(testSecretCode);

		// Tab to submit button
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab"); // Skip paste button

		const submitButton = page.getByRole("button", {
			name: /se connecter/i,
		});
		await expect(submitButton).toBeFocused();

		// Submit with Enter
		await page.keyboard.press("Enter");

		await page.waitForURL("/posts");
		await expect(page).toHaveURL("/posts");
	});

	/**
	 * Accessibility: ARIA labels and screen reader support
	 */
	test("should have proper accessibility attributes", async ({ page }) => {
		await page.goto("/auth/anonymous-signin");

		const codeInput = page.getByLabel("Code Secret");

		// Check ARIA attributes
		await expect(codeInput).toHaveAttribute("aria-describedby", "code-help");
		await expect(codeInput).toHaveAttribute("autoComplete", "off");
		await expect(codeInput).toHaveAttribute("autoCapitalize", "characters");

		// Paste button should have aria-label
		const pasteButton = page.getByRole("button", {
			name: /coller le code depuis le presse-papiers/i,
		});
		await expect(pasteButton).toHaveAttribute("aria-label");

		// Submit button and trigger error to check alert role
		await codeInput.fill("INVALID");
		await page.getByRole("button", { name: /se connecter/i }).click();

		// Error should have role="alert"
		const errorAlert = page.locator('[role="alert"]').first();
		await expect(errorAlert).toBeVisible({ timeout: 3000 });
	});
});
