import { createServerOnlyFn } from "@tanstack/react-start";
import { sendEmail } from "@/features/auth/lib/email/send";
import { welcomeEmail } from "@/features/auth/lib/email/templates";
import { logger } from "@/lib/logger/server";

/**
 * Action serveur pour envoyer un email de bienvenue après inscription
 */
export const sendWelcomeEmail = createServerOnlyFn(
	async (data: { email: string; name: string }) => {
		try {
			const template = welcomeEmail(data.name);

			const result = await sendEmail({
				to: data.email,
				subject: template.subject,
				html: template.html,
				text: template.text,
			});

			if (!result.success) {
				logger.error("Échec de l'envoi de l'email de bienvenue", {
					error: result.error,
				});
				return {
					success: false,
					error: result.error || "Impossible d'envoyer l'email",
				};
			}

			return {
				success: true,
				messageId: result.messageId,
			};
		} catch (error) {
			logger.error("Erreur lors de l'envoi de l'email de bienvenue", { error });
			return {
				success: false,
				error: error instanceof Error ? error.message : "Erreur inconnue",
			};
		}
	},
);
