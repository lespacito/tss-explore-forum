import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentType } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { submitFeedback } from "@/features/feedback/server/submit-feedback";
import { Route } from "./index";

vi.mock("@tanstack/react-router", () => ({
	createFileRoute: () => (options: { component: ComponentType }) => ({ options }),
}));
vi.mock("@/features/feedback/server/submit-feedback", () => ({
	submitFeedback: vi.fn().mockResolvedValue({ success: true }),
}));

vi.stubGlobal("ResizeObserver", class {
	observe() {}
	unobserve() {}
	disconnect() {}
});

const Page = Route.options.component as ComponentType;
afterEach(() => {
	cleanup();
	vi.clearAllMocks();
});

describe("Feedback required ratings", () => {
	it("explains the missing anonymity rating instead of silently rejecting submission", async () => {
		const user = userEvent.setup();
		render(<Page />);
		const groups = screen.getAllByRole("radiogroup");
		await user.click(within(groups[0]).getByRole("radio", { name: "5" }));
		await user.click(within(groups[1]).getByRole("radio", { name: "5" }));
		await user.click(screen.getByRole("button", { name: "Envoyer mon retour" }));
		expect(await screen.findByText("Veuillez répondre à cette question.")).toBeVisible();
		expect(submitFeedback).not.toHaveBeenCalled();
		expect(groups[2]).toHaveAttribute("aria-invalid", "true");
		expect(within(groups[2]).getByRole("radio", { name: "1" })).toHaveFocus();
		await user.click(within(groups[2]).getByRole("radio", { name: "4" }));
		await user.click(screen.getByRole("button", { name: "Envoyer mon retour" }));
		await waitFor(() => expect(submitFeedback).toHaveBeenCalledTimes(1));
		expect(submitFeedback).toHaveBeenCalledWith({
			data: expect.objectContaining({ overallRating: 5, easeOfUse: 5, trustAnonymity: 4 }),
		});
		expect(await screen.findByText("Merci pour votre retour.")).toBeVisible();
	});

	it("does not show errors before submission and identifies all unanswered ratings on submit", async () => {
		const user = userEvent.setup();
		render(<Page />);
		expect(screen.queryAllByText("Veuillez répondre à cette question.")).toHaveLength(0);
		const groups = screen.getAllByRole("radiogroup");
		await user.click(within(groups[0]).getByRole("radio", { name: "5" }));
		expect(screen.queryAllByText("Veuillez répondre à cette question.")).toHaveLength(0);
		await user.click(screen.getByRole("button", { name: "Envoyer mon retour" }));
		expect(await screen.findAllByText("Veuillez répondre à cette question.")).toHaveLength(2);
		expect(submitFeedback).not.toHaveBeenCalled();
		for (const group of groups.slice(1)) {
			expect(group).toHaveAttribute("aria-required", "true");
			const error = document.getElementById(group.getAttribute("aria-describedby") ?? "");
			expect(error).toHaveTextContent("Veuillez répondre à cette question.");
		}
	});
});
