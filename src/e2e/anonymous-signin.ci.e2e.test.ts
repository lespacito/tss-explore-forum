import { expect, test } from "@playwright/test";

test("anonymous sign-in requires a valid beta invitation", async ({ page }) => {
	await page.goto("/auth/anonymous-signin");
	await expect(page).toHaveURL(/\/beta$/);
	const blocked = await page.request.get("/api/auth/get-session");
	expect(blocked.status()).toBe(401);
	const invitation = process.env.BETA_INVITATION_CODES?.split(",")[0];
	if (!invitation)
		throw new Error(
			"Configure a disposable BETA_INVITATION_CODES value for E2E tests",
		);
	await page.getByLabel("Code d’invitation").fill(invitation);
	await page
		.getByRole("button", { name: "Accéder à la bêta", exact: true })
		.click();
	await expect(page).toHaveURL(/\/$/);
	await page.goto("/auth/anonymous-signin");

	await expect(page.getByText(/connexion avec code secret/i)).toBeVisible();
	await expect(page.getByLabel("Code Secret")).toBeVisible();
	await expect(
		page.getByRole("main").getByRole("button", {
			name: "Se connecter",
			exact: true,
		}),
	).toBeEnabled();
});
