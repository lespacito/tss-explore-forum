import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseThreadCategory } from "@/data/threads-categories";
import { CategoryFilter } from "../category-filter";
import { EmptyThreadsState } from "../empty-threads-state";

const navigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
	useRouter: () => ({ navigate }),
}));

describe("parseThreadCategory", () => {
	it("accepts every pilot category and normalizes casing", () => {
		expect(parseThreadCategory("violence")).toBe("VIOLENCE");
		expect(parseThreadCategory("ABUS")).toBe("ABUS");
		expect(parseThreadCategory("temoin")).toBe("TEMOIN");
		expect(parseThreadCategory("detresse")).toBe("DETRESSE");
		expect(parseThreadCategory("autre")).toBe("AUTRE");
	});

	it("rejects unknown and non-string values", () => {
		expect(parseThreadCategory("unknown")).toBeUndefined();
		expect(parseThreadCategory(null)).toBeUndefined();
	});
});

describe("CategoryFilter", () => {
	beforeEach(() => navigate.mockClear());

	it("renders all categories and the unfiltered option", () => {
		render(<CategoryFilter />);

		for (const label of [
			"Toutes",
			"Violence",
			"Abus",
			"Témoin",
			"Détresse",
			"Autre situation",
		]) {
			expect(
				screen.getByRole("button", { name: new RegExp(label, "i") }),
			).toBeTruthy();
		}
	});

	it("marks the current category as selected", () => {
		render(<CategoryFilter activeCategory="ABUS" />);

		expect(
			screen
				.getByRole("button", { name: /abus/i })
				.getAttribute("aria-pressed"),
		).toBe("true");
		expect(
			screen
				.getByRole("button", { name: "Toutes" })
				.getAttribute("aria-pressed"),
		).toBe("false");
	});

	it("updates the URL search when a category is selected", () => {
		render(<CategoryFilter />);
		fireEvent.click(screen.getByRole("button", { name: /violence/i }));

		expect(navigate).toHaveBeenCalledWith({
			to: "/threads",
			search: { category: "VIOLENCE" },
		});
	});

	it("clears the category when Toutes is selected", () => {
		render(<CategoryFilter activeCategory="VIOLENCE" />);
		fireEvent.click(screen.getByRole("button", { name: "Toutes" }));

		expect(navigate).toHaveBeenCalledWith({ to: "/threads", search: {} });
	});
});

describe("EmptyThreadsState", () => {
	beforeEach(() => navigate.mockClear());

	it("shows a category-aware empty state and alternative filters", () => {
		render(<EmptyThreadsState activeCategory="VIOLENCE" />);

		expect(screen.getByText(/pas encore de discussions/i)).toBeTruthy();
		expect(screen.getByText(/« Violence »/)).toBeTruthy();
		expect(screen.queryByRole("button", { name: /violence/i })).toBeNull();
		expect(screen.getByRole("button", { name: /abus/i })).toBeTruthy();
	});

	it("can return to the complete thread list", () => {
		render(<EmptyThreadsState activeCategory="DETRESSE" />);
		fireEvent.click(
			screen.getByRole("button", { name: /voir toutes les discussions/i }),
		);

		expect(navigate).toHaveBeenCalledWith({ to: "/threads", search: {} });
	});
});
