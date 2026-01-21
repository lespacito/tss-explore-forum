import { test, expect } from "@playwright/test";

/**
 * E2E Tests for Authentication Flows (Story 1.5)
 *
 * These tests validate the complete signin/signout user journey
 * using Playwright E2E testing framework.
 *
 * Prerequisites:
 * - Playwright installed: pnpm add -D @playwright/test
 * - Test database seeded with fixture users
 * - Dev server running on http://localhost:3000
 *
 * Run tests:
 * - All E2E tests: pnpm playwright test
 * - This file only: pnpm playwright test authentication.e2e
 * - Headed mode: pnpm playwright test --headed
 * - Debug mode: pnpm playwright test --debug
 */

test.describe("Authentication E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto("/auth/login");
  });

  test.describe("Signin Flow", () => {
    test("should signin successfully with valid credentials", async ({ page }) => {
      // Fill signin form
      await page.getByLabel("Nom d'utilisateur").fill("testuser");
      await page.getByLabel("Mot de passe").fill("Password123!");

      // Submit form
      await page.getByRole("button", { name: "Se connecter" }).click();

      // Wait for redirect to home page
      await page.waitForURL("/");

      // Verify user menu is visible (user is signed in)
      await expect(page.getByRole("button", { name: /testuser/i })).toBeVisible();

      // Verify success toast notification
      await expect(page.getByText(/Connexion réussie/i)).toBeVisible();
    });

    test("should show error for invalid credentials", async ({ page }) => {
      // Fill signin form with wrong password
      await page.getByLabel("Nom d'utilisateur").fill("testuser");
      await page.getByLabel("Mot de passe").fill("WrongPassword");

      // Submit form
      await page.getByRole("button", { name: "Se connecter" }).click();

      // Wait for error message
      await expect(page.getByText(/Identifiants invalides/i)).toBeVisible({
        timeout: 5000,
      });

      // Verify still on login page
      expect(page.url()).toContain("/auth/login");
    });

    test("should show error for non-existent username", async ({ page }) => {
      // Fill signin form with non-existent username
      await page.getByLabel("Nom d'utilisateur").fill("nonexistentuser");
      await page.getByLabel("Mot de passe").fill("Password123!");

      // Submit form
      await page.getByRole("button", { name: "Se connecter" }).click();

      // Wait for error message (generic message for security)
      await expect(page.getByText(/Identifiants invalides/i)).toBeVisible({
        timeout: 5000,
      });
    });

    test("should redirect to email verification for unverified users", async ({
      page,
    }) => {
      // TODO: Seed database with unverified user fixture
      // Fill signin form with unverified user
      await page.getByLabel("Nom d'utilisateur").fill("unverifieduser");
      await page.getByLabel("Mot de passe").fill("Password123!");

      // Submit form
      await page.getByRole("button", { name: "Se connecter" }).click();

      // Wait for redirect to email verification tab
      await expect(
        page.getByRole("heading", { name: /Vérifier votre email/i })
      ).toBeVisible({ timeout: 5000 });

      // Verify resend verification button is present
      await expect(
        page.getByRole("button", { name: /Renvoyer/i })
      ).toBeVisible();
    });

    test("should toggle password visibility", async ({ page }) => {
      const passwordInput = page.getByLabel("Mot de passe");

      // Initially password should be hidden (type="password")
      await expect(passwordInput).toHaveAttribute("type", "password");

      // Click toggle button
      const toggleButton = page.getByRole("button", { name: /Masquer/i });
      await toggleButton.click();

      // Password should now be visible (type="text")
      await expect(passwordInput).toHaveAttribute("type", "text");

      // Click toggle again
      await toggleButton.click();

      // Password should be hidden again
      await expect(passwordInput).toHaveAttribute("type", "password");
    });

    test("should validate empty fields", async ({ page }) => {
      // Try to submit without filling fields
      await page.getByRole("button", { name: "Se connecter" }).click();

      // Verify validation errors appear
      await expect(
        page.getByText(/Le nom d'utilisateur est requis/i)
      ).toBeVisible();
      await expect(page.getByText(/Le mot de passe est requis/i)).toBeVisible();
    });

    test("should show forgot password link", async ({ page }) => {
      // Verify forgot password button exists
      await expect(
        page.getByRole("button", { name: /Mot de passe oublié/i })
      ).toBeVisible();

      // Click forgot password
      await page.getByRole("button", { name: /Mot de passe oublié/i }).click();

      // Verify redirect to forgot password tab
      await expect(
        page.getByRole("heading", { name: /Mot de passe oublié/i })
      ).toBeVisible();
    });
  });

  test.describe("Signout Flow", () => {
    test.beforeEach(async ({ page }) => {
      // Sign in before each signout test
      await page.goto("/auth/login");
      await page.getByLabel("Nom d'utilisateur").fill("testuser");
      await page.getByLabel("Mot de passe").fill("Password123!");
      await page.getByRole("button", { name: "Se connecter" }).click();
      await page.waitForURL("/");
    });

    test("should signout successfully", async ({ page }) => {
      // Click user menu
      await page.getByRole("button", { name: /testuser/i }).click();

      // Click signout in dropdown
      await page.getByRole("menuitem", { name: /Déconnexion/i }).click();

      // Wait for redirect to home page
      await page.waitForURL("/");

      // Verify user menu is not visible (user is signed out)
      await expect(
        page.getByRole("button", { name: /testuser/i })
      ).not.toBeVisible();

      // Verify signin button is now visible
      await expect(
        page.getByRole("link", { name: /Se connecter/i })
      ).toBeVisible();
    });

    test("should invalidate session after signout", async ({ page }) => {
      // Signout
      await page.getByRole("button", { name: /testuser/i }).click();
      await page.getByRole("menuitem", { name: /Déconnexion/i }).click();
      await page.waitForURL("/");

      // Try to access protected route
      await page.goto("/account/settings");

      // Should redirect to login page
      await page.waitForURL("/auth/login");
      expect(page.url()).toContain("/auth/login");
    });

    test("should clear session across tabs", async ({ page, context }) => {
      // Open second tab
      const secondTab = await context.newPage();
      await secondTab.goto("/");

      // Verify user is signed in on second tab
      await expect(
        secondTab.getByRole("button", { name: /testuser/i })
      ).toBeVisible();

      // Signout from first tab
      await page.getByRole("button", { name: /testuser/i }).click();
      await page.getByRole("menuitem", { name: /Déconnexion/i }).click();
      await page.waitForURL("/");

      // Refresh second tab
      await secondTab.reload();

      // Verify user is signed out on second tab
      await expect(
        secondTab.getByRole("button", { name: /testuser/i })
      ).not.toBeVisible();
      await expect(
        secondTab.getByRole("link", { name: /Se connecter/i })
      ).toBeVisible();
    });
  });

  test.describe("Tab Navigation", () => {
    test("should switch between signin and signup tabs", async ({ page }) => {
      // Initially on signin tab
      await expect(
        page.getByRole("heading", { name: "Se connecter" })
      ).toBeVisible();

      // Click signup tab
      await page.getByRole("tab", { name: "S'inscrire" }).click();

      // Verify signup form is visible
      await expect(
        page.getByRole("heading", { name: "S'inscrire" })
      ).toBeVisible();

      // Click signin tab again
      await page.getByRole("tab", { name: "Se connecter" }).click();

      // Verify signin form is visible
      await expect(
        page.getByRole("heading", { name: "Se connecter" })
      ).toBeVisible();
    });
  });

  test.describe("Social Authentication", () => {
    test("should show social auth buttons", async ({ page }) => {
      // Verify social auth buttons are present
      // TODO: Update selectors based on actual SocialAuthButtons implementation
      const socialButtons = page.locator('[data-testid*="oauth"]');
      await expect(socialButtons.first()).toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("should be keyboard navigable", async ({ page }) => {
      // Tab to username field
      await page.keyboard.press("Tab");
      await expect(page.getByLabel("Nom d'utilisateur")).toBeFocused();

      // Tab to password field
      await page.keyboard.press("Tab");
      await expect(page.getByLabel("Mot de passe")).toBeFocused();

      // Tab to forgot password button
      await page.keyboard.press("Tab");
      // Continue tabbing through form elements
    });

    test("should have proper aria labels", async ({ page }) => {
      // Verify username field has aria-label
      const usernameInput = page.getByLabel("Nom d'utilisateur");
      await expect(usernameInput).toHaveAttribute("name", "username");

      // Verify password field has aria-label
      const passwordInput = page.getByLabel("Mot de passe");
      await expect(passwordInput).toHaveAttribute("name", "password");
    });

    test("should announce errors to screen readers", async ({ page }) => {
      // Submit empty form
      await page.getByRole("button", { name: "Se connecter" }).click();

      // Verify error messages have appropriate aria attributes
      const usernameError = page.getByText(/Le nom d'utilisateur est requis/i);
      await expect(usernameError).toBeVisible();

      // TODO: Verify aria-invalid and aria-describedby are set on inputs
    });
  });

  test.describe("CallbackURL Redirect", () => {
    test("should redirect to callback URL after signin", async ({ page }) => {
      // Navigate to protected page (should redirect to login with callbackURL)
      await page.goto("/account/settings");
      await page.waitForURL("/auth/login");

      // Signin
      await page.getByLabel("Nom d'utilisateur").fill("testuser");
      await page.getByLabel("Mot de passe").fill("Password123!");
      await page.getByRole("button", { name: "Se connecter" }).click();

      // Should redirect back to settings page
      // TODO: Verify callbackURL handling is implemented
      await page.waitForURL("/account/settings", { timeout: 10000 });
      expect(page.url()).toContain("/account/settings");
    });
  });
});

/**
 * IMPLEMENTATION NOTES:
 *
 * 1. Database Fixtures:
 *    - Create test fixtures in `tests/fixtures/users.ts`
 *    - Seed before test run: testuser, unverifieduser
 *    - Clean up after test run
 *
 * 2. Mock Email:
 *    - Use Mailpit or similar for email verification tests
 *    - Configure in test environment
 *
 * 3. Playwright Config:
 *    - Update `playwright.config.ts` with baseURL
 *    - Configure test database
 *    - Set up global setup/teardown
 *
 * 4. Test Data:
 *    - testuser: { username: "testuser", password: "Password123!", emailVerified: true }
 *    - unverifieduser: { username: "unverifieduser", password: "Password123!", emailVerified: false }
 *
 * 5. CI/CD Integration:
 *    - Add Playwright to CI pipeline
 *    - Use headless mode in CI
 *    - Store test artifacts (screenshots, videos)
 *
 * ESTIMATED TEST COUNT: 15+ tests
 * COVERAGE: Signin, Signout, Tabs, Social Auth, Accessibility, CallbackURL
 */
