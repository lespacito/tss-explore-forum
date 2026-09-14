import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	PublicationReceiptProvider,
	usePublicationReceipt,
} from "@/features/beta/components/publication-receipt";
import { Route } from "../confirmation";

vi.mock("@tanstack/react-router", () => ({
	createFileRoute: () => (options: unknown) => ({ options }),
	Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
		<a href={to}>{children}</a>
	),
}));

const ConfirmationPage = Route.options.component;
if (!ConfirmationPage) throw new Error("Confirmation route component missing");

function ConfirmSubmission() {
	const { setSecretCode, setSubmissionConfirmed } = usePublicationReceipt();
	return (
		<button
			type="button"
			onClick={() => {
				setSecretCode("TEST-CODE");
				setSubmissionConfirmed(true);
			}}
		>
			Confirm submission
		</button>
	);
}

describe("Publication tracking", () => {
	it("offers status tracking on a direct visit without claiming a new submission", () => {
		render(
			<PublicationReceiptProvider>
				<ConfirmationPage />
			</PublicationReceiptProvider>,
		);
		expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
			"Suivre votre scénario",
		);
		expect(
			screen
				.getByRole("link", { name: "Voir mes scénarios" })
				.getAttribute("href"),
		).toBe("/account/profile");
		expect(screen.getByText(/Aucune notification par email/)).toBeDefined();
		expect(screen.queryByText(/TEST-CODE/)).toBeNull();
	});

	it("confirms a completed submission and names its current status", () => {
		render(
			<PublicationReceiptProvider>
				<ConfirmSubmission />
				<ConfirmationPage />
			</PublicationReceiptProvider>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Confirm submission" }));

		expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
			"Votre scénario a été envoyé",
		);
		expect(screen.getByText(/Statut : À examiner/).textContent).toContain(
			"Statut : À examiner",
		);
		expect(
			screen.getByRole("heading", {
				name: "Conservez votre code de récupération",
			}),
		).toBeDefined();
		expect(
			screen.getByText("Conservez ce code dans un endroit privé."),
		).toBeDefined();
		expect(screen.getByText("Ouvrez Mes scénarios.")).toBeDefined();
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
