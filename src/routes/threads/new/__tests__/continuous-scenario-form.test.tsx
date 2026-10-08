import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

const mocks = vi.hoisted(() => ({
	createThread: vi.fn(),
	invalidate: vi.fn(),
	navigate: vi.fn(),
	setSecretCode: vi.fn(),
	setSubmissionConfirmed: vi.fn(),
}));

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual("@tanstack/react-router");
	return {
		...actual,
		createFileRoute: () => (options: unknown) => ({ options }),
		useNavigate: () => mocks.navigate,
		useRouter: () => ({ invalidate: mocks.invalidate }),
	};
});

vi.mock("@/components/tiptap/TiptapEditor", () => ({
	TipTap: ({
		id,
		placeholder,
		onChange,
		onTextChange,
	}: {
		id: string;
		placeholder: string;
		onChange: (value: string) => void;
		onTextChange: (text: string, length: number) => void;
	}) => (
		<textarea
			id={id}
			aria-label={placeholder}
			onChange={(event) => {
				onChange(`<p>${event.target.value}</p>`);
				onTextChange(event.target.value, event.target.value.length);
			}}
		/>
	),
}));

vi.mock("@/features/auth/components/AnonymousPostButton", () => ({
	AnonymousPostButton: () => <button type="button">Créer un scénario</button>,
}));

vi.mock("@/features/alias/server/actions/get-primary-alias", () => ({
	getCurrentPrimaryAliasFn: vi.fn(),
}));

vi.mock("@/features/beta/components/safety-notice", () => ({
	SafetyNotice: () => <aside>Informations de sécurité</aside>,
}));

vi.mock("@/features/beta/components/publication-receipt", () => ({
	usePublicationReceipt: () => ({
		setSecretCode: mocks.setSecretCode,
		setSubmissionConfirmed: mocks.setSubmissionConfirmed,
	}),
}));

vi.mock("@/features/threads/server/actions/create-thread", () => ({
	createThreadFn: mocks.createThread,
}));

vi.mock("@/features/auth/server/get-auth-session", () => ({
	getAuthSession: vi.fn(),
}));

vi.mock("@/hooks/useAutoSaveDraft", () => ({
	useAutoSaveDraft: () => ({
		restoredDraft: null,
		hasDraft: false,
		clearDraft: vi.fn(),
	}),
}));

vi.mock("@/lib/security/validate-html-content", () => ({
	validateHtmlContent: () => ({ isValid: true }),
}));

import { BetaPresentationProvider } from "@/features/beta/components/beta-presentation";
import { ScenarioForm } from "../index";

const user = {
	id: "user-1",
	displayUsername: "Profil historique",
	username: "erable-calme",
};

