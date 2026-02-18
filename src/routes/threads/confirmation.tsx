import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SecretCodeDisplay } from "@/features/auth/components/SecretCodeDisplay";

/**
 * Thread Confirmation Page
 *
 * Displays secret code to anonymous users after their first thread publication.
 *
 * AC2: Display and instructions for secret code
 * - Shows SecretCodeDisplay component with code
 * - Provides clear next steps
 * - Accessible confirmation flow
 *
 * Query params:
 * - secretCode: The generated secret code to display
 * - threadSlug: Slug of the created thread (for navigation)
 */

export const Route = createFileRoute("/threads/confirmation")({
	head: () => ({
		meta: [
			{ title: "Votre code secret — Parlons Violence" },
			{ name: "robots", content: "noindex, nofollow" },
		],
	}),
	component: ThreadConfirmationPage,
	validateSearch: (search: Record<string, unknown>) => {
		return {
			secretCode: (search.secretCode as string) || "",
			threadSlug: (search.threadSlug as string) || "",
			isFirstPublication: (search.isFirstPublication as boolean) || false,
		};
	},
});

function ThreadConfirmationPage() {
	const navigate = useNavigate();
	const { secretCode, threadSlug, isFirstPublication } = useSearch({
		from: "/threads/confirmation",
	});

	const handleContinue = () => {
		// Story 2.4: Thread is pending moderation, not publicly visible yet
		// Navigate to threads list instead of thread detail
		navigate({ to: "/threads" });
	};

	// If no secret code provided, redirect to threads
	if (!secretCode || !isFirstPublication) {
		navigate({ to: "/threads" });
		return null;
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			{/* Success Banner */}
			<div className="mb-8 text-center">
				<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
					<CheckCircle2 className="h-8 w-8 text-primary" />
				</div>
				<h1 className="text-3xl font-bold mb-2">
					Publication envoyée pour modération !
				</h1>
				<p className="text-lg text-muted-foreground">
					Votre message sera visible après validation par notre équipe.
				</p>
			</div>

			{/* Secret Code Display */}
			<div className="mb-8">
				<SecretCodeDisplay secretCode={secretCode} isExisting={false} />
			</div>

			{/* Moderation Information Banner (Story 2.4) */}
			<div className="mb-8 p-4 bg-warning/30 rounded-lg border-2 border-warning">
				<div className="flex gap-3">
					<Clock className="h-5 w-5 text-foreground mt-0.5 flex-shrink-0" />
					<div>
						<h3 className="font-semibold text-foreground mb-1">
							Votre publication est en cours de modération
						</h3>
						<p className="text-sm text-foreground/90 mb-2">
							Notre équipe examinera votre message dans les prochaines 24-48
							heures. Vous serez notifié une fois qu'il sera publié.
						</p>
						<p className="text-sm text-foreground/80">
							Cette étape garantit un espace sûr et bienveillant pour tous les
							membres de la communauté.
						</p>
					</div>
				</div>
			</div>

			{/* Confirmation Actions */}
			<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
				<Button onClick={handleContinue} size="lg" className="w-full sm:w-auto">
					J'ai sauvegardé mon code
				</Button>

				<Button
					variant="outline"
					onClick={() => navigate({ to: "/threads" })}
					size="lg"
					className="w-full sm:w-auto"
				>
					Retourner à l'accueil
				</Button>
			</div>

			{/* Additional Help Text */}
			<div className="mt-8 text-center text-sm text-muted-foreground">
				<p>
					Vous pouvez copier ce code maintenant ou revenir sur cette page plus
					tard depuis votre compte.
				</p>
			</div>
		</div>
	);
}
