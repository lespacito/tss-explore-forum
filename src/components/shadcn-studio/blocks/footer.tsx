import { Separator } from "@/components/ui/separator";

export default function Footer() {
	return (
		<footer className="py-12 bg-background">
			<div className="container mx-auto px-4">
				<Separator className="mb-8" />
				<div className="flex flex-col md:flex-row justify-between items-center gap-6">
					<div className="text-sm text-muted-foreground">
						&copy; {new Date().getFullYear()} TSS Explore Forum. Tous droits
						réservés.
					</div>
					<nav className="flex gap-6 text-sm font-medium">
						{/* biome-ignore lint/a11y/useValidAnchor: Placeholder link retained until the legal page is implemented. */}
						<a href="#" className="hover:underline">
							Mentions légales
						</a>
						{/* biome-ignore lint/a11y/useValidAnchor: Placeholder link retained until the privacy page is implemented. */}
						<a href="#" className="hover:underline">
							Confidentialité
						</a>
						{/* biome-ignore lint/a11y/useValidAnchor: Placeholder link retained until the contact page is implemented. */}
						<a href="#" className="hover:underline">
							Contact
						</a>
						{/* biome-ignore lint/a11y/useValidAnchor: Placeholder link retained until the resources page is implemented. */}
						<a href="#" className="hover:underline">
							Ressources d'aide
						</a>
					</nav>
				</div>
			</div>
		</footer>
	);
}
