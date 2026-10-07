import { createContext, type ReactNode, useContext } from "react";

// Presentation only: server authorization remains in the existing beta gate.
export type BetaPresentation = {
	accessRequired: boolean;
	submissionsOpen: boolean;
};
const BetaPresentationContext = createContext<BetaPresentation>({
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
