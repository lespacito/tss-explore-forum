import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Route as HelpRoute } from "../help";
import { Route as PrivacyRoute } from "../privacy";
import { Route as RulesRoute } from "../rules";

const flags = vi.hoisted(() => ({
	accessRequired: true,
	submissionsOpen: false,
}));
vi.mock("@/features/beta/components/beta-presentation", () => ({
	useBetaPresentation: () => flags,
}));

vi.mock("@tanstack/react-router", () => ({
	createFileRoute: () => (options: unknown) => ({ options }),
	Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
		<a href={to}>{children}</a>
	),
}));

const RulesPage = RulesRoute.options.component;
const HelpPage = HelpRoute.options.component;
const PrivacyPage = PrivacyRoute.options.component;
if (!HelpPage || !PrivacyPage || !RulesPage)
	throw new Error("Public route component missing");

describe("Public beta information", () => {
	beforeEach(() => {
		flags.accessRequired = true;
		flags.submissionsOpen = false;
	});
	it("offers the confirmed contact without requesting sensitive material", () => {
		render(<HelpPage />);

		expect(
			screen
				.getByRole("link", { name: "contact@parlonsviolence.ch" })
				.getAttribute("href"),
		).toBe("mailto:contact@parlonsviolence.ch");
		expect(screen.getByText(/sans joindre de récit personnel/)).toBeDefined();
	});

	it("states the retention policy and distinguishes unverified operations", () => {
		render(<PrivacyPage />);

		expect(
			screen.getByText(/jusqu’à sept jours supplémentaires/),
		).toBeDefined();
		expect(
			screen.getByText(/doivent encore être vérifiées sur le serveur/),
		).toBeDefined();
		expect(
			screen.getByText(
				/lieu effectif d’hébergement.*ne sont pas encore confirmés/,
			),
		).toBeDefined();
		expect(
			screen
				.getByRole("link", { name: "contact@parlonsviolence.ch" })
				.getAttribute("href"),
		).toBe("mailto:contact@parlonsviolence.ch");
	});
});

describe("Access wording on information pages", () => {
	it.each([false, true])(
		"keeps private invitation wording with submissionsOpen=%s",
		(submissionsOpen) => {
			flags.accessRequired = true;
			flags.submissionsOpen = submissionsOpen;
			const { container } = render(
				<>
					<RulesPage />
					<PrivacyPage />
					<HelpPage />
				</>,
			);
			expect(container.textContent).toContain("Règles de la bêta privée");
			expect(container.textContent).toContain("adultes invités");
			expect(container.textContent).toContain(
				"Aucun récit personnel n’est demandé pendant cette première cohorte.",
			);
			expect(container.textContent).toContain("indépendant de la bêta.");
			expect(container.textContent).toContain(
				"nécessite une invitation valide",
			);
		},
	);
	it.each([false, true])(
		"explains public access independently of submissionsOpen=%s",
		(submissionsOpen) => {
			flags.accessRequired = false;
			flags.submissionsOpen = submissionsOpen;
			const { container } = render(
				<>
					<RulesPage />
					<PrivacyPage />
					<HelpPage />
				</>,
			);
			expect(container.textContent).not.toMatch(
				/bêta privée|adultes invités|votre invitation|envoyé l’invitation|nécessite une invitation/,
			);
			expect(container.textContent).toContain(
				"accessibles publiquement en lecture",
			);
			expect(container.textContent).toContain(
				submissionsOpen
					? "Les contributions sont ouvertes"
					: "Les contributions sont temporairement suspendues",
			);
			expect(container.textContent).toContain("code de récupération");
			expect(container.textContent).toContain(
				"Aucun récit personnel n’est demandé sur ce site.",
			);
			expect(container.textContent).toContain("indépendant de la plateforme.");
		},
	);
});
