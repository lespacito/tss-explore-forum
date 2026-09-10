import { createContext, type ReactNode, useContext, useState } from "react";

const ReceiptContext = createContext<{
	secretCode: string;
	setSecretCode: (code: string) => void;
	submissionConfirmed: boolean;
	setSubmissionConfirmed: (confirmed: boolean) => void;
} | null>(null);
export function PublicationReceiptProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [secretCode, setSecretCode] = useState("");
	const [submissionConfirmed, setSubmissionConfirmed] = useState(false);
	return (
		<ReceiptContext.Provider
			value={{
				secretCode,
				setSecretCode,
				submissionConfirmed,
				setSubmissionConfirmed,
			}}
		>
			{children}
		</ReceiptContext.Provider>
	);
}
export function usePublicationReceipt() {
	const value = useContext(ReceiptContext);
	if (!value) throw new Error("PublicationReceiptProvider missing");
	return value;
}
