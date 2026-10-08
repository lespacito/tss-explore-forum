import { getRouteApi, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createAnonymousSessionFn } from "@/features/auth/server/create-anonymous-session";
import { useBetaPresentation } from "@/features/beta/components/beta-presentation";
import { cn } from "@/lib/utils";

type AnonymousPostButtonProps = {
	className?: string;
	label?: string;
};

export function AnonymousPostButton({
	className,
	label,
}: AnonymousPostButtonProps = {}) {
	const real = useBetaPresentation().publicationMode === "real";
	const displayLabel =
		label ?? (real ? "Rédiger un témoignage" : "Créer une situation fictive");
	const router = useRouter();
	const data = getRouteApi("__root__").useLoaderData();
	const paused = data?.beta?.submissionsOpen === false;
	const [isLoading, setIsLoading] = useState(false);

	const handleClick = async () => {
		setIsLoading(true);

		try {
			const result = await createAnonymousSessionFn();

			if (result.success) {
				// Actualiser la session avant le parcours guidé.
				await router.invalidate();
				await router.navigate({
					to: "/threads/new",
				});
			} else {
				toast.error(result.error || "Une erreur est survenue");
			}
		} catch {
			toast.error("Impossible de continuer. Veuillez réessayer.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Button
			onClick={handleClick}
			disabled={isLoading || paused}
			size="lg"
			className={cn("min-w-[200px]", className)}
			aria-busy={isLoading}
		>
			{isLoading ? "Chargement…" : paused ? "Dépôts suspendus" : displayLabel}
		</Button>
	);
}
