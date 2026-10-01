import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
	displayUsername: "Profil historique",
	username: "erable-calme",
};

describe("Scenario form real editor accessible name", () => {
	it("names the contenteditable from the visible question, not its placeholder", () => {
		render(<ScenarioForm user={user as never} aliasName="Érable calme" />);
		const editor = screen.getByRole("textbox", { name: "1. Que se passe-t-il dans cette situation fictive ?" });
		expect(editor).toHaveAttribute("contenteditable", "true");
		expect(editor).toHaveAttribute("aria-labelledby", screen.getByText("1. Que se passe-t-il dans cette situation fictive ?").id);
	});
});