describe("continuous scenario form", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.invalidate.mockResolvedValue(undefined);
		mocks.navigate.mockResolvedValue(undefined);
		mocks.createThread.mockResolvedValue({
			success: true,
			thread: { id: "thread-1" },
		});
	});

	it("puts the narrative before the title and keeps category optional", () => {
		render(<ScenarioForm user={user as never} aliasName="Érable calme" />);

		const body = screen.getByLabelText(/que se passe-t-il/i);
		const title = screen.getByLabelText(/titre court/i);
		expect(screen.queryByText("Profil historique")).not.toBeInTheDocument();
		expect(body.compareDocumentPosition(title)).toBe(
			Node.DOCUMENT_POSITION_FOLLOWING,
		);
		expect(screen.getByLabelText(/catégorie/i)).toHaveValue("");
		expect(screen.queryByText("Érable calme")).not.toBeInTheDocument();
		expect(
			screen.getByText(/apparaîtra sous « Auteur anonyme »/),
		).toBeInTheDocument();
		expect(screen.queryByText(/sous le pseudonyme/i)).not.toBeInTheDocument();
		expect(
			screen.queryByText(/sera publié anonymement/i),
		).not.toBeInTheDocument();
		expect(
			screen.getByText(/administration technique peut relier/i),
		).toBeInTheDocument();
		expect(
			screen.getByText(/ne constitue pas une aide professionnelle/i),
		).toBeInTheDocument();
		expect(
			screen.getByText(/si cette situation fictive est publiée/i),
		).toBeInTheDocument();
		expect(
			screen.getByText(/besoin d’aide pour commencer/i),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /envoyer pour examen/i }),
		).toBeInTheDocument();
	});

	it("blocks submission when the internal alias cannot be verified", () => {
		render(<ScenarioForm user={user as never} aliasName={null} />);
		expect(
			screen.getByText(/session n’a pas pu être vérifiée/i),
		).toBeInTheDocument();
		expect(screen.queryByText("Érable calme")).not.toBeInTheDocument();

		expect(
			screen.getByRole("button", { name: /envoyer pour examen/i }),
		).toBeDisabled();
	});

	it("keeps the title required and rejects an empty title after a valid narrative", async () => {
		render(<ScenarioForm user={user as never} aliasName="Érable calme" />);
		expect(screen.getByLabelText(/titre court/i)).toBeRequired();
		fireEvent.change(screen.getByLabelText(/que se passe-t-il/i), {
			target: { value: "Une situation entièrement fictive" },
		});
		fireEvent.click(
			screen.getByRole("button", { name: /envoyer pour examen/i }),
		);
		expect(
			await screen.findByText("Donnez un titre d’au moins 3 caractères."),
		).toBeInTheDocument();
		expect(mocks.createThread).not.toHaveBeenCalled();
	});

	it("reveals the on-device draft choice only after writing starts", () => {
		render(<ScenarioForm user={user as never} aliasName="Érable calme" />);
		expect(
			screen.queryByLabelText(/conserver un brouillon/i),
		).not.toBeInTheDocument();

		fireEvent.change(screen.getByLabelText(/que se passe-t-il/i), {
			target: { value: "Un scénario entièrement fictif" },
		});

		expect(screen.getByLabelText(/conserver un brouillon/i)).not.toBeChecked();
	});

	it("shows a focused summary when both required fields are missing", async () => {
		render(<ScenarioForm user={user as never} aliasName="Érable calme" />);
		fireEvent.click(
			screen.getByRole("button", { name: /envoyer pour examen/i }),
		);

		const summary = (await screen.findByText("Deux éléments sont à corriger."))
			.parentElement;
		expect(summary).not.toBeNull();
		if (!summary) return;
		expect(summary).toHaveTextContent("Deux éléments sont à corriger");
		expect(summary).toHaveFocus();
	});

	it("submits an unclassified scenario without mapping it to Autre", async () => {
		render(<ScenarioForm user={user as never} aliasName="Érable calme" />);
		fireEvent.change(screen.getByLabelText(/que se passe-t-il/i), {
			target: { value: "Un scénario entièrement fictif" },
		});
		fireEvent.change(screen.getByLabelText(/titre court/i), {
			target: { value: "Scénario test" },
		});
		fireEvent.click(
			screen.getByRole("button", { name: /envoyer pour examen/i }),
		);

		await waitFor(() =>
			expect(mocks.createThread).toHaveBeenCalledWith({
				data: {
					body: "<p>Un scénario entièrement fictif</p>",
					title: "Scénario test",
					category: null,
				},
			}),
		);
	});
});

describe("test-mode form wording", () => {
	it.each([
		[true, /Cette bêta teste le parcours, pas une situation réelle/i],
		[false, /Cette version de démonstration permet uniquement de tester le parcours/i],
	] as const)("shows the appropriate copy when accessRequired=%s", (accessRequired, expected) => {
		render(
			<BetaPresentationProvider value={{ publicationMode: "test", accessRequired, submissionsOpen: true }}>
				<ScenarioForm user={user as never} aliasName="Érable calme" />
			</BetaPresentationProvider>,
		);
		expect(screen.getByText(expected)).toBeInTheDocument();
	});
});

describe("real testimony presentation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.invalidate.mockResolvedValue(undefined);
		mocks.navigate.mockResolvedValue(undefined);
		mocks.createThread.mockResolvedValue({
			success: true,
			thread: { id: "thread-1" },
		});
	});
	it.each([true, false])(
		"keeps moderated anonymous submission with accessRequired=%s",
		async (accessRequired) => {
			render(
				<BetaPresentationProvider
					value={{
						accessRequired,
						submissionsOpen: true,
						publicationMode: "real",
					}}
				>
					<ScenarioForm user={user as never} aliasName="Érable calme" />
				</BetaPresentationProvider>,
			);
			expect(
				screen.getByRole("heading", { name: "Rédiger un témoignage" }),
			).toBeInTheDocument();
			expect(
				screen.queryByText(/cette bêta teste le parcours/i),
			).not.toBeInTheDocument();
			expect(
				screen.getByText(/publication sous votre nom n’est pas proposée/i),
			).toBeInTheDocument();
			expect(
				screen.getByText(/Chaque témoignage est examiné/i),
			).toBeInTheDocument();
			expect(
				screen.getByText(/ne garantit pas un anonymat absolu/i),
			).toBeInTheDocument();
			fireEvent.change(screen.getByLabelText(/que souhaitez-vous partager/i), {
				target: { value: "Un récit fictif utilisé uniquement pour ce test" },
			});
			expect(
				screen.getByLabelText(/conserver un brouillon/i),
			).not.toBeChecked();
			fireEvent.change(screen.getByLabelText(/titre court/i), {
				target: { value: "Témoignage de test fictif" },
			});
			fireEvent.click(
				screen.getByRole("button", { name: /envoyer pour examen/i }),
			);
			await waitFor(() =>
				expect(mocks.createThread).toHaveBeenCalledWith({
					data: {
						body: "<p>Un récit fictif utilisé uniquement pour ce test</p>",
						title: "Témoignage de test fictif",
						category: null,
					},
				}),
			);
			expect(mocks.setSubmissionConfirmed).toHaveBeenCalledWith(true);
			expect(mocks.navigate).toHaveBeenCalledWith({
				to: "/threads/confirmation",
			});
		},
	);
});

