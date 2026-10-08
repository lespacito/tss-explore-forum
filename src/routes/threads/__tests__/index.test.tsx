import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

/**
 * Tests for /threads route components (Story 3.1 AC1, AC3)
 *
 * Tests ThreadCard rendering with various data scenarios.
 * Full route integration (loader, navigation) is verified by E2E tests.
 */

// Mock TanStack Router - Link renders as a plain <a>
vi.mock("@tanstack/react-router", () => ({
	Link: ({
		children,
		to,
		params,
		className,
	}: {
		children: React.ReactNode;
		to: string;
		params?: Record<string, string>;
		className?: string;
	}) => {
		const href = params
			? to.replace(/\$(\w+)/g, (_, key) => params[key] ?? "")
			: to;
		return (
			<a href={href} className={className} data-testid="router-link">
				{children}
			</a>
		);
	},
}));

// Mock sanitizeHtml (SafeHtmlDisplay dependency)
vi.mock("@/lib/security/sanitize-html", () => ({
	sanitizeHtml: (html: string) => html,
}));

import { BetaPresentationProvider } from "@/features/beta/components/beta-presentation";
import { ThreadCard } from "@/features/threads/components/thread-card";

const baseThread = {
	id: "thread-1",
	title: "Mon témoignage important",
	body: "<p>Contenu du thread avec du texte</p>",
	slug: "mon-temoignage-important",
	category: "VIOLENCE",
	createdAt: new Date("2024-01-15T10:00:00Z").toISOString(),
	updatedAt: new Date("2024-01-15T10:00:00Z").toISOString(),
	aliasName: "brave-fox",
	aliasId: "alias-1",
	displayUsername: "TestUser",
};

describe("ThreadCard rendering", () => {
	it("should render the thread title", () => {
		render(<ThreadCard thread={baseThread} />);

		const title = screen.getByTestId("thread-title");
		expect(title.textContent).toBe("Mon témoignage important");
	});

	it("should render the category badge", () => {
		render(<ThreadCard thread={baseThread} />);

		const badge = screen.getByTestId("thread-category");
		expect(badge.textContent).toBe("Violence");
	});

	it("should render author name as 'Auteur anonyme' for all categories", () => {
		render(<ThreadCard thread={baseThread} />);

		const author = screen.getByTestId("thread-author");
		expect(author.textContent).toBe("Auteur anonyme");
	});

	it("should render a timestamp", () => {
		render(<ThreadCard thread={baseThread} />);

		const timestamp = screen.getByTestId("thread-timestamp");
		expect(timestamp.textContent).toBeTruthy();
		// date-fns formatDistanceToNow with French locale produces text like "il y a environ 2 ans"
		expect(timestamp.textContent?.length).toBeGreaterThan(0);
	});

	it("should render the body excerpt via SafeHtmlDisplay", () => {
		render(<ThreadCard thread={baseThread} />);

		const excerpt = screen.getByTestId("thread-excerpt");
		expect(excerpt.innerHTML).toContain("Contenu du thread");
	});

	it("should link to the thread detail page via slug", () => {
		render(<ThreadCard thread={baseThread} />);

		const link = screen.getByTestId("router-link");
		expect(link.getAttribute("href")).toBe("/threads/mon-temoignage-important");
	});

	it("should not contain a nested button inside the link (a11y)", () => {
		render(<ThreadCard thread={baseThread} />);

		const link = screen.getByTestId("router-link");
		const buttons = link.querySelectorAll("button");
		expect(buttons).toHaveLength(0);
	});
});

describe("ThreadCard with different categories", () => {
	const categories = [
		["VIOLENCE", "Violence"],
		["ABUS", "Abus"],
		["TEMOIN", "Témoin"],
		["DETRESSE", "Détresse"],
		["AUTRE", "Autre situation"],
	] as const;

	for (const [category, label] of categories) {
		it(`should render category badge for ${category}`, () => {
			const thread = { ...baseThread, id: `thread-${category}`, category };
			render(<ThreadCard thread={thread} />);

			const badge = screen.getByTestId("thread-category");
			expect(badge.textContent).toBe(label);
		});
	}
});

describe("Empty state logic", () => {
	it("should render nothing when threads array is empty (map produces no elements)", () => {
		const threads: (typeof baseThread)[] = [];
		render(
			<div data-testid="thread-list">
				{threads.map((thread) => (
					<ThreadCard key={thread.id} thread={thread} />
				))}
				{threads.length === 0 && (
					<div data-testid="empty-state">Aucune discussion pour le moment.</div>
				)}
			</div>,
		);

		expect(screen.queryByTestId("thread-card")).toBeNull();
		expect(screen.getByTestId("empty-state").textContent).toContain(
			"Aucune discussion",
		);
	});

	it("should render ThreadCards when threads exist (no empty state)", () => {
		const threads = [baseThread];
		render(
			<div data-testid="thread-list">
				{threads.map((thread) => (
					<ThreadCard key={thread.id} thread={thread} />
				))}
				{threads.length === 0 && (
					<div data-testid="empty-state">Aucune discussion pour le moment.</div>
				)}
			</div>,
		);

		expect(screen.getByTestId("thread-card")).toBeTruthy();
		expect(screen.queryByTestId("empty-state")).toBeNull();
	});
});

describe("publication mode card wording", () => {
	it.each(
		[true, false].flatMap((accessRequired) =>
			[true, false].map((submissionsOpen) => ({
				accessRequired,
				submissionsOpen,
			})),
		),
	)("keeps the sensitive excerpt masked in real mode with %j", (flags) => {
		const { container } = render(
			<BetaPresentationProvider value={{ ...flags, publicationMode: "real" }}>
				<ThreadCard thread={{ ...baseThread, isSensitive: true }} />
			</BetaPresentationProvider>,
		);
		expect(screen.getByTestId("thread-author").textContent).toBe(
			"Auteur anonyme",
		);
		expect(screen.queryByTestId("thread-excerpt")).toBeNull();
		expect(container.textContent).toContain("Lire le témoignage");
		expect(container.textContent).not.toContain("situation fictive");
	});
	it("retains fictional wording when no publication mode is configured", () => {
		render(<ThreadCard thread={{ ...baseThread, isSensitive: true }} />);
		expect(screen.getByText(/Lire la situation fictive/)).toBeDefined();
		expect(screen.queryByTestId("thread-excerpt")).toBeNull();
	});
});
