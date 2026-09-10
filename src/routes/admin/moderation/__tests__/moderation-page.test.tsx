import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Route } from "../index";

const mocks = vi.hoisted(() => ({
	invalidate: vi.fn(),
	moderateThread: vi.fn(),
	toastError: vi.fn(),
	toastSuccess: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
	createFileRoute: () => (options: unknown) => ({
		options,
		useLoaderData: () => ({
			threads: [
				{
					id: "46cc031d-7a75-4cf0-88c6-6aac14dd80f7",
					title: "Scénario fictif à examiner",
					body: "<p>Contenu fictif</p>",
					category: "AUTRE",
					status: "pending",
					isSensitive: false,
					rejectionReason: null,
					createdAt: "2026-09-10T10:00:00.000Z",
					moderatedAt: null,
					aliasName: "Érable calme",
				},
			],
			moderator: {
				name: "Modérateur",
				displayUsername: "Modérateur de test",
				role: "MODERATOR",
			},
		}),
	}),
	redirect: vi.fn(),
	useRouter: () => ({ invalidate: mocks.invalidate }),
}));

vi.mock("@/components/tiptap/SafeHtmlDisplay", () => ({
	SafeHtmlDisplay: ({ html }: { html: string }) => <div>{html}</div>,
}));

vi.mock("@/features/auth/server/get-auth-session", () => ({
	getAuthSession: vi.fn(),
}));

vi.mock("@/features/moderation/server/thread-moderation", () => ({
	getModerationQueueFn: vi.fn(),
	moderateThreadFn: mocks.moderateThread,
}));

vi.mock("sonner", () => ({
	toast: {
		error: mocks.toastError,
		success: mocks.toastSuccess,
	},
}));

const ModerationPage = Route.options.component;
if (!ModerationPage) throw new Error("Moderation route component missing");

describe("Moderation decisions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.moderateThread.mockResolvedValue({
			id: "46cc031d-7a75-4cf0-88c6-6aac14dd80f7",
			status: "published",
			isSensitive: false,
		});
	});

	it("requires an explicit inline confirmation before approval", async () => {
		render(<ModerationPage />);

		fireEvent.click(screen.getByRole("button", { name: "Approuver" }));

		expect(mocks.moderateThread).not.toHaveBeenCalled();
		expect(
			screen.getByText("Cette publication deviendra visible par les invités."),
		).toBeDefined();

		fireEvent.click(
			screen.getByRole("button", { name: "Confirmer l’approbation" }),
		);

		await waitFor(() =>
			expect(mocks.moderateThread).toHaveBeenCalledWith({
				data: {
					threadId: "46cc031d-7a75-4cf0-88c6-6aac14dd80f7",
					action: "publish",
					reason: undefined,
				},
			}),
		);
		expect(screen.getByText("Publication approuvée")).toBeDefined();
		expect(
			screen.getByRole("button", { name: "Voir dans Publiées" }),
		).toBeDefined();
	});

	it("keeps the confirmation available after a server failure", async () => {
		mocks.moderateThread.mockRejectedValueOnce(
			new Error("Le serveur ne répond pas"),
		);
		render(<ModerationPage />);

		fireEvent.click(screen.getByRole("button", { name: "Approuver" }));
		fireEvent.click(
			screen.getByRole("button", { name: "Confirmer l’approbation" }),
		);

		await waitFor(() =>
			expect(mocks.toastError).toHaveBeenCalledWith("Le serveur ne répond pas"),
		);
		expect(
			screen.getByRole("button", { name: "Confirmer l’approbation" }),
		).toBeDefined();
	});

	it("confirms sensitive marking and keeps the moderator in the current queue", async () => {
		render(<ModerationPage />);

		fireEvent.click(screen.getByRole("button", { name: "Marquer sensible" }));

		expect(mocks.moderateThread).not.toHaveBeenCalled();
		expect(
			screen.getByText(
				"Son extrait sera masqué jusqu’à ce que la personne choisisse de l’afficher.",
			),
		).toBeDefined();

		fireEvent.click(
			screen.getByRole("button", { name: "Confirmer le marquage" }),
		);

		await waitFor(() =>
			expect(mocks.moderateThread).toHaveBeenCalledWith({
				data: {
					threadId: "46cc031d-7a75-4cf0-88c6-6aac14dd80f7",
					action: "mark_sensitive",
					reason: undefined,
				},
			}),
		);
		expect(
			screen.getByRole("button", { name: "Voir dans À examiner" }),
		).toBeDefined();
	});

	it("distinguishes a saved decision from a refresh failure", async () => {
		mocks.invalidate.mockRejectedValueOnce(new Error("Refresh failed"));
		render(<ModerationPage />);

		fireEvent.click(screen.getByRole("button", { name: "Approuver" }));
		fireEvent.click(
			screen.getByRole("button", { name: "Confirmer l’approbation" }),
		);

		await waitFor(() =>
			expect(mocks.toastError).toHaveBeenCalledWith(
				"Décision enregistrée, mais la file n’a pas pu être actualisée. Rechargez la page.",
			),
		);
		expect(screen.getByText("Publication approuvée")).toBeDefined();
	});
});
