import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { eraseBetaAccount } from "@/features/beta/server/erase-account";
import { EraseAccountForm } from "../erase-account-form";

vi.mock("@/features/beta/server/erase-account", () => ({
	eraseBetaAccount: vi.fn(),
}));

describe("EraseAccountForm", () => {
	const eraseAccount = vi.mocked(eraseBetaAccount);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("explains active-database deletion and backup retention", () => {
		render(<EraseAccountForm anonymous />);

		expect(
			screen.getByText(/supprime.+de la base active/i),
		).toBeInTheDocument();
		expect(screen.getByText(/sept jours supplémentaires/i)).toBeInTheDocument();
	});

	it("requires the exact confirmation before enabling deletion", async () => {
		const user = userEvent.setup();
		render(<EraseAccountForm anonymous />);
		const submit = screen.getByRole("button", {
			name: /effacer définitivement/i,
		});
		const confirmation = screen.getByLabelText(/saisissez effacer/i);

		expect(submit).toBeDisabled();
		await user.type(confirmation, "effacer");
		expect(confirmation).toHaveValue("EFFACER");
		expect(submit).toBeEnabled();
	});

	it("preserves the confirmation and offers recovery after a server error", async () => {
		const user = userEvent.setup();
		eraseAccount.mockRejectedValueOnce(
			new Error("Reconnectez-vous puis réessayez."),
		);
		render(<EraseAccountForm anonymous />);
		const confirmation = screen.getByLabelText(/saisissez effacer/i);
		await user.type(confirmation, "EFFACER");
		await user.click(
			screen.getByRole("button", { name: /effacer définitivement/i }),
		);

		await waitFor(() => {
			expect(screen.getByRole("alert")).toHaveTextContent(
				"Reconnectez-vous puis réessayez.",
			);
		});
		expect(confirmation).toHaveValue("EFFACER");
		expect(confirmation).toHaveAttribute("aria-invalid", "true");
		expect(
			screen.getByRole("button", { name: /effacer définitivement/i }),
		).toBeEnabled();
	});
});
