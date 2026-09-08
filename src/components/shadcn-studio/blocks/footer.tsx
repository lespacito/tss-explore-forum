import { Link } from "@tanstack/react-router";
export default function Footer() {
	return (
		<footer className="border-t px-4 py-8">
			<div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm sm:flex-row sm:justify-between">
				<p className="text-muted-foreground">
					Parlons Violence · Bêta privée pour adultes
				</p>
				<nav
					aria-label="Informations"
					className="flex flex-wrap gap-x-6 gap-y-2"
				>
					<Link
						className="inline-flex min-h-11 items-center underline underline-offset-4"
						to="/rules"
					>
						Règles
					</Link>
					<Link
						className="inline-flex min-h-11 items-center underline underline-offset-4"
						to="/privacy"
					>
						Confidentialité
					</Link>
					<Link
						className="inline-flex min-h-11 items-center underline underline-offset-4"
						to="/help"
					>
						Aide et contact
					</Link>
				</nav>
			</div>
		</footer>
	);
}
