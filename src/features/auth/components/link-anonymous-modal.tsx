import { AlertCircle, Link2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { signOut } from "@/features/auth/lib/auth-client";
import { linkAnonymousAccountFn } from "@/features/auth/server/link-anonymous-account";
import { logger } from "@/lib/logger/client-logger";

/**
 * Modal pour proposer la liaison d'un compte anonyme
 *
 * Story 1.4 - CRITICAL-4 Fix: AC2 - Liaison optionnelle des publications anonymes
 *
 * Fonctionnalités:
 * - Détecte si l'utilisateur a des publications anonymes
 * - Propose de lier les publications au nouveau compte
 * - Appelle linkAnonymousAccountFn pour migrer les posts
 * - Permet de refuser la liaison (garder publications séparées)
 *
 * UX:
 * - Modal claire et rassurante
 * - Explique les avantages de la liaison
 * - Option de refus sans jugement
 * - Feedback immédiat sur le résultat
 *
 * @see {@link linkAnonymousAccountFn} Pour la migration des posts
 */

interface LinkAnonymousModalProps {
	/** Si le modal est ouvert */
	isOpen: boolean;
	/** Fonction pour fermer le modal */
	onClose: () => void;
	/** ID de l'utilisateur anonyme à lier */
	anonymousUserId: string;
	/** ID du nouveau compte enregistré (après signup) */
	newUserId: string | null;
	/** Callback après liaison réussie */
	onLinkSuccess?: (linkedPostsCount: number) => void;
	/** Callback si refus de liaison */
	onLinkDecline?: () => void;
}

export function LinkAnonymousModal({
	isOpen,
	onClose,
	anonymousUserId,
	newUserId,
	onLinkSuccess,
	onLinkDecline,
}: LinkAnonymousModalProps) {
	const [isLinking, setIsLinking] = useState(false);

	const handleLinkAccount = async () => {
		setIsLinking(true);

		// Vérifier que newUserId est disponible
		if (!newUserId) {
			logger.error("Cannot link account: newUserId is missing", {
				anonymousUserId,
			});
			toast.error("Erreur: impossible de lier le compte (ID manquant)");
			setIsLinking(false);
			return;
		}

		try {
			const result = await linkAnonymousAccountFn({
				data: { anonymousUserId, newUserId },
			});

			if (result.success) {
				logger.info("Anonymous account linked successfully", {
					anonymousUserId,
					postsCount: result.linkedPostsCount,
				});

				toast.success(
					`${result.linkedPostsCount} publication${result.linkedPostsCount > 1 ? "s" : ""} liée${result.linkedPostsCount > 1 ? "s" : ""} à votre compte !`,
				);

				// CRITICAL FIX: Déconnecter la session anonyme pour éviter confusion
				// L'utilisateur sera reconnecté avec le nouveau compte après vérification email
				logger.info("Signing out anonymous session after successful link", {
					anonymousUserId,
					newUserId,
				});

				await signOut({
					fetchOptions: {
						onSuccess: () => {
							logger.info("Anonymous session signed out successfully");
						},
					},
				});

				onLinkSuccess?.(result.linkedPostsCount || 0);
				onClose();
			} else {
				logger.error("Failed to link anonymous account", {
					anonymousUserId,
					error: result.error,
				});

				toast.error(
					result.error || "Erreur lors de la liaison du compte anonyme",
				);
			}
		} catch (error) {
			logger.error("Exception during account linking", {
				anonymousUserId,
				error: error instanceof Error ? error.message : String(error),
			});

			toast.error("Une erreur est survenue lors de la liaison");
		} finally {
			setIsLinking(false);
		}
	};

	const handleDecline = () => {
		logger.info("User declined anonymous account linking", {
			anonymousUserId,
		});

		toast.info(
			"Vos publications anonymes restent séparées. Vous pouvez toujours y accéder avec votre code secret.",
		);

		onLinkDecline?.();
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Link2 className="h-5 w-5" />
						Lier vos publications anonymes
					</DialogTitle>
					<DialogDescription className="text-left pt-2">
						Nous avons détecté que vous avez des publications créées de manière
						anonyme.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							Vous pouvez choisir de lier ces publications à votre nouveau
							compte pour les retrouver facilement, ou les garder séparées et
							continuer à y accéder avec votre code secret.
						</AlertDescription>
					</Alert>

					<div className="space-y-3 text-sm">
						<div>
							<h4 className="font-medium mb-1">
								✅ Si vous liez vos publications :
							</h4>
							<ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
								<li>
									Elles apparaîtront dans votre profil avec vos autres contenus
								</li>
								<li>Vous pourrez les gérer depuis votre compte enregistré</li>
								<li>
									Votre code secret reste fonctionnel pour la récupération
								</li>
							</ul>
						</div>

						<div>
							<h4 className="font-medium mb-1">
								ℹ️ Si vous ne liez pas maintenant :
							</h4>
							<ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
								<li>
									Vos publications anonymes restent accessibles via votre code
									secret
								</li>
								<li>
									Elles ne seront pas visibles dans votre profil enregistré
								</li>
								<li>Vous ne pourrez pas les lier ultérieurement</li>
							</ul>
						</div>
					</div>
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						type="button"
						variant="outline"
						onClick={handleDecline}
						disabled={isLinking}
						className="gap-2"
					>
						<X className="h-4 w-4" />
						Non, garder séparé
					</Button>
					<Button
						type="button"
						onClick={handleLinkAccount}
						disabled={isLinking}
						className="gap-2"
					>
						<Link2 className="h-4 w-4" />
						{isLinking ? "Liaison en cours..." : "Oui, lier mes publications"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
