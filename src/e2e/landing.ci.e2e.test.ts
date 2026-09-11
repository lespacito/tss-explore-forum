import { expect, type Page, test } from "@playwright/test";

async function enterPrivateBeta(page: Page) {
	await page.goto("/");
	await expect(page).toHaveURL(/\/beta$/);

	const invitation = process.env.BETA_INVITATION_CODES?.split(",")[0];
	if (!invitation) {
		throw new Error(
			"Configure a disposable BETA_INVITATION_CODES value for E2E tests",
		);
	}

	await page.getByLabel("Code d’invitation").fill(invitation);
	await page
		.getByRole("button", { name: "Accéder à la bêta", exact: true })
		.click();
	await expect(page).toHaveURL(/\/$/);
}

test("landing keeps its primary journey and navigation across viewports", async ({
	page,
}) => {
	await enterPrivateBeta(page);

	await expect(
		page.getByRole("heading", { name: "Parlons Violence", level: 1 }),
	).toBeVisible();
	await expect(
		page.getByRole("button", {
			name: /Entrer avec mon invitation|Dépôts suspendus/,
		}),
	).toBeVisible();
	await expect(page.getByRole("status")).toContainText("Dépôts suspendus");
	await expect(
		page.getByRole("navigation", { name: "Navigation de la page d’accueil" }),
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: "Comment ça marche" }),
	).toHaveAttribute("href", "#comment-ca-marche");
	await expect(
		page.getByRole("link", { name: "Vos questions" }),
	).toHaveAttribute("href", "#questions");

	await page.setViewportSize({ width: 390, height: 844 });
	await expect(
		page.getByRole("navigation", { name: "Navigation de la page d’accueil" }),
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: "Retrouver ma session" }),
	).toBeVisible();

	await page.goto("/help");
	await expect(page.locator("header.landing-nav")).toHaveCount(0);
	await expect(page.locator("footer.landing-footer")).toHaveCount(0);
});
