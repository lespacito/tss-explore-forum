import { logger } from "@/lib/logger/server";
import { emailConfig, getResendClient } from "./transport";

export interface SendEmailOptions {
	to: string | string[];
	subject: string;
	html: string;
	text: string;
	from?: string;
	replyTo?: string;
}

export interface SendEmailResult {
	success: boolean;
	messageId?: string;
	error?: string;
}

/**
 * Envoie un email via Resend
 */
export const sendEmail = async (
	options: SendEmailOptions,
): Promise<SendEmailResult> => {
	try {
		const resend = getResendClient();

		const { data, error } = await resend.emails.send({
			from: options.from || emailConfig.from,
			to: Array.isArray(options.to) ? options.to : [options.to],
			subject: options.subject,
			html: options.html,
			text: options.text,
			replyTo: options.replyTo || emailConfig.replyTo,
		});

		if (error) {
			logger.error("Failed to send email via Resend", {
				recipientCount: Array.isArray(options.to) ? options.to.length : 1,
				subject: options.subject,
				error: error.message,
			});

			return {
				success: false,
				error: error.message,
			};
		}

		logger.info("Email sent successfully via Resend", {
			messageId: data?.id,
			recipientCount: Array.isArray(options.to) ? options.to.length : 1,
			subject: options.subject,
		});

		return {
			success: true,
			messageId: data?.id,
		};
	} catch (error) {
		logger.error("Exception while sending email via Resend", {
			recipientCount: Array.isArray(options.to) ? options.to.length : 1,
			subject: options.subject,
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});

		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Une erreur inconnue s'est produite",
		};
	}
};

/**
 * Envoie un email à plusieurs destinataires
 */
export const sendBulkEmail = async (
	recipients: string[],
	emailContent: Omit<SendEmailOptions, "to">,
): Promise<SendEmailResult[]> => {
	const promises = recipients.map((recipient) =>
		sendEmail({
			...emailContent,
			to: recipient,
		}),
	);

	return Promise.all(promises);
};

/**
 * Vérifie que le client Resend est bien configuré
 */
export const verifyEmailConnection = async (): Promise<boolean> => {
	try {
		const resend = getResendClient();
		// Resend n'a pas de méthode verify(), on vérifie juste que l'instance existe
		if (resend) {
			logger.info("Resend client initialized successfully");
			return true;
		}
		return false;
	} catch (error) {
		logger.error("Failed to initialize Resend client", {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined,
		});
		return false;
	}
};
