import { describe, expect, it, vi } from "vitest";

vi.mock("@/data/env/server", () => ({
	env: {
		APP_URL: "https://example.test",
	},
}));

import {
	deleteAccountTemplate,
	passwordChangedEmail,
	resetPasswordEmail,
	verifyEmailTemplate,
	welcomeEmail,
} from "../templates";

describe("email templates branding", () => {
	it("n’affiche plus TSS Explore Forum dans aucun template", () => {
		const templates = [
			welcomeEmail("Alice"),
			verifyEmailTemplate("Bob", "https://example.test/verify"),
			resetPasswordEmail("Claire", "https://example.test/reset"),
			passwordChangedEmail("David"),
			deleteAccountTemplate("Eve", "https://example.test/delete"),
		];

		for (const template of templates) {
			expect(template.html).not.toContain("TSS Explore Forum");
			expect(template.text).not.toContain("TSS Explore Forum");
		}
	});

	it("utilise Parlons Violence partout", () => {
		const templates = [
			welcomeEmail("Alice"),
			verifyEmailTemplate("Bob", "https://example.test/verify"),
			resetPasswordEmail("Claire", "https://example.test/reset"),
			passwordChangedEmail("David"),
			deleteAccountTemplate("Eve", "https://example.test/delete"),
		];

		for (const template of templates) {
			expect(template.html).toContain(
				"Cet email a été envoyé par Parlons Violence",
			);
			expect(template.text).toContain(
				"Cet email a été envoyé par Parlons Violence",
			);
		}
	});
});
