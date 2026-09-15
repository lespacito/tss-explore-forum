import { useRouterState } from "@tanstack/react-router";
export default function Footer() {
	const isLanding = useRouterState().location.pathname === "/";
	return (
		<footer className={isLanding ? "landing-footer" : "civic-footer"}>
			<div className="mx-auto max-w-6xl text-sm">
				<p className="text-muted-foreground">
					Parlons Violence · Bêta privée pour adultes
				</p>
			</div>
		</footer>
	);
}