it.each([true, false])(
	"keeps a real-mode narrative visible while submission is suspended with accessRequired=%s",
	(accessRequired) => {
		mocks.createThread.mockClear();
		render(
			<BetaPresentationProvider
				value={{
					accessRequired,
					submissionsOpen: false,
					publicationMode: "real",
				}}
			>
				<ScenarioForm user={user as never} aliasName="Érable calme" />
			</BetaPresentationProvider>,
		);
		expect(
			screen.getByRole("heading", {
				name: "Contributions temporairement suspendues",
			}),
		).toBeInTheDocument();
		expect(
			screen.queryByText(/Vous pouvez raconter une situation/i),
		).not.toBeInTheDocument();
		const body = screen.getByLabelText(/que souhaitez-vous partager/i);
		fireEvent.change(body, {
			target: {
				value: "Un récit inventé pour vérifier la conservation du texte",
			},
		});
		expect(body).toHaveValue(
			"Un récit inventé pour vérifier la conservation du texte",
		);
		const send = screen.getByRole("button", { name: /envoyer pour examen/i });
		expect(send).toBeDisabled();
		fireEvent.click(send);
		expect(mocks.createThread).not.toHaveBeenCalled();
		expect(body).toHaveValue(
			"Un récit inventé pour vérifier la conservation du texte",
		);
	},
);

it.each(["VIOLENCE", "ABUS", "TEMOIN", "DETRESSE", "AUTRE"])(
	"uses real presentation for category %s without changing its payload",
	async (category) => {
		mocks.createThread.mockClear();
		mocks.createThread.mockResolvedValue({
			success: true,
			thread: { id: "thread-1" },
		});
		const { container } = render(
			<BetaPresentationProvider
				value={{
					accessRequired: false,
					submissionsOpen: true,
					publicationMode: "real",
				}}
			>
				<ScenarioForm user={user as never} aliasName="Érable calme" />
			</BetaPresentationProvider>,
		);
		fireEvent.change(screen.getByLabelText(/catégorie/i), {
			target: { value: category },
		});
		expect(screen.getByLabelText(/catégorie/i)).toHaveValue(category);
		expect(container.textContent).not.toMatch(/ficti|inventée|tester le/i);
		fireEvent.change(screen.getByLabelText(/que souhaitez-vous partager/i), {
			target: { value: "Un récit inventé uniquement pour cette vérification" },
		});
		fireEvent.change(screen.getByLabelText(/titre court/i), {
			target: { value: "Récit de vérification" },
		});
		fireEvent.click(
			screen.getByRole("button", { name: /envoyer pour examen/i }),
		);
		await waitFor(() =>
			expect(mocks.createThread).toHaveBeenCalledWith({
				data: {
					body: "<p>Un récit inventé uniquement pour cette vérification</p>",
					title: "Récit de vérification",
					category,
				},
			}),
		);
	},
);

it.each([
	[
		"Votre situation fictive n’a pas été envoyée. Réessayez pour obtenir un code de récupération valide.",
		"Votre témoignage n’a pas été envoyé. Réessayez pour obtenir un code de récupération valide.",
	],
	[
		"L’envoi de situations fictives est suspendu. Consultez les informations de l’organisateur.",
		"Votre témoignage n’a pas été envoyé. L’envoi de témoignages est suspendu. Consultez les informations de l’organisateur.",
	],
	[
		"Une erreur précise à conserver",
		"Votre témoignage n’a pas été envoyé. Une erreur précise à conserver",
	],
])(
	"preserves recovery guidance and exact other errors in real mode: %s",
	async (error, expected) => {
		mocks.createThread.mockResolvedValueOnce({ success: false, error });
		render(
			<BetaPresentationProvider
				value={{
					accessRequired: false,
					submissionsOpen: true,
					publicationMode: "real",
				}}
			>
				<ScenarioForm user={user as never} aliasName="Érable calme" />
			</BetaPresentationProvider>,
		);
		fireEvent.change(screen.getByLabelText(/que souhaitez-vous partager/i), {
			target: { value: "Un récit inventé pour vérifier une erreur" },
		});
		fireEvent.change(screen.getByLabelText(/titre court/i), {
			target: { value: "Récit de vérification" },
		});
		fireEvent.click(
			screen.getByRole("button", { name: /envoyer pour examen/i }),
		);
		const message = await screen.findByText(
			`${expected} Votre texte est toujours dans ce formulaire.`,
		);
		expect(message).toBeInTheDocument();
		expect(message.textContent).not.toMatch(/ficti/);
		expect(
			message.textContent?.match(/Votre témoignage n’a pas été envoyé/g),
		).toHaveLength(1);
	},
);
