import { AlertCircle, Link2, X } from "lucide-react";
import { useId, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSession } from "@/features/auth/lib/auth-client";
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
	newUserId?: string | null;
	email?: string;
	existingAccount?: boolean;
	/** Callback après liaison réussie */
	onLinkSuccess?: (linkedPostsCount: number) => void;
	/** Callback si refus de liaison */
	onLinkDecline?: () => void;
}

export function LinkAnonymousModal({
	isOpen,
	onClose,
	anonymousUserId,
	email = "",
	existingAccount = false,
	onLinkSuccess,
	onLinkDecline,
}: LinkAnonymousModalProps) {
	const [isLinking, setIsLinking] = useState(false);
	const [password, setPassword] = useState("");
	const passwordId = useId();
	const emailId = useId();
	const [manualDestinationEmail, setDestinationEmail] = useState("");
	const destinationEmail = existingAccount ? manualDestinationEmail : email;

	const handleLinkAccount = async () => {
		setIsLinking(true);

		try {
			if (existingAccount) {
				// UX stale-tab guard only: the server still authorizes its own session.
				const current = await getSession({
					query: { disableCookieCache: true },
				});
				if (
					current.error ||
					current.data?.user.id !== anonymousUserId ||
					!current.data.user.isAnonymous
				) {
					toast.error(
						"Votre session a changé ou n’a pas pu être vérifiée. Rétablissez votre session anonyme avant de réessayer.",
					);
					return;
				}
			}
			const result = await linkAnonymousAccountFn({
				data: { email: destinationEmail, password },
			});

			if (result.success) {
				logger.info("Anonymous account linked successfully", {
					anonymousUserId,
					postsCount: result.linkedPostsCount,
				});

				toast.success(
					`${result.linkedPostsCount} publication${result.linkedPostsCount > 1 ? "s" : ""} liée${result.linkedPostsCount > 1 ? "s" : ""} à votre compte !`,
				);

				// Never sign out the ambient cookie here: another tab may already
				// have replaced it. Transfer success does not imply destination login.
				toast.info(
					"Publications liées. Connectez-vous explicitement au compte vérifié pour les retrouver.",
				);

				onLinkSuccess?.(result.linkedPostsCount);
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
			setPassword("");
			setIsLinking(false);
		}
	};

	const handleDecline = () => {
		setPassword("");
		logger.info("User declined anonymous account linking", {
			anonymousUserId,
		});

		toast.info(
			"Vos publications anonymes restent séparées. Vous pouvez toujours y accéder avec votre code de récupération.",
		);

		onLinkDecline?.();
		onClose();
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open && !isLinking) handleDecline();
			}}
		>
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
							Une liaison nécessite un compte dont l'email est vérifié. Vérifiez
							d'abord votre email : aucun transfert n'est effectué vers un
							compte non vérifié. Vos publications restent anonymes et
							accessibles avec votre code de récupération.
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
									Votre code anonyme ne permet plus de récupérer les
									publications liées. Utilisez la connexion ou la récupération
									par email du compte enregistré.
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
								<li>
									Avant toute nouvelle tentative, rétablissez votre session
									anonyme avec votre code de récupération ; le compte de
									destination doit d'abord être vérifié.
								</li>
							</ul>
						</div>
					</div>
				</div>

				{existingAccount && (
					<div className="space-y-2">
						<Label htmlFor={emailId}>Email du compte vérifié</Label>
						<Input
							id={emailId}
							type="email"
							autoComplete="username"
							value={destinationEmail}
							onChange={(event) => setDestinationEmail(event.target.value)}
							disabled={isLinking}
							maxLength={254}
						/>
					</div>
				)}
				<div className="space-y-2">
					<Label htmlFor={passwordId}>
						{existingAccount
							? "Mot de passe du compte vérifié"
							: "Mot de passe du nouveau compte"}
					</Label>
					<Input
						id={passwordId}
						type="password"
						autoComplete="current-password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						disabled={isLinking}
						maxLength={128}
					/>
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
						disabled={isLinking || !password || !destinationEmail}
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
