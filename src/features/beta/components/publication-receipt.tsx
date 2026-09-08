import { createContext, type ReactNode, useContext, useState } from "react";

const ReceiptContext = createContext<{
	secretCode: string;
	setSecretCode: (code: string) => void;
} | null>(null);
export function PublicationReceiptProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [secretCode, setSecretCode] = useState("");
	return (
		<ReceiptContext.Provider value={{ secretCode, setSecretCode }}>
			{children}
		</ReceiptContext.Provider>
	);
}
export function usePublicationReceipt() {
	const value = useContext(ReceiptContext);
	if (!value) throw new Error("PublicationReceiptProvider missing");
	return value;
}
