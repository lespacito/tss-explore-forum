import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import {
	PublicationReceiptProvider,
	usePublicationReceipt,
} from "../components/publication-receipt";

function Harness() {
	const {
		secretCode,
		setSecretCode,
		submissionConfirmed,
		setSubmissionConfirmed,
	} = usePublicationReceipt();
	return (
		<>
			<button type="button" onClick={() => setSecretCode("TEST-CODE-ONLY")}>
				Record
			</button>
			<button type="button" onClick={() => setSubmissionConfirmed(true)}>
				Confirm
			</button>
			<output>{secretCode}</output>
			<span data-testid="submission-confirmed">
				{String(submissionConfirmed)}
			</span>
		</>
	);
}
it("keeps the receipt ephemeral and out of URL and browser storage", () => {
	const initialUrl = window.location.href;
	const initialStorage = JSON.stringify(localStorage);
	const mounted = render(
		<PublicationReceiptProvider>
			<Harness />
		</PublicationReceiptProvider>,
	);
	fireEvent.click(screen.getByText("Record"));
	fireEvent.click(screen.getByText("Confirm"));
	expect(screen.getByRole("status").textContent).toBe("TEST-CODE-ONLY");
	expect(screen.getByTestId("submission-confirmed").textContent).toBe("true");
	expect(window.location.href).toBe(initialUrl);
	expect(JSON.stringify(localStorage)).toBe(initialStorage);
	mounted.unmount();
	render(
		<PublicationReceiptProvider>
			<Harness />
		</PublicationReceiptProvider>,
	);
	expect(screen.getByRole("status").textContent).toBe("");
	expect(screen.getByTestId("submission-confirmed").textContent).toBe("false");
});
