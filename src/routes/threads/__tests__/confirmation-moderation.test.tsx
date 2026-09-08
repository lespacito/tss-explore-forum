import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PublicationReceiptProvider } from "@/features/beta/components/publication-receipt";
import { Route } from "../confirmation";
vi.mock("@tanstack/react-router", () => ({
	createFileRoute: () => (options: unknown) => ({ options }),
	Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
		<a href={to}>{children}</a>
	),
}));
describe("Publication tracking", () => {
	it("offers status tracking after a reload without claiming a new submission", () => {
		const Component = Route.options.component!;
		render(
			<PublicationReceiptProvider>
				<Component />
			</PublicationReceiptProvider>,
		);
		expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
			"Suivre votre dépôt",
		);
		expect(
			screen
				.getByRole("link", { name: "Voir mes publications" })
				.getAttribute("href"),
		).toBe("/account/profile");
		expect(screen.getByText(/Aucune notification par email/)).toBeDefined();
		expect(screen.queryByText(/TEST-CODE/)).toBeNull();
	});
	it("discards legacy URL credentials", () => {
		const validate = Route.options.validateSearch as (
			search: unknown,
		) => unknown;
		expect(
			validate({ secretCode: "OLD-SECRET", threadSlug: "private" }),
		).toEqual({});
	});
});
