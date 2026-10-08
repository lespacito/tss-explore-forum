import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { Route } from "../index";

const flags = vi.hoisted(() => ({
	publicationMode: "test" as "test" | "real",
	accessRequired: true,
	submissionsOpen: false,
}));
vi.mock("@/features/beta/components/beta-presentation", () => ({
	useBetaPresentation: () => flags,
}));

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
					title: "Situation fictive à examiner",
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
	moderationReasonCodes: ["OUT_OF_SCOPE"],
	moderationReasonLabels: {
		OUT_OF_SCOPE:
			"Cette situation fictive ne correspond pas au périmètre de cette bêta.",
	},
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
		flags.accessRequired = true;
		flags.publicationMode = "test";
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
			screen.getByText(
				"Cette situation fictive deviendra visible par les invités.",
			),
		).toBeDefined();

		fireEvent.click(
			screen.getByRole("button", { name: "Confirmer l’approbation" }),
		);

		await waitFor(() =>
			expect(mocks.moderateThread).toHaveBeenCalledWith({
				data: {
					threadId: "46cc031d-7a75-4cf0-88c6-6aac14dd80f7",
					action: "publish",
					reasonCode: undefined,
					details: undefined,
				},
			}),
		);
		expect(screen.getByText("Situation fictive publiée")).toBeDefined();
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
					reasonCode: undefined,
					details: undefined,
				},
			}),
		);
		expect(
			screen.getByRole("button", { name: "Voir dans À examiner" }),
		).toBeDefined();
	});

	it("requires a predefined reason before confirming non-publication", async () => {
		render(<ModerationPage />);
		fireEvent.click(screen.getByRole("button", { name: "Rejeter" }));

		const confirm = screen.getByRole("button", {
			name: "Confirmer le rejet",
		});
		expect(confirm).toBeDisabled();

		fireEvent.change(screen.getByLabelText("Motif de non-publication"), {
			target: { value: "OUT_OF_SCOPE" },
		});
		expect(confirm).toBeEnabled();
		fireEvent.click(confirm);

		await waitFor(() =>
			expect(mocks.moderateThread).toHaveBeenCalledWith({
				data: {
					threadId: "46cc031d-7a75-4cf0-88c6-6aac14dd80f7",
					action: "reject",
					reasonCode: "OUT_OF_SCOPE",
					details: "",
				},
			}),
		);
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
		expect(screen.getByText("Situation fictive publiée")).toBeDefined();
	});
});

it("warns moderators that publishing makes the scenario public when access is public", async () => {
	flags.accessRequired = false;
	mocks.moderateThread.mockResolvedValue({ status: "published" });
	render(<ModerationPage />);
	fireEvent.click(screen.getByRole("button", { name: "Approuver" }));
	expect(
		screen.getByText(
			"Cette situation fictive deviendra accessible publiquement en lecture.",
		),
	).toBeDefined();
	fireEvent.click(
		screen.getByRole("button", { name: "Confirmer l’approbation" }),
	);
	await waitFor(() =>
		expect(
			screen.getByText(/est maintenant accessible publiquement en lecture/),
		).toBeDefined(),
	);
	expect(screen.queryByText(/visible par les invités/)).toBeNull();
});

it.each([true, false])(
	"real mode keeps explicit moderation with accessRequired=%s",
	async (accessRequired) => {
		flags.publicationMode = "real";
		flags.accessRequired = accessRequired;
		mocks.moderateThread.mockClear();
		render(<ModerationPage />);
		expect(
			screen.getByText(/Les motifs de non-publication restent ceux du test/),
		).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Approuver" }));
		expect(mocks.moderateThread).not.toHaveBeenCalled();
		expect(
			screen.getByText(
				accessRequired
					? "Ce témoignage deviendra visible par les invités."
					: "Ce témoignage deviendra accessible publiquement en lecture.",
			),
		).toBeInTheDocument();
		fireEvent.click(
			screen.getByRole("button", { name: "Confirmer l’approbation" }),
		);
		await waitFor(() =>
			expect(mocks.moderateThread).toHaveBeenCalledWith({
				data: {
					threadId: "46cc031d-7a75-4cf0-88c6-6aac14dd80f7",
					action: "publish",
					reasonCode: undefined,
					details: undefined,
				},
			}),
		);
		expect(await screen.findByText("Témoignage publié")).toBeInTheDocument();
	},
);
