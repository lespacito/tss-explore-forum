import { render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import FaqSection from "@/components/shadcn-studio/blocks/faq-section";
import { Route as HelpRoute } from "../help";
import { Route as HomeRoute } from "../index";

vi.mock("@tanstack/react-router", () => ({
	createFileRoute: () => (options: unknown) => ({ options }),
	Link: ({
		to,
		children,
		className,
	}: {
		to: string;
		children: ReactNode;
		className?: string;
	}) => (
		<a href={to} className={className}>
			{children}
		</a>
	),
}));
vi.mock("@/features/auth/components/AnonymousPostButton", () => ({
	AnonymousPostButton: ({ label }: { label: string }) => (
		<button type="button">{label}</button>
	),
}));
const Home = HomeRoute.options.component;
const Help = HelpRoute.options.component;
if (!Home || !Help) throw new Error("Missing page component");

describe("Private beta orientation and external help", () => {
	it("states the project mission and fictional private test before starting", () => {
		render(<Home />);
		const mission = screen.getByRole("heading", {
			level: 1,
			name: "Mieux comprendre les situations de violence.",
		});
		const reading = screen.getByRole("link", {
			name: "Consulter les situations fictives",
		});
		expect(
			mission.compareDocumentPosition(reading) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
		expect(
			screen.getByText(
				/Bêta privée pour adultes invités.*Situations fictives uniquement/i,
			),
		).toBeInTheDocument();
		expect(
			screen.getByText(/fournie avec votre invitation.*Environ 10 minutes/i),
		).toBeInTheDocument();
		expect(
			screen.getByText(
				/Cette bêta n’est pas un service d’urgence ni d’aide professionnelle/i,
			),
		).toBeInTheDocument();
	});

	it.each([Home, Help])(
		"separates victim support from emergencies with actionable links",
		(Page) => {
			render(<Page />);
			const notice = screen.getByRole("complementary");
			expect(
				within(notice).getByRole("link", { name: /142.*aide aux victimes/i }),
			).toHaveAttribute("href", "tel:142");
			expect(
				within(notice).getByRole("link", { name: /117.*police/i }),
			).toHaveAttribute("href", "tel:117");
			expect(
				within(notice).getByRole("link", { name: /144.*urgence médicale/i }),
			).toHaveAttribute("href", "tel:144");
			expect(
				within(notice).getByRole("link", { name: /143.*main tendue/i }),
			).toHaveAttribute("href", "tel:143");
			expect(
				within(notice).getByRole("link", { name: /centres LAVI/i }),
			).toHaveAttribute("href", "https://www.aide-aux-victimes.ch/fr/");
			expect(
				within(notice).getByText(/142 n’est pas un numéro d’urgence/i),
			).toBeInTheDocument();
			expect(within(notice).getByText(/danger imminent/i)).toBeInTheDocument();
		},
	);

	it("uses the same statuses, recovery code and privacy limits in FAQ", () => {
		const { container } = render(<FaqSection />);
		expect(container).toHaveTextContent("À examiner, Publié ou Non publié");
		expect(container).toHaveTextContent("Auteur anonyme");
		expect(container).toHaveTextContent("reste interne");
		expect(container).not.toHaveTextContent("L’alias est affiché si");
		expect(container).toHaveTextContent("Mes scénarios");
		expect(container).toHaveTextContent("code de récupération");
		expect(container).toHaveTextContent(
			"L’administration technique peut relier votre session à ses alias",
		);
		expect(container).not.toHaveTextContent(
			/code secret|Mes publications|pseudonyme/i,
		);
	});
});
