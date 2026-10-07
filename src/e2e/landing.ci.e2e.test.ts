import { expect, type Page, test } from "@playwright/test";

async function enterPrivateBeta(page: Page) {
	await page.goto("/");
	if (process.env.BETA_ACCESS_REQUIRED === "false") {
		await expect(page).toHaveURL(/\/$/);
		return;
	}
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

// The civic navbar uses one accessible trigger at every width. Compact
// account actions live inside its menu, rather than beside the trigger.
test("landing reading and navigation journeys across viewports", async ({
	page,
}) => {
	// One invited visitor resizes the viewport. Re-entering for every width
	// would consume the real invitation limiter shared by the CI browsers.
	await enterPrivateBeta(page);
	for (const width of [1440, 390, 320]) {
		await page.setViewportSize({ width, height: 900 });

		const main = page.getByRole("main");
		await expect(
			main.getByRole("heading", {
				name: "Mieux comprendre les situations de violence.",
				level: 1,
			}),
		).toBeVisible();
		await expect(
			main.getByRole("button", {
				name: /Proposer une situation fictive|Dépôts suspendus/,
			}),
		).toBeVisible();
		await expect(
			page.getByText(/Envoi de situations fictives (ouvert|suspendu)/),
		).toBeVisible();
		await expect(page.getByRole("contentinfo")).toHaveClass("landing-footer");

		const navigation = page.getByRole("navigation", {
			name: "Navigation principale",
			includeHidden: true,
		});
		const trigger = navigation.getByRole("button", {
			name: "Menu de navigation — Informations",
			exact: true,
			includeHidden: true,
		});
		await expect(trigger).toBeVisible();
		await expect(
			navigation.getByRole("link", { name: "Aide", exact: true }),
		).toBeVisible();

		// The theme control mounts only after hydration (including when hidden
		// by compact CSS). Wait for interactive UI before sending a key.
		await expect(
			navigation.getByRole("switch", {
				name: "Thème sombre",
				includeHidden: true,
			}),
		).toHaveCount(1);

		// Reading is the primary action and must not create an auth session.
		await main
			.getByRole("link", {
				name: "Consulter les situations fictives",
				exact: true,
			})
			.click();
		// The dev server compiles this route on its first visit. Complete
		// navigation within the test budget before asserting its result.
		await page.waitForURL(/\/threads(?:\?|$)/);
		await expect(page).toHaveURL(/\/threads(?:\?|$)/);
		await expect(
			main.getByRole("heading", {
				name: "Situations fictives publiées",
				level: 1,
			}),
		).toBeVisible();
		const session = await page.request.get("/api/auth/get-session");
		expect(session.status()).toBe(200);
		expect(await session.json()).toBeNull();
		await page.getByRole("link", { name: "Parlons Violence, accueil" }).click();
		await expect(page).toHaveURL(/\/$/);

		// Exercise the actual menu and keyboard interaction, not just its label.
		await trigger.focus();
		await trigger.press("Enter");
		const menu = page.getByRole("menu");
		await expect(menu).toBeVisible();
		await expect(trigger).toHaveAttribute("aria-expanded", "true");
		for (const [name, href] of [
			["Situations fictives publiées", "/threads"],
			["Règles", "/rules"],
			["Confidentialité", "/privacy"],
			["Aide et contact", "/help"],
			["Retrouver ma session", "/auth/anonymous-signin"],
		]) {
			await expect(
				menu.getByRole("menuitem", { name, exact: true }),
			).toBeVisible();
			await expect(
				menu.getByRole("menuitem", { name, exact: true }),
			).toHaveAttribute("href", href);
		}
		if (width < 1280) {
			await expect(
				menu.getByRole("menuitemcheckbox", { name: "Thème sombre" }),
			).toBeVisible();
		}
		await page.keyboard.press("Escape");
		await expect(menu).toBeHidden();
		await expect(trigger).toBeFocused();

		await trigger.click();
		await menu
			.getByRole("menuitem", { name: "Retrouver ma session", exact: true })
			.click();
		await expect(page).toHaveURL(/\/auth\/anonymous-signin$/);
		await expect(
			page.getByRole("main").getByLabel("Code de récupération"),
		).toBeVisible();

		await navigation.getByRole("link", { name: "Aide", exact: true }).click();
		await expect(page).toHaveURL(/\/help$/);
		await expect(navigation).toBeVisible();
		await expect(page.getByRole("contentinfo")).toBeVisible();
		await expect(page.getByRole("contentinfo")).not.toHaveClass(
			"landing-footer",
		);
		await expect(page.locator(".landing-hero")).toHaveCount(0);
		await navigation
			.getByRole("link", { name: "Parlons Violence, accueil" })
			.click();
		await expect(page).toHaveURL(/\/$/);
	}
});

test("public wording and suspended contributions need no invitation", async ({
	page,
}) => {
	test.skip(
		process.env.BETA_ACCESS_REQUIRED !== "false",
		"Public presentation scenario",
	);
	await page.goto("/");
	await expect(page).toHaveURL(/\/$/);
	await expect(page).toHaveTitle("Parlons Violence");
	await expect(
		page.getByText(
			"Accès public pour adultes · Situations fictives uniquement",
		),
	).toBeVisible();
	if (process.env.BETA_SUBMISSIONS_OPEN !== "true") {
		await expect(
			page.getByRole("button", { name: "Dépôts suspendus" }),
		).toBeDisabled();
		await expect(
			page.getByText(
				"Le site est accessible publiquement en lecture. Les contributions sont temporairement suspendues.",
			),
		).toBeVisible();
	}
	for (const path of ["/", "/rules", "/privacy", "/help"]) {
		await page.goto(path);
		await expect(page.getByRole("main")).not.toContainText(
			/bêta privée|adultes invités|votre invitation|nécessite une invitation/i,
		);
		await expect(page.getByRole("contentinfo")).not.toContainText(
			/bêta privée/i,
		);
	}
});
