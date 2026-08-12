import { expect, test } from "@playwright/test";

test("anonymous sign-in page is available", async ({ page }) => {
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
