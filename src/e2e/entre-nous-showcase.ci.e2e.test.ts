import { expect, test } from "@playwright/test";

// Opt in against an isolated local showcase. Never send a contribution.
const showcase =
	process.env.PREPROD_SHOWCASE === "true" &&
	process.env.PUBLICATION_MODE === "test" &&
	process.env.BETA_SUBMISSIONS_OPEN === "false" &&
	process.env.BETA_ACCESS_REQUIRED === "false";

test.describe("closed Entre nous showcase", () => {
	test.skip(
		!showcase,
		"Requires the closed, public, fictional showcase fixture",
	);
	for (const theme of ["light", "dark"] as const) {
		for (const width of [320, 360, 390, 1440]) {
			test(`${width}px ${theme}: honest offer and no horizontal overflow`, async ({
				page,
			}) => {
				await page.addInitScript((value) => {
					localStorage.setItem("tss-explore-theme", value);
				}, theme);
				await page.setViewportSize({ width, height: 900 });
				const mutations: string[] = [];
				page.on("request", (request) => {
					if (!["GET", "HEAD", "OPTIONS"].includes(request.method()))
						mutations.push(`${request.method()} ${request.url()}`);
				});
				await page.goto("/");
				const main = page.getByRole("main");
				await expect(page.locator("html")).toHaveClass(theme);
				await expect(main.getByRole("heading", { level: 1 })).toHaveText(
					"Pas assez grave pour appeler ? Assez pour en parler.",
				);
				await expect(
					main.getByText("Démonstration fictive · Contributions fermées"),
				).toBeVisible();
				await expect(main.locator(".showcase-future")).toContainText(
					"sans nom réel ni adresse email",
				);
				await expect(main.locator(".showcase-future")).toContainText(
					"relues par une personne avant publication",
				);
				const action = main.getByRole("button", {
					name: "En parler, entre nous",
					exact: true,
				});
				await expect(action).toBeDisabled();
				await expect(action).toHaveAccessibleDescription(
					/aucun envoi possible/,
				);
				await expect(main.locator("form, input, textarea")).toHaveCount(0);
				await expect(main.locator('a[href="/threads/new"]')).toHaveCount(0);
				await action.dispatchEvent("click");
				await expect(page).toHaveURL(/\/$/);
				expect(mutations).toEqual([]);
				await expect(main.getByRole("figure")).toContainText(
					"Ce récit est inventé",
				);
				await expect(
					main.getByText("Un alias ne garantit pas un anonymat absolu.", {
						exact: true,
					}),
				).toBeVisible();
				expect(
					await page.evaluate(
						() => document.documentElement.scrollWidth <= innerWidth,
					),
				).toBe(true);
			});
		}
	}

	test("200% CSS magnification reflows to 320 CSS pixels", async ({ page }) => {
		for (const theme of ["light", "dark"]) {
			await page.addInitScript(
				(value) => localStorage.setItem("tss-explore-theme", value),
				theme,
			);
			for (const width of [640, 1440]) {
				await page.setViewportSize({ width, height: 900 });
				await page.goto("/");
				await expect(page.locator("html")).toHaveClass(theme);
				await page.addStyleTag({ content: "html { zoom: 2; }" });
				await expect(
					page.getByRole("button", {
						name: "En parler, entre nous",
						exact: true,
					}),
				).toBeDisabled();
				expect(
					await page.evaluate(
						() => document.documentElement.scrollWidth <= innerWidth,
					),
				).toBe(true);
			}
		}
	});

	test("keyboard flow, native disclosure and reduced motion", async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.setViewportSize({ width: 390, height: 900 });
		await page.goto("/");
		await expect(
			page.getByRole("button", { name: "Menu de navigation — Informations" }),
		).toBeVisible();
		await page.keyboard.press("Tab");
		await expect(
			page.getByRole("link", { name: "Aller au contenu" }),
		).toBeFocused();
		await page.keyboard.press("Enter");
		await page.keyboard.press("Tab");
		await expect(
			page.getByRole("link", { name: "117 — police", exact: true }).first(),
		).toBeFocused();
		const stops: string[] = [];
		for (let i = 0; i < 15; i++) {
			const focused = await page.evaluate(() => {
				const el = document.activeElement as HTMLElement;
				const css = getComputedStyle(el);
				return {
					text: el.textContent?.trim(),
					outline: css.outlineStyle,
					width: Number.parseFloat(css.outlineWidth),
				};
			});
			if (focused.text) stops.push(focused.text);
			expect(focused.outline).toBe("solid");
			expect(focused.width).toBeGreaterThanOrEqual(2);
			await page.keyboard.press("Tab");
		}
		expect(stops).not.toContain("En parler, entre nous");
		const summary = page.locator(".landing-faq-list summary").first();
		await summary.focus();
		await page.keyboard.press("Enter");
		await expect(
			page.locator(".landing-faq-list details").first(),
		).toHaveAttribute("open", "");
		await page.keyboard.press("Space");
		await expect(
			page.locator(".landing-faq-list details").first(),
		).not.toHaveAttribute("open");
		expect(
			await summary
				.locator("svg")
				.evaluate((el) => getComputedStyle(el).transitionDuration),
		).toBe("0s");
	});
});
