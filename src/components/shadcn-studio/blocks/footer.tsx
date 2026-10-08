import { useRouterState } from "@tanstack/react-router";
import { useBetaPresentation } from "@/features/beta/components/beta-presentation";
export default function Footer() {
	const { accessRequired, publicationMode } = useBetaPresentation();
	const isLanding = useRouterState().location.pathname === "/";
	return (
		<footer className={isLanding ? "landing-footer" : "border-t px-4 py-8"}>
			<div className="mx-auto max-w-6xl text-sm">
				<p className="text-muted-foreground">
					Parlons Violence ·{" "}
					{publicationMode === "real"
						? "Témoignages et entraide pour adultes"
						: accessRequired
							? "Bêta privée pour adultes"
							: "Situations fictives pour adultes"}
				</p>
			</div>
		</footer>
	);
}
