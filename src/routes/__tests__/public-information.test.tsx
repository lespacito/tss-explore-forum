import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Route as HelpRoute } from "../help";
import { Route as PrivacyRoute } from "../privacy";

vi.mock("@tanstack/react-router", () => ({
	createFileRoute: () => (options: unknown) => ({ options }),
	Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
		<a href={to}>{children}</a>
	),
}));

const HelpPage = HelpRoute.options.component;
const PrivacyPage = PrivacyRoute.options.component;
if (!HelpPage || !PrivacyPage)
	throw new Error("Public route component missing");

describe("Public beta information", () => {
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
