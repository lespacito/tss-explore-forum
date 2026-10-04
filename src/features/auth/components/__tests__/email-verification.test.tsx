import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
vi.mock("@/features/auth/lib/auth-client", () => ({
	authClient: {
		getSession: vi.fn(),
		signOut: vi.fn(),
		revokeSession: vi.fn(),
		sendVerificationEmail: vi.fn(),
	},
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

import { toast } from "sonner";
import { authClient } from "@/features/auth/lib/auth-client";
import { EmailVerification } from "../email-verification";

const anonymous = {
	user: {
		id: "source",
		isAnonymous: true,
		email: "anonymous@synthetic.invalid",
	},
	session: { id: "source-session", token: "synthetic-source-token" },
};
afterEach(() => expect(authClient.signOut).not.toHaveBeenCalled());
beforeEach(() => {
	vi.resetAllMocks();
	vi.mocked(authClient.getSession).mockResolvedValue({
		data: null,
		error: null,
	});
	vi.mocked(authClient.revokeSession).mockResolvedValue({
		data: { status: true },
		error: null,
	});
	vi.mocked(authClient.sendVerificationEmail).mockResolvedValue({
		data: { status: true },
		error: null,
	});
});
async function requestResend() {
	render(<EmailVerification email="" />);
	const user = userEvent.setup();
	expect(screen.getByRole("button")).toBeDisabled();
	await user.type(screen.getByLabelText(/^email$/i), "supplied@example.com");
	await user.click(
		screen.getByRole("button", { name: /renvoyer l'email de vérification/i }),
	);
	return user;
}
it("preserves the anonymous session until informed recovery-code consent, then revokes only its token before resend", async () => {
	vi.mocked(authClient.getSession)
		.mockResolvedValueOnce({ data: anonymous, error: null } as never)
		.mockResolvedValueOnce({ data: anonymous, error: null } as never)
		.mockResolvedValue({ data: null, error: null });
	const user = await requestResend();
	await screen.findByText(/enregistrer votre code de récupération/i);
	expect(authClient.revokeSession).not.toHaveBeenCalled();
	expect(authClient.sendVerificationEmail).not.toHaveBeenCalled();
	const confirm = screen.getByRole("button", {
		name: /déconnecter.*renvoyer/i,
	});
	expect(confirm).toBeDisabled();
	await user.click(
		screen.getByRole("checkbox", { name: /code de récupération/i }),
	);
	await user.click(confirm);
	await waitFor(() =>
		expect(authClient.sendVerificationEmail).toHaveBeenCalledWith({
			email: "supplied@example.com",
			callbackURL: "/",
		}),
	);
	expect(authClient.revokeSession).toHaveBeenCalledTimes(1);
	expect(authClient.revokeSession).toHaveBeenCalledWith({
		token: anonymous.session.token,
	});
	expect(authClient.signOut).not.toHaveBeenCalled();
	expect(authClient.getSession).toHaveBeenCalledWith({
		query: { disableCookieCache: true },
	});
	expect(
		vi.mocked(authClient.revokeSession).mock.invocationCallOrder[0],
	).toBeLessThan(
		vi.mocked(authClient.sendVerificationEmail).mock.invocationCallOrder[0],
	);
});
it("prevents cancellation from falsely promising source preservation once confirmed revocation is in flight", async () => {
	vi.mocked(authClient.getSession)
		.mockResolvedValueOnce({ data: anonymous, error: null } as never)
		.mockResolvedValueOnce({ data: anonymous, error: null } as never)
		.mockResolvedValue({ data: null, error: null });
	let finishRevocation!: (value: {
		data: { status: boolean };
		error: null;
	}) => void;
	vi.mocked(authClient.revokeSession).mockImplementationOnce(
		() =>
			new Promise((resolve) => {
				finishRevocation = resolve;
			}),
	);
	const user = await requestResend();
	await user.click(await screen.findByRole("checkbox"));
	await user.click(
		screen.getByRole("button", { name: /déconnecter.*renvoyer/i }),
	);
	await waitFor(() =>
		expect(authClient.revokeSession).toHaveBeenCalledTimes(1),
	);
	expect(
		screen.getByRole("button", { name: /annuler et garder/i }),
	).toBeDisabled();
	expect(screen.getByRole("checkbox")).toBeDisabled();
	finishRevocation({ data: { status: true }, error: null });
	await waitFor(() =>
		expect(authClient.sendVerificationEmail).toHaveBeenCalledTimes(1),
	);
});
it("does not offer to keep an anonymous session after successful revocation even when mail resend fails", async () => {
	vi.mocked(authClient.getSession)
		.mockResolvedValueOnce({ data: anonymous, error: null } as never)
		.mockResolvedValueOnce({ data: anonymous, error: null } as never)
		.mockResolvedValue({ data: null, error: null });
	vi.mocked(authClient.sendVerificationEmail).mockResolvedValue({
		data: null,
		error: { message: "mail unavailable" },
	} as never);
	const user = await requestResend();
	await user.click(await screen.findByRole("checkbox"));
	await user.click(
		screen.getByRole("button", { name: /déconnecter.*renvoyer/i }),
	);
	await waitFor(() =>
		expect(toast.error).toHaveBeenCalledWith("mail unavailable"),
	);
	expect(
		screen.queryByRole("button", { name: /annuler et garder/i }),
	).not.toBeInTheDocument();
	expect(
		screen.getByRole("button", { name: /renvoyer l'email de vérification/i }),
	).toBeEnabled();
	expect(toast.success).not.toHaveBeenCalled();
});
it("cancellation keeps source access and does not resend", async () => {
	vi.mocked(authClient.getSession).mockResolvedValue({
		data: anonymous,
		error: null,
	} as never);
	const user = await requestResend();
	await user.click(
		await screen.findByRole("button", { name: /annuler et garder/i }),
	);
	expect(authClient.revokeSession).not.toHaveBeenCalled();
	expect(authClient.sendVerificationEmail).not.toHaveBeenCalled();
	expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
	expect(screen.getByRole("button")).toBeEnabled();
});
it.each(["returned", "thrown"])(
	"session %s error fails closed before resend",
	async (kind) => {
		if (kind === "returned")
			vi.mocked(authClient.getSession).mockResolvedValue({
				data: null,
				error: { message: "session unavailable" },
			} as never);
		else
			vi.mocked(authClient.getSession).mockRejectedValue(
				new Error("session unavailable"),
			);
		await requestResend();
		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith("session unavailable"),
		);
		expect(authClient.revokeSession).not.toHaveBeenCalled();
		expect(authClient.sendVerificationEmail).not.toHaveBeenCalled();
		expect(toast.success).not.toHaveBeenCalled();
	},
);
it.each(["returned", "thrown"])(
	"revocation %s error fails closed after consent",
	async (kind) => {
		vi.mocked(authClient.getSession).mockResolvedValue({
			data: anonymous,
			error: null,
		} as never);
		if (kind === "returned")
			vi.mocked(authClient.revokeSession).mockResolvedValue({
				data: null,
				error: { message: "signout unavailable" },
			} as never);
		else
			vi.mocked(authClient.revokeSession).mockRejectedValue(
				new Error("signout unavailable"),
			);
		const user = await requestResend();
		await user.click(await screen.findByRole("checkbox"));
		await user.click(
			screen.getByRole("button", { name: /déconnecter.*renvoyer/i }),
		);
		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith("signout unavailable"),
		);
		expect(authClient.sendVerificationEmail).not.toHaveBeenCalled();
		expect(toast.success).not.toHaveBeenCalled();
	},
);
it.each([
	null,
	{
		user: {
			id: "registered",
			isAnonymous: false,
			email: "supplied@example.com",
		},
		session: { id: "registered-session", token: "synthetic-registered-token" },
	},
	{ ...anonymous, user: { ...anonymous.user, email: "supplied@example.com" } },
])(
	"resends without signout for absent or matching sessions: %j",
	async (session) => {
		vi.mocked(authClient.getSession).mockResolvedValue({
			data: session,
			error: null,
		} as never);
		await requestResend();
		await waitFor(() =>
			expect(authClient.sendVerificationEmail).toHaveBeenCalledWith({
				email: "supplied@example.com",
				callbackURL: "/",
			}),
		);
		expect(authClient.revokeSession).not.toHaveBeenCalled();
		expect(authClient.getSession).toHaveBeenCalledTimes(1);
	},
);
it("leaves a wrong registered session intact and surfaces native EMAIL_MISMATCH", async () => {
	vi.mocked(authClient.getSession).mockResolvedValue({
		data: {
			user: {
				id: "registered",
				isAnonymous: false,
				email: "other@example.com",
			},
			session: {
				id: "registered-session",
				token: "synthetic-registered-token",
			},
		},
		error: null,
	} as never);
	vi.mocked(authClient.sendVerificationEmail).mockResolvedValue({
		data: null,
		error: { message: "Email mismatch", code: "EMAIL_MISMATCH" },
	} as never);
	await requestResend();
	await waitFor(() =>
		expect(toast.error).toHaveBeenCalledWith("Email mismatch"),
	);
	expect(authClient.revokeSession).not.toHaveBeenCalled();
	expect(toast.success).not.toHaveBeenCalled();
	expect(screen.getByRole("button")).toBeEnabled();
});
it("rechecks the session on confirmation and fails closed if that lookup fails", async () => {
	vi.mocked(authClient.getSession)
		.mockResolvedValueOnce({ data: anonymous, error: null } as never)
		.mockResolvedValueOnce({
			data: null,
			error: { message: "recheck unavailable" },
		} as never);
	const user = await requestResend();
	await user.click(await screen.findByRole("checkbox"));
	await user.click(
		screen.getByRole("button", { name: /déconnecter.*renvoyer/i }),
	);
	await waitFor(() =>
		expect(toast.error).toHaveBeenCalledWith("recheck unavailable"),
	);
	expect(authClient.revokeSession).not.toHaveBeenCalled();
	expect(authClient.sendVerificationEmail).not.toHaveBeenCalled();
});
it("never signs out a registered session that replaces the source before confirmation", async () => {
	vi.mocked(authClient.getSession)
		.mockResolvedValueOnce({ data: anonymous, error: null } as never)
		.mockResolvedValueOnce({
			data: {
				user: {
					id: "registered",
					isAnonymous: false,
					email: "other@example.com",
				},
				session: {
					id: "registered-session",
					token: "synthetic-registered-token",
				},
			},
			error: null,
		} as never);
	vi.mocked(authClient.sendVerificationEmail).mockResolvedValue({
		data: null,
		error: { message: "Email mismatch" },
	} as never);
	const user = await requestResend();
	await user.click(await screen.findByRole("checkbox"));
	await user.click(
		screen.getByRole("button", { name: /déconnecter.*renvoyer/i }),
	);
	await waitFor(() =>
		expect(toast.error).toHaveBeenCalledWith(
			expect.stringMatching(/session a changé/i),
		),
	);
	expect(authClient.revokeSession).not.toHaveBeenCalled();
	expect(authClient.sendVerificationEmail).not.toHaveBeenCalled();
	expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
});

it.each([
	{ ...anonymous, user: { ...anonymous.user, id: "source-b" } },
	{ ...anonymous, session: { ...anonymous.session, id: "recreated" } },
	{
		...anonymous,
		session: { ...anonymous.session, token: "synthetic-new-token" },
	},
])(
	"invalidates old consent and requires fresh recovery acknowledgment for replacement %j",
	async (replacement) => {
		vi.mocked(authClient.getSession)
			.mockResolvedValueOnce({ data: anonymous, error: null } as never)
			.mockResolvedValueOnce({ data: replacement, error: null } as never);
		const user = await requestResend();
		await user.click(await screen.findByRole("checkbox"));
		await user.click(
			screen.getByRole("button", { name: /déconnecter.*renvoyer/i }),
		);
		await waitFor(() => expect(screen.getByRole("checkbox")).not.toBeChecked());
		expect(
			screen.getByRole("button", { name: /déconnecter.*renvoyer/i }),
		).toBeDisabled();
		expect(authClient.revokeSession).not.toHaveBeenCalled();
		expect(authClient.signOut).not.toHaveBeenCalled();
		expect(authClient.sendVerificationEmail).not.toHaveBeenCalled();
	},
);

it.each(["recheck", "revoke", "post-revoke"] as const)(
	"invalidates consent after a returned %s error",
	async (phase) => {
		const lookup = vi.mocked(authClient.getSession);
		lookup.mockResolvedValueOnce({ data: anonymous, error: null } as never);
		if (phase === "recheck")
			lookup.mockResolvedValueOnce({
				data: null,
				error: { message: "failed" },
			} as never);
		else {
			lookup.mockResolvedValueOnce({ data: anonymous, error: null } as never);
			if (phase === "revoke")
				vi.mocked(authClient.revokeSession).mockResolvedValueOnce({
					data: null,
					error: { message: "failed" },
				} as never);
			else
				lookup.mockResolvedValueOnce({
					data: null,
					error: { message: "failed" },
				} as never);
		}
		const user = await requestResend();
		await user.click(await screen.findByRole("checkbox"));
		await user.click(
			screen.getByRole("button", { name: /déconnecter.*renvoyer/i }),
		);
		await waitFor(() => expect(toast.error).toHaveBeenCalledWith("failed"));
		expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
		expect(authClient.signOut).not.toHaveBeenCalled();
		expect(authClient.sendVerificationEmail).not.toHaveBeenCalled();
	},
);
it.each(["recheck", "revoke", "post-revoke"] as const)(
	"invalidates consent after a thrown %s error",
	async (phase) => {
		const lookup = vi.mocked(authClient.getSession);
		lookup.mockResolvedValueOnce({ data: anonymous, error: null } as never);
		if (phase === "recheck") lookup.mockRejectedValueOnce(new Error("failed"));
		else {
			lookup.mockResolvedValueOnce({ data: anonymous, error: null } as never);
			if (phase === "revoke")
				vi.mocked(authClient.revokeSession).mockRejectedValueOnce(
					new Error("failed"),
				);
			else lookup.mockRejectedValueOnce(new Error("failed"));
		}
		const user = await requestResend();
		await user.click(await screen.findByRole("checkbox"));
		await user.click(
			screen.getByRole("button", { name: /déconnecter.*renvoyer/i }),
		);
		await waitFor(() => expect(toast.error).toHaveBeenCalledWith("failed"));
		expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
		expect(authClient.signOut).not.toHaveBeenCalled();
		expect(authClient.sendVerificationEmail).not.toHaveBeenCalled();
	},
);

it.each([
	{ ...anonymous, user: { ...anonymous.user, id: "" } },
	{ ...anonymous, session: { ...anonymous.session, id: "" } },
	{ ...anonymous, session: { ...anonymous.session, token: "" } },
])(
	"fails closed when anonymous source identity is incomplete: %j",
	async (incomplete) => {
		vi.mocked(authClient.getSession).mockResolvedValue({
			data: incomplete,
			error: null,
		} as never);
		await requestResend();
		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith(
				expect.stringMatching(/impossible de vérifier/i),
			),
		);
		expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
		expect(authClient.revokeSession).not.toHaveBeenCalled();
		expect(authClient.signOut).not.toHaveBeenCalled();
		expect(authClient.sendVerificationEmail).not.toHaveBeenCalled();
	},
);

it.each([null, { status: false }])(
	"fails closed for an unconfirmed revocation result: %j",
	async (data) => {
		vi.mocked(authClient.getSession)
			.mockResolvedValueOnce({ data: anonymous, error: null } as never)
			.mockResolvedValueOnce({ data: anonymous, error: null } as never);
		vi.mocked(authClient.revokeSession).mockResolvedValueOnce({
			data,
			error: null,
		} as never);
		const user = await requestResend();
		await user.click(await screen.findByRole("checkbox"));
		await user.click(
			screen.getByRole("button", { name: /déconnecter.*renvoyer/i }),
		);
		await waitFor(() =>
			expect(toast.error).toHaveBeenCalledWith(
				expect.stringMatching(/impossible de confirmer/i),
			),
		);
		expect(authClient.sendVerificationEmail).not.toHaveBeenCalled();
		expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
	},
);
