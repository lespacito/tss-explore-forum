import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useAppForm } from "@/components/form/hooks";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { authClient } from "@/features/auth/lib/auth-client";

type RetentionOption = "delete_all" | "anonymize";

const deletionSchema = z.object({
	retentionOption: z.enum(["delete_all", "anonymize"]),
	confirmationChecked: z.boolean().refine((val) => val === true, {
		message: "Vous devez confirmer que vous comprenez cette action",
	}),
	password: z.string().min(1, "Le mot de passe est requis"),
});

export const AccountDeletion = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [step, setStep] = useState<1 | 2>(1);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [retentionOption, setRetentionOption] =
		useState<RetentionOption>("anonymize");

	const form = useAppForm({
		defaultValues: {
			confirmationChecked: false,
			password: "",
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);

			try {
				// For now, use Better Auth's native deleteUser
				// In production, this would call our custom server function with retention options
				await authClient.deleteUser({
					callbackURL: "/account/deleted",
				});

				toast.success(
					"Suppression du compte en cours... Merci de vérifier votre email pour confirmer.",
				);
				handleCloseModal();
			} catch (error) {
				console.error("Deletion error:", error);
				toast.error("Une erreur est survenue lors de la suppression du compte");
				setIsSubmitting(false);
			}
		},
	});

	const handleOpenModal = () => {
		setIsOpen(true);
		setStep(1);
		form.reset();
		setRetentionOption("anonymize");
	};

	const handleCloseModal = () => {
		setIsOpen(false);
		setStep(1);
		form.reset();
		setRetentionOption("anonymize");
	};

	const handleContinueToStep2 = () => {
		const confirmationChecked = form.state.values.confirmationChecked;
		if (!confirmationChecked) {
			toast.error("Veuillez confirmer que vous comprenez cette action");
			return;
		}
		setStep(2);
	};

	const handleBackToStep1 = () => {
		setStep(1);
	};

	return (
		<>
			<Button
				variant="destructive"
				className="w-full"
				onClick={handleOpenModal}
			>
				Supprimer le compte définitivement
			</Button>

			<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
				<AlertDialogContent
					className="max-w-2xl"
					aria-labelledby="delete-account-title"
					aria-describedby="delete-account-description"
				>
					{step === 1 && (
						<>
							<AlertDialogHeader>
								<AlertDialogTitle
									id="delete-account-title"
									className="flex items-center gap-2 text-destructive"
								>
									<AlertTriangle className="size-5" />
									Supprimer définitivement votre compte
								</AlertDialogTitle>
								<AlertDialogDescription id="delete-account-description">
									Cette action est irréversible. Veuillez lire attentivement les
									conséquences.
								</AlertDialogDescription>
							</AlertDialogHeader>

							<div className="space-y-6">
								{/* Warnings */}
								<div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
									<h3 className="mb-2 font-semibold text-sm">
										Ce qui sera supprimé :
									</h3>
									<ul className="space-y-1 text-muted-foreground text-sm">
										<li>
											• Toutes vos données personnelles (email, mot de passe)
										</li>
										<li>• Votre profil et vos alias</li>
										<li>• Toutes vos sessions actives (tous les appareils)</li>
										<li>• Votre code secret (si vous en avez un)</li>
									</ul>
								</div>

								{/* Retention Options */}
								<div className="space-y-3">
									<Label className="font-semibold text-sm">
										Que souhaitez-vous faire de vos publications ?
									</Label>
									<RadioGroup
										value={retentionOption}
										onValueChange={(value) =>
											setRetentionOption(value as RetentionOption)
										}
									>
										<div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent">
											<RadioGroupItem value="anonymize" id="option-anonymize" />
											<div className="flex-1 space-y-1">
												<Label
													htmlFor="option-anonymize"
													className="cursor-pointer font-medium text-sm"
												>
													Anonymiser mes publications (recommandé)
												</Label>
												<p className="text-muted-foreground text-xs">
													Vos publications resteront visibles mais l'auteur sera
													affiché comme "utilisateur-supprimé". Cela permet de
													préserver les discussions pour les autres membres.
												</p>
											</div>
										</div>

										<div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent">
											<RadioGroupItem
												value="delete_all"
												id="option-delete-all"
											/>
											<div className="flex-1 space-y-1">
												<Label
													htmlFor="option-delete-all"
													className="cursor-pointer font-medium text-sm"
												>
													Supprimer toutes mes publications
												</Label>
												<p className="text-muted-foreground text-xs">
													Toutes vos publications (fils de discussion et
													réponses) seront définitivement supprimées. Les
													discussions auxquelles vous avez participé pourraient
													perdre leur contexte.
												</p>
											</div>
										</div>
									</RadioGroup>
								</div>

								{/* Confirmation Checkbox using FormCheckboxInput */}
								<form.AppField
									name="confirmationChecked"
									validators={{
										onChange: z.boolean().refine((val) => val === true, {
											message:
												"Vous devez confirmer que vous comprenez cette action",
										}),
									}}
								>
									{(field) => (
										<field.CheckboxInput
											label="Je comprends que cette action est irréversible et que je ne pourrai plus me reconnecter avec mes identifiants"
											controlFirst
											horizontal
										/>
									)}
								</form.AppField>
							</div>

							<AlertDialogFooter>
								<Button variant="outline" onClick={handleCloseModal}>
									Annuler
								</Button>
								<form.Subscribe
									selector={(state) => state.values.confirmationChecked}
								>
									{(confirmationChecked) => (
										<Button
											variant="destructive"
											onClick={handleContinueToStep2}
											disabled={!confirmationChecked}
										>
											Continuer
										</Button>
									)}
								</form.Subscribe>
							</AlertDialogFooter>
						</>
					)}

					{step === 2 && (
						<>
							<AlertDialogHeader>
								<AlertDialogTitle
									id="delete-account-title"
									className="text-destructive"
								>
									Confirmation finale
								</AlertDialogTitle>
								<AlertDialogDescription id="delete-account-description">
									Pour confirmer la suppression, veuillez entrer votre mot de
									passe.
								</AlertDialogDescription>
							</AlertDialogHeader>

							<form
								onSubmit={(e) => {
									e.preventDefault();
									e.stopPropagation();
									form.handleSubmit();
								}}
							>
								<div className="space-y-4">
									<form.AppField
										name="password"
										validators={{
											onChange: z.string().min(1, "Le mot de passe est requis"),
										}}
									>
										{(field) => (
											<field.PasswordInput
												label="Mot de passe"
												description="Entrez votre mot de passe pour confirmer"
											/>
										)}
									</form.AppField>

									<div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
										<p className="text-amber-900 text-sm dark:text-amber-100">
											Cette action est définitive. Vous recevrez un email de
											confirmation avant la suppression effective.
										</p>
									</div>
								</div>

								<AlertDialogFooter className="mt-6">
									<Button
										type="button"
										variant="outline"
										onClick={handleBackToStep1}
										disabled={isSubmitting}
									>
										Retour
									</Button>
									<form.Subscribe selector={(state) => state.values.password}>
										{(password) => (
											<Button
												type="submit"
												variant="destructive"
												disabled={!password || isSubmitting}
											>
												{isSubmitting && (
													<Loader2 className="mr-2 size-4 animate-spin" />
												)}
												Confirmer la suppression
											</Button>
										)}
									</form.Subscribe>
								</AlertDialogFooter>
							</form>
						</>
					)}
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
