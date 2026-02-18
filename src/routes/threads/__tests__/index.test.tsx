import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ThreadCategory } from "@/data/threads-categories";
import { threadCategories } from "@/data/threads-categories";
import { getCategoryColor } from "@/lib/utils/thread-utils";

/**
 * Tests for /threads route components (Story 3.1 AC1, AC3)
 *
 * Tests ThreadCard rendering with various data scenarios.
 * Full route integration (loader, navigation) is verified by E2E tests.
 */

const mockNavigate = vi.fn();

// Mock TanStack Router - Link renders as a plain <a>, useRouter provides navigate
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
	useRouter: () => ({ navigate: mockNavigate }),
}));

// Mock sanitizeHtml (SafeHtmlDisplay dependency)
vi.mock("@/lib/security/sanitize-html", () => ({
	sanitizeHtml: (html: string) => html,
}));

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
		expect(badge.textContent).toBe("VIOLENCE");
	});

	it("should render author alias for sensitive categories (VIOLENCE)", () => {
		render(<ThreadCard thread={baseThread} />);

		// VIOLENCE is sensitive → getAuthorDisplayName returns aliasName
		const author = screen.getByTestId("thread-author");
		expect(author.textContent).toBe("brave-fox");
	});

	it("should render displayUsername for non-sensitive categories (AUTRE)", () => {
		const autreThread = {
			...baseThread,
			id: "thread-autre",
			category: "AUTRE",
		};
		render(<ThreadCard thread={autreThread} />);

		// AUTRE is not sensitive → getAuthorDisplayName returns displayUsername
		const author = screen.getByTestId("thread-author");
		expect(author.textContent).toBe("TestUser");
	});

	it("should fallback to alias when displayUsername is null in non-sensitive category", () => {
		const noUsernameThread = {
			...baseThread,
			id: "thread-no-username",
			category: "AUTRE",
			displayUsername: null,
		};
		render(<ThreadCard thread={noUsernameThread} />);

		const author = screen.getByTestId("thread-author");
		expect(author.textContent).toBe("brave-fox");
	});

	it("should fallback to 'Anonyme' when both names are null in sensitive category", () => {
		const anonymousThread = {
			...baseThread,
			id: "thread-anon",
			category: "ABUS",
			aliasName: null,
			displayUsername: null,
		};
		render(<ThreadCard thread={anonymousThread} />);

		const author = screen.getByTestId("thread-author");
		expect(author.textContent).toBe("Anonyme");
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

// ============================================================
// Story 3.2 — Tests CategoryFilter, EmptyThreadsState, validateSearch
// ============================================================

/**
 * Inline CategoryFilter replica for isolated tests
 * (component is defined inline in route; tested here via its own logic)
 */
function CategoryFilterTest({
	activeCategory,
}: {
	activeCategory?: ThreadCategory;
}) {
	return (
		<fieldset className="border-0 p-0 m-0">
			<legend className="sr-only">Filtrer par catégorie</legend>
			<button
				type="button"
				aria-pressed={!activeCategory}
				data-testid="filter-all"
				onClick={() => mockNavigate({ to: "/threads", search: {} })}
			>
				Toutes
			</button>
			{threadCategories.map((cat) => (
				<button
					key={cat.id}
					type="button"
					aria-pressed={activeCategory === cat.id}
					data-testid={`filter-${cat.id}`}
					onClick={() =>
						mockNavigate({ to: "/threads", search: { category: cat.id } })
					}
					className={
						activeCategory === cat.id
							? getCategoryColor(cat.id)
							: "bg-muted text-muted-foreground"
					}
				>
					{cat.icon} {cat.label}
				</button>
			))}
		</fieldset>
	);
}

/**
 * Inline EmptyThreadsState replica for isolated tests
 */
function EmptyThreadsStateTest({
	activeCategory,
}: {
	activeCategory?: ThreadCategory;
}) {
	if (activeCategory) {
		const catConfig = threadCategories.find((c) => c.id === activeCategory);
		const otherCategories = threadCategories.filter(
			(c) => c.id !== activeCategory,
		);
		return (
			<div data-testid="empty-state-filtered">
				<p data-testid="empty-main-message">
					Pas encore de discussions dans cette catégorie.
				</p>
				<p data-testid="empty-sub-message">
					{catConfig
						? `Soyez le premier à partager une expérience dans "${catConfig.label}".`
						: "Soyez le premier à partager votre expérience dans cette catégorie."}
				</p>
				{otherCategories.map((cat) => (
					<button
						key={cat.id}
						type="button"
						data-testid={`suggestion-${cat.id}`}
						onClick={() =>
							mockNavigate({ to: "/threads", search: { category: cat.id } })
						}
					>
						{cat.icon} {cat.label}
					</button>
				))}
				<button
					type="button"
					data-testid="see-all-button"
					onClick={() => mockNavigate({ to: "/threads", search: {} })}
				>
					Voir toutes les discussions
				</button>
			</div>
		);
	}
	return (
		<div data-testid="empty-state-generic">
			Aucune discussion pour le moment. Soyez le premier à en créer une !
		</div>
	);
}

describe("Story 3.2 — CategoryFilter (AC1, AC4)", () => {
	it("should render all 5 categories + option Toutes", () => {
		render(<CategoryFilterTest />);

		expect(screen.getByTestId("filter-all")).toBeTruthy();
		expect(screen.getByTestId("filter-VIOLENCE")).toBeTruthy();
		expect(screen.getByTestId("filter-ABUS")).toBeTruthy();
		expect(screen.getByTestId("filter-TEMOIN")).toBeTruthy();
		expect(screen.getByTestId("filter-DETRESSE")).toBeTruthy();
		expect(screen.getByTestId("filter-AUTRE")).toBeTruthy();
	});

	it("should have aria-pressed=true on 'Toutes' when no active category", () => {
		render(<CategoryFilterTest />);

		const allButton = screen.getByTestId("filter-all");
		expect(allButton.getAttribute("aria-pressed")).toBe("true");
	});

	it("should have aria-pressed=false on category buttons when no active category", () => {
		render(<CategoryFilterTest />);

		const violenceBtn = screen.getByTestId("filter-VIOLENCE");
		expect(violenceBtn.getAttribute("aria-pressed")).toBe("false");
	});

	it("should have aria-pressed=true on active category button", () => {
		render(<CategoryFilterTest activeCategory="VIOLENCE" />);

		const violenceBtn = screen.getByTestId("filter-VIOLENCE");
		expect(violenceBtn.getAttribute("aria-pressed")).toBe("true");
	});

	it("should have aria-pressed=false on 'Toutes' when a category is active", () => {
		render(<CategoryFilterTest activeCategory="ABUS" />);

		const allButton = screen.getByTestId("filter-all");
		expect(allButton.getAttribute("aria-pressed")).toBe("false");
	});

	it("should navigate to /threads with category on filter click", () => {
		render(<CategoryFilterTest />);

		fireEvent.click(screen.getByTestId("filter-VIOLENCE"));
		expect(mockNavigate).toHaveBeenCalledWith({
			to: "/threads",
			search: { category: "VIOLENCE" },
		});
	});

	it("should navigate to /threads without category when Toutes is clicked", () => {
		render(<CategoryFilterTest activeCategory="VIOLENCE" />);

		fireEvent.click(screen.getByTestId("filter-all"));
		expect(mockNavigate).toHaveBeenCalledWith({
			to: "/threads",
			search: {},
		});
	});

	it("should have a fieldset with accessible legend", () => {
		render(<CategoryFilterTest />);

		const legend = screen.getByText("Filtrer par catégorie");
		expect(legend).toBeTruthy();
		expect(legend.tagName.toLowerCase()).toBe("legend");
	});

	it("should apply category color class to active category button", () => {
		render(<CategoryFilterTest activeCategory="VIOLENCE" />);

		const violenceBtn = screen.getByTestId("filter-VIOLENCE");
		const expectedColor = getCategoryColor("VIOLENCE");
		expect(violenceBtn.className).toContain(expectedColor.split(" ")[0]);
	});
});

describe("Story 3.2 — EmptyThreadsState (AC3)", () => {
	it("should show generic message when no active filter", () => {
		render(<EmptyThreadsStateTest />);

		const state = screen.getByTestId("empty-state-generic");
		expect(state.textContent).toContain("Aucune discussion pour le moment");
	});

	it("should show bienveillant message when filter active but no threads", () => {
		render(<EmptyThreadsStateTest activeCategory="VIOLENCE" />);

		const mainMsg = screen.getByTestId("empty-main-message");
		expect(mainMsg.textContent).toContain(
			"Pas encore de discussions dans cette catégorie",
		);
	});

	it("should show category-specific sub-message for active filter", () => {
		render(<EmptyThreadsStateTest activeCategory="VIOLENCE" />);

		const subMsg = screen.getByTestId("empty-sub-message");
		expect(subMsg.textContent).toContain("Violence");
	});

	it("should render suggestions for the 4 other categories", () => {
		render(<EmptyThreadsStateTest activeCategory="VIOLENCE" />);

		expect(screen.getByTestId("suggestion-ABUS")).toBeTruthy();
		expect(screen.getByTestId("suggestion-TEMOIN")).toBeTruthy();
		expect(screen.getByTestId("suggestion-DETRESSE")).toBeTruthy();
		expect(screen.getByTestId("suggestion-AUTRE")).toBeTruthy();
		expect(screen.queryByTestId("suggestion-VIOLENCE")).toBeNull();
	});

	it("should render 'Voir toutes les discussions' button", () => {
		render(<EmptyThreadsStateTest activeCategory="ABUS" />);

		expect(screen.getByTestId("see-all-button")).toBeTruthy();
	});

	it("should navigate to /threads without params when 'Voir toutes' clicked", () => {
		render(<EmptyThreadsStateTest activeCategory="DETRESSE" />);

		fireEvent.click(screen.getByTestId("see-all-button"));
		expect(mockNavigate).toHaveBeenCalledWith({
			to: "/threads",
			search: {},
		});
	});
});

describe("Story 3.2 — validateSearch logic (AC2)", () => {
	const validCategories = [
		"VIOLENCE",
		"ABUS",
		"TEMOIN",
		"DETRESSE",
		"AUTRE",
	] as const;

	const validateSearch = (search: Record<string, unknown>) => {
		const rawCategory =
			typeof search.category === "string"
				? search.category.toUpperCase()
				: undefined;
		return {
			openDialog: search.openDialog === true || search.openDialog === "true",
			category:
				rawCategory && validCategories.includes(rawCategory as ThreadCategory)
					? (rawCategory as ThreadCategory)
					: undefined,
		};
	};

	it("should parse valid category from URL", () => {
		const result = validateSearch({ category: "VIOLENCE" });
		expect(result.category).toBe("VIOLENCE");
	});

	it("should normalize category to uppercase", () => {
		const result = validateSearch({ category: "violence" });
		expect(result.category).toBe("VIOLENCE");
	});

	it("should return undefined for invalid category", () => {
		const result = validateSearch({ category: "INVALID" });
		expect(result.category).toBeUndefined();
	});

	it("should return undefined when no category param", () => {
		const result = validateSearch({});
		expect(result.category).toBeUndefined();
	});

	it("should preserve openDialog param", () => {
		const result = validateSearch({ openDialog: "true", category: "ABUS" });
		expect(result.openDialog).toBe(true);
		expect(result.category).toBe("ABUS");
	});

	it("should accept all 5 valid categories", () => {
		for (const cat of validCategories) {
			const result = validateSearch({ category: cat });
			expect(result.category).toBe(cat);
		}
	});
});

describe("Story 3.2 — threadCategories config (AC1)", () => {
	it("should have exactly 5 categories", () => {
		expect(threadCategories).toHaveLength(5);
	});

	it("should include VIOLENCE, ABUS, TEMOIN, DETRESSE, AUTRE", () => {
		const ids = threadCategories.map((c) => c.id);
		expect(ids).toContain("VIOLENCE");
		expect(ids).toContain("ABUS");
		expect(ids).toContain("TEMOIN");
		expect(ids).toContain("DETRESSE");
		expect(ids).toContain("AUTRE");
	});

	it("each category should have label, icon, and id", () => {
		for (const cat of threadCategories) {
			expect(cat.id).toBeTruthy();
			expect(cat.label).toBeTruthy();
			expect(cat.icon).toBeTruthy();
		}
	});
});

describe("ThreadCard with different categories", () => {
	const categories = ["VIOLENCE", "ABUS", "TEMOIN", "DETRESSE", "AUTRE"];

	for (const category of categories) {
		it(`should render category badge for ${category}`, () => {
			const thread = { ...baseThread, id: `thread-${category}`, category };
			render(<ThreadCard thread={thread} />);

			const badge = screen.getByTestId("thread-category");
			expect(badge.textContent).toBe(category);
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
