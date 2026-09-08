import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import {
	PublicationReceiptProvider,
	usePublicationReceipt,
} from "../components/publication-receipt";

function Harness() {
	const { secretCode, setSecretCode } = usePublicationReceipt();
	return (
		<>
			<button type="button" onClick={() => setSecretCode("TEST-CODE-ONLY")}>
				Record
			</button>
			<output>{secretCode}</output>
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
	expect(screen.getByRole("status").textContent).toBe("TEST-CODE-ONLY");
	expect(window.location.href).toBe(initialUrl);
	expect(JSON.stringify(localStorage)).toBe(initialStorage);
	mounted.unmount();
	render(
		<PublicationReceiptProvider>
			<Harness />
		</PublicationReceiptProvider>,
	);
	expect(screen.getByRole("status").textContent).toBe("");
});
