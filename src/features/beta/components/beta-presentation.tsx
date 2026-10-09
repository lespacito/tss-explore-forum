import { createContext, type ReactNode, useContext } from "react";

// Presentation only: server authorization remains in the existing beta gate.
export type BetaPresentation = {
	publicationMode?: "test" | "real";
	preprodShowcase?: boolean;
	accessRequired: boolean;
	submissionsOpen: boolean;
};
const BetaPresentationContext = createContext<BetaPresentation>({
	publicationMode: "test",
	accessRequired: true,
	submissionsOpen: false,
});
export function BetaPresentationProvider({
	value,
	children,
}: {
	value: BetaPresentation;
	children: ReactNode;
}) {
	return (
		<BetaPresentationContext.Provider value={value}>
			{children}
		</BetaPresentationContext.Provider>
	);
}
export function useBetaPresentation() {
	return useContext(BetaPresentationContext);
}
