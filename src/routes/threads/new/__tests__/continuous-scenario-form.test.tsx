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

import { ScenarioForm } from "../index";

const user = {
	id: "user-1",
	displayUsername: "Érable calme",
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
		expect(body.compareDocumentPosition(title)).toBe(
			Node.DOCUMENT_POSITION_FOLLOWING,
		);
		expect(screen.getByLabelText(/catégorie/i)).toHaveValue("");
		expect(screen.getByText("Érable calme")).toBeInTheDocument();
		expect(
			screen.getByText(/besoin d’aide pour commencer/i),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /envoyer pour examen/i }),
		).toBeInTheDocument();
	});

	it("blocks submission when the published alias cannot be verified", () => {
		render(<ScenarioForm user={user as never} aliasName={null} />);

		expect(screen.getByRole("alert")).toHaveTextContent(
			"Votre alias n’a pas pu être chargé",
		);
		expect(
			screen.getByRole("button", { name: /envoyer pour examen/i }),
		).toBeDisabled();
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
