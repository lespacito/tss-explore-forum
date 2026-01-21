import { sendEmail } from "@/features/auth/lib/email";
import { deleteAccountTemplate } from "@/features/auth/lib/email/templates";
import { logger } from "@/lib/logger/server";

/**
 * Envoie un email de vérification pour la suppression du compte
 */
export async function sendDeleteAccountVerificationEmail({
	user,
	url,
}: {
	user: { id: string; email: string; name: string };
	url: string;
}) {
	try {
		const template = deleteAccountTemplate(user.name, url);

		logger.info("Envoi de l'email de vérification de suppression de compte", {
			userId: user.id,
			email: user.email,
		});

		const result = await sendEmail({
			to: user.email,
			subject: template.subject,
			html: template.html,
			text: template.text,
		});

		if (!result.success) {
			logger.error(
				"Échec de l'envoi de l'email de vérification de suppression de compte",
				{
					userId: user.id,
					email: user.email,
					error: result.error,
				},
			);
			throw new Error(
				result.error ||
					"Impossible d'envoyer l'email de vérification de suppression de compte",
			);
		}

		logger.info(
			"Email de vérification de suppression de compte envoyé avec succès",
			{
				userId: user.id,
				email: user.email,
				messageId: result.messageId,
			},
		);

		return {
			success: true,
			messageId: result.messageId,
		};
	} catch (error) {
		logger.error(
			"Erreur lors de l'envoi de l'email de vérification de suppression de compte",
			{
				userId: user.id,
				email: user.email,
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			},
		);
		throw error;
	}
}
