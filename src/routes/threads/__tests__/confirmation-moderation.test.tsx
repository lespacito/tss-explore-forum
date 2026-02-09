import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Component tests for Confirmation Page Moderation Message (Story 2.4)
 *
 * Tests the actual source code of confirmation.tsx to verify:
 * - Moderation banner content and structure
 * - Navigation behavior
 * - Accessibility patterns
 * - Design system compliance
 *
 * Strategy: Source code analysis (no TanStack Router rendering context needed).
 * Full component rendering tests require proper router mocking setup.
 */

// Load the actual source file for verification
const confirmationSource = readFileSync(
	resolve(__dirname, "../confirmation.tsx"),
	"utf-8",
);

describe("Thread Confirmation Page - Moderation Message (Story 2.4)", () => {
	describe("Moderation banner content", () => {
		it("should contain moderation status heading text", () => {
			expect(confirmationSource).toContain(
				"Votre publication est en cours de modération",
			);
		});

		it("should explain moderation timeline (24-48 hours)", () => {
			expect(confirmationSource).toContain("24-48");
			expect(confirmationSource).toContain("heures");
		});

		it("should provide reassuring explanation about safe space", () => {
			expect(confirmationSource).toContain("espace sûr et bienveillant");
		});

		it("should mention user will be notified after publication", () => {
			expect(confirmationSource).toContain("notifié");
			expect(confirmationSource).toContain("publié");
		});
	});

	describe("Visual elements and imports", () => {
		it("should import Clock icon from lucide-react", () => {
			expect(confirmationSource).toMatch(/import.*Clock.*from.*lucide-react/);
		});

		it("should import CheckCircle2 icon for success banner", () => {
			expect(confirmationSource).toMatch(
				/import.*CheckCircle2.*from.*lucide-react/,
			);
		});

		it("should use design system warning color for moderation banner", () => {
			// Story 2.4 review: must use semantic tokens, not raw Tailwind
			expect(confirmationSource).toContain("bg-warning/30");
			expect(confirmationSource).toContain("border-warning");
			// Must NOT use raw blue classes (old pattern from story guide)
			expect(confirmationSource).not.toContain("bg-blue-50");
			expect(confirmationSource).not.toContain("bg-blue-900");
		});

		it("should use text-foreground for banner text (not hardcoded colors)", () => {
			expect(confirmationSource).toContain("text-foreground");
		});
	});

	describe("Navigation actions", () => {
		it("should have 'Retourner à l'accueil' button navigating to /threads", () => {
			expect(confirmationSource).toContain("Retourner à l'accueil");
			// Verify navigation target
			expect(confirmationSource).toContain('navigate({ to: "/threads" })');
		});

		it("should have 'J'ai sauvegardé mon code' as primary button", () => {
			expect(confirmationSource).toContain("J'ai sauvegardé mon code");
		});

		it("should import SecretCodeDisplay component", () => {
			expect(confirmationSource).toMatch(
				/import.*SecretCodeDisplay.*from/,
			);
		});
	});

	describe("Redirect logic for missing params", () => {
		it("should redirect when no secretCode is provided", () => {
			expect(confirmationSource).toContain("!secretCode");
			expect(confirmationSource).toContain("!isFirstPublication");
		});

		it("should validate search params (secretCode, threadSlug, isFirstPublication)", () => {
			expect(confirmationSource).toContain("secretCode");
			expect(confirmationSource).toContain("threadSlug");
			expect(confirmationSource).toContain("isFirstPublication");
		});
	});

	describe("Accessibility (WCAG 2.1 AA)", () => {
		it("should use semantic heading structure (h1 for main, h3 for banner)", () => {
			expect(confirmationSource).toContain("<h1");
			expect(confirmationSource).toContain("<h3");
		});

		it("should use Button components (natively accessible)", () => {
			expect(confirmationSource).toMatch(
				/import.*Button.*from.*components\/ui\/button/,
			);
		});

		it("should have responsive layout (flex-col sm:flex-row)", () => {
			expect(confirmationSource).toContain("flex-col sm:flex-row");
		});
	});

	describe("Content ordering in JSX", () => {
		it("should display secret code BEFORE moderation banner", () => {
			const secretCodePos = confirmationSource.indexOf("SecretCodeDisplay");
			const moderationBannerPos = confirmationSource.indexOf(
				"Moderation Information Banner",
			);
			expect(secretCodePos).toBeGreaterThan(-1);
			expect(moderationBannerPos).toBeGreaterThan(-1);
			expect(secretCodePos).toBeLessThan(moderationBannerPos);
		});

		it("should display success banner as first element", () => {
			const successBannerPos = confirmationSource.indexOf("Success Banner");
			const secretCodePos = confirmationSource.indexOf("Secret Code Display");
			expect(successBannerPos).toBeLessThan(secretCodePos);
		});
	});

	describe("Route definition", () => {
		it("should define route at /threads/confirmation", () => {
			expect(confirmationSource).toContain(
				'createFileRoute("/threads/confirmation")',
			);
		});

		it("should export Route constant", () => {
			expect(confirmationSource).toContain("export const Route");
		});
	});
});
